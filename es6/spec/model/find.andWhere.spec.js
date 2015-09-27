import Database from "almaden";
import Model from "../../../";
import databaseConfig from "../databaseConfig.json";

describe("Model.find.andWhere(...options)", () => {

  class User extends Model {}

  before(() => {
    User.database = new Database(databaseConfig);
    User.database.mock({}); // Catch-all for database
  });

  it("should add an and clause to the query conditionals", done => {
    const query = "select * from `users` where `some_id` = 1 and `last_name` = 'Jones'";
    const querySpy = User.database.spy(query);

    User
      .find
      .where("someId", 1)
      .andWhere("last_name", "Jones")
      .results(() => {
        querySpy.callCount.should.eql(1);
        done();
      });
  });
});
