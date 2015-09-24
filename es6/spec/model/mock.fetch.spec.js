import Model from "../../../";

describe(".mock.fetch(mockedRecord)", () => {

  let user,
      mockedRecord;

  class User extends Model {}

  beforeEach(() => {
    user = new User();
    mockedRecord = {
      id: 12,
      name: "Bob"
    };
    user.mock.fetch(mockedRecord);
  });

  it("should not set attributes until fetch is called", () => {
    user.attributes.should.not.eql(mockedRecord);
  });

  it("should mock fetch calls and set all attributes", done => {
    user.fetch(() => {
      user.attributes.should.eql(mockedRecord);
      done();
    });
  });
});
