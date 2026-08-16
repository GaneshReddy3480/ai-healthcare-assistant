import React, { useState, useEffect, useRef } from 'react';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  Pin, 
  InfoWindow, 
  useMap, 
  useMapsLibrary,
  useAdvancedMarkerRef 
} from '@vis.gl/react-google-maps';
import { Pharmacy } from '../types';
import { KeyRound, Navigation, Phone, Clock, Star, ExternalLink, ShieldCheck, RefreshCw, LocateFixed } from 'lucide-react';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

interface PharmacyMapProps {
  pharmacies: Pharmacy[];
  selectedPharmacy: Pharmacy | null;
  onSelectPharmacy: (pharmacy: Pharmacy) => void;
  userLocation?: { lat: number; lng: number } | null;
  onLocateMe?: () => void;
  isLocating?: boolean;
}

// Sub-component to manage map bounds and route polylines
function MapController({ 
  pharmacies, 
  selectedPharmacy, 
  userLocation,
  activeRouteDestination,
  recenterTrigger
}: { 
  pharmacies: Pharmacy[]; 
  selectedPharmacy: Pharmacy | null; 
  userLocation?: { lat: number; lng: number } | null;
  activeRouteDestination: Pharmacy | null;
  recenterTrigger?: number;
}) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const hasInitializedUserCenter = useRef<boolean>(false);

  // Auto-center on user location when it first loads, or recenter button is pressed
  useEffect(() => {
    if (!map || !userLocation) return;
    map.panTo(userLocation);
    map.setZoom(14);
    hasInitializedUserCenter.current = true;
  }, [map, userLocation, recenterTrigger]);

  // Pan to selected pharmacy or fit all markers
  useEffect(() => {
    if (!map) return;

    if (selectedPharmacy) {
      map.panTo({ lat: selectedPharmacy.latitude, lng: selectedPharmacy.longitude });
      map.setZoom(15);
    } else if (!hasInitializedUserCenter.current && pharmacies.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      pharmacies.forEach((p) => {
        bounds.extend({ lat: p.latitude, lng: p.longitude });
      });
      if (userLocation) {
        bounds.extend(userLocation);
      }
      map.fitBounds(bounds, { top: 40, bottom: 40, left: 40, right: 40 });
    }
  }, [map, selectedPharmacy, pharmacies, userLocation]);

  // Compute and render Routes API polyline when directions are active
  useEffect(() => {
    if (!routesLib || !map) return;

    // Clear existing polylines
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];

    if (!activeRouteDestination) return;

    const origin = userLocation || {
      lat: (pharmacies[0]?.latitude || 12.9716) - 0.015,
      lng: (pharmacies[0]?.longitude || 77.5946) - 0.015,
    };

    const destination = {
      lat: activeRouteDestination.latitude,
      lng: activeRouteDestination.longitude,
    };

    routesLib.Route.computeRoutes({
      origin,
      destination,
      travelMode: 'DRIVING',
      fields: ['path', 'distanceMeters', 'durationMillis', 'viewport'],
    }).then(({ routes }) => {
      if (routes?.[0]) {
        const newPolylines = routes[0].createPolylines();
        newPolylines.forEach((p) => {
          p.setOptions({
            strokeColor: '#173B2B',
            strokeWeight: 5,
            strokeOpacity: 0.85,
          });
          p.setMap(map);
        });
        polylinesRef.current = newPolylines;
        if (routes[0].viewport) {
          map.fitBounds(routes[0].viewport, { top: 60, bottom: 60, left: 60, right: 60 });
        }
      }
    }).catch((err) => {
      console.warn('Routes API computeRoutes fallback:', err);
    });

    return () => {
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
    };
  }, [routesLib, map, activeRouteDestination, userLocation, pharmacies]);

  return null;
}

