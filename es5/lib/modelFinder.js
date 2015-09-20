/* Dependencies */
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _jargon = require("jargon");

var _jargon2 = _interopRequireDefault(_jargon);

var _incognito = require("incognito");

var _incognito2 = _interopRequireDefault(_incognito);

var _util = require("util");

var _util2 = _interopRequireDefault(_util);

/* Private Symbols */

var _collectionJs = require("./collection.js");

var _collectionJs2 = _interopRequireDefault(_collectionJs);

var attributesToColumns = Symbol();

var ModelFinder = (function () {
	function ModelFinder(database) {
		_classCallCheck(this, ModelFinder);

		(0, _incognito2["default"])(this).database = database;
	}

	_createClass(ModelFinder, [{
		key: "find",
		value: function find(ModelConstructor) {
			var query = new ModelQuery(ModelConstructor, {
				database: (0, _incognito2["default"])(this).database
			});
			query.find();

			return query;
		}
	}, {
		key: "count",
		value: function count(ModelConstructor) {
			var query = new ModelQuery(ModelConstructor, {
				database: (0, _incognito2["default"])(this).database
			});
			query.count();

			return query;
		}
	}]);

	return ModelFinder;
})();

exports["default"] = ModelFinder;

var addChain = Symbol(),
    validateDependencies = Symbol(),
    argumentString = Symbol(),
    callDatabase = Symbol();

