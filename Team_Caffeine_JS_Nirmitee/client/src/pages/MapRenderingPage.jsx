// import { useEffect, useRef, useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { initializeHereMap, addGeoJsonToMap, getSampleGeoJson } from "@/lib/mapService";

// const MapRenderingPage = () => {
//   const mapRef = useRef(null);
//   const [mapLoaded, setMapLoaded] = useState(false);
//   const [apiKey] = useState('xHhgsquXklvitNDTbfgp_tWdZ-rJWr4Njtl-66vFggk'); // Store in environment variables in production
//   const [mapInstance, setMapInstance] = useState(null);
//   const [dataSource, setDataSource] = useState('sample'); // 'sample' or 'api'

//   useEffect(() => {
//     // Load HERE Map scripts dynamically
//     const loadMapScripts = () => {
//       // Core scripts
//       const loadCoreScript = new Promise((resolve) => {
//         const script = document.createElement('script');
//         script.src = 'https://js.api.here.com/v3/3.1/mapsjs-core.js';
//         script.async = true;
//         script.onload = resolve;
//         document.body.appendChild(script);
//       });

//       // Service script
//       const loadServiceScript = new Promise((resolve) => {
//         const script = document.createElement('script');
//         script.src = 'https://js.api.here.com/v3/3.1/mapsjs-service.js';
//         script.async = true;
//         script.onload = resolve;
//         document.body.appendChild(script);
//       });

//       // UI script
//       const loadUIScript = new Promise((resolve) => {
//         const script = document.createElement('script');
//         script.src = 'https://js.api.here.com/v3/3.1/mapsjs-ui.js';
//         script.async = true;
//         script.onload = resolve;
//         document.body.appendChild(script);
//       });

//       // Map events script
//       const loadMapEventsScript = new Promise((resolve) => {
//         const script = document.createElement('script');
//         script.src = 'https://js.api.here.com/v3/3.1/mapsjs-mapevents.js';
//         script.async = true;
//         script.onload = resolve;
//         document.body.appendChild(script);
//       });

//       // Vector tile script (for custom styling)
//       const loadVectorTileScript = new Promise((resolve) => {
//         const script = document.createElement('script');
//         script.src = 'https://js.api.here.com/v3/3.1/mapsjs-vectortile.js';
//         script.async = true;
//         script.onload = resolve;
//         document.body.appendChild(script);
//       });

//       // Load CSS
//       const link = document.createElement('link');
//       link.rel = 'stylesheet';
//       link.type = 'text/css';
//       link.href = 'https://js.api.here.com/v3/3.1/mapsjs-ui.css';
//       document.head.appendChild(link);

//       return Promise.all([
//         loadCoreScript, 
//         loadServiceScript, 
//         loadUIScript, 
//         loadMapEventsScript,
//         loadVectorTileScript
//       ]);
//     };

//     // Initialize map after scripts are loaded
//     loadMapScripts().then(() => {
//       initializeMap();
//       setMapLoaded(true);
//     });

//     return () => {
//       if (mapInstance) {
//         mapInstance.dispose();
//       }
//     };
//   }, [apiKey]);

//   // Effect for loading data when map is ready or data source changes
//   useEffect(() => {
//     if (mapInstance && mapLoaded) {
//       loadMapData();
//     }
//   }, [mapInstance, mapLoaded, dataSource]);

//   const initializeMap = () => {
//     try {
//       // Initialize the platform and map
//       const { platform, defaultLayers } = initializeHereMap(apiKey);

//       // Instantiate the map
//       const map = new H.Map(
//         mapRef.current,
//         defaultLayers.vector.normal.map,
//         {
//           zoom: 10,
//           center: { lat: 19.0760, lng: 72.8777 }, // Mumbai coordinates
//           pixelRatio: window.devicePixelRatio || 1
//         }
//       );

//       // Enable map events (like pan, zoom)
//       const mapEvents = new H.mapevents.MapEvents(map);
//       const behavior = new H.mapevents.Behavior(mapEvents);

//       // UI controls
//       const ui = H.ui.UI.createDefault(map, defaultLayers);

//       // Store the map instance for later use
//       map.getUI = () => ui;
//       setMapInstance(map);
//     } catch (error) {
//       console.error("Error initializing map:", error);
//     }
//   };

//   const loadMapData = async () => {
//     if (!mapInstance) return;

//     try {
//       // Clear existing objects
//       mapInstance.removeObjects(mapInstance.getObjects());

//       let geoJsonData;

//       if (dataSource === 'api') {
//         // In a real application, fetch from your API
//         const response = await fetch('/api/map-data');
//         geoJsonData = await response.json();
//       } else {
//         // Use sample data
//         geoJsonData = getSampleGeoJson();
//       }

//       // Add the data to the map
//       addGeoJsonToMap(mapInstance, geoJsonData);

//     } catch (error) {
//       console.error("Error loading map data:", error);
//     }
//   };

//   const toggleDataSource = () => {
//     setDataSource(prev => prev === 'sample' ? 'api' : 'sample');
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <Card>
//         <CardHeader className="flex flex-row items-center justify-between">
//           <CardTitle>AI-Processed Map Visualization</CardTitle>
//           <div className="flex gap-2">
//             <Button 
//               variant="outline" 
//               onClick={toggleDataSource}
//               disabled={!mapLoaded}
//             >
//               {dataSource === 'sample' ? 'Use API Data' : 'Use Sample Data'}
//             </Button>
//             <Button 
//               variant="outline" 
//               onClick={loadMapData}
//               disabled={!mapLoaded}
//             >
//               Refresh Map Data
//             </Button>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <Tabs defaultValue="map">
//             <TabsList className="mb-4">
//               <TabsTrigger value="map">Map View</TabsTrigger>
//               <TabsTrigger value="data">Data Details</TabsTrigger>
//             </TabsList>

