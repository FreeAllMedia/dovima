/* Testing Dependencies */
import sinon from "sinon";
import Database from "almaden";
import Collection from "../lib/collection.js";
import Model from "../../";
import AssociationSetter from "../lib/associationSetter.js";
import {ModelQuery} from "../lib/modelFinder.js";
import {isPresent} from "../../";
import {User, Photo, Comment} from "./testClasses.js";

import databaseConfig from "./databaseConfig.json";

let userFixtures = require("./fixtures/users.json");

describe("Model(attributes, options)", () => {
	let model,
			user,
			userAttributes,
			photo,
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
			hasChildren: false,
			addressId: undefined,
			primaryPhotoId: undefined,
			postalCodeId: undefined
		};

		user = new User(userAttributes);
		photo = new Photo();
		comment = new Comment();
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
			let properties;

			beforeEach(() => {
				properties = [
					"address",
					"addressId",
					"postalCode",
					"postalCodeId",
					"photos",
					"primaryPhoto",
					"primaryPhotoId",
					"photoLikes",
					"likedPhotos",
					"comments",
					"deletedComments",
					"id",
					"name",
					"age",
					"hasChildren"
				];
			});
			it("should return the name of all attributes plus associations on the model", () => {
				user.properties.should.eql(properties);
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

				it("should reset the association when a new id is set onto the model", () => {
					truck.id = 1;
					wheel.truck = truck;
					wheel.truckId = 2;
					(wheel.truck == null).should.be.true;
				});

				it("should reset the associationId when a new model is set onto the model", () => {
					truck.id = 1;
					wheel.truckId = 2;
					wheel.truck = truck;
					wheel.truckId.should.not.equal(2);
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

			it("should reset the association when a new id is set onto the model", () => {
				truck
					.hasOne("steeringWheel", SteeringWheel);
				steeringWheel = new SteeringWheel();
				steeringWheel.id = 1;
				truck.steeringWheel = steeringWheel;
				truck.steeringWheelId = 2;
				(truck.steeringWheel == null).should.be.true;
			});

			it("should reset the associationId when a new model is set onto the model", () => {
				truck
					.hasOne("steeringWheel", SteeringWheel);
				steeringWheel = new SteeringWheel();
				steeringWheel.id = 1;
				truck.steeringWheelId = 2;
				truck.steeringWheel = steeringWheel;
				truck.steeringWheelId.should.not.equal(2);
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

				it("should retun just one multi error object the appropiate number of errors", done => {
					user.save((error) => {
						error.errors.length.should.equal(1);
						done();
					});
				});

				it("should retun just one multi error object the appropiate name", done => {
					user.save((error) => {
						error.name.should.equal("User is invalid");
						done();
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
	});

	describe("(exporting)", () => {
		describe(".toJSON()", () => {
			it("should return a plain unformatted model", () => {
				user.toJSON().should.eql(userAttributes);
			});
		});
	});
});
