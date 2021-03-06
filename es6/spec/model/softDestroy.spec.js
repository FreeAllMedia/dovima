import sinon from "sinon";
import Database from "almaden";
import Model from "../../../";
import databaseConfig from "../databaseConfig.json";

describe(".softDestroy(callback)", () => {

  class User extends Model {
    static useSoftDelete() {}
  }

  let user,
      saveQuery,
      clock;

  beforeEach(() => {
    clock = sinon.useFakeTimers();

    User.database = new Database(databaseConfig);
    user = new User({id: 1});

    saveQuery = User.database.spy(
      /update `users` set `deleted_at` = '.*', `updated_at` = '.*' where `id` = 1/
    );
  });

  afterEach(() => {
    clock.restore();
  });

  it("should set deletedAt on the model", () => {
    user.softDestroy((error) => {
      if (error) { throw error; }
      (user.deletedAt === undefined).should.not.be.true;
    });
  });

  it("should save the model", () => {
    user.constructor.prototype.save = sinon.spy(user.save);

    user.softDestroy((error) => {
      if (error) { throw error; }
      saveQuery.callCount.should.eql(1);
    });
  });
});