//             <TabsContent value="map">
//               <div className="relative">
//                 <div ref={mapRef} style={{ width: '100%', height: '500px', borderRadius: '0.5rem' }} />

//                 {!mapLoaded && (
//                   <div className="absolute inset-0 flex items-center justify-center bg-background/50">
//                     <p>Loading map...</p>
//                   </div>
//                 )}
//               </div>

//               <div className="mt-4 p-4 border rounded-md">
//                 <h3 className="text-lg font-medium mb-2">Map Legend</h3>
//                 <div className="flex flex-col gap-2">
//                   <div className="flex items-center">
//                     <span className="inline-block w-4 h-4 bg-blue-600 mr-2"></span>
//                     <span>Verified Roads</span>
//                   </div>
//                   <div className="flex items-center">
//                     <span className="inline-block w-4 h-4 bg-red-600 mr-2"></span>
//                     <span>Unverified Features</span>
//                   </div>
//                   <div className="flex items-center">
//                     <span className="inline-block w-4 h-4 bg-blue-400/40 border border-blue-700 mr-2"></span>
//                     <span>Buildings / Areas</span>
//                   </div>
//                 </div>
//               </div>
//             </TabsContent>

//             <TabsContent value="data">
//               <div className="bg-muted p-4 rounded-md overflow-auto max-h-[500px]">
//                 <pre className="text-xs">
//                   {JSON.stringify(getSampleGeoJson(), null, 2)}
//                 </pre>
//               </div>
//             </TabsContent>
//           </Tabs>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default MapRenderingPage;
// import { useEffect, useRef, useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { initializeHereMap, addGeoJsonToMap, getSampleGeoJson } from "@/lib/mapService";

// const MapRenderingPage = () => {
//   const mapRef = useRef(null);
//   const [mapLoaded, setMapLoaded] = useState(false);
//   const [apiKey] = useState('xHhgsquXklvitNDTbfgp_tWdZ-rJWr4Njtl-66vFggk'); // Store in environment variables in production
//   const [mapInstance, setMapInstance] = useState(null);
//   const [dataSource, setDataSource] = useState('sample'); // 'sample' or 'api'

//   useEffect(() => {
//     // Load HERE Map scripts sequentially to ensure dependencies are met
//     const loadMapScripts = async () => {
//       // Load CSS first
//       const link = document.createElement('link');
//       link.rel = 'stylesheet';
//       link.type = 'text/css';
//       link.href = 'https://js.api.here.com/v3/3.1/mapsjs-ui.css';
//       document.head.appendChild(link);

//       // Function to load script and wait for it to load
//       const loadScript = (url) => {
//         return new Promise((resolve) => {
//           const script = document.createElement('script');
//           script.src = url;
//           script.onload = resolve;
//           document.body.appendChild(script);
//         });
//       };

//       // Load scripts in sequence - order matters!
//       await loadScript('https://js.api.here.com/v3/3.1/mapsjs-core.js');
//       await loadScript('https://js.api.here.com/v3/3.1/mapsjs-service.js');
//       await loadScript('https://js.api.here.com/v3/3.1/mapsjs-mapevents.js');
//       await loadScript('https://js.api.here.com/v3/3.1/mapsjs-ui.js');
//       await loadScript('https://js.api.here.com/v3/3.1/mapsjs-vectortile.js');
//     };

//     // Load scripts then initialize map
//     loadMapScripts()
//       .then(() => {
//         initializeMap();
//         setMapLoaded(true);
//       })
//       .catch(error => {
//         console.error("Failed to load HERE Maps scripts:", error);
//       });

//     return () => {
//       if (mapInstance) {
//         mapInstance.dispose();
//       }
//     };
//   }, []);

//   // Effect for loading data when map is ready or data source changes
//   useEffect(() => {
//     if (mapInstance && mapLoaded) {
//       loadMapData();
//     }
//   }, [mapInstance, mapLoaded, dataSource]);

//   const initializeMap = () => {
//     try {
//       // Initialize the platform
//       const platform = new H.service.Platform({
//         apikey: apiKey
//       });

//       // Get default layers
//       const defaultLayers = platform.createDefaultLayers();

//       // Instantiate the map
//       const map = new H.Map(
//         mapRef.current,
//         defaultLayers.vector.normal.map,
//         {
//           zoom: 10,
//           center: { lat: 19.0760, lng: 72.8777 }, // Mumbai coordinates
//           pixelRatio: window.devicePixelRatio || 1
//         }
//       );

//       // Enable map events (like pan, zoom)
//       const mapEvents = new H.mapevents.MapEvents(map);
//       const behavior = new H.mapevents.Behavior(mapEvents);

//       // UI controls
//       const ui = H.ui.UI.createDefault(map, defaultLayers);

//       // Store the platform and map instance for later use
//       map.platform = platform;
//       map.ui = ui;
//       setMapInstance(map);
//     } catch (error) {
//       console.error("Error initializing map:", error);
//     }
//   };

//   const loadMapData = async () => {
//     if (!mapInstance) return;

//     try {
//       // Clear existing objects
//       mapInstance.removeObjects(mapInstance.getObjects());

