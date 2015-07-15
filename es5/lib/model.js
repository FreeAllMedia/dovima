"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* Component Dependencies */
//

var _blunder = require("blunder");

var _blunder2 = _interopRequireDefault(_blunder);

var _fleming = require("fleming");

var _fleming2 = _interopRequireDefault(_fleming);

var _jargon = require("jargon");

var _jargon2 = _interopRequireDefault(_jargon);

var _quirk = require("quirk");

var _quirk2 = _interopRequireDefault(_quirk);

var _modelFinderJs = require("./modelFinder.js");

var _collectionJs = require("./collection.js");

var _collectionJs2 = _interopRequireDefault(_collectionJs);

var _modelFinderJs2 = _interopRequireDefault(_modelFinderJs);

var flowsync = require("flowsync");

/* Private Method Symbols */
var callDeep = Symbol(),
    addAssociation = Symbol(),
    getFieldAttributes = Symbol(),
    parseAttributesFromFields = Symbol(),
    setAttributes = Symbol(),
    attributes = Symbol(),
    associations = Symbol(),
    properties = Symbol(),
    validations = Symbol(),
    isNew = Symbol(),
    fetchBy = Symbol();

/**
 * @class Model
 */

var Model = (function () {
	/**
  * @param {Object.<String,*>} [initialAttributes] Provide default values for attributes by passing a Key-Value Object.
  * @constructor
  */

	function Model(initialAttributes) {
		var _this = this;

		_classCallCheck(this, Model);

		["_validations", "_associations"].forEach(function (privatePropertyName) {
			Object.defineProperty(_this, privatePropertyName, {
				writable: true,
				enumerable: false,
				value: {}
			});
		});
		/**
   * Define dynamic properties
   */
		Object.defineProperties(this, {
			"_includeAssociations": {
				enumerable: false,
				writable: true,
				value: []
			},

			"additionalAttributes": {
				enumerable: false, //this fix db related issues
				get: function get() {
					return _this.constructor.attributes;
				}
			},

			"isNew": {
				get: this[isNew]
			},

			"attributes": {
				get: this[attributes],
				set: this[setAttributes]
			},

			"associations": {
				get: this[associations]
			},

			"properties": {
				get: this[properties]
			},

			"validations": {
				get: this[validations]
			},

			"_tableName": {
				enumerable: false,
				writable: true
			},

			"tableName": {
				get: function get() {
					return _this._tableName || (0, _jargon2["default"])(_this.constructor.name).plural.snake.toString();
				},
				set: function set(newTableName) {
					_this._tableName = newTableName;
				}
			},

			"_primaryKey": {
				enumerable: false,
				writable: true
			},

			"primaryKey": {
				get: function get() {
					return _this._primaryKey || "id";
				},
				set: function set(newPrimaryKey) {
					_this._primaryKey = newPrimaryKey;
				}
			},

			"_softDelete": {
				enumerable: false,
				writable: true,
				value: false
			},

			"softDelete": {
				get: function get() {
					_this._softDelete = true;
				}
			}
		});

		//add the quirk to this instance
		this.additionalAttributes.addAttributes(this);

		this.associate();
		this.validate();

		this[setAttributes](initialAttributes);

		this.initialize();
	}

	_createClass(Model, [{
		key: "hasOne",
		value: function hasOne(associationName, associationConstructor) {
			return this[addAssociation]({
				name: associationName,
				constructor: associationConstructor,
				type: "hasOne"
			});
		}
	}, {
		key: "belongsTo",
		value: function belongsTo(associationName, associationConstructor) {
			return this[addAssociation]({
				name: associationName,
				constructor: associationConstructor,
				type: "belongsTo"
			});
		}
	}, {
		key: "hasMany",
		value: function hasMany(associationName, associationConstructor) {
			return this[addAssociation]({
				name: associationName,
				constructor: associationConstructor,
				type: "hasMany"
			});
		}
	}, {
		key: "ensure",
		value: function ensure(attributeName, validatorFunction, validatorMessage) {
			this._validations[attributeName] = this._validations[attributeName] || [];

			var validatorDetails = { validator: validatorFunction };

			if (validatorMessage) {
				validatorDetails.message = validatorMessage;
			}

			this._validations[attributeName].push(validatorDetails);
		}
	}, {
		key: "isValid",

		/**
   * Return a boolean indicating whether the model is valid or not.
   *
   * @method isValid
   * @param  {Function(boolean)} callback Callback returning the boolean.
   */
		value: function isValid(callback) {
			this.invalidAttributes(function (invalidAttributeList) {
				callback(Object.keys(invalidAttributeList).length === 0);
			});
		}
	}, {
		key: "invalidAttributes",

		/**
   * Return an object containing all invalid attributes and their errors.
   *
   * @example
   * ```
   * model.invalidAttributes((invalidAttributeList) => {
   *   console.log(invalidAttributeList); // {"name":["Cannot contain special characters", "Cannot contain numbers"], "age":["Cannot be under 18"]}
   * });
   * ```
   *
   * @method invalidAttributes
   * @param  {Function(invalidAttributeList)} callback Callback returning the invalid attribute list.
   */
		value: function invalidAttributes(callback) {
			var _this2 = this;

			var attributeNamesWithValidators = Object.keys(this._validations);

			var compileInvalidAttributeList = function compileInvalidAttributeList(errors, validatorMessages) {
				if (errors) {
					throw errors;
				} else {
					var invalidAttributeList = {};

					for (var index = 0; index < attributeNamesWithValidators.length; index++) {
						var invalidMessages = validatorMessages[index];

						if (invalidMessages.length > 0) {
							var attributeName = attributeNamesWithValidators[index];
							invalidAttributeList[attributeName] = invalidMessages;
						}
					}

					callback(invalidAttributeList);
				}
			};

			var performValidationsForAttribute = function performValidationsForAttribute(attributeName, done) {
				var attributeValidations = _this2._validations[attributeName];

				var performValidation = function performValidation(validation, returnValue) {
					var validator = validation.validator;

					validator.call(_this2, attributeName, function (error, validatorDetails) {
						if (validatorDetails.result) {
							returnValue(null, null);
						} else {
							returnValue(null, validation.message || validatorDetails.message);
						}
					});
				};

				var compileValidatorResponses = function compileValidatorResponses(error, invalidMessages) {
					var cleanedMessages = [];
					// Trick to remove falsy values from an array
					var _iteratorNormalCompletion = true;
					var _didIteratorError = false;
					var _iteratorError = undefined;

					try {
						for (var _iterator = invalidMessages[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
							var message = _step.value;

							message && cleanedMessages.push(message);
						}
					} catch (err) {
						_didIteratorError = true;
						_iteratorError = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion && _iterator["return"]) {
								_iterator["return"]();
							}
						} finally {
							if (_didIteratorError) {
								throw _iteratorError;
							}
						}
					}

					done(null, cleanedMessages);
				};

				flowsync.mapParallel(attributeValidations, performValidation, compileValidatorResponses);
			};

			flowsync.mapParallel(attributeNamesWithValidators, performValidationsForAttribute, compileInvalidAttributeList);
		}
	}, {
		key: "include",
		value: function include() {
			for (var _len = arguments.length, associationNames = Array(_len), _key = 0; _key < _len; _key++) {
				associationNames[_key] = arguments[_key];
			}

			this._includeAssociations = associationNames;
			return this;
		}
	}, {
		key: "fetch",
		value: function fetch() {
			for (var _len2 = arguments.length, options = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
				options[_key2] = arguments[_key2];
			}

			switch (options.length) {
				case 0:
					this[fetchBy]();
					break;
				case 1:
					if (typeof options[0] === "function") {
						this[fetchBy]([this.primaryKey], options[0]);
					} else if (Array.isArray(options[0])) {
						this[fetchBy](options[0]);
					} else {
						this[fetchBy]([options[0]]);
					}
					break;
				case 2:
					if (Array.isArray(options[0])) {
						this[fetchBy](options[0], options[1]);
					} else {
						this[fetchBy]([options[0]], options[1]);
					}
					break;
			}
		}
	}, {
		key: fetchBy,
		value: function value(fields, callback) {
			var _this3 = this;

			if (fields === undefined) fields = [this.primaryKey];

			if (!this.constructor.database) {
				throw new Error("Cannot fetch without Model.database set.");
			}

			var chain = this.constructor.database.select("*").from(this.tableName);
			fields.forEach(function (field, index) {
				if (!_this3[field]) {
					throw new Error("Cannot fetch this model by the '" + field + "' field because it is not set.");
				}

				if (index === 0) {
					chain = chain.where(field, "=", _this3[field]);
				} else {
					chain = chain.andWhere(field, "=", _this3[field]);
				}
			}, this);

			if (this._softDelete) {
				chain = chain.whereNull((0, _jargon2["default"])("deletedAt").snake.toString());
			}

			chain.limit(1).results(function (error, records) {
				if (records.length === 0) {
					callback(new Error("There is no " + _this3.constructor.name + " for the given (" + fields.join(", ") + ")."));
				} else {
					_this3[parseAttributesFromFields](records[0]);

					if (_this3._includeAssociations.length > 0) {
						(function () {
							var modelFinder = new _modelFinderJs2["default"](_this3.constructor.database);

							var associations = _this3.associations;

							/* We'll be putting all of our Async tasks into this */
							var fetchTasks = [];

							_this3._includeAssociations.forEach(function (associationName) {

								var association = associations[associationName];

								if (!association) {
									throw new Error("Cannot fetch '" + associationName + "' because it is not a valid association on " + _this3.constructor.name);
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
												if (!_this3[_this3.primaryKey]) {
													throw new Error("'" + _this3.primaryKey + "' is not set on " + _this3.constructor.name);
												}

												modelFinder.find(throughAssociation.constructor).where(association.foreignId, "=", _this3[_this3.primaryKey]).limit(1).results(function (errors, models) {
													var joinModel = models[0];
													var destinationAssociation = joinModel.associations[associationName];

													//throw destinationAssociation.foreignId;

													//throw joinModel;//throw model.associations;
													//addressId

													var tempModel = new association.constructor();
													modelFinder.find(association.constructor).where(tempModel.primaryKey, "=", joinModel[destinationAssociation.foreignId]).limit(1).results(function (associationError, associationModels) {
														var associationModel = associationModels[0];
														_this3[associationName] = associationModel;
														finished();
													});
												});
											} else {
												(function () {
													var query = modelFinder.find(ModelClass).where(association.foreignKey, "=", _this3[_this3.primaryKey]);

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
														var _this4 = this;

														this.where.apply(this, _toConsumableArray(processedWhere));

														if (Array.isArray(association.andWhere)) {
															association.andWhere.forEach(function (andWhereItem) {
																var processedAndWhereItem = andWhereItem.map(processWhereCondition);
																_this4.andWhere.apply(_this4, _toConsumableArray(processedAndWhereItem));
															});
														}
													});

													query.limit(1).results(function (errors, models) {
														var model = models[0];
														_this3[associationName] = model;
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
																	//throw {through: throughAssociation, destination: destinationAssociation};

																	modelIds = models.map(function (model) {
																		return model[throughAssociation.foreignId];
																	});

																	modelFinder.find(association.constructor).where(tempModel.primaryKey, "in", modelIds).results(function (errors, models) {
																		models.forEach(function (model) {
																			_this3[associationName].push(model);
																		});
																		finished();
																	});

																	break;

																case "hasMany":
																	modelIds = models.map(function (model) {
																		return model[model.primaryKey];
																	});

																	modelFinder.find(association.constructor).where(destinationAssociation.foreignId, "in", modelIds).results(function (errors, models) {
																		models.forEach(function (model) {
																			_this3[associationName].push(model);
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

																	modelFinder.find(association.constructor).where(tempModel.primaryKey, "in", modelIds).results(function (errors, models) {
																		models.forEach(function (model) {
																			_this3[associationName].push(model);
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
												_this3[associationName].fetch(finished);
											});
										}
										break;

									case "belongsTo":
										if (!_this3[association.foreignId]) {
											throw new Error("Cannot fetch '" + associationName + "' because '" + association.foreignId + "' is not set on " + _this3.constructor.name);
										}

										fetchTasks.push(function (finished) {
											modelFinder.find(association.constructor).where(_this3.primaryKey, "=", _this3[association.foreignId]).limit(1).results(function (errors, models) {
												var model = models[0];
												_this3[associationName] = model;
												model[association.foreignName] = _this3;
												finished();
											});
										});

								}
							});

							flowsync.parallel(fetchTasks, function () {
								if (callback) {
									callback(error, _this3);
								}
							});
						})();
					} else {
						if (callback) {
							callback(error, _this3);
						}
					}
				}
			});
		}
	}, {
		key: "delete",
		value: function _delete(callback) {
			var _this5 = this;

			if (this._softDelete) {
				if (!this.constructor.database) {
					throw new Error("Cannot delete without Model.database set.");
				}

				if (this[this.primaryKey]) {
					flowsync.series([function (next) {
						_this5[callDeep]("delete", function (associationDetails) {
							return associationDetails.type !== "belongsTo" && associationDetails.dependent === true;
						}, next);
					}, function (next) {
						var now = new _fleming2["default"]();
						var attributesToUpdate = {};
						attributesToUpdate[(0, _jargon2["default"])("deletedAt").snake.toString()] = now.toDate();
						_this5.constructor.database.update(attributesToUpdate).into(_this5.tableName).where(_this5.primaryKey, "=", _this5[_this5.primaryKey]).results(function (error, results) {
							if (error) {
								next(error);
							} else if (results === 0) {
								next(new Error(_this5.constructor.name + " with " + _this5.primaryKey + " " + _this5[_this5.primaryKey] + " cannot be soft deleted because it doesn't exists."));
							} else {
								next();
							}
						});
					}], function (errors, results) {
						callback(errors, results);
					});
				} else {
					throw new Error("Cannot delete the " + this.constructor.name + " because the primary key is not set.");
				}
			} else {
				throw new Error("Not implemented.");
			}
		}
	}, {
		key: "save",
		value: function save(callback) {
			var _this6 = this;

			if (!this.constructor.database) {
				throw new Error("Cannot save without Model.database set.");
			}

			flowsync.series([function (next) {
				_this6.beforeValidation(next);
			}, function (next) {
				_this6.isValid(function (valid) {
					if (valid) {
						next();
					} else {
						_this6.invalidAttributes(function (invalidAttributeList) {
							var hasInvalidAttributes = Object.keys(invalidAttributeList).length > 0;

							if (hasInvalidAttributes) {
								var errorPrefix = _this6.constructor.name + " is invalid";
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
				_this6.beforeSave(next);
			}, function (next) {
				if (_this6.isNew) {
					var now = new _fleming2["default"]();
					_this6.createdAt = now.toDate();
					var fieldAttributes = _this6[getFieldAttributes]();

					_this6.constructor.database.insert(fieldAttributes).into(_this6.tableName).results(function (error, ids) {
						if (error) {
							next(error);
						} else {
							_this6[_this6.primaryKey] = ids[0];
							next();
						}
					});
				} else {
					var now = new _fleming2["default"]();
					_this6.updatedAt = now.toDate();
					var _attributes = _this6[getFieldAttributes]();
					var updateAttributes = {};

					for (var attributeName in _attributes) {
						if (attributeName !== _this6.primaryKey) {
							updateAttributes[attributeName] = _attributes[attributeName];
						}
					}

					_this6.constructor.database.update(updateAttributes).into(_this6.tableName).where(_this6.primaryKey, "=", _this6[_this6.primaryKey]).results(next);
				}
			}, function (next) {
				//disabling this rule because break is not necessary when return is present
				/* eslint-disable no-fallthrough */
				_this6[callDeep]("save", function (associationDetails) {
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
				_this6.afterSave(next);
			}], function (errors) {
				if (errors) {
					callback(errors);
				} else {
					callback(undefined, _this6);
				}
			});
		}
	}, {
		key: "beforeValidation",

		/* Stubbed methods for hooks */
		value: function beforeValidation(callback) {
			callback();
		}
	}, {
		key: "beforeSave",
		value: function beforeSave(callback) {
			callback();
		}
	}, {
		key: "afterSave",
		value: function afterSave(callback) {
			callback();
		}
	}, {
		key: "associate",
		value: function associate() {}
	}, {
		key: "validate",
		value: function validate() {}
	}, {
		key: "initialize",
		value: function initialize() {}
	}, {
		key: "toJSON",
		value: function toJSON() {
			if (Model.jsonFormatter && typeof Model.jsonFormatter === "function") {
				return Model.jsonFormatter(this);
			} else {
				return this.attributes;
			}
		}
	}, {
		key: setAttributes,

		/**
   * Private Functionality
   */

		value: function value(newAttributes) {
			this[parseAttributesFromFields](newAttributes);
		}
	}, {
		key: associations,
		value: function value() {
			return this._associations;
		}
	}, {
		key: properties,
		value: function value() {
			return Object.keys(this);
		}
	}, {
		key: validations,
		value: function value() {
			return this._validations;
		}
	}, {
		key: attributes,
		value: function value() {
			var _this7 = this;

			var attributes = {};
			this.properties.forEach(function (propertyName) {
				if (!_this7._associations[propertyName]) {
					attributes[propertyName] = _this7[propertyName];
				}
			});
			return attributes;
		}
	}, {
		key: isNew,
		value: function value() {
			if (this[this.primaryKey]) {
				return false;
			} else {
				return true;
			}
		}
	}, {
		key: callDeep,

		/**
   * Call a function deeply through all associations
   *
   * @private
   * @method callDeep
   * @param {String} functionName The name of the function that you want to fire deeply.
   * @param {function(errors, results)} Function called at the end of the operation.
   */
		value: function value(methodName, predicate, callback) {
			var _this8 = this;

			var associationNames = Object.keys(this.associations);

			flowsync.mapParallel(associationNames, function (associationName, next) {

				var associationDetails = _this8.associations[associationName];

				switch (associationDetails.type) {
					case "belongsTo":
					case "hasOne":
						var model = _this8[associationName];
						if (model) {
							//pass the associationDetails.whereArgs to the function
							var result = predicate(associationDetails);
							if (result) {
								model[methodName](next);
							} else {
								next();
							}
						} else {
							next();
						}
						break;

					case "hasMany":
						var collection = _this8[associationName];
						//collection set, and not many to many (nothing in that case)
						if (collection) {
							//let array = [].slice.call(collection);
							flowsync.eachParallel(collection, function (collectionModel, finishSubStep) {
								var result = predicate(associationDetails);
								if (result) {
									collectionModel[methodName](finishSubStep);
								} else {
									next();
								}
							}, next);
						} else {
							next(); //collection not set
						}
						break;
				}
			}, function (errors, results) {
				callback(errors, results);
			});
		}
	}, {
		key: addAssociation,

		/**
   * @example
   * ```
   * const associationDetails = {
   *     name: "users",
   *     type: "hasMany",
   *     constructor: User
   * };
   *
   * [addAssociation](associationDetails);
   * ```
   * @method addAssociation
   * @param {Object.<String, *>} associationDetails Object containing association details in key/value pairs.
   */
		value: function value(associationDetails) {
			var _this9 = this;

			var association = {
				parent: this,
				type: associationDetails.type,
				constructor: associationDetails.constructor
			};

			/* Default Values */

			switch (associationDetails.type) {
				case "hasOne":
				case "hasMany":
					association.foreignKey = (0, _jargon2["default"])(this.constructor.name).foreignKey.toString();
					association.foreignId = (0, _jargon2["default"])(association.foreignKey).camel.toString();
					break;
				case "belongsTo":
					association.foreignKey = (0, _jargon2["default"])(associationDetails.name).foreignKey.toString();
					association.foreignId = (0, _jargon2["default"])(association.foreignKey).camel.toString();
			}

			// TODO: AS
			association.foreignName = (0, _jargon2["default"])(this.constructor.name).camel.toString();

			/* Override Values */

			var associationSetter = new AssociationSetter(association);

			/* Set private space for value to be stored internally */

			var privateAssociationName = "_" + associationDetails.name;

			var implicitAssociationName = associationDetails.name + "Id";
			var privateImplicitAssociationName = "_" + implicitAssociationName;

			/* Association Setter By Type */

			var setterFunction = undefined,
			    implicitSetterFunction = undefined;

			switch (associationDetails.type) {
				case "hasOne":
					this[privateAssociationName] = null;

					implicitSetterFunction = function (newId) {
						//reset the association when assign associationId
						_this9[privateImplicitAssociationName] = newId;
						_this9[privateAssociationName] = null;
					};

					setterFunction = function (newModel) {
						if (newModel && _this9[privateAssociationName] !== newModel) {
							if (!(newModel instanceof Model)) {
								throw new Error("Cannot set a non model entity onto this property. It should inherit from Model");
							}

							_this9[privateAssociationName] = newModel;
							_this9[privateImplicitAssociationName] = newModel.id;

							newModel[association.foreignName] = _this9;
						}
					};
					break;
				case "belongsTo":
					this[privateAssociationName] = null;

					implicitSetterFunction = function (newId) {
						//reset the association when assign associationId
						_this9[privateImplicitAssociationName] = newId;
						_this9[privateAssociationName] = null;
					};

					setterFunction = function (newModel) {
						if (newModel && _this9[privateAssociationName] !== newModel) {
							if (!(newModel instanceof Model)) {
								throw new Error("Cannot set a non model entity onto this property. It should inherit from Model");
							}

							_this9[privateAssociationName] = newModel;
							_this9[privateImplicitAssociationName] = newModel.id;

							var pluralForeignName = (0, _jargon2["default"])(association.foreignName).plural.toString();

							if (!association.ambiguous) {
								if (newModel.hasOwnProperty(association.foreignName)) {
									newModel[association.foreignName] = _this9;
								} else if (newModel.hasOwnProperty(pluralForeignName)) {
									//lookup is it exist and dont add it in that case
									newModel[pluralForeignName].push(_this9);
								} else {
									throw new Error("Neither \"" + association.foreignName + "\" or \"" + pluralForeignName + "\" are valid associations on \"" + newModel.constructor.name + "\"");
								}
							}

							// if (newModel[association.foreignName] instanceof Collection) {
							// 	newModel[association.foreignName].push(this);
							// } else {
							// 	newModel[association.foreignName] = this;
							// }
						}
					};
					break;
				case "hasMany":
					/* Set to null by default */
					this[privateAssociationName] = new _collectionJs2["default"](association);

					setterFunction = function (newModel) {
						if (newModel && _this9[privateAssociationName] !== newModel) {
							_this9[privateAssociationName] = newModel;
						}
					};
					break;
				default:
					throw new Error("Unknown association type.");
			}

			var newProperties = {};
			newProperties[privateAssociationName] = {
				enumerable: false,
				writable: true
			};
			newProperties[associationDetails.name] = {
				enumerable: true,
				set: setterFunction,
				get: function get() {
					return _this9[privateAssociationName];
				}
			};
			if (implicitSetterFunction) {
				newProperties[privateImplicitAssociationName] = {
					enumerable: false,
					writable: true
				};
				newProperties[implicitAssociationName] = {
					enumerable: true,
					set: implicitSetterFunction,
					get: function get() {
						return _this9[privateImplicitAssociationName];
					}
				};
			}
			Object.defineProperties(this, newProperties);

			// Object.defineProperty(
			// 	this,
			// 	privateAssociationName,
			// 	{
			// 		enumerable: false,
			// 		writable: true
			// 	}
			// );

			// Object.defineProperty(
			// 	this,
			// 	associationDetails.name,
			// 	{
			// 		enumerable: true,
			// 		set: setterFunction,
			// 		get: () => {
			// 			return this[privateAssociationName];
			// 		}
			// 	}
			// );

			this[associationDetails.name] = associationDetails.value;

			this._associations[associationDetails.name] = association;

			return associationSetter;
		}
	}, {
		key: parseAttributesFromFields,
		value: function value(record) {
			for (var field in record) {
				this[(0, _jargon2["default"])(field).camel.toString()] = record[field];
			}
		}
	}, {
		key: getFieldAttributes,
		value: function value() {
			var _this10 = this;

			var attributeNames = Object.keys(this.attributes);
			var fieldAttributes = {};
			attributeNames.forEach(function (attributeName) {
				var found = Object.keys(_this10.additionalAttributes).find(function (additionalAttributeName) {
					return additionalAttributeName === attributeName;
				});
				//is just on db if is not an additional attribute
				if (!found) {
					fieldAttributes[(0, _jargon2["default"])(attributeName).snake.toString()] = _this10[attributeName];
				}
			});

			//add belongsTo associations and remove others
			Object.keys(this.associations).forEach(function (associationName) {
				var relatedModel = _this10[associationName];
				var foreignKeyField = (0, _jargon2["default"])(associationName).foreignKey.toString();
				if (_this10._associations[associationName].type === "belongsTo") {
					//try with relatedModel and relatedModel.id
					if (relatedModel && relatedModel.id) {
						fieldAttributes[foreignKeyField] = relatedModel.id;
					} else {
						//or just with the relatedModelId
						//construct the snake with _id and then camelize it
						var foreignIdAsAttribute = (0, _jargon2["default"])(foreignKeyField).camel.toString();
						fieldAttributes[foreignKeyField] = _this10[foreignIdAsAttribute];
					}
				} else {
					//console.log("getFieldAttributes delete on ", {on: this.constructor.name, associationName: associationName, foreignKeyField: foreignKeyField, relatedModel: relatedModel});
					delete fieldAttributes[associationName];
					delete fieldAttributes["_" + associationName];
				}
			});

			return fieldAttributes;
		}
	}]);

	return Model;
})();

exports["default"] = Model;

var ambiguous = Symbol(),
    dependent = Symbol();

var AssociationSetter = (function () {
	function AssociationSetter(association) {
		_classCallCheck(this, AssociationSetter);

		this.association = association;

		switch (association.type) {
			case "belongsTo":
				Object.defineProperties(this, {
					"ambiguous": {
						get: this[ambiguous]
					}
				});
				break;
			case "hasOne":
			case "hasMany":
				Object.defineProperties(this, {
					"dependent": {
						get: this[dependent]
					}
				});
				break;
		}
	}

	_createClass(AssociationSetter, [{
		key: "foreignName",
		value: function foreignName(name) {
			this.association.foreignName = name;
			return this;
		}
	}, {
		key: "where",
		value: function where() {
			for (var _len3 = arguments.length, options = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
				options[_key3] = arguments[_key3];
			}

			this.association.where = options;
			return this;
		}
	}, {
		key: "andWhere",
		value: function andWhere() {
			this.association.andWhere = this.association.andWhere || [];

			for (var _len4 = arguments.length, options = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
				options[_key4] = arguments[_key4];
			}

			this.association.andWhere.push(options);
			return this;
		}
	}, {
		key: "through",
		value: function through(associationName) {
			this.association.through = associationName;
			return this;
		}
	}, {
		key: "as",
		value: function as(associationName) {
			this.association.as = associationName;
			return this;
		}
	}, {
		key: ambiguous,
		value: function value() {
			this.association.ambiguous = true;
		}
	}, {
		key: dependent,
		value: function value() {
			this.association.dependent = true;
		}
	}]);

	return AssociationSetter;
})();

exports.AssociationSetter = AssociationSetter;

Object.defineProperties(Model, {
	"find": {
		get: function modelFind() {
			var modelQuery = new _modelFinderJs.ModelQuery(Model.database);
			return modelQuery.find(this);
		}
	},
	//problem here: can't assign property automatically to the concrete model to use it
	//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/observe#Browser_compatibility
	"attributes": {
		value: new _quirk2["default"]()
	}
});