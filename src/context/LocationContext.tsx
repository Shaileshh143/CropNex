'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

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
  requestCurrentLocation: () => Promise<void>;
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
  requestCurrentLocation: async () => {},
  getTransitEstimate: () => ({ days: '2-3 Days', isInterState: false, badge: 'Regional Farm' }),
});

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [buyerLocation, setBuyerLocationState] = useState<BuyerLocation>(DEFAULT_LOCATION);
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cropnex_buyer_location');
      if (saved) {
        setBuyerLocationState(JSON.parse(saved));
      } else {
        // Automatically ask for location permission on first visit
        setLocationModalOpen(true);
      }
    } catch (e) {
      // fallback
    }
  }, []);

  const setBuyerLocation = (loc: BuyerLocation) => {
    setBuyerLocationState(loc);
    try {
      localStorage.setItem('cropnex_buyer_location', JSON.stringify(loc));
    } catch (e) {
      // ignore
    }
  };

  const requestCurrentLocation = async () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      alert('Geolocation is not supported by your browser. Please enter your Pincode.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        // Approximate Indian Region based on Coordinates
        let detectedCity = 'Mumbai';
        let detectedState = 'Maharashtra';
        let detectedPincode = '400001';

        if (lat > 28.0) {
          detectedCity = 'Delhi / NCR';
          detectedState = 'Delhi';
          detectedPincode = '110001';
        } else if (lat > 25.0 && lon > 80.0) {
          detectedCity = 'Varanasi';
          detectedState = 'Uttar Pradesh';
          detectedPincode = '221001';
        } else if (lat > 25.0 && lon <= 80.0) {
          detectedCity = 'Lucknow';
          detectedState = 'Uttar Pradesh';
          detectedPincode = '226001';
        } else if (lat > 18.0 && lat <= 20.0 && lon < 74.0) {
          detectedCity = 'Mumbai';
          detectedState = 'Maharashtra';
          detectedPincode = '400001';
        } else if (lat > 18.0 && lat <= 20.0 && lon >= 74.0) {
          detectedCity = 'Pune';
          detectedState = 'Maharashtra';
          detectedPincode = '411001';
        } else if (lat > 12.0 && lat <= 14.0) {
          detectedCity = 'Bengaluru';
          detectedState = 'Karnataka';
          detectedPincode = '560001';
        } else if (lat > 16.0 && lat <= 18.0) {
          detectedCity = 'Hyderabad';
          detectedState = 'Telangana';
          detectedPincode = '500001';
        } else if (lat > 22.0 && lat <= 24.0) {
          detectedCity = 'Ahmedabad';
          detectedState = 'Gujarat';
          detectedPincode = '380001';
        }

        const newLoc: BuyerLocation = {
          city: detectedCity,
          state: detectedState,
          pincode: detectedPincode,
          isAutoDetected: true,
        };
        setBuyerLocation(newLoc);
        setLocationModalOpen(false);
      },
      (error) => {
        console.warn('Geolocation permission denied or timed out:', error.message);
        // Keep modal open to select manually
      },
      { timeout: 8000 }
    );
  };

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
        requestCurrentLocation,
        getTransitEstimate,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
