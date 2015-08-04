/* Component Dependencies */
//
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _flowsync = require("flowsync");

var _flowsync2 = _interopRequireDefault(_flowsync);

var _fleming = require("fleming");

var _fleming2 = _interopRequireDefault(_fleming);

var _jargon = require("jargon");

var _jargon2 = _interopRequireDefault(_jargon);

var _quirk = require("quirk");

var _quirk2 = _interopRequireDefault(_quirk);

var _symbols = require("./symbols");

var _symbols2 = _interopRequireDefault(_symbols);

//approach #2 to proxy method to a different file

var _fetchJs = require("./fetch.js");

var _fetchJs2 = _interopRequireDefault(_fetchJs);

var _addAssociationJs = require("./addAssociation.js");

var _addAssociationJs2 = _interopRequireDefault(_addAssociationJs);

var _modelFinderJs = require("../modelFinder.js");

var _modelFinderJs2 = _interopRequireDefault(_modelFinderJs);

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
				get: this[_symbols2["default"].isNew]
			},

			"attributes": {
				get: this[_symbols2["default"].attributes],
				set: this[_symbols2["default"].setAttributes]
			},

			"associations": {
				get: this[_symbols2["default"].associations]
			},

			"properties": {
				get: this[_symbols2["default"].properties]
			},

			"validations": {
				get: this[_symbols2["default"].validations]
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

		this[_symbols2["default"].setAttributes](initialAttributes);

		this.initialize();
	}

	_createClass(Model, [{
		key: "hasOne",
		value: function hasOne(associationName, associationConstructor) {
			return this[_symbols2["default"].addAssociation]({
				name: associationName,
				constructor: associationConstructor,
				type: "hasOne"
			});
		}
	}, {
		key: "belongsTo",
		value: function belongsTo(associationName, associationConstructor) {
			return this[_symbols2["default"].addAssociation]({
				name: associationName,
				constructor: associationConstructor,
				type: "belongsTo"
			});
		}
	}, {
		key: "hasMany",
		value: function hasMany(associationName, associationConstructor) {
			return this[_symbols2["default"].addAssociation]({
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

				_flowsync2["default"].mapParallel(attributeValidations, performValidation, compileValidatorResponses);
			};

			_flowsync2["default"].mapParallel(attributeNamesWithValidators, performValidationsForAttribute, compileInvalidAttributeList);
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
		key: "delete",
		value: function _delete(callback) {
			var _this3 = this;

			if (this._softDelete) {
				if (!this.constructor.database) {
					throw new Error("Cannot delete without Model.database set.");
				}

				if (this[this.primaryKey]) {
					_flowsync2["default"].series([function (next) {
						_this3[_symbols2["default"].callDeep]("delete", function (associationDetails) {
							return associationDetails.type !== "belongsTo" && associationDetails.dependent === true;
						}, next);
					}, function (next) {
						var now = new _fleming2["default"]();
						var attributesToUpdate = {};
						attributesToUpdate[(0, _jargon2["default"])("deletedAt").snake.toString()] = now.toDate();
						_this3.constructor.database.update(attributesToUpdate).into(_this3.tableName).where(_this3.primaryKey, "=", _this3[_this3.primaryKey]).results(function (error, results) {
							if (error) {
								next(error);
							} else if (results === 0) {
								next(new Error(_this3.constructor.name + " with " + _this3.primaryKey + " " + _this3[_this3.primaryKey] + " cannot be soft deleted because it doesn't exists."));
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

		//approach #1 to proxy method to a different file
		value: function save(callback) {
			require("./save").call(this, callback);
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
			return this.attributes;
		}
	}, {
		key: _symbols2["default"].setAttributes,

		/**
   * Private Functionality
   */

		value: function value(newAttributes) {
			this[_symbols2["default"].parseAttributesFromFields](newAttributes);
		}
	}, {
		key: _symbols2["default"].associations,
		value: function value() {
			return this._associations;
		}
	}, {
		key: _symbols2["default"].properties,
		value: function value() {
			return Object.keys(this);
		}
	}, {
		key: _symbols2["default"].validations,
		value: function value() {
			return this._validations;
		}
	}, {
		key: _symbols2["default"].attributes,
		value: function value() {
			var _this4 = this;

			var attributes = {};
			this.properties.forEach(function (propertyName) {
				if (!_this4._associations[propertyName]) {
					attributes[propertyName] = _this4[propertyName];
				}
			});
			return attributes;
		}
	}, {
		key: _symbols2["default"].isNew,
		value: function value() {
			if (this[this.primaryKey]) {
				return false;
			} else {
				return true;
			}
		}
	}, {
		key: _symbols2["default"].callDeep,

		/**
   * Call a function deeply through all associations
   *
   * @private
   * @method callDeep
   * @param {String} functionName The name of the function that you want to fire deeply.
   * @param {function(errors, results)} Function called at the end of the operation.
   */
		value: function value(methodName, predicate, callback) {
			var _this5 = this;

			var associationNames = Object.keys(this.associations);

			_flowsync2["default"].mapParallel(associationNames, function (associationName, next) {

				var associationDetails = _this5.associations[associationName];

				switch (associationDetails.type) {
					case "belongsTo":
					case "hasOne":
						var model = _this5[associationName];
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
						var collection = _this5[associationName];
						//collection set, and not many to many (nothing in that case)
						if (collection) {
							//let array = [].slice.call(collection);
							_flowsync2["default"].eachParallel(collection, function (collectionModel, finishSubStep) {
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
		key: _symbols2["default"].parseAttributesFromFields,
		value: function value(record) {
			for (var field in record) {
				this[(0, _jargon2["default"])(field).camel.toString()] = record[field];
			}
		}
	}, {
		key: _symbols2["default"].getFieldAttributes,
		value: function value() {
			var _this6 = this;

			var attributeNames = Object.keys(this.attributes);
			var fieldAttributes = {};
			attributeNames.forEach(function (attributeName) {
				var found = Object.keys(_this6.additionalAttributes).find(function (additionalAttributeName) {
					return additionalAttributeName === attributeName;
				});
				//is just on db if is not an additional attribute
				if (!found) {
					fieldAttributes[(0, _jargon2["default"])(attributeName).snake.toString()] = _this6[attributeName];
				}
			});

			//add belongsTo associations and remove others
			Object.keys(this.associations).forEach(function (associationName) {
				var relatedModel = _this6[associationName];
				var foreignKeyField = (0, _jargon2["default"])(associationName).foreignKey.toString();
				if (_this6._associations[associationName].type === "belongsTo") {
					//try with relatedModel and relatedModel.id
					if (relatedModel && relatedModel.id) {
						fieldAttributes[foreignKeyField] = relatedModel.id;
					} else {
						//or just with the relatedModelId
						//construct the snake with _id and then camelize it
						var foreignIdAsAttribute = (0, _jargon2["default"])(foreignKeyField).camel.toString();
						fieldAttributes[foreignKeyField] = _this6[foreignIdAsAttribute];
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

Object.assign(Model.prototype, { fetch: _fetchJs2["default"] });

Model.prototype[_symbols2["default"].addAssociation] = _addAssociationJs2["default"];

Object.defineProperties(Model, {
	"find": {
		get: function modelFind() {
			var modelQuery = new _modelFinderJs2["default"](Model.database);
			return modelQuery.find(this);
		}
	},
	//problem here: can't assign property automatically to the concrete model to use it
	//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/observe#Browser_compatibility
	"attributes": {
		value: new _quirk2["default"]()
	}
});

module.exports = exports["default"];