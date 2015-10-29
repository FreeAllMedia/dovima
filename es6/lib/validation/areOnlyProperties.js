export default function areOnlyProperties(propertyNames, callback) {
	const model = this;
	const defaultErrorMessage = "must be the only properties on " + model.constructor.name;

	const validationDetails = {
		result: undefined,
		message: defaultErrorMessage
	};

	if (model.properties.length === propertyNames.length) {
		let propertiesMatch = true;

		propertyNames.forEach((propertyName) => {
			if (!model.properties.includes(propertyName)) {
				propertiesMatch = false;
			}
		});

		validationDetails.result = propertiesMatch;

		callback(undefined, validationDetails);
	} else {
		validationDetails.result = false;
		callback(undefined, validationDetails);
	}
}
