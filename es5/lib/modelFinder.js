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

/* Private Symbols */

var _collectionJs = require("./collection.js");

var _collectionJs2 = _interopRequireDefault(_collectionJs);

var attributesToColumns = Symbol(),
    newQuery = Symbol();

var ModelFinder = (function () {
	function ModelFinder(database) {
		_classCallCheck(this, ModelFinder);

		(0, _incognito2["default"])(this).database = database;
	}

	_createClass(ModelFinder, [{
		key: "find",
		value: function find(ModelConstructor) {
			var query = this[newQuery](ModelConstructor);

			query.find;

			return query;
		}
	}, {
		key: "count",
		value: function count(ModelConstructor) {
			var query = this[newQuery](ModelConstructor);

			query.count;

			return query;
		}
	}, {
		key: "mock",
		value: function mock(ModelConstructor) {
			var query = this[newQuery](ModelConstructor);

			query.mock;

			return query;
		}
	}, {
		key: newQuery,
		value: function value(ModelConstructor) {
			return new ModelQuery(ModelConstructor, {
				database: (0, _incognito2["default"])(this).database
			});
		}
	}]);

	return ModelFinder;
})();

exports["default"] = ModelFinder;

var addChain = Symbol(),
    addMock = Symbol(),
    validateDependencies = Symbol(),
    argumentString = Symbol(),
    callDatabase = Symbol(),
    argumentsEqual = Symbol();

