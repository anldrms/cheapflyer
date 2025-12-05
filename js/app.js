/**
 * CheapFlyer Main Application
 * Handles UI interactions, geolocation, and dynamic content
 */

// ===== USER STATE =====
let userState = {
    location: null,
    airport: null,
    locationGranted: false,
    deals: [],
    packages: []
};

// ===== DOM READY =====
document.addEventListener('DOMContentLoaded', initApp);

async function initApp() {
    console.log('%c✈️ CheapFlyer', 'font-size: 20px; font-weight: bold; color: #00d4aa;');

    setupEventListeners();
    setMinDates();

    // Check for saved location
    const saved = localStorage.getItem('cheapflyer_location');
    if (saved) {
        try {
            userState = { ...userState, ...JSON.parse(saved) };
            updateLocationUI();
            await loadDeals();
        } catch (e) {
            showLocationModal();
        }
    } else {
        // Show location modal after brief delay
        setTimeout(showLocationModal, 800);
        loadDefaultDeals();
    }
}

// ===== LOCATION MODAL =====
function showLocationModal() {
    const modal = document.getElementById('location-modal');
    if (modal) modal.classList.add('active');
}

function hideLocationModal() {
    const modal = document.getElementById('location-modal');
    if (modal) modal.classList.remove('active');
}

async function requestLocation() {
    hideLocationModal();

    if (!navigator.geolocation) {
        showNotification('Geolocation not supported', 'error');
        loadDefaultDeals();
        return;
    }

    showNotification('Finding your location...', 'info');

    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000
            });
        });

        userState.location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };

        userState.airport = FlightAPI.findNearestAirport(
            userState.location.lat,
            userState.location.lng
        );

        userState.locationGranted = true;

        // Save to localStorage
        saveUserState();

        updateLocationUI();
        await loadDeals();

        showNotification(
            `Showing deals from ${userState.airport.city} (${userState.airport.code})`,
            'success'
        );

    } catch (error) {
        console.error('Geolocation error:', error);
        showNotification('Could not get location. Using default.', 'error');
        loadDefaultDeals();
    }
}

function saveUserState() {
    localStorage.setItem('cheapflyer_location', JSON.stringify({
        location: userState.location,
        airport: userState.airport,
        locationGranted: userState.locationGranted
    }));
}

function updateLocationUI() {
    if (!userState.airport) return;

    // Show location banner
    const banner = document.getElementById('location-banner');
    if (banner) {
        banner.classList.add('active');
        const airportCode = document.getElementById('user-airport');
        const cityName = document.getElementById('user-city');
        if (airportCode) airportCode.textContent = userState.airport.code;
        if (cityName) cityName.textContent = `- ${userState.airport.city}`;
    }

    // Update deals origin text
    const dealsOrigin = document.getElementById('deals-origin');
    if (dealsOrigin) dealsOrigin.textContent = userState.airport.city;

    // Pre-fill search form
    const fromInput = document.getElementById('from');
    if (fromInput && !fromInput.value) {
        fromInput.value = `${userState.airport.city} (${userState.airport.code})`;
    }
}

// ===== LOAD DEALS =====
async function loadDeals() {
    const airport = userState.airport || { code: 'JFK', city: 'New York' };

    // Show loading state
    showLoadingState('flight-deals');
    showLoadingState('vacation-packages');

    try {
        // Fetch flight deals
        userState.deals = await FlightAPI.fetchFlightDeals(airport.code, airport.city, 6);
        renderFlightDeals(userState.deals);

        // Get vacation packages
        userState.packages = FlightAPI.generateVacationPackages();
        renderPackages(userState.packages);

    } catch (error) {
        console.error('Error loading deals:', error);
        showNotification('Failed to load deals', 'error');
    }
}

function loadDefaultDeals() {
    userState.airport = { code: 'JFK', city: 'New York', country: 'US' };
    loadDeals();
}

function showLoadingState(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = Array(3).fill(0).map(() => `
        <div class="deal-card loading">
            <div class="loading-skeleton" style="height: 180px;"></div>
            <div style="padding: 1.25rem;">
                <div class="loading-skeleton" style="height: 20px; width: 70%; margin-bottom: 8px;"></div>
                <div class="loading-skeleton" style="height: 16px; width: 50%; margin-bottom: 16px;"></div>
                <div class="loading-skeleton" style="height: 24px; width: 40%;"></div>
            </div>
        </div>
    `).join('');
}

