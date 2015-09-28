import Database from "almaden";
import Model from "../../../";
import databaseConfig from "../databaseConfig.json";

describe("Model.find.groupBy(columnName)", () => {

  class User extends Model {}

  before(() => {
    User.database = new Database(databaseConfig);
    User.database.mock({}); // Catch-all for database
  });

  it("should add an group by clause to the query", done => {
    const query = "select * from `users` group by `age`";
    const querySpy = User.database.spy(query);

    User
      .find
      .groupBy("age")
      .results(() => {
        querySpy.callCount.should.eql(1);
        done();
      });
  });

  it("should add multiple group by clauses to the query", done => {
    const query = "select * from `users` group by `age`, `last_name`";
    const querySpy = User.database.spy(query);

    User
      .find
      .groupBy("age", "last_name")
      .results(() => {
        querySpy.callCount.should.eql(1);
        done();
      });
  });
});
