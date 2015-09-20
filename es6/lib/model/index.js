/* Component Dependencies */
//
import flowsync from "flowsync";
import Datetime from "fleming";
import inflect from "jargon";
import privateData from "incognito";

import symbols from "./symbols";

// TODO: Remove superfluous underscores from private data. _._validations should be _.validations

/**
 * @class Model
 */
export default class Model {
	/**
	 * @param {Object.<String,*>} [initialAttributes] Provide default values for attributes by passing a Key-Value Object.
	 * @constructor
	 */
	constructor(initialAttributes, options) {
		const _ = privateData(this);
		_._validations = {};
		_._associations = {};
		_._includeAssociations = [];
		_._tableName = null;
		_._primaryKey = null;
		_._softDelete = null;

		if(options !== undefined) {
			_._database = options.database;
		}

		/**
		 * Define dynamic properties
		 */
		Object.defineProperties(this, {

			"isNew": {
				get: this[symbols.isNew]
			},

			"attributes": {
				get: this[symbols.attributes],
				set: this[symbols.setAttributes]
			},

			"associations": {
				get: this[symbols.associations]
			},

			"properties": {
				get: this[symbols.properties]
			},

			"validations": {
				get: this[symbols.validations]
			},

			"tableName": {
				get: () => {
					return _._tableName || inflect(this.constructor.name).plural.snake.toString();
				},
				set: (newTableName) => {
					_._tableName = newTableName;
				}
			},

			"primaryKey": {
				get: () => {
					return _._primaryKey || "id";
				},
				set: (newPrimaryKey) => {
					_._primaryKey = newPrimaryKey;
				}
			},

			"softDelete": {
				get: () => {
					_._softDelete = true;
				}
			}
		});

		this.associate();
		this.validate();

		this[symbols.setAttributes](initialAttributes);

		this.initialize();
	}

	/**
	 * STATIC INTERFACE
	 */

	static get database() {
		let database = this._database;
		if(!database) {
			database = Model._database;
		}
		return database;
	}

	static set database(newDatabase) {
		this._database = newDatabase;
	}

	static get find() {
		let modelQuery = new ModelFinder(this.database);
		return modelQuery.find(this);
	}

	static get count() {
		let modelQuery = new ModelFinder(this.database);
		return modelQuery.count(this);
	}

	/**
	 * INSTANCE INTERFACE
	 */

	hasOne(associationName, associationConstructor) {
		return this[symbols.addAssociation]({
			name: associationName,
			constructor: associationConstructor,
			type: "hasOne"
		});
	}

	belongsTo(associationName, associationConstructor) {
		return this[symbols.addAssociation]({
			name: associationName,
			constructor: associationConstructor,
			type: "belongsTo"
		});
	}

	hasMany(associationName, associationConstructor) {
		return this[symbols.addAssociation]({
			name: associationName,
			constructor: associationConstructor,
			type: "hasMany"
		});
	}

	ensure(attributeName, validatorFunction, validatorMessage) {
		const _ = privateData(this);
		_._validations[attributeName] = _._validations[attributeName] || [];

		let validatorDetails = {validator: validatorFunction};

		if (validatorMessage) { validatorDetails.message = validatorMessage; }

		_._validations[attributeName].push(validatorDetails);
	}

	/**
	 * Return a boolean indicating whether the model is valid or not.
	 *
	 * @method isValid
	 * @param	{Function(boolean)} callback Callback returning the boolean.
	 */
	isValid(callback) {
		this.invalidAttributes((invalidAttributeList) => {
			callback(Object.keys(invalidAttributeList).length === 0);
		});
	}

	/**
	 * Return an object containing all invalid attributes and their errors.
	 *
	 * @example
	 * ```
	 * model.invalidAttributes((invalidAttributeList) => {
	 *	 console.log(invalidAttributeList); // {"name":["Cannot contain special characters", "Cannot contain numbers"], "age":["Cannot be under 18"]}
	 * });
	 * ```
	 *
	 * @method invalidAttributes
	 * @param	{Function(invalidAttributeList)} callback Callback returning the invalid attribute list.
	 */
	invalidAttributes(callback) {
		const _ = privateData(this);
		const attributeNamesWithValidators = Object.keys(_._validations);

		const compileInvalidAttributeList = (errors, validatorMessages) => {
			if (errors) {
				throw errors;
			} else {
				let invalidAttributeList = {};

				for(var index = 0; index < attributeNamesWithValidators.length; index++){
					const invalidMessages = validatorMessages[index];

					if (invalidMessages.length > 0) {
						const attributeName = attributeNamesWithValidators[index];
						invalidAttributeList[attributeName] = invalidMessages;
					}
				}

				callback(invalidAttributeList);
			}
		};

		const performValidationsForAttribute = (attributeName, done) => {
			const attributeValidations = _._validations[attributeName];

			const performValidation = (validation, returnValue) => {
				const validator = validation.validator;

				validator.call(this, attributeName, (error, validatorDetails) => {
					if (validatorDetails.result) {
						returnValue(null, null);
					} else {
						returnValue(null, validation.message || validatorDetails.message);
					}
				});
			};

			const compileValidatorResponses = (error, invalidMessages) => {
				const cleanedMessages = [];
				// Trick to remove falsy values from an array
				for(let message of invalidMessages){
					message && cleanedMessages.push(message);
				}
				done(null, cleanedMessages);
			};

			flowsync.mapParallel(
				attributeValidations,
				performValidation,
				compileValidatorResponses
			);
		};

		flowsync.mapParallel(
			attributeNamesWithValidators,
			performValidationsForAttribute,
			compileInvalidAttributeList
		);
	}

