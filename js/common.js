/**
 * BookingUtils - Common utilities and helper functions
 */
const BookingUtils = (() => {
    
    // Date utilities
    const formatDate = (date) => {
        if (!date) return '';
        if (typeof date === 'string') date = new Date(date);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };
    
    const formatDateForDisplay = (date) => {
        if (!date) return '';
        if (typeof date === 'string') date = new Date(date);
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };
    
    const parseDate = (dateString) => {
        if (!dateString) return null;
        return new Date(dateString);
    };
    
    const calculateNights = (checkIn, checkOut) => {
        if (!checkIn || !checkOut) return 0;
        
        const startDate = typeof checkIn === 'string' ? new Date(checkIn) : checkIn;
        const endDate = typeof checkOut === 'string' ? new Date(checkOut) : checkOut;
        
        const timeDiff = endDate.getTime() - startDate.getTime();
        return Math.ceil(timeDiff / (1000 * 3600 * 24));
    };
    
    // Navigation utilities
    const navigateToStep = (step) => {
        const currentStep = getCurrentStep();
        
        // Validate current step before navigation
        if (!BookingState.validateStep(currentStep)) {
            showNotification('Por favor, completa todos los campos requeridos', 'error');
            return false;
        }
        
        // Update state
        BookingState.setState({ currentStep: step });
        
        // Navigate to step
        const stepUrls = {
            1: 'step-1.html',
            2: 'step-2.html',
            3: 'step-3.html',
            4: 'step-4.html'
        };
        
        if (stepUrls[step]) {
            window.location.href = stepUrls[step];
        }
        
        return true;
    };
    
    const getCurrentStep = () => {
        const path = window.location.pathname;
        if (path.includes('step-1')) return 1;
        if (path.includes('step-2')) return 2;
        if (path.includes('step-3')) return 3;
        if (path.includes('step-4')) return 4;
        return 1;
    };
    
    // Notification system
    const showNotification = (message, type = 'info', duration = 4000) => {
        // Remove existing notifications
        const existing = document.querySelectorAll('.notification');
        existing.forEach(el => el.remove());
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" aria-label="Cerrar">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
            </div>
        `;
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Add close functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => notification.remove());
        
        // Auto-remove after duration
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.add('notification-exit');
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);
        
        // Trigger animation
        requestAnimationFrame(() => {
            notification.classList.add('notification-show');
        });
    };
    
    // Form utilities
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };
    
    const validatePhone = (phone) => {
        const phoneRegex = /^[\+]?[\d\s\-\(\)]{9,15}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    };
    
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    };
    
    // Accessibility utilities
    const announceToScreenReader = (message) => {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    };
    
    // Local storage utilities
    const saveToLocalStorage = (key, data) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.warn('Error saving to localStorage:', error);
            return false;
        }
    };
    
    const loadFromLocalStorage = (key) => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.warn('Error loading from localStorage:', error);
            return null;
        }
    };
    
    // Theme utilities
    const initTheme = () => {
        const savedTheme = localStorage.getItem('bookingTheme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
            if (!localStorage.getItem('bookingTheme')) {
                document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
            }
        });
    };
    
    const toggleTheme = () => {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = current === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('bookingTheme', newTheme);
        
        return newTheme;
    };
    
    // Room and pricing utilities
    const formatRoomType = (type) => {
        const roomNames = {
            'standard': 'Habitación Estándar',
            'deluxe': 'Habitación Deluxe', 
            'suite': 'Suite Junior',
            'premium': 'Suite Premium'
        };
        return roomNames[type] || type;
    };

    const formatExtraName = (extraId) => {
        const extraNames = {
            'breakfast': 'Desayuno buffet',
            'parking': 'Parking privado',
            'wifi': 'WiFi gratuito',
            'spa': 'Acceso al spa',
            'laundry': 'Servicio de lavandería',
            'airport': 'Traslado aeropuerto'
        };
        return extraNames[extraId] || extraId;
    };

    // Price calculation helpers
    const calculateRoomPrice = (roomType, nights, count = 1) => {
        if (typeof BookingState === 'undefined') return 0;
        const prices = BookingState.getRoomPrices();
        const basePrice = prices[roomType]?.base || 0;
        return basePrice * nights * count;
    };

    const calculateExtraPrice = (extraId, nights, adults) => {
        if (typeof BookingState === 'undefined') return 0;
        const prices = BookingState.getExtraPrices();
        const extraData = prices[extraId];
        if (!extraData) return 0;

        let cost = extraData.price;
        switch (extraId) {
            case 'breakfast':
            case 'spa':
                cost *= adults * nights;
                break;
            case 'parking':
                cost *= nights;
                break;
            case 'wifi':
                cost = 0;
                break;
        }
        return cost;
    };

    // Update pricing display
    const updatePricingDisplay = () => {
        if (typeof BookingState === 'undefined') return;
        
        const pricing = BookingState.calculatePricing();
        
        // Update subtotal
        const subtotalEl = document.getElementById('subtotalAmount');
        if (subtotalEl) {
            subtotalEl.textContent = formatCurrency(pricing.subtotal);
        }
        
        // Update discount
        const discountEl = document.getElementById('discountAmount');
        if (discountEl) {
            discountEl.textContent = `-${formatCurrency(pricing.discount)}`;
            const discountRow = discountEl.parentElement;
            if (discountRow) {
                discountRow.style.display = pricing.discount > 0 ? 'flex' : 'none';
            }
        }
        
        // Update total
        const totalEl = document.getElementById('totalAmount');
        if (totalEl) {
            totalEl.textContent = formatCurrency(pricing.total);
        }
        
        // Update summary pricing elements
        const summaryTotal = document.getElementById('summaryTotal');
        if (summaryTotal) {
            summaryTotal.textContent = formatCurrency(pricing.total);
        }
        
        // Update FAB price if exists
        const fabPrice = document.querySelector('.fab .price');
        if (fabPrice) {
            fabPrice.textContent = formatCurrency(pricing.total);
        }
    };
    
    // Initialize common functionality
    const init = () => {
        initTheme();
        
        // Add notification styles if not already present
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 10000;
                    max-width: 400px;
                    background: var(--color-background);
                    border: 1px solid var(--color-border);
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    transform: translateX(100%);
                    transition: transform 0.3s ease;
                }
                
                .notification-show {
                    transform: translateX(0);
                }
                
                .notification-exit {
                    transform: translateX(100%);
                }
                
                .notification-content {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px;
                    gap: 12px;
                }
                
                .notification-message {
                    flex: 1;
                    font-size: 14px;
                    line-height: 1.4;
                }
                
                .notification-close {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                    opacity: 0.7;
                    transition: opacity 0.2s ease;
                }
                
                .notification-close:hover {
                    opacity: 1;
                    background: var(--color-hover);
                }
                
                .notification-info {
                    border-left: 4px solid var(--color-primary);
                }
                
                .notification-success {
                    border-left: 4px solid var(--color-success);
                }
                
                .notification-error {
                    border-left: 4px solid var(--color-error);
                }
                
                .notification-warning {
                    border-left: 4px solid var(--color-warning);
                }
                
                .sr-only {
                    position: absolute;
                    width: 1px;
                    height: 1px;
                    padding: 0;
                    margin: -1px;
                    overflow: hidden;
                    clip: rect(0, 0, 0, 0);
                    white-space: nowrap;
                    border: 0;
                }
            `;
            document.head.appendChild(styles);
        }
    };
    
    // Public API
    return {
        // Date utilities
        formatDate,
        formatDateForDisplay,
        parseDate,
        calculateNights,
        
        // Navigation
        navigateToStep,
        getCurrentStep,
        
        // Notifications
        showNotification,
        announceToScreenReader,
        
        // Form validation
        validateEmail,
        validatePhone,
        
        // Formatting
        formatCurrency,
        formatRoomType,
        formatExtraName,
        
        // Storage
        saveToLocalStorage,
        loadFromLocalStorage,
        
        // Theme
        initTheme,
        toggleTheme,
        
        // Pricing utilities
        calculateRoomPrice,
        calculateExtraPrice,
        updatePricingDisplay,
        
        // Initialization
        init
    };
})();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', BookingUtils.init);
} else {
    BookingUtils.init();
}

// Make available globally
window.BookingUtils = BookingUtils;