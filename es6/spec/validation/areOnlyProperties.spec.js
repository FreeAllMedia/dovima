import areOnlyProperties from "../../lib/validation/areOnlyProperties.js";
import Model from "../../../";
import Database from "almaden";

const databaseConfig = require("../databaseConfig.json");

describe("areOnlyProperties(propertyNames, callback)", () => {

  class User extends Model {
    validate() {
      this.ensure(["name", "age"], areOnlyProperties);
    }
  }

  it("should return true when designated attributes are the only attributes set on the model", done => {
    const user = new User({
      name: "Bob",
      age: 46
    });

    user.isValid((isValid) => {
      isValid.should.be.true;
      done();
    });
  });

  it("should return false when designated attributes are not the only attributes set on the model", done => {
    const user = new User({
      name: "Bob",
      age: 46,
      favoriteColor: "Green"
    });

    user.isValid((isValid) => {
      isValid.should.be.false;
      done();
    });
  });
});
