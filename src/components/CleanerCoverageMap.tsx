// Source: Google Maps Platform Code Assist
'use client';

import React, { useEffect, useState, Component, ErrorInfo, ReactNode } from 'react';
import { APIProvider, Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { MapPin, ShieldCheck } from 'lucide-react';

interface CleanerCoverageMapProps {
  postcode: string;
  radiusMiles: number;
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

function CircleOverlay({ center, radiusMeters }: { center: { lat: number; lng: number }; radiusMeters: number }) {
  const map = useMap();

  useEffect(() => {
    if (!map || typeof window === 'undefined' || !(window as any).google?.maps) return;

    const circle = new (window as any).google.maps.Circle({
      strokeColor: '#10b981',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#10b981',
      fillOpacity: 0.15,
      map,
      center,
      radius: radiusMeters,
    });

    return () => {
      circle.setMap(null);
    };
  }, [map, center.lat, center.lng, radiusMeters]);

  return null;
}

export default function CleanerCoverageMap({ postcode, radiusMiles }: CleanerCoverageMapProps) {
  const [center, setCenter] = useState({ lat: 51.5230, lng: -0.0990 });
  const [hasMapError, setHasMapError] = useState(false);

  useEffect(() => {
    const handleAuthFailure = () => {
      setHasMapError(true);
    };
    (window as any).gm_authFailure = handleAuthFailure;
  }, []);

  useEffect(() => {
    const code = postcode.trim().toUpperCase();
    if (code.startsWith('E1')) setCenter({ lat: 51.5150, lng: -0.0750 });
    else if (code.startsWith('N1')) setCenter({ lat: 51.5380, lng: -0.1020 });
    else if (code.startsWith('SW1')) setCenter({ lat: 51.4980, lng: -0.1340 });
    else setCenter({ lat: 51.5230, lng: -0.0990 });
  }, [postcode]);

  const radiusMeters = radiusMiles * 1609.34;
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  const renderFallback = () => (
    <div className="h-[280px] w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 text-white p-5 flex flex-col justify-between relative shadow-sm">
      <div className="flex items-center justify-between text-xs font-bold">
        <span className="flex items-center gap-1.5 text-emerald-400">
          <ShieldCheck className="w-4 h-4" /> Live Base Postcode: {postcode}
        </span>
        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700">
          {radiusMiles} Miles Radius Active
        </span>
      </div>

      <div className="my-auto space-y-2 text-center p-4 bg-slate-950/70 rounded-xl border border-slate-800">
        <div className="text-2xl font-black text-emerald-400 font-mono">
          {(radiusMiles * 1.60934).toFixed(1)} km Coverage Radius
        </div>
        <p className="text-xs text-slate-400">
          Cleaners receive job notifications for all requests within {radiusMiles} miles of {postcode}.
        </p>
      </div>

      <div className="text-[10px] text-slate-500 font-mono text-center">
        GPS Dispatch Radius Engine Active
      </div>
    </div>
  );

  if (hasMapError || !apiKey) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span className="flex items-center gap-1.5 text-emerald-800">
            <MapPin className="w-4 h-4 text-emerald-600" /> Live Service Radius Map ({postcode})
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-extrabold border border-emerald-300">
            {radiusMiles} Miles Radius Active
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
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5 text-emerald-800">
              <MapPin className="w-4 h-4 text-emerald-600" /> Live Service Radius Map ({postcode})
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-extrabold border border-emerald-300">
              {radiusMiles} Miles Radius Active
            </span>
          </div>

          <div className="h-[280px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative">
            <Map
              center={center}
              zoom={12}
              mapId={apiKey ? 'DEMO_MAP_ID' : undefined}
              internalUsageAttributionIds={["gmp_git_agentskills_v1"]}
              gestureHandling="greedy"
              disableDefaultUI={true}
              className="w-full h-full"
            >
              <AdvancedMarker position={center}>
                <div className="w-9 h-9 rounded-full bg-emerald-600 border-2 border-white shadow-lg flex items-center justify-center text-white">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
              </AdvancedMarker>

              <CircleOverlay center={center} radiusMeters={radiusMeters} />
            </Map>

            <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] text-emerald-400 font-extrabold pointer-events-none">
              Radius Coverage: {(radiusMiles * 1.60934).toFixed(1)} km ({radiusMiles} miles)
            </div>
          </div>
        </div>
      </APIProvider>
    </GoogleMapsErrorBoundary>
  );
}
