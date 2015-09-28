import Model from "../../../";
import sinon from "sinon";

describe(".mock.instance(mockedRecord)", () => {

  let user,
      mockedRecord;

  class User extends Model {}

  beforeEach(() => {
    mockedRecord = {id: 1, name: "Bob"};
    user = User.mock.instance(mockedRecord);
  });

  it("should mock .save", done => {
    user.save((error, newId) => {
      newId.should.eql(mockedRecord.id);
      done();
    });
  });

  it("should set .createdAt when record is new", done => {
    user.id = undefined;
    user.save((error) => {
      if (error) { throw error; }
      (undefined === user.createdAt).should.not.be.true;
      done();
    });
  });

  it("should set .updatedAt when record is not new", done => {
    user.save((error) => {
      if (error) { throw error; }
      (undefined === user.updatedAt).should.not.be.true;
      done();
    });
  });

  it("should set .updatedAt when record is not new", done => {
    user.id = 1;
    user.save((error) => {
      if (error) { throw error; }
      (undefined === user.updatedAt).should.not.be.true;
      done();
    });
  });

  it("should still call .beforeSave", () => {
    user.constructor.prototype.afterSave = sinon.spy();

    user.save(() => {
      user.beforeSave.called.should.be.true;
    });
  });

  it("should still call .afterSave", () => {
    user.constructor.prototype.afterSave = sinon.spy();

    user.save(() => {
      user.afterSave.called.should.be.true;
    });
  });

  it("should mock .fetch", done => {
    user.fetch(() => {
      user.attributes.should.eql(mockedRecord);
      done();
    });
  });

  it("should mock .delete", done => {
    user.delete(done);
  });
});
