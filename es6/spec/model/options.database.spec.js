import Database from "almaden";
import Model from "../../../";
import databaseConfig from "../databaseConfig.json";

describe("options.database", () => {

  class User extends Model {}

  let user,
      database;

  before(() => {
    database = new Database(databaseConfig);
    user = new User({id: 1}, {
      database: database
    });
  });

  it("should be set to the .database property", () => {
    user.database.should.eql(database);
  });

  it("should use the supplied database object", done => {
    const query = "select * from `users` where `id` = 1 limit 1";
    const querySpy = database.spy(query, [{}]);

    user.fetch(() => {
      querySpy.callCount.should.eql(1);
      done();
    });
  });
});
