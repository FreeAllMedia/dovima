import Database from "almaden";
import Model from "../../../";
import databaseConfig from "../databaseConfig.json";

describe("Model.find.orderBy(columnName, direction)", () => {

  class User extends Model {}

  before(() => {
    User.database = new Database(databaseConfig);
    User.database.mock({}); // Catch-all for database
  });

  it("should add an order by clause to the query", done => {
    const query = "select * from `users` order by `id` asc";
    const querySpy = User.database.spy(query);

    User
      .find
      .orderBy("id", "asc")
      .results(() => {
        querySpy.callCount.should.eql(1);
        done();
      });
  });

  it("should default to ascending order", done => {
    const query = "select * from `users` order by `id` asc";
    const querySpy = User.database.spy(query);

    User
      .find
      .orderBy("id")
      .results(() => {
        querySpy.callCount.should.eql(1);
        done();
      });
  });

  it("should add multiple order by clauses to the query", done => {
    const query = "select * from `users` order by `id` asc, `name` desc";
    const querySpy = User.database.spy(query);

    User
      .find
      .orderBy("id", "asc")
      .orderBy("name", "desc")
      .results(() => {
        querySpy.callCount.should.eql(1);
        done();
      });
  });
});
