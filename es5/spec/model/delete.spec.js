"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _sinon = require("sinon");

var _sinon2 = _interopRequireDefault(_sinon);

var _almaden = require("almaden");

var _almaden2 = _interopRequireDefault(_almaden);

var _ = require("../../../");

var _2 = _interopRequireDefault(_);

var _databaseConfigJson = require("../databaseConfig.json");

var _databaseConfigJson2 = _interopRequireDefault(_databaseConfigJson);

describe("Model(attributes, options)", function () {
  beforeEach(function () {
    _2["default"].database = new _almaden2["default"](_databaseConfigJson2["default"]);

    _2["default"].database.mock({});
  });

  describe(".delete(callback)", function () {
    describe("(when dependent is declared on the association)", function () {
      var Account = (function (_Model) {
        _inherits(Account, _Model);

        function Account() {
          _classCallCheck(this, Account);

          _get(Object.getPrototypeOf(Account.prototype), "constructor", this).apply(this, arguments);
        }

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
      })(_2["default"]);

      var ForumUser = (function (_Model2) {
        _inherits(ForumUser, _Model2);

        function ForumUser() {
          _classCallCheck(this, ForumUser);

          _get(Object.getPrototypeOf(ForumUser.prototype), "constructor", this).apply(this, arguments);
        }

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
      })(_2["default"]);

      var Post = (function (_Model3) {
        _inherits(Post, _Model3);

        function Post() {
          _classCallCheck(this, Post);

          _get(Object.getPrototypeOf(Post.prototype), "constructor", this).apply(this, arguments);
        }

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
      })(_2["default"]);

      var forumUser = undefined,
          account = undefined,
          post = undefined;

      beforeEach(function () {
        account = new Account({ id: 1 });
        forumUser = new ForumUser({ id: 2 });
        post = new Post({ id: 3 });
      });

      it("should add the dependent flag to the association", function () {
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
          _2["default"].database.mock(_defineProperty({}, /update `accounts` set `deleted_at` = '.*' where `id` = 1/, 1));

          userDeleteQuerySpy = _2["default"].database.spy(/update `forum_users` set `deleted_at` = '.*' where `id` = 2/, 1);

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
          _2["default"].database.mock(_defineProperty({}, /update `forum_users` set `deleted_at` = '.*' where `id` = 2/, 1));

          postDeleteQuerySpy = _2["default"].database.spy(/update `posts` set `deleted_at` = '.*' where `id` = 3/, 1);

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
      var Post = (function (_Model4) {
        _inherits(Post, _Model4);

        function Post() {
          _classCallCheck(this, Post);

          _get(Object.getPrototypeOf(Post.prototype), "constructor", this).apply(this, arguments);
        }

        return Post;
      })(_2["default"]);

      var post = undefined;

      beforeEach(function () {
        post = new Post();
      });

      it("should return an error", function (done) {
        post["delete"](function (error) {
          error.message.should.eql("Not implemented.");
          done();
        });
      });
    });

    describe("when softDelete called)", function () {
      var post = undefined;

      var Post = (function (_Model5) {
        _inherits(Post, _Model5);

        function Post() {
          _classCallCheck(this, Post);

          _get(Object.getPrototypeOf(Post.prototype), "constructor", this).apply(this, arguments);
        }

        _createClass(Post, [{
          key: "initialize",
          value: function initialize() {
            this.softDelete;
          }
        }]);

        return Post;
      })(_2["default"]);

      beforeEach(function () {
        post = new Post();
      });

      describe("(Model.database is set)", function () {
        describe("(when primaryKey is set)", function () {
          beforeEach(function () {
            post.id = 1;
            _2["default"].database.mock(_defineProperty({}, /update `posts` set `deleted_at` = \'.*\' where `id` = 1/, 1));
          });

          it("should return no error", function () {
            post["delete"](function (error) {
              (error == null).should.be["true"];
            });
          });

          describe("(when primary key is set but not exists)", function () {
            beforeEach(function () {
              post.id = 1;
              _2["default"].database.mock(_defineProperty({}, /update `posts` set `deleted_at` = \'.*\' where `id` = 1/, 0));
            });

            it("should return an error", function () {
              post["delete"](function (error) {
                error.should.eql(new Error("Post with id 1 cannot be soft deleted because it doesn't exists."));
              });
            });
          });
        });

        describe("(when primaryKey is not set)", function () {
          it("should throw an error", function (done) {
            post["delete"](function (error) {
              error.message.should.eql("Cannot delete the Post because the primary key is not set.");
              done();
            });
          });
        });
      });

      describe("(Model.database not set)", function () {
        beforeEach(function () {
          delete _2["default"].database;
        });

        it("should throw an error", function () {
          (function () {
            post["delete"]();
          }).should["throw"]("Cannot delete without Model.database set.");
        });
      });
    });
  });
});