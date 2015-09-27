import Database from "almaden";
import Model from "../../../";
import databaseConfig from "../databaseConfig.json";

describe("Model.find.where(...options)", () => {

  class User extends Model {}

  before(() => {
    User.database = new Database(databaseConfig);
    User.database.mock({}); // Catch-all for database
  });

  it("should add a where clause to the query", done => {
    const query = "select * from `users` where `some_id` = 1";
    const querySpy = User.database.spy(query, [{"some_id": 1}]);

    User
      .find
      .where("someId", 1)
      .results(() => {
        querySpy.callCount.should.eql(1);
        done();
      });
  });
});
