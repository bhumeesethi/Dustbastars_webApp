// Source: Google Maps Platform Code Assist
'use client';

import React, { useEffect, useState, Component, ErrorInfo, ReactNode } from 'react';
import { APIProvider, Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { Building2, Navigation, UserCheck } from 'lucide-react';

interface LiveJobTrackingMapProps {
  propertyLocation?: { lat: number; lng: number };
  cleanerLocation?: { lat: number; lng: number };
  cleanerName?: string;
  propertyName?: string;
}

class GoogleMapsErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn('[Google Maps Boundary] Caught error:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function PolylineOverlay({ path }: { path: { lat: number; lng: number }[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || typeof window === 'undefined' || !(window as any).google?.maps) return;

    const line = new (window as any).google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: '#ff6b00',
      strokeOpacity: 0.9,
      strokeWeight: 4,
      map,
    });

    return () => {
      line.setMap(null);
    };
  }, [map, path]);

  return null;
}

export default function LiveJobTrackingMap({
  propertyLocation = { lat: 51.5230, lng: -0.0990 },
  cleanerLocation = { lat: 51.5150, lng: -0.0820 },
  cleanerName = 'Elena Rostova',
  propertyName = 'EC1 Penthouse'
}: LiveJobTrackingMapProps) {
  const [hasMapError, setHasMapError] = useState(false);

  useEffect(() => {
    const handleAuthFailure = () => {
      setHasMapError(true);
    };
    (window as any).gm_authFailure = handleAuthFailure;
  }, []);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  const center = {
    lat: (propertyLocation.lat + cleanerLocation.lat) / 2,
    lng: (propertyLocation.lng + cleanerLocation.lng) / 2
  };

  const path = [cleanerLocation, propertyLocation];

  const renderFallback = () => (
    <div className="h-[320px] w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 text-white p-6 flex flex-col justify-between relative shadow-md">
      <div className="flex items-center justify-between text-xs font-bold">
        <span className="flex items-center gap-2 text-emerald-400">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          Live GPS Route Active
        </span>
        <span className="px-2.5 py-1 rounded-full text-[10px] bg-purple-900 text-purple-200 border border-purple-700">
          1.2 miles away • ETA 12 mins
        </span>
      </div>

      <div className="my-auto space-y-3 p-4 bg-slate-900/90 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-white">{cleanerName} (Cleaner)</span>
          </div>
          <span className="text-[#ff6b00] font-black font-mono">En Route ➔</span>
        </div>
        <div className="flex items-center justify-between text-xs border-t border-slate-800 pt-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-white">Destination: {propertyName}</span>
          </div>
          <span className="text-slate-400 font-mono text-[11px]">EC1M 3HA</span>
        </div>
      </div>

      <div className="text-[10px] text-slate-500 font-mono text-center">
        Real-Time GPS Tracking & Live Dispatch
      </div>
    </div>
  );

  if (hasMapError || !apiKey) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
          <span className="flex items-center gap-1.5 text-[#ff6b00]">
            <Navigation className="w-4 h-4 text-[#ff6b00]" /> Live Cleaner Dispatch Tracking
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-800 font-extrabold border border-purple-300">
            1.2 miles away • En Route (12 mins)
          </span>
        </div>
        {renderFallback()}
      </div>
    );
  }

  return (
    <GoogleMapsErrorBoundary fallback={renderFallback()}>
      <APIProvider apiKey={apiKey}>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <span className="flex items-center gap-1.5 text-[#ff6b00]">
              <Navigation className="w-4 h-4 text-[#ff6b00]" /> Live Cleaner Dispatch Tracking
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-800 font-extrabold border border-purple-300">
              1.2 miles away • En Route (12 mins)
            </span>
          </div>

          <div className="h-[320px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-md relative">
            <Map
              center={center}
              zoom={13}
              mapId={apiKey ? 'DEMO_MAP_ID' : undefined}
              internalUsageAttributionIds={["gmp_git_agentskills_v1"]}
              gestureHandling="greedy"
              disableDefaultUI={false}
              className="w-full h-full"
            >
              {/* Customer Property Marker */}
              <AdvancedMarker position={propertyLocation}>
                <div className="group relative cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-[#0f1a38] border-2 border-cyan-400 flex items-center justify-center text-white shadow-xl">
                    <Building2 className="w-5 h-5 text-cyan-300" />
                  </div>
                  <div className="absolute top-11 left-1/2 -translate-x-1/2 bg-[#0f1a38] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md whitespace-nowrap shadow-md">
                    {propertyName}
                  </div>
                </div>
              </AdvancedMarker>

              {/* Cleaner Location Marker */}
              <AdvancedMarker position={cleanerLocation}>
                <div className="group relative cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center text-white shadow-xl animate-bounce">
                    <UserCheck className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute top-11 left-1/2 -translate-x-1/2 bg-emerald-900 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md whitespace-nowrap shadow-md">
                    {cleanerName} (Cleaner)
                  </div>
                </div>
              </AdvancedMarker>

              <PolylineOverlay path={path} />
            </Map>

            <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-xs p-2.5 rounded-xl border border-slate-800 text-white text-[11px] font-bold space-y-1 shadow-lg pointer-events-none">
              <div className="flex items-center gap-2 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Real-Time GPS Active</span>
              </div>
              <div className="text-slate-300 text-[10px]">Destination: {propertyName}</div>
            </div>
          </div>
        </div>
      </APIProvider>
    </GoogleMapsErrorBoundary>
  );
}
