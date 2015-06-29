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

var _collectionJs = require("./collection.js");

var _collectionJs2 = _interopRequireDefault(_collectionJs);

var validateDependencies = Symbol();

var ModelFinder = (function () {
	function ModelFinder(database) {
		_classCallCheck(this, ModelFinder);

		Object.defineProperties(this, {
			"_database": {
				value: database,
				writable: true,
				enumerable: false
			}
		});
	}

	_createClass(ModelFinder, [{
		key: "find",
		value: function find(ModelConstructor) {
			this[validateDependencies]();

			var query = new ModelQuery(this._database);

			query.find(ModelConstructor);

			return query;
		}
	}, {
		key: "count",
		value: function count(ModelConstructor) {
			this[validateDependencies]();

			var query = new ModelQuery(this._database);

			query.count(ModelConstructor);

			return query;
		}
	}, {
		key: validateDependencies,
		value: function value() {
			if (!this._database) {
				throw new Error("Cannot find models without a database set.");
			}
		}
	}]);

	return ModelFinder;
})();

exports["default"] = ModelFinder;

var ModelQuery = (function () {
	function ModelQuery(database) {
		_classCallCheck(this, ModelQuery);

		this._database = database;
	}

	_createClass(ModelQuery, [{
		key: "find",
		value: function find(ModelConstructor) {
			this.ModelConstructor = ModelConstructor;

			var tempModel = new this.ModelConstructor();

			this._query = this._database.select("*").from(tempModel.tableName);

			return this;
		}
	}, {
		key: "count",
		value: function count(ModelConstructor) {
			this.ModelConstructor = ModelConstructor;
			this.countResults = true;

			var tempModel = new this.ModelConstructor();

			this._query = this._database.select(null).count("* AS rowCount").from(tempModel.tableName);

			return this;
		}
	}, {
		key: "where",
		value: function where() {
			var _query;

			for (var _len = arguments.length, options = Array(_len), _key = 0; _key < _len; _key++) {
				options[_key] = arguments[_key];
			}

			var formattedOptions = options.map(function (option, index) {
				if (typeof option === "string" && index === 0) {
					return (0, _jargon2["default"])(option).snake.toString();
				} else {
					return option;
				}
			});

			(_query = this._query).where.apply(_query, _toConsumableArray(formattedOptions));
			return this;
		}
	}, {
		key: "andWhere",
		value: function andWhere() {
			var _query2;

			(_query2 = this._query).andWhere.apply(_query2, arguments);
			return this;
		}
	}, {
		key: "orWhere",
		value: function orWhere() {
			var _query3;

			(_query3 = this._query).orWhere.apply(_query3, arguments);
			return this;
		}
	}, {
		key: "groupBy",
		value: function groupBy() {
			var _query4;

			(_query4 = this._query).groupBy.apply(_query4, arguments);
			return this;
		}
	}, {
		key: "orderBy",
		value: function orderBy() {
			var _query5;

			(_query5 = this._query).orderBy.apply(_query5, arguments);
			return this;
		}
	}, {
		key: "limit",
		value: function limit() {
			var _query6;

			(_query6 = this._query).limit.apply(_query6, arguments);
			return this;
		}
	}, {
		key: "results",
		value: function results(callback) {
			var _this = this;

			this._query.results(function (error, rows) {
				if (!rows) {
					if (error) {
						return callback(error);
					} else {
						return callback(new Error("No rows returned by database."));
					}
				}

				if (_this.countResults) {
					callback(error, rows[0].rowCount);
				} else {
					(function () {
						var models = new _collectionJs2["default"](_this.ModelConstructor);

						rows.forEach(function (row) {
							models.push(new _this.ModelConstructor(row));
						});

						callback(error, models);
					})();
				}
			});
		}
	}]);

	return ModelQuery;
})();

exports.ModelQuery = ModelQuery;