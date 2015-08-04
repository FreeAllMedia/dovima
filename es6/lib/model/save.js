import flowsync from "flowsync";
import MultiError from "blunder";
import Datetime from "fleming";
import symbols from "./symbols";

export default function save(callback) {
  if (!this.constructor.database) { throw new Error("Cannot save without Model.database set."); }

  flowsync.series([
    (next) => {
      this.beforeValidation(next);
    },
    (next) => {
      this.isValid((valid) => {
        if(valid) {
          next();
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
              next(multiError);
            } else {
              next();
            }
          });
        }
      });
    },
    (next) => {
      this.beforeSave(next);
    },
    (next) => {
      if (this.isNew) {
        let now = new Datetime();
        this.createdAt = now.toDate();
        let fieldAttributes = this[symbols.getFieldAttributes]();

        this.constructor.database
          .insert(fieldAttributes)
          .into(this.tableName)
          .results((error, ids) => {
            if(error) {
              next(error);
            } else {
              this[this.primaryKey] = ids[0];
              next();
            }
          });
      } else {
        let now = new Datetime();
        this.updatedAt = now.toDate();
        let attributes = this[symbols.getFieldAttributes]();
        let updateAttributes = {};

        for (let attributeName in attributes) {
          if (attributeName !== this.primaryKey) {
            updateAttributes[attributeName] = attributes[attributeName];
          }
        }

        this.constructor.database
          .update(updateAttributes)
          .into(this.tableName)
          .where(this.primaryKey, "=", this[this.primaryKey])
          .results(next);
      }
    },
    (next) => {
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
      }, next);
    },
    (next) => {
      this.afterSave(next);
    }
  ],
  (errors) => {
    if(errors) {
      callback(errors);
    } else {
      callback(undefined, this);
    }
  });
}
