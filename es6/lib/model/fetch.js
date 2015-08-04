import flowsync from "flowsync";
import inflect from "jargon";

import ModelFinder from "../modelFinder.js";
import symbols from "./symbols";

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

function fetchBy(fields = [this.primaryKey], callback) {
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
          const modelFinder = new ModelFinder(this.constructor.database);

          const associations = this.associations;

          /* We'll be putting all of our Async tasks into this */
          const fetchTasks = [];

          this._includeAssociations.forEach((associationName) => {

            const association = associations[associationName];

            if (!association) {
              throw new Error(`Cannot fetch '${associationName}' because it is not a valid association on ${this.constructor.name}`);
            }

            switch(association.type) {
              case "hasOne":
                fetchTasks.push(finished => {

                  // user hasMany address


                  const ModelClass = association.constructor;

                  if (association.through) {
                    const throughAssociation = associations[association.through];

                    //throw throughAssociation.foreignId;
                    //select * from Addresses where user_id = this[this.primaryKey]
                      //select * from PostalCodes where address_id = address.id
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

                        //throw destinationAssociation.foreignId;

                        //throw joinModel;//throw model.associations;
                        //addressId

                        const tempModel = new association.constructor();
                        modelFinder
                          .find(association.constructor)
                          .where(tempModel.primaryKey, "=", joinModel[destinationAssociation.foreignId])
                          .limit(1)
                          .results((associationError, associationModels) => {
                            const associationModel = associationModels[0];
                            this[associationName] = associationModel;
                            finished();
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
                        finished();
                      });
                  }
                });
                break;

              case "hasMany":

                  if (association.through) {
                    fetchTasks.push(finished => {

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
                                //throw {through: throughAssociation, destination: destinationAssociation};

                                modelIds = models.map(model => { return model[throughAssociation.foreignId]; });

                                modelFinder
                                  .find(association.constructor)
                                  .where(tempModel.primaryKey, "in", modelIds)
                                  .results((findErrors, resultModels) => {
                                    resultModels.forEach((model) => {
                                      this[associationName].push(model);
                                    });
                                    finished();
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
                                    finished();
                                  });
                                break;
                              case "belongsTo":
                                //throw {through: throughAssociation, destination: destinationAssociation};

                                //throw destinationAssociation.name;

                                //throw associationName;

                                //const localId = inflect(destinationAssociation.name).foreignKey.camel.toString();

                                modelIds = models.map(model => { return model[destinationAssociation.foreignId]; });

                                modelFinder
                                  .find(association.constructor)
                                  .where(tempModel.primaryKey, "in", modelIds)
                                  .results((findErrors, resultModels) => {
                                    resultModels.forEach((model) => {
                                      this[associationName].push(model);
                                    });
                                    finished();
                                  });

                                break;
                            }

                            //throw {association: association.foreignName, destinationAssociation: destinationAssociation.foreignName, throughAssociation: throughAssociation.foreignName};
                            //throw {association: association.foreignId, destinationAssociation: destinationAssociation.foreignId, throughAssociation: throughAssociation.foreignId};
                            //throw models;


                          }
                        });

                      // if (!this[throughAssociation.foreignId]) {
                      // 	throw new Error(`'${throughAssociation.foreignId}' is not set on ${this.constructor.name}`);
                      // }

                      // modelFinder
                      // 	.find(throughAssociation.constructor)
                      // 	.where(this.primaryKey, "=", this[throughAssociation.foreignId])
                      // 	.limit(1)
                      // 	.results((errors, models) => {
                      // 		const joinModel = models[0];
                      // 		const destinationAssociation = joinModel.associations[associationName];

                      // 		//throw joinModel;//throw model.associations;

                      // 		modelFinder
                      // 			.find(association.constructor)
                      // 			.where(this.primaryKey, "=", joinModel[destinationAssociation.foreignId])
                      // 			.results((associationError, associationModels) => {
                      // 				const associationModel = associationModels[0];
                      // 				this[associationName] = associationModel;
                      // 			});

                      // 		this[associationName] = joinModel;
                      // 		finished();
                      // 	});
                    });
                  } else {
                    fetchTasks.push(finished => {
                      this[associationName].fetch(finished);
                    });
                  }
                break;

              case "belongsTo":
                if (!this[association.foreignId]) {
                  throw new Error(`Cannot fetch '${associationName}' because '${association.foreignId}' is not set on ${this.constructor.name}`);
                }

                fetchTasks.push(finished => {
                  modelFinder
                    .find(association.constructor)
                    .where(this.primaryKey, "=", this[association.foreignId])
                    .limit(1)
                    .results((errors, models) => {
                      const model = models[0];
                      this[associationName] = model;
                      model[association.foreignName] = this;
                      finished();
                    });
                });

            }
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
