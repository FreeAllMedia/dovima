import sinon from "sinon";
import Database from "almaden";
import Model from "../../../";
import databaseConfig from "../databaseConfig.json";
import {User, Photo} from "../testClasses.js";

describe(".save(callback)", () => {
  let model,
		user,
		userAttributes,
		photo,
		primaryPhoto,
		clock;

	beforeEach(() => {
		clock = sinon.useFakeTimers();

		Model.database = new Database(databaseConfig);
		Model.database.mock({}); // Catch-all for database

		model = new Model();

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
		photo = new Photo();
		primaryPhoto = new Photo();
	});

	afterEach(() => clock.restore());

  describe("(Model.database is set)", () => {
    describe("(when the model has associations)", () => {

      beforeEach(() => {
        user.primaryPhoto = primaryPhoto;
        user.photos.push(photo);

        let regularExpressions = {
          insertPhotos: /insert into `photos` \(`created_at`, `user_id`\) values \('19[0-9][0-9]-[0-9][0-9]-[0-9][0-9] [0-9][0-9]:00:00.000', 1\)/,
          updateUser: /update `users` set `age` = 35, `has_children` = false, `name` = 'Bob Builder', `updated_at` = '19[0-9][0-9]-[0-9][0-9]-[0-9][0-9] [0-9][0-9]:00:00.000' where `id` = 1/,
          insertWheels: /insert into `wheels` \(`created_at`, `truck_id`\) values \('19[0-9][0-9]-[0-9][0-9]-[0-9][0-9] [0-9][0-9]:00:00\.000', 1\)/,
          insertSteeringWheel: /insert into `steering_wheels` \(`created_at`, `truck_id`\) values \('19[0-9][0-9]-[0-9][0-9]-[0-9][0-9] [0-9][0-9]:00:00.000', 1\)/,
          insertTruck: /insert into `trucks` (`created_at`) values ('19[0-9][0-9]-[0-9][0-9]-[0-9][0-9] [0-24]:00:00.000')/,
          updateTruck: /update `trucks` set `steering_wheel_id` = 1, `updated_at` = '19[0-9][0-9]-[0-9][0-9]-[0-9][0-9] [0-9][0-9]:00:00.000' where `id` = 1/,
          updateSteeringWheel: /update `steering_wheels` set `truck_id` = 1, `updated_at` = '19[0-9][0-9]-[0-9][0-9]-[0-9][0-9] [0-9][0-9]:00:00.000' where `id` = 1/,
          updateWheels: /update `wheels` set `created_at` = '19[0-9][0-9]-[0-9][0-9]-[0-9][0-9] [0-9][0-9]:00:00.000', `truck_id` = 1, `updated_at` = '19[0-9][0-9]-[0-9][0-9]-[0-9][0-9] [0-9][0-9]:00:00.000' where `id` = 1/
        };

        Model.database.mock({
          [regularExpressions.insertPhotos]:
            [1],
          [regularExpressions.updateUser]:
            [],
          [regularExpressions.insertWheels]:
            [1],
          [regularExpressions.insertSteeringWheel]:
            [1],
          [regularExpressions.insertTruck]:
            [1],
          [regularExpressions.updateTruck]:
            [1],
          [regularExpressions.updateSteeringWheel]:
            [1],
          [regularExpressions.updateWheels]:
            [1]
        });
      });

      describe("(association operations)", () => {
        let wheelSaveSpy,
          steeringWheelSaveSpy,
          truck,
          owner,
          wheel,
          steeringWheel;

        class TruckOwner extends Model {
          associate() {
            this.belongsTo("truck");
            this.belongsTo("owner");
          }
        }

        class Truck extends Model {
          associate() {
            this.hasMany("truckOwners");
            this.hasMany("owners", Owner)
              .through("truckOwners");
            this.hasMany("wheels", Wheel);
            this.hasOne("steeringWheel", SteeringWheel);
          }
        }

        class Owner extends Model {
          associate() {
            this.hasMany("truckOwners", TruckOwner);
            this.hasMany("trucks", Truck)
              .through("truckOwners");
          }
        }

        class Wheel extends Model {
          associate() {
            this.belongsTo("truck", Truck);
          }
          save(callback) {
            wheelSaveSpy(callback);
            super.save(callback);
          }
        }

        class SteeringWheel extends Model {
          associate() {
            this.belongsTo("truck", Truck);
          }
          save(callback) {
            steeringWheelSaveSpy(callback);
            super.save(callback);
          }
        }

        describe("(assignment)", () => {

          beforeEach(() => {
            wheelSaveSpy = sinon.spy();
            steeringWheelSaveSpy = sinon.spy();

            truck = new Truck();
            owner = new Owner();
            wheel = new Wheel();
            steeringWheel = new SteeringWheel();
          });

          it("should throw when assign a non model object to a belongsTo association", () => {
            () => {
              steeringWheel.truck = {};
            }.should.throw("Cannot set a non model entity onto this property. It should inherit from Model");
          });

          it("should throw when assign a non model object to a hasOne association", () => {
            () => {
              truck.steeringWheel = {};
            }.should.throw("Cannot set a non model entity onto this property. It should inherit from Model");
          });

          it("should associate a hasOne from a belongsTo", () => {
            steeringWheel.truck = truck;
            truck.should.have.property("steeringWheel");
          });

          // TODO: This is impossible as is
          xit("should associate a hasMany from a belongsTo", () => {
            wheel.truck = truck;
            truck.wheels.length.should.equal(1);
          });

          it("should associate a belongsTo from a hasMany", () => {
            truck.wheels.push(wheel);
            wheel.truck.should.eql(truck);
          });

          it("should associate a hasMany from a hasMany", () => {
            truck.owners.push(owner);
            owner.trucks[0].should.eql(truck);
          });

          it("should associate a belongsTo from a hasOne", () => {
            truck.steeringWheel = steeringWheel;
            steeringWheel.truck.should.eql(truck);
          });
        });

        describe("(propagation)", () => {
          beforeEach(() => {
            wheelSaveSpy = sinon.spy();
            steeringWheelSaveSpy = sinon.spy();

            truck = new Truck({id: 1});
            wheel = new Wheel();
            steeringWheel = new SteeringWheel();
            steeringWheel.id = 1;

            truck.steeringWheel = steeringWheel;

            //TODO: wrap push on typed collection?
            wheel.truck = truck;
            truck.wheels.push(wheel);
          });

          it("should propagate .save() to hasOne associations", done => {
            truck.save(() => {
              steeringWheelSaveSpy.calledOnce.should.be.true;
              done();
            });
          });

          it("should propagate .save() to hasMany associations", done => {
            truck.save(() => {
              wheelSaveSpy.called.should.be.true;
              done();
            });
          });
        });
      });
    });

    describe("(database updating)", () => {
      describe("(model not new)", () => {
        beforeEach(() => {
          model.id = 1;

          Model.database.update = sinon.spy(Model.database.update);

          let regularExpressions = {
            updateModel: /update `models` set `updated_at` = '19[0-9][0-9]-[0-9][0-9]-[0-9][0-9] [0-9][0-9]:00:00.000' where `id` = 1/
          };

          Model.database.mock({
            [regularExpressions.updateModel]:
              [{}]
          });
        });
        it("should update the record the database", () => {
          model.save(() => {
            Model.database.update.called.should.be.true;
          });
        });
      });

      describe("(model not new)", () => {
        beforeEach(() => {
          Model.database.insert = sinon.spy(Model.database.insert);

          let regularExpressions = {
            insertModel: /insert into `models` \(`created_at`\) values \('19[0-9][0-9]-[0-9][0-9]-[0-9][0-9] [0-9][0-9]:00:00.000'\)/
          };

          Model.database.mock({
            [regularExpressions.insertModel]:
              [{}]
          });
        });
        it("should update the record the database", () => {
          model.save(() => {
            Model.database.insert.called.should.be.true;
          });
        });
      });
    });

    describe("(when model is invalid)", () => {
      beforeEach(() => {
        Model.database.mock({
          "select count(*) as `rowCount` from `photos` where `user_id` = 1":
            [{rowCount: 0}]
        });
      });

      it("should call back with an error", () => {
        user.save((error) => {
          error.should.be.instanceOf(Error);
        });
      });

      it("should inform the user that the model is invalid", () => {
        user.save((error) => {
          error.message.should.eql("photos must be present on User");
        });
      });
    });
  });

  describe("(without Model.database set)", () => {
    beforeEach(() => {
      delete Model.database;
    });

    it("should call back with an error", () => {
      () => {
        user.save();
      }.should.throw("Cannot save without Model.database set.");
    });
  });
});
