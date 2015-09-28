"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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

describe("Model(attributes, options)", function () {
  var model = undefined,
      attributes = undefined,
      afterSaveSpy = undefined;

  // Example Class

  var User = (function (_Model) {
    _inherits(User, _Model);

    function User() {
      _classCallCheck(this, User);

      _get(Object.getPrototypeOf(User.prototype), "constructor", this).apply(this, arguments);
    }

    _createClass(User, [{
      key: "afterSave",
      value: function afterSave(callback) {
        afterSaveSpy();
        callback();
      }
    }]);

    return User;
  })(_2["default"]);

  beforeEach(function () {
    afterSaveSpy = _sinon2["default"].spy();

    User.database = new _almaden2["default"](_databaseConfigJson2["default"]);
    // Mock save query
    User.database.mock(_defineProperty({}, /insert into `users` \(`created_at`, `name`\) values \('.*', 'Bob'\)/, [{ "created_at": Date.now, "name": "Bob" }]));

    // Instantiate model
    attributes = {
      name: "Bob"
    };

    model = new User(attributes);
  });

  describe(".afterSave(done)", function () {
    describe("(With Callback)", function () {
      it("should be called after .save", function (done) {
        // throw util.inspect(model.afterSave, true, 4);
        model.save(function (error) {
          if (error) {
            throw error;
          }
          afterSaveSpy.called.should.be["true"];
          done();
        });
      });

      // TODO: Enhance with callback waiting
      it("should make the .save callback wait for the .afterSave callback");
    });

    // TODO: Enhance with synchronous hook
    describe("(Without Callback)", function () {
      it("should be called after .save is complete");
    });
  });
});