const flowsync = require("flowsync");

/* Component Dependencies */
//
import MultiError from "blunder";
import Datetime from "fleming";
import inflect from "jargon";
import Quirk from "quirk";

import {ModelQuery} from "./modelFinder.js";

/* Private Method Symbols */
const callDeep = Symbol(),
	addAssociation = Symbol(),
	getFieldAttributes = Symbol(),
	parseAttributesFromFields = Symbol(),
	setAttributes = Symbol(),
	attributes = Symbol(),
	associations = Symbol(),
	properties = Symbol(),
	validations = Symbol(),
	isNew = Symbol(),
	fetchBy = Symbol();

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
				get: this[isNew]
			},

			"attributes": {
				get: this[attributes],
				set: this[setAttributes]
			},

			"associations": {
				get: this[associations]
			},

			"properties": {
				get: this[properties]
			},

			"validations": {
				get: this[validations]
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

		this.associate();
		this.validate();

		this[setAttributes](initialAttributes);

		this.initialize();
	}

	hasOne(associationName, associationConstructor) {
		return this[addAssociation]({
			name: associationName,
			constructor: associationConstructor,
			type: "hasOne"
		});
	}

	belongsTo(associationName, associationConstructor) {
		return this[addAssociation]({
			name: associationName,
			constructor: associationConstructor,
			type: "belongsTo"
		});
	}

	hasMany(associationName, associationConstructor) {
		return this[addAssociation]({
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

	fetch(...options) {
		switch(options.length) {
			case 0:
				this[fetchBy]();
				break;
			case 1:
				if(typeof options[0] === "function") {
					this[fetchBy]([this.primaryKey], options[0]);
				} else if(Array.isArray(options[0])) {
					this[fetchBy](options[0]);
				} else {
					this[fetchBy]([options[0]]);
				}
				break;
			case 2:
				if(Array.isArray(options[0])) {
					this[fetchBy](options[0], options[1]);
				} else {
					this[fetchBy]([options[0]], options[1]);
				}
				break;
		}
	}

	[fetchBy](fields = [this.primaryKey], callback) {
		if (!this.constructor.database) { throw new Error("Cannot fetch without Model.database set."); }

		let chain = this.constructor.database
			.select("*")
			.from(this.tableName);
		fields.forEach((field, index) => {
			if (!this[field]) { throw new Error(`Cannot fetch this model by the '${field}' field because it is not set.`); }

			if(index === 0) {
				chain = chain.where(field, "=", this[field]);
			} else {
				chain = chain.andWhere(field, "=", this[field]);
			}
		}, this);

		if(this._softDelete) {
			chain = chain.whereNull(inflect("deletedAt").snake.toString());
		}

		chain
			.limit(1)
			.results((error, records) => {
				if(records.length === 0) {
					callback(new Error(`There is no ${this.constructor.name} for the given (${fields.join(", ")}).`));
				} else {
					this[parseAttributesFromFields](records[0]);

					if (this._includeAssociations.length > 0) {
						const modelFinder = new ModelFinder(this.constructor.database);

						const associations = this.associations;

						/* We'll be putting all of our Async tasks into this */
						const fetchTasks = [];

						this._includeAssociations.forEach((associationName) => {

							const association = associations[associationName];

							if (!association) {
								throw new Error(`Cannot fetch '${associationName}' because it is not a valid association on ${this.constructor.name}`);
							}

							switch(association.type) {
								case "hasOne":
									fetchTasks.push(finished => {

										// user hasMany address


										const ModelClass = association.constructor;

										if (association.through) {
											const throughAssociation = associations[association.through];

											//throw throughAssociation.foreignId;
											//select * from Addresses where user_id = this[this.primaryKey]
												//select * from PostalCodes where address_id = address.id
											if (!this[this.primaryKey]) {
												throw new Error(`'${this.primaryKey}' is not set on ${this.constructor.name}`);
											}

											modelFinder
												.find(throughAssociation.constructor)
												.where(association.foreignId, "=", this[this.primaryKey])
												.limit(1)
												.results((errors, models) => {
													const joinModel = models[0];
													const destinationAssociation = joinModel.associations[associationName];

													//throw destinationAssociation.foreignId;

													//throw joinModel;//throw model.associations;
													//addressId

													const tempModel = new association.constructor();
													modelFinder
														.find(association.constructor)
														.where(tempModel.primaryKey, "=", joinModel[destinationAssociation.foreignId])
														.limit(1)
														.results((associationError, associationModels) => {
															const associationModel = associationModels[0];
															this[associationName] = associationModel;
															finished();
														});
												});
										} else {
											const query = modelFinder
												.find(ModelClass)
												.where(association.foreignKey, "=", this[this.primaryKey]);

											const processWhereCondition = (value) => {
												if (typeof value === "string") {
													const snakeCasedValue = inflect(value).snake.toString();
													return snakeCasedValue;
												} else {
													return value;
												}
											};

											const processedWhere = association.where.map(processWhereCondition);

											query.andWhere(function () {
												this.where(...processedWhere);

												if(Array.isArray(association.andWhere)) {
													association.andWhere.forEach((andWhereItem) => {
														const processedAndWhereItem = andWhereItem.map(processWhereCondition);
														this.andWhere(...processedAndWhereItem);
													});
												}
											});

											query
												.limit(1)
												.results((errors, models) => {
													const model = models[0];
													this[associationName] = model;
													finished();
												});
										}
									});
									break;

								case "hasMany":

										if (association.through) {
											fetchTasks.push(finished => {

												const throughAssociation = associations[association.through];

												modelFinder
													.find(throughAssociation.constructor)
													.where(association.foreignId, this[this.primaryKey])
													.results((errors, models) => {
														if(models.length > 0) {
															const foreignAssociationName = association.as || associationName;

															if (!models[0].associations[foreignAssociationName]) {
																throw new Error(`'${foreignAssociationName}' is not a valid association on through model '${throughAssociation.constructor.name}'`);
															}

															const destinationAssociation = models[0].associations[foreignAssociationName];

															let modelIds = [];

															const tempModel = new association.constructor();

															switch(destinationAssociation.type) {
																case "hasOne":
																	//throw {through: throughAssociation, destination: destinationAssociation};

																	modelIds = models.map(model => { return model[throughAssociation.foreignId]; });

																	modelFinder
																		.find(association.constructor)
																		.where(tempModel.primaryKey, "in", modelIds)
																		.results((errors, models) => {
																			models.forEach((model) => {
																				this[associationName].push(model);
																			});
																			finished();
																		});

																	break;

																case "hasMany":
																	modelIds = models.map(model => { return model[model.primaryKey]; });

																	modelFinder
																		.find(association.constructor)
																		.where(destinationAssociation.foreignId, "in", modelIds)
																		.results((errors, models) => {
																			models.forEach((model) => {
																				this[associationName].push(model);
																			});
																			finished();
																		});
																	break;
																case "belongsTo":
																	//throw {through: throughAssociation, destination: destinationAssociation};

																	//throw destinationAssociation.name;

																	//throw associationName;

																	//const localId = inflect(destinationAssociation.name).foreignKey.camel.toString();

																	modelIds = models.map(model => { return model[destinationAssociation.foreignId]; });

																	modelFinder
																		.find(association.constructor)
																		.where(tempModel.primaryKey, "in", modelIds)
																		.results((errors, models) => {
																			models.forEach((model) => {
																				this[associationName].push(model);
																			});
																			finished();
																		});

																	break;
															}

															//throw {association: association.foreignName, destinationAssociation: destinationAssociation.foreignName, throughAssociation: throughAssociation.foreignName};
															//throw {association: association.foreignId, destinationAssociation: destinationAssociation.foreignId, throughAssociation: throughAssociation.foreignId};
															//throw models;


														}
													});

												// if (!this[throughAssociation.foreignId]) {
												// 	throw new Error(`'${throughAssociation.foreignId}' is not set on ${this.constructor.name}`);
												// }

												// modelFinder
												// 	.find(throughAssociation.constructor)
												// 	.where(this.primaryKey, "=", this[throughAssociation.foreignId])
												// 	.limit(1)
												// 	.results((errors, models) => {
												// 		const joinModel = models[0];
												// 		const destinationAssociation = joinModel.associations[associationName];

												// 		//throw joinModel;//throw model.associations;

												// 		modelFinder
												// 			.find(association.constructor)
												// 			.where(this.primaryKey, "=", joinModel[destinationAssociation.foreignId])
												// 			.results((associationError, associationModels) => {
												// 				const associationModel = associationModels[0];
												// 				this[associationName] = associationModel;
												// 			});

												// 		this[associationName] = joinModel;
												// 		finished();
												// 	});
											});
										} else {
											fetchTasks.push(finished => {
												this[associationName].fetch(finished);
											});
										}
									break;

								case "belongsTo":
									if (!this[association.foreignId]) {
										throw new Error(`Cannot fetch '${associationName}' because '${association.foreignId}' is not set on ${this.constructor.name}`);
									}

									fetchTasks.push(finished => {
										modelFinder
											.find(association.constructor)
											.where(this.primaryKey, "=", this[association.foreignId])
											.limit(1)
											.results((errors, models) => {
												const model = models[0];
												this[associationName] = model;
												model[association.foreignName] = this;
												finished();
											});
									});

							}
						});

						flowsync.parallel(
							fetchTasks,
							() => {
								if (callback) {
									callback(error, this);
								}
							}
						);
					} else {
						if (callback) {
							callback(error, this);
						}
					}
				}
			});
	}

	delete(callback) {
		if(this._softDelete) {
			if (!this.constructor.database) { throw new Error("Cannot delete without Model.database set."); }

			if(this[this.primaryKey]) {
				flowsync.series([
					(next) => {
						this[callDeep]("delete", (associationDetails) => {
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

	save(callback) {
		if (!this.constructor.database) { throw new Error("Cannot save without Model.database set."); }

		flowsync.series([
			(next) => {
				this.beforeValidation(next);
			},
			(next) => {
				this.isValid((valid) => {
					if(valid) {
						next();
					} else {
						this.invalidAttributes((invalidAttributeList) => {
							const hasInvalidAttributes = Object.keys(invalidAttributeList).length > 0;

							if (hasInvalidAttributes) {
								const errorPrefix = this.constructor.name + " is invalid";
								const multiError = new MultiError([], errorPrefix);
								for(let invalidAttributeName in invalidAttributeList) {
									const invalidAttributeMessages = invalidAttributeList[invalidAttributeName];

									for(let index in invalidAttributeMessages) {
										const invalidAttributeMessage = invalidAttributeMessages[index];
										const error = new Error(`${invalidAttributeName} ${invalidAttributeMessage}`);
										multiError.push(error);
									}
								}
								next(multiError);
							} else {
								next();
							}
						});
					}
				});
			},
			(next) => {
				this.beforeSave(next);
			},
			(next) => {
				if (this.isNew) {
					let now = new Datetime();
					this.createdAt = now.toDate();
					let fieldAttributes = this[getFieldAttributes]();

					this.constructor.database
						.insert(fieldAttributes)
						.into(this.tableName)
						.results((error, ids) => {
							if(error) {
								next(error);
							} else {
								this[this.primaryKey] = ids[0];
								next();
							}
						});
				} else {
					let now = new Datetime();
					this.updatedAt = now.toDate();
					let attributes = this[getFieldAttributes]();
					let updateAttributes = {};

					for (let attributeName in attributes) {
						if (attributeName !== this.primaryKey) {
							updateAttributes[attributeName] = attributes[attributeName];
						}
					}

					this.constructor.database
						.update(updateAttributes)
						.into(this.tableName)
						.where(this.primaryKey, "=", this[this.primaryKey])
						.results(next);
				}
			},
			(next) => {
				//disabling this rule because break is not necessary when return is present
				/* eslint-disable no-fallthrough */
				this[callDeep]("save", (associationDetails) => {
					switch(associationDetails.type) {
						case "hasOne":
							return true;
						case "hasMany":
							if(associationDetails.through === undefined) {
								return true;
							} else {
								return false;
							}
						case "belongsTo":
							return false;
					}
				}, next);
			},
			(next) => {
				this.afterSave(next);
			}
		],
		(errors) => {
			if(errors) {
				callback(errors);
			} else {
				callback(undefined, this);
			}
		});
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
		if(Model.jsonFormatter && typeof Model.jsonFormatter === "function") {
			return Model.jsonFormatter(this);
		} else {
			return this.attributes;
		}
	}

	/**
	 * Private Functionality
	 */

	[setAttributes](newAttributes) {
		this[parseAttributesFromFields](newAttributes);
	}

	[associations]() {
		return this._associations;
	}

	[properties]() {
		return Object.keys(this);
	}

	[validations]() {
		return this._validations;
	}

	[attributes]() {
		var attributes = {};
		this.properties.forEach((propertyName) => {
			if(!this._associations[propertyName]) {
				attributes[propertyName] = this[propertyName];
			}
		});
		return attributes;
	}

	[isNew]() {
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
	[callDeep] (methodName, predicate, callback) {
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
	[addAssociation] (associationDetails) {
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
				}

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
				}

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
		}
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

	[parseAttributesFromFields](record) {
		for (var field in record) {
			this[inflect(field).camel.toString()] = record[field];
		}
	}

	[getFieldAttributes]() {
		//this, using quirk, will return target with the new attributes on it, useful to EXCLUDE them from here
		//TODO: this.additionalAttributes.addAttributes(target); //magic line
		let attributeNames = Object.keys(this.attributes);
		let fieldAttributes = {};
		attributeNames.forEach((attributeName) => {
			fieldAttributes[inflect(attributeName).snake.toString()] = this[attributeName];
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

const ambiguous = Symbol(),
	dependent = Symbol();

export class AssociationSetter {
	constructor(association) {
		this.association = association;

		switch(association.type) {
			case "belongsTo":
				Object.defineProperties(this, {
					"ambiguous": {
						get: this[ambiguous]
					}
				});
				break;
			case "hasOne":
			case "hasMany":
				Object.defineProperties(this, {
					"dependent": {
						get: this[dependent]
					}
				});
				break;
		}
	}

	foreignName(name) {
		this.association.foreignName = name;
		return this;
	}

	where(...options) {
		this.association.where = options;
		return this;
	}

	andWhere(...options) {
		this.association.andWhere = this.association.andWhere || [];
		this.association.andWhere.push(options);
		return this;
	}

	through(associationName) {
		this.association.through = associationName;
		return this;
	}

	as(associationName) {
		this.association.as = associationName;
		return this;
	}

	[ambiguous]() {
		this.association.ambiguous = true;
	}

	[dependent]() {
		this.association.dependent = true;
	}
}

Object.defineProperties(Model, {
	"find": {
		get: function modelFind() {
			let modelQuery = new ModelQuery(Model.database);
			return modelQuery.find(this);
		}
	},
	//problem here: can't assign property automatically to the concrete model to use it
	//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/observe#Browser_compatibility
	"attributes": {
		value: new Quirk()
	}
});

import Collection from "./collection.js";
import ModelFinder from "./modelFinder.js";
