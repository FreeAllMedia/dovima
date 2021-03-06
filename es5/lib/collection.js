"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _jargon = require("jargon");

var _jargon2 = _interopRequireDefault(_jargon);

var _modelFinderJs = require("./modelFinder.js");

var _modelFinderJs2 = _interopRequireDefault(_modelFinderJs);

var Collection = (function (_Array) {
	_inherits(Collection, _Array);

	function Collection(initialData) {
		_classCallCheck(this, Collection);

		_get(Object.getPrototypeOf(Collection.prototype), "constructor", this).call(this);

		var association = null,
		    modelConstructor = null;

		if (initialData && typeof initialData === "function") {
			modelConstructor = initialData;
		} else {
			association = initialData;
		}

		Object.defineProperties(this, {
			"association": {
				enumerable: true,
				writable: true,
				value: association
			},
			"_modelConstructor": {
				enumerable: true,
				value: modelConstructor
			}
		});
	}

	_createClass(Collection, [{
		key: "push",
		value: function push() {
			var _this = this;

			for (var _len = arguments.length, models = Array(_len), _key = 0; _key < _len; _key++) {
				models[_key] = arguments[_key];
			}

			models.forEach(function (model) {
				if (_this.indexOf(model) === -1) {
					if (_this.association) {
						_get(Object.getPrototypeOf(Collection.prototype), "push", _this).call(_this, model);
						var pluralForeignName = (0, _jargon2["default"])(_this.association.foreignName).plural.toString();
						if (model.hasOwnProperty(_this.association.foreignName)) {
							if (model[_this.association.foreignName] !== _this.association.parent) {
								model[_this.association.foreignName] = _this.association.parent;
							}
						} else if (model.hasOwnProperty(pluralForeignName)) {
							model[pluralForeignName].push(_this.association.parent);
						}
					} else {
						if (model instanceof _this._modelConstructor) {
							_get(Object.getPrototypeOf(Collection.prototype), "push", _this).call(_this, model);
						} else {
							var modelName = undefined;
							if (model && model.constructor) {
								modelName = model.constructor.name;
							} else {
								modelName = model;
							}

							throw new TypeError("The model " + modelName + " is not an instance of " + _this._modelConstructor.name + ", therefore, it cannot be pushed to this collection.");
						}
					}
				}
			}, this);
		}
	}, {
		key: "fetch",
		value: function fetch(callback) {
			var _this2 = this;

			function processWhereCondition(value) {
				if (typeof value === "string") {
					var snakeCasedValue = (0, _jargon2["default"])(value).snake.toString();
					return snakeCasedValue;
				} else {
					return value;
				}
			}

			if (this.association) {
				var modelFinder = new _modelFinderJs2["default"](this.association.constructor.database);

				var query = modelFinder.find(this.association.constructor);

				if (this.association.as) {
					query.where(this.association.as + "_id", "=", this.association.parent.id).andWhere(this.association.as + "_type", "=", this.association.parent.constructor.name);
				} else {
					query.where(this.association.foreignKey, "=", this.association.parent.id);
				}

				if (this.association.where) {
					(function () {
						var processedWhereConditions = _this2.association.where.map(processWhereCondition);
						var self = _this2;
						query.andWhere(function () {
							var _this3 = this;

							this.where.apply(this, _toConsumableArray(processedWhereConditions));

							if (Array.isArray(self.association.andWhere)) {
								self.association.andWhere.forEach(function (whereConditions) {
									var processedAndWhereItem = whereConditions.map(processWhereCondition);
									_this3.andWhere.apply(_this3, _toConsumableArray(processedAndWhereItem));
								});
							}
						});
					})();
				}

				query.results(function (error, models) {
					_this2.splice(0, _this2.length);
					models.forEach(function (model) {
						_this2.push(model);
					});
					callback(error);
				});
			} else {
				throw new Error("Cannot fetch collection without an association set. Call Model.all instead.");
			}
		}
	}]);

	return Collection;
})(Array);

exports["default"] = Collection;
module.exports = exports["default"];