//       let geoJsonData;

//       if (dataSource === 'api') {
//         try {
//           // In a real application, fetch from your API
//           const response = await fetch('/api/map-data');
//           geoJsonData = await response.json();
//         } catch (error) {
//           console.error("Failed to fetch API data, using sample data instead:", error);
//           geoJsonData = getSampleGeoJson();
//         }
//       } else {
//         // Use sample data
//         geoJsonData = getSampleGeoJson();
//       }

//       // Add the data to the map
//       if (geoJsonData) {
//         // Here we're using our own utility function now
//         addToMap(mapInstance, geoJsonData);
//       }

//     } catch (error) {
//       console.error("Error loading map data:", error);
//     }
//   };

//   // Local function to add data to the map (fallback if the imported utility fails)
//   const addToMap = (map, data) => {
//     // Create a group that will hold map objects
//     const group = new H.map.Group();

//     // Process each feature in the data
//     data.features.forEach(feature => {
//       let mapObject;

//       switch (feature.geometry.type) {
//         case 'Point':
//           // Create a marker for point features (POIs)
//           const [lng, lat] = feature.geometry.coordinates;
//           mapObject = new H.map.Marker(
//             { lat, lng },
//             { data: feature.properties }
//           );
//           break;

//         case 'LineString':
//           // Create polyline for road segments
//           const lineString = new H.geo.LineString();
//           feature.geometry.coordinates.forEach(([lng, lat]) => {
//             lineString.pushPoint({lat, lng});
//           });

//           mapObject = new H.map.Polyline(
//             lineString,
//             { 
//               style: { 
//                 lineWidth: 4,
//                 strokeColor: feature.properties.verified ? '#0077CC' : '#CC0000'
//               },
//               data: feature.properties
//             }
//           );
//           break;

//         case 'Polygon':
//           // Create polygon for buildings or areas
//           const polygonLineString = new H.geo.LineString();
//           feature.geometry.coordinates[0].forEach(([lng, lat]) => {
//             polygonLineString.pushPoint({lat, lng});
//           });

//           mapObject = new H.map.Polygon(
//             new H.geo.Polygon([polygonLineString]),
//             { 
//               style: { 
//                 fillColor: 'rgba(0, 85, 170, 0.4)',
//                 strokeColor: '#0055AA',
//                 lineWidth: 2
//               },
//               data: feature.properties
//             }
//           );
//           break;
//       }

//       if (mapObject) {
//         group.addObject(mapObject);
//       }
//     });

//     // Add the group to the map
//     map.addObject(group);

//     // Adjust viewport to ensure all data is visible
//     if (group.getBoundingBox()) {
//       map.getViewModel().setLookAtData({
//         bounds: group.getBoundingBox()
//       });
//     }
//   };

//   const toggleDataSource = () => {
//     setDataSource(prev => prev === 'sample' ? 'api' : 'sample');
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <Card>
//         <CardHeader className="flex flex-row items-center justify-between">
//           <CardTitle>AI-Processed Map Visualization</CardTitle>
//           <div className="flex gap-2">
//             <Button 
//               variant="outline" 
//               onClick={toggleDataSource}
//               disabled={!mapLoaded}
//             >
//               {dataSource === 'sample' ? 'Use API Data' : 'Use Sample Data'}
//             </Button>
//             <Button 
//               variant="outline" 
//               onClick={loadMapData}
//               disabled={!mapLoaded}
//             >
//               Refresh Map Data
//             </Button>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <Tabs defaultValue="map">
//             <TabsList className="mb-4">
//               <TabsTrigger value="map">Map View</TabsTrigger>
//               <TabsTrigger value="data">Data Details</TabsTrigger>
//             </TabsList>

//             <TabsContent value="map">
//               <div className="relative">
//                 <div ref={mapRef} style={{ width: '100%', height: '500px', borderRadius: '0.5rem' }} />

//                 {!mapLoaded && (
//                   <div className="absolute inset-0 flex items-center justify-center bg-background/50">
//                     <p>Loading map...</p>
//                   </div>
//                 )}
//               </div>

//               <div className="mt-4 p-4 border rounded-md">
//                 <h3 className="text-lg font-medium mb-2">Map Legend</h3>
//                 <div className="flex flex-col gap-2">
//                   <div className="flex items-center">
//                     <span className="inline-block w-4 h-4 bg-blue-600 mr-2"></span>
//                     <span>Verified Roads</span>
//                   </div>
//                   <div className="flex items-center">
//                     <span className="inline-block w-4 h-4 bg-red-600 mr-2"></span>
//                     <span>Unverified Features</span>
//                   </div>
//                   <div className="flex items-center">
//                     <span className="inline-block w-4 h-4 bg-blue-400/40 border border-blue-700 mr-2"></span>
//                     <span>Buildings / Areas</span>
//                   </div>
//                 </div>
//               </div>
//             </TabsContent>

