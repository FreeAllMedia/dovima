"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _libValidationIsPresentJs = require("../../lib/validation/isPresent.js");

var _libValidationIsPresentJs2 = _interopRequireDefault(_libValidationIsPresentJs);

var _ = require("../../../");

var _2 = _interopRequireDefault(_);

var _almaden = require("almaden");

var _almaden2 = _interopRequireDefault(_almaden);

/* Test Configuration */
//nothing from a real connection needed since we are mocking here
var databaseConfig = {
	"debug": true,
	"client": "mysql",
	"connection": {},
	"pool": {
		"max": 2,
		"min": 2
	}
};

describe("isPresent(item, callback)", function () {
	var Wheel = (function (_Model) {
		function Wheel() {
			_classCallCheck(this, Wheel);

			_get(Object.getPrototypeOf(Wheel.prototype), "constructor", this).apply(this, arguments);
		}

		_inherits(Wheel, _Model);

		return Wheel;
	})(_2["default"]);

	var SteeringWheel = (function (_Model2) {
		function SteeringWheel() {
			_classCallCheck(this, SteeringWheel);

			_get(Object.getPrototypeOf(SteeringWheel.prototype), "constructor", this).apply(this, arguments);
		}

		_inherits(SteeringWheel, _Model2);

		return SteeringWheel;
	})(_2["default"]);

	var Street = (function (_Model3) {
		function Street() {
			_classCallCheck(this, Street);

			_get(Object.getPrototypeOf(Street.prototype), "constructor", this).apply(this, arguments);
		}

		_inherits(Street, _Model3);

		_createClass(Street, [{
			key: "associate",
			value: function associate() {
				this.hasMany("trucks", Truck);
			}
		}]);

		return Street;
	})(_2["default"]);

	var Truck = (function (_Model4) {
		function Truck() {
			_classCallCheck(this, Truck);

			_get(Object.getPrototypeOf(Truck.prototype), "constructor", this).apply(this, arguments);
		}

		_inherits(Truck, _Model4);

		_createClass(Truck, [{
			key: "associate",
			value: function associate() {
				this.belongsTo("street", Street);
				this.hasOne("steeringWheel", SteeringWheel);
				this.hasMany("wheels", Wheel);
			}
		}, {
			key: "validate",
			value: function validate() {
				this.ensure("steeringWheel", _libValidationIsPresentJs2["default"]);
				this.ensure("street", _libValidationIsPresentJs2["default"]);
				this.ensure("wheels", _libValidationIsPresentJs2["default"]);
			}
		}]);

		return Truck;
	})(_2["default"]);

	var truck = undefined,
	    steeringWheel = undefined,
	    street = undefined,
	    trueValue = undefined,
	    falseValue = undefined;

	beforeEach(function () {

		_2["default"].database = new _almaden2["default"](databaseConfig);

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

	it("should be a function", function () {
		(typeof _libValidationIsPresentJs2["default"]).should.equal("function");
	});

	describe("(default error message)", function () {
		it("should return a default error message with failure", function () {});
	});

	describe("(association is present)", function () {
		describe("(as a property)", function () {
			beforeEach(function () {
				truck.wheels.push(new Wheel());
				truck.wheels.push(new Wheel());
				truck.wheels.push(new Wheel());
				truck.wheels.push(new Wheel());
				truck.steeringWheel = steeringWheel;
				truck.street = street;
			});

			describe("(hasOne)", function () {
				it("should return true", function (done) {
					_libValidationIsPresentJs2["default"].call(truck, "steeringWheel", function (error, result) {
						result.should.eql(trueValue);
						done();
					});
				});
			});

			describe("(hasMany)", function () {
				it("should return true if collections has elements", function (done) {
					_libValidationIsPresentJs2["default"].call(truck, "wheels", function (error, result) {
						result.should.eql(trueValue);
						done();
					});
				});
			});

			describe("(belongsTo)", function () {
				it("should return true", function (done) {
					_libValidationIsPresentJs2["default"].call(truck, "street", function (error, result) {
						result.should.eql(trueValue);
						done();
					});
				});
			});
		});

		describe("(on the database due to lazy loading)", function () {
			beforeEach(function () {
				_2["default"].database.mock({
					"select count(*) as `rowCount` from `wheels` where `truck_id` = 1": [{ rowCount: 1 }]
				});
				truck = new Truck();
				truck.id = 1;
				truck.steeringWheel = steeringWheel;
			});

			describe("(hasMany)", function () {
				it("should return true if collection is zero length but there are records on the database", function (done) {
					_libValidationIsPresentJs2["default"].call(truck, "wheels", function (error, result) {
						result.should.eql(trueValue);
						done();
					});
				});
			});
		});
	});

	describe("(association not present)", function () {
		describe("(when model is new)", function () {
			beforeEach(function () {
				delete truck.id;
			});

			describe("(when property is set)", function () {
				describe("(belongsTo)", function () {
					beforeEach(function () {
						truck.streetId = 1;
						truck.street = null;
					});
					it("should return true", function (done) {
						_libValidationIsPresentJs2["default"].call(truck, "street", function (error, result) {
							result.should.eql(trueValue);
							done();
						});
					});
				});

				describe("(on the database due to lazy loading)", function () {
					beforeEach(function () {
						_2["default"].database.mock({
							"select count(*) as `rowCount` from `wheels` where `truck_id` = 1": [{ rowCount: 0 }]
						});
						truck = new Truck();
						truck.steeringWheel = steeringWheel;
					});

					describe("(hasMany)", function () {
						it("should return false if collection is zero length AND there are no records on the database", function (done) {
							_libValidationIsPresentJs2["default"].call(truck, "wheels", function (error, result) {
								result.should.eql(falseValue);
								done();
							});
						});
					});
				});
			});

			describe("(when property not set)", function () {
				describe("(hasOne)", function () {
					it("should return false", function (done) {
						truck.steeringWheel = null;
						_libValidationIsPresentJs2["default"].call(truck, "steeringWheel", function (error, result) {
							result.should.eql(falseValue);
							done();
						});
					});
				});

				describe("(belongsTo)", function () {
					it("should return false when a belongsTo association is not present", function (done) {
						truck.street = null;
						_libValidationIsPresentJs2["default"].call(truck, "street", function (error, result) {
							result.should.eql(falseValue);
							done();
						});
					});
				});
			});

			describe("(hasMany)", function () {
				it("should return false when a hasMany association is not present", function (done) {
					delete truck.id;
					_libValidationIsPresentJs2["default"].call(truck, "wheels", function (error, result) {
						result.should.eql(falseValue);
						done();
					});
				});
			});
		});

		describe("(when model not new)", function () {
			beforeEach(function () {
				_2["default"].database.mock({});
			});

			describe("(hasOne)", function () {
				describe("(association not present in database)", function () {
					beforeEach(function () {
						_2["default"].database.mock({
							"select count(*) as `rowCount` from `steering_wheels` where `truck_id` = 1": [{ rowCount: 0 }]
						});
					});

					it("should return false", function (done) {
						_libValidationIsPresentJs2["default"].call(truck, "steeringWheel", function (error, result) {
							result.should.eql(falseValue);
							done();
						});
					});
				});

				describe("(association is present in database)", function () {
					beforeEach(function () {
						_2["default"].database.mock({
							"select count(*) as `rowCount` from `steering_wheels` where `truck_id` = 1": [{ rowCount: 1 }]
						});
					});

					it("should return true", function (done) {
						_libValidationIsPresentJs2["default"].call(truck, "steeringWheel", function (error, result) {
							result.should.eql(trueValue);
							done();
						});
					});
				});
			});

			describe("(belongsTo)", function () {
				describe("(association id is present)", function () {
					beforeEach(function () {
						truck.streetId = 1;
					});
					it("should return true", function (done) {
						_libValidationIsPresentJs2["default"].call(truck, "street", function (error, result) {
							result.should.eql(trueValue);
							done();
						});
					});
				});
				describe("(association id not present)", function () {
					it("should return false", function (done) {
						_libValidationIsPresentJs2["default"].call(truck, "street", function (error, result) {
							result.should.eql(falseValue);
							done();
						});
					});
				});
			});
		});
	});

	it("should return true when a hasMany association is present", function (done) {
		truck.id = undefined;
		truck.wheels.push(new Wheel());
		_libValidationIsPresentJs2["default"].call(truck, "wheels", function (error, result) {
			result.should.eql(trueValue);
			done();
		});
	});
});