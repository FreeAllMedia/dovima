import sinon from "sinon";
import Database from "almaden";
import Model from "../../../";
import databaseConfig from "../databaseConfig.json";

describe("Model(attributes, options)", () => {
  let user;

  // Example Class
  class User extends Model {
    initialize() {
      this.softDelete;
    }
  }

  beforeEach(() => {
    Model.database = new Database(databaseConfig);
    Model.database.mock({
      [/update `users` set `deleted_at` = '.*' where `id` = 1/]: [{}]
    });

    user = new User({
      id: 1,
      name: "Bob"
    });

    // Turn beforeDelete and delete into a spies
    //user.constructor.prototype.beforeDelete = sinon.spy(user.beforeDelete);
    //user.constructor.prototype.delete = sinon.spy(user.delete);
  });

  describe(".beforeDelete(callback)", () => {
    it("should be called before .delete", done => {
      user.delete(() => {
        //sinon.assert.callOrder(user.beforeDelete, deleteQuerySpy);
        done();
      });
    });
  });
});
