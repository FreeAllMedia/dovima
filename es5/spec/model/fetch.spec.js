"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
    return clock.restore();
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

      describe("(when soft delete is enabled)", function () {
        var post = undefined,
            deleteQuerySpy = undefined;

        var Post = (function (_Model) {
          _inherits(Post, _Model);

          function Post() {
            _classCallCheck(this, Post);

            _get(Object.getPrototypeOf(Post.prototype), "constructor", this).apply(this, arguments);
          }

          _createClass(Post, [{
            key: "initialize",
            value: function initialize() {
              this.softDelete;
            }
          }]);

          return Post;
        })(_2["default"]);

        beforeEach(function () {
          post = new Post({ id: 1 });
          //querySpy
          deleteQuerySpy = _2["default"].database.spy("select * from `posts` where `id` = 1 and `deleted_at` is null limit 1", [{}]);
        });

        it("should add a where deleted is not null condition", function (done) {
          post.fetch(function () {
            deleteQuerySpy.callCount.should.equal(1);
            done();
          });
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
      delete _2["default"].database;
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
        delete _2["default"].database;
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
        delete _2["default"].database;
      });

      it("should throw an error", function () {
        (function () {
          user.fetch("name");
        }).should["throw"]("Cannot fetch without Model.database set.");
      });
    });
  });
});