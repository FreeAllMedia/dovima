"use strict";

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _ = require("../../../");

var _2 = _interopRequireDefault(_);

var _sinon = require("sinon");

var _sinon2 = _interopRequireDefault(_sinon);

describe(".mock.record(mockedRecord)", function () {

  var user = undefined,
      mockedRecord = undefined;

  var User = (function (_Model) {
    _inherits(User, _Model);

    function User() {
      _classCallCheck(this, User);

      _get(Object.getPrototypeOf(User.prototype), "constructor", this).apply(this, arguments);
    }

    return User;
  })(_2["default"]);

  beforeEach(function () {
    user = new User();

    mockedRecord = { id: 1, name: "Bob" };
    user.mock.record(mockedRecord);
  });

  it("should mock .save", function (done) {
    user.save(function (error, newId) {
      newId.should.eql(mockedRecord.id);
      done();
    });
  });

  it("should set .createdAt when record is new", function (done) {
    user.save(function (error) {
      if (error) {
        throw error;
      }
      (undefined === user.createdAt).should.not.be["true"];
      done();
    });
  });

  it("should set .updatedAt when record is not new", function (done) {
    user.id = 1;
    user.save(function (error) {
      if (error) {
        throw error;
      }
      (undefined === user.updatedAt).should.not.be["true"];
      done();
    });
  });

  it("should still call .beforeSave", function () {
    user.constructor.prototype.afterSave = _sinon2["default"].spy();

    user.save(function () {
      user.beforeSave.called.should.be["true"];
    });
  });

  it("should still call .afterSave", function () {
    user.constructor.prototype.afterSave = _sinon2["default"].spy();

    user.save(function () {
      user.afterSave.called.should.be["true"];
    });
  });

  it("should mock .fetch", function (done) {
    user.fetch(function () {
      user.attributes.should.eql(mockedRecord);
      done();
    });
  });

  it("should mock .delete", function (done) {
    user["delete"](done);
  });
});