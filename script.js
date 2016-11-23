// Fix pointer - make it something better
// style scale axes
// 
// http://alignedleft.com/tutorials/d3/axes
// style popups
// make sgv responsive
// toggle linear/logarithmic scale
// 

$(document).ready(function(){

mapboxgl.accessToken = "pk.eyJ1IjoicGV0dHljcmltZSIsImEiOiJjaXZpbnU0bW0wMWV3MnVsdmZjY2cwY2h1In0.32CdrS6KcH8nGgBvPUJlOg";




var margin = {top: 20, right: 20, bottom: 70, left: 40},
    width = ($("#chart").width()) * 0.95;
    height = ($("#chart").height()) * 0.8;




var barChart = d3.select("#chart")
    .append("svg")
        .attr("width", width + margin.left+ margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("id", "chartsvg")
        .style("padding-top", "40px")
        .style("padding-left", "20px")
        .style("padding-right", "40px;");



var barHeightVariable = 2

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

var now = Date.now()


var colours = {orange: "#FAA61A",
				green: "#39B449",
				red: "#EB2526"}
	


// function doStuff(){

d3.json("http://localhost:5000/api/geonet", function(data){
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
			.domain([0, d3.max(data.features, function(d){ console.log(d.properties.depth)
			 return d.properties.depth })])
			.range([0, height])



var xAxis = d3.svg.axis()
			.scale(xScale)
			.orient("top")
			.ticks(6);

var yAxis = d3.svg.axis()
			.scale(yScale)
			.orient("left");


var colourscale = d3.scaleLinear()
    	.domain([2, d3.max(data.features, function(d){ 
			 return d.properties.magnitude })])
    	.range(["#fde3b4", colours.orange]);


var opacityScale = d3.scaleLinear()
    	.domain([1, d3.max(data.features, function(d){ 
			 return d.properties.magnitude })])
    	.range([0.3, 1.2]);





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
	.attr("width", 1)
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
		// return (d.properties.magnitude/10 + 0.4)
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



   barChart.append("g")
    .attr("class", "axis")
   	.call(xAxis);


   	barChart.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + 5 + ",0)")
    .call(yAxis);



   	function popItUp(d){
   	popup.setLngLat(d.geometry.coordinates)
    .setHTML('<h1>' + d.properties.locality + '</h1><P>' + d.properties.date + '</P><h2> MAGNITUDE: ' + d.properties.magnitude + '</h2>')
    .addTo(map);
  	 }

   	function handleMouseOff(){
		popup.remove();
	};



	}) // json request
// }

// setInterval(doStuff, 100000);

});// document ready


// add a new field to the object - timeAgo; record difference between now and the time of the quake, use this for the scale, label it 'minutes ago'

