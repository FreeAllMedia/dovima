import Model from "../../../";

describe(".chain", () => {

  class User extends Model {}

  it("should return the full chain of a simple query", () => {
    User.find.chain.should.eql([{
      name: ".find",
      options: undefined
    }]);
  });

  it("should return the full chain of query with arguments", () => {
    User.find.where("id", 1).chain.should.eql([
      {
        name: ".find",
        options: undefined
      },
      {
        name: ".where",
        options: ["id", 1]
      }
    ]);
  });
});
