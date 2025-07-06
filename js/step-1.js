/**
 * Step 1: Date and Occupancy Selection
 * Handles calendar functionality, room/guest selection, and promo codes
 */

(() => {
    // Wait for dependencies to load
    const waitForDependencies = () => {
        return new Promise((resolve) => {
            const checkDependencies = () => {
                if (typeof BookingState !== 'undefined' && typeof BookingUtils !== 'undefined') {
                    resolve();
                } else {
                    setTimeout(checkDependencies, 50);
                }
            };
            checkDependencies();
        });
    };

    // Calendar state
    let currentMonth = new Date();
    let selectedCheckIn = null;
    let selectedCheckOut = null;
    let isSelectingCheckOut = false;
    
    // Elements
    const elements = {
        calendarGrid: null,
        currentMonth: null,
        prevMonth: null,
        nextMonth: null,
        checkInDate: null,
        checkOutDate: null,
        nightCount: null,
        selectedDates: null,
        roomCount: null,
        adultCount: null,
        childCount: null,
        decreaseRooms: null,
        increaseRooms: null,
        decreaseAdults: null,
        increaseAdults: null,
        decreaseChildren: null,
        increaseChildren: null,
        togglePromo: null,
        promoInput: null,
        nextStep: null,
        footerTooltip: null
    };
    
    // Initialize elements
    const initElements = () => {
        elements.calendarGrid = document.getElementById('calendarDays');
        elements.currentMonth = document.getElementById('currentMonth');
        elements.prevMonth = document.getElementById('prevMonth');
        elements.nextMonth = document.getElementById('nextMonth');
        elements.checkInDate = document.getElementById('checkInDate');
        elements.checkOutDate = document.getElementById('checkOutDate');
        elements.nightCount = document.getElementById('nightCount');
        elements.selectedDates = document.getElementById('selectedDates');
        elements.roomCount = document.getElementById('roomCount');
        elements.adultCount = document.getElementById('adultCount');
        elements.childCount = document.getElementById('childCount');
        elements.decreaseRooms = document.getElementById('decreaseRooms');
        elements.increaseRooms = document.getElementById('increaseRooms');
        elements.decreaseAdults = document.getElementById('decreaseAdults');
        elements.increaseAdults = document.getElementById('increaseAdults');
        elements.decreaseChildren = document.getElementById('decreaseChildren');
        elements.increaseChildren = document.getElementById('increaseChildren');
        elements.togglePromo = document.getElementById('togglePromo');
        elements.promoInput = document.getElementById('promoInput');
        elements.nextStep = document.getElementById('nextStep');
        elements.footerTooltip = document.getElementById('footerTooltip');
    };
    
    // Load saved state
    const loadSavedState = () => {
        const state = BookingState.getState();
        
        if (state.dates.checkIn) {
            selectedCheckIn = new Date(state.dates.checkIn);
        }
        if (state.dates.checkOut) {
            selectedCheckOut = new Date(state.dates.checkOut);
            isSelectingCheckOut = true;
        }
        
        if (elements.roomCount) elements.roomCount.textContent = state.rooms;
        if (elements.adultCount) elements.adultCount.textContent = state.guests.adults;
        if (elements.childCount) elements.childCount.textContent = state.guests.children;
        
        updateCounterButtons();
        updateSelectedDates();
        updateNextButton();
    };
    
    // Generate calendar days
    const generateCalendar = () => {
        if (!elements.calendarGrid) return;
        
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const prevLastDay = new Date(year, month, 0);
        const firstDayOfWeek = firstDay.getDay() || 7; // Convert Sunday (0) to 7
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let html = '';
        
        // Previous month days
        for (let i = firstDayOfWeek - 1; i > 0; i--) {
            const day = prevLastDay.getDate() - i + 1;
            html += `<button class="calendar-day outside" disabled>
                <span class="day-number">${day}</span>
            </button>`;
        }
        
        // Current month days
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(year, month, day);
            date.setHours(0, 0, 0, 0);
            const isPast = date < today;
            const isToday = date.getTime() === today.getTime();
            const isSelected = isDateSelected(date);
            const isInRange = isDateInRange(date);
            const isCheckIn = selectedCheckIn && date.getTime() === selectedCheckIn.getTime();
            const isCheckOut = selectedCheckOut && date.getTime() === selectedCheckOut.getTime();
            
            let classes = 'calendar-day';
            if (isPast) classes += ' disabled';
            if (isToday) classes += ' today';
            if (isSelected) classes += ' selected';
            if (isInRange) classes += ' in-range';
            if (isCheckIn) classes += ' range-start';
            if (isCheckOut) classes += ' range-end';
            
            // Generate random price for demo
            const price = isPast ? '' : `€${Math.floor(Math.random() * 50) + 80}`;
            
            html += `<button class="${classes}" data-date="${date.toISOString()}" ${isPast ? 'disabled' : ''}>
                <span class="day-number">${day}</span>
                <span class="day-price">${price}</span>
            </button>`;
        }
        
        // Next month days
        const remainingDays = 42 - (firstDayOfWeek - 1 + lastDay.getDate());
        for (let day = 1; day <= remainingDays; day++) {
            html += `<button class="calendar-day outside" disabled>
                <span class="day-number">${day}</span>
            </button>`;
        }
        
        elements.calendarGrid.innerHTML = html;
        
        // Update month display
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        if (elements.currentMonth) {
            elements.currentMonth.textContent = `${monthNames[month]} ${year}`;
        }
        
        // Add click handlers to calendar days
        document.querySelectorAll('.calendar-day:not(.outside):not(.disabled)').forEach(day => {
            day.addEventListener('click', handleDateClick);
        });
    };
    
    // Check if date is selected
    const isDateSelected = (date) => {
        return (selectedCheckIn && date.getTime() === selectedCheckIn.getTime()) ||
               (selectedCheckOut && date.getTime() === selectedCheckOut.getTime());
    };
    
    // Check if date is in range
    const isDateInRange = (date) => {
        if (!selectedCheckIn || !selectedCheckOut) return false;
        return date > selectedCheckIn && date < selectedCheckOut;
    };
    
    // Handle date click
    const handleDateClick = (e) => {
        const button = e.currentTarget;
        const date = new Date(button.dataset.date);
        
        if (!isSelectingCheckOut) {
            // Selecting check-in
            selectedCheckIn = date;
            selectedCheckOut = null;
            isSelectingCheckOut = true;
            
            BookingUtils.showNotification('Ahora selecciona la fecha de salida', 'info');
        } else {
            // Selecting check-out
            if (date <= selectedCheckIn) {
                // Reset selection if check-out is before check-in
                selectedCheckIn = date;
                selectedCheckOut = null;
                BookingUtils.showNotification('Ahora selecciona la fecha de salida', 'info');
            } else {
                selectedCheckOut = date;
                isSelectingCheckOut = false;
                
                // Calculate nights
                const nights = BookingUtils.calculateNights(selectedCheckIn, selectedCheckOut);
                BookingUtils.showNotification(`Has seleccionado ${nights} noche${nights > 1 ? 's' : ''}`, 'success');
            }
        }
        
        // Update calendar display
        generateCalendar();
        updateSelectedDates();
        updateNextButton();
        
        // Save to state
        saveCurrentState();
    };
    
    // Update selected dates display
    const updateSelectedDates = () => {
        if (!elements.selectedDates || !elements.checkInDate || !elements.checkOutDate || !elements.nightCount) return;
        
        if (selectedCheckIn) {
            elements.checkInDate.textContent = BookingUtils.formatDate(selectedCheckIn);
            elements.selectedDates.classList.remove('hidden');
        }
        
        if (selectedCheckOut) {
            elements.checkOutDate.textContent = BookingUtils.formatDate(selectedCheckOut);
            const nights = BookingUtils.calculateNights(selectedCheckIn, selectedCheckOut);
            elements.nightCount.textContent = nights;
        } else {
            elements.checkOutDate.textContent = '--';
            elements.nightCount.textContent = '--';
        }
    };
    
    // Handle month navigation
    const handleMonthChange = (direction) => {
        currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1);
        generateCalendar();
    };
    
    // Handle room/guest counters
    const updateCounter = (element, value, min, max) => {
        if (!element) return false;
        
        const current = parseInt(element.textContent);
        const newValue = current + value;
        
        if (newValue >= min && newValue <= max) {
            element.textContent = newValue;
            updateCounterButtons();
            updateNextButton();
            saveCurrentState();
            return true;
        }
        return false;
    };
    
    // Update counter button states
    const updateCounterButtons = () => {
        if (!elements.roomCount || !elements.adultCount || !elements.childCount) return;
        
        const rooms = parseInt(elements.roomCount.textContent);
        const adults = parseInt(elements.adultCount.textContent);
        const children = parseInt(elements.childCount.textContent);
        
        if (elements.decreaseRooms) elements.decreaseRooms.disabled = rooms <= 1;
        if (elements.increaseRooms) elements.increaseRooms.disabled = rooms >= 6;
        if (elements.decreaseAdults) elements.decreaseAdults.disabled = adults <= 1;
        if (elements.increaseAdults) elements.increaseAdults.disabled = adults >= 8;
        if (elements.decreaseChildren) elements.decreaseChildren.disabled = children <= 0;
        if (elements.increaseChildren) elements.increaseChildren.disabled = children >= 6;
    };
    
    // Update next button state
    const updateNextButton = () => {
        if (!elements.nextStep || !elements.footerTooltip) return;
        
        const hasValidDates = selectedCheckIn && selectedCheckOut;
        const isValid = hasValidDates && BookingState.validateStep(1);
        
        elements.nextStep.disabled = !isValid;
        
        if (!hasValidDates) {
            elements.footerTooltip.textContent = 'Selecciona las fechas para continuar';
        } else {
            const nights = BookingUtils.calculateNights(selectedCheckIn, selectedCheckOut);
            const rooms = parseInt(elements.roomCount?.textContent || '1');
            const adults = parseInt(elements.adultCount?.textContent || '2');
            const children = parseInt(elements.childCount?.textContent || '0');
            
            elements.footerTooltip.textContent = `${nights} noche${nights > 1 ? 's' : ''}, ${rooms} habitación${rooms > 1 ? 'es' : ''}, ${adults + children} huésped${(adults + children) > 1 ? 'es' : ''}`;
        }
    };
    
    // Save current state
    const saveCurrentState = () => {
        if (!elements.roomCount || !elements.adultCount || !elements.childCount) return;
        
        BookingState.setState({
            dates: {
                checkIn: selectedCheckIn ? selectedCheckIn.toISOString() : null,
                checkOut: selectedCheckOut ? selectedCheckOut.toISOString() : null,
                nights: BookingUtils.calculateNights(selectedCheckIn, selectedCheckOut)
            },
            rooms: parseInt(elements.roomCount.textContent),
            guests: {
                adults: parseInt(elements.adultCount.textContent),
                children: parseInt(elements.childCount.textContent),
                childrenAges: []
            }
        });
    };
    
    // Setup promo code functionality
    const setupPromoCode = () => {
        if (!elements.togglePromo || !elements.promoInput) return;
        
        elements.togglePromo.addEventListener('click', () => {
            elements.promoInput.classList.toggle('hidden');
            const isVisible = !elements.promoInput.classList.contains('hidden');
            
            if (isVisible) {
                const input = elements.promoInput.querySelector('input');
                if (input) input.focus();
            }
        });
        
        const promoApplyBtn = elements.promoInput.querySelector('.btn-secondary');
        const promoInput = elements.promoInput.querySelector('input');
        
        if (promoApplyBtn && promoInput) {
            promoApplyBtn.addEventListener('click', () => {
                const code = promoInput.value.trim().toUpperCase();
                
                if (!code) {
                    BookingUtils.showNotification('Por favor, introduce un código promocional', 'error');
                    return;
                }
                
                // Simulate promo code validation
                const validCodes = {
                    'VERANO2025': { percentage: 10, message: '10% de descuento aplicado' },
                    'BIENVENIDO': { percentage: 15, message: '15% de descuento para nuevos clientes' },
                    'HOTEL20': { percentage: 20, message: '20% de descuento especial aplicado' }
                };
                
                if (validCodes[code]) {
                    BookingState.setState({ promoCode: { code, ...validCodes[code] } });
                    BookingUtils.showNotification(validCodes[code].message, 'success');
                    
                    // Update UI
                    elements.togglePromo.innerHTML = `
                        <span>Código aplicado: ${code}</span>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="var(--color-success)">
                            <path d="M13.5 3.5L6 11l-3.5-3.5" stroke="currentColor" stroke-width="2" fill="none"/>
                        </svg>
                    `;
                    elements.promoInput.classList.add('hidden');
                } else {
                    BookingUtils.showNotification('Código promocional no válido', 'error');
                }
            });
            
            // Allow Enter key to apply promo code
            promoInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    promoApplyBtn.click();
                }
            });
        }
    };
    
    // Setup event listeners
    const setupEventListeners = () => {
        // Month navigation
        if (elements.prevMonth) {
            elements.prevMonth.addEventListener('click', () => handleMonthChange(-1));
        }
        if (elements.nextMonth) {
            elements.nextMonth.addEventListener('click', () => handleMonthChange(1));
        }
        
        // Room counters
        if (elements.decreaseRooms) {
            elements.decreaseRooms.addEventListener('click', () => {
                updateCounter(elements.roomCount, -1, 1, 6);
            });
        }
        if (elements.increaseRooms) {
            elements.increaseRooms.addEventListener('click', () => {
                updateCounter(elements.roomCount, 1, 1, 6);
            });
        }
        
        // Adult counters
        if (elements.decreaseAdults) {
            elements.decreaseAdults.addEventListener('click', () => {
                updateCounter(elements.adultCount, -1, 1, 8);
            });
        }
        if (elements.increaseAdults) {
            elements.increaseAdults.addEventListener('click', () => {
                updateCounter(elements.adultCount, 1, 1, 8);
            });
        }
        
        // Children counters
        if (elements.decreaseChildren) {
            elements.decreaseChildren.addEventListener('click', () => {
                updateCounter(elements.childCount, -1, 0, 6);
            });
        }
        if (elements.increaseChildren) {
            elements.increaseChildren.addEventListener('click', () => {
                updateCounter(elements.childCount, 1, 0, 6);
            });
        }
        
        // Next step button
        if (elements.nextStep) {
            elements.nextStep.addEventListener('click', () => {
                if (BookingState.validateStep(1)) {
                    BookingUtils.navigateToStep(2);
                } else {
                    BookingUtils.showNotification('Por favor, selecciona las fechas de tu estancia', 'error');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        }
        
        // FAB functionality
        const fab = document.querySelector('.fab');
        if (fab) {
            fab.addEventListener('click', () => {
                if (BookingState.validateStep(1)) {
                    BookingUtils.navigateToStep(2);
                } else {
                    BookingUtils.showNotification('Por favor, selecciona las fechas de tu estancia', 'error');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        }
        
        // Keyboard navigation for calendar
        document.addEventListener('keydown', (e) => {
            if (e.target.classList.contains('calendar-day')) {
                const days = Array.from(document.querySelectorAll('.calendar-day:not(.outside):not(.disabled)'));
                const currentIndex = days.indexOf(e.target);
                let newIndex = currentIndex;
                
                switch (e.key) {
                    case 'ArrowLeft':
                        newIndex = Math.max(0, currentIndex - 1);
                        break;
                    case 'ArrowRight':
                        newIndex = Math.min(days.length - 1, currentIndex + 1);
                        break;
                    case 'ArrowUp':
                        newIndex = Math.max(0, currentIndex - 7);
                        break;
                    case 'ArrowDown':
                        newIndex = Math.min(days.length - 1, currentIndex + 7);
                        break;
                    case 'Home':
                        newIndex = 0;
                        break;
                    case 'End':
                        newIndex = days.length - 1;
                        break;
                }
                
                if (newIndex !== currentIndex) {
                    e.preventDefault();
                    days[newIndex].focus();
                }
            }
        });
    };
    
    // Initialize
    const init = async () => {
        // Wait for dependencies
        await waitForDependencies();
        
        // Initialize elements
        initElements();
        
        // Load saved state first
        loadSavedState();
        
        // Generate initial calendar
        generateCalendar();
        
        // Setup event listeners
        setupEventListeners();
        
        // Setup promo code
        setupPromoCode();
        
        // Subscribe to state changes
        BookingState.subscribe((state, changes) => {
            if (changes.includes('dates') || changes.includes('rooms') || changes.includes('guests')) {
                updateNextButton();
            }
        });
    };
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();