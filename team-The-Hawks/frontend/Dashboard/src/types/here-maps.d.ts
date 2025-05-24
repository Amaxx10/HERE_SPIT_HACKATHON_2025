
declare namespace H {
  class Map {
    constructor(element: HTMLElement, layer: any, options?: any);
    dispose(): void;
    getViewPort(): any;
    addObject(object: any): void;
  }

  namespace service {
    class Platform {
      constructor(options: { apikey: string });
      createDefaultLayers(): any;
    }
  }

  namespace mapevents {
    class MapEvents {
      constructor(map: Map);
    }
    class Behavior {
      constructor(mapEvents: MapEvents);
    }
  }

  namespace ui {
    class UI {
      static createDefault(map: Map, layers: any): UI;
    }
  }

  namespace map {
    class Marker {
      constructor(coords: { lat: number; lng: number });
    }
    class Circle {
      constructor(coords: { lat: number; lng: number }, radius: number, options?: any);
    }
    class Polyline {
      constructor(lineString: any, options?: any);
    }
  }

  namespace geo {
    class LineString {
      constructor();
      pushPoint(point: { lat: number; lng: number }): void;
    }
  }
}
