import Database from "almaden";
import Model from "../../../";
import databaseConfig from "../databaseConfig.json";

describe("Model.find.one", () => {

  class User extends Model {}

  before(() => {
    User.database = new Database(databaseConfig);
    User.database.mock({}); // Catch-all for database
  });

  it("should return a single record", done => {
    const mockRecord = {id: 1, name: "Bob"};
    User.database.mock({
      "select * from `users` where `id` = 1 limit 1":
        [mockRecord]
    });

    User
      .find
      .one
      .where("id", mockRecord.id)
      .results((error, user) => {
        if (error) { throw error; }
        user.name.should.eql(mockRecord.name);
        done();
      });
  });
});
