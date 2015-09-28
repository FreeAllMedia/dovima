import Database from "almaden";
import Model from "../../../";
import databaseConfig from "../databaseConfig.json";

describe("Model.useSoftDelete", () => {

  class User extends Model {
    static useSoftDelete() {}
  }

  before(() => {
    User.database = new Database(databaseConfig);
    User.database.mock({}); // Catch-all for database
  });

  it("should automatically add a where deleted_at = null clause to all select queries", done => {
    const query = "select * from `users` where `deleted_at` is null and `id` = 1";
    const querySpy = User.database.spy(query);

    User
      .find
      .where("id", 1)
      .results(() => {
        querySpy.callCount.should.eql(1);
        done();
      });
  });

  describe(".toString()", () => {
    it("should render the chain link for find", () => {
      User
        .find
        .where("id", 1)
        .toString().should.eql(`User.find.where("id", 1).whereNull("deletedAt")`);
    });

    it("should render the chain link for count", () => {
      User
        .count
        .where("id", 1)
        .toString().should.eql(`User.count.where("id", 1).whereNull("deletedAt")`);
    });
  });
});
