"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports["default"] = isPresent;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _modelFinderJs = require("../modelFinder.js");

var _modelFinderJs2 = _interopRequireDefault(_modelFinderJs);

function isPresent(associationName, callback) {
	var model = this;
	var defaultErrorMessage = "must be present on " + model.constructor.name;

	if (!model.constructor.database) {
		throw new Error("Cannot check isPresent without a database set.");
	}

	//apiKey
	var association = model.associations[associationName];
	var modelFinder = new _modelFinderJs2["default"](model.constructor.database);

	var associationModel = model[associationName]; //this["apiKey"], this["apiKeyId"]

	var resultDetails = {
		result: undefined,
		message: defaultErrorMessage
	};

	var foreignId = association.foreignId;

	if (associationModel) {
		switch (association.type) {
			case "hasOne":
			case "belongsTo":
				resultDetails.result = true;
				callback(undefined, resultDetails);
				break;
			case "hasMany":
				var collection = associationModel;
				if (collection.length > 0) {
					resultDetails.result = true;
					callback(undefined, resultDetails);
				} else {
					if (model.isNew) {
						//it does not have an id to look for
						resultDetails.result = false;
						callback(null, resultDetails);
					} else {
						modelFinder.count(association.constructor).where(association.foreignKey, "=", model.id).results(function (error, count) {
							if (error) {
								resultDetails.result = false;
								callback(error, resultDetails);
							} else {
								var modelsFound = count > 0;

								if (modelsFound) {
									resultDetails.result = true;
									callback(null, resultDetails);
								} else {
									resultDetails.result = false;
									callback(null, resultDetails);
								}
							}
						});
					}
				}
				break;
			default:
				throw new Error("Unknown association type");
		}
	} else {
		if (model.isNew) {
			resultDetails.result = false;
			switch (association.type) {
				case "hasOne":
				case "hasMany":
					break;
				case "belongsTo":
					//console.log("LOOK", {model: model, foreignId: foreignId})
					if (model[foreignId]) {
						resultDetails.result = true;
					} else {
						resultDetails.result = false;
					}
					break;
				default:
					throw new Error("Unknown association type");
			}
			callback(null, resultDetails);
		} else {
			switch (association.type) {
				case "hasOne":
				case "hasMany":
					modelFinder.count(association.constructor).where(association.foreignKey, "=", model.id).results(function (error, count) {
						if (error) {
							resultDetails.result = false;
							callback(error, resultDetails);
						} else {
							var modelsFound = count > 0;

							if (modelsFound) {
								resultDetails.result = true;
								callback(null, resultDetails);
							} else {
								resultDetails.result = false;
								callback(null, resultDetails);
							}
						}
					});
					break;
				case "belongsTo":

					if (model[foreignId]) {
						resultDetails.result = true;
						callback(null, resultDetails);
					} else {
						resultDetails.result = false;
						callback(null, resultDetails);
					}
					break;
				default:
					throw new Error("Unknown association type");
			}
		}
	}
}

module.exports = exports["default"];