/**
 * CheapFlyer API Module
 * Handles flight and hotel data fetching with location-based personalization
 */

// ===== API CONFIGURATION =====
const API_CONFIG = {
    // Add your API keys here for real data
    aviationstack: {
        key: '', // Get free key at: https://aviationstack.com/signup/free
        baseUrl: 'http://api.aviationstack.com/v1'
    },
    amadeus: {
        clientId: '', // Get free key at: https://developers.amadeus.com
        clientSecret: '',
        baseUrl: 'https://test.api.amadeus.com'
    },
    // Demo mode - uses realistic simulated data when no API key is provided
    demoMode: true
};

// ===== MAJOR AIRPORTS DATABASE =====
const AIRPORTS = [
    { code: 'JFK', city: 'New York', country: 'US', lat: 40.6413, lng: -73.7781, timezone: 'America/New_York' },
    { code: 'LAX', city: 'Los Angeles', country: 'US', lat: 33.9425, lng: -118.4081, timezone: 'America/Los_Angeles' },
    { code: 'ORD', city: 'Chicago', country: 'US', lat: 41.9742, lng: -87.9073, timezone: 'America/Chicago' },
    { code: 'DFW', city: 'Dallas', country: 'US', lat: 32.8998, lng: -97.0403, timezone: 'America/Chicago' },
    { code: 'DEN', city: 'Denver', country: 'US', lat: 39.8561, lng: -104.6737, timezone: 'America/Denver' },
    { code: 'SFO', city: 'San Francisco', country: 'US', lat: 37.6213, lng: -122.3790, timezone: 'America/Los_Angeles' },
    { code: 'SEA', city: 'Seattle', country: 'US', lat: 47.4502, lng: -122.3088, timezone: 'America/Los_Angeles' },
    { code: 'MIA', city: 'Miami', country: 'US', lat: 25.7959, lng: -80.2870, timezone: 'America/New_York' },
    { code: 'BOS', city: 'Boston', country: 'US', lat: 42.3656, lng: -71.0096, timezone: 'America/New_York' },
    { code: 'ATL', city: 'Atlanta', country: 'US', lat: 33.6407, lng: -84.4277, timezone: 'America/New_York' },
    { code: 'LHR', city: 'London', country: 'UK', lat: 51.4700, lng: -0.4543, timezone: 'Europe/London' },
    { code: 'CDG', city: 'Paris', country: 'FR', lat: 49.0097, lng: 2.5479, timezone: 'Europe/Paris' },
    { code: 'FRA', city: 'Frankfurt', country: 'DE', lat: 50.0379, lng: 8.5622, timezone: 'Europe/Berlin' },
    { code: 'AMS', city: 'Amsterdam', country: 'NL', lat: 52.3105, lng: 4.7683, timezone: 'Europe/Amsterdam' },
    { code: 'DXB', city: 'Dubai', country: 'AE', lat: 25.2532, lng: 55.3657, timezone: 'Asia/Dubai' },
    { code: 'SIN', city: 'Singapore', country: 'SG', lat: 1.3644, lng: 103.9915, timezone: 'Asia/Singapore' },
    { code: 'HKG', city: 'Hong Kong', country: 'HK', lat: 22.3080, lng: 113.9185, timezone: 'Asia/Hong_Kong' },
    { code: 'NRT', city: 'Tokyo', country: 'JP', lat: 35.7720, lng: 140.3929, timezone: 'Asia/Tokyo' },
    { code: 'IST', city: 'Istanbul', country: 'TR', lat: 41.2753, lng: 28.7519, timezone: 'Europe/Istanbul' },
    { code: 'BCN', city: 'Barcelona', country: 'ES', lat: 41.2974, lng: 2.0833, timezone: 'Europe/Madrid' },
    { code: 'FCO', city: 'Rome', country: 'IT', lat: 41.8003, lng: 12.2389, timezone: 'Europe/Rome' },
    { code: 'SYD', city: 'Sydney', country: 'AU', lat: -33.9399, lng: 151.1753, timezone: 'Australia/Sydney' },
    { code: 'YYZ', city: 'Toronto', country: 'CA', lat: 43.6777, lng: -79.6248, timezone: 'America/Toronto' },
    { code: 'MEX', city: 'Mexico City', country: 'MX', lat: 19.4361, lng: -99.0719, timezone: 'America/Mexico_City' },
    { code: 'GRU', city: 'Sao Paulo', country: 'BR', lat: -23.4356, lng: -46.4731, timezone: 'America/Sao_Paulo' },
    { code: 'BKK', city: 'Bangkok', country: 'TH', lat: 13.6900, lng: 100.7501, timezone: 'Asia/Bangkok' },
    { code: 'ICN', city: 'Seoul', country: 'KR', lat: 37.4602, lng: 126.4407, timezone: 'Asia/Seoul' }
];