// ===== RENDER FLIGHT DEALS =====
function renderFlightDeals(deals) {
    const container = document.getElementById('flight-deals');
    if (!container) return;

    if (!deals || deals.length === 0) {
        container.innerHTML = '<p style="color: var(--gray); text-align: center; grid-column: 1/-1;">No deals found. Try a different location.</p>';
        return;
    }

    container.innerHTML = deals.map((deal, i) => `
        <div class="deal-card" data-id="${deal.id}" style="animation-delay: ${i * 0.1}s;">
            <div class="deal-image">
                <img src="${deal.image}" alt="${deal.destination.city}" loading="lazy" onerror="this.src='${FlightAPI.DESTINATION_IMAGES.default}'">
                <span class="deal-badge">${deal.isHot ? 'HOT ' : ''}-${deal.discount}%</span>
                <button class="deal-save" aria-label="Save deal">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                </button>
            </div>
            <div class="deal-content">
                <div class="deal-route">
                    <span>${deal.origin.code}</span>
                    <span class="route-arrow">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                    </span>
                    <span>${deal.destination.code}</span>
                </div>
                <div class="deal-city">${deal.destination.city}</div>
                <div class="deal-dates">${deal.departDate} - ${deal.returnDate}</div>
                ${deal.seatsLeft && deal.seatsLeft < 5 ? `<div class="seats-warning">Only ${deal.seatsLeft} seats left!</div>` : ''}
                <div class="deal-footer">
                    <div class="deal-price">
                        <span class="old-price">$${deal.originalPrice}</span>
                        <span class="new-price">$${deal.salePrice}</span>
                    </div>
                    <button class="btn btn-accent btn-sm book-btn">Book Now</button>
                </div>
            </div>
        </div>
    `).join('');

    // Add visible class for animation
    setTimeout(() => {
        container.querySelectorAll('.deal-card').forEach(card => card.classList.add('visible'));
    }, 100);

    // Add event listeners
    addDealCardListeners(container);
}

function addDealCardListeners(container) {
    // Save button
    container.querySelectorAll('.deal-save').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const svg = btn.querySelector('svg');
            if (btn.classList.toggle('saved')) {
                svg.setAttribute('fill', 'currentColor');
                showNotification('Deal saved!', 'success');
            } else {
                svg.setAttribute('fill', 'none');
                showNotification('Removed from saved', 'info');
            }
        });
    });

    // Book button
    container.querySelectorAll('.book-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.deal-card');
            const dealId = card.dataset.id;
            showNotification('Redirecting to booking...', 'success');
            // In production, redirect to booking page
        });
    });

    // Card click
    container.querySelectorAll('.deal-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.deal-save') || e.target.closest('.book-btn')) return;
            showNotification('Opening deal details...', 'info');
        });
    });
}

// ===== RENDER PACKAGES =====
function renderPackages(packages) {
    const container = document.getElementById('vacation-packages');
    if (!container) return;

    container.innerHTML = packages.map((pkg, i) => `
        <div class="package-card ${pkg.featured ? 'featured' : ''}" data-id="${pkg.id}" style="animation-delay: ${i * 0.1}s;">
            <div class="package-image">
                <img src="${pkg.image}" alt="${pkg.title}" loading="lazy">
                ${pkg.tag ? `<span class="package-tag">${pkg.tag}</span>` : ''}
            </div>
            <div class="package-content">
                <h3>${pkg.title}</h3>
                <p>${pkg.subtitle}</p>
                <ul class="package-features">
                    ${pkg.features.slice(0, 4).map(f => `<li>${f}</li>`).join('')}
                </ul>
                <div class="package-footer">
                    <div class="package-price">
                        <span class="from-text">From</span>
                        <div>
                            <span class="old-price" style="font-size: 0.85rem;">$${pkg.originalPrice.toLocaleString()}</span>
                            <span class="price">$${pkg.price.toLocaleString()}</span>
                        </div>
                        <span class="per-person">per person</span>
                    </div>
                    <button class="btn btn-accent btn-sm">View Package</button>
                </div>
            </div>
        </div>
    `).join('');

    // Add visible class for animation
    setTimeout(() => {
        container.querySelectorAll('.package-card').forEach(card => card.classList.add('visible'));
    }, 100);

    // Add event listeners
    container.querySelectorAll('.package-card .btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            showNotification('Opening package details...', 'info');
        });
    });
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Location modal
    document.getElementById('location-allow')?.addEventListener('click', requestLocation);
    document.getElementById('location-deny')?.addEventListener('click', () => {
        hideLocationModal();
        loadDefaultDeals();
    });
    document.getElementById('modal-close')?.addEventListener('click', () => {
        hideLocationModal();
        loadDefaultDeals();
    });

    // Change location
    document.getElementById('change-location')?.addEventListener('click', () => {
        localStorage.removeItem('cheapflyer_location');
        userState = { location: null, airport: null, locationGranted: false, deals: [], packages: [] };
        requestLocation();
    });

    // Mobile nav toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    navToggle?.addEventListener('click', () => navLinks?.classList.toggle('active'));

    // Close mobile nav on link click
    navLinks?.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => navLinks.classList.remove('active'));
    });

    // Search tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Search form
    document.getElementById('search-form')?.addEventListener('submit', handleSearch);

    // Newsletter form
    document.getElementById('newsletter-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = e.target.querySelector('input[type="email"]').value;
        showNotification('Successfully subscribed!', 'success');
        e.target.reset();
    });

    // Sign in button
    document.getElementById('signin-btn')?.addEventListener('click', () => {
        showNotification('Sign in coming soon!', 'info');
    });

    // Navbar scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            navbar?.classList.add('scrolled');
        } else {
            navbar?.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });
}

