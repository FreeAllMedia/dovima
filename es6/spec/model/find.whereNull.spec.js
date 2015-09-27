import Database from "almaden";
import Model from "../../../";
import databaseConfig from "../databaseConfig.json";

describe("Model.find.whereNull(...options)", () => {

  class User extends Model {}

  before(() => {
    User.database = new Database(databaseConfig);
    User.database.mock({}); // Catch-all for database
  });

  it("should add a whereNull clause to the query", done => {
    const query = "select * from `users` where `deleted_at` is null";
    const querySpy = User.database.spy(query);

    User
      .find
      .whereNull("deleted_at")
      .results(() => {
        querySpy.callCount.should.eql(1);
        done();
      });
  });

  it("should add a whereNull clause to a query that already has a where clause", done => {
    const query = "select * from `users` where `group_id` = 3 and `deleted_at` is null";
    const querySpy = User.database.spy(query);

    User
      .find
      .where("group_id", 3)
      .whereNull("deleted_at")
      .results(() => {
        querySpy.callCount.should.eql(1);
        done();
      });
  });

  describe(".toString()", () => {
    it("should render the chain link", () => {
      User
        .find
        .whereNull("deleted_at")
        .toString().should.eql(`User.find.whereNull("deleted_at")`);
    });
  });
});
