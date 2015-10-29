/* Component Dependencies */
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _flowsync = require("flowsync");

var _flowsync2 = _interopRequireDefault(_flowsync);

var _jargon = require("jargon");

var _jargon2 = _interopRequireDefault(_jargon);

var _incognito = require("incognito");

var _incognito2 = _interopRequireDefault(_incognito);

/* Shared Symbols */

var _symbols = require("./symbols");

var _symbols2 = _interopRequireDefault(_symbols);

/**
 * @class Model
 */

var _modelFinderJs = require("../modelFinder.js");

var _modelFinderJs2 = _interopRequireDefault(_modelFinderJs);

var Model = (function () {
	/**
  * @param {Object.<String,*>} [initialAttributes] Provide default values for attributes by passing a Key-Value Object.
  * @constructor
  */

	function Model(initialAttributes) {
		var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

		_classCallCheck(this, Model);

		var _ = (0, _incognito2["default"])(this);
		_.validations = {};
		_.associations = {};
		_.includeAssociations = [];

		_.database = options.database;

		this.associate();
		this.validate();

		this.attributes = initialAttributes;

		this.initialize();
	}

	/**
  * STATIC INTERFACE
  */

	_createClass(Model, [{
		key: "hasOne",

		/**
   * INSTANCE INTERFACE
   */

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
		value: function ensure(attributeNameOrNames, validatorFunction, validatorMessage) {
			var _this = this;

			if (attributeNameOrNames.constructor === Array) {
				(function () {
					var attributeNames = attributeNameOrNames;

					attributeNames.forEach(function (attributeName) {
						_this[_symbols2["default"].addValidationForAttribute](attributeName, validatorFunction, attributeNames, validatorMessage);
					});
				})();
			} else {
				var attributeName = attributeNameOrNames;

				this[_symbols2["default"].addValidationForAttribute](attributeName, validatorFunction, attributeName, validatorMessage);
			}
		}
	}, {
		key: _symbols2["default"].addValidationForAttribute,
		value: function value(attributeName, validatorFunction, validatorParameters, validatorMessage) {
			var _ = (0, _incognito2["default"])(this);

			_.validations[attributeName] = _.validations[attributeName] || [];

			var validatorDetails = { validator: validatorFunction };

			if (validatorParameters.constructor === Array) {
				validatorDetails.parameters = validatorParameters;
			}

			if (validatorMessage) {
				validatorDetails.message = validatorMessage;
			}

			_.validations[attributeName].push(validatorDetails);
		}

		/**
   * Return a boolean indicating whether the model is valid or not.
   *
   * @method isValid
   * @param	{Function(boolean)} callback Callback returning the boolean.
   */
	}, {
		key: "isValid",
		value: function isValid(callback) {
			this.invalidAttributes(function (invalidAttributeList) {
				callback(Object.keys(invalidAttributeList).length === 0);
			});
		}

		/**
   * Return an object containing all invalid attributes and their errors.
   *
   * @example
   * ```
   * model.invalidAttributes((invalidAttributeList) => {
   *	 console.log(invalidAttributeList); // {"name":["Cannot contain special characters", "Cannot contain numbers"], "age":["Cannot be under 18"]}
   * });
   * ```
   *
   * @method invalidAttributes
   * @param	{Function(invalidAttributeList)} callback Callback returning the invalid attribute list.
   */
	}, {
		key: "invalidAttributes",
		value: function invalidAttributes(callback) {
			var _this2 = this;

			var _ = (0, _incognito2["default"])(this);
			var attributeNamesWithValidators = Object.keys(_.validations);

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
				var attributeValidations = _.validations[attributeName];

				var performValidation = function performValidation(validation, returnValue) {
					var validator = validation.validator;
					var parameters = validation.parameters;

					var validatorParameters = attributeName;

					if (parameters) {
						validatorParameters = parameters;
					}

					validator.call(_this2, validatorParameters, function (error, validatorDetails) {
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

			(0, _incognito2["default"])(this).includeAssociations = associationNames;
			return this;
		}

		/* Stubbed methods for hooks */
	}, {
		key: "beforeValidation",
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
		key: "beforeDelete",
		value: function beforeDelete(callback) {
			callback();
		}
	}, {
		key: "afterDelete",
		value: function afterDelete(callback) {
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

		/* Dynamic Properties */

	}, {
		key: _symbols2["default"].getDatabase,

		/**
   * Private Functionality
   */
		value: function value() {
			var database = (0, _incognito2["default"])(this).database;
			if (!database) {
				database = this.constructor.database;
			}
			return database;
		}

		/**
   * Call a function deeply through all associations
   *
   * @private
   * @method callDeep
   * @param {String} functionName The name of the function that you want to fire deeply.
   * @param {function(errors, results)} Function called at the end of the operation.
   */
	}, {
		key: _symbols2["default"].callDeep,
		value: function value(methodName, predicate, callback) {
			var _this3 = this;

			var associationNames = Object.keys(this.associations);

			_flowsync2["default"].mapParallel(associationNames, function (associationName, next) {

				var associationDetails = _this3.associations[associationName];

				switch (associationDetails.type) {
					case "belongsTo":
					case "hasOne":
						var model = _this3[associationName];
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
						var collection = _this3[associationName];
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
			var _this4 = this;

			var attributeNames = Object.keys(this.attributes);
			var fieldAttributes = {};
			attributeNames.forEach(function (attributeName) {
				fieldAttributes[(0, _jargon2["default"])(attributeName).snake.toString()] = _this4[attributeName];
			});

			var _ = (0, _incognito2["default"])(this);

			//add belongsTo associations and remove others
			Object.keys(this.associations).forEach(function (associationName) {
				var relatedModel = _this4[associationName];
				var foreignKeyField = (0, _jargon2["default"])(associationName).foreignKey.toString();
				if (_.associations[associationName].type === "belongsTo") {
					//try with relatedModel and relatedModel.id
					if (relatedModel && relatedModel.id) {
						fieldAttributes[foreignKeyField] = relatedModel.id;
					} else {
						//or just with the relatedModelId
						//construct the snake with _id and then camelize it
						var foreignIdAsAttribute = (0, _jargon2["default"])(foreignKeyField).camel.toString();
						fieldAttributes[foreignKeyField] = _this4[foreignIdAsAttribute];
					}
				} else {
					//console.log("getFieldAttributes delete on ", {on: this.constructor.name, associationName: associationName, foreignKeyField: foreignKeyField, relatedModel: relatedModel});
					delete fieldAttributes[associationName];
					delete fieldAttributes["_" + associationName];
				}
			});

			return fieldAttributes;
		}
	}, {
		key: "mock",

		/**
   * INSTANCE MOCKING
   */

		get: function get() {
			return new InstanceMock(this);
		}
	}, {
		key: "database",
		get: function get() {
			var _ = (0, _incognito2["default"])(this);
			if (_.database) {
				return _.database;
			} else {
				return this.constructor.database;
			}
		}
	}, {
		key: "isNew",
		get: function get() {
			if (this[this.primaryKey]) {
				return false;
			} else {
				return true;
			}
		}
	}, {
		key: "attributes",
		set: function set(newAttributes) {
			this[_symbols2["default"].parseAttributesFromFields](newAttributes);
		},
		get: function get() {
			var _this5 = this;

			var attributes = {};
			this.properties.forEach(function (propertyName) {
				if (!(0, _incognito2["default"])(_this5).associations[propertyName]) {
					attributes[propertyName] = _this5[propertyName];
				}
			});
			return attributes;
		}
	}, {
		key: "associations",
		get: function get() {
			return (0, _incognito2["default"])(this).associations;
		}
	}, {
		key: "properties",
		get: function get() {
			return Object.keys(this);
		}
	}, {
		key: "validations",
		get: function get() {
			return (0, _incognito2["default"])(this).validations;
		}
	}, {
		key: "tableName",
		get: function get() {
			return (0, _incognito2["default"])(this).tableName || (0, _jargon2["default"])(this.constructor.name).plural.snake.toString();
		},
		set: function set(newTableName) {
			(0, _incognito2["default"])(this).tableName = newTableName;
		}
	}, {
		key: "primaryKey",
		get: function get() {
			return (0, _incognito2["default"])(this).primaryKey || "id";
		},
		set: function set(newPrimaryKey) {
			(0, _incognito2["default"])(this).primaryKey = newPrimaryKey;
		}
	}], [{
		key: "find",
		get: function get() {
			var modelQuery = new _modelFinderJs2["default"](this.database);
			return modelQuery.find(this);
		}
	}, {
		key: "count",
		get: function get() {
			var modelQuery = new _modelFinderJs2["default"](this.database);
			return modelQuery.count(this);
		}
	}, {
		key: "mock",
		get: function get() {
			var modelQuery = new _modelFinderJs2["default"](this.database);
			return modelQuery.mock(this);
		}
	}]);

	return Model;
})();

exports["default"] = Model;

var InstanceMock = (function () {
	function InstanceMock(instance) {
		_classCallCheck(this, InstanceMock);

		(0, _incognito2["default"])(this).instance = instance;
	}

	_createClass(InstanceMock, [{
		key: "save",
		value: function save(mockNewId) {
			var instance = (0, _incognito2["default"])(this).instance;
			(0, _incognito2["default"])(instance).mockNewId = mockNewId;
		}
	}, {
		key: "fetch",
		value: function fetch(mockRecord) {
			var instance = (0, _incognito2["default"])(this).instance;
			(0, _incognito2["default"])(instance).mockFetchRecord = mockRecord;
		}
	}, {
		key: "delete",
		value: function _delete() {
			var instance = (0, _incognito2["default"])(this).instance;
			(0, _incognito2["default"])(instance).mockDelete = true;
		}
	}, {
		key: "instance",
		value: function instance(mockRecord) {
			this.save(mockRecord.id);
			this.fetch(mockRecord);
			this["delete"]();
		}
	}]);

	return InstanceMock;
})();

Object.assign(Model.prototype, _defineProperty({
	"fetch": require("./fetch.js"),
	"save": require("./save.js"),
	"delete": require("./delete.js"),
	"softDelete": require("./softDelete.js"),
	"destroy": require("./destroy.js"),
	"softDestroy": require("./softDestroy.js")
}, _symbols2["default"].addAssociation, require("./addAssociation.js")));

module.exports = exports["default"];