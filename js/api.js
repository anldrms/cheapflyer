// ===== API CONFIGURATION =====
const API_CONFIG = {
    // For demo: using simulated data. Replace with real API keys for production.
    amadeus: {
        clientId: 'YOUR_AMADEUS_CLIENT_ID',
        clientSecret: 'YOUR_AMADEUS_CLIENT_SECRET',
        baseUrl: 'https://test.api.amadeus.com'
    }
};

// ===== AIRPORT DATABASE (Major airports with coordinates) =====
const AIRPORTS = [
    { code: 'JFK', city: 'New York', country: 'US', lat: 40.6413, lng: -73.7781 },
    { code: 'LAX', city: 'Los Angeles', country: 'US', lat: 33.9425, lng: -118.4081 },
    { code: 'ORD', city: 'Chicago', country: 'US', lat: 41.9742, lng: -87.9073 },
    { code: 'DFW', city: 'Dallas', country: 'US', lat: 32.8998, lng: -97.0403 },
    { code: 'DEN', city: 'Denver', country: 'US', lat: 39.8561, lng: -104.6737 },
    { code: 'SFO', city: 'San Francisco', country: 'US', lat: 37.6213, lng: -122.3790 },
    { code: 'SEA', city: 'Seattle', country: 'US', lat: 47.4502, lng: -122.3088 },
    { code: 'MIA', city: 'Miami', country: 'US', lat: 25.7959, lng: -80.2870 },
    { code: 'BOS', city: 'Boston', country: 'US', lat: 42.3656, lng: -71.0096 },
    { code: 'ATL', city: 'Atlanta', country: 'US', lat: 33.6407, lng: -84.4277 },
    { code: 'LHR', city: 'London', country: 'UK', lat: 51.4700, lng: -0.4543 },
    { code: 'CDG', city: 'Paris', country: 'FR', lat: 49.0097, lng: 2.5479 },
    { code: 'FRA', city: 'Frankfurt', country: 'DE', lat: 50.0379, lng: 8.5622 },
    { code: 'AMS', city: 'Amsterdam', country: 'NL', lat: 52.3105, lng: 4.7683 },
    { code: 'DXB', city: 'Dubai', country: 'AE', lat: 25.2532, lng: 55.3657 },
    { code: 'SIN', city: 'Singapore', country: 'SG', lat: 1.3644, lng: 103.9915 },
    { code: 'HKG', city: 'Hong Kong', country: 'HK', lat: 22.3080, lng: 113.9185 },
    { code: 'NRT', city: 'Tokyo', country: 'JP', lat: 35.7720, lng: 140.3929 },
    { code: 'IST', city: 'Istanbul', country: 'TR', lat: 41.2753, lng: 28.7519 },
    { code: 'BCN', city: 'Barcelona', country: 'ES', lat: 41.2974, lng: 2.0833 },
    { code: 'FCO', city: 'Rome', country: 'IT', lat: 41.8003, lng: 12.2389 },
    { code: 'SYD', city: 'Sydney', country: 'AU', lat: -33.9399, lng: 151.1753 },
    { code: 'YYZ', city: 'Toronto', country: 'CA', lat: 43.6777, lng: -79.6248 },
    { code: 'MEX', city: 'Mexico City', country: 'MX', lat: 19.4361, lng: -99.0719 },
    { code: 'GRU', city: 'Sao Paulo', country: 'BR', lat: -23.4356, lng: -46.4731 }
];

// ===== DESTINATION IMAGES =====
const DESTINATION_IMAGES = {
    'Paris': 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&h=250&fit=crop',
    'Tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=250&fit=crop',
    'Rome': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&h=250&fit=crop',
    'Bali': 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=400&h=250&fit=crop',
    'London': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=250&fit=crop',
    'Dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=250&fit=crop',
    'New York': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=250&fit=crop',
    'Barcelona': 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400&h=250&fit=crop',
    'Sydney': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400&h=250&fit=crop',
    'Singapore': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400&h=250&fit=crop',
    'Maldives': 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&h=400&fit=crop',
    'Swiss Alps': 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&h=400&fit=crop',
    'Santorini': 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&h=400&fit=crop',
    'default': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=250&fit=crop'
};

// ===== FIND NEAREST AIRPORT =====
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

    return nearest;
}

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

// ===== GENERATE FLIGHT DEALS =====
function generateFlightDeals(originCode, originCity) {
    const destinations = [
        { city: 'Paris', code: 'CDG', basePrice: 450 },
        { city: 'Tokyo', code: 'NRT', basePrice: 850 },
        { city: 'Rome', code: 'FCO', basePrice: 520 },
        { city: 'London', code: 'LHR', basePrice: 480 },
        { city: 'Dubai', code: 'DXB', basePrice: 720 },
        { city: 'Barcelona', code: 'BCN', basePrice: 490 },
        { city: 'Singapore', code: 'SIN', basePrice: 780 },
        { city: 'Sydney', code: 'SYD', basePrice: 1100 }
    ].filter(d => d.code !== originCode);

    const deals = [];
    const today = new Date();

    // Generate 4-6 random deals
    const numDeals = Math.floor(Math.random() * 3) + 4;
    const shuffled = destinations.sort(() => 0.5 - Math.random());

    for (let i = 0; i < Math.min(numDeals, shuffled.length); i++) {
        const dest = shuffled[i];
        const discount = Math.floor(Math.random() * 30) + 25; // 25-55% off
        const originalPrice = dest.basePrice + Math.floor(Math.random() * 200);
        const salePrice = Math.round(originalPrice * (1 - discount / 100));

        const departDate = new Date(today);
        departDate.setDate(today.getDate() + Math.floor(Math.random() * 60) + 14);
        const returnDate = new Date(departDate);
        returnDate.setDate(departDate.getDate() + Math.floor(Math.random() * 7) + 5);

        deals.push({
            id: `deal-${i}`,
            origin: { code: originCode, city: originCity },
            destination: { code: dest.code, city: dest.city },
            originalPrice: originalPrice,
            salePrice: salePrice,
            discount: discount,
            departDate: departDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            returnDate: returnDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            image: DESTINATION_IMAGES[dest.city] || DESTINATION_IMAGES.default
        });
    }

    return deals;
}

// ===== GENERATE VACATION PACKAGES =====
function generateVacationPackages() {
    return [
        {
            id: 'pkg-1',
            title: 'Maldives Paradise',
            subtitle: '7 nights at 5-star resort with flights',
            image: DESTINATION_IMAGES['Maldives'],
            features: ['Round-trip flights', 'Beachfront villa', 'All meals included', 'Spa treatment'],
            price: 2499,
            featured: true,
            tag: 'Best Seller'
        },
        {
            id: 'pkg-2',
            title: 'Dubai Luxury Escape',
            subtitle: '5 nights luxury experience',
            image: DESTINATION_IMAGES['Dubai'],
            features: ['Round-trip flights', '5-star hotel', 'Desert safari', 'City tour'],
            price: 1899,
            featured: false
        },
        {
            id: 'pkg-3',
            title: 'Swiss Alps Adventure',
            subtitle: '6 nights mountain experience',
            image: DESTINATION_IMAGES['Swiss Alps'],
            features: ['Round-trip flights', 'Chalet stay', 'Ski pass included', 'Mountain guide'],
            price: 2199,
            featured: false
        }
    ];
}

// ===== EXPORT FOR USE IN APP.JS =====
window.FlightAPI = {
    findNearestAirport,
    generateFlightDeals,
    generateVacationPackages,
    AIRPORTS,
    DESTINATION_IMAGES
};
