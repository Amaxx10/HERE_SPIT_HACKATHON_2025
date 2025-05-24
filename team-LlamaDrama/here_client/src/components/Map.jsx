import { useEffect, useRef, useState } from "react";
import * as shp from "shpjs";
import { MapContainer, TileLayer, useMap, Rectangle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { motion, AnimatePresence } from 'framer-motion';
// import { set } from "mongoose";
// import { use } from "chai";

// Update map container styles
const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

// MapController component for map instance access
function MapController({ onMapReady }) {
  const map = useMap();
  useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);
  return null;
}

const SUPPORTED_FORMATS = {
  cpg: "Character encoding file",
  dbf: "Attribute data",
  prj: "Projection information",
  sbx: "Spatial index",
  shp: "Shape format",
  shx: "Shape index format",
  xml: "Metadata",
};

const sendFeatureData = async (features) => {
  try {
    const transformedFeatures = features.map(f => ({
      objectId: f.properties.OBJECTID || '',
      customerId: f.properties.CUSTOMER_I || '',
      postalArea: f.properties.POSTAL_ARE || '',
      fullPostal: f.properties.FULL_POSTA || '',
      recType: f.properties.REC_TYPE || '',
      geoLevel: f.properties.GEO_LEVEL || '',
      ntCity: f.properties.NT_CITY || '',
      county: f.properties.COUNTY || '',
      state: f.properties.STATE || '',
      display: {
        lineId: f.properties.DISPLAY_LI || '',
        latitude: f.properties.DISPLAY_LA || '',
        longitude: f.properties.DISPLAY_LO || ''
      },
      routing: {
        lineId: f.properties.ROUTING_LI || '',
        latitude: f.properties.ROUTING_LA || '',
        longitude: f.properties.ROUTING_LO || ''
      },
      address: {
        houseNumber: f.properties.HOUSE_NUMB || '',
        buildingName: f.properties.BUILDING_N || '',
        streetName: f.properties.STREET_NAM || '',
        tmoStreet: f.properties.TMO_STREET || ''
      },
      hdb: f.properties.HDB || '',
      nearest: {
        fid: f.properties.NEAR_FID || '',
        distance: f.properties.NEAR_DIST || '',
        coordinates: {
          x: f.properties.NEAR_X || '',
          y: f.properties.NEAR_Y || ''
        }
      }
    }));

    const response = await axios.post(
      'http://localhost:5000/api/mapview/store',
      transformedFeatures,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      }
    );
    console.log("Features sent successfully:", response.data);
    return response.data;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout:', error);
    } else if (error.response) {
      console.error('Server error:', error.response.data);
    } else if (error.request) {
      console.error('Network error:', error.message);
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
}

