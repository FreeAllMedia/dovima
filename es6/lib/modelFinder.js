/* Dependencies */
import inflect from "jargon";
import privateData from "incognito";
import util from "util";

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
			callDatabase = Symbol();

export class ModelQuery {
	constructor(ModelConstructor, options) {
		const _ = privateData(this);

		_.ModelConstructor = ModelConstructor;
		_.database = options.database;
		_.chain = {};

		ModelConstructor.mocks = ModelConstructor.mocks || {};
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
			".limit",
			".groupBy",
			".orderBy"
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

		const mockString = this.toString();

		_.ModelConstructor.mocks[mockString] = mockValue;

		return this;
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

		const mockString = this.toString();
		const mockValue = _.ModelConstructor.mocks[mockString];

		if (mockValue) {
			callback(null, mockValue);
		} else {
			this[callDatabase](callback);
		}
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
}

import Collection from "./collection.js";
