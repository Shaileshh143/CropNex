'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface BuyerLocation {
  city: string;
  state: string;
  pincode: string;
  isAutoDetected?: boolean;
}

interface LocationContextType {
  buyerLocation: BuyerLocation;
  setBuyerLocation: (loc: BuyerLocation) => void;
  locationModalOpen: boolean;
  setLocationModalOpen: (open: boolean) => void;
  isLocationVerified: boolean;
  setIsLocationVerified: (verified: boolean) => void;
  isDetecting: boolean;
  detectionStatus: string;
  detectionError: string | null;
  requestCurrentLocation: (isMandatoryAuto?: boolean) => Promise<boolean>;
  getTransitEstimate: (farmDistrict: string, farmState?: string) => {
    days: string;
    isInterState: boolean;
    badge: string;
  };
}

const DEFAULT_LOCATION: BuyerLocation = {
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400001',
  isAutoDetected: false,
};

const LocationContext = createContext<LocationContextType>({
  buyerLocation: DEFAULT_LOCATION,
  setBuyerLocation: () => {},
  locationModalOpen: false,
  setLocationModalOpen: () => {},
  isLocationVerified: false,
  setIsLocationVerified: () => {},
  isDetecting: false,
  detectionStatus: '',
  detectionError: null,
  requestCurrentLocation: async () => false,
  getTransitEstimate: () => ({ days: '2-3 Days', isInterState: false, badge: 'Regional Farm' }),
});

// Helper for Indian location approximation based on lat/lon
function approximateIndianLocation(lat: number, lon: number): { city: string; state: string; pincode: string } {
  // Punjab / Chandigarh / Haryana
  if (lat >= 30.0 && lon < 77.0) return { city: 'Ludhiana', state: 'Punjab', pincode: '141001' };
  // Delhi NCR
  if (lat >= 28.2 && lat <= 29.2 && lon >= 76.7 && lon <= 77.8) return { city: 'Delhi / NCR', state: 'Delhi', pincode: '110001' };
  // Rajasthan (Jaipur)
  if (lat >= 26.0 && lat < 28.0 && lon < 76.5) return { city: 'Jaipur', state: 'Rajasthan', pincode: '302001' };
  // Uttar Pradesh (Lucknow / Kanpur)
  if (lat >= 26.0 && lat <= 27.5 && lon >= 80.0 && lon < 82.0) return { city: 'Lucknow', state: 'Uttar Pradesh', pincode: '226001' };
  // Uttar Pradesh (Varanasi / East UP)
  if (lat >= 25.0 && lat <= 26.0 && lon >= 82.0 && lon <= 84.0) return { city: 'Varanasi', state: 'Uttar Pradesh', pincode: '221001' };
  // Bihar (Patna)
  if (lat >= 25.0 && lat <= 26.5 && lon > 84.0 && lon <= 86.5) return { city: 'Patna', state: 'Bihar', pincode: '800001' };
  // West Bengal (Kolkata)
  if (lat >= 22.0 && lat <= 23.5 && lon >= 87.5 && lon <= 89.0) return { city: 'Kolkata', state: 'West Bengal', pincode: '700001' };
  // Gujarat (Ahmedabad / Surat)
  if (lat >= 21.0 && lat <= 24.0 && lon < 73.5) return { city: 'Ahmedabad', state: 'Gujarat', pincode: '380001' };
  // Madhya Pradesh (Bhopal / Sehore / Indore)
  if (lat >= 22.0 && lat <= 24.5 && lon >= 75.0 && lon <= 78.5) return { city: 'Bhopal', state: 'Madhya Pradesh', pincode: '462001' };
  // Maharashtra (Mumbai & MMR)
  if (lat >= 18.7 && lat <= 19.5 && lon >= 72.6 && lon <= 73.4) return { city: 'Mumbai', state: 'Maharashtra', pincode: '400001' };
  // Maharashtra (Pune)
  if (lat >= 18.2 && lat < 18.7 && lon >= 73.5 && lon <= 74.5) return { city: 'Pune', state: 'Maharashtra', pincode: '411001' };
  // Maharashtra (Nashik)
  if (lat >= 19.8 && lat <= 20.3 && lon >= 73.6 && lon <= 74.2) return { city: 'Nashik', state: 'Maharashtra', pincode: '422001' };
  // Maharashtra (Nagpur)
  if (lat >= 20.8 && lat <= 21.5 && lon >= 78.8 && lon <= 79.5) return { city: 'Nagpur', state: 'Maharashtra', pincode: '440001' };
  // Telangana (Hyderabad)
  if (lat >= 17.0 && lat <= 17.8 && lon >= 78.0 && lon <= 79.0) return { city: 'Hyderabad', state: 'Telangana', pincode: '500001' };
  // Karnataka (Bengaluru)
  if (lat >= 12.7 && lat <= 13.3 && lon >= 77.3 && lon <= 77.9) return { city: 'Bengaluru', state: 'Karnataka', pincode: '560001' };
  // Tamil Nadu (Chennai)
  if (lat >= 12.8 && lat <= 13.3 && lon >= 80.0 && lon <= 80.4) return { city: 'Chennai', state: 'Tamil Nadu', pincode: '600001' };
  // Kerala (Kochi)
  if (lat >= 9.8 && lat <= 10.3 && lon >= 76.1 && lon <= 76.5) return { city: 'Kochi', state: 'Kerala', pincode: '682001' };
  // General Fallbacks
  if (lat >= 28.0) return { city: 'Delhi / NCR', state: 'Delhi', pincode: '110001' };
  if (lat >= 24.0) return { city: 'Lucknow', state: 'Uttar Pradesh', pincode: '226001' };
  if (lon < 75.0) return { city: 'Mumbai', state: 'Maharashtra', pincode: '400001' };
  if (lon >= 75.0 && lat < 16.0) return { city: 'Bengaluru', state: 'Karnataka', pincode: '560001' };
  return { city: 'Mumbai', state: 'Maharashtra', pincode: '400001' };
}

