"use strict";

var _proven = require("proven");

var index = require("../../index.js");

describe("index.js", function () {
  it("should have a shortcut to proven's isNotEmpty", function () {
    index.isNotEmpty.should.eql(_proven.isNotEmpty);
  });
});