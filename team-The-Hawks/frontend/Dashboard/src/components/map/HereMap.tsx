
import { useEffect, useRef, useState } from 'react';
import { Card } from "@/components/ui/card";
import { cn } from '@/lib/utils';
import { Loader2, Maximize2, Minimize2, Layers, MapPin } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface HereMapProps {
  className?: string;
  expanded?: boolean;
  onToggleExpand?: () => void;
}

export function HereMap({ className, expanded, onToggleExpand }: HereMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [map, setMap] = useState<any | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showTraffic, setShowTraffic] = useState(false);
  
  // Store references to map objects so we can clean them up when needed
  const mapObjectsRef = useRef<any[]>([]);

  useEffect(() => {
    // Only initialize the map if the ref is available and the HERE API is loaded
    if (!mapRef.current || (window as any).H === undefined) return;

    // Clean up any existing map instances and objects
    if (map) {
      mapObjectsRef.current.forEach(obj => map.removeObject(obj));
      mapObjectsRef.current = [];
      map.dispose();
    }

    // Initialize the platform with API key
    const H = (window as any).H;
    const platform = new H.service.Platform({
      apikey: 'SBTfsvotsuUczrpslWRvUs5V_wXrhFcwm3eLZjb7HIU',
    });

    const defaultLayers = platform.createDefaultLayers();
    
    // Create an instance of the map
    const newMap = new H.Map(
      mapRef.current,
      defaultLayers.vector.normal.map,
      {
        center: { lat: -37.814, lng: 144.9633 }, // San Francisco by default
        zoom: 12,
        pixelRatio: window.devicePixelRatio || 1
      }
    );

    // Add UI controls
    const ui = new H.ui.UI.createDefault(newMap, defaultLayers);
    
    // Enable map interaction (pan, zoom, pinch, etc.)
    const mapEvents = new H.mapevents.MapEvents(newMap);
    new H.mapevents.Behavior(mapEvents);
    
    // Store locations data
    const storeLocations = [
      { lat: 37.7749, lng: -122.4194, name: "Downtown Store", sales: 85000 },
      { lat: 37.7849, lng: -122.4094, name: "Mission District", sales: 62000 },
      { lat: 37.7649, lng: -122.4294, name: "Castro Store", sales: 47000 },
      { lat: 37.7949, lng: -122.3954, name: "SOMA Location", sales: 73000 }
    ];

    // Add store markers
    storeLocations.forEach(store => {
      // Create a marker for each store
      const marker = new H.map.Marker(
        // Use explicit latitude and longitude properties
        { lat: store.lat, lng: store.lng }
      );
      
      // Create info bubble
      const bubble = new H.ui.InfoBubble(
        { lat: store.lat, lng: store.lng },
        {
          content: `<div class="p-2"><h3 class="font-bold">${store.name}</h3><p>Monthly Sales: $${store.sales.toLocaleString()}</p></div>`
        }
      );
      
      // Add click event to show bubble
      marker.addEventListener('tap', () => {
        ui.addBubble(bubble);
      });
      
      // Add marker to map and track it
      newMap.addObject(marker);
      mapObjectsRef.current.push(marker);
    });

    // Add heatmap circles based on sales data
    if (showHeatmap) {
      storeLocations.forEach(store => {
        const intensity = store.sales / 100000; // Normalize to 0-1
        const radius = 500 + (intensity * 1000); // Base radius + sales multiplier
        
        // Create a circle for each store with the proper coordinates
        const heatCircle = new H.map.Circle(
          // Use explicit latitude and longitude properties
          { lat: store.lat, lng: store.lng },
          radius,
          {
            style: {
              fillColor: `rgba(52, 211, 153, ${intensity * 0.6})`,
              strokeColor: '#34D399',
              lineWidth: 2
            }
          }
        );
        newMap.addObject(heatCircle);
        mapObjectsRef.current.push(heatCircle);
      });
    }

    // Add delivery routes
    const deliveryRoutes = [
      [
        { lat: 37.7749, lng: -122.4194 },
        { lat: 37.7849, lng: -122.4094 },
        { lat: 37.7649, lng: -122.4294 }
      ]
    ];
    
    deliveryRoutes.forEach(route => {
      const lineString = new H.geo.LineString();
      
      // Add points to the line string
      route.forEach(point => {
        lineString.pushLatLngAlt(point.lat, point.lng, 0);
      });
      
      const routeLine = new H.map.Polyline(lineString, {
        style: {
          strokeColor: '#F97066',
          lineWidth: 4
        }
      });
      newMap.addObject(routeLine);
      mapObjectsRef.current.push(routeLine);
    });

    setMap(newMap);
    setIsLoading(false);

    // Clean up function
    return () => {
      if (newMap) {
        mapObjectsRef.current.forEach(obj => newMap.removeObject(obj));
        newMap.dispose();
      }
    };
  }, [showHeatmap]); // Re-initialize when showHeatmap changes

  const toggleHeatmap = () => {
    setShowHeatmap(!showHeatmap);
  };

  const toggleTraffic = () => {
    setShowTraffic(!showTraffic);
    console.log('Traffic layer toggled:', !showTraffic);
    // Would implement traffic layer toggle here
  };

  const findNearbyStores = () => {
    if (map) {
      const center = map.getCenter();
      console.log('Finding stores near:', center.lat, center.lng);
      // This would use HERE Places API to find nearby stores
    }
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (map) {
        map.getViewPort().resize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);

  return (
    <Card className={cn("p-0 overflow-hidden relative", className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      )}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          className="bg-background/90 hover:bg-background"
          onClick={onToggleExpand}
        >
          {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className={cn("bg-background/90 hover:bg-background", showHeatmap && "bg-meta-mint text-white")}
          onClick={toggleHeatmap}
        >
          <Layers className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="bg-background/90 hover:bg-background"
          onClick={findNearbyStores}
        >
          <MapPin className="h-4 w-4" />
        </Button>
      </div>
      <div className="h-full" ref={mapRef} />
    </Card>
  );
}