// ===== SEARCH HANDLER =====
async function handleSearch(e) {
    e.preventDefault();

    const from = document.getElementById('from').value;
    const to = document.getElementById('to').value;
    const depart = document.getElementById('depart').value;
    const returnDate = document.getElementById('return').value;

    if (!from || !to || !depart) {
        showNotification('Please fill all required fields', 'error');
        return;
    }

    showNotification('Searching for the best deals...', 'info');

    try {
        const results = await FlightAPI.searchFlights(from, to, depart, returnDate);

        if (results.success && results.results.length > 0) {
            const best = results.results[0];
            showNotification(
                `Found deals from $${best.sale}! Scroll down to see more.`,
                'success'
            );
        } else {
            showNotification('No flights found for this route', 'error');
        }
    } catch (error) {
        showNotification('Search failed. Please try again.', 'error');
    }
}

// ===== SET MIN DATES =====
function setMinDates() {
    const today = new Date().toISOString().split('T')[0];
    const departInput = document.getElementById('depart');
    const returnInput = document.getElementById('return');

    if (departInput) {
        departInput.setAttribute('min', today);
        departInput.addEventListener('change', () => {
            if (returnInput) {
                returnInput.setAttribute('min', departInput.value);
            }
        });
    }

    if (returnInput) {
        returnInput.setAttribute('min', today);
    }
}

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'info') {
    // Remove existing
    document.querySelectorAll('.notification').forEach(n => n.remove());

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ'
    };

    notification.innerHTML = `
        <span class="notification-icon">${icons[type] || icons.info}</span>
        <span class="notification-message">${message}</span>
        <button class="notification-close">×</button>
    `;

    document.body.appendChild(notification);

    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.add('hiding');
        setTimeout(() => notification.remove(), 300);
    });

    // Auto remove
    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.add('hiding');
            setTimeout(() => notification.remove(), 300);
        }
    }, 4000);
}

// ===== INJECT ADDITIONAL STYLES =====
const style = document.createElement('style');
style.textContent = `
    .navbar.scrolled { background: rgba(0, 0, 0, 0.98); }
    .modal-body { text-align: center; margin-bottom: 1.5rem; }
    .modal-body .modal-icon { margin-bottom: 1rem; color: var(--accent); }
    .modal-body p { color: var(--gray-light); line-height: 1.6; }
    .modal-actions { display: flex; gap: 1rem; justify-content: flex-end; }
    
    .deal-city { font-size: 0.9rem; color: var(--gray-light); margin-bottom: 0.25rem; }
    .seats-warning { font-size: 0.75rem; color: var(--warning); margin-bottom: 0.75rem; font-weight: 500; }
    .deal-save.saved { background: var(--accent); color: var(--dark); }
    
    .notification { gap: 0.75rem; }
    .notification-icon { font-size: 1rem; }
    .notification-message { flex: 1; }
    .notification.hiding { animation: slideDown 0.3s ease forwards; }
    @keyframes slideDown { to { transform: translateY(100%); opacity: 0; } }
    
    .loading-skeleton { background: linear-gradient(90deg, var(--dark-card) 25%, var(--dark-hover) 50%, var(--dark-card) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: var(--radius); }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    
    .route-arrow { display: flex; align-items: center; color: var(--gray); }
`;
document.head.appendChild(style);
