import inflect from "jargon";

export default class Collection extends Array {
	constructor (initialData) {
		super();

		let association = null,
			modelConstructor = null;

		if(initialData
			&& (typeof initialData === "function")) {
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

	push(...models) {
		models.forEach(model => {
			if (this.indexOf(model) === -1) {
				if(this.association) {
					super.push(model);
					const pluralForeignName = inflect(this.association.foreignName).plural.toString();
					if (model.hasOwnProperty(this.association.foreignName)) {
						if (model[this.association.foreignName] !== this.association.parent) {
							model[this.association.foreignName] = this.association.parent;
						}
					} else if(model.hasOwnProperty(pluralForeignName)) {
						model[pluralForeignName].push(this.association.parent);
					}
				} else {
					if(model instanceof this._modelConstructor) {
						super.push(model);
					} else {
						let modelName;
						if(model && model.constructor) {
							modelName = model.constructor.name;
						} else {
							modelName = model;
						}

						throw new TypeError(`The model ${modelName} is not an instance of ${this._modelConstructor.name}, therefore, it cannot be pushed to this collection.`);
					}
				}
			}
		}, this);
	}

	fetch(callback) {
		function processWhereCondition(value) {
			if (typeof value === "string") {
				const snakeCasedValue = inflect(value).snake.toString();
				return snakeCasedValue;
			} else {
				return value;
			}
		}

		if(this.association) {
			const modelFinder = new ModelFinder(this.association.constructor.database);

			const query = modelFinder
				.find(this.association.constructor);

			if (this.association.as) {
				query
					.where(`${this.association.as}_id`, "=", this.association.parent.id)
					.andWhere(`${this.association.as}_type`, "=", this.association.parent.constructor.name);
			} else {
				query.where(this.association.foreignKey, "=", this.association.parent.id);
			}


			if (this.association.where) {
				const processedWhereConditions = this.association.where.map(processWhereCondition);
				let self = this;
				query.andWhere(function () {
					this.where(...processedWhereConditions);

					if (Array.isArray(self.association.andWhere)) {
						self.association.andWhere.forEach((whereConditions) => {
							const processedAndWhereItem = whereConditions.map(processWhereCondition);
							this.andWhere(...processedAndWhereItem);
						});
					}
				});
			}

			query.results((error, models) => {
				this.splice(0, this.length);
				models.forEach((model) => {
					this.push(model);
				});
				callback(error);
			});
		} else {
			throw new Error("Cannot fetch collection without an association set. Call Model.all instead.");
		}
	}
}

import ModelFinder from "./modelFinder.js";
