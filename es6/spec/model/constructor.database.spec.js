import Database from "almaden";
import Model from "../../../";
import databaseConfig from "../databaseConfig.json";

describe("Model.database", () => {

  class User extends Model {}

  before(() => {
    User.database = new Database(databaseConfig);
  });

  it("should add an and clause to the query conditionals", done => {
    const query = "select * from `users` where `id` = 1";
    const querySpy = User.database.spy(query);

    User
      .find
      .where("id", 1)
      .results(() => {
        querySpy.callCount.should.eql(1);
        done();
      });
  });
});
