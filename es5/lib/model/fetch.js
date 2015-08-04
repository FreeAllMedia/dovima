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

function fetchBy(fields, callback) {
  var _this = this;

  if (fields === undefined) fields = [this.primaryKey];

  if (!this.constructor.database) {
    throw new Error("Cannot fetch without Model.database set.");
  }

  var chain = this.constructor.database.select("*").from(this.tableName);
  fields.forEach(function (field, index) {
    if (!_this[field]) {
      throw new Error("Cannot fetch this model by the '" + field + "' field because it is not set.");
    }

    if (index === 0) {
      chain = chain.where(field, "=", _this[field]);
    } else {
      chain = chain.andWhere(field, "=", _this[field]);
    }
  }, this);

  if (this._softDelete) {
    chain = chain.whereNull((0, _jargon2["default"])("deletedAt").snake.toString());
  }

  chain.limit(1).results(function (error, records) {
    if (records.length === 0) {
      callback(new Error("There is no " + _this.constructor.name + " for the given (" + fields.join(", ") + ")."));
    } else {
      _this[_symbols2["default"].parseAttributesFromFields](records[0]);

      if (_this._includeAssociations.length > 0) {
        (function () {
          var modelFinder = new _modelFinderJs2["default"](_this.constructor.database);

          var associations = _this.associations;

          /* We'll be putting all of our Async tasks into this */
          var fetchTasks = [];

          _this._includeAssociations.forEach(function (associationName) {

            var association = associations[associationName];

            if (!association) {
              throw new Error("Cannot fetch '" + associationName + "' because it is not a valid association on " + _this.constructor.name);
            }

            switch (association.type) {
              case "hasOne":
                fetchTasks.push(function (finished) {

                  // user hasMany address

                  var ModelClass = association.constructor;

                  if (association.through) {
                    var throughAssociation = associations[association.through];

                    //throw throughAssociation.foreignId;
                    //select * from Addresses where user_id = this[this.primaryKey]
                    //select * from PostalCodes where address_id = address.id
                    if (!_this[_this.primaryKey]) {
                      throw new Error("'" + _this.primaryKey + "' is not set on " + _this.constructor.name);
                    }

                    modelFinder.find(throughAssociation.constructor).where(association.foreignId, "=", _this[_this.primaryKey]).limit(1).results(function (errors, models) {
                      var joinModel = models[0];
                      var destinationAssociation = joinModel.associations[associationName];

                      //throw destinationAssociation.foreignId;

                      //throw joinModel;//throw model.associations;
                      //addressId

                      var tempModel = new association.constructor();
                      modelFinder.find(association.constructor).where(tempModel.primaryKey, "=", joinModel[destinationAssociation.foreignId]).limit(1).results(function (associationError, associationModels) {
                        var associationModel = associationModels[0];
                        _this[associationName] = associationModel;
                        finished();
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
                        finished();
                      });
                    })();
                  }
                });
                break;

              case "hasMany":

                if (association.through) {
                  fetchTasks.push(function (finished) {

                    var throughAssociation = associations[association.through];

                    modelFinder.find(throughAssociation.constructor).where(association.foreignId, _this[_this.primaryKey]).results(function (errors, models) {
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
                              //throw {through: throughAssociation, destination: destinationAssociation};

                              modelIds = models.map(function (model) {
                                return model[throughAssociation.foreignId];
                              });

                              modelFinder.find(association.constructor).where(tempModel.primaryKey, "in", modelIds).results(function (findErrors, resultModels) {
                                resultModels.forEach(function (model) {
                                  _this[associationName].push(model);
                                });
                                finished();
                              });

                              break;

                            case "hasMany":
                              modelIds = models.map(function (model) {
                                return model[model.primaryKey];
                              });

                              modelFinder.find(association.constructor).where(destinationAssociation.foreignId, "in", modelIds).results(function (findErrors, resultModels) {
                                resultModels.forEach(function (model) {
                                  _this[associationName].push(model);
                                });
                                finished();
                              });
                              break;
                            case "belongsTo":
                              //throw {through: throughAssociation, destination: destinationAssociation};

                              //throw destinationAssociation.name;

                              //throw associationName;

                              //const localId = inflect(destinationAssociation.name).foreignKey.camel.toString();

                              modelIds = models.map(function (model) {
                                return model[destinationAssociation.foreignId];
                              });

                              modelFinder.find(association.constructor).where(tempModel.primaryKey, "in", modelIds).results(function (findErrors, resultModels) {
                                resultModels.forEach(function (model) {
                                  _this[associationName].push(model);
                                });
                                finished();
                              });

                              break;
                          }

                          //throw {association: association.foreignName, destinationAssociation: destinationAssociation.foreignName, throughAssociation: throughAssociation.foreignName};
                          //throw {association: association.foreignId, destinationAssociation: destinationAssociation.foreignId, throughAssociation: throughAssociation.foreignId};
                          //throw models;
                        })();
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
                  fetchTasks.push(function (finished) {
                    _this[associationName].fetch(finished);
                  });
                }
                break;

              case "belongsTo":
                if (!_this[association.foreignId]) {
                  throw new Error("Cannot fetch '" + associationName + "' because '" + association.foreignId + "' is not set on " + _this.constructor.name);
                }

                fetchTasks.push(function (finished) {
                  modelFinder.find(association.constructor).where(_this.primaryKey, "=", _this[association.foreignId]).limit(1).results(function (errors, models) {
                    var model = models[0];
                    _this[associationName] = model;
                    model[association.foreignName] = _this;
                    finished();
                  });
                });

            }
          });

          _flowsync2["default"].parallel(fetchTasks, function () {
            if (callback) {
              callback(error, _this);
            }
          });
        })();
      } else {
        if (callback) {
          callback(error, _this);
        }
      }
    }
  });
}
module.exports = exports["default"];