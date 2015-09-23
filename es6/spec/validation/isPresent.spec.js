import isPresent from "../../lib/validation/isPresent.js";
import Model from "../../../";
import Database from "almaden";

/* Test Configuration */
//nothing from a real connection needed since we are mocking here
const databaseConfig = {
	"debug": true,
	"client": "mysql",
	"connection": {},
	"pool": {
		"max": 2,
		"min": 2
	}
};

describe("isPresent(item, callback)", () => {
	class Wheel extends Model {}

	class SteeringWheel extends Model {}

	class Street extends Model {
		associate() {
			this.hasMany("trucks", Truck);
		}
	}

	class Truck extends Model {
		associate() {
			this.belongsTo("street", Street);
			this.hasOne("steeringWheel", SteeringWheel);
			this.hasMany("wheels", Wheel);
		}

		validate() {
			this.ensure("steeringWheel", isPresent);
			this.ensure("street", isPresent);
			this.ensure("wheels", isPresent);
		}
	}

	let truck,
		steeringWheel,
		street,
		trueValue,
		falseValue;

	beforeEach(() => {

		Model.database = new Database(databaseConfig);

		truck = new Truck();
		street = new Street();
		steeringWheel = new SteeringWheel();

		truck.id = 1;

		trueValue = {
			result: true,
			message: "must be present on Truck"
		};

		falseValue = {
			result: false,
			message: "must be present on Truck"
		};
	});

	it("should be a function", () => {
		(typeof isPresent).should.equal("function");
	});

	describe("(default error message)", () => {
		it("should return a default error message with failure", () => {

		});
	});

	describe("(association is present)", () => {
		describe("(as a property)", () => {
			beforeEach(() => {
				truck.wheels.push(new Wheel());
				truck.wheels.push(new Wheel());
				truck.wheels.push(new Wheel());
				truck.wheels.push(new Wheel());
				truck.steeringWheel = steeringWheel;
				truck.street = street;
			});

			describe("(hasOne)", () => {
				it("should return true", done => {
					isPresent.call(truck, "steeringWheel", (error, result) => {
						result.should.eql(trueValue);
						done();
					});
				});
			});

			describe("(hasMany)", () => {
				it("should return true if collections has elements", done => {
					isPresent.call(truck, "wheels", (error, result) => {
						result.should.eql(trueValue);
						done();
					});
				});
			});

			describe("(belongsTo)", () => {
				it("should return true", done => {
					isPresent.call(truck, "street", (error, result) => {
						result.should.eql(trueValue);
						done();
					});
				});
			});
		});
	});

	describe("(association not present)", () => {
		describe("(when model is new)", () => {
			beforeEach(() => {
				delete truck.id;
			});

			describe("(when property is set)", () => {
				describe("(belongsTo)", () => {
					beforeEach(() => {
						truck.streetId = 1;
						truck.street = null;
					});
					it("should return true", done => {
						isPresent.call(truck, "street", (error, result) => {
							result.should.eql(trueValue);
							done();
						});
					});
				});
			});

			describe("(when property not set)", () => {
				describe("(hasOne)", () => {
					it("should return false", done => {
						truck.steeringWheel = null;
						isPresent.call(truck, "steeringWheel", (error, result) => {
							result.should.eql(falseValue);
							done();
						});
					});
				});

				describe("(belongsTo)", () => {
					it("should return false when a belongsTo association is not present", done => {
						truck.street = null;
						isPresent.call(truck, "street", (error, result) => {
							result.should.eql(falseValue);
							done();
						});
					});
				});
			});

			describe("(hasMany)", () => {
				it("should return false when a hasMany association is not present", done => {
					delete truck.id;
					isPresent.call(truck, "wheels", (error, result) => {
						result.should.eql(falseValue);
						done();
					});
				});
			});
		});

		describe("(when model not new)", () => {
			beforeEach(() => {
				Model.database.mock({});
			});

			describe("(hasOne)", () => {
				it("should return false", done => {
					isPresent.call(truck, "steeringWheel", (error, result) => {
						result.should.eql(falseValue);
						done();
					});
				});
			});

			describe("(belongsTo)", () => {
				describe("(association id is present)", () => {
					beforeEach(() => {
						truck.streetId = 1;
					});
					it("should return true", done => {
						isPresent.call(truck, "street", (error, result) => {
							result.should.eql(trueValue);
							done();
						});
					});
				});
				describe("(association id not present)", () => {
					it("should return false", done => {
						isPresent.call(truck, "street", (error, result) => {
							result.should.eql(falseValue);
							done();
						});
					});
				});
			});
		});
	});

	it("should return true when a hasMany association is present", done => {
		truck.id = undefined;
		truck.wheels.push(new Wheel());
		isPresent.call(truck, "wheels", (error, result) => {
			result.should.eql(trueValue);
			done();
		});
	});
});
