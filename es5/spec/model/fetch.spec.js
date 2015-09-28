"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _sinon = require("sinon");

var _sinon2 = _interopRequireDefault(_sinon);

var _almaden = require("almaden");

var _almaden2 = _interopRequireDefault(_almaden);

var _ = require("../../../");

var _2 = _interopRequireDefault(_);

var _databaseConfigJson = require("../databaseConfig.json");

var _databaseConfigJson2 = _interopRequireDefault(_databaseConfigJson);

var _testClassesJs = require("../testClasses.js");

describe(".fetch(callback)", function () {
  var user = undefined,
      userAttributes = undefined,
      clock = undefined;

  beforeEach(function () {
    clock = _sinon2["default"].useFakeTimers();

    _2["default"].database = new _almaden2["default"](_databaseConfigJson2["default"]);
    _2["default"].database.mock({}); // Catch-all for database

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
  });

  afterEach(function () {
    // Remove database from model to prevent
    // polluting another file via the prototype
    _2["default"].database = undefined;
    clock.restore();
  });

  describe("(Model.database is set)", function () {
    beforeEach(function () {
      _2["default"].database.mock({
        "select * from `users` where `id` = 1 limit 1": [userAttributes]
      });
    });

    describe("(when model has a primary key set)", function () {
      beforeEach(function () {
        user = new _testClassesJs.User({
          id: 1
        });
      });

      it("should fetch a record from the correct table", function (done) {
        user.fetch(function () {
          user.attributes.should.eql(userAttributes);
          done();
        });
      });

      it("should fetch a record from the correct table", function (done) {
        user.fetch(function () {
          user.attributes.should.eql(userAttributes);
          done();
        });
      });
    });

    describe("(when model does not have a primary key set)", function () {
      beforeEach(function () {
        delete user.id;
      });

      it("should throw an error", function () {
        (function () {
          user.fetch();
        }).should["throw"]("Cannot fetch this model by the 'id' field because it is not set.");
      });
    });

    describe("(when there is no model with that id)", function () {
      beforeEach(function () {
        _2["default"].database.mock({
          "select * from `users` where `id` = 1 limit 1": []
        });
        user = new _testClassesJs.User({
          id: 1
        });
      });

      it("should throw an error on the callback", function (done) {
        user.fetch(function (error) {
          error.should.be.instanceOf(Error);
          done();
        });
      });
    });
  });

  describe("(Model.database not set)", function () {
    beforeEach(function () {
      _2["default"].database = undefined;
    });

    it("should throw an error", function () {
      (function () {
        user.fetch();
      }).should["throw"]("Cannot fetch without Model.database set.");
    });
  });

  describe("(when the type of the strategy is a string)", function () {
    describe("(Model.database is set)", function () {
      beforeEach(function () {
        _2["default"].database.mock({
          "select * from `users` where `name` = 'someuser' limit 1": [userAttributes]
        });
      });

      describe("(when model has the specified attribute set)", function () {
        beforeEach(function () {
          user = new _testClassesJs.User({
            name: "someuser"
          });
        });

        it("should fetch a record from the correct table", function (done) {
          user.fetch("name", function () {
            user.attributes.should.eql(userAttributes);
            done();
          });
        });

        it("should fetch a record from the correct table", function (done) {
          user.fetch("name", function () {
            user.attributes.should.eql(userAttributes);
            done();
          });
        });
      });

      describe("(when model does not have the specified attribute set)", function () {
        beforeEach(function () {
          delete user.name;
        });

        it("should throw an error", function () {
          (function () {
            user.fetch("name");
          }).should["throw"]("Cannot fetch this model by the 'name' field because it is not set.");
        });
      });

      describe("(when there is no model with the specified attribute)", function () {
        beforeEach(function () {
          _2["default"].database.mock({
            "select * from `users` where `name` = 'someuser' limit 1": []
          });
          user = new _testClassesJs.User({
            name: "someuser"
          });
        });

        it("should throw an error on the callback", function (done) {
          user.fetch("name", function (error) {
            error.should.be.instanceOf(Error);
            done();
          });
        });
      });
    });

    describe("(Model.database not set)", function () {
      beforeEach(function () {
        _2["default"].database = undefined;
      });

      it("should throw an error", function () {
        (function () {
          user.fetch("name");
        }).should["throw"]("Cannot fetch without Model.database set.");
      });
    });
  });

  describe("(when the type of the strategy is an array)", function () {
    describe("(Model.database is set)", function () {
      beforeEach(function () {
        _2["default"].database.mock({
          "select * from `users` where `name` = 'someuser' and `lastName` = 'someuserLastName' limit 1": [userAttributes]
        });
      });

      describe("(when model has the specified attribute set)", function () {
        beforeEach(function () {
          user = new _testClassesJs.User({
            name: "someuser",
            lastName: "someuserLastName"
          });
          userAttributes.lastName = "someuserLastName";
        });

        it("should fetch a record from the correct table", function (done) {
          user.fetch(["name", "lastName"], function () {
            user.attributes.should.eql(userAttributes);
            done();
          });
        });

        it("should fetch a record from the correct table", function (done) {
          user.fetch(["name", "lastName"], function () {
            user.attributes.should.eql(userAttributes);
            done();
          });
        });
      });

      describe("(when model does not have one of the specified attributes set)", function () {
        beforeEach(function () {
          delete user.lastName;
        });

        it("should throw an error", function () {
          (function () {
            user.fetch(["name", "lastName"]);
          }).should["throw"]("Cannot fetch this model by the 'lastName' field because it is not set.");
        });
      });

      describe("(when there is no model with the specified attribute)", function () {
        beforeEach(function () {
          _2["default"].database.mock({
            "select * from `users` where `name` = 'someuser' and `lastName` = 'someuserLastName' limit 1": []
          });
          user = new _testClassesJs.User({
            name: "someuser",
            lastName: "someuserLastName"
          });
        });

        it("should throw an error on the callback", function (done) {
          user.fetch(["name", "lastName"], function (error) {
            error.should.be.instanceOf(Error);
            done();
          });
        });
      });
    });

    describe("(Model.database not set)", function () {
      beforeEach(function () {
        _2["default"].database = undefined;
      });

      it("should throw an error", function () {
        (function () {
          user.fetch("name");
        }).should["throw"]("Cannot fetch without Model.database set.");
      });
    });
  });
});