"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _sinon = require("sinon");

var _sinon2 = _interopRequireDefault(_sinon);

var _ = require("../../../");

var _2 = _interopRequireDefault(_);

describe(".delete(callback)", function () {

  describe("(when useSoftDelete is set)", function () {
    var User = (function (_Model) {
      _inherits(User, _Model);

      function User() {
        _classCallCheck(this, User);

        _get(Object.getPrototypeOf(User.prototype), "constructor", this).apply(this, arguments);
      }

      _createClass(User, null, [{
        key: "useSoftDelete",
        value: function useSoftDelete() {}
      }]);

      return User;
    })(_2["default"]);

    var user = undefined;

    beforeEach(function () {
      user = User.mock.instance({ id: 1 });
    });

    it("should call .beforeDelete, then .softDestroy", function (done) {
      user.constructor.prototype.beforeDelete = _sinon2["default"].spy(user.beforeDelete);
      user.constructor.prototype.softDestroy = _sinon2["default"].spy(user.softDestroy);

      user["delete"](function () {
        user.beforeDelete.calledBefore(user.softDestroy).should.be["true"];
        done();
      });
    });

    it("should call .softDestroy, then .afterDelete", function (done) {
      user.constructor.prototype.afterDelete = _sinon2["default"].spy(user.afterDelete);
      user.constructor.prototype.softDestroy = _sinon2["default"].spy(user.softDestroy);

      user["delete"](function () {
        user.softDestroy.calledBefore(user.afterDelete).should.be["true"];
        done();
      });
    });
  });

  describe("(when useSoftDelete is NOT set)", function () {
    var User = (function (_Model2) {
      _inherits(User, _Model2);

      function User() {
        _classCallCheck(this, User);

        _get(Object.getPrototypeOf(User.prototype), "constructor", this).apply(this, arguments);
      }

      return User;
    })(_2["default"]);

    var user = undefined;

    beforeEach(function () {
      user = User.mock.instance({ id: 1 });
    });

    it("should call .beforeDelete, then .destroy", function (done) {
      user.constructor.prototype.beforeDelete = _sinon2["default"].spy(user.beforeDelete);
      user.constructor.prototype.destroy = _sinon2["default"].spy(user.destroy);

      user["delete"](function () {
        user.beforeDelete.calledBefore(user.destroy).should.be["true"];
        done();
      });
    });

    it("should call .destroy, then .afterDelete", function (done) {
      user.constructor.prototype.afterDelete = _sinon2["default"].spy(user.afterDelete);
      user.constructor.prototype.destroy = _sinon2["default"].spy(user.destroy);

      user["delete"](function () {
        user.destroy.calledBefore(user.afterDelete).should.be["true"];
        done();
      });
    });
  });
});