"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = save;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _flowsync = require("flowsync");

var _flowsync2 = _interopRequireDefault(_flowsync);

var _blunder = require("blunder");

var _blunder2 = _interopRequireDefault(_blunder);

var _fleming = require("fleming");

var _fleming2 = _interopRequireDefault(_fleming);

var _symbols = require("./symbols");

var _symbols2 = _interopRequireDefault(_symbols);

function save(callback) {
  var _this = this;

  if (!this.constructor.database) {
    throw new Error("Cannot save without Model.database set.");
  }

  _flowsync2["default"].series([function (next) {
    _this.beforeValidation(next);
  }, function (next) {
    _this.isValid(function (valid) {
      if (valid) {
        next();
      } else {
        _this.invalidAttributes(function (invalidAttributeList) {
          var hasInvalidAttributes = Object.keys(invalidAttributeList).length > 0;

          if (hasInvalidAttributes) {
            var errorPrefix = _this.constructor.name + " is invalid";
            var multiError = new _blunder2["default"]([], errorPrefix);
            for (var invalidAttributeName in invalidAttributeList) {
              var invalidAttributeMessages = invalidAttributeList[invalidAttributeName];

              for (var index in invalidAttributeMessages) {
                var invalidAttributeMessage = invalidAttributeMessages[index];
                var error = new Error(invalidAttributeName + " " + invalidAttributeMessage);
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
  }, function (next) {
    _this.beforeSave(next);
  }, function (next) {
    if (_this.isNew) {
      var now = new _fleming2["default"]();
      _this.createdAt = now.toDate();
      var fieldAttributes = _this[_symbols2["default"].getFieldAttributes]();

      _this.constructor.database.insert(fieldAttributes).into(_this.tableName).results(function (error, ids) {
        if (error) {
          next(error);
        } else {
          _this[_this.primaryKey] = ids[0];
          next();
        }
      });
    } else {
      var now = new _fleming2["default"]();
      _this.updatedAt = now.toDate();
      var attributes = _this[_symbols2["default"].getFieldAttributes]();
      var updateAttributes = {};

      for (var attributeName in attributes) {
        if (attributeName !== _this.primaryKey) {
          updateAttributes[attributeName] = attributes[attributeName];
        }
      }

      _this.constructor.database.update(updateAttributes).into(_this.tableName).where(_this.primaryKey, "=", _this[_this.primaryKey]).results(next);
    }
  }, function (next) {
    //disabling this rule because break is not necessary when return is present
    /* eslint-disable no-fallthrough */
    _this[_symbols2["default"].callDeep]("save", function (associationDetails) {
      switch (associationDetails.type) {
        case "hasOne":
          return true;
        case "hasMany":
          if (associationDetails.through === undefined) {
            return true;
          } else {
            return false;
          }
        case "belongsTo":
          return false;
      }
    }, next);
  }, function (next) {
    _this.afterSave(next);
  }], function (errors) {
    if (errors) {
      callback(errors);
    } else {
      callback(undefined, _this);
    }
  });
}

module.exports = exports["default"];