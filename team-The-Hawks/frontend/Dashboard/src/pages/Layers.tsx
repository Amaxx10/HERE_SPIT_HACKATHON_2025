import React, { useEffect, useRef, useState } from "react";

// Replace with your actual HERE API key
const HERE_API_KEY = "SBTfsvotsuUczrpslWRvUs5V_wXrhFcwm3eLZjb7HIU";

// Demo locations for fallback
const DEMO_LOCATIONS = {
  "mumbai airport": { lat: 19.0896, lng: 72.8656 },
  "gateway of india": { lat: 18.9220, lng: 72.8347 },
  "mumbai central": { lat: 18.9690, lng: 72.8205 },
  "bandra": { lat: 19.0544, lng: 72.8406 },
  "andheri": { lat: 19.1136, lng: 72.8697 },
  "pune": { lat: 18.5204, lng: 73.8567 },
  "delhi": { lat: 28.6139, lng: 77.2090 },
  "bangalore": { lat: 12.9716, lng: 77.5946 },
  "chennai": { lat: 13.0827, lng: 80.2707 }
};

declare global {
  interface Window {
    H: any;
  }
}

const HereMapsRoute: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const platformRef = useRef<any>(null);
  const mapObjRef = useRef<any>(null);
  const routeLineRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [routeInfo, setRouteInfo] = useState<{distance: string, duration: string, instructions: string[]} | null>(null);

  // Load HERE Maps scripts
  useEffect(() => {
    if (!window.H) {
      loadHereMapsScripts();
    } else {
      initializeMap();
    }
  }, []);

  const loadHereMapsScripts = () => {
    const scripts = [
      "https://js.api.here.com/v3/3.1/mapsjs-core.js",
      "https://js.api.here.com/v3/3.1/mapsjs-service.js",
      "https://js.api.here.com/v3/3.1/mapsjs-ui.js",
      "https://js.api.here.com/v3/3.1/mapsjs-mapevents.js"
    ];

    let scriptsLoaded = 0;
    scripts.forEach((src) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = () => {
        scriptsLoaded++;
        if (scriptsLoaded === scripts.length) {
          setTimeout(initializeMap, 100);
        }
      };
      script.onerror = () => setError("Failed to load HERE Maps scripts");
      document.head.appendChild(script);
    });
  };

  const initializeMap = () => {
    try {
      if (!window.H) {
        setError("HERE Maps library not loaded");
        return;
      }

      platformRef.current = new window.H.service.Platform({
        apikey: HERE_API_KEY,
      });

      const defaultLayers = platformRef.current.createDefaultLayers();

      if (mapRef.current) {
        mapObjRef.current = new window.H.Map(
          mapRef.current,
          defaultLayers.vector.normal.map,
          {
            center: { lat: 19.076, lng: 72.8777 },
            zoom: 10,
            pixelRatio: window.devicePixelRatio || 1,
          }
        );

        new window.H.mapevents.Behavior(new window.H.mapevents.MapEvents(mapObjRef.current));
        window.H.ui.UI.createDefault(mapObjRef.current, defaultLayers);
      }
    } catch (err) {
      setError("Failed to initialize map: " + (err as Error).message);
    }
  };

  // Geocode using REST API
  const geocode = async (query: string): Promise<{ lat: number; lng: number }> => {
    // Check demo locations first
    const normalizedQuery = query.toLowerCase().trim();
    const demoLocation = DEMO_LOCATIONS[normalizedQuery as keyof typeof DEMO_LOCATIONS];
    if (demoLocation) {
      console.log(`Using demo location for "${query}":`, demoLocation);
      return demoLocation;
    }

    // Fuzzy matching for demo locations
    const matchedKey = Object.keys(DEMO_LOCATIONS).find(key => 
      key.includes(normalizedQuery) || normalizedQuery.includes(key)
    );
    if (matchedKey) {
      console.log(`Using fuzzy matched demo location for "${query}":`, DEMO_LOCATIONS[matchedKey as keyof typeof DEMO_LOCATIONS]);
      return DEMO_LOCATIONS[matchedKey as keyof typeof DEMO_LOCATIONS];
    }

    // Use HERE Geocoding API
    try {
      const url = `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(query)}&apiKey=${HERE_API_KEY}`;
      console.log('Geocoding URL:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('Geocoding response for', query, ':', data);
      
      if (!response.ok) {
        const errorMsg = data.error?.description || data.title || `HTTP ${response.status}`;
        throw new Error(`Geocoding API error: ${errorMsg}`);
      }
      
      if (!data.items || data.items.length === 0) {
        throw new Error(`No results found for: ${query}`);
      }
      
      const location = data.items[0].position;
      return { lat: location.lat, lng: location.lng };
    } catch (err) {
      console.error('Geocoding error:', err);
      throw new Error(`Geocoding failed: ${(err as Error).message}`);
    }
  };

  // Get route using REST API
  const getRoute = async (fromCoords: {lat: number, lng: number}, toCoords: {lat: number, lng: number}) => {
    try {
      const url = `https://router.hereapi.com/v8/routes?` + 
        `transportMode=car&` +
        `origin=${fromCoords.lat},${fromCoords.lng}&` +
        `destination=${toCoords.lat},${toCoords.lng}&` +
        `return=polyline,summary,actions&` +
        `apiKey=${HERE_API_KEY}`;
      
      console.log('Routing URL:', url);
      
      const response = await fetch(url);
      
      const data = await response.json();
      console.log('Routing response:', data);
      
      if (!response.ok) {
        const errorMsg = data.error?.description || data.title || `HTTP ${response.status}`;
        throw new Error(`Routing API error: ${errorMsg}`);
      }
      
      if (!data.routes || data.routes.length === 0) {
        throw new Error("No route found between the specified locations");
      }
      
      return data.routes[0];
    } catch (err) {
      console.error('Route calculation error:', err);
      throw new Error(`Route calculation failed: ${(err as Error).message}`);
    }
  };

  const clearMapObjects = () => {
    if (mapObjRef.current) {
      if (routeLineRef.current) {
        mapObjRef.current.removeObject(routeLineRef.current);
        routeLineRef.current = null;
      }
      markersRef.current.forEach(marker => {
        mapObjRef.current.removeObject(marker);
      });
      markersRef.current = [];
    }
  };

  const addMarkers = (fromCoords: {lat: number, lng: number}, toCoords: {lat: number, lng: number}) => {
    if (!mapObjRef.current || !window.H) return;

    const startIcon = new window.H.map.Icon(
      `<svg width="32" height="32" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="14" fill="#10B981" stroke="white" stroke-width="3"/>
        <text x="16" y="21" text-anchor="middle" fill="white" font-size="16" font-weight="bold">A</text>
      </svg>`,
      { size: { w: 32, h: 32 } }
    );

    const endIcon = new window.H.map.Icon(
      `<svg width="32" height="32" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="14" fill="#EF4444" stroke="white" stroke-width="3"/>
        <text x="16" y="21" text-anchor="middle" fill="white" font-size="16" font-weight="bold">B</text>
      </svg>`,
      { size: { w: 32, h: 32 } }
    );

    const startMarker = new window.H.map.Marker(fromCoords, { icon: startIcon });
    const endMarker = new window.H.map.Marker(toCoords, { icon: endIcon });

    mapObjRef.current.addObject(startMarker);
    mapObjRef.current.addObject(endMarker);
    markersRef.current = [startMarker, endMarker];
  };

  const calculateRoute = async () => {
    if (!from.trim() || !to.trim()) {
      setError("Please enter both 'From' and 'To' addresses.");
      return;
    }

    setLoading(true);
    setError("");
    setRouteInfo(null);

    try {
      // Geocode both addresses
      const fromCoords = await geocode(from);
      const toCoords = await geocode(to);

      clearMapObjects();
      addMarkers(fromCoords, toCoords);

      // Get route data
      const route = await getRoute(fromCoords, toCoords);
      
      // Decode polyline and draw route
      if (route.sections && route.sections[0] && route.sections[0].polyline) {
        const lineString = window.H.geo.LineString.fromFlexiblePolyline(route.sections[0].polyline);
        
        routeLineRef.current = new window.H.map.Polyline(lineString, {
          style: { 
            strokeColor: "#3B82F6", 
            lineWidth: 6,
            lineCap: "round",
            lineJoin: "round"
          },
        });

        mapObjRef.current.addObject(routeLineRef.current);

        // Zoom to show entire route
        const bbox = routeLineRef.current.getBoundingBox();
        mapObjRef.current.getViewModel().setLookAtData({
          bounds: bbox,
          padding: 80
        });
      }

      // Extract route information
      const summary = route.sections[0].summary;
      const instructions = route.sections[0].actions?.map((action: any) => 
        action.instruction || action.action || 'Continue'
      ).slice(0, 5) || [];

      console.log('Route summary:', summary);
      console.log('Route instructions:', instructions);

      setRouteInfo({
        distance: `${(summary.length / 1000).toFixed(1)} km`,
        duration: `${Math.round(summary.duration / 60)} min`,
        instructions: instructions
      });

    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      calculateRoute();
    }
  };

  return (
    <div className="h-screen w-screen relative">
      {/* Control Panel */}
      <div className="absolute top-4 left-4 z-[1000] bg-white p-5 rounded-xl shadow-lg w-80 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🗺️ Route Planner</h3>
        
        <div className="space-y-3">
          <input
            type="text"
            placeholder="From address (e.g., Mumbai Airport)"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full p-3 text-sm border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
          />
          
          <input
            type="text"
            placeholder="To address (e.g., Gateway of India)"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full p-3 text-sm border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
          />
          
          <button
            onClick={calculateRoute}
            disabled={loading}
            className={`w-full p-3 font-semibold rounded-lg transition-colors ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
            } text-white`}
          >
            {loading ? "🔍 Finding Route..." : "🚗 Find Best Route"}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            ❌ {error}
          </div>
        )}

        {routeInfo && !error && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-blue-800 font-semibold mb-2">✅ Route Found</div>
            <div className="text-blue-700 text-sm space-y-1">
              <div>📏 Distance: {routeInfo.distance}</div>
              <div>⏱️ Duration: {routeInfo.duration}</div>
              {routeInfo.instructions.length > 0 && (
                <div className="mt-2">
                  <div className="font-medium">Directions:</div>
                  <ul className="text-xs mt-1 space-y-1">
                    {routeInfo.instructions.slice(0, 3).map((instruction, idx) => (
                      <li key={idx} className="truncate">• {instruction}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Demo Mode Notice */}
      <div className="absolute top-4 right-4 z-[1000] bg-blue-50 border border-blue-300 p-3 rounded-lg max-w-xs text-sm text-blue-800">
        <div className="font-semibold">📍 API Integration Active</div>
        <div className="mt-1">Using HERE Maps API for real-time routing and geocoding.</div>
        <div className="mt-2 text-xs">
          <strong>Try:</strong> Mumbai Airport, Gateway of India, Delhi, Pune, Bangalore
        </div>
      </div>

      {/* Map Container */}
      <div
        ref={mapRef}
        className="h-full w-full absolute top-0 left-0 bg-gray-100"
      />
    </div>
  );
};

export default HereMapsRoute;