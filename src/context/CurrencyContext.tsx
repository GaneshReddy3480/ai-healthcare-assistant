import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  flag: string;
  rateAgainstUSD: number; // 1 USD = X Currency
  decimals: number;
  country: string;
  region: string;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    flag: '🇮🇳',
    rateAgainstUSD: 83.5,
    decimals: 2,
    country: 'India',
    region: 'South Asia'
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    flag: '🇺🇸',
    rateAgainstUSD: 1.0,
    decimals: 2,
    country: 'United States',
    region: 'North America'
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    flag: '🇪🇺',
    rateAgainstUSD: 0.92,
    decimals: 2,
    country: 'European Union',
    region: 'Europe'
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    flag: '🇬🇧',
    rateAgainstUSD: 0.79,
    decimals: 2,
    country: 'United Kingdom',
    region: 'Europe'
  },
  CAD: {
    code: 'CAD',
    symbol: 'CA$',
    name: 'Canadian Dollar',
    flag: '🇨🇦',
    rateAgainstUSD: 1.36,
    decimals: 2,
    country: 'Canada',
    region: 'North America'
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    flag: '🇦🇺',
    rateAgainstUSD: 1.52,
    decimals: 2,
    country: 'Australia',
    region: 'Oceania'
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    flag: '🇯🇵',
    rateAgainstUSD: 155.0,
    decimals: 0,
    country: 'Japan',
    region: 'East Asia'
  },
  SGD: {
    code: 'SGD',
    symbol: 'S$',
    name: 'Singapore Dollar',
    flag: '🇸🇬',
    rateAgainstUSD: 1.34,
    decimals: 2,
    country: 'Singapore',
    region: 'Southeast Asia'
  },
  AED: {
    code: 'AED',
    symbol: 'AED ',
    name: 'UAE Dirham',
    flag: '🇦🇪',
    rateAgainstUSD: 3.67,
    decimals: 2,
    country: 'United Arab Emirates',
    region: 'Middle East'
  },
  SAR: {
    code: 'SAR',
    symbol: 'SAR ',
    name: 'Saudi Riyal',
    flag: '🇸🇦',
    rateAgainstUSD: 3.75,
    decimals: 2,
    country: 'Saudi Arabia',
    region: 'Middle East'
  },
  BDT: {
    code: 'BDT',
    symbol: '৳',
    name: 'Bangladeshi Taka',
    flag: '🇧🇩',
    rateAgainstUSD: 117.0,
    decimals: 2,
    country: 'Bangladesh',
    region: 'South Asia'
  },
  PKR: {
    code: 'PKR',
    symbol: 'PKR ',
    name: 'Pakistani Rupee',
    flag: '🇵🇰',
    rateAgainstUSD: 278.0,
    decimals: 2,
    country: 'Pakistan',
    region: 'South Asia'
  },
  NPR: {
    code: 'NPR',
    symbol: 'NPR ',
    name: 'Nepalese Rupee',
    flag: '🇳🇵',
    rateAgainstUSD: 133.0,
    decimals: 2,
    country: 'Nepal',
    region: 'South Asia'
  },
  LKR: {
    code: 'LKR',
    symbol: 'Rs ',
    name: 'Sri Lankan Rupee',
    flag: '🇱🇰',
    rateAgainstUSD: 300.0,
    decimals: 2,
    country: 'Sri Lanka',
    region: 'South Asia'
  },
  MYR: {
    code: 'MYR',
    symbol: 'RM ',
    name: 'Malaysian Ringgit',
    flag: '🇲🇾',
    rateAgainstUSD: 4.72,
    decimals: 2,
    country: 'Malaysia',
    region: 'Southeast Asia'
  },
  THB: {
    code: 'THB',
    symbol: '฿',
    name: 'Thai Baht',
    flag: '🇹🇭',
    rateAgainstUSD: 36.5,
    decimals: 2,
    country: 'Thailand',
    region: 'Southeast Asia'
  },
  IDR: {
    code: 'IDR',
    symbol: 'Rp ',
    name: 'Indonesian Rupiah',
    flag: '🇮🇩',
    rateAgainstUSD: 16200.0,
    decimals: 0,
    country: 'Indonesia',
    region: 'Southeast Asia'
  },
  PHP: {
    code: 'PHP',
    symbol: '₱',
    name: 'Philippine Peso',
    flag: '🇵🇭',
    rateAgainstUSD: 58.5,
    decimals: 2,
    country: 'Philippines',
    region: 'Southeast Asia'
  },
  VND: {
    code: 'VND',
    symbol: '₫',
    name: 'Vietnamese Dong',
    flag: '🇻🇳',
    rateAgainstUSD: 25400.0,
    decimals: 0,
    country: 'Vietnam',
    region: 'Southeast Asia'
  },
  KRW: {
    code: 'KRW',
    symbol: '₩',
    name: 'South Korean Won',
    flag: '🇰🇷',
    rateAgainstUSD: 1380.0,
    decimals: 0,
    country: 'South Korea',
    region: 'East Asia'
  },
  CNY: {
    code: 'CNY',
    symbol: '¥',
    name: 'Chinese Yuan',
    flag: '🇨🇳',
    rateAgainstUSD: 7.25,
    decimals: 2,
    country: 'China',
    region: 'East Asia'
  },
  HKD: {
    code: 'HKD',
    symbol: 'HK$',
    name: 'Hong Kong Dollar',
    flag: '🇭🇰',
    rateAgainstUSD: 7.80,
    decimals: 2,
    country: 'Hong Kong',
    region: 'East Asia'
  },
  BRL: {
    code: 'BRL',
    symbol: 'R$',
    name: 'Brazilian Real',
    flag: '🇧🇷',
    rateAgainstUSD: 5.45,
    decimals: 2,
    country: 'Brazil',
    region: 'South America'
  },
  MXN: {
    code: 'MXN',
    symbol: 'MX$',
    name: 'Mexican Peso',
    flag: '🇲🇽',
    rateAgainstUSD: 18.2,
    decimals: 2,
    country: 'Mexico',
    region: 'North America'
  },
  ZAR: {
    code: 'ZAR',
    symbol: 'R ',
    name: 'South African Rand',
    flag: '🇿🇦',
    rateAgainstUSD: 18.1,
    decimals: 2,
    country: 'South Africa',
    region: 'Africa'
  },
  NGN: {
    code: 'NGN',
    symbol: '₦',
    name: 'Nigerian Naira',
    flag: '🇳🇬',
    rateAgainstUSD: 1500.0,
    decimals: 2,
    country: 'Nigeria',
    region: 'Africa'
  },
  KES: {
    code: 'KES',
    symbol: 'KSh ',
    name: 'Kenyan Shilling',
    flag: '🇰🇪',
    rateAgainstUSD: 130.0,
    decimals: 2,
    country: 'Kenya',
    region: 'Africa'
  },
  EGP: {
    code: 'EGP',
    symbol: 'E£ ',
    name: 'Egyptian Pound',
    flag: '🇪🇬',
    rateAgainstUSD: 48.5,
    decimals: 2,
    country: 'Egypt',
    region: 'Middle East'
  },
  CHF: {
    code: 'CHF',
    symbol: 'CHF ',
    name: 'Swiss Franc',
    flag: '🇨🇭',
    rateAgainstUSD: 0.90,
    decimals: 2,
    country: 'Switzerland',
    region: 'Europe'
  },
  SEK: {
    code: 'SEK',
    symbol: 'kr ',
    name: 'Swedish Krona',
    flag: '🇸🇪',
    rateAgainstUSD: 10.5,
    decimals: 2,
    country: 'Sweden',
    region: 'Europe'
  },
  NOK: {
    code: 'NOK',
    symbol: 'kr ',
    name: 'Norwegian Krone',
    flag: '🇳🇴',
    rateAgainstUSD: 10.8,
    decimals: 2,
    country: 'Norway',
    region: 'Europe'
  },
  NZD: {
    code: 'NZD',
    symbol: 'NZ$',
    name: 'New Zealand Dollar',
    flag: '🇳🇿',
    rateAgainstUSD: 1.64,
    decimals: 2,
    country: 'New Zealand',
    region: 'Oceania'
  },
  TRY: {
    code: 'TRY',
    symbol: '₺',
    name: 'Turkish Lira',
    flag: '🇹🇷',
    rateAgainstUSD: 32.8,
    decimals: 2,
    country: 'Turkey',
    region: 'Eurasia'
  },
  ILS: {
    code: 'ILS',
    symbol: '₪',
    name: 'Israeli Shekel',
    flag: '🇮🇱',
    rateAgainstUSD: 3.70,
    decimals: 2,
    country: 'Israel',
    region: 'Middle East'
  }
};