// ===== DESTINATION IMAGES (High quality Unsplash) =====
const DESTINATION_IMAGES = {
    'Paris': 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&h=250&fit=crop&q=80',
    'Tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=250&fit=crop&q=80',
    'Rome': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&h=250&fit=crop&q=80',
    'London': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=250&fit=crop&q=80',
    'Dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=250&fit=crop&q=80',
    'New York': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=250&fit=crop&q=80',
    'Barcelona': 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400&h=250&fit=crop&q=80',
    'Sydney': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400&h=250&fit=crop&q=80',
    'Singapore': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400&h=250&fit=crop&q=80',
    'Amsterdam': 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=400&h=250&fit=crop&q=80',
    'Bangkok': 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400&h=250&fit=crop&q=80',
    'Seoul': 'https://images.unsplash.com/photo-1546874177-9e664107314e?w=400&h=250&fit=crop&q=80',
    'Istanbul': 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400&h=250&fit=crop&q=80',
    'Hong Kong': 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=400&h=250&fit=crop&q=80',
    'Los Angeles': 'https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=400&h=250&fit=crop&q=80',
    'Miami': 'https://images.unsplash.com/photo-1506966953602-c20cc11f75e3?w=400&h=250&fit=crop&q=80',
    'San Francisco': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=250&fit=crop&q=80',
    'Chicago': 'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=400&h=250&fit=crop&q=80',
    'Toronto': 'https://images.unsplash.com/photo-1517090504586-fde19ea6066f?w=400&h=250&fit=crop&q=80',
    'Frankfurt': 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400&h=250&fit=crop&q=80',
    'Maldives': 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&h=400&fit=crop&q=80',
    'Swiss Alps': 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&h=400&fit=crop&q=80',
    'Santorini': 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&h=400&fit=crop&q=80',
    'Bali': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&h=400&fit=crop&q=80',
    'default': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=250&fit=crop&q=80'
};

// ===== AIRLINE DATA =====
const AIRLINES = [
    { code: 'AA', name: 'American Airlines', logo: 'AA' },
    { code: 'UA', name: 'United Airlines', logo: 'UA' },
    { code: 'DL', name: 'Delta Air Lines', logo: 'DL' },
    { code: 'BA', name: 'British Airways', logo: 'BA' },
    { code: 'LH', name: 'Lufthansa', logo: 'LH' },
    { code: 'AF', name: 'Air France', logo: 'AF' },
    { code: 'EK', name: 'Emirates', logo: 'EK' },
    { code: 'SQ', name: 'Singapore Airlines', logo: 'SQ' },
    { code: 'QF', name: 'Qantas', logo: 'QF' },
    { code: 'TK', name: 'Turkish Airlines', logo: 'TK' }
];

// ===== UTILITY FUNCTIONS =====

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function getDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Find nearest airport to given coordinates
 */
function findNearestAirport(lat, lng) {
    let nearest = AIRPORTS[0];
    let minDistance = Infinity;

    AIRPORTS.forEach(airport => {
        const distance = getDistance(lat, lng, airport.lat, airport.lng);
        if (distance < minDistance) {
            minDistance = distance;
            nearest = airport;
        }
    });

    return { ...nearest, distance: Math.round(minDistance) };
}

/**
 * Get image URL for destination
 */
function getDestinationImage(city) {
    return DESTINATION_IMAGES[city] || DESTINATION_IMAGES.default;
}

/**
 * Format date for display
 */
