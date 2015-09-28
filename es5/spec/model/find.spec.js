"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _almaden = require("almaden");

var _almaden2 = _interopRequireDefault(_almaden);

var _libCollectionJs = require("../../lib/collection.js");

var _libCollectionJs2 = _interopRequireDefault(_libCollectionJs);

var _ = require("../../../");

var _2 = _interopRequireDefault(_);

var _libModelFinderJs = require("../../lib/modelFinder.js");

var _testClassesJs = require("../testClasses.js");

var _databaseConfigJson = require("../databaseConfig.json");

var _databaseConfigJson2 = _interopRequireDefault(_databaseConfigJson);

var userFixtures = require("../fixtures/users.json");

describe("Model.find", function () {
  var users = undefined,
      userCollection = undefined;

  before(function () {
    _2["default"].database = new _almaden2["default"](_databaseConfigJson2["default"]);
    _2["default"].database.mock({}); // Catch-all for database
  });

  after(function () {
    // Remove database from model to prevent
    // polluting another file via the prototype
    _2["default"].database = undefined;
  });

  beforeEach(function (done) {
    userCollection = new _libCollectionJs2["default"](_testClassesJs.User);
    userFixtures.forEach(function (userFiture) {
      userCollection.push(new _testClassesJs.User(userFiture));
    });

    _2["default"].database.mock({
      "select * from `users` where `mom_id` = 1": userFixtures
    });

    _testClassesJs.User.find.where("momId", "=", 1).results(function (error, fetchedUsers) {
      users = fetchedUsers;
      done();
    });
  });

  it("should return a ModelQuery instance", function () {
    _testClassesJs.User.find.should.be.instanceOf(_libModelFinderJs.ModelQuery);
  });

  it("should return a collection", function () {
    users.should.be.instanceOf(_libCollectionJs2["default"]);
  });

  it("should return the right collection", function () {
    users.should.eql(userCollection);
  });

  it("should allow to search all models that matchs a certain condition", function () {
    users.length.should.equal(5);
  });

  describe(".all", function () {
    beforeEach(function (done) {
      _testClassesJs.User.find.all.where("momId", 1).results(function (error, fetchedUsers) {
        users = fetchedUsers;
        done();
      });
    });

    it("should return just all users matching the condition", function () {
      users.length.should.equal(5);
    });
  });

  describe(".deleted", function () {
    var SoftUser = (function (_Model) {
      _inherits(SoftUser, _Model);

      function SoftUser() {
        _classCallCheck(this, SoftUser);

        _get(Object.getPrototypeOf(SoftUser.prototype), "constructor", this).apply(this, arguments);
      }

      _createClass(SoftUser, [{
        key: "initialize",
        value: function initialize() {
          this.softDelete;
        }
      }]);

      return SoftUser;
    })(_2["default"]);

    beforeEach(function (done) {
      _2["default"].database.mock({
        "select * from `soft_users` where `mom_id` = 1 and `deleted_at` is not null": userFixtures
      });

      SoftUser.find.all.where("momId", 1).deleted.results(function (error, fetchedUsers) {
        users = fetchedUsers;
        done();
      });
    });

    it("should return just all users matching the condition", function () {
      users.length.should.equal(5);
    });
  });

  describe("(with a different database for a model)", function () {
    var Car = (function (_Model2) {
      _inherits(Car, _Model2);

      function Car() {
        _classCallCheck(this, Car);

        _get(Object.getPrototypeOf(Car.prototype), "constructor", this).apply(this, arguments);
      }

      return Car;
    })(_2["default"]);

    var car = undefined,
        database = undefined,
        query = undefined;

    describe("(static way)", function () {
      beforeEach(function () {
        database = new _almaden2["default"](_databaseConfigJson2["default"]);
        Car.database = database;
        query = database.spy("select * from `cars`", []);
        car = new Car();
      });

      it("should use the specific model class database", function (done) {
        Car.find.all.results(function () {
          query.callCount.should.equal(1);
          done();
        });
      });
    });

    describe("(instance way)", function () {
      beforeEach(function () {
        database = new _almaden2["default"](_databaseConfigJson2["default"]);
        Car.database = null;
        car = new Car({ id: 2 }, { database: database });
        query = database.spy("select * from `cars` where `id` = 2 limit 1", []);
      });

      it("should use the specific model instance database", function (done) {
        car.fetch(function () {
          query.callCount.should.equal(1);
          done();
        });
      });
    });
  });
});