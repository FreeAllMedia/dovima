import sinon from "sinon";
import Model from "../../../";

describe(".delete(callback)", () => {
  class User extends Model {
    static useSoftDelete() {}
  }

  let user;

  beforeEach(() => {
    user = User.mock.instance({id: 1});
  });

  it("should call .beforeDelete, then .softDestroy", done => {
    user.constructor.prototype.beforeDelete = sinon.spy(user.beforeDelete);
    user.constructor.prototype.softDestroy = sinon.spy(user.softDestroy);

    user.softDelete(() => {
      user.beforeDelete.calledBefore(user.softDestroy).should.be.true;
      done();
    });
  });

  it("should call .softDestroy, then .afterDelete", done => {
    user.constructor.prototype.afterDelete = sinon.spy(user.afterDelete);
    user.constructor.prototype.softDestroy = sinon.spy(user.softDestroy);

    user.softDelete(() => {
      user.softDestroy.calledBefore(user.afterDelete).should.be.true;
      done();
    });
  });
});
