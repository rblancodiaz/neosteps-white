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
        customer: {
            firstName: '',
            lastName: '',
            email: '',
            phone: ''
        },
        promoCode: null,
        totalPrice: 0,
        subtotalPrice: 0,
        discountAmount: 0,
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
        let subtotal = 0;
        const nights = currentState.dates.nights || 0;
        const selectedRooms = currentState.selectedRooms || [];
        const extras = currentState.extras || [];
        const adults = currentState.guests.adults || 2;
        
        // Calculate room prices
        selectedRooms.forEach(room => {
            const roomType = room.type;
            const roomCount = room.count || 1;
            const basePrice = roomPrices[roomType]?.base || 0;
            
            subtotal += basePrice * nights * roomCount;
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
            discountAmount = (subtotal * currentState.promoCode.percentage) / 100;
        }
        
        const total = subtotal - discountAmount;
        
        // Update state with calculated prices
        currentState.subtotalPrice = subtotal;
        currentState.discountAmount = discountAmount;
        currentState.totalPrice = total;
        
        return {
            subtotal,
            discount: discountAmount,
            total,
            breakdown: {
                rooms: selectedRooms,
                extras: extras,
                nights: nights
            }
        };
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
            switch (step) {
                case 1:
                    return currentState.dates.checkIn && 
                           currentState.dates.checkOut && 
                           currentState.rooms > 0 && 
                           currentState.guests.adults > 0;
                case 2:
                    return currentState.selectedRooms.length > 0;
                case 3:
                    return currentState.payment.method && 
                           currentState.customer.firstName && 
                           currentState.customer.lastName && 
                           currentState.customer.email;
                case 4:
                    return true;
                default:
                    return false;
            }
        },
        
        // Pricing functions
        calculatePricing,
        getRoomPrices: () => ({ ...roomPrices }),
        getExtraPrices: () => ({ ...extraPrices }),
        
        // Utility functions
        addRoom: (roomType, count = 1) => {
            const existingRoom = currentState.selectedRooms.find(r => r.type === roomType);
            if (existingRoom) {
                existingRoom.count = (existingRoom.count || 1) + count;
            } else {
                currentState.selectedRooms.push({ type: roomType, count });
            }
            calculatePricing();
            saveState();
        },
        
        removeRoom: (roomType, count = 1) => {
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
        },
        
        toggleExtra: (extraId) => {
            const extraIndex = currentState.extras.findIndex(e => e.id === extraId);
            if (extraIndex !== -1) {
                currentState.extras.splice(extraIndex, 1);
            } else {
                currentState.extras.push({ id: extraId });
            }
            calculatePricing();
            saveState();
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