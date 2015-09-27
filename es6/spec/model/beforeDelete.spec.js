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
    User.database = new Database(databaseConfig);
    User.database.mock({
      [/update `users` set `deleted_at` = '.*' where `id` = 1/]: [{}]
    });

    user = new User({
      id: 1,
      name: "Bob"
    });

    // Turn beforeDelete and delete into a spies
    user.constructor.prototype.beforeDelete = sinon.spy(user.beforeDelete);
    //user.constructor.prototype.delete = sinon.spy(user.delete);
  });

  describe(".beforeDelete(callback)", () => {
    it("should be called before .delete", done => {
      user.delete(() => {
        // TODO: Need to get callOrder to work by breaking out the actual deleting method into a public method that is then called by .delete
        //sinon.assert.callOrder(user.beforeDelete, deleteQuerySpy);

        // For now, we'll just check that it was called at all
        user.beforeDelete.called.should.be.true;
        done();
      });
    });
  });
});
