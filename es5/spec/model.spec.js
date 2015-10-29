/* Testing Dependencies */
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _sinon = require("sinon");

var _sinon2 = _interopRequireDefault(_sinon);

var _almaden = require("almaden");

var _almaden2 = _interopRequireDefault(_almaden);

var _libCollectionJs = require("../lib/collection.js");

var _libCollectionJs2 = _interopRequireDefault(_libCollectionJs);

var _ = require("../../");

var _2 = _interopRequireDefault(_);

var _libAssociationSetterJs = require("../lib/associationSetter.js");

var _libAssociationSetterJs2 = _interopRequireDefault(_libAssociationSetterJs);

var _libModelFinderJs = require("../lib/modelFinder.js");

var _testClassesJs = require("./testClasses.js");

var _databaseConfigJson = require("./databaseConfig.json");

var _databaseConfigJson2 = _interopRequireDefault(_databaseConfigJson);

var userFixtures = require("./fixtures/users.json");

describe("Model(attributes, options)", function () {
	var model = undefined,
	    user = undefined,
	    userAttributes = undefined,
	    photo = undefined,
	    comment = undefined,
	    clock = undefined;

	beforeEach(function () {
		clock = _sinon2["default"].useFakeTimers();

		_2["default"].database = new _almaden2["default"](_databaseConfigJson2["default"]);
		_2["default"].database.mock({}); // Catch-all for database

		model = new _2["default"]();

		userAttributes = {
			id: 1,
			name: "Bob Builder",
			age: 35,
			hasChildren: false,
			addressId: undefined,
			primaryPhotoId: undefined,
			postalCodeId: undefined
		};

		user = new _testClassesJs.User(userAttributes);
		photo = new _testClassesJs.Photo();
		comment = new _testClassesJs.Comment();
	});

	afterEach(function () {
		return clock.restore();
	});

	describe("(module properties)", function () {
		it("should provide the isPresent validation", function () {
			(typeof _.isPresent).should.equal("function");
		});
	});

	/**
  * Begin Testing
  */

	describe("(Properties)", function () {
		describe(".attributes", function () {
			it("should return all attributes and their values minus associations", function () {
				user.attributes.should.eql(userAttributes);
			});
			it("should assign the properties for the model", function () {
				user = new _testClassesJs.User();
				user.attributes = userAttributes;
				user.attributes.should.eql(userAttributes);
			});
		});

		describe(".properties", function () {
			var properties = undefined;

			beforeEach(function () {
				properties = ["address", "addressId", "postalCode", "postalCodeId", "photos", "primaryPhoto", "primaryPhotoId", "photoLikes", "likedPhotos", "comments", "deletedComments", "id", "name", "age", "hasChildren"];
			});
			it("should return the name of all attributes plus associations on the model", function () {
				user.properties.should.eql(properties);
			});
		});

		describe(".tableName", function () {
			it("should return the model's table name", function () {
				user.tableName.should.eql("users");
			});
			it("should allow overriding of the model's table name", function () {
				var newTableName = "somethingElse";
				user.tableName = newTableName;
				user.tableName.should.eql(newTableName);
			});
		});

		describe(".primaryKey", function () {
			it("should return the model's primary key", function () {
				user.primaryKey.should.eql("id");
			});
			it("should allow overriding of the model's primaryKey", function () {
				var newPrimaryKey = "different_id";
				user.primaryKey = newPrimaryKey;
				user.primaryKey.should.eql(newPrimaryKey);
			});
		});

		describe(".isNew", function () {
			describe("(when model has the primary key set)", function () {
				it("should be false", function () {
					user.isNew.should.be["false"];
				});
			});
			describe("(when model does not have the primary key set)", function () {
				beforeEach(function () {
					user.id = undefined;
				});
				it("should be true", function () {
					user.isNew.should.be["true"];
				});
			});
		});
	});

	describe("(Initialization)", function () {
		/* eslint-disable no-unused-vars */
		// This is because we instantiate Post, but we don"t do anything with it.

		var post = undefined,
		    initializeSpy = undefined,
		    validateSpy = undefined,
		    associateSpy = undefined;

		var Post = (function (_Model) {
			_inherits(Post, _Model);

			function Post() {
				_classCallCheck(this, Post);

				_get(Object.getPrototypeOf(Post.prototype), "constructor", this).apply(this, arguments);
			}

			_createClass(Post, [{
				key: "initialize",
				value: function initialize() {
					initializeSpy();
				}
			}, {
				key: "validate",
				value: function validate() {
					validateSpy();
				}
			}, {
				key: "associate",
				value: function associate() {
					associateSpy();
				}
			}]);

			return Post;
		})(_2["default"]);

		beforeEach(function () {
			initializeSpy = _sinon2["default"].spy();
			validateSpy = _sinon2["default"].spy();
			associateSpy = _sinon2["default"].spy();
			post = new Post();
		});

		describe(".initialize()", function () {
			it("should be called during instantiation", function () {
				initializeSpy.called.should.be["true"];
			});
			it("should be called after .associate", function () {
				_sinon2["default"].assert.callOrder(associateSpy, initializeSpy);
			});
			it("should be called after .validate", function () {
				_sinon2["default"].assert.callOrder(validateSpy, initializeSpy);
			});
		});

		describe(".validate()", function () {
			it("should be called during instantiation", function () {
				validateSpy.called.should.be["true"];
			});
			it("should be called after .associate", function () {
				_sinon2["default"].assert.callOrder(associateSpy, validateSpy);
			});
		});

		describe(".associate()", function () {
			it("should be called during instantiation", function () {
				associateSpy.called.should.be["true"];
			});
		});
	});

	describe("(Associations)", function () {
		var Street = (function (_Model2) {
			_inherits(Street, _Model2);

			function Street() {
				_classCallCheck(this, Street);

				_get(Object.getPrototypeOf(Street.prototype), "constructor", this).apply(this, arguments);
			}

			return Street;
		})(_2["default"]);

		var Driver = (function (_Model3) {
			_inherits(Driver, _Model3);

			function Driver() {
				_classCallCheck(this, Driver);

				_get(Object.getPrototypeOf(Driver.prototype), "constructor", this).apply(this, arguments);
			}

			return Driver;
		})(_2["default"]);

		var Truck = (function (_Model4) {
			_inherits(Truck, _Model4);

			function Truck() {
				_classCallCheck(this, Truck);

				_get(Object.getPrototypeOf(Truck.prototype), "constructor", this).apply(this, arguments);
			}

			return Truck;
		})(_2["default"]);

		var Wheel = (function (_Model5) {
			_inherits(Wheel, _Model5);

			function Wheel() {
				_classCallCheck(this, Wheel);

				_get(Object.getPrototypeOf(Wheel.prototype), "constructor", this).apply(this, arguments);
			}

			return Wheel;
		})(_2["default"]);

		var SteeringWheel = (function (_Model6) {
			_inherits(SteeringWheel, _Model6);

			function SteeringWheel() {
				_classCallCheck(this, SteeringWheel);

				_get(Object.getPrototypeOf(SteeringWheel.prototype), "constructor", this).apply(this, arguments);
			}

			return SteeringWheel;
		})(_2["default"]);

		var street = undefined,
		    driver = undefined,
		    truck = undefined,
		    wheel = undefined,
		    steeringWheel = undefined;

		beforeEach(function () {
			street = new Street();
			driver = new Driver();
			truck = new Truck();
			wheel = new Wheel();
			steeringWheel = new SteeringWheel();
		});

		describe(".belongsTo(associationName, associationConstructor)", function () {
			describe("(when inverse association is hasOne)", function () {
				beforeEach(function () {
					truck.hasOne("steeringWheel", SteeringWheel);
					steeringWheel.belongsTo("truck", Truck);
				});

				it("should add the association to .associations", function () {
					steeringWheel.associations.truck.should.eql({
						parent: steeringWheel,
						type: "belongsTo",
						constructor: Truck,
						foreignName: "steeringWheel",
						foreignId: "truckId",
						foreignKey: "truck_id"
					});
				});

				it("should set the accessor property to null", function () {
					(steeringWheel.truck == null).should.be["true"];
				});

				it("should add the parent model onto the child model", function () {
					steeringWheel.truck = truck;
					truck.steeringWheel.should.eql(steeringWheel);
				});

				it("should add the association id onto the model", function () {
					truck.id = 1;
					steeringWheel.truck = truck;
					steeringWheel.should.have.property("truckId");
				});
			});

			describe("(when inverse association is hasMany)", function () {
				beforeEach(function () {
					truck.hasMany("wheels", Wheel);
					wheel.belongsTo("truck", Truck);
				});

				it("should add the association to .associations", function () {
					wheel.associations.truck.should.eql({
						parent: wheel,
						type: "belongsTo",
						constructor: Truck,
						foreignName: "wheel",
						foreignId: "truckId",
						foreignKey: "truck_id"
					});
				});

				it("should set the accessor property to null", function () {
					(wheel.truck == null).should.be["true"];
				});

				it("should add the parent model onto the child model", function () {
					wheel.truck = truck;
					truck.wheels[0].should.eql(wheel);
				});

				it("should add the association id onto the model", function () {
					truck.id = 1;
					wheel.truck = truck;
					wheel.truckId.should.eql(truck.id);
				});

				it("should reset the association when a new id is set onto the model", function () {
					truck.id = 1;
					wheel.truck = truck;
					wheel.truckId = 2;
					(wheel.truck == null).should.be["true"];
				});

				it("should reset the associationId when a new model is set onto the model", function () {
					truck.id = 1;
					wheel.truckId = 2;
					wheel.truck = truck;
					wheel.truckId.should.not.equal(2);
				});

				it("should add a model just once on the parent", function () {
					truck.id = 1;
					wheel.truck = truck;
					wheel.truck = truck;

					truck.wheels.length.should.equal(1);
				});
			});

			describe("(when associationName is different from the associationConstructor)", function () {
				beforeEach(function () {
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

				it("should find the renamed association", function () {
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

			describe("(when no inverse association is found)", function () {
				beforeEach(function () {
					wheel.belongsTo("truck", Truck);
				});

				it("should throw an error", function () {
					(function () {
						wheel.truck = truck;
					}).should["throw"]("Neither \"wheel\" or \"wheels\" are valid associations on \"Truck\"");
				});
			});

			describe("(with options)", function () {
				describe(".ambiguous", function () {
					beforeEach(function () {
						wheel.belongsTo("truck", Truck).ambiguous;
					});

					it("should add the association to .associations", function () {
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

					it("should not add the parent model to the child associatio", function () {
						wheel.truck = truck;
						(truck.wheel === undefined).should.be["true"];
					});
				});
			});
		});

		describe(".hasOne(associationName, associationConstructor)", function () {
			var associationName = undefined,
			    associationConstructor = undefined;

			beforeEach(function () {
				associationName = "user";
				associationConstructor = _testClassesJs.User;
				model.hasOne(associationName, associationConstructor);
			});

			it("should set the accessor function to null", function () {
				(model[associationName] == null).should.be["true"];
			});

			it("should add the association to .associations", function () {
				model.associations[associationName].should.eql({
					parent: model,
					type: "hasOne",
					constructor: associationConstructor,
					foreignId: "modelId",
					foreignKey: "model_id",
					foreignName: "model"
				});
			});

			it("should return an association setter", function () {
				truck.hasOne("steeringWheel", SteeringWheel).should.be.instanceOf(_libAssociationSetterJs2["default"]);
			});

			it("should reset the association when a new id is set onto the model", function () {
				truck.hasOne("steeringWheel", SteeringWheel);
				steeringWheel = new SteeringWheel();
				steeringWheel.id = 1;
				truck.steeringWheel = steeringWheel;
				truck.steeringWheelId = 2;
				(truck.steeringWheel == null).should.be["true"];
			});

			it("should reset the associationId when a new model is set onto the model", function () {
				truck.hasOne("steeringWheel", SteeringWheel);
				steeringWheel = new SteeringWheel();
				steeringWheel.id = 1;
				truck.steeringWheelId = 2;
				truck.steeringWheel = steeringWheel;
				truck.steeringWheelId.should.not.equal(2);
			});

			it("should accept a custom error message", function () {
				truck.hasOne("steeringWheel", SteeringWheel);
				truck.ensure("steeringWheel", _.isPresent, "must be there.");
				truck.invalidAttributes(function (invalidAttributeList) {
					invalidAttributeList.should.eql({
						"steeringWheel": ["must be there."]
					});
				});
			});

			describe("(with options)", function () {
				describe(".ambiguous", function () {
					it("should throw an error", function () {
						var query = truck.hasOne("steeringWheel", SteeringWheel);
						query.should.not.have.property("ambiguous");
					});
				});

				describe(".where(...conditions)", function () {
					beforeEach(function () {
						_2["default"].database.mock({
							"select * from `users` where `id` = 1 limit 1": [{ id: 1 }],
							"select * from `photos` where `user_id` = 1 and (`is_favorite` = true) limit 1": [{
								id: 1,
								name: "Favorite Photo"
							}]
						});
						user.hasOne("favoritePhoto", _testClassesJs.Photo).where("isFavorite", true);
					});

					it("should set more than one condition joined by AND", function (done) {
						_2["default"].database.mock({
							"select * from `users` where `id` = 1 limit 1": [{ id: 1 }],
							"select * from `photos` where `user_id` = 1 and (`is_favorite` = true and `is_face_photo` = true) limit 1": [{ name: "Favorite Face Photo" }]
						});

						user.hasOne("favoriteFacePhoto", _testClassesJs.Photo).where("isFavorite", true).andWhere("isFacePhoto", true);

						user.include("favoriteFacePhoto").fetch(function () {
							user.favoriteFacePhoto.name.should.eql("Favorite Face Photo");
							done();
						});
					});

					it("should set the where conditions", function () {
						user.associations.favoritePhoto.where.should.eql(["isFavorite", true]);
					});

					it("should set conditions for the association", function (done) {
						user.include("favoritePhoto").fetch(function () {
							user.favoritePhoto.name.should.eql("Favorite Photo");
							done();
						});
					});
				});
			});
		});

		describe(".hasMany(associationName, associationConstructor)", function () {
			var associationName = undefined,
			    associationConstructor = undefined;

			beforeEach(function () {
				associationName = "users";
				associationConstructor = _testClassesJs.User;
				model.hasMany(associationName, associationConstructor);
			});

			it("should set the accessor function to a Collection", function () {
				model[associationName].should.be.instanceOf(_libCollectionJs2["default"]);
			});

			it("should initially set the accessor function Collection to be empty", function () {
				model[associationName].length.should.equal(0);
			});

			it("should add the association to .associate()", function () {
				model.associations[associationName].should.eql({
					parent: model,
					type: "hasMany",
					constructor: associationConstructor,
					foreignId: "modelId",
					foreignKey: "model_id",
					foreignName: "model"
				});
			});

			it("should accept a custom error message", function () {
				truck.hasMany("wheels", Wheel);
				truck.ensure("wheels", _.isPresent, "must be there.");
				truck.invalidAttributes(function (invalidAttributeList) {
					invalidAttributeList.should.eql({
						"wheels": ["must be there."]
					});
				});
			});

			describe("(with options)", function () {
				describe(".ambiguous", function () {
					it("should throw an error", function () {
						var query = truck.hasOne("steeringWheel", SteeringWheel);
						query.should.not.have.property("ambiguous");
					});
				});

				describe(".where(...conditions)", function () {
					describe("(with one where condition)", function () {
						beforeEach(function () {
							_2["default"].database.mock({
								"select * from `users` where `id` = 1 limit 1": [{ id: 1 }],
								"select * from `photos` where `user_id` = 1 and (`is_favorite` = true)": [{ id: 1, name: "Favorite Photo" }, { id: 2, name: "Another Favorite Photo" }, { id: 3, name: "Mostest Favoritest Photo" }]
							});

							user.hasMany("favoritePhotos", _testClassesJs.Photo).where("isFavorite", true);
						});

						it("should set the where conditions", function () {
							user.associations.favoritePhotos.where.should.eql(["isFavorite", true]);
						});

						it("should set conditions for the association", function (done) {
							user.include("favoritePhotos").fetch(function () {
								user.favoritePhotos.length.should.eql(3);
								done();
							});
						});
					});

					describe("(with multiple where conditions)", function () {
						beforeEach(function () {
							_2["default"].database.mock({
								"select * from `users` where `id` = 1 limit 1": [{ id: 1 }],
								"select * from `photos` where `user_id` = 1 and (`is_favorite` = true and `is_face_photo` = true)": [{ id: 1, name: "Favorite Face Photo" }, { id: 2, name: "Another Favorite Face Photo" }, { id: 3, name: "Mostest Favoritest Face Photo" }]
							});

							user.hasMany("favoriteFacePhotos", _testClassesJs.Photo).where("isFavorite", true).andWhere("isFacePhoto", true);
						});

						it("should set the where conditions", function () {
							user.associations.favoriteFacePhotos.andWhere.should.eql([["isFacePhoto", true]]);
						});

						it("should set conditions for the association", function (done) {
							user.include("favoriteFacePhotos").fetch(function () {
								user.favoriteFacePhotos.length.should.eql(3);
								done();
							});
						});
					});
				});

				xdescribe(".through(associationName)", function () {
					beforeEach(function () {
						_2["default"].database.mock({});
					});

					it("should return the association set to allow further chaining", function () {
						user.hasMany("comments", _testClassesJs.Comment).through("apiKey").should.be.instanceOf(_libAssociationSetterJs2["default"]);
					});

					it("should fetch hasMany through associations", function (done) {
						user.include("comments").fetch(function (error) {
							user.comments.user.comments[0].instanceOf(_testClassesJs.Comment);
							done();
						});
					});
				});
			});
		});
	});

	describe("(Validations)", function () {
		describe(".invalidAttributes(callback)", function () {
			describe("(when all validations pass)", function () {
				beforeEach(function () {
					user.photos.push(photo);
				});

				it("should return an empty object", function () {
					user.invalidAttributes(function (attributes) {
						attributes.should.eql({});
					});
				});
			});

			describe("(when any validations fail)", function () {
				beforeEach(function () {
					// Force database to fail isPresent on user.photos
					_2["default"].database.mock({
						"select count(*) as `rowCount` from `photos` where `user_id` = 1": [{ rowCount: 0 }]
					});
				});

				it("should retun just one multi error object the appropiate number of errors", function (done) {
					user.save(function (error) {
						error.errors.length.should.equal(1);
						done();
					});
				});

				it("should retun just one multi error object the appropiate name", function (done) {
					user.save(function (error) {
						error.name.should.equal("User is invalid");
						done();
					});
				});

				it("should return an object containing all invalid attributes", function (done) {
					user.invalidAttributes(function (attributes) {
						attributes.should.eql({
							"photos": ["must be present on User"]
						});
						done();
					});
				});
			});
		});

		describe(".isValid(callback)", function () {
			describe("(when all validations pass)", function () {
				beforeEach(function () {
					user.photos.push(photo);
				});

				it("should return true", function (done) {
					user.isValid(function (isValid) {
						isValid.should.be["true"];
						done();
					});
				});
			});

			describe("(when any validations fail)", function () {
				beforeEach(function () {
					// Force database to fail isPresent on user.photos
					_2["default"].database.mock({
						"select count(*) as `rowCount` from `photos` where `user_id` = 1": [{ rowCount: 0 }]
					});
				});

				it("should return false", function (done) {
					user.isValid(function (isValid) {
						isValid.should.be["false"];
						done();
					});
				});
			});
		});

		describe(".validations", function () {
			it("should return an object representing all validations on the model", function () {
				user.validations.should.eql({
					"photos": [{
						validator: _.isPresent
					}]
				});
			});
		});

		describe(".ensure(attributeName, validatorFunction, validatorMessage)", function () {
			var validatorFunction = undefined,
			    validatorMessage = undefined;
			beforeEach(function () {
				validatorFunction = function (value, callback) {
					callback(null, true);
				};
				validatorMessage = "must be a number.";
			});

			it("should add the validator to .validations", function () {
				user.ensure("photos", validatorFunction, validatorMessage);
				user.validations.should.eql({
					"photos": [{
						validator: _.isPresent
					}, {
						validator: validatorFunction,
						message: validatorMessage
					}]
				});
			});
		});
	});

	describe("(Persistence)", function () {

		describe(".as(associationName)", function () {
			it("should set the referencing association name in a hasMany through belongsTo", function (done) {
				_2["default"].database.mock({
					"select * from `photos` where `id` = 1 limit 1": [{}],
					"select * from `comments` where `photo_id` = 1": [{ id: 1, "author_id": 5 }, { id: 2, "author_id": 6 }, { id: 3, "author_id": 7 }],
					"select * from `users` where `id` in (5, 6, 7)": [{}, {}, {}]
				});

				photo.id = 1;

				photo.include("commentAuthors").fetch(function (errors) {
					photo.commentAuthors.length.should.equal(3);
					done();
				});
			});
		});

		describe(".include(associationNames)", function () {
			var associationNames = undefined;

			beforeEach(function () {
				associationNames = ["primaryPhoto", "photos"];
			});

			it("should throw an error if an association name is not found", function () {
				_2["default"].database.mock({
					"select * from `users` where `id` = 1 limit 1": [userAttributes]
				});
				(function () {
					user.include("bogusAssociation").fetch();
				}).should["throw"]("Cannot fetch 'bogusAssociation' because it is not a valid association on User");
			});

			it("should throw an error if a belongs to association id is not set", function () {
				_2["default"].database.mock({
					"select * from `comments` where `id` = 1 limit 1": [{ id: 1 }]
				});

				(function () {
					comment.id = 1;
					comment.include("photo").fetch();
				}).should["throw"]("Cannot fetch 'photo' because 'photoId' is not set on Comment");
			});

			it("should return the model to support chaining", function () {
				var _user;

				(_user = user).include.apply(_user, _toConsumableArray(associationNames)).should.equal(user);
			});

			it("should fetch belongsTo associations", function (done) {
				_2["default"].database.mock({
					"select * from `photos` where `id` = 1 limit 1": [{ id: 1 }],
					"select * from `users` where `id` = 1 limit 1": [{ id: 1, name: "Bob Barker" }]
				});

				photo.id = 1;
				photo.userId = 1;
				photo.include("user").fetch(function (errors) {
					photo.user.name.should.eql("Bob Barker");
					done();
				});
			});

			it("should fetch hasOne associations", function (done) {
				_2["default"].database.mock({
					"select * from `users` where `id` = 1 limit 1": [userAttributes],
					"select * from `photos` where `user_id` = 1 and (`is_primary` = true) limit 1": [{
						name: "Primary Photo"
					}]
				});

				user.include("primaryPhoto").fetch(function (errors) {
					user.primaryPhoto.name.should.eql("Primary Photo");
					done();
				});
			});

			it("should fetch hasMany associations", function (done) {
				_2["default"].database.mock({
					"select * from `users` where `id` = 1 limit 1": [userAttributes],
					"select * from `photos` where `user_id` = 1": [{ name: "Some Photo" }, { name: "Some Other Photo" }, { name: "Still Some Photo" }]
				});

				user.include("photos").fetch(function (errors) {
					user.photos.length.should.eql(3);
					done();
				});
			});

			it("should fetch hasOne through associations", function () {
				_2["default"].database.mock({
					"select * from `users` where `id` = 1 limit 1": [{}],
					"select * from `addresses` where `user_id` = 1 limit 1": [{
						"user_id": 1,
						"postal_code_id": 2
					}],
					"select * from `postal_codes` where `id` = 2 limit 1": [{ number: 90210 }]
				});

				user.include("postalCode").fetch(function (errors) {
					user.postalCode.number.should.eql(90210);
				});
			});

			it("should fetch hasMany through hasMany associations", function (done) {
				_2["default"].database.mock({
					"select * from `users` where `id` = 1 limit 1": [{ id: 1 }],
					"select * from `photos` where `user_id` = 1": [{ id: 3 }, { id: 4 }, { id: 5 }],
					"select * from `comments` where `photo_id` in (3, 4, 5)": [{}, {}, {}]
				});

				user.include("comments").fetch(function (errors) {
					user.comments.length.should.equal(3);
					done();
				});
			});

			it("should throw an error when the destination association is not found on the through model", function () {
				_2["default"].database.mock({
					"select * from `users` where `id` = 1 limit 1": [{}],
					"select * from `photos` where `user_id` = 1": [{ id: 3 }]
				});

				var Post = function Post() {
					_classCallCheck(this, Post);
				} // Needed to mock a through association that is incomplete

				;

				(function () {
					user.hasMany("posts", Post).through("photos");

					user.include("posts").fetch();
				}).should["throw"]("'posts' is not a valid association on through model 'Photo'");
			});

			it("should fetch hasMany through hasOne associations", function (done) {
				_2["default"].database.mock({
					"select * from `photos` where `id` = 1 limit 1": [{}],
					"select * from `comments` where `photo_id` = 1": [{ "author_id": 4 }, { "author_id": 5 }, { "author_id": 6 }],
					"select * from `users` where `id` in (4, 5, 6)": [{}, {}, {}]
				});

				photo.id = 1; // Need primary key to fetch

				photo.include("commentAuthors").fetch(function (errors) {
					photo.commentAuthors.length.should.equal(3);
					done();
				});
			});

			xit("should fetch hasMany through belongsTo associations", function (done) {
				_2["default"].database.mock({
					"select * from `users` where `id` = 1 limit 1": [{}]
				});

				user.include("comments").fetch(function (errors) {
					user.comments.length.should.equal(3);
					done();
				});
			});

			it("should fetch more than one association at once", function (done) {
				_2["default"].database.mock({
					"select * from `users` where `id` = 1 limit 1": [userAttributes],
					"select * from `photos` where `user_id` = 1 and (`is_primary` = true) limit 1": [{ name: "Primary Photo" }],
					"select * from `photos` where `user_id` = 1": [{ name: "Some Photo" }, { name: "Some Other Photo" }, { name: "Still Some Photo" }, { name: "Primary Photo" }]
				});

				user.include("photos", "primaryPhoto").fetch(function (errors) {
					[user.photos.length, user.primaryPhoto.name].should.eql([4, "Primary Photo"]);
					done();
				});
			});
		});
	});

	describe("(exporting)", function () {
		describe(".toJSON()", function () {
			it("should return a plain unformatted model", function () {
				user.toJSON().should.eql(userAttributes);
			});
		});
	});
});