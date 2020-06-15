var queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2014-01-01&endtime=2014-01-02"

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // console.log(data.features);
  createFeatures(data.features);
});

// Create layer groups for the 2 data sets, earthquakes and tectonic plates.
var faultLines = new L.LayerGroup();
var earthquakes = new L.LayerGroup();

// create features and maps
function createFeatures(earthquakeData) {
    
    function onEachFeature(feature, layer) {
      layer.bindPopup("<h3>" + feature.properties.place +
       "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    }

    // Read GeoJSON data, create circle markers, and add to earthquake layer group
    L.geoJSON(earthquakeData, {
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
          radius: feature.properties.mag * 5,
          fillColor: chooseColour(feature.properties.mag),
          color: "black",
          weight: 0.5,
          opacity: 0.5,
          fillOpacity: 0.8
        });
      },
      onEachFeature: onEachFeature
    }).addTo(earthquakes);

  // Define street map layer
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

  // Define satellite map layer
  var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors,\
     <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  // Define outdoors map layer
  var outdoorsmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors,\
     <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox/outdoors",
    accessToken: API_KEY
  });

  // define greyscale map layer
  var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors,\
      <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  // Define the baseMaps for the map types we created above
  var baseMaps = {
    "Street Map": streetmap,
    "Satellite Map": satellitemap,
    "Outdoors Map": outdoorsmap,
    "Greyscale Map": lightmap
  };

  // Read the tectonic Plate GeoJSON from the source URL, and add to faultLines layer group
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json",
  function(platedata) {
    L.geoJson(platedata, {
      color: "orange",
      weight: 2
    }).addTo(faultLines);
  });

  // Create a new map
  var myMap = L.map("map", {
    center: [
      48.10, -100.10
    ],
    zoom: 3,
    layers: [streetmap, earthquakes, faultLines]
  });

  // create overlay map with the 2 data layers
  var overlayMaps = {
    "Earthquakes": earthquakes,
    "Fault Lines": faultLines,
  };

  // Add a layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);

  // function to set the earthquake circle size based on value of mag (magnitude)
  function chooseColour(mag) {
    if (mag > 5) {
      return "red";
    }
    else if (mag > 4){
      return "orangered";
    }
    else if (mag > 3){
      return "orange";
    }
    else if (mag > 2){
      return "gold";
    }
    else if (mag > 1){
      return "yellow"
    }
    else {
      return "greenyellow";
    }
  }

  // Create the legend control and set its position
  var legend = L.control({
    position: "bottomright"
  });

  // function to assign values to the legend, as well as color boxes (see style.css file)
  legend.onAdd = function (myMap) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 2, 3, 4, 5],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + chooseColour(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
  };
  // add the legend to the map
  legend.addTo(myMap);

}







