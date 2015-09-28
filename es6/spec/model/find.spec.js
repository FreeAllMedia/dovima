import Database from "almaden";
import Collection from "../../lib/collection.js";
import Model from "../../../";
import {ModelQuery} from "../../lib/modelFinder.js";
import {User} from "../testClasses.js";

import databaseConfig from "../databaseConfig.json";

let userFixtures = require("../fixtures/users.json");

describe("Model.find", () => {
  let users,
    userCollection;

  before(() => {
    Model.database = new Database(databaseConfig);
		Model.database.mock({}); // Catch-all for database
  });

  after(() => {
    // Remove database from model to prevent
    // polluting another file via the prototype
    Model.database = undefined;
  });

  beforeEach(done => {
    userCollection = new Collection(User);
    userFixtures.forEach((userFiture) => {
      userCollection.push(new User(userFiture));
    });

    Model.database.mock({
      "select * from `users` where `mom_id` = 1":
        userFixtures
    });

    User
      .find
      .where("momId", "=", 1)
      .results((error, fetchedUsers) => {
        users = fetchedUsers;
        done();
      });
  });

  it("should return a ModelQuery instance", () => {
    User.find.should.be.instanceOf(ModelQuery);
  });

  it("should return a collection", () => {
    users.should.be.instanceOf(Collection);
  });

  it("should return the right collection", () => {
    users.should.eql(userCollection);
  });

  it("should allow to search all models that matchs a certain condition", () => {
    users.length.should.equal(5);
  });

  describe(".all", () => {
    beforeEach(done => {
      User.find
        .all
        .where("momId", 1)
        .results((error, fetchedUsers) => {
          users = fetchedUsers;
          done();
        });
    });

    it("should return just all users matching the condition", () => {
      users.length.should.equal(5);
    });
  });

  describe(".deleted", () => {
    class SoftUser extends Model {
      initialize() {
        this.softDelete;
      }
    }

    beforeEach(done => {
      Model.database.mock({
        "select * from `soft_users` where `mom_id` = 1 and `deleted_at` is not null":
          userFixtures
      });

      SoftUser.find
        .all
        .where("momId", 1)
        .deleted
        .results((error, fetchedUsers) => {
          users = fetchedUsers;
          done();
        });
    });

    it("should return just all users matching the condition", () => {
      users.length.should.equal(5);
    });
  });

  describe("(with a different database for a model)", () => {
    class Car extends Model {}
    let car,
      database,
      query;

      describe("(static way)", () => {
        beforeEach(() => {
          database = new Database(databaseConfig);
          Car.database = database;
          query = database.spy("select * from `cars`", []);
          car = new Car();
        });

        it("should use the specific model class database", (done) => {
          Car.find.all.results(() => {
            query.callCount.should.equal(1);
            done();
          });
        });
      });

      describe("(instance way)", () => {
        beforeEach(() => {
          database = new Database(databaseConfig);
          Car.database = null;
          car = new Car({id: 2}, {database: database});
          query = database.spy("select * from `cars` where `id` = 2 limit 1", []);
        });

        it("should use the specific model instance database", (done) => {
          car.fetch(() => {
            query.callCount.should.equal(1);
            done();
          });
        });
      });
  });
});
