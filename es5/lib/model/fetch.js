"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = fetch;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _flowsync = require("flowsync");

var _flowsync2 = _interopRequireDefault(_flowsync);

var _jargon = require("jargon");

var _jargon2 = _interopRequireDefault(_jargon);

var _modelFinderJs = require("../modelFinder.js");

var _modelFinderJs2 = _interopRequireDefault(_modelFinderJs);

var _symbols = require("./symbols");

var _symbols2 = _interopRequireDefault(_symbols);

//internal private functions
var fetchByAssociations = {
  "hasMany": fetchByHasMany,
  "hasOne": fetchByHasOne,
  "belongsTo": fetchByBelongsTo
};

function fetchByHasOne(associationName, associations, callback) {
  var _this = this;

  var modelFinder = new _modelFinderJs2["default"](this.constructor.database);
  var association = associations[associationName];
  var ModelClass = association.constructor;

  if (association.through) {
    var throughAssociation = associations[association.through];

    if (!this[this.primaryKey]) {
      throw new Error("'" + this.primaryKey + "' is not set on " + this.constructor.name);
    }

    modelFinder.find(throughAssociation.constructor).where(association.foreignId, "=", this[this.primaryKey]).limit(1).results(function (errors, models) {
      var joinModel = models[0];
      var destinationAssociation = joinModel.associations[associationName];

      var tempModel = new association.constructor();
      modelFinder.find(association.constructor).where(tempModel.primaryKey, "=", joinModel[destinationAssociation.foreignId]).limit(1).results(function (associationError, associationModels) {
        var associationModel = associationModels[0];
        _this[associationName] = associationModel;
        callback();
      });
    });
  } else {
    (function () {
      var query = modelFinder.find(ModelClass).where(association.foreignKey, "=", _this[_this.primaryKey]);

      var processWhereCondition = function processWhereCondition(value) {
        if (typeof value === "string") {
          var snakeCasedValue = (0, _jargon2["default"])(value).snake.toString();
          return snakeCasedValue;
        } else {
          return value;
        }
      };

      var processedWhere = association.where.map(processWhereCondition);

      query.andWhere(function () {
        var _this2 = this;

        this.where.apply(this, _toConsumableArray(processedWhere));

        if (Array.isArray(association.andWhere)) {
          association.andWhere.forEach(function (andWhereItem) {
            var processedAndWhereItem = andWhereItem.map(processWhereCondition);
            _this2.andWhere.apply(_this2, _toConsumableArray(processedAndWhereItem));
          });
        }
      });

      query.limit(1).results(function (errors, models) {
        var model = models[0];
        _this[associationName] = model;
        callback();
      });
    })();
  }
}

function fetchByHasMany(associationName, associations, callback) {
  var _this3 = this;

  var modelFinder = new _modelFinderJs2["default"](this.constructor.database);
  var association = associations[associationName];

  if (association.through) {
    (function () {
      var throughAssociation = associations[association.through];

      modelFinder.find(throughAssociation.constructor).where(association.foreignId, _this3[_this3.primaryKey]).results(function (errors, models) {
        if (models.length > 0) {
          (function () {
            var foreignAssociationName = association.as || associationName;

            if (!models[0].associations[foreignAssociationName]) {
              throw new Error("'" + foreignAssociationName + "' is not a valid association on through model '" + throughAssociation.constructor.name + "'");
            }

            var destinationAssociation = models[0].associations[foreignAssociationName];

            var modelIds = [];

            var tempModel = new association.constructor();

            switch (destinationAssociation.type) {
              case "hasOne":
                modelIds = models.map(function (model) {
                  return model[throughAssociation.foreignId];
                });

                modelFinder.find(association.constructor).where(tempModel.primaryKey, "in", modelIds).results(function (findErrors, resultModels) {
                  resultModels.forEach(function (model) {
                    _this3[associationName].push(model);
                  });
                  callback();
                });

                break;

              case "hasMany":
                modelIds = models.map(function (model) {
                  return model[model.primaryKey];
                });

                modelFinder.find(association.constructor).where(destinationAssociation.foreignId, "in", modelIds).results(function (findErrors, resultModels) {
                  resultModels.forEach(function (model) {
                    _this3[associationName].push(model);
                  });
                  callback();
                });
                break;
              case "belongsTo":
                modelIds = models.map(function (model) {
                  return model[destinationAssociation.foreignId];
                });

                modelFinder.find(association.constructor).where(tempModel.primaryKey, "in", modelIds).results(function (findErrors, resultModels) {
                  resultModels.forEach(function (model) {
                    _this3[associationName].push(model);
                  });
                  callback();
                });

                break;
            }
          })();
        }
      });
    })();
  } else {
    this[associationName].fetch(callback);
  }
}

