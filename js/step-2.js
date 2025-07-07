/**
 * Step 2: Room and Rate Selection
 * Handles room selection, rate selection, and extras
 */

(() => {
    // State management
    const state = BookingState.getState();
    let currentView = 'rooms'; // 'rooms' or 'rates'
    let currentRoomSelection = null;
    let selectedRate = null;
    let selectedExtras = [];
    let appliedPromoCode = state.promoCode || null;
    
    // Room data with multiple rates
    const roomsData = [
        {
            id: 'cosy-room',
            name: 'Habitación Acogedora',
            category: 'standard',
            capacity: { adults: 2, children: 0 },
            basePrice: 166,
            images: [
                'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800',
                'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
                'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'
            ],
            amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Minibar'],
            description: 'Una habitación cómoda y elegante con todas las comodidades modernas.',
            rates: [
                {
                    id: 'early-booking',
                    name: 'Reserva Anticipada',
                    price: 141,
                    originalPrice: 166,
                    discount: 15,
                    description: 'Esta tarifa ofrece un 15% de descuento sobre la mejor tarifa pública disponible.',
                    conditions: 'Pago del 100% al hacer la reserva. No permite modificación ni reembolso.',
                    features: [
                        { text: 'No cancelable', positive: false },
                        { text: '100% depósito por adelantado', positive: false },
                        { text: 'No modificable', positive: false }
                    ]
                },
                {
                    id: 'best-available',
                    name: 'Mejor Tarifa Disponible',
                    price: 166,
                    description: 'Precio con condiciones de cancelación flexibles.',
                    conditions: 'Cancelación gratuita hasta 48 horas antes. En caso de cancelación tardía se cobrará la primera noche.',
                    features: [
                        { text: 'Cancelable bajo condiciones', positive: true },
                        { text: 'Sin depósito por adelantado', positive: true }
                    ]
                },
                {
                    id: 'bb-rate',
                    name: 'Tarifa con Desayuno',
                    price: 208,
                    description: 'Incluye desayuno buffet gourmet.',
                    conditions: 'Desayuno servido entre 6:30 y 11:00. Productos frescos y locales.',
                    features: [
                        { text: 'Cancelable bajo condiciones', positive: true },
                        { text: 'Sin depósito por adelantado', positive: true },
                        { text: 'Desayuno incluido', positive: true }
                    ]
                }
            ]
        },
        {
            id: 'comfort-room',
            name: 'Habitación Confort',
            category: 'standard',
            capacity: { adults: 2, children: 1 },
            basePrice: 186,
            images: [
                'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800',
                'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800'
            ],
            amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Minibar', 'Balcón'],
            description: 'Espaciosa habitación con balcón y vistas.',
            rates: [
                {
                    id: 'early-booking',
                    name: 'Reserva Anticipada',
                    price: 158,
                    originalPrice: 186,
                    discount: 15,
                    description: 'Esta tarifa ofrece un 15% de descuento sobre la mejor tarifa pública disponible.',
                    conditions: 'Pago del 100% al hacer la reserva. No permite modificación ni reembolso.',
                    features: [
                        { text: 'No cancelable', positive: false },
                        { text: '100% depósito por adelantado', positive: false },
                        { text: 'No modificable', positive: false }
                    ]
                },
                {
                    id: 'best-available',
                    name: 'Mejor Tarifa Disponible',
                    price: 186,
                    description: 'Precio con condiciones de cancelación flexibles.',
                    conditions: 'Cancelación gratuita hasta 48 horas antes.',
                    features: [
                        { text: 'Cancelable bajo condiciones', positive: true },
                        { text: 'Sin depósito por adelantado', positive: true }
                    ]
                }
            ]
        },
        {
            id: 'exclusive-room',
            name: 'Habitación Exclusiva',
            category: 'superior',
            capacity: { adults: 2, children: 0 },
            basePrice: 246,
            images: [
                'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800',
                'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800'
            ],
            amenities: ['WiFi', 'TV 55"', 'Aire acondicionado', 'Minibar Premium', 'Vista al mar'],
            description: 'Habitación de lujo con vistas espectaculares al mar.',
            rates: [
                {
                    id: 'promotional',
                    name: 'Tarifa Promocional',
                    price: 246,
                    description: 'Incluye acceso al spa.',
                    conditions: 'CONTACTAR AL HOTEL PARA RESERVAR SPA: 05.46.50.07.99',
                    features: [
                        { text: 'Cancelable bajo condiciones', positive: true },
                        { text: 'Sin depósito por adelantado', positive: true },
                        { text: 'Acceso spa 45 min', positive: true }
                    ]
                },
                {
                    id: 'cocooning',
                    name: 'Oferta Cocooning',
                    price: 376,
                    description: 'Escapada de bienestar completa.',
                    conditions: 'Incluye masaje duo de 30 minutos y acceso privado al spa.',
                    features: [
                        { text: 'Cancelable bajo condiciones', positive: true },
                        { text: 'Sin depósito por adelantado', positive: true },
                        { text: 'Masaje duo incluido', positive: true },
                        { text: 'Spa privado 30 min', positive: true }
                    ]
                }
            ]
        }
    ];
    
    // Extras data
    const extrasData = {
        pet: [
            {
                id: 'pet',
                name: 'Mascota',
                price: 20,
                unit: 'Por noche',
                description: 'Suplemento obligatorio para todos los animales independientemente del tamaño o peso.'
            }
        ],
        parking: [
            {
                id: 'parking',
                name: 'Parking',
                price: 20,
                unit: 'Por noche',
                description: 'PLAZAS LIMITADAS. ACCESO SUBTERRÁNEO ESTRECHO. Por favor especifique marca y modelo del vehículo.',
                note: 'Sin confirmación por email del hotel, no se garantiza la plaza.'
            }
        ],
        spa: [
            {
                id: 'massage-solo',
                name: 'Masaje solo Sothys',
                price: 70,
                unit: 'Por estancia',
                description: 'Masaje personalizado de 30 minutos. CONTACTAR AL HOTEL PARA RESERVAR: 05.46.50.07.99'
            },
            {
                id: 'spa-access',
                name: 'Acceso al spa',
                price: 45,
                unit: 'Por persona',
                description: 'Acceso a sauna/hammam o jacuzzi durante 45 minutos.'
            }
        ]
    };
    
    // Valid promo codes
    const validPromoCodes = {
        'VERANO2025': { percentage: 10, message: '10% de descuento aplicado' },
        'BIENVENIDO': { percentage: 15, message: '15% de descuento para nuevos clientes' },
        'HOTEL20': { percentage: 20, message: '20% de descuento especial aplicado' }
    };
    
    // Elements
    const elements = {
        // Views
        roomSelectionView: document.getElementById('roomSelectionView'),
        rateSelectionView: document.getElementById('rateSelectionView'),
        
        // Summary bar
        summaryCheckIn: document.getElementById('summaryCheckIn'),
        summaryCheckOut: document.getElementById('summaryCheckOut'),
        summaryNights: document.getElementById('summaryNights'),
        summaryRooms: document.getElementById('summaryRooms'),
        summaryGuests: document.getElementById('summaryGuests'),
        
        // Room selection
        selectedRoomCount: document.getElementById('selectedRoomCount'),
        totalRoomCount: document.getElementById('totalRoomCount'),
        roomsGrid: document.getElementById('roomsGrid'),
        
        // Rate selection
        selectedRoomSummary: document.getElementById('selectedRoomSummary'),
        rateOptions: document.getElementById('rateOptions'),
        
        // Promo code
        togglePromo: document.getElementById('togglePromo'),
        promoContent: document.getElementById('promoContent'),
        promoCodeInput: document.getElementById('promoCodeInput'),
        applyPromo: document.getElementById('applyPromo'),
        promoApplied: document.getElementById('promoApplied'),
        promoMessage: document.getElementById('promoMessage'),
        removePromo: document.getElementById('removePromo'),
        
        // Extras
        extrasContent: document.getElementById('extrasContent'),
        specialRequests: document.getElementById('specialRequests'),
        
        // Navigation
        changeDates: document.getElementById('changeDates'),
        backToRooms: document.getElementById('backToRooms'),
        nextStep: document.getElementById('nextStep'),
        nextStepText: document.getElementById('nextStepText'),
        footerTooltip: document.getElementById('footerTooltip'),
        
        // Floating summary
        floatingSummary: document.getElementById('floatingSummary'),
        toggleSummary: document.getElementById('toggleSummary'),
        priceDetails: document.getElementById('priceDetails'),
        totalPrice: document.getElementById('totalPrice')
    };
    
    // Initialize
    const init = () => {
        // Check if coming from valid step
        if (!BookingState.validateStep(1)) {
            BookingUtils.navigateToStep(1);
            return;
        }
        
        // Load state
        loadSavedState();
        
        // Setup components
        setupRoomFilters();
        renderRooms();
        setupPromoCode();
        setupExtras();
        setupFloatingSummary();
        setupNavigation();
        
        // Update UI
        updateSummaryBar();
        updateFooter();
    };
    
    // Load saved state
    const loadSavedState = () => {
        // Check if we have a selected room with rate from previous session
        if (state.selectedRooms && state.selectedRooms.length > 0) {
            const savedRoom = state.selectedRooms[0];
            const room = roomsData.find(r => r.id === savedRoom.roomId);
            if (room) {
                currentRoomSelection = room;
                selectedRate = savedRoom.rateId;
                showRateSelection();
            }
        }
        
        selectedExtras = state.extras || [];
    };
    
    // Update summary bar
    const updateSummaryBar = () => {
        elements.summaryCheckIn.textContent = BookingUtils.formatDate(state.dates.checkIn);
        elements.summaryCheckOut.textContent = BookingUtils.formatDate(state.dates.checkOut);
        elements.summaryNights.textContent = state.dates.nights;
        elements.summaryRooms.textContent = state.rooms;
        elements.summaryGuests.textContent = state.guests.adults + state.guests.children;
        elements.totalRoomCount.textContent = state.rooms;
    };
    
    // Setup room filters
    const setupRoomFilters = () => {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                filterRooms(e.target.dataset.filter);
            });
        });
    };
    
    // Filter rooms
    const filterRooms = (filter) => {
        const rooms = document.querySelectorAll('.room-card');
        rooms.forEach(room => {
            if (filter === 'all' || room.dataset.category === filter) {
                room.style.display = 'grid';
            } else {
                room.style.display = 'none';
            }
        });
    };
    
    // Render rooms
    const renderRooms = () => {
        const availableRooms = filterRoomsByCapacity();
        
        elements.roomsGrid.innerHTML = availableRooms.map(room => `
            <div class="room-card" data-room-id="${room.id}" data-category="${room.category}">
                <div class="room-gallery">
                    <div class="room-images" data-current="0">
                        ${room.images.map(img => `<img src="${img}" alt="${room.name}" class="room-image">`).join('')}
                    </div>
                    <div class="gallery-nav">
                        ${room.images.map((_, idx) => `<span class="gallery-dot ${idx === 0 ? 'active' : ''}" data-index="${idx}"></span>`).join('')}
                    </div>
                </div>
                
                <div class="room-details">
                    <div class="room-header">
                        <h3 class="room-name">${room.name}</h3>
                        <div class="room-capacity">
                            <span>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M8 8a2 2 0 100-4 2 2 0 000 4zM8 9c-2.67 0-8 1.34-8 4v1h16v-1c0-2.66-5.33-4-8-4z"/>
                                </svg>
                                ${room.capacity.adults} adultos
                            </span>
                            ${room.capacity.children > 0 ? `
                                <span>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                        <path d="M8 8a2 2 0 100-4 2 2 0 000 4zM8 9c-2.67 0-8 1.34-8 4v1h16v-1c0-2.66-5.33-4-8-4z"/>
                                    </svg>
                                    ${room.capacity.children} niños
                                </span>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="room-amenities">
                        ${room.amenities.map(amenity => `
                            <span class="amenity-tag">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                                    <path d="M10 3L4.5 8.5 2 6" stroke="currentColor" stroke-width="2" fill="none"/>
                                </svg>
                                ${amenity}
                            </span>
                        `).join('')}
                    </div>
                    
                    <p class="room-description">${room.description}</p>
                    
                    <div class="room-footer">
                        <div class="room-price">
                            <span class="price-from">Desde</span>
                            <span class="price-amount">${BookingUtils.formatCurrency(Math.min(...room.rates.map(r => r.price)))}</span>
                            <span class="price-period">/ noche</span>
                        </div>
                        <button class="btn-primary" onclick="selectRoom('${room.id}')">
                            Seleccionar
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Setup gallery navigation
        setupGalleryNavigation();
    };
    
    // Filter rooms by capacity
    const filterRoomsByCapacity = () => {
        const totalGuests = state.guests.adults + state.guests.children;
        const guestsPerRoom = Math.ceil(totalGuests / state.rooms);
        
        return roomsData.filter(room => {
            const totalCapacity = room.capacity.adults + room.capacity.children;
            return totalCapacity >= guestsPerRoom;
        });
    };
    
    // Setup gallery navigation
    const setupGalleryNavigation = () => {
        document.querySelectorAll('.room-gallery').forEach(gallery => {
            const images = gallery.querySelector('.room-images');
            const dots = gallery.querySelectorAll('.gallery-dot');
            let currentIndex = 0;
            
            dots.forEach((dot, index) => {
                dot.addEventListener('click', (e) => {
                    e.stopPropagation();
                    currentIndex = index;
                    images.style.transform = `translateX(-${index * 100}%)`;
                    dots.forEach(d => d.classList.remove('active'));
                    dot.classList.add('active');
                });
            });
        });
    };
    
    // Select room (global function for onclick)
    window.selectRoom = (roomId) => {
        const room = roomsData.find(r => r.id === roomId);
        if (room) {
            currentRoomSelection = room;
            showRateSelection();
        }
    };
    
    // Show rate selection
    const showRateSelection = () => {
        currentView = 'rates';
        elements.roomSelectionView.classList.add('hidden');
        elements.rateSelectionView.classList.remove('hidden');
        
        // Update room summary
        elements.selectedRoomSummary.innerHTML = `
            <img src="${currentRoomSelection.images[0]}" alt="${currentRoomSelection.name}" class="summary-room-image">
            <div class="summary-room-info">
                <h3 class="summary-room-name">${currentRoomSelection.name}</h3>
                <p class="summary-room-details">
                    ${currentRoomSelection.capacity.adults} adultos
                    ${currentRoomSelection.capacity.children > 0 ? `, ${currentRoomSelection.capacity.children} niños` : ''}
                    • ${state.dates.nights} noche${state.dates.nights > 1 ? 's' : ''}
                </p>
            </div>
        `;
        
        // Render rates
        renderRates();
        
        // Update footer
        elements.nextStepText.textContent = 'Proceder al pago';
        updateFooter();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    // Render rates
    const renderRates = () => {
        const nights = state.dates.nights;
        
        elements.rateOptions.innerHTML = currentRoomSelection.rates.map(rate => {
            const totalPrice = rate.price * nights;
            const originalTotal = rate.originalPrice ? rate.originalPrice * nights : null;
            const isSelected = selectedRate === rate.id;
            
            return `
                <div class="rate-card ${isSelected ? 'selected' : ''}" data-rate-id="${rate.id}">
                    <div class="rate-header">
                        <h4 class="rate-title">${rate.name}</h4>
                        <div class="rate-price-info">
                            ${originalTotal ? `<div class="rate-original-price">${BookingUtils.formatCurrency(originalTotal)}</div>` : ''}
                            <div>
                                <span class="rate-price">${BookingUtils.formatCurrency(totalPrice)}</span>
                                <span class="rate-price-period"> / ${nights} noche${nights > 1 ? 's' : ''}</span>
                            </div>
                            <div class="rate-taxes">(IVA e impuestos incluidos)</div>
                        </div>
                    </div>
                    
                    <p class="rate-description">${rate.description}</p>
                    
                    <div class="rate-details">
                        <div class="rate-details-content" id="details-${rate.id}" style="display: none;">
                            ${rate.conditions}
                        </div>
                        <button class="btn-read-more" onclick="toggleDetails('${rate.id}')">
                            Leer más
                        </button>
                    </div>
                    
                    <div class="rate-features">
                        ${rate.features.map(feature => `
                            <span class="rate-feature ${feature.positive ? 'positive' : 'negative'}">
                                ${feature.positive ? '✓' : '✗'} ${feature.text}
                            </span>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');
        
        // Add click handlers
        document.querySelectorAll('.rate-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('btn-read-more')) {
                    selectRate(card.dataset.rateId);
                }
            });
        });
        
        // If we have a selected rate, update summary
        if (selectedRate) {
            updatePriceSummary();
        }
    };
    
    // Toggle rate details (global function)
    window.toggleDetails = (rateId) => {
        const details = document.getElementById(`details-${rateId}`);
        const button = details.nextElementSibling;
        
        if (details.style.display === 'none') {
            details.style.display = 'block';
            button.textContent = 'Leer menos';
        } else {
            details.style.display = 'none';
            button.textContent = 'Leer más';
        }
    };
    
    // Select rate
    const selectRate = (rateId) => {
        selectedRate = rateId;
        
        // Update UI
        document.querySelectorAll('.rate-card').forEach(card => {
            card.classList.toggle('selected', card.dataset.rateId === rateId);
        });
        
        // Update summary and footer
        updatePriceSummary();
        updateFooter();
        
        // Enable next button
        elements.nextStep.disabled = false;
    };
    
    // Setup promo code
    const setupPromoCode = () => {
        elements.togglePromo.addEventListener('click', () => {
            elements.promoContent.classList.toggle('hidden');
            if (!elements.promoContent.classList.contains('hidden')) {
                elements.promoCodeInput.focus();
            }
        });
        
        elements.applyPromo.addEventListener('click', applyPromoCode);
        elements.promoCodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') applyPromoCode();
        });
        
        elements.removePromo.addEventListener('click', removePromoCode);
        
        // Load existing promo
        if (appliedPromoCode) {
            showAppliedPromo();
        }
    };
    
    // Apply promo code
    const applyPromoCode = () => {
        const code = elements.promoCodeInput.value.trim().toUpperCase();
        
        if (!code) {
            BookingUtils.showNotification('Por favor, introduce un código', 'error');
            return;
        }
        
        if (validPromoCodes[code]) {
            appliedPromoCode = { code, ...validPromoCodes[code] };
            BookingState.setState({ promoCode: appliedPromoCode });
            showAppliedPromo();
            updatePriceSummary();
            BookingUtils.showNotification(appliedPromoCode.message, 'success');
        } else {
            BookingUtils.showNotification('Código no válido', 'error');
        }
    };
    
    // Show applied promo
    const showAppliedPromo = () => {
        elements.promoCodeInput.style.display = 'none';
        elements.applyPromo.style.display = 'none';
        elements.promoApplied.classList.remove('hidden');
        elements.promoMessage.textContent = appliedPromoCode.message;
    };
    
    // Remove promo code
    const removePromoCode = () => {
        appliedPromoCode = null;
        BookingState.setState({ promoCode: null });
        
        elements.promoCodeInput.value = '';
        elements.promoCodeInput.style.display = 'block';
        elements.applyPromo.style.display = 'block';
        elements.promoApplied.classList.add('hidden');
        
        updatePriceSummary();
        BookingUtils.showNotification('Código eliminado', 'info');
    };
    
    // Setup extras
    const setupExtras = () => {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderExtrasTab(btn.dataset.tab);
            });
        });
        
        // Initial render
        renderExtrasTab('pet');
    };
    
    // Render extras tab
    const renderExtrasTab = (tab) => {
        const extras = extrasData[tab] || [];
        
        elements.extrasContent.innerHTML = extras.map(extra => {
            const isSelected = selectedExtras.some(e => e.id === extra.id);
            
            return `
                <div class="extra-item">
                    <input type="checkbox" class="extra-checkbox" id="extra-${extra.id}" 
                           ${isSelected ? 'checked' : ''} onchange="toggleExtra('${extra.id}')">
                    <div class="extra-info">
                        <div class="extra-header">
                            <h4 class="extra-name">${extra.name}</h4>
                            <div>
                                <span class="extra-price">${BookingUtils.formatCurrency(extra.price)}</span>
                                <span class="extra-unit">${extra.unit}</span>
                            </div>
                        </div>
                        <p class="extra-description">${extra.description}</p>
                        ${extra.note ? `<p class="extra-note">${extra.note}</p>` : ''}
                    </div>
                    <div class="extra-actions">
                        <button class="btn-add-extra ${isSelected ? 'added' : ''}" 
                                onclick="toggleExtra('${extra.id}')">
                            ${isSelected ? 'Añadido' : 'Añadir'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    };
    
    // Toggle extra (global function)
    window.toggleExtra = (extraId) => {
        // Find extra data
        let extraData = null;
        for (const category in extrasData) {
            const found = extrasData[category].find(e => e.id === extraId);
            if (found) {
                extraData = found;
                break;
            }
        }
        
        if (!extraData) return;
        
        const index = selectedExtras.findIndex(e => e.id === extraId);
        
        if (index > -1) {
            // Remove extra
            selectedExtras.splice(index, 1);
        } else {
            // Add extra
            selectedExtras.push({
                ...extraData,
                quantity: 1
            });
        }
        
        // Update UI
        const checkbox = document.getElementById(`extra-${extraId}`);
        const button = checkbox.parentElement.querySelector('.btn-add-extra');
        
        if (checkbox) checkbox.checked = index === -1;
        if (button) {
            button.textContent = index === -1 ? 'Añadido' : 'Añadir';
            button.classList.toggle('added', index === -1);
        }
        
        // Update summary
        updatePriceSummary();
    };
    
    // Setup floating summary
    const setupFloatingSummary = () => {
        elements.toggleSummary.addEventListener('click', () => {
           elements.floatingSummary.classList.toggle('collapsed');
       });
   };
   
   // Update price summary
   const updatePriceSummary = () => {
       if (!currentRoomSelection || !selectedRate) {
           elements.priceDetails.innerHTML = '<p class="empty-message">No hay habitaciones seleccionadas</p>';
           elements.totalPrice.textContent = '€0';
           return;
       }
       
       const rate = currentRoomSelection.rates.find(r => r.id === selectedRate);
       if (!rate) return;
       
       let subtotal = 0;
       let html = '';
       
       // Room price
       const roomTotal = rate.price * state.dates.nights;
       subtotal += roomTotal;
       
       html += `
           <div class="price-line">
               <span>${currentRoomSelection.name} - ${rate.name}</span>
               <span>${BookingUtils.formatCurrency(roomTotal)}</span>
           </div>
       `;
       
       // Extras
       selectedExtras.forEach(extra => {
           let extraTotal = extra.price;
           
           if (extra.unit.includes('noche')) {
               extraTotal *= state.dates.nights;
           } else if (extra.unit.includes('persona')) {
               extraTotal *= (state.guests.adults + state.guests.children);
           }
           
           subtotal += extraTotal;
           
           html += `
               <div class="price-line">
                   <span>${extra.name}</span>
                   <span>${BookingUtils.formatCurrency(extraTotal)}</span>
               </div>
           `;
       });
       
       // Promo discount
       let discount = 0;
       if (appliedPromoCode) {
           discount = subtotal * (appliedPromoCode.percentage / 100);
           html += `
               <div class="price-line">
                   <span>Descuento ${appliedPromoCode.code}</span>
                   <span class="text-success">-${BookingUtils.formatCurrency(discount)}</span>
               </div>
           `;
       }
       
       // Taxes
       const finalSubtotal = subtotal - discount;
       const taxes = finalSubtotal * 0.10;
       const total = finalSubtotal + taxes;
       
       html += `
           <div class="price-line">
               <span>Impuestos (10%)</span>
               <span>${BookingUtils.formatCurrency(taxes)}</span>
           </div>
       `;
       
       elements.priceDetails.innerHTML = html;
       elements.totalPrice.textContent = BookingUtils.formatCurrency(total);
       
       // Update state
       BookingState.setState({
           pricing: {
               subtotal: finalSubtotal,
               taxes: taxes,
               fees: 0,
               discount: discount,
               total: total
           }
       });
   };
   
   // Setup navigation
   const setupNavigation = () => {
       // Change dates
       elements.changeDates.addEventListener('click', () => {
           BookingUtils.navigateToStep(1);
       });
       
       // Back to rooms
       elements.backToRooms.addEventListener('click', () => {
           currentView = 'rooms';
           elements.rateSelectionView.classList.add('hidden');
           elements.roomSelectionView.classList.remove('hidden');
           elements.nextStepText.textContent = 'Siguiente';
           updateFooter();
       });
       
       // Next step
       elements.nextStep.addEventListener('click', () => {
           if (currentView === 'rooms') {
               // Need to select a room first
               BookingUtils.showNotification('Por favor, selecciona una habitación', 'error');
           } else if (currentView === 'rates') {
               if (!selectedRate) {
                   BookingUtils.showNotification('Por favor, selecciona una tarifa', 'error');
                   return;
               }
               
               // Save selection
               saveSelection();
               
               // Navigate to payment
               BookingUtils.navigateToStep(3);
           }
       });
   };
   
   // Update footer
   const updateFooter = () => {
       if (currentView === 'rooms') {
           elements.footerTooltip.textContent = 'Selecciona una habitación para continuar';
           elements.nextStep.disabled = true;
       } else if (currentView === 'rates') {
           if (!selectedRate) {
               elements.footerTooltip.textContent = 'Selecciona una tarifa para continuar';
               elements.nextStep.disabled = true;
           } else {
               const total = BookingState.getState().pricing?.total || 0;
               elements.footerTooltip.textContent = `Total: ${BookingUtils.formatCurrency(total)}`;
               elements.nextStep.disabled = false;
           }
       }
   };
   
   // Save selection
   const saveSelection = () => {
       // Validate current room selection
       if (!currentRoomSelection || !selectedRate) {
           console.error('No room or rate selected');
           return false;
       }
       
       const rate = currentRoomSelection.rates.find(r => r.id === selectedRate);
       if (!rate) {
           console.error('Selected rate not found');
           return false;
       }
       
       // For single room booking
       const roomSelection = {
           roomId: currentRoomSelection.id,
           name: currentRoomSelection.name,
           rateId: selectedRate,
           rateName: rate.name,
           price: rate.price,
           images: currentRoomSelection.images,
           capacity: currentRoomSelection.capacity
       };
       
       // Save to state
       BookingState.setState({
           selectedRooms: [roomSelection],
           extras: selectedExtras
       });
       
       // Save special requests if provided
       if (elements.specialRequests && elements.specialRequests.value) {
           BookingState.setNestedState('customerInfo', {
               specialRequests: elements.specialRequests.value
           });
       }
       
       // Recalculate pricing
       BookingState.calculatePricing();
   };
   
   // Initialize when DOM is ready
   if (document.readyState === 'loading') {
       document.addEventListener('DOMContentLoaded', init);
   } else {
       init();
   }
})();