var ModelQuery = (function () {
	function ModelQuery(ModelConstructor, options) {
		_classCallCheck(this, ModelQuery);

		var _ = (0, _incognito2["default"])(this);

		_.ModelConstructor = ModelConstructor;
		_.database = options.database;
		_.chain = [];

		_.ModelConstructor.mocks = _.ModelConstructor.mocks || {};
	}

	_createClass(ModelQuery, [{
		key: "toString",
		value: function toString() {
			var _this = this;

			var _ = (0, _incognito2["default"])(this);

			var chainString = _.ModelConstructor.name;

			[".find", ".count", ".all", ".one", ".where", ".andWhere", ".orWhere", ".whereNull", ".whereNotNull", ".groupBy", ".orderBy", ".limit"].forEach(function (name) {
				_.chain.forEach(function (link) {
					var linkName = link.name;
					var linkOptions = link.options;

					if (name === linkName) {
						chainString = chainString + linkName;
						if (linkOptions) {
							chainString = chainString + "(" + _this[argumentString](linkOptions) + ")";
						}
					}
				});
			});

			return chainString;
		}
	}, {
		key: "equalTo",
		value: function equalTo(query) {
			var ourChain = this.chain;
			var theirChain = query.chain;

			var isEqual = true;

			if (ourChain.length === theirChain.length) {

				for (var ourIndex = 0; ourIndex < ourChain.length; ourIndex++) {

					var ourLink = ourChain[ourIndex];
					var ourArguments = ourLink.options;

					var hasMatchingLink = false;

					for (var theirIndex = 0; theirIndex < theirChain.length; theirIndex++) {
						var theirLink = theirChain[theirIndex];
						var theirArguments = theirLink.options;

						if (ourLink.name === theirLink.name) {
							if (this[argumentsEqual](ourArguments, theirArguments)) {
								hasMatchingLink = true;
								break;
							}
						}
					}

					if (!hasMatchingLink) {
						isEqual = false;
						break;
					}
				}
			} else {
				isEqual = false;
			}

			return isEqual;
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
		key: "whereNull",
		value: function whereNull() {
			for (var _len4 = arguments.length, options = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
				options[_key4] = arguments[_key4];
			}

			var formattedOptions = this[attributesToColumns].apply(this, options);
			var _ = (0, _incognito2["default"])(this);
			if (_.query) {
				var _$query4;

				(_$query4 = _.query).whereNull.apply(_$query4, _toConsumableArray(formattedOptions));
			}
			this[addChain](".whereNull", options);
			return this;
		}
	}, {
		key: "whereNotNull",
		value: function whereNotNull() {
			for (var _len5 = arguments.length, options = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
				options[_key5] = arguments[_key5];
			}

			var formattedOptions = this[attributesToColumns].apply(this, options);
			var _ = (0, _incognito2["default"])(this);
			if (_.query) {
				var _$query5;

				(_$query5 = _.query).whereNotNull.apply(_$query5, _toConsumableArray(formattedOptions));
			}
			this[addChain](".whereNotNull", options);
			return this;
		}
	}, {
		key: "groupBy",
		value: function groupBy() {
			for (var _len6 = arguments.length, options = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
				options[_key6] = arguments[_key6];
			}

			var formattedOptions = this[attributesToColumns].apply(this, options);
			var _ = (0, _incognito2["default"])(this);
			if (_.query) {
				var _$query6;

				(_$query6 = _.query).groupBy.apply(_$query6, _toConsumableArray(formattedOptions));
			}
			this[addChain](".groupBy", options);
			return this;
		}
	}, {
		key: "orderBy",
		value: function orderBy() {
			for (var _len7 = arguments.length, options = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
				options[_key7] = arguments[_key7];
			}

			var formattedOptions = this[attributesToColumns].apply(this, options);
			var _ = (0, _incognito2["default"])(this);
			if (_.query) {
				var _$query7;

				(_$query7 = _.query).orderBy.apply(_$query7, _toConsumableArray(formattedOptions));
			}
			this[addChain](".orderBy", options);
			return this;
		}
	}, {
		key: "limit",
		value: function limit() {
			var _ = (0, _incognito2["default"])(this);

			for (var _len8 = arguments.length, options = Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
				options[_key8] = arguments[_key8];
			}

			if (_.query) {
				var _$query8;

				(_$query8 = _.query).limit.apply(_$query8, options);
			}
			this[addChain](".limit", options);
			return this;
		}
	}, {
		key: "results",
		value: function results(callbackOrMockValue) {
			var _ = (0, _incognito2["default"])(this);

			if (_.isMockDefinition) {
				var mockValue = callbackOrMockValue;

				this[addMock](this.toString(), mockValue);
			} else {
				var callback = callbackOrMockValue;

				var useMock = false;
				var mockValue = undefined;

				for (var chainString in _.ModelConstructor.mocks) {
					var mock = _.ModelConstructor.mocks[chainString];
					if (this.equalTo(mock.query)) {
						useMock = true;
						mockValue = mock.value;
						break;
					}
				}

				if (useMock) {
					callback(null, mockValue);
				} else {
					this[callDatabase](callback);
				}
			}
		}
	}, {
		key: addMock,
		value: function value(mockIdentifier, mockValue) {
			(0, _incognito2["default"])(this).ModelConstructor.mocks[mockIdentifier] = {
				query: this,
				value: mockValue
			};
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
			(0, _incognito2["default"])(this).chain.push({
				name: chainName,
				options: options
			});
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
					if (_.returnOneRecord) {
						var model = new _.ModelConstructor(rows[0]);

						callback(error, model);
					} else {
						(function () {
							var models = new _collectionJs2["default"](_.ModelConstructor);

							rows.forEach(function (row) {
								models.push(new _.ModelConstructor(row));
							});

							callback(error, models);
						})();
					}
				}
			});
		}
	}, {
		key: attributesToColumns,
		value: function value() {
			for (var _len9 = arguments.length, options = Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
				options[_key9] = arguments[_key9];
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
		key: argumentsEqual,
		value: function value(argumentsA, argumentsB) {
			if (argumentsA === argumentsB) {
				return true;
			} else {
				if (argumentsA.length === argumentsB.length) {
					var index = argumentsA.length;
					while (index--) {
						var argumentA = argumentsA[index];
						var argumentB = argumentsB[index];

						if (argumentA !== argumentB) {
							if (argumentA instanceof RegExp) {
								if (argumentB.toString().match(argumentA) === null) {
									return false;
								}
							} else if (argumentB instanceof RegExp) {
								if (argumentA.toString().match(argumentB) === null) {
									return false;
								}
							} else {
								return false;
							}
						}
					}
					return true;
				} else {
					return false;
				}
			}
		}
	}, {
		key: "mock",
		get: function get() {
			(0, _incognito2["default"])(this).isMockDefinition = true;
			return this;
		}
	}, {
		key: "chain",
		get: function get() {
			return (0, _incognito2["default"])(this).chain;
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
	}, {
		key: "find",
		get: function get() {
			var _ = (0, _incognito2["default"])(this);

			var tempModel = new _.ModelConstructor();

			if (_.database) {
				_.query = _.database.select("*").from(tempModel.tableName);
			}

			this[addChain](".find");

			if (_.ModelConstructor.useSoftDelete !== undefined) {
				this.whereNull("deletedAt");
			}

			return this;
		}
	}, {
		key: "count",
		get: function get() {
			var _ = (0, _incognito2["default"])(this);

			this.countResults = true;

			var tempModel = new _.ModelConstructor();

			if (_.database) {
				_.query = _.database.select(null).count("* AS rowCount").from(tempModel.tableName);
			}

			this[addChain](".count");

			if (_.ModelConstructor.useSoftDelete !== undefined) {
				this.whereNull("deletedAt");
			}

			return this;
		}
	}]);

	return ModelQuery;
})();

exports.ModelQuery = ModelQuery;