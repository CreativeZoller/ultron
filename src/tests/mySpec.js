describe("A suite", function() {
  it("contains spec with an expectation", function() {
    expect(true).toBe(true);
  });
});

describe('JavaScript addition operator', function () {
    it('adds two numbers together', function () {
        expect(1 + 2).toEqual(3);
    });
});
describe('JavaScript variable', function () {
	it("is not defined", function () {
	    var name;
	    expect(name).toBeUndefined();
	});
});
