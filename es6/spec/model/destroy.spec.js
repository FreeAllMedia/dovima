// import sinon from "sinon";
// import Database from "almaden";
// import Model from "../../../";
// import databaseConfig from "../databaseConfig.json";
//
// describe("Model(attributes, options)", () => {
//   beforeEach(() => {
//     Model.database = new Database(databaseConfig);
//
//     Model.database.mock({});
//   });
//
//   describe(".delete(callback)", () => {
//     describe("(when dependent is declared on the association)", () => {
//       class Account extends Model {
//         initialize() {
//           this.softDelete;
//         }
//
//         associate() {
//           this.hasOne("forumUser", ForumUser)
//             .dependent;
//         }
//       }
//
//       class ForumUser extends Model {
//         initialize() {
//           this.softDelete;
//         }
//
//         associate() {
//           this.hasMany("posts", Post)
//             .dependent;
//           this.belongsTo("account", Account)
//             .dependent;
//         }
//       }
//
//       class Post extends Model {
//         initialize() {
//           this.softDelete;
//         }
//
//         associate() {
//           this.belongsTo("forumUser", ForumUser);
//         }
//       }
//
//       let forumUser,
//         account,
//         post;
//
//       beforeEach(() => {
//         account = new Account({id: 1});
//         forumUser = new ForumUser({id: 2});
//         post = new Post({id: 3});
//       });
//
//       it("should add the dependent flag to the association", () => {
//         account.associations.forumUser.should.eql({
//           parent: account,
//           type: "hasOne",
//           constructor: ForumUser,
//           foreignName: "account",
//           foreignId: "accountId",
//           foreignKey: "account_id",
//           dependent: true
//         });
//       });
//
//       describe("(on a hasOne)", () => {
//         let userDeleteQuerySpy;
//
//         beforeEach(() => {
//           Model.database.mock({
//             [/update `accounts` set `deleted_at` = '.*' where `id` = 1/]:
//               1
//           });
//
//           userDeleteQuerySpy = Model.database.spy(
//             /update `forum_users` set `deleted_at` = '.*' where `id` = 2/,
//             1
//           );
//
//           account.forumUser = forumUser;
//         });
//
//         it("should propagate delete on those models", done => {
//           account.delete(() => {
//             userDeleteQuerySpy.callCount.should.equal(1);
//             done();
//           });
//         });
//       });
//
//       describe("(on a hasMany)", () => {
//         let postDeleteQuerySpy;
//
//         beforeEach(() => {
//           Model.database.mock({
//             [/update `forum_users` set `deleted_at` = '.*' where `id` = 2/]:
//               1
//           });
//
//           postDeleteQuerySpy = Model.database.spy(
//             /update `posts` set `deleted_at` = '.*' where `id` = 3/,
//             1);
//
//           forumUser.posts.push(post);
//         });
//
//         it("should propagate delete on those models", done => {
//           forumUser.delete(() => {
//             postDeleteQuerySpy.callCount.should.equal(1);
//             done();
//           });
//         });
//       });
//     });
//
//     describe("(when .softDelete is not called)", () => {
//       class Post extends Model {}
//       let post;
//
//       beforeEach(() => {
//         post = new Post();
//       });
//
//       it("should return an error", done => {
//         post.delete((error) => {
//           error.message.should.eql("Not implemented.");
//           done();
//         });
//       });
//     });
//
//     describe("when softDelete called)", () => {
//       let post;
//
//       class Post extends Model {
//         initialize() {
//           this.softDelete;
//         }
//       }
//
//       beforeEach(() => {
//         post = new Post();
//       });
//
//       describe("(Model.database is set)", () => {
//         describe("(when primaryKey is set)", () => {
//           beforeEach(() => {
//             post.id = 1;
//             Model.database.mock({
//               [/update `posts` set `deleted_at` = \'.*\' where `id` = 1/]:
//                 1
//             });
//           });
//
//           it("should return no error", () => {
//             post.delete((error) => {
//               (error == null).should.be.true;
//             });
//           });
//
//           describe("(when primary key is set but not exists)", () => {
//             beforeEach(() => {
//               post.id = 1;
//               Model.database.mock({
//                 [/update `posts` set `deleted_at` = \'.*\' where `id` = 1/]:
//                   0
//               });
//             });
//
//             it("should return an error", () => {
//               post.delete((error) => {
//                 error.should.eql(new Error("Post with id 1 cannot be soft deleted because it doesn't exists."));
//               });
//             });
//           });
//         });
//
//         describe("(when primaryKey is not set)", () => {
//           it("should throw an error", done => {
//             post.delete((error) => {
//               error.message.should.eql("Cannot delete the Post because the primary key is not set.");
//               done();
//             });
//           });
//         });
//       });
//
//       describe("(Model.database not set)", () => {
//         beforeEach(() => {
//           delete Model.database;
//         });
//
//         it("should throw an error", () => {
//           () => {
//             post.delete();
//           }.should.throw("Cannot delete without Model.database set.");
//         });
//       });
//     });
//   });
// });
