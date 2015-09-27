import privateData from "incognito";

/**
 * Delete the model according to the prescribed strategy.
 *
 * Named "deleteSelf" because "delete" is a reserved keyword in JS.
 *
 * @method deleteSelf
 * @param  {Function} callback
 */
export default function destroy(callback) {
  const _ = privateData(this);
  if (_.mockDelete) {
    callback();
  } else {
    this.database
        .delete
        .from(this.tableName)
        .results((error) => {
          callback(error);
        });
  }
}
