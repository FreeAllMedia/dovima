import ModelFinder from "../modelFinder.js";

export default function isPresent(associationName, callback) {
	const model = this;
	const defaultErrorMessage = "must be present on " + model.constructor.name;

	if (!model.constructor.database) { throw new Error("Cannot check isPresent without a database set."); }

  //apiKey
	let association = model.associations[associationName];
	let modelFinder = new ModelFinder(model.constructor.database);

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
				const collection = associationModel;
				if (collection.length > 0) {
					resultDetails.result = true;
					callback(undefined, resultDetails);
				} else {
					if (model.isNew) { //it does not have an id to look for
						resultDetails.result = false;
						callback(null, resultDetails);
					} else {
						modelFinder.count(association.constructor)
							.where(association.foreignKey, "=", model.id)
							.results((error, count) => {
								if (error) {
									resultDetails.result = false;
									callback(error, resultDetails);
								} else {
									const modelsFound = (count > 0);

									if(modelsFound){
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
					modelFinder.count(association.constructor)
						.where(association.foreignKey, "=", model.id)
						.results((error, count) => {
							if (error) {
								resultDetails.result = false;
								callback(error, resultDetails);
							} else {
								const modelsFound = (count > 0);

								if(modelsFound){
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
