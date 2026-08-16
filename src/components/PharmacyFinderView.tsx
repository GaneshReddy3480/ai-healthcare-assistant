import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  MapPin, 
  Search, 
  Filter, 
  Clock, 
  Phone, 
  Navigation, 
  Store, 
  CheckCircle2, 
  X, 
  Compass,
  LocateFixed,
  AlertCircle
} from 'lucide-react';
import { Pharmacy, Medicine, InventoryItem } from '../types';
import { PharmacyCard } from './PharmacyCard';
import { PharmacyMap } from './PharmacyMap';

interface PharmacyFinderViewProps {
  pharmacies: Pharmacy[];
  inventory: InventoryItem[];
  filterMedicine?: Medicine | null;
  onClearMedicineFilter?: () => void;
}

// Haversine formula to compute great-circle distance between coordinates in km
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

export const PharmacyFinderView: React.FC<PharmacyFinderViewProps> = ({
  pharmacies,
  inventory,
  filterMedicine,
  onClearMedicineFilter
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [filter24x7Only, setFilter24x7Only] = useState(false);
  const [filterOpenNowOnly, setFilterOpenNowOnly] = useState(false);
  const [filterInStockOnly, setFilterInStockOnly] = useState(false);

  // User Geolocation State
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'locating' | 'granted' | 'denied'>('idle');

  // Request browser geolocation
  const handleRequestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      return;
    }

    setIsLocating(true);
    setLocationStatus('locating');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(coords);
        setLocationStatus('granted');
        setIsLocating(false);
      },
      (error) => {
        console.warn('Geolocation access failed or denied by user:', error);
        setLocationStatus('denied');
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  // Automatically request geolocation upon view load
  useEffect(() => {
    handleRequestLocation();
  }, [handleRequestLocation]);

  // Pharmacy stock lookup if searching for a specific medicine
  const pharmacyStockMap = useMemo(() => {
    if (!filterMedicine) return {};
    const map: { [pharmacyId: string]: boolean } = {};
    inventory.forEach(item => {
      if (item.medicine_id === filterMedicine.id) {
        map[item.pharmacy_id] = item.status === 'available' || item.status === 'low_stock';
      }
    });
    return map;
  }, [filterMedicine, inventory]);

  // Process pharmacies with dynamic distances from user location
  const processedPharmacies = useMemo(() => {
    return pharmacies.map(pharm => {
      if (userLocation) {
        const dist = calculateDistanceKm(
          userLocation.lat,
          userLocation.lng,
          pharm.latitude,
          pharm.longitude
        );
        return { ...pharm, distance_km: dist };
      }
      return pharm;
    });
  }, [pharmacies, userLocation]);

  const filteredPharmacies = useMemo(() => {
    const list = processedPharmacies.filter(p => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q || 
        p.name.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q);

      const matches24x7 = !filter24x7Only || p.is_24x7;
      const matchesOpen = !filterOpenNowOnly || p.is_open_now || p.is_24x7;
      const matchesStock = !filterInStockOnly || !filterMedicine || !!pharmacyStockMap[p.id];

      return matchesQuery && matches24x7 && matchesOpen && matchesStock;
    });

    // If user location is active, sort by nearest distance first
    if (userLocation) {
      return [...list].sort((a, b) => (a.distance_km ?? 999) - (b.distance_km ?? 999));
    }

    return list;
  }, [processedPharmacies, searchQuery, filter24x7Only, filterOpenNowOnly, filterInStockOnly, filterMedicine, pharmacyStockMap, userLocation]);

  const handleDirections = (pharmacy: Pharmacy) => {
    const url = userLocation
      ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${pharmacy.latitude},${pharmacy.longitude}`
      : `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-3xl border border-[#DDE8D2] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DDE8D2] text-[#173B2B] text-xs font-bold mb-2">
              <Compass size={14} className="text-[#6B9B63]" />
              <span>Interactive Pharmacy Locator</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#17231D] mb-1">
              Find Verified Pharmacies Nearby
            </h2>
            <p className="text-xs sm:text-sm text-[#69736D] leading-relaxed">
              Locate partner chemist stores, 24/7 dispensaries, and verified pharmacies on Google Maps with real-time stock, turn-by-turn driving routes, and operating hours.
            </p>
          </div>

          {/* Live Geolocation Status & Re-locate Button */}
          <div className="shrink-0">
            {locationStatus === 'granted' && userLocation ? (
              <div className="flex items-center gap-2 bg-[#F7F9F4] border border-[#DDE8D2] px-3.5 py-2 rounded-2xl">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] animate-pulse" />
                <div className="text-xs">
                  <span className="font-bold text-[#17231D] block">Live Location Active</span>
                  <span className="text-[11px] text-[#69736D]">Sorted by nearest to you</span>
                </div>
                <button
                  onClick={handleRequestLocation}
                  disabled={isLocating}
                  title="Refresh location"
                  className="ml-2 p-1 text-[#173B2B] hover:text-[#6B9B63] rounded-lg transition-colors cursor-pointer"
                >
                  <LocateFixed size={15} className={isLocating ? 'animate-spin text-[#6B9B63]' : ''} />
                </button>
              </div>
            ) : locationStatus === 'locating' ? (
              <div className="flex items-center gap-2 bg-[#F7F9F4] border border-[#DDE8D2] px-3.5 py-2 rounded-2xl text-xs text-[#69736D]">
                <LocateFixed size={15} className="animate-spin text-[#6B9B63]" />
                <span>Detecting your location...</span>
              </div>
            ) : (
              <button
                onClick={handleRequestLocation}
                disabled={isLocating}
                className="flex items-center gap-2 bg-[#173B2B] text-white hover:bg-[#173B2B]/90 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <LocateFixed size={14} className={isLocating ? 'animate-spin' : ''} />
                <span>{isLocating ? 'Locating...' : 'Use My Geolocation'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter for active medicine if redirected from medicine card */}
        {filterMedicine && (
          <div className="mt-4 p-3 rounded-2xl bg-[#DDE8D2]/50 border border-[#6B9B63]/40 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#173B2B]" />
              <span>
                Filtering pharmacies carrying: <strong className="text-[#173B2B]">{filterMedicine.name}</strong> ({filterMedicine.strength})
              </span>
            </div>
            {onClearMedicineFilter && (
              <button
                onClick={onClearMedicineFilter}
                className="font-bold text-[#D95C5C] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <X size={14} />
                <span>Show All Pharmacies</span>
              </button>
            )}
          </div>
        )}

        {/* Search and Quick Filters */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#69736D]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pharmacy name, landmark, road..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F7F9F4] border border-[#DDE8D2] text-xs text-[#17231D] focus:outline-none focus:border-[#173B2B]"
            />
          </div>

          <div className="sm:col-span-6 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilterOpenNowOnly(!filterOpenNowOnly)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filterOpenNowOnly
                  ? 'bg-[#173B2B] text-white'
                  : 'bg-[#F7F9F4] text-[#17231D] hover:bg-[#DDE8D2] border border-[#DDE8D2]'
              }`}
            >
              Open Now Only
            </button>

            <button
              onClick={() => setFilter24x7Only(!filter24x7Only)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filter24x7Only
                  ? 'bg-[#173B2B] text-white'
                  : 'bg-[#F7F9F4] text-[#17231D] hover:bg-[#DDE8D2] border border-[#DDE8D2]'
              }`}
            >
              24/7 Chemist
            </button>

            {filterMedicine && (
              <button
                onClick={() => setFilterInStockOnly(!filterInStockOnly)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  filterInStockOnly
                    ? 'bg-[#6B9B63] text-white'
                    : 'bg-[#F7F9F4] text-[#17231D] hover:bg-[#DDE8D2] border border-[#DDE8D2]'
                }`}
              >
                In Stock Only
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Split View: Map + Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Map */}
        <div className="lg:col-span-7 h-[300px] sm:h-[400px] lg:h-[620px] relative lg:sticky lg:top-24">
          <PharmacyMap
            pharmacies={filteredPharmacies}
            selectedPharmacy={selectedPharmacy}
            onSelectPharmacy={(p) => setSelectedPharmacy(p)}
            userLocation={userLocation}
            onLocateMe={handleRequestLocation}
            isLocating={isLocating}
          />
        </div>

        {/* Right Column: Pharmacies List */}
        <div className="lg:col-span-5 space-y-3.5 max-h-none lg:max-h-[620px] overflow-y-auto pr-0 sm:pr-1">
          <div className="flex items-center justify-between text-xs text-[#69736D] px-1 pb-1">
            <span>
              Found <strong>{filteredPharmacies.length}</strong> pharmacies
              {userLocation && <span className="text-[#2563EB] ml-1">· Nearest first</span>}
            </span>
            <span className="text-[11px]">Click a card to focus map pin</span>
          </div>

          {filteredPharmacies.length === 0 ? (
            <div className="text-center py-12 bg-[#FFFFFF] rounded-3xl border border-[#DDE8D2] p-6 text-xs text-[#69736D]">
              <Store size={28} className="mx-auto mb-2 opacity-50" />
              <p className="font-semibold text-[#17231D]">No pharmacies match this filter</p>
              <p className="mt-1">Try resetting the search terms or 24/7 filters.</p>
            </div>
          ) : (
            filteredPharmacies.map((pharm) => (
              <PharmacyCard
                key={pharm.id}
                pharmacy={pharm}
                isSelected={selectedPharmacy?.id === pharm.id}
                onSelect={(p) => setSelectedPharmacy(p)}
                onGetDirections={handleDirections}
                filteredMedicineName={filterMedicine?.name}
                hasStock={filterMedicine ? pharmacyStockMap[pharm.id] : undefined}
              />
            ))
          )}
        </div>

      </div>
    </div>
  );
};

