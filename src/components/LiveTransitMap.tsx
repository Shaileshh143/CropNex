'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Truck,
  MapPin,
  Zap,
  Navigation,
  Layers,
  Thermometer,
  ShieldCheck,
  Compass,
} from 'lucide-react';

interface Hub {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  crops: string;
  capacity: string;
  evCharging: string;
  time: string;
  status: 'Completed' | 'In-Transit' | 'Scheduled' | 'Destination';
}

const HUBS: Hub[] = [
  {
    id: 'hub-1',
    name: 'Pimpalgaon Baswant Farm-Gate Hub',
    location: 'Nashik, Maharashtra',
    lat: 20.1706,
    lng: 73.9859,
    crops: 'Grade A+ Tomatoes, Capsicum',
    capacity: '45 Tonnes/day',
    evCharging: 'Active (50 kW DC Fast)',
    time: '06:00 AM',
    status: 'Completed',
  },
  {
    id: 'hub-2',
    name: 'Lasalgaon Mandi Hub',
    location: 'Nashik, Maharashtra',
    lat: 20.1455,
    lng: 74.2285,
    crops: 'Garwa Red Onions',
    capacity: '120 Tonnes/day',
    evCharging: 'Active (Fast Charger)',
    time: '07:15 AM',
    status: 'Completed',
  },
  {
    id: 'hub-3',
    name: 'Sangamner Cross-Dock Hub',
    location: 'Ahmednagar, Maharashtra',
    lat: 19.5771,
    lng: 74.2155,
    crops: 'Salem Turmeric & Dairy',
    capacity: '60 Tonnes/day',
    evCharging: 'Active (Solar Powered)',
    time: '08:45 AM',
    status: 'In-Transit',
  },
  {
    id: 'hub-4',
    name: 'Narayangaon Polyhouse Hub',
    location: 'Pune Rural, Maharashtra',
    lat: 19.1171,
    lng: 73.9789,
    crops: 'Green Grapes, Exotics, Pulses',
    capacity: '35 Tonnes/day',
    evCharging: 'Active',
    time: '10:00 AM',
    status: 'Scheduled',
  },
  {
    id: 'dest-1',
    name: 'Pune Metropolitan APMC Terminal',
    location: 'Market Yard, Pune',
    lat: 18.4904,
    lng: 73.8687,
    crops: 'Final Delivery & Wholesale Distribution',
    capacity: 'Bulk Cold Receiver',
    evCharging: 'Central Charging Grid',
    time: '11:30 AM',
    status: 'Destination',
  },
];

const ROUTE_COORDINATES = [
  { lat: 20.1706, lng: 73.9859 }, // Pimpalgaon
  { lat: 20.1455, lng: 74.2285 }, // Lasalgaon
  { lat: 19.9975, lng: 73.7898 }, // Nashik City Bypass
  { lat: 19.5771, lng: 74.2155 }, // Sangamner
  { lat: 19.3400, lng: 74.1200 }, // Alephata Junction
  { lat: 19.1171, lng: 73.9789 }, // Narayangaon
  { lat: 18.8500, lng: 73.8800 }, // Chakan Auto Corridor
  { lat: 18.5204, lng: 73.8567 }, // Pune Entrance
  { lat: 18.4904, lng: 73.8687 }, // Market Yard Terminal
];

interface LiveTransitMapProps {
  isOptimized?: boolean;
  onSelectHub?: (hubName: string) => void;
}

