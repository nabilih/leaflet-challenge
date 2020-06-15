var queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2014-01-01&endtime=2014-01-02"

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // console.log(data.features);

  createFeatures(data.features);
  });
  
function createFeatures(earthquakeData) {
    
    var circles = [];

    function onEachFeature(feature, layer) {
      layer.bindPopup("<h3>" + feature.properties.place +
       "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    }

    var earthquakes = L.geoJSON(earthquakeData, {
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

    });

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
  };

  //create overlay map
  var overlayMap = {
    Earthquakes: earthquakeData
  }

  // Create a new map
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap, earthquakes]
  });

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

  // Create the legend
  var legend = L.control({
    position: "bottomright"
  });

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

  legend.addTo(myMap);

}







