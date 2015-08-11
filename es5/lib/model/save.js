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

//private methods
function propagate(callback) {
  //disabling this rule because break is not necessary when return is present
  /* eslint-disable no-fallthrough */
  this[_symbols2["default"].callDeep]("save", function (associationDetails) {
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
  }, callback);
}

function saveOrUpdate(callback) {
  var _this = this;

  var now = new _fleming2["default"]();
  if (this.isNew) {
    this.createdAt = now.toDate();
    var fieldAttributes = this[_symbols2["default"].getFieldAttributes]();

    this.constructor.database.insert(fieldAttributes).into(this.tableName).results(function (error, ids) {
      if (error) {
        callback(error);
      } else {
        _this[_this.primaryKey] = ids[0];
        callback();
      }
    });
  } else {
    this.updatedAt = now.toDate();
    var attributes = this[_symbols2["default"].getFieldAttributes]();
    var updateAttributes = {};

    for (var attributeName in attributes) {
      if (attributeName !== this.primaryKey) {
        updateAttributes[attributeName] = attributes[attributeName];
      }
    }

    this.constructor.database.update(updateAttributes).into(this.tableName).where(this.primaryKey, "=", this[this.primaryKey]).results(callback);
  }
}

function validate(callback) {
  var _this2 = this;

  this.isValid(function (valid) {
    if (valid) {
      callback();
    } else {
      _this2.invalidAttributes(function (invalidAttributeList) {
        var hasInvalidAttributes = Object.keys(invalidAttributeList).length > 0;

        if (hasInvalidAttributes) {
          var errorPrefix = _this2.constructor.name + " is invalid";
          var multiError = new _blunder2["default"]([], errorPrefix);
          for (var invalidAttributeName in invalidAttributeList) {
            var invalidAttributeMessages = invalidAttributeList[invalidAttributeName];

            for (var index in invalidAttributeMessages) {
              var invalidAttributeMessage = invalidAttributeMessages[index];
              var error = new Error(invalidAttributeName + " " + invalidAttributeMessage);
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

function save(callback) {
  var _this3 = this;

  if (!this.constructor.database) {
    throw new Error("Cannot save without Model.database set.");
  }

  _flowsync2["default"].series([function (next) {
    _this3.beforeValidation(next);
  }, function (next) {
    validate.call(_this3, next);
  }, function (next) {
    _this3.beforeSave(next);
  }, function (next) {
    saveOrUpdate.call(_this3, next);
  }, function (next) {
    propagate.call(_this3, next);
  }, function (next) {
    _this3.afterSave(next);
  }], function (errors) {
    if (errors) {
      callback(errors);
    } else {
      callback(undefined, _this3);
    }
  });
}

module.exports = exports["default"];