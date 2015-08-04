/* Component Dependencies */
//
import flowsync from "flowsync";
import Datetime from "fleming";
import inflect from "jargon";
import Quirk from "quirk";

import symbols from "./symbols";

/**
 * @class Model
 */

export default class Model {
	/**
	 * @param {Object.<String,*>} [initialAttributes] Provide default values for attributes by passing a Key-Value Object.
	 * @constructor
	 */
	constructor(initialAttributes) {
		[
			"_validations",
			"_associations"
		].forEach((privatePropertyName) => {
			Object.defineProperty(this, privatePropertyName, {
				writable: true,
				enumerable: false,
				value: {}
			});
		});
		/**
		 * Define dynamic properties
		 */
		Object.defineProperties(this, {
			"_includeAssociations": {
				enumerable: false,
				writable: true,
				value: []
			},

			"additionalAttributes": {
				enumerable: false, //this fix db related issues
				get: () => {
					return this.constructor.attributes;
				}
			},

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

			"_tableName": {
				enumerable: false,
				writable: true
			},

			"tableName": {
				get: () => {
					return this._tableName || inflect(this.constructor.name).plural.snake.toString();
				},
				set: (newTableName) => {
					this._tableName = newTableName;
				}
			},

			"_primaryKey": {
				enumerable: false,
				writable: true
			},

			"primaryKey": {
				get: () => {
					return this._primaryKey || "id";
				},
				set: (newPrimaryKey) => {
					this._primaryKey = newPrimaryKey;
				}
			},

			"_softDelete": {
				enumerable: false,
				writable: true,
				value: false
			},

			"softDelete": {
				get: () => {
					this._softDelete = true;
				}
			}
		});

		//add the quirk to this instance
		this.additionalAttributes.addAttributes(this);

		this.associate();
		this.validate();

		this[symbols.setAttributes](initialAttributes);

		this.initialize();
	}

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
		this._validations[attributeName] = this._validations[attributeName] || [];

		let validatorDetails = {validator: validatorFunction};

		if (validatorMessage) { validatorDetails.message = validatorMessage; }

