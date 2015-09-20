import Model from "../../../";

describe(".equalTo()", () => {

  class User extends Model {}

  it("should return true on simple comparisons", () => {
    const queryA = User.find;
    const queryB = User.find;

    queryA.equalTo(queryB).should.be.true;
  });

  it("should return false on simple comparisons", () => {
    const queryA = User.find;
    const queryB = User.count;

    queryA.equalTo(queryB).should.be.false;
  });

  it("should return true on comparisons with arguments", () => {
    const queryA = User.find.where("id", 1);
    const queryB = User.find.where("id", 1);

    queryA.equalTo(queryB).should.be.true;
  });

  it("should return false on comparisons with arguments", () => {
    const queryA = User.find.where("id", 1);
    const queryB = User.find.where("id", 2);

    queryA.equalTo(queryB).should.be.false;
  });

  it("should not matter which order the chain is called", () => {
    const queryA = User.find.where("id", 1).all;
    const queryB = User.find.all.where("id", 1);

    queryA.equalTo(queryB).should.be.true;
  });

  it("should return true on comparisons with regex arguments", () => {
    const queryA = User.find.where("createdAt", /.*/);
    const queryB = User.find.where("createdAt", "2014-10-08 10:16:34");

    queryA.equalTo(queryB).should.be.true;
  });
});