/**
 * Intelligent Location & Currency Resolver
 * Combines Timezone heuristics, Browser Locales, and Coordinates
 */
export function identifyCurrencyFromLocation(): {
  currencyCode: string;
  countryName: string;
  detectionMethod: 'timezone' | 'locale' | 'gps' | 'fallback';
} {
  try {
    // 1. Check browser timezone (extremely reliable without requiring permissions)
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const tzLower = timeZone.toLowerCase();

    // India
    if (tzLower.includes('calcutta') || tzLower.includes('kolkata') || tzLower.includes('india') || tzLower === 'asia/kolkata') {
      return { currencyCode: 'INR', countryName: 'India', detectionMethod: 'timezone' };
    }
    
    // United Kingdom
    if (tzLower.includes('london') || tzLower.includes('belfast')) {
      return { currencyCode: 'GBP', countryName: 'United Kingdom', detectionMethod: 'timezone' };
    }

    // Eurozone Countries
    if (
      tzLower.includes('paris') || 
      tzLower.includes('berlin') || 
      tzLower.includes('rome') || 
      tzLower.includes('madrid') || 
      tzLower.includes('amsterdam') || 
      tzLower.includes('brussels') || 
      tzLower.includes('vienna') || 
      tzLower.includes('dublin') || 
      tzLower.includes('lisbon') || 
      tzLower.includes('helsinki') || 
      tzLower.includes('athens')
    ) {
      return { currencyCode: 'EUR', countryName: 'European Union', detectionMethod: 'timezone' };
    }

    // Japan
    if (tzLower.includes('tokyo')) {
      return { currencyCode: 'JPY', countryName: 'Japan', detectionMethod: 'timezone' };
    }

    // Canada
    if (tzLower.includes('toronto') || tzLower.includes('vancouver') || tzLower.includes('montreal') || tzLower.includes('edmonton') || tzLower.includes('winnipeg')) {
      return { currencyCode: 'CAD', countryName: 'Canada', detectionMethod: 'timezone' };
    }

    // Australia
    if (tzLower.includes('sydney') || tzLower.includes('melbourne') || tzLower.includes('brisbane') || tzLower.includes('perth') || tzLower.includes('adelaide')) {
      return { currencyCode: 'AUD', countryName: 'Australia', detectionMethod: 'timezone' };
    }

    // UAE / Middle East
    if (tzLower.includes('dubai')) {
      return { currencyCode: 'AED', countryName: 'United Arab Emirates', detectionMethod: 'timezone' };
    }
    if (tzLower.includes('riyadh')) {
      return { currencyCode: 'SAR', countryName: 'Saudi Arabia', detectionMethod: 'timezone' };
    }
    if (tzLower.includes('singapore')) {
      return { currencyCode: 'SGD', countryName: 'Singapore', detectionMethod: 'timezone' };
    }

    // South Asia neighbors
    if (tzLower.includes('dhaka')) {
      return { currencyCode: 'BDT', countryName: 'Bangladesh', detectionMethod: 'timezone' };
    }
    if (tzLower.includes('karachi')) {
      return { currencyCode: 'PKR', countryName: 'Pakistan', detectionMethod: 'timezone' };
    }
    if (tzLower.includes('kathmandu')) {
      return { currencyCode: 'NPR', countryName: 'Nepal', detectionMethod: 'timezone' };
    }
    if (tzLower.includes('colombo')) {
      return { currencyCode: 'LKR', countryName: 'Sri Lanka', detectionMethod: 'timezone' };
    }

    // Southeast Asia
    if (tzLower.includes('kuala_lumpur')) {
      return { currencyCode: 'MYR', countryName: 'Malaysia', detectionMethod: 'timezone' };
    }
    if (tzLower.includes('bangkok')) {
      return { currencyCode: 'THB', countryName: 'Thailand', detectionMethod: 'timezone' };
    }
    if (tzLower.includes('jakarta')) {
      return { currencyCode: 'IDR', countryName: 'Indonesia', detectionMethod: 'timezone' };
    }
    if (tzLower.includes('manila')) {
      return { currencyCode: 'PHP', countryName: 'Philippines', detectionMethod: 'timezone' };
    }
    if (tzLower.includes('ho_chi_minh') || tzLower.includes('saigon') || tzLower.includes('hanoi')) {
      return { currencyCode: 'VND', countryName: 'Vietnam', detectionMethod: 'timezone' };
    }
    if (tzLower.includes('seoul')) {
      return { currencyCode: 'KRW', countryName: 'South Korea', detectionMethod: 'timezone' };
    }

    // Americas
    if (tzLower.includes('sao_paulo')) {
      return { currencyCode: 'BRL', countryName: 'Brazil', detectionMethod: 'timezone' };
    }
    if (tzLower.includes('mexico_city')) {
      return { currencyCode: 'MXN', countryName: 'Mexico', detectionMethod: 'timezone' };
    }
    if (tzLower.includes('johannesburg')) {
      return { currencyCode: 'ZAR', countryName: 'South Africa', detectionMethod: 'timezone' };
    }
    if (tzLower.includes('lagos')) {
      return { currencyCode: 'NGN', countryName: 'Nigeria', detectionMethod: 'timezone' };
    }
    if (tzLower.includes('nairobi')) {
      return { currencyCode: 'KES', countryName: 'Kenya', detectionMethod: 'timezone' };
    }
    if (tzLower.includes('cairo')) {
      return { currencyCode: 'EGP', countryName: 'Egypt', detectionMethod: 'timezone' };
    }
    if (tzLower.includes('zurich')) {
      return { currencyCode: 'CHF', countryName: 'Switzerland', detectionMethod: 'timezone' };
    }
    if (tzLower.includes('stockholm')) {
      return { currencyCode: 'SEK', countryName: 'Sweden', detectionMethod: 'timezone' };
    }
    if (tzLower.includes('oslo')) {
      return { currencyCode: 'NOK', countryName: 'Norway', detectionMethod: 'timezone' };
    }
    if (tzLower.includes('auckland')) {
      return { currencyCode: 'NZD', countryName: 'New Zealand', detectionMethod: 'timezone' };
    }
    if (tzLower.includes('istanbul')) {
      return { currencyCode: 'TRY', countryName: 'Turkey', detectionMethod: 'timezone' };
    }
    if (tzLower.includes('jerusalem') || tzLower.includes('tel_aviv')) {
      return { currencyCode: 'ILS', countryName: 'Israel', detectionMethod: 'timezone' };
    }

    // US Timezones
    if (
      tzLower.includes('new_york') || 
      tzLower.includes('chicago') || 
      tzLower.includes('los_angeles') || 
      tzLower.includes('denver') || 
      tzLower.includes('phoenix') || 
      tzLower.includes('anchorage') || 
      tzLower.includes('honolulu') ||
      tzLower.includes('america')
    ) {
      return { currencyCode: 'USD', countryName: 'United States', detectionMethod: 'timezone' };
    }

    // 2. Fallback to navigator.language
    const lang = (navigator.language || (navigator.languages && navigator.languages[0]) || '').toLowerCase();
    
    if (lang.includes('-in') || lang.startsWith('hi') || lang.startsWith('ta') || lang.startsWith('te') || lang.startsWith('bn')) {
      return { currencyCode: 'INR', countryName: 'India', detectionMethod: 'locale' };
    }
    if (lang.includes('-gb')) {
      return { currencyCode: 'GBP', countryName: 'United Kingdom', detectionMethod: 'locale' };
    }
    if (lang.includes('-ca')) {
      return { currencyCode: 'CAD', countryName: 'Canada', detectionMethod: 'locale' };
    }
    if (lang.includes('-au')) {
      return { currencyCode: 'AUD', countryName: 'Australia', detectionMethod: 'locale' };
    }
    if (lang.includes('-de') || lang.includes('-fr') || lang.includes('-it') || lang.includes('-es') || lang.includes('-nl')) {
      return { currencyCode: 'EUR', countryName: 'European Union', detectionMethod: 'locale' };
    }
    if (lang.includes('-jp') || lang.startsWith('ja')) {
      return { currencyCode: 'JPY', countryName: 'Japan', detectionMethod: 'locale' };
    }
    if (lang.includes('-ae') || lang.startsWith('ar')) {
      return { currencyCode: 'AED', countryName: 'United Arab Emirates', detectionMethod: 'locale' };
    }

  } catch (err) {
    console.warn('Location detection heuristic error:', err);
  }

  // Default fallback to USD or INR
  return { currencyCode: 'USD', countryName: 'International', detectionMethod: 'fallback' };
}

