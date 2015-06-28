import inflect from "jargon";

export default class Collection extends Array {
	constructor (initialData) {
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
					//proceed with the regular push
					super.push(model);
					//set inverse relationship
					const pluralForeignName = inflect(this.association.foreignName).plural.toString();
					if(model.hasOwnProperty(this.association.foreignName)) {
						if (model[this.association.foreignName] !== this.association.parent) {
							model[this.association.foreignName] = this.association.parent;
						}
					} else if(model.hasOwnProperty(pluralForeignName)) {
						model[pluralForeignName].push(this.association.parent);
					}
					//if it has through, create the intermediate model
					if(this.association.through) {
						//get through association
						let throughAssociation = this.association.parent.associations[this.association.through];
						if(!throughAssociation) {
							let modelName;
							if(model && model.constructor) {
								modelName = model.constructor.name;
							} else {
								modelName = model;
							}
							throw new Error(`Through association called ${this.association.through} not defined on model ${modelName}`);
						}

						//lookup if there is an existing through model... how?
						let throughModel = new throughAssociation.constructor();
						console.log("assigning 2", {model: model, as: this.association.foreignName, on: throughModel.constructor.name});
						throughModel[this.association.foreignName] = this.association.parent;

						// let throughAssociationPropertyName = model.associations[throughAssociationNameOnModel].foreignName;
						// throughModel[this.association.foreignName] = this.association.parent;
						// throughModel[throughAssociationPropertyName] = model;
						//HERE I WILL NEED THE RELATIONSHIP BETWEEN MODEL and THROUGH MODEL...
						//throughModel[this.association.parent.foreignName] = this.association.parent;
						//this.association.p
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

						throw TypeError(`The model ${modelName} is not an instance of ${this._modelConstructor.name}, therefore, it cannot be pushed to this collection.`);
					}
				}
			}
		}, this);
	}

	fetch(callback) {
		if(this.association) {
			const modelFinder = new ModelFinder(this.association.constructor.database);

			const query = modelFinder
				.find(this.association.constructor)
				.where(this.association.foreignKey, "=", this.association.parent.id);

			function processWhereCondition(value) {
				if (typeof value === "string") {
					const snakeCasedValue = inflect(value).snake.toString();
					return snakeCasedValue;
				} else {
					return value;
				}
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
import Model from "./model.js";
