"use strict";

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _almaden = require("almaden");

var _almaden2 = _interopRequireDefault(_almaden);

var _ = require("../../../");

var _2 = _interopRequireDefault(_);

describe("options.database", function () {
  var User = (function (_Model) {
    _inherits(User, _Model);

    function User() {
      _classCallCheck(this, User);

      _get(Object.getPrototypeOf(User.prototype), "constructor", this).apply(this, arguments);
    }

    return User;
  })(_2["default"]);

  var user = undefined,
      database = undefined;

  before(function () {
    database = new _almaden2["default"]({ client: "mysql" });
    user = new User({ id: 1 }, {
      database: database
    });
  });

  it("should be set to the .database property", function () {
    user.database.should.eql(database);
  });

  it("should use the supplied database object", function (done) {
    var query = "select * from `users` where `id` = 1 limit 1";
    var querySpy = database.spy(query, [{}]);

    user.fetch(function () {
      querySpy.callCount.should.eql(1);
      done();
    });
  });
});