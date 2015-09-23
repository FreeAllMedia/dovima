"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports["default"] = isPresent;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _modelFinderJs = require("../modelFinder.js");

var _modelFinderJs2 = _interopRequireDefault(_modelFinderJs);

var _incognito = require("incognito");

var _incognito2 = _interopRequireDefault(_incognito);

function countAssociationHasMany(model, associationModel, association, resultDetails, callback) {
	var collection = associationModel;
	if (collection.length > 0) {
		resultDetails.result = true;
		callback(undefined, resultDetails);
	} else {
		resultDetails.result = false;
		callback(undefined, resultDetails);
	}
}

function isPresent(associationName, callback) {
	var model = this;
	var defaultErrorMessage = "must be present on " + model.constructor.name;

	//apiKey
	var association = model.associations[associationName];

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
				countAssociationHasMany.call(this, model, associationModel, association, resultDetails, callback);
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
					if (model[foreignId]) {
						resultDetails.result = true;
						callback(null, resultDetails);
					} else {
						resultDetails.result = false;
						callback(null, resultDetails);
					}
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