// ./models/validators/isNumerical.validator.js
export default function isNumericalValidator(propertyNameOrNames, customErrorMessage, callback) {
  const model = this;

  if (propertyNameOrNames.constructor === Array) {
		let errorMessages = [];

    const propertyNames = propertyNameOrNames;

		propertyNames.forEach((property) => {
			if (!isNumerical(model[property])) {
				const errorMessage = customErrorMessage || `"${property}" must be a number`;
				errorMessages.push(errorMessage);
			}
		});

		if (errorMessages.length === 0) {
			callback();
		} else {
			const error = new Error(`${errorMessages.join(", ")}.`);
			callback(error);
		}
  } else {
		const propertyName = propertyNameOrNames;

		if (isNumerical(model[propertyName])) {
			callback();
		} else {
			const errorMessage = customErrorMessage || `"${propertyName}" must be a number.`;
			const error = new Error(errorMesage);
			callback(error);
		}
  }
}

function isNumerical(value) {
	const valueIsNumerical = !isNaN(parseFloat(value)) && isFinite(value);
	return valueIsNumerical;
}

// ./model/plugins/isProtected.plugin.js
export default function isProtected() {
	const model = this;

	model.validations.add("isProtected", isProtectedValidator);
}

function isProtectedValidator(propertyNameOrNames, customErrorMessage, callback) {
  const model = this;

  if (propertyNameOrNames.constructor === Array) {
    const propertyNames = propertyNameOrNames;

    propertyNames.forEach(addFilter, model);
  } else {
    const propertyName = propertyNameOrNames;

    addFilter.call(model, propertyName);
  }
}

function addFilter(propertyName) {
  const model = this;

  model.filters.add((newPropertyName, newPropertyValue, callback) => {
    if (propertyName === newPropertyName) {
      const errorMessage = customErrorMessage || `${propertyName} is a protected property.`
      const error = new Error(errorMessage);
      model.errors.push(error);
    }
  });
}

// ./models/ourModel.js
include isNumericalValidator from "./validators/isNumerical.js";

export default class OurModel extends Model {
	beforeInitialize(attributes, options) {
		// Simple native plugins
		this.use.timestamps;
		this.use.softDelete;

		// Simple 3rd-party plugins
		this.use(isNumerical);

		// Validate one property
		this.ensure("id").isProtected;

		// Validate many propertyNames
		this.ensure(["id", "createdAt", "updatedAt", "deletedAt"]).isProtected;
	}
}

class User extends OurModel {
	initialize(attributes, options) {
		// Immediately begin using 3rd-party functionality
		this.ensure("age").isNumerical;

		this.ensure("name").isSet;
		this.ensure("age").isSet;

		super();
	}
}

class Admin extends User {
	initialize(attributes, options) {
		this.ensure("key").isSet;

		super();
	}
}

let user = new User("Bob", 46);
const admin = new User("Steve", 54, "1209ufajksbdv0q9h3csdv");

user.id = 54;
user.save(); // OK!

user.id = 42; // OK! You are directly setting the id!

let user = new User({name: "Bob", age: 46, id: 4}); // Doesn't throw, but .save will return error now

user.save((errors) => {
	errors;
});

user.errors((errors) => {
	errors.forEach((error) => {
		console.log(error.message);
	});
});
