const validateDependencies = Symbol();
import inflect from "jargon";

export default class ModelFinder {
	constructor(database) {
		Object.defineProperties(this, {
			"_database": {
				value: database,
				writable: true,
				enumerable: false
			}
		});
	}

	find(ModelConstructor) {
		this[validateDependencies]();

		const query = new ModelQuery(this._database);

		query.find(ModelConstructor);

		return query;
	}

	count(ModelConstructor) {
		this[validateDependencies]();

		const query = new ModelQuery(this._database);

		query.count(ModelConstructor);

		return query;
	}

	[validateDependencies] () {
		if (!this._database) { throw new Error("Cannot find models without a database set."); }
	}
}

export class ModelQuery {
	constructor(database) {
		this._database = database;
	}

	find(ModelConstructor) {
		this.ModelConstructor = ModelConstructor;

		const tempModel = new this.ModelConstructor();

		this._query = this._database
			.select("*")
			.from(tempModel.tableName);

		return this;
	}

	count(ModelConstructor) {
		this.ModelConstructor = ModelConstructor;
		this.countResults = true;

		const tempModel = new this.ModelConstructor();

		this._query = this._database
			.select(null)
			.count("* AS rowCount")
			.from(tempModel.tableName);

		return this;
	}

	where(...options) {
		const formattedOptions = options.map((option, index) => {
			if (typeof option === "string" && index === 0) {
				return inflect(option).snake.toString();
			} else {
				return option;
			}
		});

		this._query.where(...formattedOptions);
		return this;
	}

	andWhere(...options) {
		this._query.andWhere(...options);
		return this;
	}

	orWhere(...options) {
		this._query.orWhere(...options);
		return this;
	}

	groupBy(...options) {
		this._query.groupBy(...options);
		return this;
	}

	orderBy(...options) {
		this._query.orderBy(...options);
		return this;
	}

	limit(...options) {
		this._query.limit(...options);
		return this;
	}

	results(callback) {
		this._query.results((error, rows) => {
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
				const models = new Collection(this.ModelConstructor);

				rows.forEach(row => {
					models.push(new this.ModelConstructor(row));
				});

				callback(error, models);
			}
		});
	}
}

import Collection from "./collection.js";
