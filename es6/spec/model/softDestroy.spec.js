import sinon from "sinon";
import Database from "almaden";
import Model from "../../../";
import databaseConfig from "../databaseConfig.json";

describe(".softDestroy(callback)", () => {

  class User extends Model {
    static useSoftDelete() {}
  }

  let user;

  beforeEach(() => {
    User.database = new Database(databaseConfig);
    user = new User({id: 1});
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
      user.save.called.should.be.true;
    });
  });
});
