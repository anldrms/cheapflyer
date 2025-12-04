// ===== USER LOCATION STATE =====
let userLocation = {
    lat: null,
    lng: null,
    airport: null,
    granted: false
};

// ===== DOM ELEMENTS =====
const locationModal = document.getElementById('location-modal');
const locationBanner = document.getElementById('location-banner');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const tabBtns = document.querySelectorAll('.tab-btn');
const searchForm = document.getElementById('search-form');
const newsletterForm = document.getElementById('newsletter-form');

// ===== INITIALIZE APP =====
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    // Check if location was previously granted
    const savedLocation = localStorage.getItem('userLocation');

    if (savedLocation) {
        userLocation = JSON.parse(savedLocation);
        updateUIWithLocation();
        loadDeals();
    } else {
        // Show location permission modal after a short delay
        setTimeout(() => {
            showLocationModal();
        }, 1000);
        // Load default deals in the meantime
        loadDefaultDeals();
    }

    // Setup event listeners
    setupEventListeners();

    // Initialize animations
    initScrollAnimations();

    // Set min dates
    setMinDates();
}

// ===== LOCATION MODAL =====
function showLocationModal() {
    if (locationModal) {
        locationModal.classList.add('active');
    }
}

function hideLocationModal() {
    if (locationModal) {
        locationModal.classList.remove('active');
    }
}

// ===== GEOLOCATION =====
async function requestLocation() {
    hideLocationModal();

    if (!navigator.geolocation) {
        showNotification('Geolocation is not supported by your browser', 'error');
        loadDefaultDeals();
        return;
    }

    showNotification('Getting your location...', 'info');

    navigator.geolocation.getCurrentPosition(
        (position) => {
            userLocation.lat = position.coords.latitude;
            userLocation.lng = position.coords.longitude;
            userLocation.airport = FlightAPI.findNearestAirport(userLocation.lat, userLocation.lng);
            userLocation.granted = true;

            // Save to localStorage
            localStorage.setItem('userLocation', JSON.stringify(userLocation));

            updateUIWithLocation();
            loadDeals();
            showNotification(`Found deals from ${userLocation.airport.city} (${userLocation.airport.code})`, 'success');
        },
        (error) => {
            console.error('Geolocation error:', error);
            showNotification('Could not get your location. Showing default deals.', 'error');
            loadDefaultDeals();
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
        }
    );
}

function updateUIWithLocation() {
    if (!userLocation.airport) return;

    // Update location banner
    if (locationBanner) {
        locationBanner.classList.add('active');
        document.getElementById('user-airport').textContent = userLocation.airport.code;
        document.getElementById('user-city').textContent = `- ${userLocation.airport.city}`;
    }

    // Update deals origin text
    const dealsOrigin = document.getElementById('deals-origin');
    if (dealsOrigin) {
        dealsOrigin.textContent = userLocation.airport.city;
    }

    // Pre-fill search form
    const fromInput = document.getElementById('from');
    if (fromInput) {
        fromInput.value = `${userLocation.airport.city} (${userLocation.airport.code})`;
    }
}

// ===== LOAD DEALS =====
function loadDeals() {
    const airport = userLocation.airport || { code: 'JFK', city: 'New York' };
    const deals = FlightAPI.generateFlightDeals(airport.code, airport.city);
    renderFlightDeals(deals);

    const packages = FlightAPI.generateVacationPackages();
    renderVacationPackages(packages);
}

function loadDefaultDeals() {
    // Default to JFK/New York
    userLocation.airport = { code: 'JFK', city: 'New York' };
    loadDeals();
}

// ===== RENDER FLIGHT DEALS =====
function renderFlightDeals(deals) {
    const container = document.getElementById('flight-deals');
    if (!container) return;

    container.innerHTML = deals.map(deal => `
        <div class="deal-card" data-deal-id="${deal.id}">
            <div class="deal-image">
                <img src="${deal.image}" alt="${deal.destination.city}" loading="lazy">
                <span class="deal-badge">-${deal.discount}%</span>
                <button class="deal-save" aria-label="Save deal">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                </button>
            </div>
            <div class="deal-content">
                <div class="deal-route">
                    <span>${deal.origin.city}</span>
                    <span class="route-arrow">→</span>
                    <span>${deal.destination.city}</span>
                </div>
                <div class="deal-dates">${deal.departDate} - ${deal.returnDate}</div>
                <div class="deal-footer">
                    <div class="deal-price">
                        <span class="old-price">$${deal.originalPrice}</span>
                        <span class="new-price">$${deal.salePrice}</span>
                    </div>
                    <button class="btn btn-outline btn-sm book-btn">Book</button>
                </div>
            </div>
        </div>
    `).join('');

    // Add animation class
    container.querySelectorAll('.deal-card').forEach((card, i) => {
        setTimeout(() => card.classList.add('visible'), i * 100);
    });

    // Add click handlers
    container.querySelectorAll('.deal-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.deal-save') && !e.target.closest('.book-btn')) {
                showNotification('Opening deal details...', 'info');
            }
        });
    });

    container.querySelectorAll('.book-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            showNotification('Redirecting to booking...', 'success');
        });
    });

    container.querySelectorAll('.deal-save').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const icon = btn.querySelector('svg');
            if (btn.classList.contains('saved')) {
                btn.classList.remove('saved');
                icon.style.fill = 'none';
                showNotification('Removed from saved deals', 'info');
            } else {
                btn.classList.add('saved');
                icon.style.fill = 'currentColor';
                showNotification('Deal saved!', 'success');
            }
        });
    });
}

