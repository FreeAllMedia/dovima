import Database from "almaden";
import Model from "../../../";
import databaseConfig from "../databaseConfig.json";

describe("Model.find.orWhere(...options)", () => {

  class User extends Model {}

  before(() => {
    User.database = new Database(databaseConfig);
    User.database.mock({}); // Catch-all for database
  });

  it("should add an or clause to the query conditionals", done => {
    const query = "select * from `users` where `some_id` = 1 or `last_name` = 'Jones'";
    const querySpy = User.database.spy(query);

    User
      .find
      .where("someId", 1)
      .orWhere("last_name", "Jones")
      .results(() => {
        querySpy.callCount.should.eql(1);
        done();
      });
  });
});
