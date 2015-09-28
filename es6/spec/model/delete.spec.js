import sinon from "sinon";
import Model from "../../../";

describe(".delete(callback)", () => {

  describe("(when useSoftDelete is set)", () => {
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

      user.delete(() => {
        user.beforeDelete.calledBefore(user.softDestroy).should.be.true;
        done();
      });
    });

    it("should call .softDestroy, then .afterDelete", done => {
      user.constructor.prototype.afterDelete = sinon.spy(user.afterDelete);
      user.constructor.prototype.softDestroy = sinon.spy(user.softDestroy);

      user.delete(() => {
        user.softDestroy.calledBefore(user.afterDelete).should.be.true;
        done();
      });
    });
  });

  describe("(when useSoftDelete is NOT set)", () => {
    class User extends Model {}

    let user;

    beforeEach(() => {
      user = User.mock.instance({id: 1});
    });

    it("should call .beforeDelete, then .destroy", done => {
      user.constructor.prototype.beforeDelete = sinon.spy(user.beforeDelete);
      user.constructor.prototype.destroy = sinon.spy(user.destroy);

      user.delete(() => {
        user.beforeDelete.calledBefore(user.destroy).should.be.true;
        done();
      });
    });

    it("should call .destroy, then .afterDelete", done => {
      user.constructor.prototype.afterDelete = sinon.spy(user.afterDelete);
      user.constructor.prototype.destroy = sinon.spy(user.destroy);

      user.delete(() => {
        user.destroy.calledBefore(user.afterDelete).should.be.true;
        done();
      });
    });
  });
});
