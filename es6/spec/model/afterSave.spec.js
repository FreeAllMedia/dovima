import sinon from "sinon";
import Database from "almaden";
import Model from "../../../";
import databaseConfig from "../databaseConfig.json";

describe("Model(attributes, options)", () => {
  let model,
      attributes,
      afterSaveSpy;

  // Example Class
  class User extends Model {
    afterSave(callback) {
      afterSaveSpy();
      callback();
    }
  }

  beforeEach(() => {
    afterSaveSpy = sinon.spy();

    User.database = new Database(databaseConfig);
    // Mock save query
    User.database.mock({
      [/insert into `users` \(`created_at`, `name`\) values \('.*', 'Bob'\)/]:
        [{"created_at": Date.now, "name": "Bob"}]
    });

    // Instantiate model
    attributes = {
      name: "Bob"
    };

    model = new User(attributes);
  });

  describe(".afterSave(done)", () => {
    describe("(With Callback)", () => {
      it("should be called after .save", done => {
        // throw util.inspect(model.afterSave, true, 4);
        model.save((error) => {
          if (error) { throw error; }
          afterSaveSpy.called.should.be.true;
          done();
        });
      });

      // TODO: Enhance with callback waiting
      it("should make the .save callback wait for the .afterSave callback");
    });

    // TODO: Enhance with synchronous hook
    describe("(Without Callback)", () => {
      it("should be called after .save is complete");
    });
  });
});
