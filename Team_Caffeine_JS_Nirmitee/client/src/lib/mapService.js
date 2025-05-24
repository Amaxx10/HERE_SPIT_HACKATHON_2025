// /**
//  * Map Service utility for HERE Maps integration
//  */

// // Initialize the HERE platform
// export const initializeHereMap = (apiKey) => {
//   const platform = new H.service.Platform({
//     apikey: apiKey
//   });
  
//   // Get default layers
//   const defaultLayers = platform.createDefaultLayers();
  
//   return { platform, defaultLayers };
// };

// // Add GeoJSON data to the map
// export const addGeoJsonToMap = (map, geojsonData) => {
//   if (!geojsonData || !geojsonData.features) {
//     console.error("Invalid GeoJSON data");
//     return;
//   }
  
//   // Create a group that will hold map objects
//   const group = new H.map.Group();
  
//   // Process each feature in the data
//   geojsonData.features.forEach(feature => {
//     let mapObject;
    
//     switch (feature.geometry.type) {
//       case 'Point':
//         // Create a marker for point features (POIs)
//         const [lng, lat] = feature.geometry.coordinates;
//         mapObject = new H.map.Marker(
//           { lat, lng },
//           { data: feature.properties } // Store properties for later use
//         );
//         break;
        
//       case 'LineString':
//         // Create polyline for road segments
//         const linePoints = feature.geometry.coordinates.map(([lng, lat]) => ({ lat, lng }));
//         const lineString = new H.geo.LineString();
//         linePoints.forEach(point => lineString.pushPoint(point));
        
//         mapObject = new H.map.Polyline(
//           lineString,
//           { 
//             style: { 
//               lineWidth: 4,
//               strokeColor: feature.properties.verified ? '#0077CC' : '#CC0000'
//             },
//             data: feature.properties
//           }
//         );
//         break;
        
//       case 'Polygon':
//         // Create polygon for buildings or areas
//         const polygonPoints = feature.geometry.coordinates[0].map(([lng, lat]) => ({ lat, lng }));
//         const polygonLineString = new H.geo.LineString();
//         polygonPoints.forEach(point => polygonLineString.pushPoint(point));
        
//         mapObject = new H.map.Polygon(
//           new H.geo.Polygon([polygonLineString]),
//           { 
//             style: { 
//               fillColor: 'rgba(0, 85, 170, 0.4)',
//               strokeColor: '#0055AA',
//               lineWidth: 2
//             },
//             data: feature.properties
//           }
//         );
//         break;
//     }
    
//     if (mapObject) {
//       // Add click event for info display
//       mapObject.addEventListener('tap', (evt) => {
//         const properties = evt.target.getData();
//         const bubble = new H.ui.InfoBubble(evt.target.getGeometry(), {
//           content: createInfoBubbleContent(properties)
//         });
        
//         // Get UI instance and add the bubble
//         map.getUI().addBubble(bubble);
//       });
      
//       group.addObject(mapObject);
//     }
//   });
  
//   // Add the group to the map
//   map.addObject(group);
  
//   // Adjust viewport to ensure all data is visible
//   map.getViewModel().setLookAtData({
//     bounds: group.getBoundingBox()
//   });
// };

// // Helper function to create info bubble content
// const createInfoBubbleContent = (properties) => {
//   return `<div class="info-bubble">
//     <h3>${properties.name || 'Unnamed Feature'}</h3>
//     <p>Type: ${properties.category || 'N/A'}</p>
//     <p>Verified: ${properties.verified ? 'Yes' : 'No'}</p>
//     ${properties.description ? `<p>${properties.description}</p>` : ''}
//   </div>`;
// };

// // Apply custom style to the map
// export const applyCustomMapStyle = (map, platform, style) => {
//   const provider = new H.service.vectortile.Provider(
//     platform.getVectorTileService(), 
//     style
//   );
  
//   const layer = new H.map.layer.TileLayer(provider);
//   map.addLayer(layer);
// };

