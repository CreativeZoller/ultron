describe('JavaScript addition operator', function () {
  it('adds two numbers together', function () {
    expect(1 + 2).toEqual(3);
  });
});
describe('JavaScript variable', function () {
  it('is not defined', function () {
    var name;
    expect(name).toBeUndefined();
  });
});

describe('testFunctionOne', function () {
  it('should return a * b', function () {
    expect(testFunctionOne(2,4)).toEqual(8);
  });
});
describe("sqrt", function() {
  it("should compute the square root of 4 as 2", function() {
    expect(My.sqrt(4)).toEqual(2);
  });
});
