/* Dependencies */
import inflect from "jargon";
import privateData from "incognito";

/* Private Symbols */
const attributesToColumns = Symbol(),
			newQuery = Symbol();

export default class ModelFinder {
	constructor(database) {
		privateData(this).database = database;
	}

	find(ModelConstructor) {
		const query = this[newQuery](ModelConstructor);

		query.find;

		return query;
	}

	count(ModelConstructor) {
		const query = this[newQuery](ModelConstructor);

		query.count;

		return query;
	}

	mock(ModelConstructor) {
		const query = this[newQuery](ModelConstructor);

		query.mock;

		return query;
	}

	[newQuery](ModelConstructor) {
		return new ModelQuery(ModelConstructor, {
			database: privateData(this).database
		});
	}
}

const addChain = Symbol(),
			addMock = Symbol(),
			validateDependencies = Symbol(),
			argumentString = Symbol(),
			callDatabase = Symbol(),
			argumentsEqual = Symbol();

export class ModelQuery {
	constructor(ModelConstructor, options) {
		const _ = privateData(this);

		_.ModelConstructor = ModelConstructor;
		_.database = options.database;
		_.chain = [];

		_.ModelConstructor.mocks = _.ModelConstructor.mocks || {};
	}

	get mock() {
		privateData(this).isMockDefinition = true;
		return this;
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
			".whereNull",
			".whereNotNull",
			".groupBy",
			".orderBy",
			".limit"
		].forEach((name) => {
			_.chain.forEach((link) => {
				const linkName = link.name;
				const linkOptions = link.options;

				if (name === linkName) {
					chainString = chainString + linkName;
					if (linkOptions) {
						chainString = `${chainString}(${this[argumentString](linkOptions)})`;
					}
				}
			});
		});

		return chainString;
	}

	equalTo(query) {
		const ourChain = this.chain;
		const theirChain = query.chain;

		let isEqual = true;

		if (ourChain.length === theirChain.length) {

			for (let ourIndex = 0; ourIndex < ourChain.length; ourIndex++) {

				const ourLink = ourChain[ourIndex];
				const ourArguments = ourLink.options;

				let hasMatchingLink = false;

				for (let theirIndex = 0; theirIndex < theirChain.length; theirIndex++) {
					const theirLink = theirChain[theirIndex];
					const theirArguments = theirLink.options;

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

	get find() {
		const _ = privateData(this);

		const tempModel = new _.ModelConstructor();

		if (_.database) {
			_.query = _.database
				.select("*")
				.from(tempModel.tableName);
		}

		this[addChain](".find");

		if (_.ModelConstructor.useSoftDelete !== undefined) {
			this.whereNull("deletedAt");
		}

		return this;
	}

	get count() {
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

		if (_.ModelConstructor.useSoftDelete !== undefined) {
			this.whereNull("deletedAt");
		}

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

	whereNull(...options) {
		const formattedOptions = this[attributesToColumns](...options);
		const _ = privateData(this);
		if (_.query) {
			_.query.whereNull(...formattedOptions);
		}
		this[addChain](`.whereNull`, options);
		return this;
	}

	whereNotNull(...options) {
		const formattedOptions = this[attributesToColumns](...options);
		const _ = privateData(this);
		if (_.query) {
			_.query.whereNotNull(...formattedOptions);
		}
		this[addChain](`.whereNotNull`, options);
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
		if (_.query) {
			_.query.limit(...options);
		}
		this[addChain](`.limit`, options);
		return this;
	}

	results(callbackOrMockValue) {
		const _ = privateData(this);

		if (_.isMockDefinition) {
			const mockValue = callbackOrMockValue;

			this[addMock](this.toString(), mockValue);
		} else {
			const callback = callbackOrMockValue;

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
	}

	[addMock](mockIdentifier, mockValue) {
		privateData(this).ModelConstructor.mocks[mockIdentifier] = {
			query: this,
			value: mockValue
		};
	}

	[validateDependencies] () {
		if (!privateData(this).database) { throw new Error("Cannot find models without a database set."); }
	}

	[addChain](chainName, options) {
		privateData(this).chain.push({
			name: chainName,
			options: options
		});
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
				if (_.returnOneRecord) {
					const model = new _.ModelConstructor(rows[0]);

					callback(error, model);
				} else {
					const models = new Collection(_.ModelConstructor);

					rows.forEach(row => {
						models.push(new _.ModelConstructor(row));
					});

					callback(error, models);
				}
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
