'use strict';
var defaultCases = (function() {
  var sum = 0;
  return {
    add: function() {
      sum = sum + 1;
      return sum;
    },
    reset: function() {
      return sum = 0;
    }
  }
}());
var actOne = defaultCases.add();
var actTwo = defaultCases.add();
var actThree = defaultCases.reset();

function testFunctionOne(a, b) {
  return a * b;
}
var My = {
  sqrt: function (x) {
    if (x < 0) {
      throw new Error('sqrt can\'t work on negative number');
    }
    return Math.exp(Math.log(x) / 2);
  }
};
function runRight() {
  var currentDate = new Date().toLocaleTimeString();
  console.log('I am ready @' + currentDate);
}

var state = document.readyState;
// var appInit = function(state, addListener, cb){
//     if(state === 'interactive' || state === 'complete') {
//       cb();
//     } else {
//       addListener('DOMContentLoaded', cb(), false);
//     }
//  }
//appInit(document.readyState, document.addEventListener, runRight);
if(state === 'interactive' || state === 'complete') {
  runRight();
} else {
  document.addEventListener('DOMContentLoaded', runRight(), false);
}
