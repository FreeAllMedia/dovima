import flowsync from "flowsync";
import inflect from "jargon";

import ModelFinder from "../modelFinder.js";
import symbols from "./symbols";

//internal private functions
const fetchByAssociations = {
  "hasMany": fetchByHasMany,
  "hasOne": fetchByHasOne,
  "belongsTo": fetchByBelongsTo
};

function fetchByHasOne(associationName, associations, callback) {
  const modelFinder = new ModelFinder(this.constructor.database);
  const association = associations[associationName];
  const ModelClass = association.constructor;

  if (association.through) {
    const throughAssociation = associations[association.through];

    if (!this[this.primaryKey]) {
      throw new Error(`'${this.primaryKey}' is not set on ${this.constructor.name}`);
    }

    modelFinder
      .find(throughAssociation.constructor)
      .where(association.foreignId, "=", this[this.primaryKey])
      .limit(1)
      .results((errors, models) => {
        const joinModel = models[0];
        const destinationAssociation = joinModel.associations[associationName];

        const tempModel = new association.constructor();
        modelFinder
          .find(association.constructor)
          .where(tempModel.primaryKey, "=", joinModel[destinationAssociation.foreignId])
          .limit(1)
          .results((associationError, associationModels) => {
            const associationModel = associationModels[0];
            this[associationName] = associationModel;
            callback();
          });
      });
  } else {
    const query = modelFinder
      .find(ModelClass)
      .where(association.foreignKey, "=", this[this.primaryKey]);

    const processWhereCondition = (value) => {
      if (typeof value === "string") {
        const snakeCasedValue = inflect(value).snake.toString();
        return snakeCasedValue;
      } else {
        return value;
      }
    };

    const processedWhere = association.where.map(processWhereCondition);

    query.andWhere(function () {
      this.where(...processedWhere);

      if(Array.isArray(association.andWhere)) {
        association.andWhere.forEach((andWhereItem) => {
          const processedAndWhereItem = andWhereItem.map(processWhereCondition);
          this.andWhere(...processedAndWhereItem);
        });
      }
    });

    query
      .limit(1)
      .results((errors, models) => {
        const model = models[0];
        this[associationName] = model;
        callback();
      });
  }
}

function fetchByHasMany(associationName, associations, callback) {
  const modelFinder = new ModelFinder(this.constructor.database);
  const association = associations[associationName];

  if (association.through) {
    const throughAssociation = associations[association.through];

    modelFinder
      .find(throughAssociation.constructor)
      .where(association.foreignId, this[this.primaryKey])
      .results((errors, models) => {
        if(models.length > 0) {
          const foreignAssociationName = association.as || associationName;

          if (!models[0].associations[foreignAssociationName]) {
            throw new Error(`'${foreignAssociationName}' is not a valid association on through model '${throughAssociation.constructor.name}'`);
          }

          const destinationAssociation = models[0].associations[foreignAssociationName];

          let modelIds = [];

          const tempModel = new association.constructor();

          switch(destinationAssociation.type) {
            case "hasOne":
              modelIds = models.map(model => { return model[throughAssociation.foreignId]; });

              modelFinder
                .find(association.constructor)
                .where(tempModel.primaryKey, "in", modelIds)
                .results((findErrors, resultModels) => {
                  resultModels.forEach((model) => {
                    this[associationName].push(model);
                  });
                  callback();
                });

              break;

            case "hasMany":
              modelIds = models.map(model => { return model[model.primaryKey]; });

              modelFinder
                .find(association.constructor)
                .where(destinationAssociation.foreignId, "in", modelIds)
                .results((findErrors, resultModels) => {
                  resultModels.forEach((model) => {
                    this[associationName].push(model);
                  });
                  callback();
                });
              break;
            case "belongsTo":
              modelIds = models.map(model => { return model[destinationAssociation.foreignId]; });

              modelFinder
                .find(association.constructor)
                .where(tempModel.primaryKey, "in", modelIds)
                .results((findErrors, resultModels) => {
                  resultModels.forEach((model) => {
                    this[associationName].push(model);
                  });
                  callback();
                });

              break;
          }

        }
      });
  } else {
    this[associationName].fetch(callback);
  }
}

function fetchByBelongsTo(associationName, associations, callback) {
  const modelFinder = new ModelFinder(this.constructor.database);
  const association = associations[associationName];

  if (!this[association.foreignId]) {
    throw new Error(`Cannot fetch '${associationName}' because '${association.foreignId}' is not set on ${this.constructor.name}`);
  }

  modelFinder
    .find(association.constructor)
    .where(this.primaryKey, "=", this[association.foreignId])
    .limit(1)
    .results((errors, models) => {
      const model = models[0];
      this[associationName] = model;
      model[association.foreignName] = this;
      callback();
    });
}

function fetchBy(fields = [this.primaryKey], callback = undefined) {
  if (!this.constructor.database) { throw new Error("Cannot fetch without Model.database set."); }

  let chain = this.constructor.database
    .select("*")
    .from(this.tableName);
  fields.forEach((field, index) => {
    if (!this[field]) { throw new Error(`Cannot fetch this model by the '${field}' field because it is not set.`); }

    if(index === 0) {
      chain = chain.where(field, "=", this[field]);
    } else {
      chain = chain.andWhere(field, "=", this[field]);
    }
  }, this);

  if(this._softDelete) {
    chain = chain.whereNull(inflect("deletedAt").snake.toString());
  }

  chain
    .limit(1)
    .results((error, records) => {
      if(records.length === 0) {
        callback(new Error(`There is no ${this.constructor.name} for the given (${fields.join(", ")}).`));
      } else {
        this[symbols.parseAttributesFromFields](records[0]);

        if (this._includeAssociations.length > 0) {
          const associations = this.associations;

          /* We'll be putting all of our Async tasks into this */
          const fetchTasks = [];

          this._includeAssociations.forEach((associationName) => {

            const association = associations[associationName];

            if (!association) {
              throw new Error(`Cannot fetch '${associationName}' because it is not a valid association on ${this.constructor.name}`);
            }

            fetchTasks.push(finished => {
              //call the fetch function for the correct association type
              fetchByAssociations[association.type].call(this, associationName, associations, finished);
            });
          });

          flowsync.parallel(
            fetchTasks,
            () => {
              if (callback) {
                callback(error, this);
              }
            }
          );
        } else {
          if (callback) {
            callback(error, this);
          }
        }
      }
    });
}

//public function
export default function fetch(...options) {
  switch(options.length) {
    case 0:
      fetchBy.call(this);
      break;
    case 1:
      if(typeof options[0] === "function") {
        fetchBy.call(this, [this.primaryKey], options[0]);
      } else if(Array.isArray(options[0])) {
        fetchBy.call(this, options[0]);
      } else {
        fetchBy.call(this, [options[0]]);
      }
      break;
    case 2:
      if(Array.isArray(options[0])) {
        fetchBy.call(this, options[0], options[1]);
      } else {
        fetchBy.call(this, [options[0]], options[1]);
      }
      break;
  }
}
