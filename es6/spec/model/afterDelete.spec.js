// import sinon from "sinon";
// import Database from "almaden";
// import Model from "../../../";
// import databaseConfig from "../databaseConfig.json";
//
// describe("Model(attributes, options)", () => {
//   let user;
//
//   // Example Class
//   class User extends Model {
//     initialize() {
//       this.softDelete;
//     }
//   }
//
//   beforeEach(() => {
//     User.database = new Database(databaseConfig);
//     User.database.mock({
//       [/update `users` set `deleted_at` = '.*' where `id` = 1/]: [{}]
//     });
//
//     user = new User({
//       id: 1,
//       name: "Bob"
//     });
//
//     // Turn afterDelete and delete into a spies
//     user.constructor.prototype.afterDelete = sinon.spy(user.afterDelete);
//     //user.constructor.prototype.delete = sinon.spy(user.delete);
//   });
//
//   describe(".afterDelete(callback)", () => {
//     it("should be called before .delete", done => {
//       user.delete(() => {
//         // TODO: Need to get callOrder to work by breaking out the actual deleting method into a public method that is then called by .delete
//         //sinon.assert.callOrder(user.afterDelete, deleteQuerySpy);
//
//         // For now, we'll just check that it was called at all
//         user.afterDelete.called.should.be.true;
//         done();
//       });
//     });
//   });
// });
