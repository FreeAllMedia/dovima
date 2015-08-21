"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = deleteSelf;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _flowsync = require("flowsync");

var _flowsync2 = _interopRequireDefault(_flowsync);

var _fleming = require("fleming");

var _fleming2 = _interopRequireDefault(_fleming);

var _incognito = require("incognito");

var _incognito2 = _interopRequireDefault(_incognito);

var _symbols = require("./symbols");

var _symbols2 = _interopRequireDefault(_symbols);

var _jargon = require("jargon");

var _jargon2 = _interopRequireDefault(_jargon);

/**
 * Delete the model according to the prescribed strategy.
 *
 * @method deleteSelf
 * @param  {Function} callback
 */

function deleteSelf(callback) {
  var _this = this;

  if (!this.constructor.database) {
    throw new Error("Cannot delete without Model.database set.");
  }

  _flowsync2["default"].series([function (done) {
    _this.beforeDelete(done);
  }, function (done) {
    performDelete.call(_this, done);
  }], function (error) {
    console.log("ERROR", typeof error);
    if (error) {
      throw error;
    }
    callback();
  });
}

function performDelete(callback) {
  if ((0, _incognito2["default"])(this)._softDelete) {
    softDelete.call(this, callback);
  } else {
    hardDelete.call(this, callback);
  }
}

/**
 * Sets a column on the model to "deleted" instead of removing the row from the database.
 *
 * @method softDelete
 * @param  {Function} callback
 */
function softDelete(callback) {
  var _this2 = this;

  if (this[this.primaryKey]) {
    _flowsync2["default"].series([function (next) {
      _this2[_symbols2["default"].callDeep]("delete", function (associationDetails) {
        return associationDetails.type !== "belongsTo" && associationDetails.dependent === true;
      }, next);
    }, function (next) {
      var now = new _fleming2["default"]();
      var attributesToUpdate = {};
      attributesToUpdate[(0, _jargon2["default"])("deletedAt").snake.toString()] = now.toDate();
      _this2.constructor.database.update(attributesToUpdate).into(_this2.tableName).where(_this2.primaryKey, "=", _this2[_this2.primaryKey]).results(function (error, results) {
        if (error) {
          next(error);
        } else if (results === 0) {
          next(new Error(_this2.constructor.name + " with " + _this2.primaryKey + " " + _this2[_this2.primaryKey] + " cannot be soft deleted because it doesn't exists."));
        } else {
          next();
        }
      });
    }], function (errors, results) {
      callback(errors, results);
    });
  } else {
    var error = new Error("Cannot delete the " + this.constructor.name + " because the primary key is not set.");
    callback(error);
  }
}

function hardDelete(callback) {
  throw new Error("Not implemented.");
}
module.exports = exports["default"];