import ModelFinder from "../modelFinder.js";
import privateData from "incognito";

function countAssociationHasMany(model, associationModel, association, resultDetails, callback) {
	const collection = associationModel;
	if (collection.length > 0) {
		resultDetails.result = true;
		callback(undefined, resultDetails);
	} else {
		resultDetails.result = false;
		callback(undefined, resultDetails);
	}
}

export default function isPresent(associationName, callback) {
	const model = this;
	const defaultErrorMessage = "must be present on " + model.constructor.name;

  //apiKey
	let association = model.associations[associationName];

	let associationModel = model[associationName]; //this["apiKey"], this["apiKeyId"]

	const resultDetails = {
		result: undefined,
		message: defaultErrorMessage
	};

	const foreignId = association.foreignId;

	if (associationModel) {
		switch(association.type) {
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
			switch(association.type) {
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
			switch(association.type) {
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
