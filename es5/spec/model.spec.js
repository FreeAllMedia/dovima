/* Testing Dependencies */

"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

//import MultiError from "../../multiError/multiError.js";

//import MultiError from "../../multiError/multiError.js";

var _almaden = require("almaden");

var _almaden2 = _interopRequireDefault(_almaden);

var _libValidationIsPresentJs = require("../lib/validation/isPresent.js");

var _libValidationIsPresentJs2 = _interopRequireDefault(_libValidationIsPresentJs);

var _libCollectionJs = require("../lib/collection.js");

var _libCollectionJs2 = _interopRequireDefault(_libCollectionJs);

var _libModelJs = require("../lib/model.js");

var _libModelJs2 = _interopRequireDefault(_libModelJs);

var _libModelFinderJs = require("../lib/modelFinder.js");

var sinon = require("sinon");

/* Test Configuration */
//nothing from a real connection needed since we are mocking here
var databaseConfig = {
	"debug": true,
	"client": "mysql",
	"connection": {},
	"pool": {
		"max": 2,
		"min": 2
	}
};

var userFixtures = require("./fixtures/users.json");

describe("Model(attributes, options)", function () {

	/**
  * Setup Model Examples
  */

	/* Simple Example */

	var User = (function (_Model) {
		function User() {
			_classCallCheck(this, User);

			_get(Object.getPrototypeOf(User.prototype), "constructor", this).apply(this, arguments);
		}

		_inherits(User, _Model);

		_createClass(User, [{
			key: "associate",
			value: function associate() {
				this.hasOne("address", Address);

				this.hasOne("postalCode", PostalCode).through("address");

				this.hasMany("photos", Photo);

				// this.hasMany("deletedPhotos", Photo)
				// 	.where("deletedAt", "!=", null);

				this.hasOne("primaryPhoto", Photo).where("isPrimary", true);

				this.hasMany("photoLikes", PhotoLike);
				this.hasMany("likedPhotos", Photo).through("photoLikes");

				this.hasMany("comments", Comment).through("photos");

				this.hasMany("deletedComments", Comment).through("photos").where("comments.deletedAt", "!=", null);
			}
		}, {
			key: "validate",
			value: function validate() {
				this.ensure("photos", _libValidationIsPresentJs2["default"]);
			}
		}]);

		return User;
	})(_libModelJs2["default"]);

	var Address = (function (_Model2) {
		function Address() {
			_classCallCheck(this, Address);

			_get(Object.getPrototypeOf(Address.prototype), "constructor", this).apply(this, arguments);
		}

		_inherits(Address, _Model2);

		_createClass(Address, [{
			key: "associate",
			value: function associate() {
				this.belongsTo("user", User);
				this.belongsTo("postalCode", PostalCode);
			}
		}, {
			key: "validate",
			value: function validate() {
				this.ensure("photos", _libValidationIsPresentJs2["default"]);
			}
		}]);

		return Address;
	})(_libModelJs2["default"]);

	var PostalCode = (function (_Model3) {
		function PostalCode() {
			_classCallCheck(this, PostalCode);

			_get(Object.getPrototypeOf(PostalCode.prototype), "constructor", this).apply(this, arguments);
		}

		_inherits(PostalCode, _Model3);

		_createClass(PostalCode, [{
			key: "associate",
			value: function associate() {
				this.hasMany("addresses");
			}
		}]);

		return PostalCode;
	})(_libModelJs2["default"]);

	var PhotoLike = (function () {
		function PhotoLike() {
			_classCallCheck(this, PhotoLike);
		}

		_createClass(PhotoLike, [{
			key: "associate",
			value: function associate() {
				this.belongsTo("user", User);
				this.belongsTo("photo", User);
			}
		}, {
			key: "validate",
			value: function validate() {
				this.ensure("user", _libValidationIsPresentJs2["default"]);
				this.ensure("photo", _libValidationIsPresentJs2["default"]);
			}
		}]);

		return PhotoLike;
	})();

	var Photo = (function (_Model4) {
		function Photo() {
			_classCallCheck(this, Photo);

			_get(Object.getPrototypeOf(Photo.prototype), "constructor", this).apply(this, arguments);
		}

		_inherits(Photo, _Model4);

		_createClass(Photo, [{
			key: "associate",
			value: function associate() {
				this.belongsTo("user", User).ambiguous;

				this.hasMany("comments", Comment);

				this.hasMany("commentAuthors", User).through("comments").as("author");

				this.hasMany("photoLikes", PhotoLike);

				this.hasMany("likedByUsers", User).through("photoLikes");
			}
		}, {
			key: "validate",
			value: function validate() {
				this.ensure("user", _libValidationIsPresentJs2["default"]);
			}
		}]);

		return Photo;
	})(_libModelJs2["default"]);

	var Comment = (function (_Model5) {
		function Comment() {
			_classCallCheck(this, Comment);

			_get(Object.getPrototypeOf(Comment.prototype), "constructor", this).apply(this, arguments);
		}

		_inherits(Comment, _Model5);

		_createClass(Comment, [{
			key: "associate",
			value: function associate() {
				this.belongsTo("photo", Photo);
				this.belongsTo("author", User);
			}
		}]);

		return Comment;
	})(_libModelJs2["default"]);

	var Rating = (function (_Model6) {
		function Rating() {
			_classCallCheck(this, Rating);

			_get(Object.getPrototypeOf(Rating.prototype), "constructor", this).apply(this, arguments);
		}

		_inherits(Rating, _Model6);

		_createClass(Rating, [{
			key: "associate",
			value: function associate() {
				this.belongsTo("owner", Comment).isPolymorphic;
			}
		}]);

		return Rating;
	})(_libModelJs2["default"]);

	/**
  * Instantiate Model Examples
  */

	var model = undefined,
	    user = undefined,
	    userAttributes = undefined,
	    photo = undefined,
	    primaryPhoto = undefined,
	    postalCode = undefined,
	    address = undefined,
	    comment = undefined,
	    clock = undefined;

	beforeEach(function () {
		clock = sinon.useFakeTimers();

		_libModelJs2["default"].database = new _almaden2["default"](databaseConfig);
		_libModelJs2["default"].database.mock({}); // Catch-all for database

		model = new _libModelJs2["default"]();

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

	afterEach(function () {
		return clock.restore();
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
				user = new User();
				user.attributes = userAttributes;
				user.attributes.should.eql(userAttributes);
			});
		});

		describe(".properties", function () {
			it("should return the name of all attributes plus associations on the model", function () {
				user.properties.should.eql(["address", "postalCode", "photos", "primaryPhoto", "photoLikes", "likedPhotos", "comments", "deletedComments", "id", "name", "age", "hasChildren"]);
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

	describe("(static properties)", function () {
		describe(".find", function () {
			var users = undefined,
			    userCollection = undefined;

			before(function () {
				userCollection = new _libCollectionJs2["default"](User);
				userFixtures.forEach(function (userFiture) {
					userCollection.push(new User(userFiture));
				});
			});

			beforeEach(function (done) {
				_libModelJs2["default"].database.mock({
					"select * from `users` where `mom_id` = 1": userFixtures
				});

				User.find.where("momId", "=", 1).results(function (error, fetchedUsers) {
					users = fetchedUsers;
					done();
				});
			});

			it("should return a ModelQuery instance", function () {
				User.find.should.be.instanceOf(_libModelFinderJs.ModelQuery);
			});

			it("should return a collection", function () {
				users.should.be.instanceOf(_libCollectionJs2["default"]);
			});

			it("should return the right collection", function () {
				users.should.eql(userCollection);
			});

			it("should allow to search all models that matchs a certain condition", function () {
				users.length.should.equal(5);
			});

			describe(".one", function () {
				beforeEach(function (done) {
					_libModelJs2["default"].database.mock({
						"select * from `users` where `mom_id` = 1 limit 1": [userFixtures[0]]
					});

					User.find.one.where("momId", 1).results(function (error, fetchedUsers) {
						users = fetchedUsers;
						done();
					});
				});

				it("should return just one user", function () {
					users.length.should.equal(1);
				});
			});

			describe(".all", function () {
				beforeEach(function (done) {
					User.find.all.where("momId", 1).results(function (error, fetchedUsers) {
						users = fetchedUsers;
						done();
					});
				});

				it("should return just all users matching the condition", function () {
					users.length.should.equal(5);
				});
			});

			describe(".deleted", function () {
				var SoftUser = (function (_Model7) {
					function SoftUser() {
						_classCallCheck(this, SoftUser);

						_get(Object.getPrototypeOf(SoftUser.prototype), "constructor", this).apply(this, arguments);
					}

					_inherits(SoftUser, _Model7);

					_createClass(SoftUser, [{
						key: "initialize",
						value: function initialize() {
							this.softDelete;
						}
					}]);

					return SoftUser;
				})(_libModelJs2["default"]);

				beforeEach(function (done) {
					_libModelJs2["default"].database.mock({
						"select * from `soft_users` where `mom_id` = 1 and `deleted_at` is not null": userFixtures
					});

					SoftUser.find.all.where("momId", 1).deleted.results(function (error, fetchedUsers) {
						users = fetchedUsers;
						done();
					});
				});

				it("should return just all users matching the condition", function () {
					users.length.should.equal(5);
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

		var Post = (function (_Model8) {
			function Post() {
				_classCallCheck(this, Post);

				_get(Object.getPrototypeOf(Post.prototype), "constructor", this).apply(this, arguments);
			}

			_inherits(Post, _Model8);

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
		})(_libModelJs2["default"]);

		beforeEach(function () {
			initializeSpy = sinon.spy();
			validateSpy = sinon.spy();
			associateSpy = sinon.spy();
			post = new Post();
		});

		describe(".initialize()", function () {
			it("should be called during instantiation", function () {
				initializeSpy.called.should.be["true"];
			});
			it("should be called after .associate", function () {
				sinon.assert.callOrder(associateSpy, initializeSpy);
			});
			it("should be called after .validate", function () {
				sinon.assert.callOrder(validateSpy, initializeSpy);
			});
		});

		describe(".validate()", function () {
			it("should be called during instantiation", function () {
				validateSpy.called.should.be["true"];
			});
			it("should be called after .associate", function () {
				sinon.assert.callOrder(associateSpy, validateSpy);
			});
		});

		describe(".associate()", function () {
			it("should be called during instantiation", function () {
				associateSpy.called.should.be["true"];
			});
		});
	});

	describe("(Associations)", function () {
		var Street = (function (_Model9) {
			function Street() {
				_classCallCheck(this, Street);

				_get(Object.getPrototypeOf(Street.prototype), "constructor", this).apply(this, arguments);
			}

			_inherits(Street, _Model9);

			return Street;
		})(_libModelJs2["default"]);

		var Driver = (function (_Model10) {
			function Driver() {
				_classCallCheck(this, Driver);

				_get(Object.getPrototypeOf(Driver.prototype), "constructor", this).apply(this, arguments);
			}

			_inherits(Driver, _Model10);

			return Driver;
		})(_libModelJs2["default"]);

		var Truck = (function (_Model11) {
			function Truck() {
				_classCallCheck(this, Truck);

				_get(Object.getPrototypeOf(Truck.prototype), "constructor", this).apply(this, arguments);
			}

			_inherits(Truck, _Model11);

			return Truck;
		})(_libModelJs2["default"]);

		var Wheel = (function (_Model12) {
			function Wheel() {
				_classCallCheck(this, Wheel);

				_get(Object.getPrototypeOf(Wheel.prototype), "constructor", this).apply(this, arguments);
			}

			_inherits(Wheel, _Model12);

			return Wheel;
		})(_libModelJs2["default"]);

		var SteeringWheel = (function (_Model13) {
			function SteeringWheel() {
				_classCallCheck(this, SteeringWheel);

				_get(Object.getPrototypeOf(SteeringWheel.prototype), "constructor", this).apply(this, arguments);
			}

			_inherits(SteeringWheel, _Model13);

			return SteeringWheel;
		})(_libModelJs2["default"]);

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
				associationConstructor = User;
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
				truck.hasOne("steeringWheel", SteeringWheel).should.be.instanceOf(_libModelJs.AssociationSetter);
			});

			it("should accept a custom error message", function () {
				truck.hasOne("steeringWheel", SteeringWheel);
				truck.ensure("steeringWheel", _libValidationIsPresentJs2["default"], "must be there.");
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
						_libModelJs2["default"].database.mock({
							"select * from `users` where `id` = 1 limit 1": [{ id: 1 }],
							"select * from `photos` where `user_id` = 1 and (`is_favorite` = true) limit 1": [{
								id: 1,
								name: "Favorite Photo"
							}]
						});
						user.hasOne("favoritePhoto", Photo).where("isFavorite", true);
					});

					it("should set more than one condition joined by AND", function (done) {
						_libModelJs2["default"].database.mock({
							"select * from `users` where `id` = 1 limit 1": [{ id: 1 }],
							"select * from `photos` where `user_id` = 1 and (`is_favorite` = true and `is_face_photo` = true) limit 1": [{ name: "Favorite Face Photo" }]
						});

						user.hasOne("favoriteFacePhoto", Photo).where("isFavorite", true).andWhere("isFacePhoto", true);

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
				associationConstructor = User;
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
				truck.ensure("wheels", _libValidationIsPresentJs2["default"], "must be there.");
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
							_libModelJs2["default"].database.mock({
								"select * from `users` where `id` = 1 limit 1": [{ id: 1 }],
								"select * from `photos` where `user_id` = 1 and (`is_favorite` = true)": [{ id: 1, name: "Favorite Photo" }, { id: 2, name: "Another Favorite Photo" }, { id: 3, name: "Mostest Favoritest Photo" }]
							});

							user.hasMany("favoritePhotos", Photo).where("isFavorite", true);
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
							_libModelJs2["default"].database.mock({
								"select * from `users` where `id` = 1 limit 1": [{ id: 1 }],
								"select * from `photos` where `user_id` = 1 and (`is_favorite` = true and `is_face_photo` = true)": [{ id: 1, name: "Favorite Face Photo" }, { id: 2, name: "Another Favorite Face Photo" }, { id: 3, name: "Mostest Favoritest Face Photo" }]
							});

							user.hasMany("favoriteFacePhotos", Photo).where("isFavorite", true).andWhere("isFacePhoto", true);
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
						_libModelJs2["default"].database.mock({});
					});

					it("should return the association set to allow further chaining", function () {
						user.hasMany("comments", Comment).through("apiKey").should.be.instanceOf(_libModelJs.AssociationSetter);
					});

					it("should fetch hasMany through associations", function (done) {
						user.include("comments").fetch(function (error) {
							user.comments.user.comments[0].instanceOf(Comment);
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
					_libModelJs2["default"].database.mock({
						"select count(*) as `rowCount` from `photos` where `user_id` = 1": [{ rowCount: 0 }]
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
					_libModelJs2["default"].database.mock({
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
						validator: _libValidationIsPresentJs2["default"]
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
						validator: _libValidationIsPresentJs2["default"]
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
				_libModelJs2["default"].database.mock({
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
				_libModelJs2["default"].database.mock({
					"select * from `users` where `id` = 1 limit 1": [userAttributes]
				});
				(function () {
					user.include("bogusAssociation").fetch();
				}).should["throw"]("Cannot fetch 'bogusAssociation' because it is not a valid association on User");
			});

			it("should throw an error if a belongs to association id is not set", function () {
				_libModelJs2["default"].database.mock({
					"select * from `comments` where `id` = 1 limit 1": [{ id: 1 }]
				});

				(function () {
					comment.id = 1;
					comment.include("photo").fetch();
				}).should["throw"]("Cannot fetch 'photo' because 'photoId' is not set on Comment");
			});

			it("should return the model to support chaining", function () {
				user.include.apply(user, _toConsumableArray(associationNames)).should.equal(user);
			});

			it("should fetch belongsTo associations", function (done) {
				_libModelJs2["default"].database.mock({
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
				_libModelJs2["default"].database.mock({
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
				_libModelJs2["default"].database.mock({
					"select * from `users` where `id` = 1 limit 1": [userAttributes],
					"select * from `photos` where `user_id` = 1": [{ name: "Some Photo" }, { name: "Some Other Photo" }, { name: "Still Some Photo" }]
				});

				user.include("photos").fetch(function (errors) {
					user.photos.length.should.eql(3);
					done();
				});
			});

			it("should fetch hasOne through associations", function () {
				_libModelJs2["default"].database.mock({
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
				_libModelJs2["default"].database.mock({
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
				_libModelJs2["default"].database.mock({
					"select * from `users` where `id` = 1 limit 1": [{}],
					"select * from `photos` where `user_id` = 1": [{ id: 3 }]
				});

				var Post = function Post() {
					_classCallCheck(this, Post);
				};

				// Needed to mock a through association that is incomplete

				(function () {
					user.hasMany("posts", Post).through("photos");

					user.include("posts").fetch();
				}).should["throw"]("'posts' is not a valid association on through model 'Photo'");
			});

			it("should fetch hasMany through hasOne associations", function (done) {
				_libModelJs2["default"].database.mock({
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
				_libModelJs2["default"].database.mock({
					"select * from `users` where `id` = 1 limit 1": [{}]
				});

				user.include("comments").fetch(function (errors) {
					user.comments.length.should.equal(3);
					done();
				});
			});

			it("should fetch more than one association at once", function (done) {
				_libModelJs2["default"].database.mock({
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

		describe(".delete(callback)", function () {
			describe("(when dependent is declared on the association)", function () {
				var Account = (function (_Model14) {
					function Account() {
						_classCallCheck(this, Account);

						_get(Object.getPrototypeOf(Account.prototype), "constructor", this).apply(this, arguments);
					}

					_inherits(Account, _Model14);

					_createClass(Account, [{
						key: "initialize",
						value: function initialize() {
							this.softDelete;
						}
					}, {
						key: "associate",
						value: function associate() {
							this.hasOne("forumUser", ForumUser).dependent;
						}
					}]);

					return Account;
				})(_libModelJs2["default"]);

				var ForumUser = (function (_Model15) {
					function ForumUser() {
						_classCallCheck(this, ForumUser);

						_get(Object.getPrototypeOf(ForumUser.prototype), "constructor", this).apply(this, arguments);
					}

					_inherits(ForumUser, _Model15);

					_createClass(ForumUser, [{
						key: "initialize",
						value: function initialize() {
							this.softDelete;
						}
					}, {
						key: "associate",
						value: function associate() {
							this.hasMany("posts", Post).dependent;
							this.belongsTo("account", Account).dependent;
						}
					}]);

					return ForumUser;
				})(_libModelJs2["default"]);

				var Post = (function (_Model16) {
					function Post() {
						_classCallCheck(this, Post);

						_get(Object.getPrototypeOf(Post.prototype), "constructor", this).apply(this, arguments);
					}

					_inherits(Post, _Model16);

					_createClass(Post, [{
						key: "initialize",
						value: function initialize() {
							this.softDelete;
						}
					}, {
						key: "associate",
						value: function associate() {
							this.belongsTo("forumUser", ForumUser);
						}
					}]);

					return Post;
				})(_libModelJs2["default"]);

				var forumUser = undefined,
				    account = undefined,
				    post = undefined;

				beforeEach(function () {
					account = new Account({ id: 1 });
					forumUser = new ForumUser({ id: 2 });
					post = new Post({ id: 3 });
				});

				it("should add the association to .associations", function () {
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

				describe("(on a hasOne)", function () {
					var userDeleteQuerySpy = undefined;

					beforeEach(function () {
						_libModelJs2["default"].database.mock(_defineProperty({}, /update `accounts` set `deleted_at` = '1969-12-31 [0-9][0-9]:00:00.000' where `id` = 1/, 1));

						userDeleteQuerySpy = _libModelJs2["default"].database.spy(/update `forum_users` set `deleted_at` = '1969-12-31 [0-9][0-9]:00:00.000' where `id` = 2/, 1);

						account.forumUser = forumUser;
					});

					it("should propagate delete on those models", function (done) {
						account["delete"](function () {
							userDeleteQuerySpy.callCount.should.equal(1);
							done();
						});
					});
				});

				describe("(on a hasMany)", function () {
					var postDeleteQuerySpy = undefined;

					beforeEach(function () {
						_libModelJs2["default"].database.mock(_defineProperty({}, /update `forum_users` set `deleted_at` = '1969-12-31 [0-9][0-9]:00:00.000' where `id` = 2/, 1));

						postDeleteQuerySpy = _libModelJs2["default"].database.spy(/update `posts` set `deleted_at` = '1969-12-31 [0-9][0-9]:00:00.000' where `id` = 3/, 1);

						forumUser.posts.push(post);
					});

					it("should propagate delete on those models", function (done) {
						forumUser["delete"](function () {
							postDeleteQuerySpy.callCount.should.equal(1);
							done();
						});
					});
				});
			});

			describe("(when .softDelete is not called)", function () {
				var Post = (function (_Model17) {
					function Post() {
						_classCallCheck(this, Post);

						_get(Object.getPrototypeOf(Post.prototype), "constructor", this).apply(this, arguments);
					}

					_inherits(Post, _Model17);

					return Post;
				})(_libModelJs2["default"]);

				var post = undefined;

				beforeEach(function () {
					post = new Post();
				});

				it("should throw when calling delete", function () {
					(function () {
						post["delete"]();
					}).should["throw"]("Not implemented.");
				});
			});

			describe("when softDelete called)", function () {
				var post = undefined;

				var Post = (function (_Model18) {
					function Post() {
						_classCallCheck(this, Post);

						_get(Object.getPrototypeOf(Post.prototype), "constructor", this).apply(this, arguments);
					}

					_inherits(Post, _Model18);

					_createClass(Post, [{
						key: "initialize",
						value: function initialize() {
							this.softDelete;
						}
					}]);

					return Post;
				})(_libModelJs2["default"]);

				beforeEach(function () {
					post = new Post();
				});

				describe("(Model.database is set)", function () {
					describe("(when primaryKey is set)", function () {
						beforeEach(function () {
							post.id = 1;
							_libModelJs2["default"].database.mock(_defineProperty({}, /update `posts` set `deleted_at` = \'1969-12-31 [0-9][0-9]:00:00.000\' where `id` = 1/, 1));
						});

						it("should not throw when calling delete", function () {
							(function () {
								post["delete"](function () {});
							}).should.not["throw"]();
						});

						it("should return no error", function () {
							post["delete"](function (error) {
								(error == null).should.be["true"];
							});
						});

						describe("(when primary key is set but not exists)", function () {
							beforeEach(function () {
								post.id = 1;
								_libModelJs2["default"].database.mock(_defineProperty({}, /update `posts` set `deleted_at` = \'1969-12-31 [0-9][0-9]:00:00.000\' where `id` = 1/, 0));
							});

							it("should return an error", function () {
								post["delete"](function (error) {
									error.should.eql(new Error("Post with id 1 cannot be soft deleted because it doesn't exists."));
								});
							});
						});
					});

					describe("(when primaryKey is not set)", function () {
						it("should throw an error", function () {
							(function () {
								post["delete"](function () {});
							}).should["throw"]("Cannot delete the Post because the primary key is not set.");
						});
					});
				});

				describe("(Model.database not set)", function () {
					beforeEach(function () {
						delete _libModelJs2["default"].database;
					});

					it("should throw an error", function () {
						(function () {
							post["delete"]();
						}).should["throw"]("Cannot delete without Model.database set.");
					});
				});
			});
		});

		describe(".fetch(callback)", function () {
			describe("(Model.database is set)", function () {
				beforeEach(function () {
					_libModelJs2["default"].database.mock({
						"select * from `users` where `id` = 1 limit 1": [userAttributes]
					});
				});

				describe("(when model has a primary key set)", function () {
					beforeEach(function () {
						user = new User({
							id: 1
						});
					});

					it("should fetch a record from the correct table", function (done) {
						user.fetch(function (error) {
							user.attributes.should.eql(userAttributes);
							done();
						});
					});

					it("should fetch a record from the correct table", function (done) {
						user.fetch(function (error) {
							user.attributes.should.eql(userAttributes);
							done();
						});
					});

					describe("(when soft delete is enabled)", function () {
						var post = undefined,
						    deleteQuerySpy = undefined;

						var Post = (function (_Model19) {
							function Post() {
								_classCallCheck(this, Post);

								_get(Object.getPrototypeOf(Post.prototype), "constructor", this).apply(this, arguments);
							}

							_inherits(Post, _Model19);

							_createClass(Post, [{
								key: "initialize",
								value: function initialize() {
									this.softDelete;
								}
							}]);

							return Post;
						})(_libModelJs2["default"]);

						beforeEach(function () {
							post = new Post({ id: 1 });
							//querySpy
							deleteQuerySpy = _libModelJs2["default"].database.spy("select * from `posts` where `id` = 1 and `deleted_at` is null limit 1", [{}]);
						});

						it("should add a where deleted is not null condition", function (done) {
							post.fetch(function () {
								deleteQuerySpy.callCount.should.equal(1);
								done();
							});
						});
					});
				});

				describe("(when model does not have a primary key set)", function () {
					beforeEach(function () {
						delete user.id;
					});

					it("should throw an error", function () {
						(function () {
							user.fetch();
						}).should["throw"]("Cannot fetch this model by the 'id' field because it is not set.");
					});
				});

				describe("(when there is no model with that id)", function () {
					beforeEach(function () {
						_libModelJs2["default"].database.mock({
							"select * from `users` where `id` = 1 limit 1": []
						});
						user = new User({
							id: 1
						});
					});

					it("should throw an error on the callback", function (done) {
						user.fetch(function (error) {
							error.should.be.instanceOf(Error);
							done();
						});
					});
				});
			});

			describe("(Model.database not set)", function () {
				beforeEach(function () {
					delete _libModelJs2["default"].database;
				});

				it("should throw an error", function () {
					(function () {
						user.fetch();
					}).should["throw"]("Cannot fetch without Model.database set.");
				});
			});
		});

		describe(".fetch(strategy, callback)", function () {
			describe("(when the type of the strategy is a string)", function () {
				describe("(Model.database is set)", function () {
					beforeEach(function () {
						_libModelJs2["default"].database.mock({
							"select * from `users` where `name` = 'someuser' limit 1": [userAttributes]
						});
					});

					describe("(when model has the specified attribute set)", function () {
						beforeEach(function () {
							user = new User({
								name: "someuser"
							});
						});

						it("should fetch a record from the correct table", function (done) {
							user.fetch("name", function (error) {
								user.attributes.should.eql(userAttributes);
								done();
							});
						});

						it("should fetch a record from the correct table", function (done) {
							user.fetch("name", function (error) {
								user.attributes.should.eql(userAttributes);
								done();
							});
						});
					});

					describe("(when model does not have the specified attribute set)", function () {
						beforeEach(function () {
							delete user.name;
						});

						it("should throw an error", function () {
							(function () {
								user.fetch("name");
							}).should["throw"]("Cannot fetch this model by the 'name' field because it is not set.");
						});
					});

					describe("(when there is no model with the specified attribute)", function () {
						beforeEach(function () {
							_libModelJs2["default"].database.mock({
								"select * from `users` where `name` = 'someuser' limit 1": []
							});
							user = new User({
								name: "someuser"
							});
						});

						it("should throw an error on the callback", function (done) {
							user.fetch("name", function (error) {
								error.should.be.instanceOf(Error);
								done();
							});
						});
					});
				});

				describe("(Model.database not set)", function () {
					beforeEach(function () {
						delete _libModelJs2["default"].database;
					});

					it("should throw an error", function () {
						(function () {
							user.fetch("name");
						}).should["throw"]("Cannot fetch without Model.database set.");
					});
				});
			});

			describe("(when the type of the strategy is an array)", function () {
				describe("(Model.database is set)", function () {
					beforeEach(function () {
						_libModelJs2["default"].database.mock({
							"select * from `users` where `name` = 'someuser' and `lastName` = 'someuserLastName' limit 1": [userAttributes]
						});
					});

					describe("(when model has the specified attribute set)", function () {
						beforeEach(function () {
							user = new User({
								name: "someuser",
								lastName: "someuserLastName"
							});
							userAttributes.lastName = "someuserLastName";
						});

						it("should fetch a record from the correct table", function (done) {
							user.fetch(["name", "lastName"], function (error) {
								user.attributes.should.eql(userAttributes);
								done();
							});
						});

						it("should fetch a record from the correct table", function (done) {
							user.fetch(["name", "lastName"], function (error) {
								user.attributes.should.eql(userAttributes);
								done();
							});
						});
					});

					describe("(when model does not have one of the specified attributes set)", function () {
						beforeEach(function () {
							delete user.lastName;
						});

						it("should throw an error", function () {
							(function () {
								user.fetch(["name", "lastName"]);
							}).should["throw"]("Cannot fetch this model by the 'lastName' field because it is not set.");
						});
					});

					describe("(when there is no model with the specified attribute)", function () {
						beforeEach(function () {
							_libModelJs2["default"].database.mock({
								"select * from `users` where `name` = 'someuser' and `lastName` = 'someuserLastName' limit 1": []
							});
							user = new User({
								name: "someuser",
								lastName: "someuserLastName"
							});
						});

						it("should throw an error on the callback", function (done) {
							user.fetch(["name", "lastName"], function (error) {
								error.should.be.instanceOf(Error);
								done();
							});
						});
					});
				});

				describe("(Model.database not set)", function () {
					beforeEach(function () {
						delete _libModelJs2["default"].database;
					});

					it("should throw an error", function () {
						(function () {
							user.fetch("name");
						}).should["throw"]("Cannot fetch without Model.database set.");
					});
				});
			});
		});

		describe(".save(callback)", function () {
			describe("(Model.database is set)", function () {
				describe("(when the model has associations)", function () {

					beforeEach(function () {
						var _Model$database$mock5;

						user.primaryPhoto = primaryPhoto;
						user.photos.push(photo);

						var regularExpressions = {
							insertPhotos: /insert into `photos` \(`created_at`, `user_id`\) values \('1969-12-31 [0-9][0-9]:00:00.000', 1\)/,
							updateUser: /update `users` set `age` = 35, `has_children` = false, `name` = 'Bob Builder', `updated_at` = '1969-12-31 [0-9][0-9]:00:00.000' where `id` = 1/,
							insertWheels: /insert into `wheels` \(`created_at`, `truck_id`\) values \('1969-12-31 [0-9][0-9]:00:00\.000', 1\)/,
							insertSteeringWheel: /insert into `steering_wheels` \(`created_at`, `truck_id`\) values \('1969-12-31 [0-9][0-9]:00:00.000', 1\)/,
							insertTruck: /insert into `trucks` (`created_at`) values ('1969-12-31 [0-24]:00:00.000')/,
							updateTruck: /update `trucks` set `updated_at` = '1969-12-31 [0-9][0-9]:00:00.000' where `id` = 1/,
							updateWheels: /update `wheels` set `created_at` = '1969-12-31 [0-9][0-9]:00:00.000', `truck_id` = 1, `updated_at` = '1969-12-31 [0-9][0-9]:00:00.000' where `id` = 1/
						};

						_libModelJs2["default"].database.mock((_Model$database$mock5 = {}, _defineProperty(_Model$database$mock5, regularExpressions.insertPhotos, [1]), _defineProperty(_Model$database$mock5, regularExpressions.updateUser, []), _defineProperty(_Model$database$mock5, regularExpressions.insertWheels, [1]), _defineProperty(_Model$database$mock5, regularExpressions.insertSteeringWheel, [1]), _defineProperty(_Model$database$mock5, regularExpressions.insertTruck, [1]), _defineProperty(_Model$database$mock5, regularExpressions.updateTruck, [1]), _defineProperty(_Model$database$mock5, regularExpressions.updateWheels, [1]), _Model$database$mock5));
					});

					describe("(association operations)", function () {
						var wheelSaveSpy = undefined,
						    steeringWheelSaveSpy = undefined,
						    truck = undefined,
						    owner = undefined,
						    wheel = undefined,
						    steeringWheel = undefined,
						    driverSeat = undefined,
						    passengerSeat = undefined;

						var TruckOwner = (function (_Model20) {
							function TruckOwner() {
								_classCallCheck(this, TruckOwner);

								_get(Object.getPrototypeOf(TruckOwner.prototype), "constructor", this).apply(this, arguments);
							}

							_inherits(TruckOwner, _Model20);

							_createClass(TruckOwner, [{
								key: "associate",
								value: function associate() {
									this.belongsTo("truck");
									this.belongsTo("owner");
								}
							}]);

							return TruckOwner;
						})(_libModelJs2["default"]);

						var Truck = (function (_Model21) {
							function Truck() {
								_classCallCheck(this, Truck);

								_get(Object.getPrototypeOf(Truck.prototype), "constructor", this).apply(this, arguments);
							}

							_inherits(Truck, _Model21);

							_createClass(Truck, [{
								key: "associate",
								value: function associate() {
									this.hasMany("truckOwners");
									this.hasMany("owners", Owner).through("truckOwners");
									this.hasMany("wheels", Wheel);
									this.hasOne("steeringWheel", SteeringWheel);
								}
							}]);

							return Truck;
						})(_libModelJs2["default"]);

						var Owner = (function (_Model22) {
							function Owner() {
								_classCallCheck(this, Owner);

								_get(Object.getPrototypeOf(Owner.prototype), "constructor", this).apply(this, arguments);
							}

							_inherits(Owner, _Model22);

							_createClass(Owner, [{
								key: "associate",
								value: function associate() {
									this.hasMany("truckOwners", TruckOwner);
									this.hasMany("trucks", Truck).through("truckOwners");
								}
							}]);

							return Owner;
						})(_libModelJs2["default"]);

						var Wheel = (function (_Model23) {
							function Wheel() {
								_classCallCheck(this, Wheel);

								_get(Object.getPrototypeOf(Wheel.prototype), "constructor", this).apply(this, arguments);
							}

							_inherits(Wheel, _Model23);

							_createClass(Wheel, [{
								key: "associate",
								value: function associate() {
									this.belongsTo("truck", Truck);
								}
							}, {
								key: "save",
								value: function save(callback) {
									wheelSaveSpy(callback);
									_get(Object.getPrototypeOf(Wheel.prototype), "save", this).call(this, callback);
								}
							}]);

							return Wheel;
						})(_libModelJs2["default"]);

						var SteeringWheel = (function (_Model24) {
							function SteeringWheel() {
								_classCallCheck(this, SteeringWheel);

								_get(Object.getPrototypeOf(SteeringWheel.prototype), "constructor", this).apply(this, arguments);
							}

							_inherits(SteeringWheel, _Model24);

							_createClass(SteeringWheel, [{
								key: "associate",
								value: function associate() {
									this.belongsTo("truck", Truck);
								}
							}, {
								key: "save",
								value: function save(callback) {
									steeringWheelSaveSpy(callback);
									_get(Object.getPrototypeOf(SteeringWheel.prototype), "save", this).call(this, callback);
								}
							}]);

							return SteeringWheel;
						})(_libModelJs2["default"]);

						var Seat = (function (_Model25) {
							function Seat() {
								_classCallCheck(this, Seat);

								_get(Object.getPrototypeOf(Seat.prototype), "constructor", this).apply(this, arguments);
							}

							_inherits(Seat, _Model25);

							_createClass(Seat, [{
								key: "associate",
								value: function associate() {
									this.belongsTo("truck", Truck);
								}
							}]);

							return Seat;
						})(_libModelJs2["default"]);

						describe("(assignment)", function () {

							beforeEach(function () {
								wheelSaveSpy = sinon.spy();
								steeringWheelSaveSpy = sinon.spy();

								truck = new Truck();
								owner = new Owner();
								wheel = new Wheel();
								steeringWheel = new SteeringWheel();

								driverSeat = new Seat();
								passengerSeat = new Seat();
							});

							it("should throw when assign a non model object to a belongsTo association", function () {
								(function () {
									steeringWheel.truck = {};
								}).should["throw"]("Cannot set a non model entity onto this property. It should inherit from Model");
							});

							it("should throw when assign a non model object to a hasOne association", function () {
								(function () {
									truck.steeringWheel = {};
								}).should["throw"]("Cannot set a non model entity onto this property. It should inherit from Model");
							});

							it("should associate a hasOne from a belongsTo", function () {
								steeringWheel.truck = truck;
								truck.should.have.property("steeringWheel");
							});

							// TODO: This is impossible as is
							xit("should associate a hasMany from a belongsTo", function () {
								wheel.truck = truck;
								truck.wheels.length.should.equal(1);
							});

							it("should associate a belongsTo from a hasMany", function () {
								truck.wheels.push(wheel);
								wheel.truck.should.eql(truck);
							});

							it("should associate a hasMany from a hasMany", function () {
								truck.owners.push(owner);
								owner.trucks[0].should.eql(truck);
							});

							it("should associate a belongsTo from a hasOne", function () {
								truck.steeringWheel = steeringWheel;
								steeringWheel.truck.should.eql(truck);
							});
						});

						describe("(propagation)", function () {
							beforeEach(function () {
								wheelSaveSpy = sinon.spy();
								steeringWheelSaveSpy = sinon.spy();

								truck = new Truck({ id: 1 });
								wheel = new Wheel();
								steeringWheel = new SteeringWheel();

								truck.steeringWheel = steeringWheel;

								//TODO: wrap push on typed collection?
								wheel.truck = truck;
								truck.wheels.push(wheel);
							});

							it("should propagate .save() to hasOne associations", function (done) {
								truck.save(function (error) {
									steeringWheelSaveSpy.calledOnce.should.be["true"];
									done();
								});
							});

							it("should propagate .save() to hasMany associations", function (done) {
								truck.save(function (error) {
									wheelSaveSpy.called.should.be["true"];
									done();
								});
							});
						});
					});
				});

				describe("(database updating)", function () {
					describe("(model not new)", function () {
						beforeEach(function () {
							model.id = 1;

							_libModelJs2["default"].database.update = sinon.spy(_libModelJs2["default"].database.update);

							var regularExpressions = {
								updateModel: /update `models` set `updated_at` = '1969-12-31 [0-9][0-9]:00:00.000' where `id` = 1/
							};

							_libModelJs2["default"].database.mock(_defineProperty({}, regularExpressions.updateModel, [{}]));
						});
						it("should update the record the database", function () {
							model.save(function (error) {
								_libModelJs2["default"].database.update.called.should.be["true"];
							});
						});
					});

					describe("(model not new)", function () {
						beforeEach(function () {
							_libModelJs2["default"].database.insert = sinon.spy(_libModelJs2["default"].database.insert);

							var regularExpressions = {
								insertModel: /insert into `models` \(`created_at`\) values \('1969-12-31 [0-9][0-9]:00:00.000'\)/
							};

							_libModelJs2["default"].database.mock(_defineProperty({}, regularExpressions.insertModel, [{}]));
						});
						it("should update the record the database", function () {
							model.save(function (error) {
								_libModelJs2["default"].database.insert.called.should.be["true"];
							});
						});
					});
				});

				describe("(when model is invalid)", function () {
					beforeEach(function () {
						_libModelJs2["default"].database.mock({
							"select count(*) as `rowCount` from `photos` where `user_id` = 1": [{ rowCount: 0 }]
						});
					});

					it("should call back with an error", function () {
						user.save(function (error) {
							error.should.be.instanceOf(Error);
						});
					});

					it("should inform the user that the model is invalid", function () {
						user.save(function (error) {
							error.message.should.eql("photos must be present on User");
						});
					});
				});
			});

			describe("(without Model.database set)", function () {
				beforeEach(function () {
					delete _libModelJs2["default"].database;
				});

				it("should call back with an error", function () {
					(function () {
						user.save();
					}).should["throw"]("Cannot save without Model.database set.");
				});
			});
		});
	});

	describe("(exporting)", function () {
		describe(".toJSON()", function () {
			it("should return a plain unformatted model", function () {
				user.toJSON().should.eql(userAttributes);
			});

			it("should return a formatted model if a formatter is set on Model.jsonFormatter", function () {
				var newUserAttributes = { someCustomAttribute: "someCustomAttributeValue" };
				_libModelJs2["default"].jsonFormatter = function () {
					return newUserAttributes;
				};
				user.toJSON().should.eql(newUserAttributes);
			});
		});
	});
});