function getDefaultPincodeForCity(city: string, state: string): string {
  const c = (city || '').toLowerCase();
  if (c.includes('mumbai') || c.includes('thane') || c.includes('navi')) return '400001';
  if (c.includes('pune')) return '411001';
  if (c.includes('delhi')) return '110001';
  if (c.includes('varanasi')) return '221001';
  if (c.includes('lucknow')) return '226001';
  if (c.includes('bengaluru') || c.includes('bangalore')) return '560001';
  if (c.includes('hyderabad')) return '500001';
  if (c.includes('chennai')) return '600001';
  if (c.includes('kolkata')) return '700001';
  if (c.includes('ahmedabad')) return '380001';
  if (c.includes('sehore') || c.includes('bhopal')) return '466001';
  if (c.includes('ludhiana')) return '141001';
  if (c.includes('nashik')) return '422001';
  if (c.includes('nagpur')) return '440001';
  if (c.includes('jaipur')) return '302001';
  if (c.includes('patna')) return '800001';
  if (c.includes('kochi')) return '682001';
  return '400001';
}

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [buyerLocation, setBuyerLocationState] = useState<BuyerLocation>(DEFAULT_LOCATION);
  const [locationModalOpen, setLocationModalOpenState] = useState(false);
  const [isLocationVerifiedState, setIsLocationVerifiedState] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState<string>('');
  const [detectionError, setDetectionError] = useState<string | null>(null);

  // Safe setter for modal open: if location is not verified, cannot bypass/close!
  const setLocationModalOpen = useCallback((open: boolean) => {
    if (!open && !isLocationVerifiedState) {
      // Cannot close if not verified!
      return;
    }
    setLocationModalOpenState(open);
  }, [isLocationVerifiedState]);

  const setIsLocationVerified = useCallback((verified: boolean) => {
    setIsLocationVerifiedState(verified);
    try {
      if (verified) {
        localStorage.setItem('cropnex_buyer_location_verified', 'true');
      } else {
        localStorage.removeItem('cropnex_buyer_location_verified');
      }
    } catch (e) {}
  }, []);

  const setBuyerLocation = useCallback((loc: BuyerLocation) => {
    setBuyerLocationState(loc);
    setIsLocationVerifiedState(true);
    try {
      localStorage.setItem('cropnex_buyer_location', JSON.stringify(loc));
      localStorage.setItem('cropnex_buyer_location_verified', 'true');
    } catch (e) {}
  }, []);

  // Primary Automatic GPS Detection Routine
  const requestCurrentLocation = useCallback(async (isMandatoryAuto: boolean = false): Promise<boolean> => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setDetectionError('Browser does not support GPS Geolocation. Please select your region below.');
      setIsDetecting(false);
      return false;
    }

    setIsDetecting(true);
    setDetectionError(null);
    setDetectionStatus('Detecting your delivery location via GPS & Network...');

    return new Promise<boolean>((resolve) => {
      // Set a fallback timer in case geolocation hangs
      const geoTimeout = setTimeout(async () => {
        // Attempt IP Geolocation as fallback
        try {
          const ipRes = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=en');
          if (ipRes.ok) {
            const ipData = await ipRes.json();
            if (ipData.countryCode === 'IN') {
              const ipCity = ipData.city || ipData.locality || 'Mumbai';
              const ipState = ipData.principalSubdivision || 'Maharashtra';
              const ipPin = ipData.postcode || getDefaultPincodeForCity(ipCity, ipState);
              const autoLoc: BuyerLocation = {
                city: ipCity,
                state: ipState,
                pincode: ipPin,
                isAutoDetected: true,
              };
              setBuyerLocationState(autoLoc);
            }
          }
        } catch (e) {}
      }, 3500);

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          clearTimeout(geoTimeout);
          setDetectionStatus('Resolving accurate district & pincode...');
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;

          let detectedCity = '';
          let detectedState = '';
          let detectedPincode = '';

          // 1. Try BigDataCloud Reverse Geocoding
          try {
            const res = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
            );
            if (res.ok) {
              const data = await res.json();
              detectedCity = data.city || data.locality || (data.localityInfo?.administrative?.[2]?.name) || '';
              detectedState = data.principalSubdivision || '';
              detectedPincode = data.postcode || '';
            }
          } catch (e) {
            // fallback
          }

          // 2. Try Nominatim if city or pincode is missing
          if (!detectedCity || !detectedPincode) {
            try {
              const nomRes = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
                { headers: { 'User-Agent': 'CropNex/2.0' } }
              );
              if (nomRes.ok) {
                const nomData = await nomRes.json();
                if (!detectedCity) {
                  detectedCity = nomData.address?.city || nomData.address?.town || nomData.address?.county || nomData.address?.state_district || '';
                }
                if (!detectedState) {
                  detectedState = nomData.address?.state || '';
                }
                if (!detectedPincode) {
                  detectedPincode = nomData.address?.postcode || '';
                }
              }
            } catch (e) {
              // fallback
            }
          }

          // 3. Coordinate bounds fallback if still empty
          if (!detectedCity || !detectedState) {
            const approx = approximateIndianLocation(lat, lon);
            detectedCity = approx.city;
            detectedState = approx.state;
            if (!detectedPincode) detectedPincode = approx.pincode;
          }

          if (!detectedPincode) {
            detectedPincode = getDefaultPincodeForCity(detectedCity, detectedState);
          }

          const confirmedLoc: BuyerLocation = {
            city: detectedCity || 'Mumbai',
            state: detectedState || 'Maharashtra',
            pincode: detectedPincode || '400001',
            isAutoDetected: true,
          };

          setBuyerLocationState(confirmedLoc);
          setIsLocationVerifiedState(true);
          setIsDetecting(false);
          setDetectionStatus(`📍 Location Auto-Detected: ${confirmedLoc.city}, ${confirmedLoc.state} (${confirmedLoc.pincode})`);

          try {
            localStorage.setItem('cropnex_buyer_location', JSON.stringify(confirmedLoc));
            localStorage.setItem('cropnex_buyer_location_verified', 'true');
          } catch (e) {}

          // Auto-close modal after brief visual confirmation
          setTimeout(() => {
            setLocationModalOpenState(false);
          }, 800);

          resolve(true);
        },
        async (error) => {
          clearTimeout(geoTimeout);
          console.warn('Geolocation access not granted:', error.message);
          setDetectionError('GPS access was denied or unavailable. Please select your region below to continue.');
          setIsDetecting(false);

          // Fast IP Geolocation fallback to prefill fields
          try {
            const ipRes = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=en');
            if (ipRes.ok) {
              const ipData = await ipRes.json();
              if (ipData.countryCode === 'IN') {
                const ipCity = ipData.city || ipData.locality || 'Mumbai';
                const ipState = ipData.principalSubdivision || 'Maharashtra';
                const ipPin = ipData.postcode || getDefaultPincodeForCity(ipCity, ipState);
                setBuyerLocationState((prev) => ({
                  city: ipCity,
                  state: ipState,
                  pincode: ipPin,
                  isAutoDetected: true,
                }));
              }
            }
          } catch (e) {}

          resolve(false);
        },
        { timeout: 7000, enableHighAccuracy: true, maximumAge: 60000 }
      );
    });
  }, []);

  // Initial Mount Check
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cropnex_buyer_location');
      const verified = localStorage.getItem('cropnex_buyer_location_verified');

      if (saved && verified === 'true') {
        const parsed = JSON.parse(saved);
        setBuyerLocationState(parsed);
        setIsLocationVerifiedState(true);
        setLocationModalOpenState(false);
      } else {
        // Location NOT verified! Make modal mandatory and start auto-detection immediately!
        setIsLocationVerifiedState(false);
        setLocationModalOpenState(true);
        requestCurrentLocation(true);
      }
    } catch (e) {
      setIsLocationVerifiedState(false);
      setLocationModalOpenState(true);
      requestCurrentLocation(true);
    }
  }, [requestCurrentLocation]);

  const getTransitEstimate = (farmDistrict: string, farmState: string = 'Maharashtra') => {
    const isSameDistrict =
      buyerLocation.city.toLowerCase().includes(farmDistrict.toLowerCase()) ||
      farmDistrict.toLowerCase().includes(buyerLocation.city.toLowerCase());

    const isSameState =
      buyerLocation.state.toLowerCase() === farmState.toLowerCase();

    if (isSameDistrict) {
      return {
        days: '1 - 2 Days (Local Farm Hub)',
        isInterState: false,
        badge: 'Local Farm Origin (Within District)',
      };
    } else if (isSameState) {
      return {
        days: '2 - 3 Days (Intra-State Corridor)',
        isInterState: false,
        badge: 'Regional Farm Origin',
      };
    } else {
      return {
        days: '4 - 6 Days (Inter-State Farm Freight)',
        isInterState: true,
        badge: `Inter-State Farm (${farmState} to ${buyerLocation.state})`,
      };
    }
  };

  return (
    <LocationContext.Provider
      value={{
        buyerLocation,
        setBuyerLocation,
        locationModalOpen,
        setLocationModalOpen,
        isLocationVerified: isLocationVerifiedState,
        setIsLocationVerified,
        isDetecting,
        detectionStatus,
        detectionError,
        requestCurrentLocation,
        getTransitEstimate,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
