


$(document).ready(function(){

	mapboxgl.accessToken = "pk.eyJ1IjoicGV0dHljcmltZSIsImEiOiJjaXZpbnU0bW0wMWV3MnVsdmZjY2cwY2h1In0.32CdrS6KcH8nGgBvPUJlOg";


// variable assignation

var margin = {top: 20, right: 20, bottom: 70, left: 40},
width = ($("#chart").width()) * 0.9;
height = ($("#chart").height()) * 0.8;

var now = Date.now()


var colours = {orange: "#FAA61A",
green: "#39B449",
red: "#EB2526"}

function formatDate(d){
	return d.getDate()  + "-" + (d.getMonth()+1) + "-" + d.getFullYear() + " " +
	d.getHours() + ":" + d.getMinutes();
}




// create map and bar chart

var map = new mapboxgl.Map({
	container: 'map',
	style: 'mapbox://styles/mapbox/dark-v9',
	center: [164.8860, -40.9],
	zoom: 5
});

var popup = new mapboxgl.Popup({
	closeButton: false,
	closeOnClick: false
});


var barChart = d3.select("#chart")
.append("svg")
.attr("width", (width * 0.7))
.attr("height", height)
.attr("id", "chartsvg")
.style("padding-top", "40px")
.style("padding-left", "40px");
// .style("padding-right", "60px");

d3.json("https://fj80rqsif9.execute-api.ap-southeast-2.amazonaws.com/prod?MMI=2", function(data){
	data.features = data.features.map(function(d){
		d.properties.date = new Date(d.properties.time)
		d.properties.time = d.properties.date.getTime()
		d.properties.since = ((now - d.properties.date)/1000)/60
		return d;
	})

	console.log(data)

	var sorted = data.features.sort(function (a,b){
		return a.properties.time - b.properties.time
	})

	;


// set scales and axes

var xScale = d3.scaleTime()
.domain([sorted[0].properties.date, now])
.range([0, width])


var yScale = d3.scaleLinear()
.domain([0, d3.max(data.features, function(d){
	return d.properties.depth })])
.range([0, height])


var xAxis = d3.svg.axis()
.scale(xScale)
.orient("top")
.ticks(6);


var yAxis = d3.svg.axis()
.scale(yScale)
.orient("left");


var axx = barChart.append("g")
.attr("class", "axis")
.call(xAxis);


var axy = barChart.append("g")
.attr("class", "axis")
.style("z-axis", "50")
.call(yAxis);


axy.append("text")
.attr("class", "y label")
.attr("text-anchor", "end")
.attr("y", "20")
.attr("x",function(){
	return -(height*0.75)
})
.attr("transform", "rotate(-90)")
.text("Depth in km")
.style("font-size", "15px");


var colourscale = d3.scaleLinear()
.domain([2, d3.max(data.features, function(d){ 
	return d.properties.magnitude })])
.range(["#fde3b4", colours.orange]);


var opacityScale = d3.scaleLinear()
.domain([1, d3.max(data.features, function(d){ 
	return d.properties.magnitude })])
.range([0.3, 1.2]);



// add map layers

map.addSource('earthquakes', {
	'type': 'geojson',
	'data': data
});



map.addLayer({
	"id" : "circlelayer",
	"type" : "circle",
	"source" : "earthquakes",
	"paint" : {
		"circle-color" : {
			"property" : "class",
			"type" : "categorical",
			"stops": [
			["on", colours.orange],
			["off", colours.red]
			]
		},
		"circle-opacity" : 1,
		"circle-radius" : 4,
		'circle-radius': {
			'base': 10,
			'stops': [[14, 4], [22, 180]]
		}
	}
})


map.addLayer({
	"id": "circlelayer-hover",
	"type": "circle",
	"source": "earthquakes",
	"paint": {
		"circle-color": colours.red,
		"circle-radius" : 10,
		'circle-radius': {
			'base': 10,
			'stops': [[14, 10], [22, 180]]
		}
	},
	"filter": ["==", "publicID", ""]
});



// highlight corresponding chart element on map mouseover

map.on('mousemove', function (e) {
	var features = map.queryRenderedFeatures(e.point, { layers: ['circlelayer'] });
	if (features.length > 0){

		map.setFilter("circlelayer-hover", ["==", "publicID", features[0].properties.publicID])

		d3.select("#id" + features[0].properties.publicID)
		.attr("opacity", "1")
		.attr("fill", colours.red);

	} else {
		map.setFilter("circlelayer-hover", ["==", "publicID", ""])

		barChart.selectAll("circle")
		.attr("fill", function(d){
			return	colourscale(d.properties.magnitude)
		})
		.attr("opacity", function(d){
			return opacityScale(d.properties.magnitude)
		})
	}
});


// create visualisation

barChart.selectAll("rect")
.data(sorted)
.enter()
.append("rect")
.attr("x", function(d){
	return xScale(d.properties.time);
})
.attr("y", 0)
.attr("width", 0.5)
.attr("class", "rectogram")
.attr("height", function(d){
	return yScale(d.properties.depth)
})

barChart.selectAll("circle")
.data(sorted)
.enter()
.append("circle")
.attr("id", function(d,i){ return "id" + d.properties.publicID })
.attr("cx", function(d, i){
	return xScale(d.properties.time); 
})
.attr("cy", function(d){
	return yScale(d.properties.depth)
})
.attr("r", function(d){
		return (d.properties.magnitude * d.properties.magnitude * 2) // need to re-think this to make magnitudes
	})
.attr("fill", function(d){
	return	colourscale(d.properties.magnitude)
})
.attr("opacity", function(d){
	return opacityScale(d.properties.magnitude)
	})
.on("mouseover", function(d){
	popItUp(d);
	d3.select(this).attr("fill", colours.red)
	.attr("opacity", "1")
})
.on("mouseout", function(d){
	handleMouseOff();
	d3.select(this).attr("fill", function(d){
		return	colourscale(d.properties.magnitude)
	})
	.attr("opacity", function(d){
		return opacityScale(d.properties.magnitude)
	})
});





// popup on map

function popItUp(d){	

	popup.setLngLat(d.geometry.coordinates)
	.setHTML('<h1>' + d.properties.locality + '</h1><P>' + 
		formatDate(d.properties.date) + '</P><h2> Magnitude: ' + 
		Math.round(d.properties.magnitude*100)/100 + '</h2>')
	.addTo(map);
}

function handleMouseOff(){
	popup.remove();
};



	}) // json request

});// document ready



