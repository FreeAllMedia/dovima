import {isNotEmpty} from "proven";

const index = require("../../index.js");

describe("index.js", () => {
  it("should have a shortcut to proven's isNotEmpty", () => {
    index.isNotEmpty.should.eql(isNotEmpty);
  });
});