export const PharmacyMap: React.FC<PharmacyMapProps> = ({
  pharmacies,
  selectedPharmacy,
  onSelectPharmacy,
  userLocation,
  onLocateMe,
  isLocating = false,
}) => {
  const [activeInfoPharmacy, setActiveInfoPharmacy] = useState<Pharmacy | null>(null);
  const [activeRouteDestination, setActiveRouteDestination] = useState<Pharmacy | null>(null);
  const [recenterCounter, setRecenterCounter] = useState(0);
  const [markerRef, marker] = useAdvancedMarkerRef();

  // Sync selected pharmacy with info window
  useEffect(() => {
    if (selectedPharmacy) {
      setActiveInfoPharmacy(selectedPharmacy);
    }
  }, [selectedPharmacy]);

  const handleRecenter = () => {
    if (userLocation) {
      setRecenterCounter((c) => c + 1);
    }
    if (onLocateMe) {
      onLocateMe();
    }
  };

  // Initial default map center (user location, first pharmacy, or Bengaluru default)
  const defaultCenter = userLocation || {
    lat: pharmacies[0]?.latitude || 12.9716,
    lng: pharmacies[0]?.longitude || 77.5946,
  };

  // Google Maps API Key Setup Splash Screen (Constitution Rule 1.C)
  if (!hasValidKey) {
    return (
      <div className="w-full h-full min-h-[360px] md:min-h-[520px] rounded-3xl overflow-hidden border border-[#DDE8D2] bg-[#F7F9F4] flex items-center justify-center p-6 sm:p-8">
        <div className="max-w-md w-full text-center bg-white p-6 sm:p-8 rounded-3xl border border-[#DDE8D2] shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#DDE8D2] flex items-center justify-center text-[#173B2B] mx-auto mb-4">
            <KeyRound size={24} />
          </div>
          <h3 className="text-xl font-bold text-[#17231D] font-heading mb-2">
            Google Maps API Key Required
          </h3>
          <p className="text-xs sm:text-sm text-[#69736D] mb-6 leading-relaxed">
            To view live Google Maps with Advanced Markers and accurate routing, please provide your Google Maps Platform key.
          </p>

          <div className="bg-[#F7F9F4] p-4 rounded-2xl border border-[#DDE8D2] text-left text-xs space-y-2 mb-6">
            <div className="flex items-start gap-2">
              <span className="font-bold text-[#173B2B] min-w-[18px]">1.</span>
              <p className="text-[#17231D]">
                Get an API Key from{' '}
                <a 
                  href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-bold text-[#173B2B] hover:underline inline-flex items-center gap-0.5"
                >
                  Google Cloud Console <ExternalLink size={10} />
                </a>
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-[#173B2B] min-w-[18px]">2.</span>
              <p className="text-[#17231D]">
                Open <strong>Settings</strong> (⚙️ gear icon, top-right corner) → <strong>Secrets</strong>.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-[#173B2B] min-w-[18px]">3.</span>
              <p className="text-[#17231D]">
                Type <code className="bg-white px-1.5 py-0.5 rounded border border-[#DDE8D2] font-mono text-[#173B2B]">GOOGLE_MAPS_PLATFORM_KEY</code> and paste your key.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-[#173B2B] min-w-[18px]">4.</span>
              <p className="text-[#69736D]">
                The app rebuilds automatically after saving your secret.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] font-semibold text-[#69736D]">
            <ShieldCheck size={14} className="text-[#6B9B63]" />
            <span>Secure Cloud API Ingress Ready</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[360px] md:min-h-[520px] rounded-3xl overflow-hidden border border-[#DDE8D2] shadow-sm">
      <APIProvider apiKey={API_KEY} version="weekly">
        <Map
          defaultCenter={defaultCenter}
          defaultZoom={13}
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{ width: '100%', height: '100%' }}
          gestureHandling="greedy"
          disableDefaultUI={false}
          clickableIcons={true}
        >
          {/* Map Bounds & Routes Controller */}
          <MapController 
            pharmacies={pharmacies} 
            selectedPharmacy={selectedPharmacy}
            userLocation={userLocation}
            activeRouteDestination={activeRouteDestination}
            recenterTrigger={recenterCounter}
          />

          {/* User Location Advanced Marker */}
          {userLocation && (
            <AdvancedMarker
              position={userLocation}
              title="Your Current Location"
            >
              <div className="w-5 h-5 rounded-full bg-[#2563EB] border-3 border-white shadow-md flex items-center justify-center animate-pulse" />
            </AdvancedMarker>
          )}

          {/* Verified Pharmacy Advanced Markers */}
          {pharmacies.map((pharm) => {
            const isSelected = selectedPharmacy?.id === pharm.id;
            return (
              <AdvancedMarker
                key={pharm.id}
                position={{ lat: pharm.latitude, lng: pharm.longitude }}
                title={pharm.name}
                onClick={() => {
                  onSelectPharmacy(pharm);
                  setActiveInfoPharmacy(pharm);
                }}
                ref={isSelected ? markerRef : undefined}
                gmpClickable={true}
              >
                <Pin
                  background={isSelected ? '#173B2B' : '#6B9B63'}
                  borderColor="#FFFFFF"
                  glyphColor="#FFFFFF"
                  scale={isSelected ? 1.25 : 1.0}
                />
              </AdvancedMarker>
            );
          })}

          {/* Interactive InfoWindow for selected pharmacy */}
          {activeInfoPharmacy && (
            <InfoWindow
              anchor={marker}
              position={{ lat: activeInfoPharmacy.latitude, lng: activeInfoPharmacy.longitude }}
              onCloseClick={() => setActiveInfoPharmacy(null)}
              headerContent={
                <div className="font-bold text-sm text-[#17231D] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#6B9B63]" />
                  <span>{activeInfoPharmacy.name}</span>
                </div>
              }
            >
              <div className="p-1 space-y-2.5 max-w-[240px] text-xs font-sans text-[#17231D]">
                <p className="text-[#69736D] leading-relaxed">
                  {activeInfoPharmacy.address}
                </p>

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#DDE8D2]/60">
                  <span className="px-2 py-0.5 rounded-full bg-[#DDE8D2] text-[#173B2B] font-bold text-[10px]">
                    {activeInfoPharmacy.is_24x7 ? '24/7 Chemist' : 'Open Now'}
                  </span>
                  <div className="flex items-center gap-1 font-bold text-[#17231D]">
                    <Star size={12} className="text-[#E0A82E] fill-[#E0A82E]" />
                    <span>{activeInfoPharmacy.rating}</span>
                    <span className="text-[#69736D] font-normal">({activeInfoPharmacy.reviews_count})</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <a
                    href={`tel:${activeInfoPharmacy.phone}`}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#173B2B] hover:underline"
                  >
                    <Phone size={12} />
                    <span>{activeInfoPharmacy.phone}</span>
                  </a>

                  <button
                    onClick={() => {
                      setActiveRouteDestination(
                        activeRouteDestination?.id === activeInfoPharmacy.id ? null : activeInfoPharmacy
                      );
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                      activeRouteDestination?.id === activeInfoPharmacy.id
                        ? 'bg-[#173B2B] text-white'
                        : 'bg-[#F7F9F4] text-[#173B2B] hover:bg-[#DDE8D2] border border-[#DDE8D2]'
                    }`}
                  >
                    <Navigation size={11} />
                    <span>{activeRouteDestination?.id === activeInfoPharmacy.id ? 'Hide Route' : 'Directions'}</span>
                  </button>
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>

      {/* Floating Control Overlay */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <button
          onClick={handleRecenter}
          disabled={isLocating}
          title={userLocation ? "Re-center map to my current location" : "Detect my current location"}
          className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#DDE8D2] shadow-xs text-xs font-semibold text-[#173B2B] hover:bg-[#DDE8D2] flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
        >
          <LocateFixed size={14} className={isLocating ? "animate-spin text-[#6B9B63]" : userLocation ? "text-[#2563EB]" : "text-[#173B2B]"} />
          <span>{isLocating ? "Locating..." : userLocation ? "Center on Me" : "Locate Me"}</span>
        </button>
      </div>

      <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#DDE8D2] shadow-xs text-xs font-semibold text-[#173B2B] flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-[#6B9B63] animate-pulse" />
        <span>Google Maps Platform Active</span>
      </div>

      {activeRouteDestination && (
        <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-[#DDE8D2] shadow-md text-xs text-[#17231D] flex items-center gap-2.5">
          <Navigation size={14} className="text-[#173B2B]" />
          <div>
            <span className="font-bold block">Active Driving Route:</span>
            <span className="text-[#69736D] text-[11px]">{activeRouteDestination.name}</span>
          </div>
          <button
            onClick={() => setActiveRouteDestination(null)}
            className="ml-2 text-[11px] font-bold text-[#D95C5C] hover:underline"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
};

