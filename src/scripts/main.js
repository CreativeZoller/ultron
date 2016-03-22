'use strict';

  function testFunctionOne(a, b) {
    return a * b;
  }

  var My = {
  sqrt: function(x) {
    if (x < 0) throw new Error("sqrt can't work on negative number");
      return Math.exp(Math.log(x)/2);
    }
  };


  function runRight() {
    var currentDate = new Date().toLocaleTimeString();
    console.info('I am ready @' + currentDate);
  }

  if (document.readyState!='loading') {
    runRight()
  } else if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', runRight)
  } else document.attachEvent('onreadystatechange', function() {
    if (document.readyState=='complete') runRight();
  })
