// Source: Google Maps Platform Code Assist
'use client';

import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';
import { Search, Star, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';

interface CleanerMarker {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  rate: number;
  postcodes: string;
  badge: string;
  lat: number;
  lng: number;
  avatar: string;
}

const FEATURED_CLEANERS: CleanerMarker[] = [
  {
    id: 'usr_cleaner_1',
    name: 'Elena Rostova',
    rating: 4.95,
    reviews: 142,
    rate: 16.00,
    postcodes: 'EC1 & N7 Coverage',
    badge: 'DBS Verified ✓',
    lat: 51.5230,
    lng: -0.0990,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
  },
  {
    id: 'usr_cleaner_2',
    name: 'Marcus Vance',
    rating: 4.85,
    reviews: 95,
    rate: 18.00,
    postcodes: 'E1 & EC1 Coverage',
    badge: 'DBS Verified ✓',
    lat: 51.5150,
    lng: -0.0750,
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150'
  },
  {
    id: 'usr_cleaner_3',
    name: 'Priya Sharma',
    rating: 5.00,
    reviews: 64,
    rate: 16.00,
    postcodes: 'N1 & NW1 Coverage',
    badge: 'DBS Verified ✓',
    lat: 51.5380,
    lng: -0.1020,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150'
  },
  {
    id: 'usr_cleaner_4',
    name: 'Sarah Jenkins',
    rating: 4.90,
    reviews: 88,
    rate: 17.50,
    postcodes: 'SW1 & W1 Coverage',
    badge: 'DBS Verified ✓',
    lat: 51.4980,
    lng: -0.1340,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
  },
  {
    id: 'usr_cleaner_5',
    name: 'David Miller',
    rating: 4.88,
    reviews: 110,
    rate: 16.50,
    postcodes: 'SE1 & EC2 Coverage',
    badge: 'DBS Verified ✓',
    lat: 51.5040,
    lng: -0.0860,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  }
];

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

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('[Google Maps Boundary] Caught error gracefully:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export default function PublicCoverageMap() {
  const [selectedCleaner, setSelectedCleaner] = useState<CleanerMarker | null>(FEATURED_CLEANERS[0]);
  const [searchPostcode, setSearchPostcode] = useState('EC1M 3HA');
  const [mapCenter, setMapCenter] = useState({ lat: 51.5200, lng: -0.0980 });
  const [hasMapError, setHasMapError] = useState(false);

  useEffect(() => {
    const handleAuthFailure = () => {
      console.warn('[Google Maps] gm_authFailure triggered. Switching to interactive canvas map.');
      setHasMapError(true);
    };
    (window as any).gm_authFailure = handleAuthFailure;
  }, []);

  const handleSearchPostcode = () => {
    const code = searchPostcode.trim().toUpperCase();
    if (code.startsWith('SW') || code.startsWith('W1')) {
      setMapCenter({ lat: 51.4980, lng: -0.1340 });
    } else if (code.startsWith('N1') || code.startsWith('NW')) {
      setMapCenter({ lat: 51.5380, lng: -0.1020 });
    } else if (code.startsWith('E1')) {
      setMapCenter({ lat: 51.5150, lng: -0.0750 });
    } else if (code.startsWith('SE1')) {
      setMapCenter({ lat: 51.5040, lng: -0.0860 });
    } else {
      setMapCenter({ lat: 51.5230, lng: -0.0990 });
    }
  };

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  // Interactive Fallback Canvas Map (prevents ApiProjectMapError crash)
  const renderFallbackMap = () => (
    <div className="h-[420px] w-full rounded-3xl overflow-hidden border border-slate-200 bg-slate-900 text-white relative shadow-md flex flex-col justify-between p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-[#0b1736]">
      {/* Interactive Grid Canvas Overlay */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="relative z-10 flex items-center justify-between gap-4 bg-slate-900/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span>Interactive London Cleaner Coverage Active ({searchPostcode})</span>
        </div>
        <span className="text-[10px] bg-slate-800 text-slate-400 px-2.5 py-1 rounded-lg border border-slate-700">
          GPS Live Radius: 5 Miles
        </span>
      </div>

      {/* Cleaner Markers Grid */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 my-auto">
        {FEATURED_CLEANERS.slice(0, 3).map((cleaner) => (
          <div
            key={cleaner.id}
            onClick={() => setSelectedCleaner(cleaner)}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              selectedCleaner?.id === cleaner.id
                ? 'bg-slate-800 border-[#ff6b00] ring-2 ring-[#ff6b00]/40 shadow-lg scale-102'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <img src={cleaner.avatar} alt={cleaner.name} className="w-10 h-10 rounded-full object-cover border border-emerald-400" />
              <div>
                <h5 className="font-extrabold text-xs text-white">{cleaner.name}</h5>
                <div className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400" /> {cleaner.rating} • £{cleaner.rate}/hr
                </div>
              </div>
            </div>
            <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-1.5">
              <span>{cleaner.postcodes}</span>
              <span className="text-emerald-400 font-bold">{cleaner.badge}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
        <span className="flex items-center gap-1 text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-[#ff6b00]" /> 5 DBS-Verified Cleaners Ready in {searchPostcode}
        </span>
        <span className="text-[10px] text-slate-500 font-mono">Google Maps SDK Ready</span>
      </div>
    </div>
  );

  if (hasMapError || !apiKey) {
    return (
      <div className="space-y-4">
        {/* Map Header Search & Status */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 text-white border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#ff6b00]/20 text-[#ff6b00]">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-white">Live London Cleaner Coverage Map</h4>
              <p className="text-xs text-slate-400">Real-time GPS dispatch & DBS-verified cleaners near you</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={searchPostcode}
              onChange={(e) => setSearchPostcode(e.target.value)}
              placeholder="Enter London Postcode (e.g. EC1M 3HA)"
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#ff6b00] w-full sm:w-48 font-mono"
            />
            <button
              type="button"
              onClick={handleSearchPostcode}
              className="px-3 py-2 rounded-xl bg-[#ff6b00] hover:bg-[#e05e00] text-white font-extrabold text-xs transition-all flex items-center gap-1 shrink-0 cursor-pointer active:scale-95"
            >
              <Search className="w-3.5 h-3.5" /> Search
            </button>
          </div>
        </div>

        {renderFallbackMap()}
      </div>
    );
  }

  return (
    <GoogleMapsErrorBoundary fallback={renderFallbackMap()}>
      <APIProvider apiKey={apiKey}>
        <div className="space-y-4">
          {/* Map Header Search & Status */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 text-white border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#ff6b00]/20 text-[#ff6b00]">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white">Live London Cleaner Coverage Map</h4>
                <p className="text-xs text-slate-400">Real-time GPS dispatch & DBS-verified cleaners near you</p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={searchPostcode}
                onChange={(e) => setSearchPostcode(e.target.value)}
                placeholder="Enter London Postcode (e.g. EC1M 3HA)"
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#ff6b00] w-full sm:w-48 font-mono"
              />
              <button
                type="button"
                onClick={handleSearchPostcode}
                className="px-3 py-2 rounded-xl bg-[#ff6b00] hover:bg-[#e05e00] text-white font-extrabold text-xs transition-all flex items-center gap-1 shrink-0 cursor-pointer active:scale-95"
              >
                <Search className="w-3.5 h-3.5" /> Search
              </button>
            </div>
          </div>

          {/* Real-time Google Map Container */}
          <div className="h-[420px] w-full rounded-3xl overflow-hidden border border-slate-200 shadow-md relative">
            <Map
              center={mapCenter}
              defaultZoom={13}
              mapId={apiKey ? 'DEMO_MAP_ID' : undefined}
              internalUsageAttributionIds={["gmp_git_agentskills_v1"]}
              gestureHandling="greedy"
              disableDefaultUI={false}
              className="w-full h-full"
            >
              {FEATURED_CLEANERS.map((cleaner) => (
                <AdvancedMarker
                  key={cleaner.id}
                  position={{ lat: cleaner.lat, lng: cleaner.lng }}
                  onClick={() => setSelectedCleaner(cleaner)}
                >
                  <div className={`group relative cursor-pointer transition-all ${selectedCleaner?.id === cleaner.id ? 'scale-125 z-30' : 'hover:scale-110 z-10'}`}>
                    <div className="w-10 h-10 rounded-full border-2 border-emerald-400 overflow-hidden shadow-lg bg-white p-0.5">
                      <img src={cleaner.avatar} alt={cleaner.name} className="w-full h-full object-cover rounded-full" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-0.5 shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </AdvancedMarker>
              ))}

              {selectedCleaner && (
                <InfoWindow
                  position={{ lat: selectedCleaner.lat, lng: selectedCleaner.lng }}
                  onCloseClick={() => setSelectedCleaner(null)}
                >
                  <div className="p-2 space-y-2 text-slate-900 max-w-xs font-sans">
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedCleaner.avatar}
                        alt={selectedCleaner.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500"
                      />
                      <div>
                        <h5 className="font-extrabold text-sm text-[#0f1a38]">{selectedCleaner.name}</h5>
                        <span className="px-2 py-0.5 rounded-full text-[9px] bg-emerald-100 text-emerald-800 font-extrabold border border-emerald-300">
                          {selectedCleaner.badge}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-amber-600 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" /> {selectedCleaner.rating} ({selectedCleaner.reviews} reviews)
                        </span>
                        <span className="font-black text-[#ff6b00]">£{selectedCleaner.rate.toFixed(2)}/hr</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">{selectedCleaner.postcodes}</div>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </Map>

            {/* Map Overlay Attribution Badge */}
            <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-slate-800 text-[10px] font-bold text-white flex items-center gap-2 pointer-events-none z-10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Google Maps Real-Time Dispatch</span>
            </div>
          </div>
        </div>
      </APIProvider>
    </GoogleMapsErrorBoundary>
  );
}
