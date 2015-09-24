import Model from "../../../";

describe(".mock.delete()", () => {

  let user;

  class User extends Model {}

  beforeEach(() => {
    user = new User();
    user.mock.delete();
  });

  it("should mock delete callback", done => {
    () => {
      user.delete(() => {
        done();
      });
    }.should.not.throw();
  });
});