interface CurrencyContextType {
  currency: string;
  currencyConfig: CurrencyConfig;
  setCurrency: (code: string) => void;
  formatPrice: (usdAmount: number, options?: { showCode?: boolean; compact?: boolean; customDecimals?: number }) => string;
  convertPrice: (usdAmount: number) => number;
  isAutoDetected: boolean;
  detectedCountry: string;
  detectionMethod: 'timezone' | 'locale' | 'gps' | 'manual' | 'fallback';
  detectLocationViaGPS: () => Promise<void>;
  isDetectingGPS: boolean;
  gpsError: string | null;
  resetToAutoDetect: () => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<string>('USD');
  const [detectedCountry, setDetectedCountry] = useState<string>('International');
  const [detectionMethod, setDetectionMethod] = useState<'timezone' | 'locale' | 'gps' | 'manual' | 'fallback'>('fallback');
  const [isAutoDetected, setIsAutoDetected] = useState<boolean>(true);
  const [isDetectingGPS, setIsDetectingGPS] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Initialize auto-detection on mount
  useEffect(() => {
    const savedCurrency = localStorage.getItem('medifind_currency');
    const savedManual = localStorage.getItem('medifind_currency_manual');

    if (savedCurrency && savedManual === 'true' && SUPPORTED_CURRENCIES[savedCurrency]) {
      setCurrencyState(savedCurrency);
      setIsAutoDetected(false);
      setDetectionMethod('manual');
      const config = SUPPORTED_CURRENCIES[savedCurrency];
      setDetectedCountry(config.country);
    } else {
      const auto = identifyCurrencyFromLocation();
      setCurrencyState(auto.currencyCode);
      setDetectedCountry(auto.countryName);
      setDetectionMethod(auto.detectionMethod);
      setIsAutoDetected(true);
    }
  }, []);

