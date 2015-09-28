import Database from "almaden";
import Model from "../../../";
import databaseConfig from "../databaseConfig.json";

describe("Model.find.limit(numberOfRows)", () => {

  class User extends Model {}

  before(() => {
    User.database = new Database(databaseConfig);
    User.database.mock({}); // Catch-all for database
  });

  it("should add a where clause to the query", done => {
    const query = "select * from `users` limit 2";
    const querySpy = User.database.spy(query, [{id: 1}, {id: 2}]);

    User
      .find
      .limit(2)
      .results(() => {
        querySpy.callCount.should.eql(1);
        done();
      });
  });
});