		this._validations[attributeName].push(validatorDetails);
	}

	/**
	 * Return a boolean indicating whether the model is valid or not.
	 *
	 * @method isValid
	 * @param  {Function(boolean)} callback Callback returning the boolean.
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
	 *   console.log(invalidAttributeList); // {"name":["Cannot contain special characters", "Cannot contain numbers"], "age":["Cannot be under 18"]}
	 * });
	 * ```
	 *
	 * @method invalidAttributes
	 * @param  {Function(invalidAttributeList)} callback Callback returning the invalid attribute list.
	 */
	invalidAttributes(callback) {
		const attributeNamesWithValidators = Object.keys(this._validations);

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
			const attributeValidations = this._validations[attributeName];

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
		this._includeAssociations = associationNames;
		return this;
	}

	delete(callback) {
		if(this._softDelete) {
			if (!this.constructor.database) { throw new Error("Cannot delete without Model.database set."); }

			if(this[this.primaryKey]) {
				flowsync.series([
					(next) => {
						this[symbols.callDeep]("delete", (associationDetails) => {
							return (associationDetails.type !== "belongsTo"
								&& associationDetails.dependent === true);
						}, next);
					},
					(next) => {
						let now = new Datetime();
						let attributesToUpdate = {};
						attributesToUpdate[inflect("deletedAt").snake.toString()] = now.toDate();
						this.constructor.database
							.update(attributesToUpdate)
							.into(this.tableName)
							.where(this.primaryKey, "=", this[this.primaryKey])
							.results((error, results) => {
								if(error) {
									next(error);
								} else if (results === 0) {
									next(new Error(`${this.constructor.name} with ${this.primaryKey} ${this[this.primaryKey]} cannot be soft deleted because it doesn't exists.`));
								} else {
									next();
								}
							});
					}
				], (errors, results) => {
					callback(errors, results);
				});
			} else {
				throw new Error(`Cannot delete the ${this.constructor.name} because the primary key is not set.`);
			}
		} else {
			throw new Error("Not implemented.");
		}
	}

	//approach #1 to proxy method to a different file
	save(callback) {
		require("./save").call(this, callback);
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

	associate() {}

	validate() {}

	initialize() {}

	toJSON() {
		return this.attributes;
	}

	/**
	 * Private Functionality
	 */

	[symbols.setAttributes](newAttributes) {
		this[symbols.parseAttributesFromFields](newAttributes);
	}

	[symbols.associations]() {
		return this._associations;
	}

	[symbols.properties]() {
		return Object.keys(this);
	}

	[symbols.validations]() {
		return this._validations;
	}

	[symbols.attributes]() {
		var attributes = {};
		this.properties.forEach((propertyName) => {
			if(!this._associations[propertyName]) {
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

	/**
	 * @example
	 * ```
	 * const associationDetails = {
	 *     name: "users",
	 *     type: "hasMany",
	 *     constructor: User
	 * };
	 *
	 * [addAssociation](associationDetails);
	 * ```
	 * @method addAssociation
	 * @param {Object.<String, *>} associationDetails Object containing association details in key/value pairs.
	 */
	[symbols.addAssociation] (associationDetails) {
		const association = {
			parent: this,
			type: associationDetails.type,
			constructor: associationDetails.constructor
		};

		/* Default Values */

		switch(associationDetails.type) {
			case "hasOne":
			case "hasMany":
				association.foreignKey = inflect(this.constructor.name).foreignKey.toString();
				association.foreignId = inflect(association.foreignKey).camel.toString();
				break;
			case "belongsTo":
				association.foreignKey = inflect(associationDetails.name).foreignKey.toString();
				association.foreignId = inflect(association.foreignKey).camel.toString();
		}

		// TODO: AS
		association.foreignName = inflect(this.constructor.name).camel.toString();

		/* Override Values */

		const associationSetter = new AssociationSetter(association);

		/* Set private space for value to be stored internally */

		const privateAssociationName = "_" + associationDetails.name;

		const implicitAssociationName = `${associationDetails.name}Id`;
		const privateImplicitAssociationName = `_${implicitAssociationName}`;

		/* Association Setter By Type */

		let setterFunction,
			implicitSetterFunction;

		switch(associationDetails.type) {
			case "hasOne":
				this[privateAssociationName] = null;

				implicitSetterFunction = (newId) => {
					//reset the association when assign associationId
					this[privateImplicitAssociationName] = newId;
					this[privateAssociationName] = null;
				};

				setterFunction = (newModel) => {
					if (newModel && this[privateAssociationName] !== newModel) {
						if(!(newModel instanceof Model)) {
							throw new Error("Cannot set a non model entity onto this property. It should inherit from Model");
						}

						this[privateAssociationName] = newModel;
						this[privateImplicitAssociationName] = newModel.id;

						newModel[association.foreignName] = this;
					}
				};
				break;
			case "belongsTo":
				this[privateAssociationName] = null;

				implicitSetterFunction = (newId) => {
					//reset the association when assign associationId
					this[privateImplicitAssociationName] = newId;
					this[privateAssociationName] = null;
				};

				setterFunction = (newModel) => {
					if (newModel && this[privateAssociationName] !== newModel) {
						if(!(newModel instanceof Model)) {
							throw new Error("Cannot set a non model entity onto this property. It should inherit from Model");
						}

						this[privateAssociationName] = newModel;
						this[privateImplicitAssociationName] = newModel.id;

						const pluralForeignName = inflect(association.foreignName).plural.toString();

						if (!association.ambiguous) {
							if (newModel.hasOwnProperty(association.foreignName)) {
								newModel[association.foreignName] = this;
							} else if (newModel.hasOwnProperty(pluralForeignName)) {
								//lookup is it exist and dont add it in that case
								newModel[pluralForeignName].push(this);
							} else {
								throw new Error(`Neither "${association.foreignName}" or "${pluralForeignName}" are valid associations on "${newModel.constructor.name}"`);
							}
						}

						// if (newModel[association.foreignName] instanceof Collection) {
						// 	newModel[association.foreignName].push(this);
						// } else {
						// 	newModel[association.foreignName] = this;
						// }
					}
				};
				break;
			case "hasMany":
				/* Set to null by default */
				this[privateAssociationName] = new Collection(association);

				setterFunction = (newModel) => {
					if (newModel && this[privateAssociationName] !== newModel) {
						this[privateAssociationName] = newModel;
					}
				};
				break;
			default:
				throw new Error("Unknown association type.");
		}

		let newProperties = {};
		newProperties[privateAssociationName] = {
			enumerable: false,
			writable: true
		};
		newProperties[associationDetails.name] = {
			enumerable: true,
			set: setterFunction,
			get: () => {
				return this[privateAssociationName];
			}
		};
		if(implicitSetterFunction) {
			newProperties[privateImplicitAssociationName] = {
				enumerable: false,
				writable: true
			};
			newProperties[implicitAssociationName] = {
				enumerable: true,
				set: implicitSetterFunction,
				get: () => {
					return this[privateImplicitAssociationName];
				}
			};
		}
		Object.defineProperties(this, newProperties);

		// Object.defineProperty(
		// 	this,
		// 	privateAssociationName,
		// 	{
		// 		enumerable: false,
		// 		writable: true
		// 	}
		// );

		// Object.defineProperty(
		// 	this,
		// 	associationDetails.name,
		// 	{
		// 		enumerable: true,
		// 		set: setterFunction,
		// 		get: () => {
		// 			return this[privateAssociationName];
		// 		}
		// 	}
		// );

		this[associationDetails.name] = associationDetails.value;

		this._associations[associationDetails.name] = association;

		return associationSetter;
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
			let found = Object.keys(this.additionalAttributes).find((additionalAttributeName) => {
				return additionalAttributeName === attributeName;
			});
			//is just on db if is not an additional attribute
			if(!found) {
				fieldAttributes[inflect(attributeName).snake.toString()] = this[attributeName];
			}
		});

		//add belongsTo associations and remove others
		Object.keys(this.associations).forEach((associationName) => {
			let relatedModel = this[associationName];
			let foreignKeyField = inflect(associationName).foreignKey.toString();
			if(this._associations[associationName].type === "belongsTo") {
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

//approach #2 to proxy method to a different file
import fetch from "./fetch";
Object.assign(Model.prototype, {fetch: fetch});

Object.defineProperties(Model, {
	"find": {
		get: function modelFind() {
			let modelQuery = new ModelFinder(Model.database);
			return modelQuery.find(this);
		}
	},
	//problem here: can't assign property automatically to the concrete model to use it
	//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/observe#Browser_compatibility
	"attributes": {
		value: new Quirk()
	}
});

import Collection from "../collection.js";
import ModelFinder from "../modelFinder.js";
import AssociationSetter from "../associationSetter.js";
