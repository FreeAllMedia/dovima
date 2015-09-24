import flowsync from "flowsync";
import MultiError from "blunder";
import Datetime from "fleming";
import privateData from "incognito";
import symbols from "./symbols";

//private methods
function propagate(callback) {
  //disabling this rule because break is not necessary when return is present
  /* eslint-disable no-fallthrough */
  this[symbols.callDeep]("save", (associationDetails) => {
    switch(associationDetails.type) {
      case "hasOne":
        return true;
      case "hasMany":
        if(associationDetails.through === undefined) {
          return true;
        } else {
          return false;
        }
      case "belongsTo":
        return false;
    }
  }, callback);
}

function saveOrUpdate(callback) {
  let now = new Datetime();

  const _ = privateData(this);

  if (_.mockNewId) {

    if (this[this.primaryKey] !== undefined) {
      this.updatedAt = now.toDate();
    } else {
      this[this.primaryKey] = _.mockNewId;
      this.createdAt = now.toDate();
    }
    callback();
  } else {
    if (!this[symbols.getDatabase]()) {
      callback(new Error("Cannot save without Model.database set."));
    } else {
      if (this.isNew) {
        this.createdAt = now.toDate();
        let fieldAttributes = this[symbols.getFieldAttributes]();

        this[symbols.getDatabase]()
          .insert(fieldAttributes)
          .into(this.tableName)
          .results((error, ids) => {
            if(error) {
              callback(error);
            } else {
              this[this.primaryKey] = ids[0];
              callback();
            }
          });
      } else {
        this.updatedAt = now.toDate();
        let attributes = this[symbols.getFieldAttributes]();
        let updateAttributes = {};

        for (let attributeName in attributes) {
          if (attributeName !== this.primaryKey) {
            updateAttributes[attributeName] = attributes[attributeName];
          }
        }

        this[symbols.getDatabase]()
          .update(updateAttributes)
          .into(this.tableName)
          .where(this.primaryKey, "=", this[this.primaryKey])
          .results(callback);
      }
    }
  }
}

function validate(callback) {
  this.isValid((valid) => {
    if(valid) {
      callback();
    } else {
      this.invalidAttributes((invalidAttributeList) => {
        const hasInvalidAttributes = Object.keys(invalidAttributeList).length > 0;

        if (hasInvalidAttributes) {
          const errorPrefix = this.constructor.name + " is invalid";
          const multiError = new MultiError([], errorPrefix);
          for(let invalidAttributeName in invalidAttributeList) {
            const invalidAttributeMessages = invalidAttributeList[invalidAttributeName];

            for(let index in invalidAttributeMessages) {
              const invalidAttributeMessage = invalidAttributeMessages[index];
              const error = new Error(`${invalidAttributeName} ${invalidAttributeMessage}`);
              multiError.push(error);
            }
          }
          callback(multiError);
        } else {
          callback();
        }
      });
    }
  });
}

//public save method
export default function save(callback) {
  flowsync.series([
    (next) => {
      this.beforeValidation(next);
    },
    (next) => {
      validate.call(this, next);
    },
    (next) => {
      this.beforeSave(next);
    },
    (next) => {
      saveOrUpdate.call(this, next);
    },
    (next) => {
      propagate.call(this, next);
    },
    (next) => {
      this.afterSave(next);
    }
  ],
  (errors) => {
    if(errors) {
      callback(errors);
    } else {
      callback(undefined, this[this.primaryKey]);
    }
  });
}