function fetchByBelongsTo(associationName, associations, callback) {
  var _this4 = this;

  var modelFinder = new _modelFinderJs2["default"](this.constructor.database);
  var association = associations[associationName];

  if (!this[association.foreignId]) {
    throw new Error("Cannot fetch '" + associationName + "' because '" + association.foreignId + "' is not set on " + this.constructor.name);
  }

  modelFinder.find(association.constructor).where(this.primaryKey, "=", this[association.foreignId]).limit(1).results(function (errors, models) {
    var model = models[0];
    _this4[associationName] = model;
    model[association.foreignName] = _this4;
    callback();
  });
}

function fetchBy() {
  var _this5 = this;

  var fields = arguments[0] === undefined ? [this.primaryKey] : arguments[0];
  var callback = arguments[1] === undefined ? undefined : arguments[1];

  if (!this.constructor.database) {
    throw new Error("Cannot fetch without Model.database set.");
  }

  var chain = this.constructor.database.select("*").from(this.tableName);
  fields.forEach(function (field, index) {
    if (!_this5[field]) {
      throw new Error("Cannot fetch this model by the '" + field + "' field because it is not set.");
    }

    if (index === 0) {
      chain = chain.where(field, "=", _this5[field]);
    } else {
      chain = chain.andWhere(field, "=", _this5[field]);
    }
  }, this);

  if (this._softDelete) {
    chain = chain.whereNull((0, _jargon2["default"])("deletedAt").snake.toString());
  }

  chain.limit(1).results(function (error, records) {
    if (records.length === 0) {
      callback(new Error("There is no " + _this5.constructor.name + " for the given (" + fields.join(", ") + ")."));
    } else {
      _this5[_symbols2["default"].parseAttributesFromFields](records[0]);

      if (_this5._includeAssociations.length > 0) {
        (function () {
          var associations = _this5.associations;

          /* We'll be putting all of our Async tasks into this */
          var fetchTasks = [];

          _this5._includeAssociations.forEach(function (associationName) {

            var association = associations[associationName];

            if (!association) {
              throw new Error("Cannot fetch '" + associationName + "' because it is not a valid association on " + _this5.constructor.name);
            }

            fetchTasks.push(function (finished) {
              //call the fetch function for the correct association type
              fetchByAssociations[association.type].call(_this5, associationName, associations, finished);
            });
          });

          _flowsync2["default"].parallel(fetchTasks, function () {
            if (callback) {
              callback(error, _this5);
            }
          });
        })();
      } else {
        if (callback) {
          callback(error, _this5);
        }
      }
    }
  });
}

//public function

function fetch() {
  for (var _len = arguments.length, options = Array(_len), _key = 0; _key < _len; _key++) {
    options[_key] = arguments[_key];
  }

  switch (options.length) {
    case 0:
      fetchBy.call(this);
      break;
    case 1:
      if (typeof options[0] === "function") {
        fetchBy.call(this, [this.primaryKey], options[0]);
      } else if (Array.isArray(options[0])) {
        fetchBy.call(this, options[0]);
      } else {
        fetchBy.call(this, [options[0]]);
      }
      break;
    case 2:
      if (Array.isArray(options[0])) {
        fetchBy.call(this, options[0], options[1]);
      } else {
        fetchBy.call(this, [options[0]], options[1]);
      }
      break;
  }
}

module.exports = exports["default"];