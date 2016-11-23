

var geonet = "https://crossorigin.me/http://api.geonet.org.nz/quake?MMI=1"
// var geonet = "http://api.geonet.org.nz/quake?MMI=1"
var trythis



$(document).ready(function(){
	L.mapbox.accessToken = "pk.eyJ1IjoicGV0dHljcmltZSIsImEiOiJjaXZpbnU0bW0wMWV3MnVsdmZjY2cwY2h1In0.32CdrS6KcH8nGgBvPUJlOg";


	var map = L.mapbox.map('map', 'mapbox.streets')
				.setView([-40.9, 174.8860], 6);

$.getJSON("/quakes.json", function(json){
	console.log(json)
	makeCircles(json)
})


// function getData(useData){
// 	$.ajax({
//         url: geonet,
//         type: "GET",
//         dataType: "jsonp",
//         headers : {'Accept' : 'application/vnd.geo+json;version=2'},
//         success: function(response){
//         	trythis = response
//         	useData(trythis)
//         },
//         error: function(err){
//         	console.log(err)
//         }
//     })
// }

derp = [1,2,4,5]


function makeCircles(data){
		data.features.forEach(function(d) {
	    d.LatLng = new L.LatLng(d.geometry.coordinates[1], d.geometry.coordinates[0]);
	    map.addLayer(L.circle([d.geometry.coordinates[1], d.geometry.coordinates[0]], 500));
	});
		// useD3(data)
}


// function useD3(data){

// 	console.log(data.features)

// 	var svg = d3.select(map.getPanes().overlayPane).append("svg")
// 	    .attr("class", "leaflet-zoom-animated")
// 	    .attr("width", window.innerWidth)
// 	    .attr("height", window.innerHeight);

// 	var g = svg.append("g").attr("class", "leaflet-zoom-hide");

// 	var circles = g.selectAll("circle")
// 		.data(data.features)
// 		.enter()
// 		.append("circle")
// 		.style("fill", "red")
// 		.attr("r", function(d, i){
// 			return d.properties.magnitude * 5
// 		})
// 		.attr("cx", function(d, i){
// 			return i *10
// 		})
// 		.attr("cy", "30");
// }








// getData(makeCircles)


}) // end of document.ready