var ModelQuery = (function () {
	function ModelQuery(ModelConstructor, options) {
		_classCallCheck(this, ModelQuery);

		var _ = (0, _incognito2["default"])(this);

		_.ModelConstructor = ModelConstructor;
		_.database = options.database;
		_.chain = {};

		ModelConstructor.mocks = ModelConstructor.mocks || {};
	}

	_createClass(ModelQuery, [{
		key: "toString",
		value: function toString() {
			var _this = this;

			var _ = (0, _incognito2["default"])(this);

			var chainString = _.ModelConstructor.name;

			[".find", ".count", ".all", ".one", ".where", ".andWhere", ".orWhere", ".limit", ".groupBy", ".orderBy"].forEach(function (chainName) {
				if (_.chain.hasOwnProperty(chainName)) {
					chainString = chainString + chainName;
					var options = _.chain[chainName];

					if (options) {
						chainString = chainString + "(" + _this[argumentString](options) + ")";
					}
				}
			});

			return chainString;
		}
	}, {
		key: "mockResults",
		value: function mockResults(mockValue) {
			var _ = (0, _incognito2["default"])(this);

			var mockString = this.toString();

			_.ModelConstructor.mocks[mockString] = mockValue;

			return this;
		}
	}, {
		key: validateDependencies,
		value: function value() {
			if (!(0, _incognito2["default"])(this).database) {
				throw new Error("Cannot find models without a database set.");
			}
		}
	}, {
		key: addChain,
		value: function value(chainName, options) {
			(0, _incognito2["default"])(this).chain[chainName] = options;
		}
	}, {
		key: argumentString,
		value: function value(options) {
			var newOptions = [];
			options.forEach(function (option) {
				var newOption = undefined;
				if (typeof option === "string") {
					newOption = "\"" + option + "\"";
				} else {
					newOption = option.toString();
				}
				newOptions.push(newOption);
			});
			return newOptions.join(", ");
		}
	}, {
		key: "find",
		value: function find() {
			var _ = (0, _incognito2["default"])(this);

			var tempModel = new _.ModelConstructor();

			if (_.database) {
				_.query = _.database.select("*").from(tempModel.tableName);
			}

			this[addChain](".find");

			return this;
		}
	}, {
		key: "count",
		value: function count() {
			var _ = (0, _incognito2["default"])(this);

			this.countResults = true;

			var tempModel = new _.ModelConstructor();

			if (_.database) {
				_.query = _.database.select(null).count("* AS rowCount").from(tempModel.tableName);
			}

			this[addChain](".count");

			return this;
		}
	}, {
		key: "where",
		value: function where() {
			for (var _len = arguments.length, options = Array(_len), _key = 0; _key < _len; _key++) {
				options[_key] = arguments[_key];
			}

			var formattedOptions = this[attributesToColumns].apply(this, options);
			var _ = (0, _incognito2["default"])(this);
			if (_.query) {
				var _$query;

				(_$query = _.query).where.apply(_$query, _toConsumableArray(formattedOptions));
			}
			this[addChain](".where", options);
			return this;
		}
	}, {
		key: "andWhere",
		value: function andWhere() {
			for (var _len2 = arguments.length, options = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
				options[_key2] = arguments[_key2];
			}

			var formattedOptions = this[attributesToColumns].apply(this, options);
			var _ = (0, _incognito2["default"])(this);
			if (_.query) {
				var _$query2;

				(_$query2 = _.query).andWhere.apply(_$query2, _toConsumableArray(formattedOptions));
			}
			this[addChain](".andWhere", options);
			return this;
		}
	}, {
		key: "orWhere",
		value: function orWhere() {
			for (var _len3 = arguments.length, options = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
				options[_key3] = arguments[_key3];
			}

			var formattedOptions = this[attributesToColumns].apply(this, options);
			var _ = (0, _incognito2["default"])(this);
			if (_.query) {
				var _$query3;

				(_$query3 = _.query).orWhere.apply(_$query3, _toConsumableArray(formattedOptions));
			}
			this[addChain](".orWhere", options);
			return this;
		}
	}, {
		key: "groupBy",
		value: function groupBy() {
			for (var _len4 = arguments.length, options = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
				options[_key4] = arguments[_key4];
			}

			var formattedOptions = this[attributesToColumns].apply(this, options);
			var _ = (0, _incognito2["default"])(this);
			if (_.query) {
				var _$query4;

				(_$query4 = _.query).groupBy.apply(_$query4, _toConsumableArray(formattedOptions));
			}
			this[addChain](".groupBy", options);
			return this;
		}
	}, {
		key: "orderBy",
		value: function orderBy() {
			for (var _len5 = arguments.length, options = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
				options[_key5] = arguments[_key5];
			}

			var formattedOptions = this[attributesToColumns].apply(this, options);
			var _ = (0, _incognito2["default"])(this);
			if (_.query) {
				var _$query5;

				(_$query5 = _.query).orderBy.apply(_$query5, _toConsumableArray(formattedOptions));
			}
			this[addChain](".orderBy", options);
			return this;
		}
	}, {
		key: "limit",
		value: function limit() {
			var _ = (0, _incognito2["default"])(this);
			_.returnOneRecord = false;

			for (var _len6 = arguments.length, options = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
				options[_key6] = arguments[_key6];
			}

			if (_.query) {
				var _$query6;

				(_$query6 = _.query).limit.apply(_$query6, options);
			}
			this[addChain](".limit", options);
			return this;
		}
	}, {
		key: "results",
		value: function results(callback) {
			var _ = (0, _incognito2["default"])(this);

			var mockString = this.toString();
			var mockValue = _.ModelConstructor.mocks[mockString];

			if (mockValue) {
				callback(null, mockValue);
			} else {
				this[callDatabase](callback);
			}
		}
	}, {
		key: callDatabase,
		value: function value(callback) {
			var _this2 = this;

			var _ = (0, _incognito2["default"])(this);

			this[validateDependencies]();

			if (_.returnOneRecord) {
				this.limit(1);
			}

			_.query.results(function (error, rows) {
				if (!rows) {
					if (error) {
						return callback(error);
					} else {
						return callback(new Error("No rows returned by database."));
					}
				}

				if (_this2.countResults) {
					callback(error, rows[0].rowCount);
				} else {
					(function () {
						var models = new _collectionJs2["default"](_.ModelConstructor);

						rows.forEach(function (row) {
							models.push(new _.ModelConstructor(row));
						});

						callback(error, models);
					})();
				}
			});
		}
	}, {
		key: attributesToColumns,
		value: function value() {
			for (var _len7 = arguments.length, options = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
				options[_key7] = arguments[_key7];
			}

			return options.map(function (option, index) {
				if (typeof option === "string" && index === 0) {
					return (0, _jargon2["default"])(option).snake.toString();
				} else {
					return option;
				}
			});
		}
	}, {
		key: "one",
		get: function get() {
			var _ = (0, _incognito2["default"])(this);

			_.returnOneRecord = true;

			this[addChain](".one");

			return this;
		}
	}, {
		key: "deleted",
		get: function get() {
			(0, _incognito2["default"])(this).query.whereNotNull((0, _jargon2["default"])("deletedAt").snake.toString());

			this[addChain](".deleted");

			return this;
		}
	}, {
		key: "all",
		get: function get() {
			this[addChain](".all");

			return this;
		}
	}]);

	return ModelQuery;
})();

exports.ModelQuery = ModelQuery;