import Model from "../../../";

describe(".mockResults(callback)", () => {

  let mockedValue;

  class User extends Model {}

  beforeEach(() => {
    mockedValue = {id: 1, name: "Bob"};
    User.find.one.where("id", 1).mockResults(mockedValue);
  });

  it("should return itself so that chaining is possible", () => {
    const query = User.find;
    query.mockResults().should.eql(query);
  });

  it("should return the mocked value on subsequent calls of the same type", done => {
    User.find.one.where("id", 1).results((error, data) => {
      data.should.eql(mockedValue);
      done();
    });
  });

  // it("should return the mocked value when using regex values", done => {
  //   User.find.one.where("createdAt", /.*/).mockResults(mockedValue);
  //
  //   User.find.one.where("createdAt", "2014-10-08 10:16:34").results((error, data) => {
  //     data.should.eql(mockedValue);
  //     done();
  //   });
  // });

  it("should not matter which order the chain is called in", () => {
    User.find.where("id", 1).one.results((error, data) => {
      data.should.eql(mockedValue);
    });
  });

  it("should not affect calls with different parameters", () => {
    () => {
      User.find.one.where("id", 2).results();
    }.should.throw("Cannot find models without a database set.");
  });

  it("should not affect calls with a different chain", () => {
    () => {
      User.find.all.where("id", 1).results();
    }.should.throw("Cannot find models without a database set.");
  });
});