  const setCurrency = (code: string) => {
    if (SUPPORTED_CURRENCIES[code]) {
      setCurrencyState(code);
      setIsAutoDetected(false);
      setDetectionMethod('manual');
      localStorage.setItem('medifind_currency', code);
      localStorage.setItem('medifind_currency_manual', 'true');
    }
  };

  const resetToAutoDetect = () => {
    localStorage.removeItem('medifind_currency_manual');
    const auto = identifyCurrencyFromLocation();
    setCurrencyState(auto.currencyCode);
    setDetectedCountry(auto.countryName);
    setDetectionMethod(auto.detectionMethod);
    setIsAutoDetected(true);
    localStorage.setItem('medifind_currency', auto.currencyCode);
  };

  const detectLocationViaGPS = async () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingGPS(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        let detected = 'USD';
        let country = 'United States';

        // GPS Bounding Box Heuristics
        // India: Lat 6 to 37.5, Long 68 to 97.5
        if (latitude >= 6 && latitude <= 37.5 && longitude >= 68 && longitude <= 97.5) {
          detected = 'INR';
          country = 'India';
        }
        // UK: Lat 49 to 61, Long -8 to 2
        else if (latitude >= 49 && latitude <= 61 && longitude >= -8 && longitude <= 2) {
          detected = 'GBP';
          country = 'United Kingdom';
        }
        // Europe Core: Lat 35 to 70, Long -10 to 30
        else if (latitude >= 35 && latitude <= 70 && longitude >= -10 && longitude <= 30) {
          detected = 'EUR';
          country = 'European Union';
        }
        // Japan: Lat 24 to 46, Long 122 to 154
        else if (latitude >= 24 && latitude <= 46 && longitude >= 122 && longitude <= 154) {
          detected = 'JPY';
          country = 'Japan';
        }
        // Canada: Lat 42 to 83, Long -141 to -52
        else if (latitude >= 42 && latitude <= 83 && longitude >= -141 && longitude <= -52) {
          detected = 'CAD';
          country = 'Canada';
        }
        // Australia: Lat -44 to -10, Long 113 to 154
        else if (latitude >= -44 && latitude <= -10 && longitude >= 113 && longitude <= 154) {
          detected = 'AUD';
          country = 'Australia';
        }
        // UAE: Lat 22 to 26.5, Long 51 to 56.5
        else if (latitude >= 22 && latitude <= 26.5 && longitude >= 51 && longitude <= 56.5) {
          detected = 'AED';
          country = 'United Arab Emirates';
        }
        // Singapore: Lat 1.1 to 1.5, Long 103.5 to 104.1
        else if (latitude >= 1.1 && latitude <= 1.5 && longitude >= 103.5 && longitude <= 104.1) {
          detected = 'SGD';
          country = 'Singapore';
        }

        setCurrencyState(detected);
        setDetectedCountry(country);
        setDetectionMethod('gps');
        setIsAutoDetected(true);
        setIsDetectingGPS(false);
        localStorage.setItem('medifind_currency', detected);
        localStorage.removeItem('medifind_currency_manual');
      },
      (err) => {
        console.warn('GPS location request denied or failed:', err);
        setGpsError(err.message || 'Could not retrieve GPS coordinates. Timezone location is currently active.');
        setIsDetectingGPS(false);
      },
      { timeout: 8000, enableHighAccuracy: false }
    );
  };

  const currencyConfig = useMemo(() => {
    return SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.USD;
  }, [currency]);

  const convertPrice = (usdAmount: number): number => {
    if (typeof usdAmount !== 'number' || isNaN(usdAmount)) return 0;
    const rate = currencyConfig.rateAgainstUSD;
    return usdAmount * rate;
  };

  const formatPrice = (
    usdAmount: number, 
    options?: { showCode?: boolean; compact?: boolean; customDecimals?: number }
  ): string => {
    if (typeof usdAmount !== 'number' || isNaN(usdAmount)) return `${currencyConfig.symbol}0.00`;
    
    const converted = convertPrice(usdAmount);
    const decimals = options?.customDecimals !== undefined 
      ? options.customDecimals 
      : currencyConfig.decimals;

    // Formatting based on standard locale representation
    const formattedNumber = converted.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });

    if (options?.showCode) {
      return `${currencyConfig.symbol}${formattedNumber} ${currencyConfig.code}`;
    }

    return `${currencyConfig.symbol}${formattedNumber}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        currencyConfig,
        setCurrency,
        formatPrice,
        convertPrice,
        isAutoDetected,
        detectedCountry,
        detectionMethod,
        detectLocationViaGPS,
        isDetectingGPS,
        gpsError,
        resetToAutoDetect
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