// // Sample GeoJSON data structure
// export const getSampleGeoJson = () => {
//   return {
//     "type": "FeatureCollection",
//     "features": [
//       {
//         "type": "Feature",
//         "geometry": {
//           "type": "Point",
//           "coordinates": [72.8777, 19.0760]
//         },
//         "properties": {
//           "name": "New Coffee Shop",
//           "category": "restaurant",
//           "verified": true
//         }
//       },
//       {
//         "type": "Feature",
//         "geometry": {
//           "type": "LineString",
//           "coordinates": [
//             [72.8677, 19.0760],
//             [72.8777, 19.0660],
//             [72.8877, 19.0560]
//           ]
//         },
//         "properties": {
//           "name": "New Road",
//           "category": "primary",
//           "verified": true
//         }
//       },
//       {
//         "type": "Feature",
//         "geometry": {
//           "type": "Polygon",
//           "coordinates": [[
//             [72.8700, 19.0800],
//             [72.8750, 19.0800],
//             [72.8750, 19.0850],
//             [72.8700, 19.0850],
//             [72.8700, 19.0800]
//           ]]
//         },
//         "properties": {
//           "name": "New Building",
//           "category": "commercial",
//           "verified": false
//         }
//       }
//     ]
//   };
// };
/**
 * Map Service utility for HERE Maps integration
 */

// Initialize the HERE platform
export const initializeHereMap = (apiKey) => {
  const platform = new H.service.Platform({
    apikey: apiKey
  });
  
  // Get default layers
  const defaultLayers = platform.createDefaultLayers();
  
  return { platform, defaultLayers };
};

// Add GeoJSON data to the map
export const addGeoJsonToMap = (map, geojsonData) => {
  if (!geojsonData || !geojsonData.features) {
    console.error("Invalid GeoJSON data");
    return;
  }
  
  // Create a group that will hold map objects
  const group = new H.map.Group();
  
  // Process each feature in the data
  geojsonData.features.forEach(feature => {
    let mapObject;
    
    switch (feature.geometry.type) {
      case 'Point':
        // Create a marker for point features (POIs)
        const [lng, lat] = feature.geometry.coordinates;
        mapObject = new H.map.Marker(
          { lat, lng }
        );
        break;
        
      case 'LineString':
        // Create polyline for road segments
        const lineString = new H.geo.LineString();
        feature.geometry.coordinates.forEach(([lng, lat]) => {
          lineString.pushPoint({lat, lng});
        });
        
        mapObject = new H.map.Polyline(
          lineString,
          { 
            style: { 
              lineWidth: 4,
              strokeColor: feature.properties.verified ? '#0077CC' : '#CC0000'
            }
          }
        );
        break;
        
      case 'Polygon':
        // Create polygon for buildings or areas
        const polygonLineString = new H.geo.LineString();
        feature.geometry.coordinates[0].forEach(([lng, lat]) => {
          polygonLineString.pushPoint({lat, lng});
        });
        
        mapObject = new H.map.Polygon(
          new H.geo.Polygon([polygonLineString]),
          { 
            style: { 
              fillColor: 'rgba(0, 85, 170, 0.4)',
              strokeColor: '#0055AA',
              lineWidth: 2
            }
          }
        );
        break;
    }
    
    if (mapObject) {
      group.addObject(mapObject);
    }
  });
  
  // Add the group to the map
  map.addObject(group);
  
  // Adjust viewport to ensure all data is visible
  if (group.getBoundingBox()) {
    map.getViewModel().setLookAtData({
      bounds: group.getBoundingBox()
    });
  }
};

// Sample GeoJSON data structure
export const getSampleGeoJson = () => {
  return {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [72.8777, 19.0760]
        },
        "properties": {
          "name": "New Coffee Shop",
          "category": "restaurant",
          "verified": true
        }
      },
      {
        "type": "Feature",
        "geometry": {
          "type": "LineString",
          "coordinates": [
            [72.8677, 19.0760],
            [72.8777, 19.0660],
            [72.8877, 19.0560]
          ]
        },
        "properties": {
          "name": "New Road",
          "category": "primary",
          "verified": true
        }
      },
      {
        "type": "Feature",
        "geometry": {
          "type": "Polygon",
          "coordinates": [[
            [72.8700, 19.0800],
            [72.8750, 19.0800],
            [72.8750, 19.0850],
            [72.8700, 19.0850],
            [72.8700, 19.0800]
          ]]
        },
        "properties": {
          "name": "New Building",
          "category": "commercial",
          "verified": false
        }
      }
    ]
  };
};