"use strict";

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _ = require("../../../");

var _2 = _interopRequireDefault(_);

describe(".toString()", function () {
  var User = (function (_Model) {
    _inherits(User, _Model);

    function User() {
      _classCallCheck(this, User);

      _get(Object.getPrototypeOf(User.prototype), "constructor", this).apply(this, arguments);
    }

    return User;
  })(_2["default"]);

  describe("User.find.one.where(\"id\", 1)", function () {
    it("should return a string representation of the chain", function () {
      User.find.one.where("id", 1).toString().should.eql("User.find.one.where(\"id\", 1)");
    });
    it("should not matter which order the chain is called in", function () {
      User.find.where("id", 1).one.toString().should.eql("User.find.one.where(\"id\", 1)");
    });
  });

  describe("User.find.all.where(\"id\", 1)", function () {
    it("should return a string representation of the chain", function () {
      User.find.all.where("id", 1).toString().should.eql("User.find.all.where(\"id\", 1)");
    });
  });

  describe("User.find.where(\"id\", \"<\", 10).andWhere(\"id\", \">\", 1)", function () {
    it("should return a string representation of the chain", function () {
      User.find.where("id", "<", 10).andWhere("id", ">", 1).toString().should.eql("User.find.where(\"id\", \"<\", 10).andWhere(\"id\", \">\", 1)");
    });
  });

  describe("User.find.where(\"id\", \"<\", 10).andWhere(\"id\", \">\", 1).andWhere(\"id\", \"!=\", 3)", function () {
    it("should return a string representation of the chain", function () {
      User.find.where("id", "<", 10).andWhere("id", ">", 1).andWhere("id", "!=", 3).toString().should.eql("User.find.where(\"id\", \"<\", 10).andWhere(\"id\", \">\", 1).andWhere(\"id\", \"!=\", 3)");
    });
  });

  describe("User.find.where(\"id\", \"<\", 10).orWhere(\"id\", \">\", 1)", function () {
    it("should return a string representation of the chain", function () {
      User.find.where("id", "<", 10).orWhere("id", ">", 1).toString().should.eql("User.find.where(\"id\", \"<\", 10).orWhere(\"id\", \">\", 1)");
    });
  });

  describe("User.find.where(\"id\", \"<\", 10).groupBy(\"categoryId\")", function () {
    it("should return a string representation of the chain", function () {
      User.find.where("id", "<", 10).groupBy("categoryId").toString().should.eql("User.find.where(\"id\", \"<\", 10).groupBy(\"categoryId\")");
    });
  });

  describe("User.find.where(\"id\", \"<\", 10).orderBy(\"categoryId\")", function () {
    it("should return a string representation of the chain", function () {
      User.find.where("id", "<", 10).orderBy("categoryId", "desc").toString().should.eql("User.find.where(\"id\", \"<\", 10).orderBy(\"categoryId\", \"desc\")");
    });
  });

  describe("User.find.where(\"id\", \">\", 2).limit(4)", function () {
    it("should return a string representation of the chain", function () {
      User.find.where("id", ">", 2).limit(4).toString().should.eql("User.find.where(\"id\", \">\", 2).limit(4)");
    });
  });

  describe("User.count.where(\"id\", 1)", function () {
    it("should return a string representation of the chain", function () {
      User.count.where("id", 1).toString().should.eql("User.count.where(\"id\", 1)");
    });
  });
});