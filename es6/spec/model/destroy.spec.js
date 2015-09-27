import sinon from "sinon";
import Database from "almaden";
import Model from "../../../";
import databaseConfig from "../databaseConfig.json";

describe(".destroy(callback)", () => {
  class User extends Model {}

  let user;

  beforeEach(() => {
    User.database = new Database(databaseConfig);
    user = new User({id: 1});
  });

  it("should delete the record from the database");
});
