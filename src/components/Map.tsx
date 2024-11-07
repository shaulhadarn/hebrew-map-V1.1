import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet-draw';
import { PolygonData } from '../types/polygon';
import { PolygonModal } from './PolygonModal';
import { SavedPolygonsPanel } from './SavedPolygonsPanel';
import { SearchLocation } from './SearchLocation';
import noFlyZones from '../data/noflyzones.json';

// Configure Leaflet Draw measurement formatting
L.drawLocal.draw.handlers.polygon.tooltip.start = 'לחץ כדי להתחיל לצייר פוליגון';
L.drawLocal.draw.handlers.polygon.tooltip.cont = 'לחץ להמשך ציור הפוליגון';
L.drawLocal.draw.handlers.polygon.tooltip.end = 'לחץ על הנקודה הראשונה לסיום';

// Add area measurement formatting
L.GeometryUtil.readableArea = (area: number) => {
  const dunams = area / 10000;
  return dunams.toFixed(2) + ' דונם';
};

const Map = () => {
  const mapRef = useRef<L.Map | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPolygon, setCurrentPolygon] = useState<PolygonData | null>(null);
  const [savedPolygons, setSavedPolygons] = useState<PolygonData[]>([]);
  const [showSavedPanel, setShowSavedPanel] = useState(false);

  // Helper function to check if a point is inside a polygon using ray casting algorithm
  const isPointInPolygon = (point: [number, number], polygon: [number, number][]): boolean => {
    const [x, y] = point;
    let inside = false;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];
      
      const intersect = ((yi > y) !== (yj > y)) &&
        (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      
      if (intersect) {
        inside = !inside;
      }
    }
    
    return inside;
  };

  // Helper function to check if two line segments intersect
  const doLinesIntersect = (
    line1Start: [number, number],
    line1End: [number, number],
    line2Start: [number, number],
    line2End: [number, number]
  ): boolean => {
    const ccw = (A: [number, number], B: [number, number], C: [number, number]): boolean => {
      return (C[1] - A[1]) * (B[0] - A[0]) > (B[1] - A[1]) * (C[0] - A[0]);
    };
    
    return ccw(line1Start, line2Start, line2End) !== ccw(line1End, line2Start, line2End) &&
           ccw(line1Start, line1End, line2Start) !== ccw(line1Start, line1End, line2End);
  };

  // Helper function to check if polygons intersect
  const doesPolygonIntersect = (poly1: [number, number][], poly2: [number, number][]): boolean => {
    // Check if any point of one polygon is inside the other
    for (const point of poly1) {
      if (isPointInPolygon(point, poly2)) return true;
    }
    for (const point of poly2) {
      if (isPointInPolygon(point, poly1)) return true;
    }

    // Check if any lines intersect
    for (let i = 0; i < poly1.length; i++) {
      const j = (i + 1) % poly1.length;
      const line1Start = poly1[i];
      const line1End = poly1[j];

      for (let k = 0; k < poly2.length; k++) {
        const l = (k + 1) % poly2.length;
        const line2Start = poly2[k];
        const line2End = poly2[l];

        if (doLinesIntersect(line1Start, line1End, line2Start, line2End)) {
          return true;
        }
      }
    }

    return false;
  };

  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map('map').setView([31.7683, 35.2137], 8);

      L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      }).addTo(map);

      const drawnItems = new L.FeatureGroup();
      map.addLayer(drawnItems);

      // Add no-fly zones layer
      const noFlyStyle = {
        fillColor: '#ff0000',
        fillOpacity: 0.2,
        color: '#ff0000',
        weight: 2
      };

      L.geoJSON(noFlyZones, {
        style: noFlyStyle,
        onEachFeature: (feature, layer) => {
          if (feature.properties && feature.properties.name) {
            layer.bindPopup(`
              <div dir="rtl" class="text-right">
                <strong>${feature.properties.name}</strong><br/>
                <span class="text-red-600">אזור אסור לטיסה</span>
              </div>
            `);
          }
        }
      }).addTo(map);

      const drawControl = new L.Control.Draw({
        draw: {
          marker: false,
          circle: false,
          circlemarker: false,
          rectangle: false,
          polyline: false,
          polygon: {
            allowIntersection: false,
            showArea: true,
            metric: true,
            feet: false,
          },
        },
        edit: {
          featureGroup: drawnItems,
        },
      });

      map.addControl(drawControl);

      map.on(L.Draw.Event.CREATED, (e: any) => {
        const layer = e.layer;
        drawnItems.addLayer(layer);
        
        const coordinates = layer.getLatLngs()[0].map((latLng: L.LatLng) => [
          latLng.lat,
          latLng.lng,
        ]);
        
        const area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
        const estimatedPrice = area * 0.5;

        // Check for intersections with no-fly zones
        const intersectingZones = noFlyZones.features.filter(zone => {
          const zoneCoords = zone.geometry.coordinates[0].map(coord => [coord[1], coord[0]]) as [number, number][];
          return doesPolygonIntersect(coordinates as [number, number][], zoneCoords);
        });

        const newPolygon: PolygonData = {
          id: Date.now().toString(),
          coordinates,
          area,
          estimatedPrice,
          createdAt: new Date().toISOString(),
          name: `פוליגון ${savedPolygons.length + 1}`,
          intersectingNoFlyZones: intersectingZones.map(zone => zone.properties.name)
        };

        setCurrentPolygon(newPolygon);
        setShowModal(true);
      });

      mapRef.current = map;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [savedPolygons.length]);

  const handleLocationSelect = (lat: number, lon: number) => {
    if (mapRef.current) {
      mapRef.current.setView([lat, lon], 16);
    }
  };

  const handleSavePolygon = (polygon: PolygonData) => {
    setSavedPolygons([...savedPolygons, polygon]);
    setShowModal(false);
  };

  const handleDeletePolygon = (id: string) => {
    setSavedPolygons(savedPolygons.filter((p) => p.id !== id));
  };

  return (
    <div className="relative h-screen">
      <div id="map" className="h-full" />
      
      <button
        onClick={() => setShowSavedPanel(true)}
        className="absolute top-4 right-4 bg-white px-4 py-2 rounded-md shadow-md z-[1000] font-rubik"
      >
        פוליגונים שמורים
      </button>

      <SearchLocation onLocationSelect={handleLocationSelect} />

      {showModal && currentPolygon && (
        <PolygonModal
          polygon={currentPolygon}
          onClose={() => setShowModal(false)}
          onSave={handleSavePolygon}
        />
      )}

      {showSavedPanel && (
        <SavedPolygonsPanel
          polygons={savedPolygons}
          onClose={() => setShowSavedPanel(false)}
          onDelete={handleDeletePolygon}
        />
      )}
    </div>
  );
};

export default Map;