	include(...associationNames) {
		privateData(this)._includeAssociations = associationNames;
		return this;
	}

	/* Stubbed methods for hooks */
	beforeValidation(callback) {
		callback();
	}

	beforeSave(callback) {
		callback();
	}

	afterSave(callback) {
		callback();
	}

	beforeDelete(callback) {
		callback();
	}

	afterDelete(callback) {
		callback();
	}

	associate() {}

	validate() {}

	initialize() {}

	toJSON() {
		return this.attributes;
	}

	/**
	 * Private Functionality
	 */
	[symbols.getDatabase]() {
		let database = privateData(this)._database;
		if(!database) {
			database = this.constructor.database;
		}
		return database;
	}

	[symbols.setAttributes](newAttributes) {
		this[symbols.parseAttributesFromFields](newAttributes);
	}

	[symbols.associations]() {
		return privateData(this)._associations;
	}

	[symbols.properties]() {
		return Object.keys(this);
	}

	[symbols.validations]() {
		return privateData(this)._validations;
	}

	[symbols.attributes]() {
		var attributes = {};
		this.properties.forEach((propertyName) => {
			if(!privateData(this)._associations[propertyName]) {
				attributes[propertyName] = this[propertyName];
			}
		});
		return attributes;
	}

	[symbols.isNew]() {
		if (this[this.primaryKey]) {
			return false;
		} else {
			return true;
		}
	}

	/**
	 * Call a function deeply through all associations
	 *
	 * @private
	 * @method callDeep
	 * @param {String} functionName The name of the function that you want to fire deeply.
	 * @param {function(errors, results)} Function called at the end of the operation.
	 */
	[symbols.callDeep] (methodName, predicate, callback) {
		const associationNames = Object.keys(this.associations);

		flowsync.mapParallel(
			associationNames,
			(associationName, next) => {

				const associationDetails = this.associations[associationName];

				switch(associationDetails.type) {
					case "belongsTo":
					case "hasOne":
						const model = this[associationName];
						if(model) {
							//pass the associationDetails.whereArgs to the function
							const result = predicate(associationDetails);
							if(result) {
								model[methodName](next);
							} else {
								next();
							}
						} else {
							next();
						}
						break;

					case "hasMany":
						const collection = this[associationName];
						//collection set, and not many to many (nothing in that case)
						if (collection) {
							//let array = [].slice.call(collection);
							flowsync.eachParallel(
								collection,
								(collectionModel, finishSubStep) => {
									const result = predicate(associationDetails);
									if(result) {
										collectionModel[methodName](finishSubStep);
									} else {
										next();
									}
								},
								next
							);
						} else {
							next(); //collection not set
						}
						break;
				}
			}, (errors, results) => {
				callback(errors, results);
			}
		);
	}

	[symbols.parseAttributesFromFields](record) {
		for (var field in record) {
			this[inflect(field).camel.toString()] = record[field];
		}
	}

	[symbols.getFieldAttributes]() {
		let attributeNames = Object.keys(this.attributes);
		let fieldAttributes = {};
		attributeNames.forEach((attributeName) => {
			fieldAttributes[inflect(attributeName).snake.toString()] = this[attributeName];
		});

		const _ = privateData(this);

		//add belongsTo associations and remove others
		Object.keys(this.associations).forEach((associationName) => {
			let relatedModel = this[associationName];
			let foreignKeyField = inflect(associationName).foreignKey.toString();
			if(_._associations[associationName].type === "belongsTo") {
				//try with relatedModel and relatedModel.id
				if(relatedModel && relatedModel.id) {
					fieldAttributes[foreignKeyField] = relatedModel.id;
				} else {
					//or just with the relatedModelId
					//construct the snake with _id and then camelize it
					let foreignIdAsAttribute = inflect(foreignKeyField).camel.toString();
					fieldAttributes[foreignKeyField] = this[foreignIdAsAttribute];
				}
			} else {
				//console.log("getFieldAttributes delete on ", {on: this.constructor.name, associationName: associationName, foreignKeyField: foreignKeyField, relatedModel: relatedModel});
				delete fieldAttributes[associationName];
				delete fieldAttributes["_" + associationName];
			}
		});

		return fieldAttributes;
	}
}

Object.assign(Model.prototype, {
	"fetch": require("./fetch.js"),
	"save": require("./save.js"),
	"delete": require("./delete.js"),
	[symbols.addAssociation]: require("./addAssociation.js")
});

import ModelFinder from "../modelFinder.js";
