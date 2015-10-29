"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports["default"] = areOnlyProperties;

function areOnlyProperties(propertyNames, callback) {
	var model = this;
	var defaultErrorMessage = "must be the only properties on " + model.constructor.name;

	var validationDetails = {
		result: undefined,
		message: defaultErrorMessage
	};

	if (model.properties.length === propertyNames.length) {
		var propertiesMatch = true;

		propertyNames.forEach(function (propertyName) {
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

module.exports = exports["default"];