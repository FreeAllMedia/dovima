/* Testing Dependencies */

const sinon = require("sinon");
//import MultiError from "../../multiError/multiError.js";

//import MultiError from "../../multiError/multiError.js";
import Database from "almaden";
import Collection from "../lib/collection.js";
import Model, {AssociationSetter} from "../lib/model.js";
import {ModelQuery} from "../lib/modelFinder.js";
import {isPresent} from "../../";

/* Test Configuration */
//nothing from a real connection needed since we are mocking here
const databaseConfig = {
	"debug": true,
	"client": "mysql",
	"connection": {},
	"pool": {
		"max": 2,
		"min": 2
	}
};

let userFixtures = require("./fixtures/users.json");

describe("Model(attributes, options)", () => {

	/**
	 * Setup Model Examples
	 */

	/* Simple Example */

	class User extends Model {
		associate() {
			this.hasOne("address", Address);

			this.hasOne("postalCode", PostalCode).through("address");

			this.hasMany("photos", Photo);

			// this.hasMany("deletedPhotos", Photo)
			// 	.where("deletedAt", "!=", null);

			this.hasOne("primaryPhoto", Photo)
				.where("isPrimary", true);

			this.hasMany("photoLikes", PhotoLike);
			this.hasMany("likedPhotos", Photo).through("photoLikes");

			this.hasMany("comments", Comment).through("photos");

			this.hasMany("deletedComments", Comment).through("photos").where("comments.deletedAt", "!=", null);
		}
		validate() {
			this.ensure("photos", isPresent);
		}
	}

	class Address extends Model {
		associate() {
			this.belongsTo("user", User);
			this.belongsTo("postalCode", PostalCode);
		}
		validate() {
			this.ensure("photos", isPresent);
		}
	}

	class PostalCode extends Model {
		associate() {
			this.hasMany("addresses");
		}
	}

	class PhotoLike {
		associate() {
			this.belongsTo("user", User);
			this.belongsTo("photo", User);
		}
		validate() {
			this.ensure("user", isPresent);
			this.ensure("photo", isPresent);
		}
	}

	class Photo extends Model {
		associate() {
			this.belongsTo("user", User).ambiguous;

			this.hasMany("comments", Comment);

			this.hasMany("commentAuthors", User)
				.through("comments")
				.as("author");

			this.hasMany("photoLikes", PhotoLike);


			this.hasMany("likedByUsers", User)
				.through("photoLikes");
		}

		validate() {
			this.ensure("user", isPresent);
		}
	}

	class Comment extends Model {
		associate() {
			this.belongsTo("photo", Photo);
			this.belongsTo("author", User);
		}
	}

	class Rating extends Model {
		associate() {
			this.belongsTo("owner", Comment)
				.isPolymorphic;
		}
	}

	/**
	 * Instantiate Model Examples
	 */

	let model,
		user,
		userAttributes,
		photo,
		primaryPhoto,
		postalCode,
		address,
		comment,
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
			hasChildren: false
		};

		user = new User(userAttributes);
		photo = new Photo();
		primaryPhoto = new Photo();
		comment = new Comment();
		postalCode = new PostalCode();
		address = new Address();
	});

	afterEach(() => clock.restore());

	describe("(module properties)", () => {
		it("should provide the isPresent validation", () => {
			(typeof isPresent).should.equal("function");
		});
	});

	/**
	 * Begin Testing
	 */

	describe("(Properties)", () => {
		describe(".attributes", () => {
			it("should return all attributes and their values minus associations", () => {
				user.attributes.should.eql(userAttributes);
			});
			it("should assign the properties for the model", () => {
				user = new User();
				user.attributes = userAttributes;
				user.attributes.should.eql(userAttributes);
			});
		});

		describe(".properties", () => {
			it("should return the name of all attributes plus associations on the model", () => {
				user.properties.should.eql([
					"address",
					"postalCode",
					"photos",
					"primaryPhoto",
					"photoLikes",
					"likedPhotos",
					"comments",
					"deletedComments",
					"id",
					"name",
					"age",
					"hasChildren"
				]);
			});
		});

		describe(".tableName", () => {
			it("should return the model's table name", () => {
				user.tableName.should.eql("users");
			});
			it("should allow overriding of the model's table name", () => {
				const newTableName = "somethingElse";
				user.tableName = newTableName;
				user.tableName.should.eql(newTableName);
			});
		});


		describe(".primaryKey", () => {
			it("should return the model's primary key", () => {
				user.primaryKey.should.eql("id");
			});
			it("should allow overriding of the model's primaryKey", () => {
				const newPrimaryKey = "different_id";
				user.primaryKey = newPrimaryKey;
				user.primaryKey.should.eql(newPrimaryKey);
			});
		});

		describe(".isNew", () => {
			describe("(when model has the primary key set)", () => {
				it("should be false", () => {
					user.isNew.should.be.false;
				});
			});
			describe("(when model does not have the primary key set)", () => {
				beforeEach(() => {
					user.id = undefined;
				});
				it("should be true", () => {
					user.isNew.should.be.true;
				});
			});
		});
	});

	describe("(static properties)", () => {
		describe(".find", () => {
			let users,
				userCollection;

			before(() => {
				userCollection = new Collection(User);
				userFixtures.forEach((userFiture) => {
					userCollection.push(new User(userFiture));
				});
			});

			beforeEach(done => {
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

			describe(".one", () => {
				beforeEach(done => {
					Model.database.mock({
						"select * from `users` where `mom_id` = 1 limit 1": [
							userFixtures[0]
						]
					});

					User.find
						.one
						.where("momId", 1)
						.results((error, fetchedUsers) => {
							users = fetchedUsers;
							done();
						});
				});

				it("should return just one user", () => {
					users.length.should.equal(1);
				});
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
		});
	});

	describe("(Initialization)", () => {
		/* eslint-disable no-unused-vars */
		// This is because we instantiate Post, but we don"t do anything with it.

		let post,
			initializeSpy,
			validateSpy,
			associateSpy;

		class Post extends Model {
			initialize() {
				initializeSpy();
			}
			validate() {
				validateSpy();
			}
			associate() {
				associateSpy();
			}
		}

		beforeEach(() => {
			initializeSpy = sinon.spy();
			validateSpy = sinon.spy();
			associateSpy = sinon.spy();
			post = new Post();
		});

		describe(".initialize()", () => {
			it("should be called during instantiation", () => {
				initializeSpy.called.should.be.true;
			});
			it("should be called after .associate", () => {
				sinon.assert.callOrder(associateSpy, initializeSpy);
			});
			it("should be called after .validate", () => {
				sinon.assert.callOrder(validateSpy, initializeSpy);
			});
		});

		describe(".validate()", () => {
			it("should be called during instantiation", () => {
				validateSpy.called.should.be.true;
			});
			it("should be called after .associate", () => {
				sinon.assert.callOrder(associateSpy, validateSpy);
			});
		});

		describe(".associate()", () => {
			it("should be called during instantiation", () => {
				associateSpy.called.should.be.true;
			});
		});
	});

	describe("(Associations)", () => {
		class Street extends Model {}
		class Driver extends Model {}
		class Truck extends Model {}
		class Wheel extends Model {}
		class SteeringWheel extends Model {}

		let street,
			driver,
			truck,
			wheel,
			steeringWheel;

		beforeEach(() => {
			street = new Street();
			driver = new Driver();
			truck = new Truck();
			wheel = new Wheel();
			steeringWheel = new SteeringWheel();
		});

		describe(".belongsTo(associationName, associationConstructor)", () => {
			describe("(when inverse association is hasOne)", () => {
				beforeEach(() => {
					truck.hasOne("steeringWheel", SteeringWheel);
					steeringWheel.belongsTo("truck", Truck);
				});

				it("should add the association to .associations", () => {
					steeringWheel.associations.truck.should.eql({
						parent: steeringWheel,
						type: "belongsTo",
						constructor: Truck,
						foreignName: "steeringWheel",
						foreignId: "truckId",
						foreignKey: "truck_id"
					});
				});

				it("should set the accessor property to null", () => {
					(steeringWheel.truck == null).should.be.true;
				});


				it("should add the parent model onto the child model", () => {
					steeringWheel.truck = truck;
					truck.steeringWheel.should.eql(steeringWheel);
				});

				it("should add the association id onto the model", () => {
					truck.id = 1;
					steeringWheel.truck = truck;
					steeringWheel.should.have.property("truckId");
				});
			});

			describe("(when inverse association is hasMany)", () => {
				beforeEach(() => {
					truck.hasMany("wheels", Wheel);
					wheel.belongsTo("truck", Truck);
				});

				it("should add the association to .associations", () => {
					wheel.associations.truck.should.eql({
						parent: wheel,
						type: "belongsTo",
						constructor: Truck,
						foreignName: "wheel",
						foreignId: "truckId",
						foreignKey: "truck_id"
					});
				});

				it("should set the accessor property to null", () => {
					(wheel.truck == null).should.be.true;
				});

				it("should add the parent model onto the child model", () => {
					wheel.truck = truck;
					truck.wheels[0].should.eql(wheel);
				});

				it("should add the association id onto the model", () => {
					truck.id = 1;
					wheel.truck = truck;
					wheel.truckId.should.eql(truck.id);
				});

				it("should add a model just once on the parent", () => {
					truck.id = 1;
					wheel.truck = truck;
					wheel.truck = truck;

					truck.wheels.length.should.equal(1);
				});
			});

			describe("(when associationName is different from the associationConstructor)", () => {
				beforeEach(() => {
					truck.hasOne("steeringWheel", SteeringWheel).as("superTruck");
					steeringWheel.belongsTo("superTruck", Truck);

					// steeringWheel.id = 1;

					// Model.database.mock({
					// 	"select * from `steering_wheels` where `id` = 1 limit 1": [
					// 		{"truck_id": 1}
					// 	],
					// 	"select * from `trucks` where `id` = 1 limit 1": [
					// 		{}
					// 	]
					// });
				});

				it("should find the renamed association", () => {
					steeringWheel.associations.superTruck.should.eql({
						parent: steeringWheel,
						type: "belongsTo",
						constructor: Truck,
						foreignName: "steeringWheel",
						foreignId: "superTruckId",
						foreignKey: "super_truck_id"
					});
				});
			});

			describe("(when no inverse association is found)", () => {
				beforeEach(() => {
					wheel.belongsTo("truck", Truck);
				});

				it("should throw an error", () => {
					() => {
						wheel.truck = truck;
					}.should.throw("Neither \"wheel\" or \"wheels\" are valid associations on \"Truck\"");
				});
			});

			describe("(with options)", () => {
				describe(".ambiguous", () => {
					beforeEach(() => {
						wheel.belongsTo("truck", Truck).ambiguous;
					});

					it("should add the association to .associations", () => {
						wheel.associations.truck.should.eql({
							parent: wheel,
							type: "belongsTo",
							constructor: Truck,
							foreignName: "wheel",
							foreignId: "truckId",
							foreignKey: "truck_id",
							ambiguous: true
						});
					});

					it("should not add the parent model to the child associatio", () => {
						wheel.truck = truck;
						(truck.wheel === undefined).should.be.true;
					});
				});
			});
		});

		describe(".hasOne(associationName, associationConstructor)", () => {
			let associationName,
				associationConstructor;

			beforeEach(() => {
				associationName = "user";
				associationConstructor = User;
				model.hasOne(associationName, associationConstructor);
			});

			it("should set the accessor function to null", () => {
				(model[associationName] == null).should.be.true;
			});

			it("should add the association to .associations", () => {
				model.associations[associationName].should.eql({
					parent: model,
					type: "hasOne",
					constructor: associationConstructor,
					foreignId: "modelId",
					foreignKey: "model_id",
					foreignName: "model"
				});
			});

			it("should return an association setter", () => {
				truck
					.hasOne("steeringWheel", SteeringWheel)
					.should.be.instanceOf(AssociationSetter);
			});

			it("should accept a custom error message", () => {
				truck.hasOne("steeringWheel", SteeringWheel);
				truck.ensure("steeringWheel", isPresent, "must be there.");
				truck.invalidAttributes((invalidAttributeList) => {
					invalidAttributeList.should.eql({
						"steeringWheel": [
							"must be there."
						]
					});
				});
			});

			describe("(with options)", () => {
				describe(".ambiguous", () => {
					it("should throw an error", () => {
						const query = truck.hasOne("steeringWheel", SteeringWheel);
						query.should.not.have.property("ambiguous");
					});
				});

				describe(".where(...conditions)", () => {
					beforeEach(() => {
						Model.database.mock({
							"select * from `users` where `id` = 1 limit 1": [{id: 1}],
							"select * from `photos` where `user_id` = 1 and (`is_favorite` = true) limit 1": [{
								id: 1,
								name: "Favorite Photo"
							}]
						});
						user
							.hasOne("favoritePhoto", Photo)
							.where("isFavorite", true);
					});

					it("should set more than one condition joined by AND", done => {
						Model.database.mock({
							"select * from `users` where `id` = 1 limit 1":
								[{id: 1}],
							"select * from `photos` where `user_id` = 1 and (`is_favorite` = true and `is_face_photo` = true) limit 1":
								[{name: "Favorite Face Photo"}]
						});

						user
							.hasOne("favoriteFacePhoto", Photo)
							.where("isFavorite", true)
							.andWhere("isFacePhoto", true);

						user
							.include("favoriteFacePhoto")
							.fetch(() => {
								user.favoriteFacePhoto.name.should.eql("Favorite Face Photo");
								done();
							});
					});

					it("should set the where conditions", () => {
						user.associations.favoritePhoto.where.should.eql(["isFavorite", true]);
					});

					it("should set conditions for the association", done => {
						user.include("favoritePhoto").fetch(() => {
							user.favoritePhoto.name.should.eql("Favorite Photo");
							done();
						});
					});
				});
			});
		});

		describe(".hasMany(associationName, associationConstructor)", () => {
			let associationName,
				associationConstructor;

			beforeEach(() => {
				associationName = "users";
				associationConstructor = User;
				model.hasMany(associationName, associationConstructor);
			});

			it("should set the accessor function to a Collection", () => {
				model[associationName].should.be.instanceOf(Collection);
			});

			it("should initially set the accessor function Collection to be empty", () => {
				model[associationName].length.should.equal(0);
			});

			it("should add the association to .associate()", () => {
				model.associations[associationName].should.eql({
					parent: model,
					type: "hasMany",
					constructor: associationConstructor,
					foreignId: "modelId",
					foreignKey: "model_id",
					foreignName: "model"
				});
			});

			it("should accept a custom error message", () => {
				truck.hasMany("wheels", Wheel);
				truck.ensure("wheels", isPresent, "must be there.");
				truck.invalidAttributes((invalidAttributeList) => {
					invalidAttributeList.should.eql({
						"wheels": [
							"must be there."
						]
					});
				});
			});

			describe("(with options)", () => {
				describe(".ambiguous", () => {
					it("should throw an error", () => {
						const query = truck.hasOne("steeringWheel", SteeringWheel);
						query.should.not.have.property("ambiguous");
					});
				});

				describe(".where(...conditions)", () => {
					describe("(with one where condition)", () => {
						beforeEach(() => {
							Model.database.mock({
								"select * from `users` where `id` = 1 limit 1": [{id: 1}],
								"select * from `photos` where `user_id` = 1 and (`is_favorite` = true)": [
									{ id: 1, name: "Favorite Photo" },
									{ id: 2, name: "Another Favorite Photo" },
									{ id: 3, name: "Mostest Favoritest Photo" }
								]
							});

							user.hasMany("favoritePhotos", Photo).where("isFavorite", true);
						});

						it("should set the where conditions", () => {
							user.associations.favoritePhotos.where.should.eql(["isFavorite", true]);
						});

						it("should set conditions for the association", done => {
							user.include("favoritePhotos").fetch(() => {
								user.favoritePhotos.length.should.eql(3);
								done();
							});
						});
					});

					describe("(with multiple where conditions)", () => {
						beforeEach(() => {
							Model.database.mock({
								"select * from `users` where `id` = 1 limit 1": [{id: 1}],
								"select * from `photos` where `user_id` = 1 and (`is_favorite` = true and `is_face_photo` = true)": [
									{ id: 1, name: "Favorite Face Photo" },
									{ id: 2, name: "Another Favorite Face Photo" },
									{ id: 3, name: "Mostest Favoritest Face Photo" }
								]
							});

							user
								.hasMany("favoriteFacePhotos", Photo)
								.where("isFavorite", true)
								.andWhere("isFacePhoto", true);
						});

						it("should set the where conditions", () => {
							user.associations.favoriteFacePhotos.andWhere.should.eql(
								[
									["isFacePhoto", true]
								]
							);
						});

						it("should set conditions for the association", done => {
							user.include("favoriteFacePhotos").fetch(() => {
								user.favoriteFacePhotos.length.should.eql(3);
								done();
							});
						});
					});
				});

				xdescribe(".through(associationName)", () => {
					beforeEach(() => {
						Model.database.mock({

						});
					});

					it("should return the association set to allow further chaining", () => {
						user
							.hasMany("comments", Comment)
							.through("apiKey")
							.should.be.instanceOf(AssociationSetter);
					});

					it("should fetch hasMany through associations", done => {
						user.include("comments").fetch((error) => {
							user.comments.
							user.comments[0].instanceOf(Comment);
							done();
						});
					});
				});
			});
		});
	});

	describe("(Validations)", () => {
		describe(".invalidAttributes(callback)", () => {
			describe("(when all validations pass)", () => {
				beforeEach(() => {
					user.photos.push(photo);
				});

				it("should return an empty object", () => {
					user.invalidAttributes((attributes) => {
						attributes.should.eql({});
					});
				});
			});

			describe("(when any validations fail)", () => {
				beforeEach(() => {
					// Force database to fail isPresent on user.photos
					Model.database.mock({
						"select count(*) as `rowCount` from `photos` where `user_id` = 1":
							[{rowCount: 0}]
					});
				});

				it("should return an object containing all invalid attributes", done => {
					user.invalidAttributes((attributes) => {
						attributes.should.eql({
							"photos": [
								"must be present on User"
							]
						});
						done();
					});
				});
			});
		});

		describe(".isValid(callback)", () => {
			describe("(when all validations pass)", () => {
				beforeEach(() => {
					user.photos.push(photo);
				});

				it("should return true", done => {
					user.isValid((isValid) => {
						isValid.should.be.true;
						done();
					});
				});
			});

			describe("(when any validations fail)", () => {
				beforeEach(() => {
					// Force database to fail isPresent on user.photos
					Model.database.mock({
						"select count(*) as `rowCount` from `photos` where `user_id` = 1":
							[{rowCount: 0}]
					});
				});

				it("should return false", done => {
					user.isValid((isValid) => {
						isValid.should.be.false;
						done();
					});
				});
			});
		});

		describe(".validations", () => {
			it("should return an object representing all validations on the model", () => {
				user.validations.should.eql({
					"photos": [
						{
							validator: isPresent
						}
					]
				});
			});
		});

		describe(".ensure(attributeName, validatorFunction, validatorMessage)", () => {
			let validatorFunction,
				validatorMessage;
			beforeEach(() => {
				validatorFunction = (value, callback) => {
					callback(null, true);
				};
				validatorMessage = "must be a number.";
			});

			it("should add the validator to .validations", () => {
				user.ensure("photos", validatorFunction, validatorMessage);
				user.validations.should.eql({
					"photos": [
						{
							validator: isPresent
						},
						{
							validator: validatorFunction,
							message: validatorMessage
						}
					]
				});
			});
		});
	});

	describe("(Persistence)", () => {

		describe(".as(associationName)", () => {
			it("should set the referencing association name in a hasMany through belongsTo", done => {
				Model.database.mock({
					"select * from `photos` where `id` = 1 limit 1": [
						{}
					],
					"select * from `comments` where `photo_id` = 1": [
						{id: 1, "author_id": 5}, {id: 2, "author_id": 6}, {id: 3, "author_id": 7}
					],
					"select * from `users` where `id` in (5, 6, 7)": [
						{}, {}, {}
					]
				});

				photo.id = 1;

				photo
					.include("commentAuthors")
					.fetch((errors) => {
						photo.commentAuthors.length.should.equal(3);
						done();
					});
			});
		});

		describe(".include(associationNames)", () => {
			let associationNames;

			beforeEach(() => {
				associationNames = ["primaryPhoto", "photos"];
			});

			it("should throw an error if an association name is not found", () => {
				Model.database.mock({
					"select * from `users` where `id` = 1 limit 1":
						[userAttributes]
				});
				() => {
					user.include("bogusAssociation").fetch();
				}.should.throw("Cannot fetch 'bogusAssociation' because it is not a valid association on User");
			});

			it("should throw an error if a belongs to association id is not set", () => {
				Model.database.mock({
					"select * from `comments` where `id` = 1 limit 1":
						[{id: 1}]
				});

				() => {
					comment.id = 1;
					comment.include("photo").fetch();
				}.should.throw("Cannot fetch 'photo' because 'photoId' is not set on Comment");
			});

			it("should return the model to support chaining", () => {
				user.include(...associationNames).should.equal(user);
			});

			it("should fetch belongsTo associations", done => {
				Model.database.mock({
					"select * from `photos` where `id` = 1 limit 1":
						[{id: 1}],
					"select * from `users` where `id` = 1 limit 1":
						[{id: 1, name: "Bob Barker"}]
				});

				photo.id = 1;
				photo.userId = 1;
				photo
					.include("user")
					.fetch((errors) => {
						photo.user.name.should.eql("Bob Barker");
						done();
					});
			});

			it("should fetch hasOne associations", done => {
				Model.database.mock({
					"select * from `users` where `id` = 1 limit 1":
						[userAttributes],
					"select * from `photos` where `user_id` = 1 and (`is_primary` = true) limit 1":
						[{
							name: "Primary Photo"
						}]
				});

				user
					.include("primaryPhoto")
					.fetch((errors) => {
						user.primaryPhoto.name.should.eql("Primary Photo");
						done();
					});
			});

			it("should fetch hasMany associations", done => {
				Model.database.mock({
					"select * from `users` where `id` = 1 limit 1":
						[userAttributes],
					"select * from `photos` where `user_id` = 1":
						[
							{ name: "Some Photo" },
							{ name: "Some Other Photo" },
							{ name: "Still Some Photo" }
						]
				});

				user
					.include("photos")
					.fetch((errors) => {
						user.photos.length.should.eql(3);
						done();
					});
			});

			it("should fetch hasOne through associations", () => {
				Model.database.mock({
					"select * from `users` where `id` = 1 limit 1":
						[{}],
					"select * from `addresses` where `user_id` = 1 limit 1":
						[{
							"user_id": 1,
							"postal_code_id": 2
						}],
					"select * from `postal_codes` where `id` = 2 limit 1":
						[{number: 90210}]
				});

				user
					.include("postalCode")
					.fetch((errors) => {
						user.postalCode.number.should.eql(90210);
					});
			});

			it("should fetch hasMany through hasMany associations", done => {
				Model.database.mock({
					"select * from `users` where `id` = 1 limit 1": [
						{ id: 1 }
					],
					"select * from `photos` where `user_id` = 1": [
						{ id: 3 },
						{ id: 4 },
						{ id: 5 }
					],
					"select * from `comments` where `photo_id` in (3, 4, 5)": [
						{}, {}, {}
					]
				});

				user
					.include("comments")
					.fetch((errors) => {
						user.comments.length.should.equal(3);
						done();
					});
			});

			it("should throw an error when the destination association is not found on the through model", () => {
				Model.database.mock({
					"select * from `users` where `id` = 1 limit 1": [{}],
					"select * from `photos` where `user_id` = 1": [{id: 3}]
				});

				class Post {} // Needed to mock a through association that is incomplete

				() => {
					user.hasMany("posts", Post)
						.through("photos");

					user
						.include("posts")
						.fetch();
				}.should.throw("'posts' is not a valid association on through model 'Photo'");
			});

			it("should fetch hasMany through hasOne associations", done => {
				Model.database.mock({
					"select * from `photos` where `id` = 1 limit 1": [
						{}
					],
					"select * from `comments` where `photo_id` = 1": [
						{"author_id": 4},
						{"author_id": 5},
						{"author_id": 6}
					],
					"select * from `users` where `id` in (4, 5, 6)": [
						{}, {}, {}
					]
				});

				photo.id = 1; // Need primary key to fetch

				photo
					.include("commentAuthors")
					.fetch((errors) => {
						photo.commentAuthors.length.should.equal(3);
						done();
					});
			});

			xit("should fetch hasMany through belongsTo associations", done => {
				Model.database.mock({
					"select * from `users` where `id` = 1 limit 1":
						[{}]
				});

				user
					.include("comments")
					.fetch((errors) => {
						user.comments.length.should.equal(3);
						done();
					});
			});

			it("should fetch more than one association at once", done => {
				Model.database.mock({
					"select * from `users` where `id` = 1 limit 1":
						[userAttributes],
					"select * from `photos` where `user_id` = 1 and (`is_primary` = true) limit 1":
						[
							{ name: "Primary Photo"	}
						],
					"select * from `photos` where `user_id` = 1":
						[
							{ name: "Some Photo" },
							{ name: "Some Other Photo" },
							{ name: "Still Some Photo" },
							{ name: "Primary Photo"	}
						]
				});

				user
					.include("photos", "primaryPhoto")
					.fetch((errors) => {
						[user.photos.length, user.primaryPhoto.name]
							.should.eql([
								4,
								"Primary Photo"
							]);
						done();
					});
			});
		});

		describe(".delete(callback)", () => {
			describe("(when dependent is declared on the association)", () => {
				class Account extends Model {
					initialize() {
						this.softDelete;
					}

					associate() {
						this.hasOne("forumUser", ForumUser)
							.dependent;
					}
				}

				class ForumUser extends Model {
					initialize() {
						this.softDelete;
					}

					associate() {
						this.hasMany("posts", Post)
							.dependent;
						this.belongsTo("account", Account)
							.dependent;
					}
				}

				class Post extends Model {
					initialize() {
						this.softDelete;
					}

					associate() {
						this.belongsTo("forumUser", ForumUser);
					}
				}

				let forumUser,
					account,
					post;

				beforeEach(() => {
					account = new Account({id: 1});
					forumUser = new ForumUser({id: 2});
					post = new Post({id: 3});
				});

				it("should add the association to .associations", () => {
					account.associations.forumUser.should.eql({
						parent: account,
						type: "hasOne",
						constructor: ForumUser,
						foreignName: "account",
						foreignId: "accountId",
						foreignKey: "account_id",
						dependent: true
					});
				});

				describe("(on a hasOne)", () => {
					let userDeleteQuerySpy;

					beforeEach(() => {
						Model.database.mock({
							[/update `accounts` set `deleted_at` = '19[0-9][0-9]-[0-9][0-9]-[0-9][0-9] [0-9][0-9]:00:00.000' where `id` = 1/]:
								1
						});

						userDeleteQuerySpy = Model.database.spy(
							/update `forum_users` set `deleted_at` = '19[0-9][0-9]-[0-9][0-9]-[0-9][0-9] [0-9][0-9]:00:00.000' where `id` = 2/,
							1);

						account.forumUser = forumUser;
					});

					it("should propagate delete on those models", done => {
						account.delete(() => {
							userDeleteQuerySpy.callCount.should.equal(1);
							done();
						});
					});
				});

				describe("(on a hasMany)", () => {
					let postDeleteQuerySpy;

					beforeEach(() => {
						Model.database.mock({
							[/update `forum_users` set `deleted_at` = '19[0-9][0-9]-[0-9][0-9]-[0-9][0-9] [0-9][0-9]:00:00.000' where `id` = 2/]:
								1
						});

						postDeleteQuerySpy = Model.database.spy(
							/update `posts` set `deleted_at` = '19[0-9][0-9]-[0-9][0-9]-[0-9][0-9] [0-9][0-9]:00:00.000' where `id` = 3/,
							1);

						forumUser.posts.push(post);
					});

					it("should propagate delete on those models", done => {
						forumUser.delete(() => {
							postDeleteQuerySpy.callCount.should.equal(1);
							done();
						});
					});
				});
			});

			describe("(when .softDelete is not called)", () => {
				class Post extends Model {}
				let post;

				beforeEach(() => {
					post = new Post();
				});

				it("should throw when calling delete", () => {
					() => {
						post.delete();
					}.should.throw("Not implemented.");
				});
			});

			describe("when softDelete called)", () => {
				let post;

				class Post extends Model {
					initialize() {
						this.softDelete;
					}
				}

				beforeEach(() => {
					post = new Post();
				});

				describe("(Model.database is set)", () => {
					describe("(when primaryKey is set)", () => {
						beforeEach(() => {
							post.id = 1;
							Model.database.mock({
								[/update `posts` set `deleted_at` = \'19[0-9][0-9]-[0-9][0-9]-[0-9][0-9] [0-9][0-9]:00:00.000\' where `id` = 1/]:
									1
							});
						});

						it("should not throw when calling delete", () => {
							() => {
								post.delete(() => {});
							}.should.not.throw();
						});

						it("should return no error", () => {
							post.delete((error) => {
								(error == null).should.be.true;
							});
						});

						describe("(when primary key is set but not exists)", () => {
							beforeEach(() => {
								post.id = 1;
								Model.database.mock({
									[/update `posts` set `deleted_at` = \'19[0-9][0-9]-[0-9][0-9]-[0-9][0-9] [0-9][0-9]:00:00.000\' where `id` = 1/]:
										0
								});
							});

							it("should return an error", () => {
								post.delete((error) => {
									error.should.eql(new Error("Post with id 1 cannot be soft deleted because it doesn't exists."));
								});
							});
						});
					});

					describe("(when primaryKey is not set)", () => {
						it("should throw an error", () => {
							() => {
								post.delete(() => {});
							}.should.throw("Cannot delete the Post because the primary key is not set.");
						});
					});
				});

				describe("(Model.database not set)", () => {
					beforeEach(() => {
						delete Model.database;
					});

					it("should throw an error", () => {
						() => {
							post.delete();
						}.should.throw("Cannot delete without Model.database set.");
					});
				});
			});
		});

		describe(".fetch(callback)", () => {
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
						user.fetch((error) => {
							user.attributes.should.eql(userAttributes);
							done();
						});
					});

					it("should fetch a record from the correct table", done => {
						user.fetch((error) => {
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
		});

		describe(".fetch(strategy, callback)", () => {
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
							user.fetch("name", (error) => {
								user.attributes.should.eql(userAttributes);
								done();
							});
						});

						it("should fetch a record from the correct table", done => {
							user.fetch("name", (error) => {
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
							user.fetch(["name", "lastName"], (error) => {
								user.attributes.should.eql(userAttributes);
								done();
							});
						});

						it("should fetch a record from the correct table", done => {
							user.fetch(["name", "lastName"], (error) => {
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

		describe(".save(callback)", () => {
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
							updateTruck: /update `trucks` set `updated_at` = '19[0-9][0-9]-[0-9][0-9]-[0-9][0-9] [0-9][0-9]:00:00.000' where `id` = 1/,
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
							steeringWheel,
							driverSeat,
							passengerSeat;

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

						class Seat extends Model {
							associate() {
								this.belongsTo("truck", Truck);
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

								driverSeat = new Seat();
								passengerSeat = new Seat();
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

								truck.steeringWheel = steeringWheel;

								//TODO: wrap push on typed collection?
								wheel.truck = truck;
								truck.wheels.push(wheel);
							});

							it("should propagate .save() to hasOne associations", done => {
								truck.save((error) => {
									steeringWheelSaveSpy.calledOnce.should.be.true;
									done();
								});
							});

							it("should propagate .save() to hasMany associations", done => {
								truck.save((error) => {
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
							model.save((error) => {
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
							model.save((error) => {
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
	});

	describe("(exporting)", () => {
		describe(".toJSON()", () => {
			it("should return a plain unformatted model", () => {
				user.toJSON().should.eql(userAttributes);
			});

			it("should return a formatted model if a formatter is set on Model.jsonFormatter", () => {
				let newUserAttributes = {someCustomAttribute: "someCustomAttributeValue"};
				Model.jsonFormatter = () => {
					return newUserAttributes;
				};
				user.toJSON().should.eql(newUserAttributes);
			});
		});
	});
});
