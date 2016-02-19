"use strict";

(function() {
	var submit = document.querySelector('.btn-default');
	var cityNameField = document.querySelector('.form-control');
	var weatherNowResults = [];
	var weatherForeResults = [];
	
	function addEvent(element, event, callback) {
		var previousEventCallBack = element["on"+event];
		element["on"+event] = function (e) {
			var output = callback(e);
			if (output === false) return false;
			if (typeof previousEventCallBack === 'function') {
				output = previousEventCallBack(e);
				if(output === false) return false;
			}
		}
	}

	var apiKey = '&units=metric&APPID={XXXXXXXXXXXXXXXXXXXXX}';
	var apiBaseUrl = 'http://api.openweathermap.org/data/2.5/';

	addEvent(submit, "click", function () {
		if(cityNameField.value.length === 0 || cityNameField.value === null) {
			alert("Did you forgot something?");
			return false;
		} else {
			var city = cityNameField.value;
			//getWeather(city);
		}
	});

	function fetchWeather(location, callback) {
	    var httpRequest = new XMLHttpRequest();
	    httpRequest.onreadystatechange = function() {
	        if (httpRequest.readyState === 4) {
	            if (httpRequest.status === 200) {
	                var data = JSON.parse(httpRequest.responseText);
	                if (callback) callback(data);
	            }
	        }
	    };
	    httpRequest.open('GET', location);
	    httpRequest.send(); 
	}
	function getWeather(cityName, callback) {
    	var getActual = apiBaseUrl + 'weather?q=' + cityName + apiKey;
    	var getForeca = apiBaseUrl + 'forecast?q=' + cityName + apiKey;
		fetchWeather(getActual, function(data){
		    if(!data) alert('Unfortunately there is some error about your query, please try to change the name');
		    weatherNowResults.push(data.name);
		    weatherNowResults.push(data.weather[0].description);
		    weatherNowResults.push('http://openweathermap.org/img/w/' + data.weather[0].icon + '.png');
		    weatherNowResults.push(data.main.temp);
		    weatherNowResults.push(data.main.temp_min);
		    weatherNowResults.push(data.main.temp_max);
		});

		if(!callback) return true;	// writing out
	}


	fetchWeather('http://api.openweathermap.org/data/2.5/forecast?q=Hamburg&units=metric&APPID=23b871370bd27cba1a9c217d9b882aba', function(data){
		if(!data) alert('Unfortunately there is some error about your query, please try to change the name');
		var day1Arr = [],
			day2Arr = [],
			day3Arr = [],
			day4Arr = [],
			day5Arr = [],
			j;
		function calcAvg(arr) {
			var total = 0;
			for(var i = 0; i < arr.length; i++) {
				total += arr[i];
			}
			var avg = total / arr.length;
			return avg;
		}
		function calcOne(startItem, tempArrName) {	// all calculation for one day, upgrade for dynamic naming
			var day1avgTemp, day1Min = [], day1minTemp, day1Max = [], day1maxTemp, day1tempDesc = [], day1Desc, day1tempIcon = [], day1Icon;
			for (j = startItem; j < startItem + 8; j++) {
				day1Temp.push(data.list[j].main.temp);
			}
			day1avgTemp = calcAvg(day1Temp);
			for (j = startItem; j < startItem + 8; j++) {
				day1min.push(data.list[j].main.temp_min);
			}
			day1minTemp =  Math.min.apply(Math, day1min);
			for (j = startItem; j < startItem + 8; j++) {
				day1max.push(data.list[j].main.temp_max);
			}
			day1maxTemp =  Math.min.apply(Math, day1max);
			for (j = startItem; j < startItem + 8; j++) {
				day1tempDesc.push(data.list[j].weather[0].description);
			}
			var counts = {}, max = 0;
			for (var v in day1tempDesc) {
				counts[day1tempDesc[v]] = (counts[day1tempDesc[v]] || 0) + 1;
				if (counts[day1tempDesc[v]] > max) {
					max = counts[day1tempDesc[v]];
					day1Desc = day1tempDesc[v];	// desc of day
				}
			}
			for (j = startItem; j < startItem + 8; j++) {
				day1tempIcon.push(data.list[j].weather[0].icon);
			}
			var counts = {}, max = 0, resIcon;
			for (var v in day1tempIcon) {
				counts[day1tempIcon[v]] = (counts[day1tempIcon[v]] || 0) + 1;
				if (counts[day1tempIcon[v]] > max) {
					max = counts[day1tempIcon[v]];
					resIcon = 'http://openweathermap.org/img/w/' + day1tempIcon[v] + '.png';	// icon of day
				}
			}
			day1Icon = resIcon;
		};
		//calcOne(0, day1Arr);	// day 1
		//calcOne(8, day1Arr);	// day 2
		//calcOne(16, day1Arr);	// day 3
		//calcOne(24, day1Arr);	// day 4
		//calcOne(32, day1Arr);	// day 5
		//weatherForeResults.push(day1Arr,day2Arr,day3Arr,day4Arr,day5Arr);
	});

})();