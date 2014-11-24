$(document).ready(function (){
	geocoder = new google.maps.Geocoder();
	$("#currentLocation").html("Searching...");
	$("#findLocation").hide();
	$("#change-loc-confirm").hide();
	getLocation();
});

function getLocation() {
	if (navigator && navigator.geolocation) {
		var position = navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
		var apiKey = 'AIzaSyCH9C3pCOTACNNYTgTLStvTXM5Zh72mh4o';
	} else {		
		$("#found").html("Geolocation is not supported by this browser.");
	}
}

function geoSuccess(position) {
	var lat = position.coords.latitude;
	var lng = position.coords.longitude;
	getCity(lat, lng);
	getAllWeather(lat, lng);
}

function geoError(error) {
	if (error.code == error.PERMISSION_DENIED){
		$.get("http://ipinfo.io", function(response) {
			$("#found").html('We found you in');
			$("#currentLocation").html(response.city + ', ' + response.region);
			$("#change-loc").html('Not here?');
			var latLng = response.loc.split(',');
			getAllWeather(latLng[0], latLng[1]);
		}, "jsonp");
	}
}

function getCity(lat, lng) {
	var latlng = new google.maps.LatLng(lat, lng);
	geocoder.geocode({'latLng': latlng}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			if (results[0]) {
				var city = results[0].address_components[3].long_name;
				var state = results[0].address_components[5].long_name;
				$("#found").html('We found you in');
				$("#currentLocation").html(city + ', ' + state);
				$("#change-loc").html('Not here?');
			} else {
				$("#found").html("We couldn't find you");
			}
		} else {
			$("#found").html("We couldn't find you");
		}
	});
}

function changeLocation() {
	$("#found").html("Search for");
	$("#currentLocation").hide();
	$("#change-loc").hide();
	$("#findLocation").show();
	$("#findLocation").geocomplete()
		.bind("geocode:result", function(event, result){
			var lat = result.geometry.location.k;
			var lng = result.geometry.location.B;
			$("#findLocation").hide();
			$("#currentLocation").show();
			$("#currentLocation").text(result.formatted_address);
			$("#change-loc-confirm").hide();
			$("#change-loc").show();
			getAllWeather(lat, lng);
		})
		.bind("geocode:error", function(event, status){
			$("#error-loc").text('No location found');
		})
		.bind("geocode:multiple", function(event, results){
			$("#error-loc").text('Multiple locations found, please narrow your search');
			// console.log("Multiple: " + results.length + " results found");
		});
	$("#change-loc-confirm").click(function(){
		$("#findLocation").trigger("geocode")
		.bind("geocode:error", function(event, status){
			$("#error-loc").text('No location found');
		});
	});
	$("#change-loc-confirm").show();
	$("#error-loc").show();
}

function changeLocationConfirm() {
	$("#findLocation").hide();
	$("#change-loc-confirm").hide();
	$("#currentLocation").text('Searching...');
	$("#currentLocation").show();
	$("#change-loc").show();
	
}

function getAllWeather(lat, lon) {
	getCurrentWeather(lat, lon);
	getForecast(lat, lon);
}

function getCurrentWeather(lat, lon) {
	var currentTemp = $.getJSON('http://api.openweathermap.org/data/2.5/weather?lat=' + lat + '&lon=' + lon, function (data) {
		var tempKtoF = Math.round((data.main.temp - 273.15) * 1.8 + 32.0);
		$('#current-temp').html(tempKtoF + '&deg;');
		$('#current-conditions').text(data.weather[0].main.toLowerCase());
	});
}

function getForecast(lat, lon) {
	var forecastArray = [];
	var today = new Date();
	var newToday = new Date();
	newToday = newToday.setHours(0,0,0,0)/1000;
	var timeSinceMidnight = (today/1000 - newToday)/3600;
	var historyToGet = Math.floor((timeSinceMidnight/3) - 1);
	var forecastToGet = 8 - historyToGet;
	
	var latlng = new google.maps.LatLng(lat, lon);
	var geocoder2 = new google.maps.Geocoder();
	geocoder2.geocode({'latLng': latlng}, function(results, status) {
			if (results[0]) {
				var city = results[0].address_components[3].long_name.replace(' ', '-').toLowerCase();
			} else {
				var city = "";
			}
			var history = $.getJSON('http://api.openweathermap.org/data/2.5/history/city?q=' + city, function(data){
				if (data.list.length != 0) {
					var dataArr = data.list;
					//The last on the list are the most recent
					dataArr.reverse();
					for (var tmp = 0; tmp < historyToGet; tmp++) {
						$("#daily li .daily-temp-t:eq(" + tmp + ")").html(Math.round((dataArr[tmp].main.temp - 273.15) * 1.8 + 32.0) + "&deg;");
						$("#daily li .daily-temp-i:eq(" + tmp + ")").html("<img src='assets/img/" + dataArr[tmp].weather[0].icon + ".png' class='daily-temp-icon'>");
					}
				} else {
					for (var x = 0; x < historyToGet; x++) {
						$("#daily li .daily-temp-t:eq(" + x + ")").text('N/A');
						$("#daily li .daily-temp-i:eq(" + x + ")").text('N/A');
					}
				}
			});
	});
	
	

	var forecast = $.getJSON('http://api.openweathermap.org/data/2.5/forecast?lat=' + lat + '&lon=' + lon, function (data) {
		if (data) {
			var startAtZero = 0;
			for (var tmp2 = historyToGet; tmp2 < 8; tmp2++) {
				$("#daily li .daily-temp-t:eq(" + tmp2 + ")").html(Math.round((data.list[startAtZero].main.temp - 273.15) * 1.8 + 32.0) + "&deg;");
				$("#daily li .daily-temp-i:eq(" + tmp2 + ")").html("<img src='assets/img/" + data.list[startAtZero].weather[0].icon + ".png' class='daily-temp-icon'>");
				startAtZero++;
			}
		}
	});
}

function validatePhoneNumber() {
	var input = $("#sms-input").val();
	var phoneNumberPattern = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/;
	console.log(phoneNumberPattern.test(input));
	if (phoneNumberPattern.test(input) !== true){
		$("#sms-error").show();
		$("#sms-error").text('Please enter a ten digit phone number');
	} else {
		$("#sms-error").hide();
	}
}
