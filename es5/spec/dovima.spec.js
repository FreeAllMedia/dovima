"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _libDovimaJs = require("../lib/dovima.js");

var _libDovimaJs2 = _interopRequireDefault(_libDovimaJs);

describe("Dovima", function () {
	var component = undefined;

	before(function () {
		component = new _libDovimaJs2["default"]();
	});

	it("should say something", function () {
		component.saySomething().should.equal("Something");
	});
});