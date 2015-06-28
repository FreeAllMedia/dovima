import Dovima from "../lib/dovima.js";

describe("Dovima", () => {
	let component;

	before(() => {
		component = new Dovima();
	});

	it("should say something", () => {
		component.saySomething().should.equal("Something");
	});
});
