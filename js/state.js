/**
 * BookingState - Global state management for booking system
 */
const BookingState = (() => {
    const STORAGE_KEY = 'hotelBookingState';
    
    // Default state
    const defaultState = {
        dates: {
            checkIn: null,
            checkOut: null,
            nights: 0
        },
        rooms: 1,
        guests: {
            adults: 2,
            children: 0,
            childrenAges: []
        },
        selectedRooms: [],
        extras: [],
        payment: {
            method: '',
            cardData: {},
            billingInfo: {}
        },
        customerInfo: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            country: '',
            specialRequests: ''
        },
        paymentInfo: null,
        promoCode: null,
        pricing: {
            subtotal: 0,
            taxes: 0,
            fees: 0,
            discount: 0,
            total: 0
        },
        bookingId: null,
        currentStep: 1
    };
    
    let currentState = { ...defaultState };
    let subscribers = [];
    
    // Room pricing data
    const roomPrices = {
        'standard': { base: 89, name: 'Habitación Estándar' },
        'deluxe': { base: 129, name: 'Habitación Deluxe' },
        'suite': { base: 199, name: 'Suite Junior' },
        'premium': { base: 299, name: 'Suite Premium' }
    };
    
    // Extra services pricing
    const extraPrices = {
        'breakfast': { price: 15, name: 'Desayuno buffet', unit: 'por persona/día' },
        'parking': { price: 12, name: 'Parking privado', unit: 'por día' },
        'wifi': { price: 0, name: 'WiFi gratuito', unit: 'incluido' },
        'spa': { price: 25, name: 'Acceso al spa', unit: 'por persona/día' },
        'laundry': { price: 20, name: 'Servicio de lavandería', unit: 'por servicio' },
        'airport': { price: 35, name: 'Traslado aeropuerto', unit: 'ida/vuelta' }
    };
    
    // Calculate pricing
    const calculatePricing = () => {
        try {
            let subtotal = 0;
            const nights = currentState.dates.nights || 0;
            const selectedRooms = currentState.selectedRooms || [];
            const extras = currentState.extras || [];
            const adults = currentState.guests.adults || 2;
            
            // Validate nights
            if (nights < 0 || nights > 365) {
                console.warn('Invalid number of nights:', nights);
                return { subtotal: 0, discount: 0, total: 0, breakdown: {} };
            }
            
            // Calculate room prices
            selectedRooms.forEach(room => {
                if (!room) return;
                
                // Handle both old format (type) and new format (price)
                if (room.price) {
                    // New format from step-2.js
                    subtotal += room.price * nights;
                } else if (room.type) {
                    // Old format
                    const roomType = room.type;
                    const roomCount = Math.max(1, room.count || 1);
                    const basePrice = roomPrices[roomType]?.base || 0;
                    
                    if (basePrice > 0) {
                        subtotal += basePrice * nights * roomCount;
                    }
                }
            });
        
        // Calculate extras
        extras.forEach(extra => {
            const extraData = extraPrices[extra.id];
            if (!extraData) return;
            
            let extraCost = extraData.price;
            
            // Apply multipliers based on extra type
            switch (extra.id) {
                case 'breakfast':
                case 'spa':
                    extraCost *= adults * nights;
                    break;
                case 'parking':
                    extraCost *= nights;
                    break;
                case 'wifi':
                    extraCost = 0; // Free
                    break;
                case 'laundry':
                case 'airport':
                    // Fixed price per service
                    break;
            }
            
            subtotal += extraCost;
        });
        
            // Apply promo code discount
            let discountAmount = 0;
            if (currentState.promoCode && currentState.promoCode.percentage) {
                const percentage = Math.min(100, Math.max(0, currentState.promoCode.percentage));
                discountAmount = (subtotal * percentage) / 100;
            }
            
            // Calculate taxes (10% of subtotal after discount)
            const subtotalAfterDiscount = subtotal - discountAmount;
            const taxes = subtotalAfterDiscount * 0.10;
            
            // Calculate total
            const total = Math.max(0, subtotalAfterDiscount + taxes);
            
            // Update pricing object in state
            currentState.pricing = {
                subtotal: subtotal,
                taxes: taxes,
                fees: 0,
                discount: discountAmount,
                total: total
            };
            
            // Keep legacy properties for backward compatibility
            currentState.subtotalPrice = subtotal;
            currentState.discountAmount = discountAmount;
            currentState.totalPrice = total;
            
            return currentState.pricing;
        } catch (error) {
            console.error('Error calculating pricing:', error);
            return { subtotal: 0, discount: 0, total: 0, breakdown: {} };
        }
    };
    
    // Load state from localStorage
    const loadState = () => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                currentState = { ...defaultState, ...JSON.parse(saved) };
                calculatePricing(); // Recalculate after loading
            }
        } catch (error) {
            console.warn('Error loading state from localStorage:', error);
            currentState = { ...defaultState };
        }
    };
    
    // Save state to localStorage
    const saveState = () => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
        } catch (error) {
            console.warn('Error saving state to localStorage:', error);
        }
    };
    
    // Public API
    return {
        getState: () => ({ ...currentState }),
        
        setState: (updates) => {
            const previousState = { ...currentState };
            currentState = { ...currentState, ...updates };
            
            // Recalculate pricing if relevant data changed
            const pricingFields = ['selectedRooms', 'extras', 'dates', 'guests', 'promoCode'];
            const needsRecalc = pricingFields.some(field => updates.hasOwnProperty(field));
            if (needsRecalc) {
                calculatePricing();
            }
            
            saveState();
            
            // Notify subscribers
            const changes = Object.keys(updates);
            subscribers.forEach(callback => {
                try {
                    callback(currentState, changes, previousState);
                } catch (error) {
                    console.warn('Error in state subscriber:', error);
                }
            });
        },
        
        setNestedState: (path, value) => {
            const previousState = { ...currentState };
            
            // Update nested property
            if (currentState.hasOwnProperty(path)) {
                currentState[path] = { ...currentState[path], ...value };
            } else {
                console.warn(`Property ${path} does not exist in state`);
                return;
            }
            
            // Recalculate pricing if needed
            const pricingFields = ['selectedRooms', 'extras', 'dates', 'guests', 'promoCode'];
            if (pricingFields.includes(path)) {
                calculatePricing();
            }
            
            saveState();
            
            // Notify subscribers
            subscribers.forEach(callback => {
                try {
                    callback(currentState, [path], previousState);
                } catch (error) {
                    console.warn('Error in state subscriber:', error);
                }
            });
        },
        
        generateBookingId: () => {
            // Generate a unique booking ID
            const timestamp = Date.now();
            const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            const bookingId = `HTL${timestamp}${random}`;
            
            currentState.bookingId = bookingId;
            saveState();
            
            return bookingId;
        },
        
        subscribe: (callback) => {
            subscribers.push(callback);
            return () => {
                subscribers = subscribers.filter(sub => sub !== callback);
            };
        },
        
        reset: () => {
            currentState = { ...defaultState };
            saveState();
            subscribers.forEach(callback => {
                try {
                    callback(currentState, ['reset']);
                } catch (error) {
                    console.warn('Error in state subscriber:', error);
                }
            });
        },
        
        validateStep: (step) => {
            try {
                switch (step) {
                    case 1:
                        // Validate dates
                        if (!currentState.dates.checkIn || !currentState.dates.checkOut) {
                            return false;
                        }
                        
                        const checkIn = new Date(currentState.dates.checkIn);
                        const checkOut = new Date(currentState.dates.checkOut);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        
                        // Check-in must be today or future
                        if (checkIn < today) {
                            return false;
                        }
                        
                        // Check-out must be after check-in
                        if (checkOut <= checkIn) {
                            return false;
                        }
                        
                        // Maximum stay validation (e.g., 30 days)
                        const maxStay = 30;
                        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
                        if (nights > maxStay) {
                            return false;
                        }
                        
                        return currentState.rooms > 0 && 
                               currentState.rooms <= 6 &&
                               currentState.guests.adults > 0 &&
                               currentState.guests.adults <= 8;
                               
                    case 2:
                        return currentState.selectedRooms && 
                               currentState.selectedRooms.length > 0;
                               
                    case 3:
                        return currentState.paymentInfo && currentState.paymentInfo.method && 
                               currentState.customerInfo.firstName && 
                               currentState.customerInfo.lastName && 
                               currentState.customerInfo.email &&
                               /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentState.customerInfo.email);
                               
                    case 4:
                        return true;
                        
                    default:
                        return false;
                }
            } catch (error) {
                console.error('Error validating step:', step, error);
                return false;
            }
        },
        
        // Pricing functions
        calculatePricing,
        getRoomPrices: () => ({ ...roomPrices }),
        getExtraPrices: () => ({ ...extraPrices }),
        
        // Utility functions
        addRoom: (roomType, count = 1) => {
            try {
                if (!roomType || count < 1) return;
                
                const existingRoom = currentState.selectedRooms.find(r => r.type === roomType);
                if (existingRoom) {
                    existingRoom.count = Math.min(6, (existingRoom.count || 1) + count);
                } else {
                    currentState.selectedRooms.push({ type: roomType, count: Math.min(6, count) });
                }
                calculatePricing();
                saveState();
            } catch (error) {
                console.error('Error adding room:', error);
            }
        },
        
        removeRoom: (roomType, count = 1) => {
            try {
                if (!roomType || count < 1) return;
                
                const roomIndex = currentState.selectedRooms.findIndex(r => r.type === roomType);
                if (roomIndex !== -1) {
                    const room = currentState.selectedRooms[roomIndex];
                    room.count = Math.max(0, (room.count || 1) - count);
                    if (room.count === 0) {
                        currentState.selectedRooms.splice(roomIndex, 1);
                    }
                }
                calculatePricing();
                saveState();
            } catch (error) {
                console.error('Error removing room:', error);
            }
        },
        
        toggleExtra: (extraId) => {
            try {
                if (!extraId) return;
                
                const extraIndex = currentState.extras.findIndex(e => e.id === extraId);
                if (extraIndex !== -1) {
                    currentState.extras.splice(extraIndex, 1);
                } else {
                    currentState.extras.push({ id: extraId });
                }
                calculatePricing();
                saveState();
            } catch (error) {
                console.error('Error toggling extra:', error);
            }
        }
    };
})();

// Initialize state on load
if (typeof window !== 'undefined') {
    try {
        const saved = localStorage.getItem('hotelBookingState');
        if (saved) {
            const state = JSON.parse(saved);
            BookingState.setState(state);
        }
    } catch (error) {
        console.warn('Error loading initial state:', error);
    }
}

// Make available globally
window.BookingState = BookingState;
