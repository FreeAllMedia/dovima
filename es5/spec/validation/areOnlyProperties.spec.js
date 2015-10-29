"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _libValidationAreOnlyPropertiesJs = require("../../lib/validation/areOnlyProperties.js");

var _libValidationAreOnlyPropertiesJs2 = _interopRequireDefault(_libValidationAreOnlyPropertiesJs);

var _ = require("../../../");

var _2 = _interopRequireDefault(_);

var _almaden = require("almaden");

var _almaden2 = _interopRequireDefault(_almaden);

var databaseConfig = require("../databaseConfig.json");

describe("areOnlyProperties(propertyNames, callback)", function () {
  var User = (function (_Model) {
    _inherits(User, _Model);

    function User() {
      _classCallCheck(this, User);

      _get(Object.getPrototypeOf(User.prototype), "constructor", this).apply(this, arguments);
    }

    _createClass(User, [{
      key: "validate",
      value: function validate() {
        this.ensure(["name", "age"], _libValidationAreOnlyPropertiesJs2["default"]);
      }
    }]);

    return User;
  })(_2["default"]);

  it("should return true when designated attributes are the only attributes set on the model", function (done) {
    var user = new User({
      name: "Bob",
      age: 46
    });

    user.isValid(function (isValid) {
      isValid.should.be["true"];
      done();
    });
  });

  it("should return false when designated attributes are not the only attributes set on the model", function (done) {
    var user = new User({
      name: "Bob",
      age: 46,
      favoriteColor: "Green"
    });

    user.isValid(function (isValid) {
      isValid.should.be["false"];
      done();
    });
  });
});