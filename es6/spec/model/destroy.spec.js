// import sinon from "sinon";
// import Database from "almaden";
// import Model from "../../../";
// import databaseConfig from "../databaseConfig.json";
//
// describe("Model(attributes, options)", () => {
//
//   class User extends Model {}
//
//   let user,
//       querySpy;
//
//   beforeEach(() => {
//     User.database = new Database(databaseConfig);
//     user = new User();
//     querySpy = User.database.spy("delete from `users` where id = 1");
//
//     const genericFunction = (callback) => { callback(); };
//     user.constructor.prototype.beforeDelete = sinon.spy(genericFunction);
//     user.constructor.prototype.afterDelete = sinon.spy(genericFunction);
//   });
//
//   describe(".destroy(callback)", () => {
//     it("should call the database to delete the record", () => {
//       user.destroy(() => {
//         querySpy.callCount.should.eql(1);
//       });
//     });
//
//     it("should not call beforeDelete event", () => {
//       user.destroy(() => {
//         user.beforeDelete.called.should.be.false;
//       });
//     });
//
//     it("should not call afterDelete event", () => {
//       user.destroy(() => {
//         user.afterDelete.called.should.be.false;
//       });
//     });
//   });
// });
