import flowsync from "flowsync";
import Datetime from "fleming";
import privateData from "incognito";
import symbols from "./symbols";
import inflect from "jargon";

/**
 * Delete the model according to the prescribed strategy.
 *
 * Named "deleteSelf" because "delete" is a reserved keyword in JS.
 *
 * @method deleteSelf
 * @param  {Function} callback
 */
export default function deleteSelf(callback) {
  flowsync.series([
    (done) => {
      this.beforeDelete(done);
    },
    (done) => {
      if (this.constructor.useSoftDelete !== undefined) {
        this.softDestroy(done);
      } else {
        this.destroy(done);
      }
    },
    (done) => {
      this.afterDelete(done);
    }
  ], (errors) => {
    callback(errors);
  });
}

function performDelete(callback) {
  const _ = privateData(this);
  if (_.mockDelete) {
    if(_.softDelete) {
      this.deletedAt = new Datetime();
      callback();
    } else {
      callback();
    }
  } else {
    if (this[symbols.getDatabase]()) {
      if(_.softDelete) {
        softDelete.call(this, callback);
      } else {
        hardDelete.call(this, callback);
      }
    } else {
      callback(new Error("Cannot delete without Model.database set."));
    }
  }
}

/**
 * Sets a column on the model to "deleted" instead of removing the row from the database.
 *
 * @method softDelete
 * @param  {Function} callback
 */
function softDelete(callback) {
  if(this[this.primaryKey]) {
    flowsync.series([
      (next) => {
        this[symbols.callDeep]("delete", (associationDetails) => {
          return (associationDetails.type !== "belongsTo"
            && associationDetails.dependent === true);
        }, next);
      },
      (next) => {
        let now = new Datetime();
        let attributesToUpdate = {};
        attributesToUpdate[inflect("deletedAt").snake.toString()] = now.toDate();
        this[symbols.getDatabase]()
          .update(attributesToUpdate)
          .into(this.tableName)
          .where(this.primaryKey, "=", this[this.primaryKey])
          .results((error, results) => {
            if(error) {
              next(error);
            } else if (results === 0) {
              next(new Error(`${this.constructor.name} with ${this.primaryKey} ${this[this.primaryKey]} cannot be soft deleted because it doesn't exists.`));
            } else {
              next();
            }
          });
      }
    ], (errors, results) => {
      callback(errors, results);
    });
  } else {
    callback(new Error(`Cannot delete the ${this.constructor.name} because the primary key is not set.`));
  }
}

function hardDelete(callback) {
  callback(new Error("Not implemented."));
}