// ===== RENDER VACATION PACKAGES =====
function renderVacationPackages(packages) {
    const container = document.getElementById('vacation-packages');
    if (!container) return;

    container.innerHTML = packages.map(pkg => `
        <div class="package-card ${pkg.featured ? 'featured' : ''}" data-package-id="${pkg.id}">
            <div class="package-image">
                <img src="${pkg.image}" alt="${pkg.title}" loading="lazy">
                ${pkg.tag ? `<span class="package-tag">${pkg.tag}</span>` : ''}
            </div>
            <div class="package-content">
                <h3>${pkg.title}</h3>
                <p>${pkg.subtitle}</p>
                <ul class="package-features">
                    ${pkg.features.map(f => `<li>${f}</li>`).join('')}
                </ul>
                <div class="package-footer">
                    <div class="package-price">
                        <span class="from-text">From</span>
                        <span class="price">$${pkg.price.toLocaleString()}</span>
                        <span class="per-person">per person</span>
                    </div>
                    <button class="btn btn-accent btn-sm">View</button>
                </div>
            </div>
        </div>
    `).join('');

    // Add animation class
    container.querySelectorAll('.package-card').forEach((card, i) => {
        setTimeout(() => card.classList.add('visible'), i * 100);
    });

    // Add click handlers
    container.querySelectorAll('.package-card .btn').forEach(btn => {
        btn.addEventListener('click', () => {
            showNotification('Opening package details...', 'info');
        });
    });
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Location modal buttons
    document.getElementById('location-allow')?.addEventListener('click', requestLocation);
    document.getElementById('location-deny')?.addEventListener('click', () => {
        hideLocationModal();
        loadDefaultDeals();
    });
    document.getElementById('modal-close')?.addEventListener('click', () => {
        hideLocationModal();
        loadDefaultDeals();
    });

    // Change location button
    document.getElementById('change-location')?.addEventListener('click', () => {
        localStorage.removeItem('userLocation');
        requestLocation();
    });

    // Mobile navigation
    navToggle?.addEventListener('click', () => {
        navLinks?.classList.toggle('active');
    });

    navLinks?.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });

    // Search tabs
    tabBtns?.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Search form
    searchForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const from = document.getElementById('from').value;
        const to = document.getElementById('to').value;
        showNotification(`Searching flights from ${from} to ${to}...`, 'info');
        setTimeout(() => {
            showNotification('Great deals found! Check below.', 'success');
        }, 1500);
    });

    // Newsletter form
    newsletterForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        showNotification('Successfully subscribed! Check your inbox.', 'success');
        newsletterForm.reset();
    });

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar?.classList.add('scrolled');
        } else {
            navbar?.classList.remove('scrolled');
        }
    });

    // Sign in button
    document.getElementById('signin-btn')?.addEventListener('click', () => {
        showNotification('Sign in feature coming soon!', 'info');
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

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'info') {
    // Remove existing notification
    document.querySelector('.notification')?.remove();

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;

    document.body.appendChild(notification);

    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.animation = 'slideDown 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    });

    // Auto-remove
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideDown 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }
    }, 4000);
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.deal-card, .package-card, .feature-card').forEach(el => {
        observer.observe(el);
    });
}

// ===== SET MIN DATES =====
function setMinDates() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('depart')?.setAttribute('min', today);
    document.getElementById('return')?.setAttribute('min', today);

    document.getElementById('depart')?.addEventListener('change', (e) => {
        document.getElementById('return')?.setAttribute('min', e.target.value);
    });
}

// ===== CSS for slideDown animation =====
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from { transform: translateY(0); opacity: 1; }
        to { transform: translateY(100%); opacity: 0; }
    }
    .modal-body { text-align: center; margin-bottom: 1.5rem; }
    .modal-body .modal-icon { margin-bottom: 1rem; color: var(--accent); }
    .modal-body p { color: var(--gray-light); }
    .modal-actions { display: flex; gap: 1rem; justify-content: flex-end; }
    .navbar.scrolled { background: rgba(0, 0, 0, 0.98); }
`;
document.head.appendChild(style);

// ===== CONSOLE BRANDING =====
console.log('%cCheapFlyer', 'font-size: 24px; font-weight: bold; color: #00d4aa;');
console.log('%cFind the best travel deals.', 'font-size: 14px; color: #666;');
