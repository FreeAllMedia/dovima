import sinon from "sinon";
import Database from "almaden";
import Model from "../../../";
import databaseConfig from "../databaseConfig.json";
import {User} from "../testClasses.js";

describe(".fetch(callback)", () => {
  let user,
		userAttributes,
		clock;

	beforeEach(() => {
		clock = sinon.useFakeTimers();

		Model.database = new Database(databaseConfig);
		Model.database.mock({}); // Catch-all for database

		userAttributes = {
			id: 1,
			name: "Bob Builder",
			age: 35,
			hasChildren: false,
			addressId: undefined,
			primaryPhotoId: undefined,
			postalCodeId: undefined
		};

		user = new User(userAttributes);
	});

	afterEach(() => clock.restore());

  describe("(Model.database is set)", () => {
    beforeEach(() => {
      Model.database.mock({
        "select * from `users` where `id` = 1 limit 1":	[userAttributes]
      });
    });

    describe("(when model has a primary key set)", () => {
      beforeEach(() => {
        user = new User({
          id: 1
        });
      });

      it("should fetch a record from the correct table", done => {
        user.fetch(() => {
          user.attributes.should.eql(userAttributes);
          done();
        });
      });

      it("should fetch a record from the correct table", done => {
        user.fetch(() => {
          user.attributes.should.eql(userAttributes);
          done();
        });
      });

      describe("(when soft delete is enabled)", () => {
        let post,
          deleteQuerySpy;

        class Post extends Model {
          initialize() {
            this.softDelete;
          }
        }

        beforeEach(() => {
          post = new Post({id: 1});
          //querySpy
          deleteQuerySpy = Model.database.spy("select * from `posts` where `id` = 1 and `deleted_at` is null limit 1", [{}]);
        });

        it("should add a where deleted is not null condition", done => {
          post.fetch(() => {
            deleteQuerySpy.callCount.should.equal(1);
            done();
          });
        });
      });
    });

    describe("(when model does not have a primary key set)", () => {
      beforeEach(() => {
        delete user.id;
      });

      it("should throw an error", () => {
        () => {
          user.fetch();
        }.should.throw("Cannot fetch this model by the 'id' field because it is not set.");
      });
    });

    describe("(when there is no model with that id)", () => {
      beforeEach(() => {
        Model.database.mock({
          "select * from `users` where `id` = 1 limit 1":	[]
        });
        user = new User({
          id: 1
        });
      });

      it("should throw an error on the callback", done => {
        user.fetch((error) => {
          error.should.be.instanceOf(Error);
          done();
        });
      });
    });
  });

  describe("(Model.database not set)", () => {
    beforeEach(() => {
      delete Model.database;
    });

    it("should throw an error", () => {
      () => {
        user.fetch();
      }.should.throw("Cannot fetch without Model.database set.");
    });
  });

  describe("(when the type of the strategy is a string)", () => {
    describe("(Model.database is set)", () => {
      beforeEach(() => {
        Model.database.mock({
          "select * from `users` where `name` = 'someuser' limit 1":	[userAttributes]
        });
      });

      describe("(when model has the specified attribute set)", () => {
        beforeEach(() => {
          user = new User({
            name: "someuser"
          });
        });

        it("should fetch a record from the correct table", done => {
          user.fetch("name", () => {
            user.attributes.should.eql(userAttributes);
            done();
          });
        });

        it("should fetch a record from the correct table", done => {
          user.fetch("name", () => {
            user.attributes.should.eql(userAttributes);
            done();
          });
        });
      });

      describe("(when model does not have the specified attribute set)", () => {
        beforeEach(() => {
          delete user.name;
        });

        it("should throw an error", () => {
          () => {
            user.fetch("name");
          }.should.throw("Cannot fetch this model by the 'name' field because it is not set.");
        });
      });

      describe("(when there is no model with the specified attribute)", () => {
        beforeEach(() => {
          Model.database.mock({
            "select * from `users` where `name` = 'someuser' limit 1":	[]
          });
          user = new User({
            name: "someuser"
          });
        });

        it("should throw an error on the callback", done => {
          user.fetch("name", (error) => {
            error.should.be.instanceOf(Error);
            done();
          });
        });
      });
    });

    describe("(Model.database not set)", () => {
      beforeEach(() => {
        delete Model.database;
      });

      it("should throw an error", () => {
        () => {
          user.fetch("name");
        }.should.throw("Cannot fetch without Model.database set.");
      });
    });
  });

  describe("(when the type of the strategy is an array)", () => {
    describe("(Model.database is set)", () => {
      beforeEach(() => {
        Model.database.mock({
          "select * from `users` where `name` = 'someuser' and `lastName` = 'someuserLastName' limit 1":	[userAttributes]
        });
      });

      describe("(when model has the specified attribute set)", () => {
        beforeEach(() => {
          user = new User({
            name: "someuser",
            lastName: "someuserLastName"
          });
          userAttributes.lastName = "someuserLastName";
        });

        it("should fetch a record from the correct table", done => {
          user.fetch(["name", "lastName"], () => {
            user.attributes.should.eql(userAttributes);
            done();
          });
        });

        it("should fetch a record from the correct table", done => {
          user.fetch(["name", "lastName"], () => {
            user.attributes.should.eql(userAttributes);
            done();
          });
        });
      });

      describe("(when model does not have one of the specified attributes set)", () => {
        beforeEach(() => {
          delete user.lastName;
        });

        it("should throw an error", () => {
          () => {
            user.fetch(["name", "lastName"]);
          }.should.throw("Cannot fetch this model by the 'lastName' field because it is not set.");
        });
      });

      describe("(when there is no model with the specified attribute)", () => {
        beforeEach(() => {
          Model.database.mock({
            "select * from `users` where `name` = 'someuser' and `lastName` = 'someuserLastName' limit 1":	[]
          });
          user = new User({
            name: "someuser",
            lastName: "someuserLastName"
          });
        });

        it("should throw an error on the callback", done => {
          user.fetch(["name", "lastName"], (error) => {
            error.should.be.instanceOf(Error);
            done();
          });
        });
      });
    });

    describe("(Model.database not set)", () => {
      beforeEach(() => {
        delete Model.database;
      });

      it("should throw an error", () => {
        () => {
          user.fetch("name");
        }.should.throw("Cannot fetch without Model.database set.");
      });
    });
  });
});
