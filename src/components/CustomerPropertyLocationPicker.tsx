// Source: Google Maps Platform Code Assist
'use client';

import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { MapPin, Building2, Check } from 'lucide-react';
import { LONDON_SUGGESTIONS, LocationSuggestion } from './HeroLocationPicker';

interface CustomerPropertyLocationPickerProps {
  selectedPostcode: string;
  onPostcodeChange: (postcode: string) => void;
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
    console.warn('[Customer Location Maps Boundary] Caught error:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export default function CustomerPropertyLocationPicker({
  selectedPostcode,
  onPostcodeChange,
  propertyName = 'EC1 Penthouse'
}: CustomerPropertyLocationPickerProps) {
  const [currentLocation, setCurrentLocation] = useState<LocationSuggestion>(LONDON_SUGGESTIONS[0]);
  const [hasMapError, setHasMapError] = useState(false);

  useEffect(() => {
    const handleAuthFailure = () => {
      setHasMapError(true);
    };
    (window as any).gm_authFailure = handleAuthFailure;
  }, []);

  useEffect(() => {
    const match = LONDON_SUGGESTIONS.find(s => s.postcode.toLowerCase().includes(selectedPostcode.toLowerCase().trim()));
    if (match) {
      setCurrentLocation(match);
    }
  }, [selectedPostcode]);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  const renderFallback = () => (
    <div className="h-[220px] w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 text-white p-4 flex flex-col justify-between relative shadow-md">
      <div className="flex items-center justify-between text-xs font-bold">
        <span className="flex items-center gap-1.5 text-cyan-400">
          <Building2 className="w-4 h-4" /> {propertyName} ({currentLocation.postcode})
        </span>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-cyan-950 text-cyan-200 border border-cyan-700">
          Property Location Verified
        </span>
      </div>

      <div className="my-auto space-y-2 text-center p-3 bg-slate-900/90 rounded-xl border border-slate-800">
        <div className="text-sm font-black text-white">{currentLocation.area}</div>
        <div className="text-xs text-slate-400">{currentLocation.borough} • Postcode: {currentLocation.postcode}</div>
      </div>

      <div className="text-[10px] text-slate-500 font-mono text-center">
        GPS Property Dispatch Selector Active
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-[#0f1a38]" /> Service Property Location & Entrance Pin
        </label>
        <div className="flex items-center gap-1 overflow-x-auto">
          {LONDON_SUGGESTIONS.slice(0, 4).map((s) => (
            <button
              key={s.postcode}
              type="button"
              onClick={() => {
                setCurrentLocation(s);
                onPostcodeChange(s.postcode);
              }}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-all ${
                currentLocation.postcode === s.postcode
                  ? 'bg-[#0f1a38] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {s.postcode.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {hasMapError || !apiKey ? (
        renderFallback()
      ) : (
        <GoogleMapsErrorBoundary fallback={renderFallback()}>
          <APIProvider apiKey={apiKey}>
            <div className="h-[220px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-md relative">
              <Map
                center={{ lat: currentLocation.lat, lng: currentLocation.lng }}
                zoom={14}
                mapId={apiKey ? 'DEMO_MAP_ID' : undefined}
                internalUsageAttributionIds={["gmp_git_agentskills_v1"]}
                gestureHandling="greedy"
                disableDefaultUI={false}
                className="w-full h-full"
              >
                <AdvancedMarker
                  position={{ lat: currentLocation.lat, lng: currentLocation.lng }}
                  draggable={true}
                  onDragEnd={(e) => {
                    if (e.latLng) {
                      const newLat = e.latLng.lat();
                      const newLng = e.latLng.lng();
                      const nearest = LONDON_SUGGESTIONS.reduce((prev, curr) => {
                        const distPrev = Math.hypot(prev.lat - newLat, prev.lng - newLng);
                        const distCurr = Math.hypot(curr.lat - newLat, curr.lng - newLng);
                        return distCurr < distPrev ? curr : prev;
                      });
                      setCurrentLocation(nearest);
                      onPostcodeChange(nearest.postcode);
                    }
                  }}
                >
                  <div className="group relative cursor-grab active:cursor-grabbing">
                    <div className="w-10 h-10 rounded-full bg-[#0f1a38] border-2 border-cyan-400 shadow-xl flex items-center justify-center text-white">
                      <Building2 className="w-5 h-5 text-cyan-300" />
                    </div>
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-[#0f1a38] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md whitespace-nowrap shadow-md">
                      {propertyName} ({currentLocation.postcode})
                    </div>
                  </div>
                </AdvancedMarker>
              </Map>
              <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] text-cyan-300 font-extrabold pointer-events-none">
                {currentLocation.area} ({currentLocation.borough})
              </div>
            </div>
          </APIProvider>
        </GoogleMapsErrorBoundary>
      )}
    </div>
  );
}
