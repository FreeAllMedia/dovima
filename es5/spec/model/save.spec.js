"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _sinon = require("sinon");

var _sinon2 = _interopRequireDefault(_sinon);

var _almaden = require("almaden");

var _almaden2 = _interopRequireDefault(_almaden);

var _ = require("../../../");

var _2 = _interopRequireDefault(_);

var _databaseConfigJson = require("../databaseConfig.json");

var _databaseConfigJson2 = _interopRequireDefault(_databaseConfigJson);

var _testClassesJs = require("../testClasses.js");

describe("Model(attributes, options)", function () {
  var model = undefined,
      user = undefined,
      userAttributes = undefined,
      photo = undefined,
      primaryPhoto = undefined,
      clock = undefined;

  beforeEach(function () {
    // TODO: Clean this up into the bare minimum necessary for this file
    clock = _sinon2["default"].useFakeTimers();

    _2["default"].database = new _almaden2["default"](_databaseConfigJson2["default"]);

    // Throw if query is not caught and mocked.
    _2["default"].database.mock({});

    model = new _2["default"]();

    userAttributes = {
      id: 1,
      name: "Bob Builder",
      age: 35,
      hasChildren: false,
      addressId: undefined,
      primaryPhotoId: undefined,
      postalCodeId: undefined
    };

    user = new _testClassesJs.User(userAttributes);
    photo = new _testClassesJs.Photo();
    primaryPhoto = new _testClassesJs.Photo();
  });

  afterEach(function () {
    return clock.restore();
  });

  describe(".save(callback)", function () {
    describe("(Model.database is Set)", function () {
      describe("(When Model Has Associations)", function () {

        beforeEach(function () {
          var _Model$database$mock;

          user.primaryPhoto = primaryPhoto;
          user.photos.push(photo);

          // TODO: Clean this whole section up into something more concise.

          var regularExpressions = {
            insertPhotos: /insert into `photos` \(`created_at`, `user_id`\) values \('19[0-9][0-9]-[0-9][0-9]-[0-9][0-9] [0-9][0-9]:00:00.000', 1\)/,
            updateUser: /update `users` set `age` = 35, `has_children` = false, `name` = 'Bob Builder', `updated_at` = '19[0-9][0-9]-[0-9][0-9]-[0-9][0-9] [0-9][0-9]:00:00.000' where `id` = 1/,
            insertWheels: /insert into `wheels` \(`created_at`, `truck_id`\) values \('19[0-9][0-9]-[0-9][0-9]-[0-9][0-9] [0-9][0-9]:00:00\.000', 1\)/,
            insertSteeringWheel: /insert into `steering_wheels` \(`created_at`, `truck_id`\) values \('19[0-9][0-9]-[0-9][0-9]-[0-9][0-9] [0-9][0-9]:00:00.000', 1\)/,
            insertTruck: /insert into `trucks` (`created_at`) values ('19[0-9][0-9]-[0-9][0-9]-[0-9][0-9] [0-24]:00:00.000')/,
            updateTruck: /update `trucks` set `steering_wheel_id` = 1, `updated_at` = '19[0-9][0-9]-[0-9][0-9]-[0-9][0-9] [0-9][0-9]:00:00.000' where `id` = 1/,
            updateSteeringWheel: /update `steering_wheels` set `truck_id` = 1, `updated_at` = '19[0-9][0-9]-[0-9][0-9]-[0-9][0-9] [0-9][0-9]:00:00.000' where `id` = 1/,
            updateWheels: /update `wheels` set `created_at` = '19[0-9][0-9]-[0-9][0-9]-[0-9][0-9] [0-9][0-9]:00:00.000', `truck_id` = 1, `updated_at` = '19[0-9][0-9]-[0-9][0-9]-[0-9][0-9] [0-9][0-9]:00:00.000' where `id` = 1/
          };

          _2["default"].database.mock((_Model$database$mock = {}, _defineProperty(_Model$database$mock, regularExpressions.insertPhotos, [1]), _defineProperty(_Model$database$mock, regularExpressions.updateUser, []), _defineProperty(_Model$database$mock, regularExpressions.insertWheels, [1]), _defineProperty(_Model$database$mock, regularExpressions.insertSteeringWheel, [1]), _defineProperty(_Model$database$mock, regularExpressions.insertTruck, [1]), _defineProperty(_Model$database$mock, regularExpressions.updateTruck, [1]), _defineProperty(_Model$database$mock, regularExpressions.updateSteeringWheel, [1]), _defineProperty(_Model$database$mock, regularExpressions.updateWheels, [1]), _Model$database$mock));
        });

        describe("(Association Operations)", function () {
          var wheelSaveSpy = undefined,
              steeringWheelSaveSpy = undefined,
              truck = undefined,
              owner = undefined,
              wheel = undefined,
              steeringWheel = undefined;

          var TruckOwner = (function (_Model) {
            _inherits(TruckOwner, _Model);

            function TruckOwner() {
              _classCallCheck(this, TruckOwner);

              _get(Object.getPrototypeOf(TruckOwner.prototype), "constructor", this).apply(this, arguments);
            }

            _createClass(TruckOwner, [{
              key: "associate",
              value: function associate() {
                this.belongsTo("truck");
                this.belongsTo("owner");
              }
            }]);

            return TruckOwner;
          })(_2["default"]);

          var Truck = (function (_Model2) {
            _inherits(Truck, _Model2);

            function Truck() {
              _classCallCheck(this, Truck);

              _get(Object.getPrototypeOf(Truck.prototype), "constructor", this).apply(this, arguments);
            }

            _createClass(Truck, [{
              key: "associate",
              value: function associate() {
                this.hasMany("truckOwners");
                this.hasMany("owners", Owner).through("truckOwners");
                this.hasMany("wheels", Wheel);
                this.hasOne("steeringWheel", SteeringWheel);
              }
            }]);

            return Truck;
          })(_2["default"]);

          var Owner = (function (_Model3) {
            _inherits(Owner, _Model3);

            function Owner() {
              _classCallCheck(this, Owner);

              _get(Object.getPrototypeOf(Owner.prototype), "constructor", this).apply(this, arguments);
            }

            _createClass(Owner, [{
              key: "associate",
              value: function associate() {
                this.hasMany("truckOwners", TruckOwner);
                this.hasMany("trucks", Truck).through("truckOwners");
              }
            }]);

            return Owner;
          })(_2["default"]);

          var Wheel = (function (_Model4) {
            _inherits(Wheel, _Model4);

            function Wheel() {
              _classCallCheck(this, Wheel);

              _get(Object.getPrototypeOf(Wheel.prototype), "constructor", this).apply(this, arguments);
            }

            _createClass(Wheel, [{
              key: "associate",
              value: function associate() {
                this.belongsTo("truck", Truck);
              }
            }, {
              key: "save",
              value: function save(callback) {
                wheelSaveSpy(callback);
                _get(Object.getPrototypeOf(Wheel.prototype), "save", this).call(this, callback);
              }
            }]);

            return Wheel;
          })(_2["default"]);

          var SteeringWheel = (function (_Model5) {
            _inherits(SteeringWheel, _Model5);

            function SteeringWheel() {
              _classCallCheck(this, SteeringWheel);

              _get(Object.getPrototypeOf(SteeringWheel.prototype), "constructor", this).apply(this, arguments);
            }

            _createClass(SteeringWheel, [{
              key: "associate",
              value: function associate() {
                this.belongsTo("truck", Truck);
              }
            }, {
              key: "save",
              value: function save(callback) {
                steeringWheelSaveSpy(callback);
                _get(Object.getPrototypeOf(SteeringWheel.prototype), "save", this).call(this, callback);
              }
            }]);

            return SteeringWheel;
          })(_2["default"]);

          describe("(Assignment)", function () {

            beforeEach(function () {
              wheelSaveSpy = _sinon2["default"].spy();
              steeringWheelSaveSpy = _sinon2["default"].spy();

              truck = new Truck();
              owner = new Owner();
              wheel = new Wheel();
              steeringWheel = new SteeringWheel();
            });

            it("should throw when assign a non model object to a belongsTo association", function () {
              (function () {
                steeringWheel.truck = {};
              }).should["throw"]("Cannot set a non model entity onto this property. It should inherit from Model");
            });

            it("should throw when assign a non model object to a hasOne association", function () {
              (function () {
                truck.steeringWheel = {};
              }).should["throw"]("Cannot set a non model entity onto this property. It should inherit from Model");
            });

            it("should associate a hasOne from a belongsTo", function () {
              steeringWheel.truck = truck;
              truck.should.have.property("steeringWheel");
            });

            // TODO: This is impossible as is
            xit("should associate a hasMany from a belongsTo", function () {
              wheel.truck = truck;
              truck.wheels.length.should.equal(1);
            });

            it("should associate a belongsTo from a hasMany", function () {
              truck.wheels.push(wheel);
              wheel.truck.should.eql(truck);
            });

            it("should associate a hasMany from a hasMany", function () {
              truck.owners.push(owner);
              owner.trucks[0].should.eql(truck);
            });

            it("should associate a belongsTo from a hasOne", function () {
              truck.steeringWheel = steeringWheel;
              steeringWheel.truck.should.eql(truck);
            });
          });

          describe("(Propagation)", function () {
            beforeEach(function () {
              wheelSaveSpy = _sinon2["default"].spy();
              steeringWheelSaveSpy = _sinon2["default"].spy();

              truck = new Truck({ id: 1 });
              wheel = new Wheel();
              steeringWheel = new SteeringWheel();
              steeringWheel.id = 1;

              truck.steeringWheel = steeringWheel;

              //TODO: wrap push on typed collection?
              wheel.truck = truck;
              truck.wheels.push(wheel);
            });

            it("should propagate .save() to hasOne associations", function (done) {
              truck.save(function () {
                steeringWheelSaveSpy.calledOnce.should.be["true"];
                done();
              });
            });

            it("should propagate .save() to hasMany associations", function (done) {
              truck.save(function () {
                wheelSaveSpy.called.should.be["true"];
                done();
              });
            });
          });
        });
      });

      describe("(Model is Valid)", function () {

        describe("(Model is New)", function () {
          beforeEach(function () {
            _2["default"].database.insert = _sinon2["default"].spy(_2["default"].database.insert);

            _2["default"].database.mock(_defineProperty({}, /insert into `models` \(`created_at`\) values \('19[0-9][0-9]-[0-9][0-9]-[0-9][0-9] [0-9][0-9]:00:00.000'\)/, [{}]));
          });

          it("should insert the record into the database", function () {
            model.save(function () {
              _2["default"].database.insert.called.should.be["true"];
            });
          });
        });

        describe("(Model is NOT New)", function () {
          beforeEach(function () {
            model.id = 1;

            _2["default"].database.update = _sinon2["default"].spy(_2["default"].database.update);

            _2["default"].database.mock(_defineProperty({}, /update `models` set `updated_at` = '19[0-9][0-9]-[0-9][0-9]-[0-9][0-9] [0-9][0-9]:00:00.000' where `id` = 1/, [{}]));
          });

          it("should update the record in the database", function () {
            model.save(function () {
              _2["default"].database.update.called.should.be["true"];
            });
          });
        });
      });

      describe("(Model is NOT Valid)", function () {
        beforeEach(function () {
          _2["default"].database.mock({
            "select count(*) as `rowCount` from `photos` where `user_id` = 1": [{ rowCount: 0 }]
          });
        });

        it("should call back with an error", function () {
          user.save(function (error) {
            error.should.be.instanceOf(Error);
          });
        });

        it("should inform the user that the model is invalid", function () {
          user.save(function (error) {
            error.message.should.eql("photos must be present on User");
          });
        });
      });
    });

    describe("(Model.database is NOT set)", function () {
      beforeEach(function () {
        delete _2["default"].database;
      });

      it("should call back with an error", function () {
        (function () {
          user.save();
        }).should["throw"]("Cannot save without Model.database set.");
      });
    });
  });
});