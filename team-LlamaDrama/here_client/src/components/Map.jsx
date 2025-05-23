import { useEffect, useRef, useState } from "react";
import * as shp from "shpjs";

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

  // Add ref for file input to clear it
  const fileInputRef = useRef(null);

  // Constants for shapefile processing
  const BATCH_SIZE = 50; // Reduced batch size
  const MAX_FEATURES = 10000; // Reduced max features
  const MAX_FILE_SIZE = 200 * 1024 * 1024; // Reduced to 200MB

  // Initialize HERE Map
  useEffect(() => {
    const platform = new H.service.Platform({
      apikey: import.meta.env.VITE_HERE_API_KEY,
    });

    const defaultLayers = platform.createDefaultLayers();
    const map = new H.Map(mapRef.current, defaultLayers.vector.normal.map, {
      zoom: 12,
      center: { lat: 1.35, lng: 103.81 },
      pixelRatio: window.devicePixelRatio || 1,
    });

    // Add map behavior and UI
    new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
    H.ui.UI.createDefault(map, defaultLayers);

    // Initialize traffic layer
    const traffic = new H.map.layer.TileLayer(
      new H.map.provider.ImageTileProvider({
        label: "Traffic",
        min: 8,
        max: 20,
        getURL: (col, row, level) => {
          return `https://tiles.traffic.api.here.com/v3/${level}/${col}/${row}/flow/${platform.apikey}`;
        },
      })
    );

    setMapInstance(map);
    setTrafficLayer(traffic);

    return () => {
      if (map) {
        map.dispose();
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

      setFileNames(files.map((file) => file.name));

      // Find required files
      const shpFile = files.find((file) => file.name.endsWith(".shp"));
      const dbfFile = files.find((file) => file.name.endsWith(".dbf"));

      if (!shpFile || !dbfFile) {
        throw new Error("Both .shp and .dbf files are required");
      }

      setLoadingProgress(20);

      // Read files
      const [shpBuffer, dbfBuffer] = await Promise.all([
        readFileAsArrayBuffer(shpFile),
        readFileAsArrayBuffer(dbfFile),
      ]);

      setLoadingProgress(50);

      // Parse shapefile
      const geoJsonData = await shp.combine([
        shp.parseShp(shpBuffer),
        shp.parseDbf(dbfBuffer),
      ]);

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
      console.error("Shapefile processing error:", err);
      setError(`Error: ${err.message}`);
      setShapefileData(null);
    } finally {
      setLoading(false);
      setLoadingProgress(0);
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
    const group = new H.map.Group();

    const renderBatch = async (features, startIndex) => {
      if (!mounted || renderingCancelled) return;

      const batch = features.slice(startIndex, startIndex + BATCH_SIZE);

      // Use requestAnimationFrame for better performance
      requestAnimationFrame(() => {
        if (!mounted || renderingCancelled) return;

        batch.forEach((feature) => {
          try {
            if (
              feature.geometry.type === "Polygon" ||
              feature.geometry.type === "MultiPolygon"
            ) {
              const coordinates =
                feature.geometry.type === "Polygon"
                  ? [feature.geometry.coordinates[0]] // Only use outer ring
                  : feature.geometry.coordinates.map((poly) => poly[0]);

              coordinates.forEach((coords) => {
                // More aggressive simplification for polygons
                const simplified = coords.filter((_, index) => index % 5 === 0);

                if (simplified.length > 3) {
                  // Ensure minimum points for polygon
                  const polygon = new H.map.Polygon(simplified, {
                    style: {
                      fillColor: "rgba(0, 128, 255, 0.3)",
                      strokeColor: "rgba(0, 0, 255, 0.6)",
                      lineWidth: 1,
                    },
                  });
                  group.addObject(polygon);
                }
              });
            } else if (
              feature.geometry.type === "LineString" ||
              feature.geometry.type === "MultiLineString"
            ) {
              const coordinates =
                feature.geometry.type === "LineString"
                  ? feature.geometry.coordinates
                  : feature.geometry.coordinates.flat();

              // More aggressive simplification for lines
              const simplified = coordinates.filter(
                (_, index) => index % 3 === 0
              );

              if (simplified.length > 1) {
                // Ensure minimum points for line
                const lineString = new H.map.Polyline(simplified, {
                  style: {
                    strokeColor: "rgba(255, 0, 0, 0.6)",
                    lineWidth: 2,
                  },
                });
                group.addObject(lineString);
              }
            } else if (feature.geometry.type === "Point") {
              // Get current zoom level for responsive sizing
              const currentZoom = mapInstance.getZoom();
              const baseSize = 4; // Base size at zoom level 10
              const zoomFactor = Math.max(0.5, Math.min(2, currentZoom / 10)); // Scale between 0.5x and 2x
              const dynamicSize = Math.round(baseSize * zoomFactor);
              const radius = Math.max(1.5, dynamicSize / 2);

              // Zoom-responsive icon that scales with zoom level
              const icon = new H.map.Icon(
                `data:image/svg+xml,${encodeURIComponent(`
                  <svg xmlns="http://www.w3.org/2000/svg" width="${dynamicSize}" height="${dynamicSize}" viewBox="0 0 ${dynamicSize} ${dynamicSize}">
                    <circle cx="${dynamicSize / 2}" cy="${
                  dynamicSize / 2
                }" r="${radius}" fill="rgba(255, 0, 0, 0.8)" stroke="rgba(255, 255, 255, 1)" stroke-width="0.8"/>
                  </svg>
                `)}`,
                {
                  size: { w: dynamicSize, h: dynamicSize },
                  anchor: { x: dynamicSize / 2, y: dynamicSize / 2 },
                }
              );

              const marker = new H.map.Marker(
                {
                  lat: feature.geometry.coordinates[1],
                  lng: feature.geometry.coordinates[0],
                },
                { icon: icon }
              );
              group.addObject(marker);
            }
          } catch (e) {
            console.warn("Failed to render feature:", e);
          }
        });

        if (startIndex === 0) {
          // Add group to map on first batch
          mapInstance.addObject(group);
          setShapefileGroup(group);
        }

        // Update loading progress
        const progress = Math.min(
          100,
          ((startIndex + batch.length) / features.length) * 100
        );
        setLoadingProgress(80 + progress * 0.2); // 80-100% for rendering

        // Render next batch with longer delay to prevent hanging
        if (
          mounted &&
          !renderingCancelled &&
          startIndex + BATCH_SIZE < features.length
        ) {
          setTimeout(() => {
            renderBatch(features, startIndex + BATCH_SIZE);
          }, 100); // Increased delay to prevent hanging
        } else if (mounted && !renderingCancelled) {
          // Final batch completed
          setLoadingProgress(100);
          setTimeout(() => setLoadingProgress(0), 1000);

          const bounds = group.getBoundingBox();
          if (bounds) {
            mapInstance.getViewModel().setLookAtData({
              bounds: bounds,
            });
          }
        }
      });
    };

    // Clear previous shapefile data
    if (shapefileGroup) {
      mapInstance.removeObject(shapefileGroup);
    }

    // Start rendering first batch
    renderBatch(shapefileData.features, 0);

    return () => {
      mounted = false;
      renderingCancelled = true;
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
    if (mapInstance) {
      const platform = new H.service.Platform({
        apikey: import.meta.env.VITE_HERE_API_KEY,
      });
      const layers = platform.createDefaultLayers();
      const newStyle =
        style === "satellite"
          ? layers.raster.satellite.map
          : layers.vector.normal.map;
      mapInstance.setBaseLayer(newStyle);
      setMapStyle(style);
    }
  };

  // Reset map view
  const resetView = () => {
    if (mapInstance) {
      mapInstance.setCenter({ lat: 1.35, lng: 103.81 });
      mapInstance.setZoom(12);
    }
  };

  // Clear shapefile data
  const clearShapefile = () => {
    if (shapefileGroup && mapInstance) {
      mapInstance.removeObject(shapefileGroup);
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

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="absolute inset-0 shadow-inner" />

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
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              accept=".shp,.dbf,.prj,.shx,.sbn,.sbx,.xml"
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
        </div>
      </div>
    </div>
  );
};

export default MapWithShapefiles;
