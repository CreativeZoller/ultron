// .not.toEqual(expectedResult)
// .toBeDefined()
// .toBeUndefined()
// .toBeNull()
// .toBeTruthy()
// .toBeFalsy()
// .toBeLessThan(number)
// .toBeGreaterThan(number)
// .toContains(substring)
// .toBeCloseTo(number, accuracy) –
//   this one rounds up an argument in expect(argument) to the mentioned accuracy and
//   compares it with a number.
// .toMatch(/regexp/)
// .toThrow() –
//   catches exceptions and the test is passed if an exception was thrown. As an argument
//   you can pass an error message you expect.
// local tests
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
describe("in this stacked suite", function() {
  var presentValue,
      previousValue,
      aPercentChanges;
  beforeEach(function() {
    presentValue    = 110;
    previousValue   = 100;
    aPercentChanges = [];
  });
  afterEach(function() {
    presentValue    = 0;
    previousValue   = 0;
    aPercentChanges = [];
  });
  it("calcWeeklyPercentChange() should return the change between two numbers as a percentage.", function() {
    var calcWeeklyPercentChange = function(presentValue, previousValue, aPercentChanges) {
      var percentChange = presentValue / previousValue - 1;
      aPercentChanges.push(percentChange);
      return percentChange;
    };
    var result = calcWeeklyPercentChange(presentValue, previousValue, aPercentChanges);
    expect(result).toBeCloseTo(0.1);
    expect(aPercentChanges.length).toEqual(1);
  });
  it("The aPercentChanges array should now be empty.", function() {
    expect(aPercentChanges.length).toEqual(0);
  });
});

// scripts/main.js tests
describe("multiplication", function () {
  it("should return a * b", function () {
    expect(testFunctionOne(2,4)).toEqual(8);
  });
});
describe("square", function() {
  it("should compute the square root of 4 as 2", function() {
    expect(My.sqrt(4)).toEqual(2);
  });
  it("should throw an exception if given a negative number", function() {
    expect(function(){ My.sqrt(-1); }).
      toThrow(new Error("sqrt can't work on negative number"));
  });
});
describe("runRight functions", function() {
  it("should return a variable with no null value", function() {
    expect(runRight()).not.toBe(null);
  });
});
// modular tests
describe("this module", function() {
  it("should return one", function() {
    expect(actOne).toEqual(1);
  });
  it("should return two", function() {
    expect(actTwo).toEqual(2);
  });
  it("should return zero", function() {
    expect(actThree).toEqual(0);
  });
});
// doc.ready checks
