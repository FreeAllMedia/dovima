"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = destroy;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _incognito = require("incognito");

var _incognito2 = _interopRequireDefault(_incognito);

/**
 * Delete the model according to the prescribed strategy.
 *
 * Named "deleteSelf" because "delete" is a reserved keyword in JS.
 *
 * @method deleteSelf
 * @param  {Function} callback
 */

function destroy(callback) {
  var _ = (0, _incognito2["default"])(this);
  if (_.mockDelete) {
    callback();
  } else {
    // this.database
    //     .delete
    //     .from(this.tableName)
    //     .results((error) => {
    //       callback(error);
    //     });
  }
}

module.exports = exports["default"];