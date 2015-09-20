import Model from "../../../";

describe(".toString()", () => {

  class User extends Model {}

  describe(`User.find.one.where("id", 1)`, () => {
    it("should return a string representation of the chain", () => {
      User.find.one.where("id", 1).toString().should.eql(`User.find.one.where("id", 1)`);
    });
    it("should not matter which order the chain is called in", () => {
      User.find.where("id", 1).one.toString().should.eql(`User.find.one.where("id", 1)`);
    });
  });

  describe(`User.find.all.where("id", 1)`, () => {
    it("should return a string representation of the chain", () => {
      User.find.all.where("id", 1).toString().should.eql(`User.find.all.where("id", 1)`);
    });
  });

  describe(`User.find.where("id", "<", 10).andWhere("id", ">", 1)`, () => {
    it("should return a string representation of the chain", () => {
      User
        .find
        .where("id", "<", 10)
        .andWhere("id", ">", 1)
        .toString()
          .should.eql(`User.find.where("id", "<", 10).andWhere("id", ">", 1)`);
    });
  });

  describe(`User.find.where("id", "<", 10).orWhere("id", ">", 1)`, () => {
    it("should return a string representation of the chain", () => {
      User
        .find
        .where("id", "<", 10)
        .orWhere("id", ">", 1)
        .toString()
          .should.eql(`User.find.where("id", "<", 10).orWhere("id", ">", 1)`);
    });
  });

  describe(`User.find.where("id", "<", 10).groupBy("categoryId")`, () => {
    it("should return a string representation of the chain", () => {
      User
        .find
        .where("id", "<", 10)
        .groupBy("categoryId")
        .toString()
          .should.eql(`User.find.where("id", "<", 10).groupBy("categoryId")`);
    });
  });

  describe(`User.find.where("id", "<", 10).orderBy("categoryId")`, () => {
    it("should return a string representation of the chain", () => {
      User
        .find
        .where("id", "<", 10)
        .orderBy("categoryId", "desc")
        .toString()
          .should.eql(`User.find.where("id", "<", 10).orderBy("categoryId", "desc")`);
    });
  });

  describe(`User.find.where("id", ">", 2).limit(4)`, () => {
    it("should return a string representation of the chain", () => {
      User
        .find
        .where("id", ">", 2)
        .limit(4)
        .toString()
          .should.eql(`User.find.where("id", ">", 2).limit(4)`);
    });
  });

  describe(`User.count.where("id", 1)`, () => {
    it("should return a string representation of the chain", () => {
      User.count.where("id", 1).toString().should.eql(`User.count.where("id", 1)`);
    });
  });
});
