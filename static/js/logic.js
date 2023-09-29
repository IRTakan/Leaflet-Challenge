// Call earthquake data for the past week and put into a map layergroup
let earthquakes = new L.layerGroup();
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(
    function(response1){
        console.log(response1);
        makeInfoLegend(moment.unix(response1.metadata.generated/1000).format("MM/DD/YYYY"));  // the info legend must be created during this function's execution
        L.geoJson(response1,{
            pointToLayer: function(feature, latlng) {
                return L.circleMarker(latlng, {
                    radius: feature.properties.mag * 6,
                    color: "#000000", // black
                    opacity: 0.3,
                    weight: 1,
                    stroke: true,
                    fillColor: depthColor(feature.geometry.coordinates[2]),
                    fillOpacity: 0.7
                });},
            onEachFeature: function(feature, layer) {
                layer.bindPopup(`Magnitude: <b>${feature.properties.mag}</b><br>
                                 Depth: <b>${feature.geometry.coordinates[2]} km</b><br>
                                 Location: <b>${feature.properties.place}</b><br>
                                 When: <b>${moment.unix(feature.properties.time/1000)}</b>`)
            }
        }).addTo(earthquakes);
});

// Access tectonic plate data and put it into a map layergroup
let tectplates = new L.layerGroup();
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(
    function(response2){
        console.log(response2);
        L.geoJson(response2, {color: "yellow", weight: 3}).addTo(tectplates);
});

// Define base layers that can be selected on the map
var mapStreet = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 18,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
var mapSat = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}', {
	maxZoom: 21,
	attribution: 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>'
});
var mapTopo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	maxZoom: 16,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

// Create object containing the base layers so that they can be selected when user chooses
var baseLayers = {    
    Satellite: mapSat,
    Topographic: mapTopo,
    Street: mapStreet
};

// Define function to set the color of a marker based on earthquake depth
function depthColor(depth) {
    if (depth < 10) return "mediumseagreen";
    if (depth < 30) return "gold";
    if (depth < 50) return "orange";
    if (depth < 70) return "red";
    if (depth < 90) return "firebrick";
    return "darkred";
  };

// Create main map with center, zoom and layers
var mainMap = L.map("map", {
    center: [37.09024, -95.712891], 
    zoom: 5,
    layers: [mapStreet, mapSat, mapTopo]
});

// Create object containing the overlay layers
var overlays = {
    "Tectonic Plates": tectplates,
    "Earthquakes": earthquakes
};

// Set main map with streetMap view as the default. Also display the earthquake markers and tectonic plate lines
mapStreet.addTo(mainMap);
earthquakes.addTo(mainMap);
tectplates.addTo(mainMap);

// Display layer control on the main map
L.control.layers(baseLayers, overlays, {collapsed:false}).addTo(mainMap);

// Create information legend for display on the main map
function makeInfoLegend(date){
    var legend2 = L.control({position: "bottomleft"});
    legend2.onAdd = function() {
        let div2 = L.DomUtil.create("div", "info legend");
        div2.innerHTML = "<b>Magnitude of Earthquake Indicated by Colored Circle</b><br>"
            + "<center> -- Click on a circle for earthquake information. --</center><hr>"
            + "<center>Last Updated on " + date + "</center>";
        return div2;
    };
    legend2.addTo(mainMap);
};

// Create the depth legend for display on main map
var legend1 = L.control({position: "bottomright"});
legend1.onAdd = function() {
    let div1 = L.DomUtil.create("div", "info legend");
    let intervals = [0, 10, 30, 50, 70, 90];
    let labels = ["<center><strong>Depth (km)</strong></center><hr>"];
    for (let i = 0; i < intervals.length; i++){
        labels.push("<i style='background: "
            + depthColor(intervals[i]+1) + "'></i>"
            + intervals[i]
            + (intervals[i+1] ? " to " + intervals[i+1] + "<br>" : "+"));
    };
    div1.innerHTML = labels.join("");
    return div1;
};
legend1.addTo(mainMap);

