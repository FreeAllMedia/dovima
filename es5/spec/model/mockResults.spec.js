"use strict";

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _ = require("../../../");

var _2 = _interopRequireDefault(_);

describe(".mockResults(callback)", function () {

  var mockedValue = undefined;

  var User = (function (_Model) {
    _inherits(User, _Model);

    function User() {
      _classCallCheck(this, User);

      _get(Object.getPrototypeOf(User.prototype), "constructor", this).apply(this, arguments);
    }

    return User;
  })(_2["default"]);

  beforeEach(function () {
    mockedValue = { id: 1, name: "Bob" };
    User.find.one.where("id", 1).mockResults(mockedValue);
  });

  it("should return itself so that chaining is possible", function () {
    var query = User.find;
    query.mockResults().should.eql(query);
  });

  it("should return the mocked value on subsequent calls of the same type", function (done) {
    User.find.one.where("id", 1).results(function (error, data) {
      data.should.eql(mockedValue);
      done();
    });
  });

  // it("should return the mocked value when using regex values", done => {
  //   User.find.one.where("createdAt", /.*/).mockResults(mockedValue);
  //
  //   User.find.one.where("createdAt", "2014-10-08 10:16:34").results((error, data) => {
  //     data.should.eql(mockedValue);
  //     done();
  //   });
  // });

  it("should not matter which order the chain is called in", function () {
    User.find.where("id", 1).one.results(function (error, data) {
      data.should.eql(mockedValue);
    });
  });

  it("should not affect calls with different parameters", function () {
    (function () {
      User.find.one.where("id", 2).results();
    }).should["throw"]("Cannot find models without a database set.");
  });

  it("should not affect calls with a different chain", function () {
    (function () {
      User.find.all.where("id", 1).results();
    }).should["throw"]("Cannot find models without a database set.");
  });
});