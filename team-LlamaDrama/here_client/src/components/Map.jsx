import { useEffect, useRef, useState } from 'react';

const Map = () => {
  const mapRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [trafficLayer, setTrafficLayer] = useState(null);
  const [showTraffic, setShowTraffic] = useState(false);
  const [mapStyle, setMapStyle] = useState('normal');

  useEffect(() => {
    const platform = new H.service.Platform({
      apikey: import.meta.env.VITE_HERE_API_KEY
    });

    const defaultLayers = platform.createDefaultLayers();
    const map = new H.Map(
      mapRef.current,
      defaultLayers.vector.normal.map,
      {
        zoom: 12,
        center: { lat: 1.35, lng: 103.81},
        pixelRatio: window.devicePixelRatio || 1
      }
    );

    const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
    const ui = H.ui.UI.createDefault(map, defaultLayers);

    // Initialize traffic layer
    const traffic = new H.map.layer.TileLayer(
      new H.map.provider.ImageTileProvider({
        label: "Traffic",
        min: 8,
        max: 20,
        getURL: (col, row, level) => {
          return `https://tiles.traffic.api.here.com/v3/${level}/${col}/${row}/flow/${platform.apikey}`;
        }
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

  const changeMapStyle = (style) => {
    if (mapInstance) {
      const platform = new H.service.Platform({
        apikey: import.meta.env.VITE_HERE_API_KEY
      });
      const layers = platform.createDefaultLayers();
      const newStyle = style === 'satellite' ? layers.raster.satellite.map : layers.vector.normal.map;
      mapInstance.setBaseLayer(newStyle);
      setMapStyle(style);
    }
  };

  const resetView = () => {
    if (mapInstance) {
      mapInstance.setCenter({ lat: 1.35, lng: 103.81 });
      mapInstance.setZoom(12);
    }
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="absolute inset-0 shadow-inner" />
      <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg z-10 min-w-[200px]">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Map Controls</h2>
        <div className="space-y-3">
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
          <button 
            onClick={toggleTraffic}
            className={`w-full px-3 py-2 text-sm rounded transition-colors ${
              showTraffic 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-slate-800 text-white hover:bg-slate-700'
            }`}
          >
            {showTraffic ? 'Hide Traffic' : 'Show Traffic'}
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => mapInstance?.setZoom(mapInstance.getZoom() + 1)}
              className="px-3 py-2 text-sm border border-slate-300 rounded hover:bg-slate-50"
            >
              Zoom In
            </button>
            <button 
              onClick={() => mapInstance?.setZoom(mapInstance.getZoom() - 1)}
              className="px-3 py-2 text-sm border border-slate-300 rounded hover:bg-slate-50"
            >
              Zoom Out
            </button>
          </div>
          <button 
            onClick={resetView}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded hover:bg-slate-50"
          >
            Reset View
          </button>
        </div>
      </div>
    </div>
  );
};

export default Map;