export default function LiveTransitMap({ isOptimized = true, onSelectHub }: LiveTransitMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [activeHub, setActiveHub] = useState<Hub>(HUBS[2]); // Default Sangamner
  const [truckStep, setTruckStep] = useState<number>(3); // currently between Sangamner & Narayangaon

  // Leaflet map instance ref
  const leafletMapRef = useRef<any>(null);
  const leafletMarkersRef = useRef<any[]>([]);
  const leafletPolylineRef = useRef<any>(null);
  const leafletTruckMarkerRef = useRef<any>(null);

  // Animate truck position along the corridor
  useEffect(() => {
    const interval = setInterval(() => {
      setTruckStep((prev) => {
        const next = prev + 0.05;
        return next >= ROUTE_COORDINATES.length - 1 ? 0 : next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Compute interpolated truck position
  const currentCoordIndex = Math.floor(truckStep);
  const nextCoordIndex = Math.min(currentCoordIndex + 1, ROUTE_COORDINATES.length - 1);
  const progressRatio = truckStep - currentCoordIndex;

  const currentTruckPos = {
    lat:
      ROUTE_COORDINATES[currentCoordIndex].lat +
      (ROUTE_COORDINATES[nextCoordIndex].lat - ROUTE_COORDINATES[currentCoordIndex].lat) * progressRatio,
    lng:
      ROUTE_COORDINATES[currentCoordIndex].lng +
      (ROUTE_COORDINATES[nextCoordIndex].lng - ROUTE_COORDINATES[currentCoordIndex].lng) * progressRatio,
  };

  // Initialize Leaflet Interactive Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    let isSubscribed = true;

    async function initLeaflet() {
      try {
        const L = (await import('leaflet')).default;
        if (!isSubscribed || !mapContainerRef.current) return;

        // Cleanup existing leaflet instance if any
        if (leafletMapRef.current) {
          leafletMapRef.current.remove();
          leafletMapRef.current = null;
        }

        // Add Leaflet CSS dynamically if not present
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        const map = L.map(mapContainerRef.current, {
          center: [19.55, 74.05],
          zoom: 9,
          zoomControl: true,
        });
        leafletMapRef.current = map;

        // Tile layer (Clean Street View)
        const streetTiles = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        L.tileLayer(streetTiles, {
          attribution: '© OpenStreetMap contributors | CropNex Telematics',
          maxZoom: 18,
        }).addTo(map);

        // Draw Route Polyline
        const latLngs: [number, number][] = ROUTE_COORDINATES.map((c) => [c.lat, c.lng] as [number, number]);
        const polyline = L.polyline(latLngs, {
          color: isOptimized ? '#059669' : '#dc2626',
          weight: 5,
          opacity: 0.85,
          dashArray: isOptimized ? undefined : '6, 8',
        }).addTo(map);
        leafletPolylineRef.current = polyline;

        // Add Hub Markers
        leafletMarkersRef.current = HUBS.map((hub) => {
          const color =
            hub.status === 'Destination' ? '#2563eb' : hub.status === 'Completed' ? '#059669' : '#f59e0b';

          const hubIcon = L.divIcon({
            className: 'cropnex-hub-pin',
            html: `
              <div style="background: ${color}; width: 22px; height: 22px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
                <div style="background: white; width: 6px; height: 6px; border-radius: 50%;"></div>
              </div>
            `,
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          });

          const marker = L.marker([hub.lat, hub.lng], { icon: hubIcon }).addTo(map);

          marker.bindPopup(`
            <div style="font-family: inherit; padding: 4px; max-width: 220px; color: #111827;">
              <h4 style="font-weight: 800; font-size: 13px; margin: 0 0 4px 0; color: #065f46;">${hub.name}</h4>
              <p style="font-size: 11px; margin: 0 0 4px 0; color: #4b5563;">${hub.location}</p>
              <p style="font-size: 11px; margin: 0; font-weight: 700; color: #059669;">Produce: ${hub.crops}</p>
              <div style="margin-top: 6px; font-size: 10px; background: #ecfdf5; padding: 4px 8px; border-radius: 6px; font-weight: 700; color: #047857;">
                ⚡ ${hub.evCharging}
              </div>
            </div>
          `);

          marker.on('click', () => {
            setActiveHub(hub);
            if (onSelectHub) onSelectHub(hub.name);
          });

          return marker;
        });

        // Add Live Animated Truck Marker
        const truckIcon = L.divIcon({
          className: 'cropnex-truck-pin',
          html: `
            <div style="background: #047857; color: white; padding: 5px 8px; border-radius: 12px; font-size: 11px; font-weight: 800; box-shadow: 0 4px 12px rgba(4,120,87,0.5); border: 2px solid white; display: flex; items-center; gap: 4px; white-space: nowrap;">
              🚛 <span>58 km/h</span>
            </div>
          `,
          iconSize: [84, 30],
          iconAnchor: [42, 15],
        });

        const truckMarker = L.marker([currentTruckPos.lat, currentTruckPos.lng], {
          icon: truckIcon,
          zIndexOffset: 1000,
        }).addTo(map);
        leafletTruckMarkerRef.current = truckMarker;
      } catch (err) {
        console.error('[CropNex Maps] Leaflet init error:', err);
      }
    }

    initLeaflet();

    return () => {
      isSubscribed = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [isOptimized]);

  // Update Leaflet Truck Marker Live Position
  useEffect(() => {
    if (leafletTruckMarkerRef.current) {
      leafletTruckMarkerRef.current.setLatLng([currentTruckPos.lat, currentTruckPos.lng]);
    }
  }, [currentTruckPos.lat, currentTruckPos.lng]);

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-md overflow-hidden space-y-4">
      {/* Top Map Header & Controls */}
      <div className="p-4 sm:p-6 pb-2 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700">
              Live GPS Transit Telematics
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Interactive Street Map
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-gray-900 mt-1 flex items-center gap-2">
            <span>Nashik – Pune – Mumbai Agri-Corridor Route</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time farm-gate pickups, EV recharge waypoints, and temperature-controlled reefer fleet.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => {
              if (leafletMapRef.current) {
                leafletMapRef.current.setView([currentTruckPos.lat, currentTruckPos.lng], 12);
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition border border-emerald-200 shadow-sm"
          >
            <Compass className="w-4 h-4 text-emerald-600" />
            <span>Center Fleet</span>
          </button>
        </div>
      </div>

      {/* MAP CANVAS CONTAINER */}
      <div className="relative px-4 sm:px-6">
        <div
          ref={mapContainerRef}
          className="w-full h-[400px] sm:h-[460px] rounded-2xl border border-gray-200 overflow-hidden shadow-inner bg-gray-100 z-0"
          style={{ minHeight: '400px' }}
        />

        {/* Floating Telematics Overlay Badge */}
        <div className="absolute top-6 left-8 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-gray-200 shadow-xl max-w-[280px] pointer-events-auto space-y-2">
          <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
            <div className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span className="font-black text-xs text-gray-900">EV Reefer Truck #4</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              On Highway
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-gray-400 block text-[10px]">Speed</span>
              <span className="font-bold text-gray-800">58 km/h</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">Reefer Cold</span>
              <span className="font-bold text-emerald-700 flex items-center gap-0.5">
                <Thermometer className="w-3 h-3 text-emerald-600" /> 4.2°C
              </span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">Current Segment</span>
              <span className="font-bold text-gray-800">NH-60 Highway</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">Destination ETA</span>
              <span className="font-bold text-blue-700">11:30 AM (Pune)</span>
            </div>
          </div>
        </div>

        {/* Legend Overlay at Bottom Right */}
        <div className="absolute bottom-4 right-8 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl border border-gray-200 shadow-md text-[10px] flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span className="text-gray-600 font-bold">Completed Hub</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-gray-600 font-bold">In-Transit Hub</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span className="text-gray-600 font-bold">APMC Terminal</span>
          </div>
        </div>
      </div>

      {/* Selected Hub Details Bar */}
      <div className="p-4 sm:p-6 pt-2">
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-black text-emerald-950">{activeHub.name}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                {activeHub.status}
              </span>
            </div>
            <p className="text-xs text-gray-600">
              Location: <strong>{activeHub.location}</strong> • Produce: <strong>{activeHub.crops}</strong>
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="text-right">
              <span className="text-[10px] text-gray-500 block">Scheduled Window</span>
              <span className="font-black text-gray-900">{activeHub.time}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-gray-500 block">Intake / Capacity</span>
              <span className="font-black text-emerald-800">{activeHub.capacity}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