function formatDate(date, format = 'short') {
    const options = format === 'short'
        ? { month: 'short', day: 'numeric' }
        : { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Generate realistic random price based on distance and demand
 */
function generatePrice(originCode, destCode, daysFromNow) {
    const origin = AIRPORTS.find(a => a.code === originCode);
    const dest = AIRPORTS.find(a => a.code === destCode);

    if (!origin || !dest) return { original: 500, sale: 350, discount: 30 };

    const distance = getDistance(origin.lat, origin.lng, dest.lat, dest.lng);

    // Base price: roughly $0.10 per km for economy
    let basePrice = Math.round(distance * 0.10);
    basePrice = Math.max(200, Math.min(basePrice, 2500)); // Clamp between 200-2500

    // Add demand factor (weekends and holidays cost more)
    const departDate = new Date();
    departDate.setDate(departDate.getDate() + daysFromNow);
    const isWeekend = departDate.getDay() === 0 || departDate.getDay() === 6;
    if (isWeekend) basePrice *= 1.15;

    // Random variation (±15%)
    const variation = 0.85 + Math.random() * 0.3;
    const originalPrice = Math.round(basePrice * variation);

    // Discount (25-55%)
    const discountPercent = Math.floor(Math.random() * 31) + 25;
    const salePrice = Math.round(originalPrice * (1 - discountPercent / 100));

    return {
        original: originalPrice,
        sale: salePrice,
        discount: discountPercent
    };
}

// ===== FLIGHT DEALS API =====

/**
 * Fetch flight deals from origin airport
 * Returns real data if API key is configured, otherwise realistic simulated data
 */
async function fetchFlightDeals(originCode, originCity, count = 6) {
    // If API key is configured, try to fetch real data
    if (API_CONFIG.aviationstack.key && !API_CONFIG.demoMode) {
        try {
            return await fetchRealFlightData(originCode);
        } catch (error) {
            console.warn('API fetch failed, using demo data:', error);
        }
    }

    // Generate realistic simulated deals
    return generateSimulatedDeals(originCode, originCity, count);
}

/**
 * Generate simulated flight deals (realistic data)
 */
function generateSimulatedDeals(originCode, originCity, count) {
    const popularDestinations = AIRPORTS.filter(a => a.code !== originCode);
    const shuffled = popularDestinations.sort(() => 0.5 - Math.random());
    const destinations = shuffled.slice(0, count);

    const today = new Date();
    const deals = destinations.map((dest, index) => {
        const daysFromNow = Math.floor(Math.random() * 60) + 14; // 2 weeks to 2.5 months
        const tripLength = Math.floor(Math.random() * 7) + 5; // 5-12 days

        const departDate = new Date(today);
        departDate.setDate(today.getDate() + daysFromNow);

        const returnDate = new Date(departDate);
        returnDate.setDate(departDate.getDate() + tripLength);

        const price = generatePrice(originCode, dest.code, daysFromNow);
        const airline = AIRLINES[Math.floor(Math.random() * AIRLINES.length)];

        return {
            id: `deal-${Date.now()}-${index}`,
            origin: { code: originCode, city: originCity },
            destination: { code: dest.code, city: dest.city, country: dest.country },
            airline: airline,
            originalPrice: price.original,
            salePrice: price.sale,
            discount: price.discount,
            departDate: formatDate(departDate),
            returnDate: formatDate(returnDate, 'long'),
            departDateRaw: departDate.toISOString(),
            returnDateRaw: returnDate.toISOString(),
            image: getDestinationImage(dest.city),
            seatsLeft: Math.floor(Math.random() * 8) + 2, // 2-10 seats
            isHot: price.discount >= 40
        };
    });

    // Sort by discount (best deals first)
    return deals.sort((a, b) => b.discount - a.discount);
}

/**
 * Fetch real flight data from API (when key is configured)
 */
async function fetchRealFlightData(originCode) {
    const url = `${API_CONFIG.aviationstack.baseUrl}/flights?access_key=${API_CONFIG.aviationstack.key}&dep_iata=${originCode}&limit=10`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('API request failed');

    const data = await response.json();

    // Transform API response to our format
    return data.data?.map((flight, index) => ({
        id: `real-${index}`,
        origin: { code: flight.departure?.iata, city: flight.departure?.airport },
        destination: { code: flight.arrival?.iata, city: flight.arrival?.airport },
        airline: { code: flight.airline?.iata, name: flight.airline?.name },
        // Note: Real pricing would require a different API
        originalPrice: 500,
        salePrice: 350,
        discount: 30,
        departDate: flight.departure?.scheduled,
        image: DESTINATION_IMAGES.default
    })) || [];
}

// ===== VACATION PACKAGES API =====

/**
 * Generate vacation packages
 */
function generateVacationPackages() {
    return [
        {
            id: 'pkg-maldives',
            title: 'Maldives Paradise',
            subtitle: '7 nights at 5-star overwater resort',
            destination: 'Maldives',
            image: getDestinationImage('Maldives'),
            features: ['Round-trip flights', 'Overwater villa', 'All meals included', 'Spa treatment', 'Sunset cruise'],
            originalPrice: 4999,
            price: 2499,
            discount: 50,
            rating: 4.9,
            reviews: 2847,
            featured: true,
            tag: 'Best Seller'
        },
        {
            id: 'pkg-dubai',
            title: 'Dubai Luxury Escape',
            subtitle: '5 nights at Burj Al Arab',
            destination: 'Dubai',
            image: getDestinationImage('Dubai'),
            features: ['Round-trip flights', '5-star hotel', 'Desert safari', 'City tour', 'Burj Khalifa access'],
            originalPrice: 3299,
            price: 1899,
            discount: 42,
            rating: 4.8,
            reviews: 1923,
            featured: false
        },
        {
            id: 'pkg-alps',
            title: 'Swiss Alps Adventure',
            subtitle: '6 nights mountain chalet experience',
            destination: 'Swiss Alps',
            image: getDestinationImage('Swiss Alps'),
            features: ['Round-trip flights', 'Luxury chalet', 'Ski pass included', 'Mountain guide', 'Fondue dinner'],
            originalPrice: 3899,
            price: 2199,
            discount: 44,
            rating: 4.9,
            reviews: 1456,
            featured: false
        },
        {
            id: 'pkg-bali',
            title: 'Bali Wellness Retreat',
            subtitle: '8 nights spiritual journey',
            destination: 'Bali',
            image: getDestinationImage('Bali'),
            features: ['Round-trip flights', 'Private villa', 'Daily yoga', 'Spa treatments', 'Temple tours'],
            originalPrice: 2899,
            price: 1699,
            discount: 41,
            rating: 4.7,
            reviews: 2134,
            featured: false
        },
        {
            id: 'pkg-santorini',
            title: 'Santorini Romance',
            subtitle: '5 nights cave hotel getaway',
            destination: 'Santorini',
            image: getDestinationImage('Santorini'),
            features: ['Round-trip flights', 'Cave hotel', 'Wine tasting', 'Sunset sail', 'Private dinner'],
            originalPrice: 3199,
            price: 1799,
            discount: 44,
            rating: 4.9,
            reviews: 1876,
            featured: false
        }
    ];
}

// ===== SEARCH API =====

/**
 * Search for flights
 */
async function searchFlights(from, to, departDate, returnDate) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const fromAirport = AIRPORTS.find(a =>
        a.code.toLowerCase() === from.toLowerCase() ||
        a.city.toLowerCase().includes(from.toLowerCase())
    );

    const toAirport = AIRPORTS.find(a =>
        a.code.toLowerCase() === to.toLowerCase() ||
        a.city.toLowerCase().includes(to.toLowerCase())
    );

    if (!fromAirport || !toAirport) {
        return { success: false, error: 'Airport not found' };
    }

    const daysFromNow = Math.ceil((new Date(departDate) - new Date()) / (1000 * 60 * 60 * 24));
    const price = generatePrice(fromAirport.code, toAirport.code, daysFromNow);

    return {
        success: true,
        results: [{
            id: `search-${Date.now()}`,
            origin: fromAirport,
            destination: toAirport,
            ...price,
            departDate,
            returnDate,
            airline: AIRLINES[Math.floor(Math.random() * AIRLINES.length)]
        }]
    };
}

// ===== EXPORT API =====
window.FlightAPI = {
    // Core functions
    findNearestAirport,
    fetchFlightDeals,
    generateVacationPackages,
    searchFlights,

    // Utilities
    getDestinationImage,
    formatDate,

    // Data
    AIRPORTS,
    AIRLINES,
    DESTINATION_IMAGES,

    // Config
    config: API_CONFIG,

    // Set API key
    setApiKey: (provider, key) => {
        if (API_CONFIG[provider]) {
            API_CONFIG[provider].key = key;
            API_CONFIG.demoMode = false;
            console.log(`${provider} API key configured`);
        }
    }
};

console.log('%c✈️ CheapFlyer API Ready', 'color: #00d4aa; font-weight: bold;');
console.log('%cDemo mode: Using simulated flight data', 'color: #666;');
console.log('%cTo use real API: FlightAPI.setApiKey("aviationstack", "YOUR_KEY")', 'color: #666;');
