// Source: Google Maps Platform Code Assist
'use client';

import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { MapPin, Search, Check, Navigation, Loader2, Compass } from 'lucide-react';

export interface LocationSuggestion {
  postcode: string;
  area: string;
  borough: string;
  lat: number;
  lng: number;
}

export const LONDON_SUGGESTIONS: LocationSuggestion[] = [
  { postcode: 'EC1M 3HA', area: 'Clerkenwell & Farringdon', borough: 'Islington / City of London', lat: 51.5230, lng: -0.0990 },
  { postcode: 'N7 7JR', area: 'Holloway & Finsbury Park', borough: 'Islington', lat: 51.5619, lng: -0.1078 },
  { postcode: 'N1 9AL', area: 'Highbury & Islington', borough: 'Islington', lat: 51.5380, lng: -0.1020 },
  { postcode: 'E1 6AN', area: 'Shoreditch & Spitalfields', borough: 'Tower Hamlets', lat: 51.5150, lng: -0.0750 },
  { postcode: 'SW1A 1AA', area: 'Westminster & Victoria', borough: 'City of Westminster', lat: 51.4980, lng: -0.1340 },
  { postcode: 'SE1 9SG', area: 'London Bridge & Southwark', borough: 'Southwark', lat: 51.5040, lng: -0.0860 },
  { postcode: 'W1D 3NE', area: 'Soho & Mayfair', borough: 'Westminster', lat: 51.5130, lng: -0.1320 },
  { postcode: 'NW1 8NH', area: 'Camden Town & Regent\'s Park', borough: 'Camden', lat: 51.5410, lng: -0.1430 }
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

  componentDidCatch(error: Error) {
    console.warn('[Hero Location Maps Boundary] Caught error:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

interface HeroLocationPickerProps {
  value: string;
  onChange: (postcode: string, locationData?: LocationSuggestion) => void;
}

export default function HeroLocationPicker({ value, onChange }: HeroLocationPickerProps) {
  const [inputValue, setInputValue] = useState(value || 'EC1M 3HA');
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationSuggestion>(LONDON_SUGGESTIONS[0]);
  const [hasMapError, setHasMapError] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [gpsErrorMsg, setGpsErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthFailure = () => {
      setHasMapError(true);
    };
    (window as any).gm_authFailure = handleAuthFailure;
  }, []);

  // Dynamic Geocoding function for custom typed postcodes (e.g. N7 7JR, SW11 1AA, etc.)
  const geocodeCustomPostcode = async (rawCode: string) => {
    const clean = rawCode.replace(/\s+/g, '').toUpperCase();
    if (clean.length < 3) return;

    // Check if preset matched
    const preset = LONDON_SUGGESTIONS.find(s => s.postcode.replace(/\s+/g, '').toUpperCase() === clean);
    if (preset) {
      setCurrentLocation(preset);
      return;
    }

    setIsGeocoding(true);
    try {
      const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(clean)}`);
      const data = await res.json();
      setIsGeocoding(false);

      if (data.status === 200 && data.result) {
        const r = data.result;
        const customLoc: LocationSuggestion = {
          postcode: r.postcode,
          area: `${r.admin_ward || r.admin_district} & ${r.region || 'London'}`,
          borough: r.admin_district || 'London',
          lat: r.latitude,
          lng: r.longitude
        };
        setCurrentLocation(customLoc);
        onChange(r.postcode, customLoc);
      }
    } catch (err) {
      setIsGeocoding(false);
    }
  };

  useEffect(() => {
    if (value && value !== inputValue) {
      setInputValue(value);
      geocodeCustomPostcode(value);
    }
  }, [value]);

  // Real-Time HTML5 Browser GPS Location Detection Handler
  const handleDetectRealGpsLocation = () => {
    setGpsErrorMsg(null);
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGpsErrorMsg('Browser geolocation is not supported on your device.');
      return;
    }

    setIsLocatingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          // Reverse geocode lat/lng to exact UK postcode using postcodes.io
          const res = await fetch(`https://api.postcodes.io/postcodes?lat=${lat}&lng=${lng}`);
          const data = await res.json();
          setIsLocatingGps(false);

          if (data.status === 200 && data.result && data.result.length > 0) {
            const r = data.result[0];
            const gpsLoc: LocationSuggestion = {
              postcode: r.postcode,
              area: `${r.admin_ward || r.admin_district} (GPS Real Location)`,
              borough: r.admin_district || 'London',
              lat: lat,
              lng: lng
            };
            setInputValue(r.postcode);
            setCurrentLocation(gpsLoc);
            onChange(r.postcode, gpsLoc);
          } else {
            // Exact coordinates detected
            const gpsLoc: LocationSuggestion = {
              postcode: `${lat.toFixed(3)}, ${lng.toFixed(3)}`,
              area: 'Detected GPS Coordinates',
              borough: 'Live Browser Location',
              lat: lat,
              lng: lng
            };
            setInputValue(`${lat.toFixed(3)}, ${lng.toFixed(3)}`);
            setCurrentLocation(gpsLoc);
            onChange(`${lat.toFixed(3)}, ${lng.toFixed(3)}`, gpsLoc);
          }
        } catch (err: any) {
          setIsLocatingGps(false);
          // Fallback to exact GPS position
          const gpsLoc: LocationSuggestion = {
            postcode: 'GPS Location',
            area: 'Real-Time Device GPS',
            borough: 'London',
            lat: lat,
            lng: lng
          };
          setCurrentLocation(gpsLoc);
          onChange('GPS Location', gpsLoc);
        }
      },
      (error) => {
        setIsLocatingGps(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGpsErrorMsg('GPS location access denied by browser permission settings.');
        } else {
          setGpsErrorMsg('Could not fetch real GPS location. Please enter postcode manually.');
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const filteredSuggestions = LONDON_SUGGESTIONS.filter(
    s => s.postcode.toLowerCase().includes(inputValue.toLowerCase()) ||
         s.area.toLowerCase().includes(inputValue.toLowerCase()) ||
         s.borough.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleSelectSuggestion = (suggestion: LocationSuggestion) => {
    setInputValue(suggestion.postcode);
    setCurrentLocation(suggestion);
    setShowDropdown(false);
    onChange(suggestion.postcode, suggestion);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setShowDropdown(true);
    onChange(val);

    geocodeCustomPostcode(val);
  };

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  const renderFallbackMiniMap = () => (
    <div className="h-[170px] w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 text-white p-3.5 flex flex-col justify-between relative shadow-inner">
      <div className="flex items-center justify-between text-[11px] font-extrabold z-10">
        <span className="flex items-center gap-1 text-emerald-400">
          <Navigation className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> {currentLocation.area}
        </span>
        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700 text-[10px] font-mono">
          {currentLocation.postcode}
        </span>
      </div>

      <div className="relative z-10 flex items-center justify-center my-auto">
        <div className="bg-slate-950/90 border border-slate-800 p-3 rounded-2xl shadow-lg flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#ff6b00] flex items-center justify-center text-white font-bold animate-bounce shadow-md">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-xs font-black text-white">{currentLocation.postcode}</div>
            <div className="text-[10px] text-slate-400">{currentLocation.borough} • {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}</div>
          </div>
        </div>
      </div>

      <div className="text-[10px] text-slate-400 z-10 flex items-center justify-between border-t border-slate-800 pt-1.5 font-mono">
        <span>📍 Real Coordinates: {currentLocation.lat.toFixed(3)}, {currentLocation.lng.toFixed(3)}</span>
        <span className="text-emerald-400 font-bold">GPS Active</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Input & Real-Time GPS Detection Button */}
      <div className="relative space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="font-bold text-slate-700 text-xs flex items-center gap-1">
            Postcode Location
            {isGeocoding && <Loader2 className="w-3 h-3 animate-spin text-[#ff6b00]" />}
          </label>

          {/* Real GPS Location Button */}
          <button
            type="button"
            onClick={handleDetectRealGpsLocation}
            disabled={isLocatingGps}
            className="text-[10px] font-extrabold text-[#ff6b00] hover:text-[#e05e00] flex items-center gap-1 bg-orange-50 hover:bg-orange-100 px-2 py-0.5 rounded-lg border border-orange-200 transition-all cursor-pointer disabled:opacity-50"
            title="Detect your real device GPS location"
          >
            {isLocatingGps ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-[#ff6b00]" /> Detecting GPS...
              </>
            ) : (
              <>
                <Compass className="w-3 h-3 text-[#ff6b00]" /> Use Real GPS Location 📍
              </>
            )}
          </button>
        </div>

        {gpsErrorMsg && (
          <div className="text-[10px] text-rose-600 font-bold bg-rose-50 p-1.5 rounded-lg border border-rose-200">
            {gpsErrorMsg}
          </div>
        )}

        <div className="relative">
          <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 z-10" />
          <input
            type="text"
            placeholder="Type any postcode (e.g. N7 7JR, SW11 1AA, Shoreditch)"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => setShowDropdown(true)}
            className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold text-xs focus:outline-none focus:border-[#ff6b00] focus:bg-white uppercase tracking-wider font-mono"
          />
          {inputValue && (
            <button
              type="button"
              onClick={() => {
                setInputValue('');
                setShowDropdown(true);
              }}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Real-Time Autocomplete Suggestions Dropdown */}
        {showDropdown && filteredSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100 max-h-56 overflow-y-auto font-sans">
            <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              Suggested London Locations
            </div>
            {filteredSuggestions.map((s) => (
              <div
                key={s.postcode}
                onClick={() => handleSelectSuggestion(s)}
                className={`p-3 text-xs flex items-center justify-between cursor-pointer transition-all hover:bg-orange-50/70 ${
                  currentLocation.postcode === s.postcode ? 'bg-orange-50 text-[#ff6b00] font-bold' : 'text-slate-800 font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 block">{s.postcode}</span>
                    <span className="text-[11px] text-slate-500">{s.area} ({s.borough})</span>
                  </div>
                </div>
                {currentLocation.postcode === s.postcode && (
                  <Check className="w-4 h-4 text-[#ff6b00]" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Location Badge Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {LONDON_SUGGESTIONS.slice(0, 5).map((s) => (
          <button
            key={s.postcode}
            type="button"
            onClick={() => handleSelectSuggestion(s)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
              currentLocation.postcode === s.postcode
                ? 'bg-[#ff6b00] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {s.postcode.split(' ')[0]} ({s.area.split(' ')[0]})
          </button>
        ))}
      </div>

      {/* Interactive Mini Google Map Container with Draggable Marker */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
          <span className="flex items-center gap-1">
            <span>Interactive Location Map:</span>
            <span className="text-[#ff6b00] font-black">{currentLocation.postcode}</span>
          </span>
          <span className="text-[10px] text-[#ff6b00] font-extrabold">Drag pin to adjust location</span>
        </div>

        {hasMapError || !apiKey ? (
          renderFallbackMiniMap()
        ) : (
          <GoogleMapsErrorBoundary fallback={renderFallbackMiniMap()}>
            <APIProvider apiKey={apiKey}>
              <div className="h-[170px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative">
                <Map
                  center={{ lat: currentLocation.lat, lng: currentLocation.lng }}
                  zoom={14}
                  mapId={apiKey ? 'DEMO_MAP_ID' : undefined}
                  internalUsageAttributionIds={["gmp_git_agentskills_v1"]}
                  gestureHandling="greedy"
                  disableDefaultUI={true}
                  className="w-full h-full"
                >
                  <AdvancedMarker
                    position={{ lat: currentLocation.lat, lng: currentLocation.lng }}
                    draggable={true}
                    onDragEnd={async (e) => {
                      if (e.latLng) {
                        const newLat = e.latLng.lat();
                        const newLng = e.latLng.lng();
                        try {
                          const res = await fetch(`https://api.postcodes.io/postcodes?lat=${newLat}&lng=${newLng}`);
                          const data = await res.json();
                          if (data.status === 200 && data.result && data.result.length > 0) {
                            const r = data.result[0];
                            const dragLoc: LocationSuggestion = {
                              postcode: r.postcode,
                              area: `${r.admin_ward || r.admin_district} (Dragged Location)`,
                              borough: r.admin_district || 'London',
                              lat: newLat,
                              lng: newLng
                            };
                            setInputValue(r.postcode);
                            setCurrentLocation(dragLoc);
                            onChange(r.postcode, dragLoc);
                          }
                        } catch (err) {
                          // Dragged position
                          const dragLoc: LocationSuggestion = {
                            postcode: `${newLat.toFixed(3)}, ${newLng.toFixed(3)}`,
                            area: 'Custom Pin Location',
                            borough: 'London',
                            lat: newLat,
                            lng: newLng
                          };
                          setCurrentLocation(dragLoc);
                          onChange(`${newLat.toFixed(3)}, ${newLng.toFixed(3)}`, dragLoc);
                        }
                      }
                    }}
                  >
                    <div className="group relative cursor-grab active:cursor-grabbing">
                      <div className="w-9 h-9 rounded-full bg-[#ff6b00] border-2 border-white shadow-xl flex items-center justify-center text-white animate-pulse">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md whitespace-nowrap shadow-md">
                        {currentLocation.postcode} (Drag Pin)
                      </div>
                    </div>
                  </AdvancedMarker>
                </Map>
                <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-xs px-2 py-0.5 rounded-md text-[9px] font-bold text-white pointer-events-none">
                  📍 {currentLocation.area}
                </div>
              </div>
            </APIProvider>
          </GoogleMapsErrorBoundary>
        )}
      </div>
    </div>
  );
}
