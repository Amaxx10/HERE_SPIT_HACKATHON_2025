import { useEffect, useRef, useState } from "react";
import * as shp from "shpjs";
import { MapContainer, TileLayer, useMap, Rectangle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

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
    }
  };

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

      {/* Loading Overlay with blur background */}
      {(loading || loadingProgress > 0) && (
        <div className="absolute inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-30">
          <div className="bg-white/90 backdrop-blur-md p-6 rounded-lg shadow-lg max-w-sm w-full mx-4 border border-white/50">
            <div className="flex items-center space-x-3 mb-4">
              <svg
                className="animate-spin h-6 w-6 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="text-lg font-medium text-gray-700">
                Processing shapefile...
              </span>
            </div>
            {loadingProgress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
            )}
            <p className="text-sm text-gray-500 mt-2">
              {loadingProgress < 80
                ? "Parsing files..."
                : "Rendering features..."}
            </p>
          </div>
        </div>
      )}

      {/* Map Controls Panel */}
      <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg z-10 min-w-[200px] max-w-[300px]">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          Map Controls
        </h2>

        <div className="space-y-4">
          {/* Map Style Selector */}
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Map Style</label>
            <select
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded"
              onChange={(e) => changeMapStyle(e.target.value)}
              value={mapStyle}
            >
              <option value="normal">Standard</option>
              <option value="satellite">Satellite</option>
            </select>
          </div>

          {/* Shapefile Upload Section */}
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Upload Shapefile</label>
            <div className="text-xs text-gray-500 mb-2">
              Supported formats:
              {Object.entries(SUPPORTED_FORMATS).map(([ext, desc]) => (
                <span
                  key={ext}
                  className="inline-flex items-center m-1 px-2 py-1 bg-gray-100 rounded"
                >
                  .{ext}
                  <span
                    className="ml-1 text-gray-400"
                    title={desc}
                  >
                    ℹ️
                  </span>
                </span>
              ))}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              accept={Object.keys(SUPPORTED_FORMATS)
                .map((ext) => `.${ext}`)
                .join(",")}
              className="w-full text-sm border border-gray-300 rounded p-1 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              disabled={loading}
            />

            {error && (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            {fileNames.length > 0 && (
              <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Loaded files:</span>
                  <button
                    onClick={clearShapefile}
                    className="text-red-600 hover:text-red-800 text-xs font-medium"
                  >
                    Clear All
                  </button>
                </div>
                <ul className="space-y-1">
                  {fileNames.map((name, i) => (
                    <li key={i} className="flex justify-between items-center">
                      <span className="truncate flex-1">{name}</span>
                      <button
                        onClick={() => removeFile(i)}
                        className="ml-2 text-red-500 hover:text-red-700 text-xs"
                        title="Remove file"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Traffic Toggle */}
          <button
            onClick={toggleTraffic}
            className={`w-full px-3 py-2 text-sm rounded transition-colors ${
              showTraffic
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-slate-800 text-white hover:bg-slate-700"
            }`}
          >
            {showTraffic ? "Hide Traffic" : "Show Traffic"}
          </button>

          {/* Zoom Controls */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => mapInstance?.setZoom(mapInstance.getZoom() + 1)}
              className="px-3 py-2 text-sm border border-slate-300 rounded hover:bg-slate-50 flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Zoom In
            </button>
            <button
              onClick={() => mapInstance?.setZoom(mapInstance.getZoom() - 1)}
              className="px-3 py-2 text-sm border border-slate-300 rounded hover:bg-slate-50 flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 12H4"
                />
              </svg>
              Zoom Out
            </button>
          </div>

          {/* Reset View */}
          <button
            onClick={resetView}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded hover:bg-slate-50 flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
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
    </div>
  );
};

export default MapWithShapefiles;
