/* Dependencies */
import inflect from "jargon";
import privateData from "incognito";

/* Private Symbols */
const attributesToColumns = Symbol();

export default class ModelFinder {
	constructor(database) {
		privateData(this).database = database;
	}

	find(ModelConstructor) {
		const query = new ModelQuery(ModelConstructor, {
			database: privateData(this).database
		});
		query.find();

		return query;
	}

	count(ModelConstructor) {
		const query = new ModelQuery(ModelConstructor, {
			database: privateData(this).database
		});
		query.count();

		return query;
	}
}

const addChain = Symbol(),
			validateDependencies = Symbol(),
			argumentString = Symbol(),
			callDatabase = Symbol(),
			argumentsEqual = Symbol();

export class ModelQuery {
	constructor(ModelConstructor, options) {
		const _ = privateData(this);

		_.ModelConstructor = ModelConstructor;
		_.database = options.database;
		_.chain = {};

		_.ModelConstructor.mocks = _.ModelConstructor.mocks || {};
	}

	toString() {
		const _ = privateData(this);

		let chainString = _.ModelConstructor.name;

		[
			".find",
			".count",
			".all",
			".one",
			".where",
			".andWhere",
			".orWhere",
			".groupBy",
			".orderBy",
			".limit"
		].forEach((chainName) => {
			if (_.chain.hasOwnProperty(chainName)) {
				chainString = chainString + chainName;
				const options = _.chain[chainName];

				if (options) {
					chainString = `${chainString}(${this[argumentString](options)})`;
				}
			}
		});

		return chainString;
	}

	mockResults(mockValue) {
		const _ = privateData(this);

		_.ModelConstructor.mocks[this.toString()] = {
			query: this,
			value: mockValue
		};

		return this;
	}

	equalTo(query) {
		const ourChain = this.chain;
		const theirChain = query.chain;

		const ourChainNames = Object.keys(ourChain);
		const theirChainNames = Object.keys(theirChain);

		const ourChainLength = ourChainNames.length;
		const theirChainLength = theirChainNames.length;

		let isEqual = true;

		if (ourChainLength === theirChainLength) {
			for (let chainName in ourChain) {
				if (theirChain.hasOwnProperty(chainName)) {
					const ourArguments = ourChain[chainName];
					const theirArguments = theirChain[chainName];

					if (!this[argumentsEqual](ourArguments, theirArguments)) {
						isEqual = false;
						break;
					}
				} else {
					isEqual = false;
					break;
				}
			}
		} else {
			isEqual = false;
		}

		return isEqual;
	}

	get chain() {
		return privateData(this).chain;
	}

	get one() {
		const _ = privateData(this);

		_.returnOneRecord = true;

		this[addChain](".one");

		return this;
	}

	get deleted() {
		privateData(this)
			.query
			.whereNotNull(
				inflect("deletedAt").snake.toString()
			);

		this[addChain](".deleted");

		return this;
	}

	get all() {
		this[addChain](".all");

		return this;
	}

	find() {
		const _ = privateData(this);

		const tempModel = new _.ModelConstructor();

		if (_.database) {
			_.query = _.database
				.select("*")
				.from(tempModel.tableName);
		}

		this[addChain](".find");

		return this;
	}

	count() {
		const _ = privateData(this);

		this.countResults = true;

		const tempModel = new _.ModelConstructor();

		if (_.database) {
			_.query = _.database
				.select(null)
				.count("* AS rowCount")
				.from(tempModel.tableName);
		}

		this[addChain](".count");

		return this;
	}

	where(...options) {
		const formattedOptions = this[attributesToColumns](...options);
		const _ = privateData(this);
		if (_.query) {
			_.query.where(...formattedOptions);
		}
		this[addChain](`.where`, options);
		return this;
	}

	andWhere(...options) {
		const formattedOptions = this[attributesToColumns](...options);
		const _ = privateData(this);
		if (_.query) {
				_.query.andWhere(...formattedOptions);
		}
		this[addChain](`.andWhere`, options);
		return this;
	}

	orWhere(...options) {
		const formattedOptions = this[attributesToColumns](...options);
		const _ = privateData(this);
		if (_.query) {
			_.query.orWhere(...formattedOptions);
		}
		this[addChain](`.orWhere`, options);
		return this;
	}

	groupBy(...options) {
		const formattedOptions = this[attributesToColumns](...options);
		const _ = privateData(this);
		if (_.query) {
			_.query.groupBy(...formattedOptions);
		}
		this[addChain](`.groupBy`, options);
		return this;
	}

	orderBy(...options) {
		const formattedOptions = this[attributesToColumns](...options);
		const _ = privateData(this);
		if (_.query) {
			_.query.orderBy(...formattedOptions);
		}
		this[addChain](`.orderBy`, options);
		return this;
	}

	limit(...options) {
		const _ = privateData(this);
		_.returnOneRecord = false;
		if (_.query) {
			_.query.limit(...options);
		}
		this[addChain](`.limit`, options);
		return this;
	}

	results(callback) {
		const _ = privateData(this);

		let useMock = false;
		let mockValue;

		for (let chainString in _.ModelConstructor.mocks) {
			const mock = _.ModelConstructor.mocks[chainString];
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

	[validateDependencies] () {
		if (!privateData(this).database) { throw new Error("Cannot find models without a database set."); }
	}

	[addChain](chainName, options) {
		privateData(this).chain[chainName] = options;
	}

	[argumentString](options) {
		let newOptions = [];
		options.forEach((option) => {
			let newOption;
			if (typeof option === "string") {
				newOption = `"${option}"`;
			} else {
				newOption = option.toString();
			}
			newOptions.push(newOption);
		});
		return newOptions.join(", ");
	}

	[callDatabase](callback) {
		const _ = privateData(this);

		this[validateDependencies]();

		if(_.returnOneRecord) {
			this.limit(1);
		}

		_.query.results((error, rows) => {
			if(!rows) {
				if(error) {
					return callback(error);
				} else {
					return callback(new Error("No rows returned by database."));
				}
			}

			if (this.countResults) {
				callback(error, rows[0].rowCount);
			} else {
				const models = new Collection(_.ModelConstructor);

				rows.forEach(row => {
					models.push(new _.ModelConstructor(row));
				});

				callback(error, models);
			}
		});
	}

	[attributesToColumns](...options) {
		return options.map((option, index) => {
			if (typeof option === "string" && index === 0) {
				return inflect(option).snake.toString();
			} else {
				return option;
			}
		});
	}

	[argumentsEqual](argumentsA, argumentsB) {
		if (argumentsA === argumentsB) {
			return true;
		} else {
			if (argumentsA.length === argumentsB.length) {
				let index = argumentsA.length;
				while (index--) {
					const argumentA = argumentsA[index];
					const argumentB = argumentsB[index];

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
}

import Collection from "./collection.js";