//             <TabsContent value="data">
//               <div className="bg-muted p-4 rounded-md overflow-auto max-h-[500px]">
//                 <pre className="text-xs">
//                   {JSON.stringify(getSampleGeoJson(), null, 2)}
//                 </pre>
//               </div>
//             </TabsContent>
//           </Tabs>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default MapRenderingPage;

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MapRenderingPage = () => {
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [apiKey] = useState('xHhgsquXklvitNDTbfgp_tWdZ-rJWr4Njtl-66vFggk');
  const [mapInstance, setMapInstance] = useState(null);
  const [currentGeoJsonData, setCurrentGeoJsonData] = useState(null);
  const [originalRestaurantData, setOriginalRestaurantData] = useState(null);

  // Filter states
  const [searchText, setSearchText] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('');
  const [statusMessage, setStatusMessage] = useState('Loading restaurants...');

  // Sample data fallback
  const sampleGeoJSONData = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [72.8729633, 19.1138382],
        },
        properties: {
          restaurant: 'Demo Restaurant 1',
          total_ratings: 1200,
          food_type: 'Chinese, Thai, Asian',
          formatted_address: 'Sample Address 1, Andheri East, Mumbai',
          delivery_time: 45,
        },
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [72.8829633, 19.1238382],
        },
        properties: {
          restaurant: 'Demo Restaurant 2',
          total_ratings: 500,
          food_type: 'North Indian, Mughlai',
          formatted_address: 'Sample Address 2, Andheri East, Mumbai',
          delivery_time: 60,
        },
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [72.8629633, 19.1038382],
        },
        properties: {
          restaurant: 'Demo Restaurant 3',
          total_ratings: 100,
          food_type: 'South Indian, Dosa',
          formatted_address: 'Sample Address 3, Andheri West, Mumbai',
          delivery_time: 30,
        },
      },
    ],
  };

  useEffect(() => {
    // Load MapLibre GL JS scripts
    const loadMapScripts = async () => {
      // Load CSS
      // if (!document.querySelector('link[href*="maplibre-gl"]')) {
      //   const link = document.createElement('link');
      //   link.rel = 'stylesheet';
      //   link.href = 'https://unpkg.com/maplibre-gl@2.4.0/dist/maplibre-gl.css';
      //   document.head.appendChild(link);
      // }

      // // Load JS
      // if (!window.maplibregl) {
      //   const script = document.createElement('script');
      //   script.src = 'https://unpkg.com/maplibre-gl@2.4.0/dist/maplibre-gl.js';
      //   script.onload = () => {
      //     initializeMap();
      //     setMapLoaded(true);
      //   };
      //   document.body.appendChild(script);
      // } else {
      //   initializeMap();
      //   setMapLoaded(true);
      // }
      try {
        // Load CSS
        if (!document.querySelector('link[href*="maplibre-gl"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/maplibre-gl@2.4.0/dist/maplibre-gl.css';
          document.head.appendChild(link);
        }

        // Load JS if not already loaded
        if (!window.maplibregl) {
          console.log('Loading MapLibre GL JS script...');
          return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/maplibre-gl@2.4.0/dist/maplibre-gl.js';
            script.onload = () => {
              console.log('MapLibre GL JS loaded');
              resolve();
            };
            script.onerror = (e) => {
              console.error('Error loading MapLibre GL JS:', e);
              reject(e);
            };
            document.body.appendChild(script);
          });
        } else {
          console.log('MapLibre GL JS already loaded');
          return Promise.resolve();
        }
      } catch (error) {
        console.error('Error loading map scripts:', error);
        setStatusMessage(`Error loading map scripts: ${error.message}`);
        return Promise.reject(error);
      }
    };

    //   loadMapScripts();

    //   return () => {
    //     if (mapInstance) {
    //       mapInstance.remove();
    //     }
    //   };
    // }, []);
    loadMapScripts()
      .then(() => {
        console.log('Scripts loaded, initializing map...');
        initializeMap();
      })
      .catch(err => {
        console.error('Failed to initialize map:', err);
        setStatusMessage(`Failed to initialize map: ${err.message}`);
      });

    return () => {
      if (mapInstance) {
        console.log('Cleaning up map instance');
        mapInstance.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (mapLoaded && mapInstance) {
      console.log('Map is loaded and instance is ready, loading restaurant data...');
      loadRestaurantData();
    }
  }, [mapLoaded, mapInstance]);

  useEffect(() => {
    if (originalRestaurantData) {
      filterRestaurants();
    }
  }, [searchText, cuisineFilter, ratingFilter, timeFilter, originalRestaurantData]);

  // const initializeMap = () => {
  //   try {
  //     const map = new maplibregl.Map({
  //       container: mapRef.current,
  //       style: {
  //         version: 8,
  //         sources: {
  //           hereVectorTiles: {
  //             type: 'vector',
  //             tiles: [
  //               `https://vector.hereapi.com/v2/vectortiles/base/mc/{z}/{x}/{y}/omv?apikey=${apiKey}`,
  //             ],
  //             tileSize: 512,
  //           },
  //           restaurants: {
  //             type: 'geojson',
  //             data: {
  //               type: 'FeatureCollection',
  //               features: [],
  //             },
  //           },
  //         },
  //         layers: [
  //           {
  //             id: 'landuse_here',
  //             type: 'fill',
  //             source: 'hereVectorTiles',
  //             'source-layer': 'landuse',
  //             paint: {
  //               'fill-color': '#e0e0e0',
  //             },
  //           },
  //           {
  //             id: 'water_here',
  //             type: 'fill',
  //             source: 'hereVectorTiles',
  //             'source-layer': 'water',
  //             paint: {
  //               'fill-color': '#a0c8f0',
  //             },
  //           },
  //           {
  //             id: 'buildings_here',
  //             type: 'fill',
  //             source: 'hereVectorTiles',
  //             'source-layer': 'buildings',
  //             paint: {
  //               'fill-color': '#d9d9d9',
  //               'fill-outline-color': '#bbbbbb',
  //             },
  //           },
  //           {
  //             id: 'roads_here',
  //             type: 'line',
  //             source: 'hereVectorTiles',
  //             'source-layer': 'roads',
  //             paint: {
  //               'line-color': '#ffffff',
  //               'line-width': 1,
  //             },
  //           },
  //           {
  //             id: 'restaurants-circles',
  //             type: 'circle',
  //             source: 'restaurants',
  //             paint: {
  //               'circle-radius': [
  //                 'interpolate',
  //                 ['linear'],
  //                 ['get', 'total_ratings'],
  //                 20, 8,
  //                 50, 10,
  //                 100, 12,
  //                 500, 14,
  //                 1000, 16
  //               ],
  //               'circle-color': [
  //                 'match',
  //                 ['get', 'rating_category'],
  //                 '1000+', '#FF5252',
  //                 '500+', '#FF9800',
  //                 '100+', '#FFC107',
  //                 '50+', '#4CAF50',
  //                 '20+', '#2196F3',
  //                 '#BBBBBB'
  //               ],
  //               'circle-opacity': 0.8,
  //               'circle-stroke-width': 1,
  //               'circle-stroke-color': '#FFFFFF'
  //             },
  //           },
  //         ],
  //       },
  //       center: [72.8729633, 19.1138382],
  //       zoom: 13,
  //     });

  //     map.addControl(new maplibregl.NavigationControl());

  //     // Add popup functionality
  //     map.on('click', 'restaurants-circles', (e) => {
  //       const feature = e.features[0];
  //       const props = feature.properties;

  //       const cuisineFormatted = props.food_type
  //         .split(',')
  //         .map(cuisine => cuisine.trim())
  //         .filter(cuisine => cuisine)
  //         .join(', ');

  //       const popupContent = `
  //         <div style="padding: 8px;">
  //           <div style="font-weight: bold; font-size: 14px; margin-bottom: 5px; border-bottom: 1px solid #eee; padding-bottom: 5px;">
  //             ${props.restaurant}
  //           </div>
  //           <div style="font-size: 12px; margin: 3px 0;">
  //             <strong>Cuisine:</strong> ${cuisineFormatted}
  //           </div>
  //           <div style="font-size: 12px; margin: 3px 0;">
  //             <strong>Ratings:</strong> ${props.total_ratings} reviews
  //           </div>
  //           <div style="font-size: 12px; margin: 3px 0;">
  //             <strong>Delivery Time:</strong> 
  //             <span style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-weight: bold;">
  //               ${props.delivery_time} mins
  //             </span>
  //           </div>
  //           <div style="font-size: 12px; margin: 3px 0;">
  //             <strong>Address:</strong> ${props.formatted_address}
  //           </div>
  //         </div>
  //       `;

  //       new maplibregl.Popup()
  //         .setLngLat(feature.geometry.coordinates)
  //         .setHTML(popupContent)
  //         .addTo(map);
  //     });

  //     // Change cursor on hover
  //     map.on('mouseenter', 'restaurants-circles', () => {
  //       map.getCanvas().style.cursor = 'pointer';
  //     });
  //     map.on('mouseleave', 'restaurants-circles', () => {
  //       map.getCanvas().style.cursor = '';
  //     });

  //     setMapInstance(map);
  //   } catch (error) {
  //     console.error("Error initializing map:", error);
  //   }
  // };
  // const initializeMap = () => {
  //   try {
  //     console.log('Initializing map...');

  //     const map = new maplibregl.Map({
  //       container: mapRef.current,
  //       style: {
  //         version: 8,
  //         sources: {
  //           hereVectorTiles: {
  //             type: 'vector',
  //             tiles: [
  //               `https://vector.hereapi.com/v2/vectortiles/base/mc/{z}/{x}/{y}/omv?apikey=${apiKey}`,
  //             ],
  //             tileSize: 512,
  //           },
  //           restaurants: {
  //             type: 'geojson',
  //             data: {
  //               type: 'FeatureCollection',
  //               features: [],
  //             },
  //           },
  //         },
  //         layers: [
  //           // ... your existing layers ...
  //         ],
  //       },
  //       center: [72.8729633, 19.1138382],
  //       zoom: 13,
  //     });

  //     // Add event listeners for map load/error events
  //     map.on('load', () => {
  //       console.log('Map loaded successfully');
  //       setMapLoaded(true);
  //       setMapInstance(map);
  //     });

  //     map.on('error', (e) => {
  //       console.error('Map error:', e);
  //       setStatusMessage(`Map error: ${e.error?.message || 'Unknown error'}`);
  //     });

  //     map.on('sourcedataloading', (e) => {
  //       if (e.sourceId === 'restaurants') {
  //         console.log('Restaurant data loading...');
  //       }
  //     });

  //     map.on('sourcedata', (e) => {
  //       if (e.sourceId === 'restaurants' && e.isSourceLoaded) {
  //         console.log('Restaurant data loaded');
  //       }
  //     });

  //     map.addControl(new maplibregl.NavigationControl());

  //     // Add popup functionality (your existing code)

  //     // No need to call setMapInstance here, we do it in the 'load' event

  //   } catch (error) {
  //     console.error("Error initializing map:", error);
  //     setStatusMessage(`Error initializing map: ${error.message}`);
  //   }
  // };
  const initializeMap = () => {
    try {
      console.log('Initializing map...');

      const map = new maplibregl.Map({
        container: mapRef.current,
        style: {
          version: 8,
          sources: {
            hereVectorTiles: {
              type: 'vector',
              tiles: [
                `https://vector.hereapi.com/v2/vectortiles/base/mc/{z}/{x}/{y}/omv?apikey=${apiKey}`,
              ],
              tileSize: 512,
            },
            restaurants: {
              type: 'geojson',
              data: {
                type: 'FeatureCollection',
                features: [],
              },
            },
          },
          layers: [
            {
              id: 'landuse_here',
              type: 'fill',
              source: 'hereVectorTiles',
              'source-layer': 'landuse',
              paint: {
                'fill-color': '#e0e0e0',
              },
            },
            {
              id: 'water_here',
              type: 'fill',
              source: 'hereVectorTiles',
              'source-layer': 'water',
              paint: {
                'fill-color': '#a0c8f0',
              },
            },
            {
              id: 'buildings_here',
              type: 'fill',
              source: 'hereVectorTiles',
              'source-layer': 'buildings',
              paint: {
                'fill-color': '#d9d9d9',
                'fill-outline-color': '#bbbbbb',
              },
            },
            {
              id: 'roads_here',
              type: 'line',
              source: 'hereVectorTiles',
              'source-layer': 'roads',
              paint: {
                'line-color': '#ffffff',
                'line-width': 1,
              },
            },
            {
              id: 'restaurants-circles',
              type: 'circle',
              source: 'restaurants',
              paint: {
                'circle-radius': [
                  'interpolate',
                  ['linear'],
                  ['get', 'total_ratings'],
                  20, 8,
                  50, 10,
                  100, 12,
                  500, 14,
                  1000, 16
                ],
                'circle-color': [
                  'match',
                  ['get', 'rating_category'],
                  '1000+', '#FF5252',
                  '500+', '#FF9800',
                  '100+', '#FFC107',
                  '50+', '#4CAF50',
                  '20+', '#2196F3',
                  '#BBBBBB'
                ],
                'circle-opacity': 0.8,
                'circle-stroke-width': 1,
                'circle-stroke-color': '#FFFFFF'
              },
            },
          ],
        },
        center: [72.8729633, 19.1138382],
        zoom: 13,
      });

      // Add event listeners for map load events
      map.on('load', () => {
        console.log('Map loaded successfully');

        // Add popup functionality after map is loaded
        map.on('click', 'restaurants-circles', (e) => {
          const feature = e.features[0];
          const props = feature.properties;

          // Format cuisine 
          let cuisineFormatted = props.food_type || '';
          if (typeof cuisineFormatted === 'string') {
            cuisineFormatted = cuisineFormatted
              .split(',')
              .map(cuisine => cuisine.trim())
              .filter(cuisine => cuisine)
              .join(', ');
          }

          const popupContent = `
          <div style="padding: 8px;">
            <div style="font-weight: bold; font-size: 14px; margin-bottom: 5px; border-bottom: 1px solid #eee; padding-bottom: 5px;">
              ${props.restaurant || 'Unnamed Restaurant'}
            </div>
            <div style="font-size: 12px; margin: 3px 0;">
              <strong>Cuisine:</strong> ${cuisineFormatted}
            </div>
            <div style="font-size: 12px; margin: 3px 0;">
              <strong>Ratings:</strong> ${props.total_ratings || 0} reviews
            </div>
            <div style="font-size: 12px; margin: 3px 0;">
              <strong>Delivery Time:</strong> 
              <span style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-weight: bold;">
                ${props.delivery_time || '--'} mins
              </span>
            </div>
            <div style="font-size: 12px; margin: 3px 0;">
              <strong>Address:</strong> ${props.formatted_address || 'Address not available'}
            </div>
          </div>
        `;

          new maplibregl.Popup()
            .setLngLat(feature.geometry.coordinates)
            .setHTML(popupContent)
            .addTo(map);
        });

        // Change cursor on hover
        map.on('mouseenter', 'restaurants-circles', () => {
          map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', 'restaurants-circles', () => {
          map.getCanvas().style.cursor = '';
        });

        setMapLoaded(true);
        setMapInstance(map);
      });

      map.on('error', (e) => {
        console.error('Map error:', e);
        setStatusMessage(`Map error: ${e.error?.message || 'Unknown error'}`);
      });

      map.addControl(new maplibregl.NavigationControl());

    } catch (error) {
      console.error("Error initializing map:", error);
      setStatusMessage(`Error initializing map: ${error.message}`);
    }
  };

  const prepareRestaurantData = (data) => {
    if (!data || !data.type || data.type !== 'FeatureCollection' || !Array.isArray(data.features)) {
      console.warn('Using fallback data due to invalid input');
      return sampleGeoJSONData;
    }

    data.features = data.features.filter(feature => {
      if (!feature.geometry || !feature.properties) return false;
      if (!feature.geometry.coordinates || feature.geometry.coordinates.length < 2) return false;

      // Add rating category
      if (feature.properties.total_ratings) {
        const ratings = parseInt(feature.properties.total_ratings);
        if (ratings >= 1000) {
          feature.properties.rating_category = '1000+';
        } else if (ratings >= 500) {
          feature.properties.rating_category = '500+';
        } else if (ratings >= 100) {
          feature.properties.rating_category = '100+';
        } else if (ratings >= 50) {
          feature.properties.rating_category = '50+';
        } else {
          feature.properties.rating_category = '20+';
        }
      } else {
        feature.properties.rating_category = '20+';
        feature.properties.total_ratings = 20;
      }

      // Ensure required fields exist
      if (!feature.properties.food_type) {
        feature.properties.food_type = 'Unspecified';
      } else {
        feature.properties.food_type = feature.properties.food_type
          .replace(/,/g, ', ')
          .replace(/\s\s+/g, ' ');
      }

      if (!feature.properties.delivery_time) {
        feature.properties.delivery_time = 45;
      }

      if (!feature.properties.restaurant) {
        feature.properties.restaurant = 'Unnamed Restaurant';
      }

      if (!feature.properties.formatted_address) {
        feature.properties.formatted_address = 'Andheri, Mumbai';
      }

      return true;
    });

    if (data.features.length === 0) {
      return sampleGeoJSONData;
    }

    return data;
  };

  // const loadRestaurantData = async () => {
  //   setStatusMessage('Loading restaurant data...');

  //   try {
  //     const response = await fetch('/andheri_restaurants.geojson');
  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }
  //     const data = await response.json();

  //     const processedData = prepareRestaurantData(data);

  //     mapInstance.getSource('restaurants').setData(processedData);

  //     const bounds = new maplibregl.LngLatBounds();
  //     let featuresWithValidCoords = 0;

  //     processedData.features.forEach(feature => {
  //       try {
  //         if (feature.geometry && 
  //             feature.geometry.coordinates && 
  //             feature.geometry.coordinates.length >= 2 &&
  //             !isNaN(feature.geometry.coordinates[0]) && 
  //             !isNaN(feature.geometry.coordinates[1])) {
  //           bounds.extend(feature.geometry.coordinates);
  //           featuresWithValidCoords++;
  //         }
  //       } catch (coordErr) {
  //         console.warn("Issue with coordinates", coordErr);
  //       }
  //     });

  //     if (featuresWithValidCoords > 0 && !bounds.isEmpty()) {
  //       mapInstance.fitBounds(bounds, { padding: 50 });
  //     }

  //     setStatusMessage(`Loaded ${processedData.features.length} restaurants`);
  //     setOriginalRestaurantData(processedData);
  //     setCurrentGeoJsonData(processedData);
  //   } catch (error) {
  //     console.error('Error loading restaurant data:', error);
  //     const fallbackData = prepareRestaurantData(sampleGeoJSONData);
  //     mapInstance.getSource('restaurants').setData(fallbackData);
  //     setStatusMessage(`Using sample data (${fallbackData.features.length} restaurants)`);
  //     setOriginalRestaurantData(fallbackData);
  //     setCurrentGeoJsonData(fallbackData);
  //   }
  // };
  // Fix the bounds extension code in loadRestaurantData function
  const loadRestaurantData = async () => {
    setStatusMessage('Loading restaurant data...');

    try {
      console.log('Fetching restaurant data from:', '/andheri_restaurants.geojson');
      const response = await fetch('/andheri_restaurants.geojson');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Restaurant data loaded successfully, features:', data.features?.length);

      if (!data || !data.type || data.type !== 'FeatureCollection' || !Array.isArray(data.features)) {
        console.warn('Invalid GeoJSON data format:', data);
        throw new Error('Invalid GeoJSON data format');
      }

      const processedData = prepareRestaurantData(data);
      console.log('Processed data features:', processedData.features.length);

      if (mapInstance && mapInstance.getSource('restaurants')) {
        mapInstance.getSource('restaurants').setData(processedData);

        // FIXED: Create bounds properly
        if (processedData.features.length > 0) {
          try {
            // Create a new bounds object
            const bounds = new maplibregl.LngLatBounds();
            let featuresWithValidCoords = 0;

            processedData.features.forEach(feature => {
              try {
                const coords = feature.geometry.coordinates;
                if (coords &&
                  Array.isArray(coords) &&
                  coords.length >= 2 &&
                  !isNaN(coords[0]) &&
                  !isNaN(coords[1])) {

                  // Correctly create LngLat object before extending bounds
                  const lng = coords[0];
                  const lat = coords[1];

                  // Extend bounds with the LngLat values
                  bounds.extend([lng, lat]);
                  featuresWithValidCoords++;
                }
              } catch (coordErr) {
                console.warn("Issue with coordinates:", coordErr);
              }
            });

            console.log(`Found ${featuresWithValidCoords} features with valid coordinates`);

            if (featuresWithValidCoords > 0 && !bounds.isEmpty()) {
              console.log('Fitting map to bounds:', bounds.toString());
              // Use a try-catch to handle any potential issues with fitBounds
              try {
                mapInstance.fitBounds(bounds, { padding: 50, maxZoom: 15 });
              } catch (boundsError) {
                console.error('Error fitting to bounds:', boundsError);
                // Fallback to default center
                mapInstance.setCenter([72.8729633, 19.1138382]);
                mapInstance.setZoom(13);
              }
            }
          } catch (boundsCreationError) {
            console.error('Error creating bounds:', boundsCreationError);
            // Fallback to default center
            mapInstance.setCenter([72.8729633, 19.1138382]);
            mapInstance.setZoom(13);
          }
        }

        setStatusMessage(`Loaded ${processedData.features.length} restaurants`);
        setOriginalRestaurantData(processedData);
        setCurrentGeoJsonData(processedData);
      } else {
        console.error('Map or data source not ready');
        throw new Error('Map or data source not ready');
      }
    } catch (error) {
      console.error('Error loading restaurant data:', error);

      // Use sample data as fallback
      const fallbackData = prepareRestaurantData(sampleGeoJSONData);

      if (mapInstance && mapInstance.getSource('restaurants')) {
        mapInstance.getSource('restaurants').setData(fallbackData);
      }

      setStatusMessage(`Using sample data (${fallbackData.features.length} restaurants)`);
      setOriginalRestaurantData(fallbackData);
      setCurrentGeoJsonData(fallbackData);
    }
  };

  const filterRestaurants = () => {
    if (!originalRestaurantData) return;

    const filteredData = JSON.parse(JSON.stringify(originalRestaurantData));

    filteredData.features = filteredData.features.filter(feature => {
      const props = feature.properties;

      // Check cuisine filter
      if (cuisineFilter && !props.food_type.toLowerCase().includes(cuisineFilter.toLowerCase())) {
        return false;
      }

      // Check rating filter
      if (ratingFilter) {
        const minRating = parseInt(ratingFilter);
        if (props.total_ratings < minRating) {
          return false;
        }
      }

      // Check delivery time filter
      if (timeFilter && props.delivery_time) {
        const maxTime = parseInt(timeFilter);
        if (props.delivery_time > maxTime) {
          return false;
        }
      }

      // Check search text filter
      if (searchText) {
        const matchesName = props.restaurant.toLowerCase().includes(searchText.toLowerCase());
        const matchesCuisine = props.food_type.toLowerCase().includes(searchText.toLowerCase());
        if (!matchesName && !matchesCuisine) {
          return false;
        }
      }

      return true;
    });

    mapInstance.getSource('restaurants').setData(filteredData);
    setStatusMessage(`Showing ${filteredData.features.length} restaurants`);
    setCurrentGeoJsonData(filteredData);
  };

  const resetFilters = () => {
    setSearchText('');
    setCuisineFilter('');
    setRatingFilter('');
    setTimeFilter('');
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Andheri Restaurants Map</CardTitle>
          <div className="text-sm text-muted-foreground">
            {statusMessage}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="map">
            <TabsList className="mb-4">
              <TabsTrigger value="map">Map View</TabsTrigger>
              <TabsTrigger value="filters">Filters</TabsTrigger>
              <TabsTrigger value="data">Data Details</TabsTrigger>
            </TabsList>

            <TabsContent value="map">
              <div className="relative">
                <div ref={mapRef} style={{ width: '100%', height: '500px', borderRadius: '0.5rem' }} />

                {!mapLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg">
                    <p>Loading map...</p>
                  </div>
                )}
              </div>

              <div className="mt-4 p-4 border rounded-md">
                <h3 className="text-lg font-medium mb-2">Restaurant Legend</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  <div className="flex items-center">
                    <span className="inline-block w-4 h-4 bg-red-500 rounded-full mr-2"></span>
                    <span className="text-sm">1000+ Reviews</span>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-block w-4 h-4 bg-orange-500 rounded-full mr-2"></span>
                    <span className="text-sm">500+ Reviews</span>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-block w-4 h-4 bg-yellow-500 rounded-full mr-2"></span>
                    <span className="text-sm">100+ Reviews</span>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-block w-4 h-4 bg-green-500 rounded-full mr-2"></span>
                    <span className="text-sm">50+ Reviews</span>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-block w-4 h-4 bg-blue-500 rounded-full mr-2"></span>
                    <span className="text-sm">20+ Reviews</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="filters">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="search">Search by name or cuisine</Label>
                  <Input
                    id="search"
                    placeholder="Search restaurants..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="cuisine">Filter by cuisine</Label>
                    <select
                      id="cuisine"
                      className="w-full p-2 border rounded-md"
                      value={cuisineFilter}
                      onChange={(e) => setCuisineFilter(e.target.value)}
                    >
                      <option value="">All Cuisines</option>
                      <option value="Chinese">Chinese</option>
                      <option value="North Indian">North Indian</option>
                      <option value="South Indian">South Indian</option>
                      <option value="Fast Food">Fast Food</option>
                      <option value="Italian">Italian</option>
                      <option value="Thai">Thai</option>
                      <option value="Indian">Indian</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="rating">Filter by ratings</Label>
                    <select
                      id="rating"
                      className="w-full p-2 border rounded-md"
                      value={ratingFilter}
                      onChange={(e) => setRatingFilter(e.target.value)}
                    >
                      <option value="">All Ratings</option>
                      <option value="1000">1000+ Reviews</option>
                      <option value="500">500+ Reviews</option>
                      <option value="100">100+ Reviews</option>
                      <option value="50">50+ Reviews</option>
                      <option value="20">20+ Reviews</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="time">Filter by delivery time</Label>
                    <select
                      id="time"
                      className="w-full p-2 border rounded-md"
                      value={timeFilter}
                      onChange={(e) => setTimeFilter(e.target.value)}
                    >
                      <option value="">Any Time</option>
                      <option value="45">Under 45 min</option>
                      <option value="50">Under 50 min</option>
                      <option value="55">Under 55 min</option>
                      <option value="60">Under 60 min</option>
                    </select>
                  </div>
                </div>

                <Button onClick={resetFilters} variant="outline">
                  Reset All Filters
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="data">
              <div className="bg-muted p-4 rounded-md overflow-auto max-h-[500px]">
                <h3 className="text-lg font-medium mb-2">Current Dataset</h3>
                {currentGeoJsonData ? (
                  <div>
                    <p className="mb-2">
                      <strong>Features:</strong> {currentGeoJsonData.features?.length || 0}
                    </p>
                    <pre className="text-xs">
                      {JSON.stringify(currentGeoJsonData, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <p>No data loaded yet.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default MapRenderingPage;