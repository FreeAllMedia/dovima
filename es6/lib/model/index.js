/* Component Dependencies */
import Async from "flowsync";
import inflect from "jargon";
import privateData from "incognito";

/* Shared Symbols */
import symbols from "./symbols";

/**
 * @class Model
 */
export default class Model {
	/**
	 * @param {Object.<String,*>} [initialAttributes] Provide default values for attributes by passing a Key-Value Object.
	 * @constructor
	 */
	constructor(initialAttributes, options = {}) {
		const _ = privateData(this);
		_.validations = {};
		_.associations = {};
		_.includeAssociations = [];

		_.database = options.database;

		this.associate();
		this.validate();

		this.attributes = initialAttributes;

		this.initialize();
	}

	/**
	 * STATIC INTERFACE
	 */

	static get find() {
		const modelQuery = new ModelFinder(this.database);
		return modelQuery.find(this);
	}

	static get count() {
		const modelQuery = new ModelFinder(this.database);
		return modelQuery.count(this);
	}

	static get mock() {
		const modelQuery = new ModelFinder(this.database);
		return modelQuery.mock(this);
	}

	/**
	 * INSTANCE MOCKING
	 */

	get mock() {
		return new InstanceMock(this);
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

	ensure(attributeNameOrNames, validatorFunction, validatorMessage) {
		if (attributeNameOrNames.constructor === Array) {
			const attributeNames = attributeNameOrNames;

			attributeNames.forEach((attributeName) => {
				this[symbols.addValidationForAttribute](attributeName, validatorFunction, attributeNames, validatorMessage);
			});
		} else {
			const attributeName = attributeNameOrNames;

			this[symbols.addValidationForAttribute](attributeName, validatorFunction, attributeName, validatorMessage);
		}
	}

	[symbols.addValidationForAttribute](attributeName, validatorFunction, validatorParameters, validatorMessage) {
		const _ = privateData(this);

		_.validations[attributeName] = _.validations[attributeName] || [];

		let validatorDetails = {validator: validatorFunction};

		if (validatorParameters.constructor === Array) {
			validatorDetails.parameters = validatorParameters;
		}

		if (validatorMessage) { validatorDetails.message = validatorMessage; }

		_.validations[attributeName].push(validatorDetails);
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
		const attributeNamesWithValidators = Object.keys(_.validations);

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
			const attributeValidations = _.validations[attributeName];

			const performValidation = (validation, returnValue) => {
				const validator = validation.validator;
				const parameters = validation.parameters;

				let validatorParameters = attributeName;

				if (parameters) {
					validatorParameters = parameters;
				}

				validator.call(this, validatorParameters, (error, validatorDetails) => {
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

			Async.mapParallel(
				attributeValidations,
				performValidation,
				compileValidatorResponses
			);
		};

		Async.mapParallel(
			attributeNamesWithValidators,
			performValidationsForAttribute,
			compileInvalidAttributeList
		);
	}

	include(...associationNames) {
		privateData(this).includeAssociations = associationNames;
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

	/* Dynamic Properties */

	get database() {
		const _ = privateData(this);
		if (_.database) {
			return _.database;
		} else {
			return this.constructor.database;
		}
	}

	get isNew() {
		if (this[this.primaryKey]) {
			return false;
		} else {
			return true;
		}
	}

	set attributes(newAttributes) {
		this[symbols.parseAttributesFromFields](newAttributes);
	}

	get attributes() {
		var attributes = {};
		this.properties.forEach((propertyName) => {
			if(!privateData(this).associations[propertyName]) {
				attributes[propertyName] = this[propertyName];
			}
		});
		return attributes;
	}

	get associations() {
		return privateData(this).associations;
	}

	get properties() {
		return Object.keys(this);
	}

	get validations() {
		return privateData(this).validations;
	}

	get tableName() {
		return privateData(this).tableName || inflect(this.constructor.name).plural.snake.toString();
	}

	set tableName(newTableName) {
		privateData(this).tableName = newTableName;
	}

	get primaryKey() {
		return privateData(this).primaryKey || "id";
	}

	set primaryKey(newPrimaryKey) {
		privateData(this).primaryKey = newPrimaryKey;
	}

	/**
	 * Private Functionality
	 */
	[symbols.getDatabase]() {
		let database = privateData(this).database;
		if(!database) {
			database = this.constructor.database;
		}
		return database;
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

		Async.mapParallel(
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
							Async.eachParallel(
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
			if(_.associations[associationName].type === "belongsTo") {
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

class InstanceMock {
	constructor(instance) {
		privateData(this).instance = instance;
	}

	save(mockNewId) {
		const instance = privateData(this).instance;
		privateData(instance).mockNewId = mockNewId;
	}

	fetch(mockRecord) {
		const instance = privateData(this).instance;
		privateData(instance).mockFetchRecord = mockRecord;
	}

	delete() {
		const instance = privateData(this).instance;
		privateData(instance).mockDelete = true;
	}

	instance(mockRecord) {
		this.save(mockRecord.id);
		this.fetch(mockRecord);
		this.delete();
	}
}

Object.assign(Model.prototype, {
	"fetch": require("./fetch.js"),
	"save": require("./save.js"),
	"delete": require("./delete.js"),
	"softDelete": require("./softDelete.js"),
	"destroy": require("./destroy.js"),
	"softDestroy": require("./softDestroy.js"),
	[symbols.addAssociation]: require("./addAssociation.js")
});

import ModelFinder from "../modelFinder.js";
