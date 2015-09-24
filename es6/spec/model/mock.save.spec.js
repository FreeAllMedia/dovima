import Model from "../../../";

describe(".mock.save(mockedNewId)", () => {

  let user,
      mockedNewId;

  class User extends Model {}

  beforeEach(() => {
    user = new User();
    mockedNewId = 12;
    user.mock.save(mockedNewId);
  });

  it("should mock save calls and return the mocked id instead", done => {
    user.save((error, newId) => {
      newId.should.eql(mockedNewId);
      done();
    });
  });
});