const fetchFeaturesInBounds = async (bounds) => {
  try {
    const response = await axios.get('http://localhost:5000/api/mapview/features/bounds', {
      params: {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest()
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching features:', error);
    throw error;
  }
};

// Add this helper function before the MapWithShapefiles component
const formatValue = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
};

const MapWithShapefiles = () => {
  // Map references and state
  const mapRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [trafficLayer, setTrafficLayer] = useState(null);
  const [showTraffic, setShowTraffic] = useState(false);
  const [mapStyle, setMapStyle] = useState("normal");
  const [corrected, setCorrected] = useState([]);

  // Shapefile state
  const [shapefileData, setShapefileData] = useState(null);
  const [fileNames, setFileNames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [shapefileGroup, setShapefileGroup] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [fileData, setFileData] = useState({});

  // Add ref for file input to clear it
  const fileInputRef = useRef(null);

  // Selection state
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBounds, setSelectionBounds] = useState(null);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [startPoint, setStartPoint] = useState(null);
  const [showMetadata, setShowMetadata] = useState(false);

  // Constants for shapefile processing
  const BATCH_SIZE = 50; // Reduced batch size
  const MAX_FEATURES = 3000; // Reduced max features
  const MAX_FILE_SIZE = 200 * 1024 * 1024; // Reduced to 50MB

  // Handle map instance
  const handleMapReady = (map) => {
    setMapInstance(map);
  };

  // Initialize map
  useEffect(() => {
    // Remove HERE Maps initialization
    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, []);

  // Helper function to read files
  const readFileAsArrayBuffer = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const readTextFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  // Handle shapefile upload
  const handleFileUpload = async (event) => {
    setLoading(true);
    setError(null);
    setLoadingProgress(0);

    try {
      const files = Array.from(event.target.files);
      if (files.length === 0) return;

      // Check file size
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      if (totalSize > MAX_FILE_SIZE) {
        throw new Error("Total file size exceeds 200MB limit");
      }

      // Categorize files by extension
      const filesByType = {};
      const newFileData = {};

      for (const file of files) {
        const ext = file.name.split(".").pop().toLowerCase();
        if (SUPPORTED_FORMATS[ext]) {
          filesByType[ext] = file;

          // Read file content based on type
          if (["cpg", "prj", "xml"].includes(ext)) {
            const content = await readTextFile(file);
            newFileData[ext] = content;
          } else if (["shp", "dbf", "shx", "sbx"].includes(ext)) {
            const buffer = await readFileAsArrayBuffer(file);
            newFileData[ext] = buffer;
          }
        }
      }

      // Validate required files
      if (!filesByType.shp || !filesByType.dbf) {
        throw new Error("Both .shp and .dbf files are required");
      }

      setFileNames(
        Object.entries(filesByType).map(([ext, file]) => file.name)
      );
      setFileData(newFileData);
      setLoadingProgress(50);

      // Parse shapefile with additional data
      const geoJsonData = await shp.combine([
        shp.parseShp(newFileData.shp),
        shp.parseDbf(newFileData.dbf),
      ]);

      // Add projection if available
      if (newFileData.prj) {
        geoJsonData.projection = newFileData.prj;
      }

      setLoadingProgress(70);

      // Limit the number of features for performance
      if (geoJsonData.features.length > MAX_FEATURES) {
        console.warn(
          `Shapefile contains ${geoJsonData.features.length} features. Limiting to ${MAX_FEATURES} for performance.`
        );
        geoJsonData.features = geoJsonData.features.slice(0, MAX_FEATURES);
      }

      setLoadingProgress(80);
      setShapefileData(geoJsonData);
    } catch (err) {
      console.error("File processing error:", err);
      setError(`Error: ${err.message}`);
      setShapefileData(null);
    } finally {
      setLoading(false);
      const response = await axios.post(`${import.meta.env.VITE_FLASK_URL}/analyze-poi`);
      console.log("Analysis response:", response.data);
      
      if (response.data.error) {
        setError(response.data.error);
      } else {
        // You can use response data to update UI or show results
        console.log(`Analysis complete. Found ${response.data.incorrect_pois} incorrect POIs`);
      }

      const response2 = await axios.post(`${import.meta.env.VITE_FLASK_URL}/validate-poi`);
      console.log("Validation response:", response2.data);

      if (response2.data=='OK') {
        const response3 = await axios.post(`http://localhost:5000/allFeatures`);
        setCorrected(response3.data);

        useEffect(() => {
          if (corrected.length > 0) {
            corrected.forEach((feature) => {
              const marker = L.marker([feature.coordinates[1], feature.coordinates[0]], {
                icon: L.divIcon({
                  className: 'custom-marker',
                  html: `<div class="marker-content">${feature.address}</div>`,
                }),
              }).addTo(mapInstance);
            });
          }
        }, [corrected]);
      }
  };
}

  // Remove specific file
  const removeFile = (indexToRemove) => {
    const newFileNames = fileNames.filter(
      (_, index) => index !== indexToRemove
    );
    setFileNames(newFileNames);

    // If no files left, clear everything
    if (newFileNames.length === 0) {
      clearShapefile();
    }
  };

  // Render shapefile data on the map
  useEffect(() => {
    if (!mapInstance || !shapefileData) return;

    let mounted = true;
    let renderingCancelled = false;
    const featureGroup = L.featureGroup().addTo(mapInstance);

    const createPopupContent = (properties) => {
  if (!properties) return 'No data available';

  return `
    <div style="max-height: 300px; overflow-y: auto; min-width: 200px;">
      <table style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr>
            <th style="padding: 8px; border-bottom: 2px solid #ddd; text-align: left; background-color: #f8f9fa;">Property</th>
            <th style="padding: 8px; border-bottom: 2px solid #ddd; text-align: left; background-color: #f8f9fa;">Value</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(properties)
            .map(([key, value]) => `
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${key}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${value}</td>
              </tr>
            `)
            .join('')}
        </tbody>
      </table>
    </div>
  `;
};

    const renderBatch = async (features, startIndex) => {
  if (!mounted || renderingCancelled) return;

  const batch = features.slice(startIndex, startIndex + BATCH_SIZE);

  // Send the batch to the backend
  await sendFeatureData(batch);

  requestAnimationFrame(() => {
    if (!mounted || renderingCancelled) return;

    batch.forEach((feature) => {
      try {
        // Create popup content for the feature
        const popupContent = createPopupContent(feature.properties);
        
        if (feature.geometry.type === "Polygon" || feature.geometry.type === "MultiPolygon") {
          const coordinates = feature.geometry.type === "Polygon" 
            ? [feature.geometry.coordinates[0]] 
            : feature.geometry.coordinates.map(poly => poly[0]);

          coordinates.forEach((coords) => {
            const simplified = coords.filter((_, index) => index % 5 === 0);

            if (simplified.length > 3) {
              const polygon = L.polygon(simplified, {
                fillColor: "rgba(0, 128, 255, 0.3)",
                color: "rgba(0, 0, 255, 0.6)",
                weight: 1
              }).bindPopup(popupContent);

              // Add hover effects
              polygon.on('mouseover', function(e) {
                this.setStyle({
                  fillColor: 'rgba(255, 128, 0, 0.5)',
                  color: 'rgba(255, 128, 0, 0.8)',
                  weight: 2
                });
              });

              polygon.on('mouseout', function(e) {
                this.setStyle({
                  fillColor: 'rgba(0, 128, 255, 0.3)',
                  color: 'rgba(0, 0, 255, 0.6)',
                  weight: 1
                });
              });

              featureGroup.addLayer(polygon);
            }
          });
        } else if (feature.geometry.type === "LineString" || feature.geometry.type === "MultiLineString") {
          const coordinates = feature.geometry.type === "LineString"
            ? feature.geometry.coordinates
            : feature.geometry.coordinates.flat();

          const simplified = coordinates.filter((_, index) => index % 3 === 0);

          if (simplified.length > 1) {
            const polyline = L.polyline(simplified, {
              color: "rgba(255, 0, 0, 0.6)",
              weight: 2
            }).bindPopup(popupContent);

            // Add hover effects
            polyline.on('mouseover', function(e) {
              this.setStyle({
                color: 'rgba(255, 128, 0, 0.8)',
                weight: 3
              });
            });

            polyline.on('mouseout', function(e) {
              this.setStyle({
                color: 'rgba(255, 0, 0, 0.6)',
                weight: 2
              });
            });

            featureGroup.addLayer(polyline);
          }
        } else if (feature.geometry.type === "Point") {
          const marker = L.circleMarker(
            [feature.geometry.coordinates[1], feature.geometry.coordinates[0]],
            {
              radius: 5,
              fillColor: "rgba(255, 0, 0, 0.8)",
              color: "white",
              weight: 1,
              fillOpacity: 0.8
            }
          ).bindPopup(popupContent);

          // Add hover effects
          marker.on('mouseover', function(e) {
            this.setStyle({
              radius: 7,
              fillColor: 'rgba(255, 128, 0, 0.8)',
              weight: 2
            });
          });

          marker.on('mouseout', function(e) {
            this.setStyle({
              radius: 5,
              fillColor: 'rgba(255, 0, 0, 0.8)',
              weight: 1
            });
          });

          featureGroup.addLayer(marker);
        }
      } catch (e) {
        console.warn("Failed to render feature:", e);
      }
    });

    if (startIndex === 0) {
      setShapefileGroup(featureGroup);
    }

    const progress = Math.min(100, ((startIndex + batch.length) / features.length) * 100);
    setLoadingProgress(80 + progress * 0.2);

    if (mounted && !renderingCancelled && startIndex + BATCH_SIZE < features.length) {
      setTimeout(() => {
        renderBatch(features, startIndex + BATCH_SIZE);
      }, 100);
    } else if (mounted && !renderingCancelled) {
      setLoadingProgress(100);
      setTimeout(() => setLoadingProgress(0), 1000);

      const bounds = featureGroup.getBounds();
      if (bounds.isValid()) {
        mapInstance.fitBounds(bounds);
      }
    }
  });
};

    // Clear previous features
    if (shapefileGroup) {
      shapefileGroup.remove();
    }

    renderBatch(shapefileData.features, 0);
    setShapefileGroup(featureGroup);

    return () => {
      mounted = false;
      renderingCancelled = true;
      if (featureGroup) {
        featureGroup.remove();
      }
    };
  }, [shapefileData, mapInstance]);

  // Toggle traffic layer
  const toggleTraffic = () => {
    if (mapInstance && trafficLayer) {
      if (showTraffic) {
        mapInstance.removeLayer(trafficLayer);
      } else {
        mapInstance.addLayer(trafficLayer);
      }
      setShowTraffic(!showTraffic);
    }
  };

  // Change map style
  const changeMapStyle = (style) => {
    setMapStyle(style);
  };

  // Reset map view
  const resetView = () => {
    if (mapInstance) {
      mapInstance.setView([1.35, 103.81], 12);
    }
  };

  // Clear shapefile data
  const clearShapefile = () => {
    if (shapefileGroup && mapInstance) {
      shapefileGroup.remove();
    }
    setShapefileData(null);
    setFileNames([]);
    setShapefileGroup(null);
    setError(null);

    // Clear the file input value
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Mouse event handlers for rectangle selection
  useEffect(() => {
    if (!mapInstance || !isSelecting) return;

    const handleMouseDown = (e) => {
      setStartPoint(e.latlng);
      setSelectionBounds(null);
    };

    const handleMouseMove = (e) => {
      if (!startPoint) return;
      
      const bounds = L.latLngBounds(startPoint, e.latlng);
      setSelectionBounds(bounds);
    };

    const handleMouseUp = async (e) => {
      if (!startPoint || !shapefileGroup) return;

      const bounds = L.latLngBounds(startPoint, e.latlng);
      
      try {
        // Fetch features from database based on bounds
        const dbFeatures = await fetchFeaturesInBounds(bounds);
        
        // Transform database features to match the expected format
        const features = dbFeatures.map(feature => ({
          type: feature.type,
          properties: {
            ...feature,
            OBJECTID: feature.objectId,
            CUSTOMER_I: feature.customerId,
            // Add other property mappings as needed
          },
          geometry: feature.geometry
        }));

        setSelectedFeatures(features);
        setIsSelecting(false);
        setStartPoint(null);
        setSelectionBounds(null);
      } catch (error) {
        console.error('Error selecting features:', error);
        setError('Failed to fetch features in selection');
      }
    };

    mapInstance.on('mousedown', handleMouseDown);
    mapInstance.on('mousemove', handleMouseMove);
    mapInstance.on('mouseup', handleMouseUp);

    // Disable map drag when selecting
    mapInstance.dragging.disable();
    
    return () => {
      mapInstance.off('mousedown', handleMouseDown);
      mapInstance.off('mousemove', handleMouseMove);
      mapInstance.off('mouseup', handleMouseUp);
      mapInstance.dragging.enable();
    };
  }, [mapInstance, isSelecting, startPoint, shapefileGroup]);

  // Start rectangle selection
  const handleCaptureClick = () => {
    setIsSelecting(true);
    setSelectedFeatures([]);
  };

  // Add this function to handle viewing metadata
  const handleViewMetadata = () => {
    setShowMetadata(true);
  };

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[1.35, 103.81]}
        zoom={12}
        style={mapContainerStyle}
        className="z-0"
      >
        <MapController onMapReady={handleMapReady} />
        <TileLayer
          url={
            mapStyle === "satellite"
              ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
          attribution={
            mapStyle === "satellite"
              ? "&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
              : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }
        />

        {/* Rectangle selection for capturing features */}
        {selectionBounds && (
          <Rectangle
            bounds={selectionBounds}
            pathOptions={{ color: '#0066ff', weight: 1, fillOpacity: 0.2 }}
          />
        )}
      </MapContainer>

      <AnimatePresence>
        {(loading || loadingProgress > 0) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-30"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-slate-900/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl max-w-sm w-full mx-4 border border-slate-700/50"
            >
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-blue-500/30 rounded-full animate-spin border-t-blue-500"></div>
                  <div className="absolute inset-0 w-12 h-12 border-4 border-blue-500/10 rounded-full"></div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-slate-200">Processing</h3>
                  <p className="text-sm text-slate-400">
                    {loadingProgress < 80 ? "Analyzing data..." : "Rendering features..."}
                  </p>
                </div>
              </div>
              {loadingProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-slate-400">
                    <span>Progress</span>
                    <span>{Math.round(loadingProgress)}%</span>
                  </div>
                  <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-teal-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${loadingProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Map Controls Panel */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-xl p-6 rounded-2xl shadow-2xl z-10 min-w-[280px] max-w-[320px] border border-slate-700/50"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-800">
            Map Controls
          </h2>
        </div>

        <div className="space-y-6">
          {/* Map Style Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Map Style</label>
            <select
              className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
              onChange={(e) => changeMapStyle(e.target.value)}
              value={mapStyle}
            >
              <option value="normal">Standard</option>
              <option value="satellite">Satellite</option>
            </select>
          </div>

          {/* File Upload Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Upload Shapefile</label>
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-xs text-gray-600 mb-2 flex flex-wrap gap-1">
                {Object.entries(SUPPORTED_FORMATS).map(([ext, desc]) => (
                  <span key={ext} className="inline-flex items-center px-2 py-1 bg-white/80 rounded-md shadow-sm">
                    .{ext}
                    <span className="ml-1 text-blue-500 cursor-help" title={desc}>ℹ️</span>
                  </span>
                ))}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                accept={Object.keys(SUPPORTED_FORMATS).map((ext) => `.${ext}`).join(",")}
                className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 transition-all"
                disabled={loading}
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Loaded Files List */}
            {fileNames.length > 0 && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Loaded files</span>
                  <button
                    onClick={clearShapefile}
                    className="text-red-500 hover:text-red-600 text-sm font-medium transition-colors"
                  >
                    Clear All
                  </button>
                </div>
                <ul className="space-y-1">
                  {fileNames.map((name, i) => (
                    <li key={i} className="flex justify-between items-center py-1 px-2 rounded hover:bg-gray-100">
                      <span className="truncate text-sm text-gray-600">{name}</span>
                      <button
                        onClick={() => removeFile(i)}
                        className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Remove file"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Control Buttons */}
          <div className="space-y-3">
            <button
              onClick={toggleTraffic}
              className={`w-full px-4 py-2 text-sm font-medium rounded-lg transition-all focus:ring-2 focus:ring-offset-2 ${
                showTraffic
                  ? "bg-green-500 text-white hover:bg-green-600 focus:ring-green-500"
                  : "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500"
              }`}
            >
              {showTraffic ? "Hide Traffic" : "Show Traffic"}
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => mapInstance?.setZoom(mapInstance.getZoom() + 1)}
                className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Zoom In
              </button>
              <button
                onClick={() => mapInstance?.setZoom(mapInstance.getZoom() - 1)}
                className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
                Zoom Out
              </button>
            </div>

            <button
              onClick={resetView}
              className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              Reset View
            </button>

            {/* Capture Region Button */}
            <button
              onClick={handleCaptureClick}
              className={`w-full px-3 py-2 text-sm mb-2 rounded transition-colors ${
                isSelecting
                  ? "bg-blue-600 text-white"
                  : "border border-slate-300 hover:bg-slate-50"
              }`}
            >
              {isSelecting ? "Selecting..." : "Capture Region"}
            </button>

            {/* Selected features info */}
            {selectedFeatures.length > 0 && (
              <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                <div className="font-medium">Selected Features: {selectedFeatures.length}</div>
                <div className="mt-1 text-xs text-gray-600">
                  {Object.entries(
                    selectedFeatures.reduce((acc, f) => ({
                      ...acc,
                      [f.type]: (acc[f.type] || 0) + 1
                    }), {})
                  ).map(([type, count]) => (
                    <div key={type} className="flex justify-between">
                      <span>{type}:</span>
                      <span>{count}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleViewMetadata}
                  className="mt-2 w-full px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                >
                  View Metadata
                </button>
              </div>
            )}

            {/* Metadata Dialog */}
            {showMetadata && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-medium">Selected Features Metadata</h3>
                    <button
                      onClick={() => setShowMetadata(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="p-4 overflow-auto max-h-[calc(80vh-8rem)]">
                    {selectedFeatures.map((feature, index) => (
                      <div key={index} className="mb-4 last:mb-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-sm">
                            {feature.type || 'Unknown Type'}
                          </span>
                          <span className="text-sm text-gray-500">
                            Feature #{index + 1}
                          </span>
                        </div>
                        <div className="bg-gray-50 rounded p-3">
                          <table className="w-full text-sm">
                            <tbody>
                              {Object.entries(feature.properties || {}).map(([key, value]) => (
                                <tr key={key} className="border-b last:border-0">
                                  <td className="py-1 px-2 text-gray-600 font-medium align-top">{key}</td>
                                  <td className="py-1 px-2 text-gray-800 whitespace-pre-wrap">{formatValue(value)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-gray-200">
                    <button
                      onClick={() => setShowMetadata(false)}
                      className="w-full px-4 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Add floating action buttons */}
      <div className="absolute bottom-8 right-8 flex flex-col space-y-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-12 h-12 bg-blue-500 rounded-full shadow-lg flex items-center justify-center text-white"
          onClick={() => mapInstance?.setZoom(mapInstance.getZoom() + 1)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-12 h-12 bg-blue-500 rounded-full shadow-lg flex items-center justify-center text-white"
          onClick={() => mapInstance?.setZoom(mapInstance.getZoom() - 1)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </motion.button>
      </div>
    </div>
  );
};

export default MapWithShapefiles;
