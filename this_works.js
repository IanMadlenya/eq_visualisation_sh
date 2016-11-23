// http://alignedleft.com/tutorials/d3/axes
$(document).ready(function(){

console.log("merp")

var margin = {top: 20, right: 20, bottom: 70, left: 40},
    width = 1000 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;


var barChart = d3.select("body")
    .append("svg")
        .attr("width", width + margin.left+ margin.right)
        .attr("height", height + margin.top + margin.bottom);


var barHeightVariable = 2


// function doStuff(){

d3.json("http://localhost:5000/api/geonet", function(data){
	data.features = data.features.map(function(d){
		d.properties.date = new Date(d.properties.time)
		d.properties.time = d.properties.date.getTime()
		return d;
	})

	console.log(data)

var sorted = data.features.sort(function (a,b){
		return a.properties.time - b.properties.time
	})
var now = Date.now()

var xScale = d3.scale.linear()
			.domain([sorted[0].properties.time, now])
			.range([0, width]);

var xAxis = d3.svg.axis()
			.scale(xScale)
			.orient("bottom");


var yScale = d3.scale.linear()
			.domain([0, d3.max(data.features, function(d){ return d.properties.depth })])
			.range([0, height]);



var mags = [
"##ffd6cc",
"#ffc2b3",
"#ffad99",
"#ff9980",
"#ff471a",
"#ff3300",
"#e62e00"
	]

	barChart.selectAll("rect")
		.data(sorted)
		.enter()
		.append("rect")
		.attr("x", function(d){
			return xScale(d.properties.time);
		})
		.attr("y", 0)
		.attr("width", 3)
		.attr("height", function(d){
			return yScale(d.properties.depth)
		})

	barChart.selectAll("circle")
	.data(sorted)
	.enter()
	.append("circle")
	.attr("cx", function(d, i){
		return xScale(d.properties.time); 
		})
	.attr("cy", function(d){
			return yScale(d.properties.depth)
		})
	.attr("r", function(d){
		console.log(d.properties.magnitude * d.properties.magnitude * d.properties.magnitude)
		return (d.properties.magnitude * d.properties.magnitude * 2) // need to re-think this to make magnitudes
	})
	.attr("fill", function(d){
		console.log(Math.floor(d.properties.magnitude))
		return	mags[Math.floor(d.properties.magnitude)]
	})
	.attr("opacity", "0.8")


   barChart.selectAll("text")
   .data(sorted)
   .enter()
   	.append("text")
	.text(function(d){
		return d.properties.locality
	})
	.attr("x", function(d, i){
		return xScale(d.properties.time); 
		})
	.attr("y", function(d){
			return yScale(d.properties.depth)
		})
	.attr("font-family", "sans-serif")
   .attr("font-size", "5px")
   .attr("fill", "red");


   barChart.append("g")
   	.call(xAxis);
   	// format the axis so that it just shows the time it's counting from. Or don't use an axis? show ticks at 1 hour, 2 hours ago etc? 
   	// put this canvas over a map, when you mouseover a d3 blob, highlight the same blob on map


	}) // json request
// }

// setInterval(doStuff, 100000);

});// document ready


