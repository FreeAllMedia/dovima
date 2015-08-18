import sinon from "sinon";
import Database from "almaden";
import Model from "../../../";
import databaseConfig from "../databaseConfig.json";

describe("Model(attributes, options)", () => {
  let model,
      attributes,
      options,
      beforeSaveSpy;

  class User extends Model {
    beforeSave(callback) {
      beforeSaveSpy();
      callback();
    }
  }

  beforeEach(() => {
    beforeSaveSpy = sinon.spy();

    Model.database = new Database(databaseConfig);

    // Mock save query
    Model.database.mock({
      [/insert into `users` \(`created_at`, `name`\) values \('.*', 'Bob'\)/]:
        [{"created_at": Date.now, "name": "Bob"}]
    });

    attributes = {
      "name": "Bob"
    };

    model = new User(attributes);
  });

  describe(".beforeSave(done)", () => {
    describe("(With Callback)", () => {
      it("should be called before .save", done => {
        // throw util.inspect(model.afterSave, true, 4);
        model.save((error) => {
          if (error) { throw error; }
          beforeSaveSpy.called.should.be.true;
          done();
        });
      });

      // TODO: Enhance with callback waiting
      it("should make .save wait for .beforeSave callback");
    });

    // TODO: Enhance with synchronous hook
    describe("(Without Callback)", () => {
      it("should be called before .save");
    });
  });
});
