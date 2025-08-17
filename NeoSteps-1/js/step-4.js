/**
 * Step 4: Booking Confirmation
 * Displays booking confirmation and provides action options
 */

(() => {
    // Get booking state
    const state = BookingState.getState();
    
    // Elements
    const elements = {
        // Header
        confirmationEmail: document.getElementById('confirmationEmail'),
        bookingId: document.getElementById('bookingId'),
        
        // Guest info
        guestName: document.getElementById('guestName'),
        guestEmail: document.getElementById('guestEmail'),
        guestPhone: document.getElementById('guestPhone'),
        guestCountry: document.getElementById('guestCountry'),
        
        // Stay details
        checkInDate: document.getElementById('checkInDate'),
        checkOutDate: document.getElementById('checkOutDate'),
        nightsCount: document.getElementById('nightsCount'),
        
        // Lists
        roomsList: document.getElementById('roomsList'),
        extrasList: document.getElementById('extrasList'),
        extrasSection: document.getElementById('extrasSection'),
        
        // Payment
        paymentMethod: document.getElementById('paymentMethod'),
        subtotal: document.getElementById('subtotal'),
        discountRow: document.getElementById('discountRow'),
        discount: document.getElementById('discount'),
        taxes: document.getElementById('taxes'),
        totalPaid: document.getElementById('totalPaid'),
        
        // Buttons
        printButton: document.getElementById('printButton'),
        downloadButton: document.getElementById('downloadButton'),
        newBookingButton: document.getElementById('newBookingButton')
    };
    
    // Country names mapping
    const countryNames = {
        'ES': 'España',
        'FR': 'Francia',
        'DE': 'Alemania',
        'IT': 'Italia',
        'GB': 'Reino Unido',
        'US': 'Estados Unidos',
        'MX': 'México',
        'AR': 'Argentina',
        'CO': 'Colombia',
        'CL': 'Chile'
    };
    
    // Payment method names
    const paymentMethodNames = {
        'card': 'Tarjeta de crédito/débito',
        'paypal': 'PayPal',
        'hotel': 'Pago en el hotel'
    };
    
    // Load confirmation data
    const loadConfirmationData = () => {
        // Check if we have a valid booking
        if (!state.bookingId) {
            showError();
            return;
        }
        
        // Header info
        elements.confirmationEmail.textContent = state.customerInfo.email;
        elements.bookingId.textContent = state.bookingId;
        
        // Guest info
        elements.guestName.textContent = `${state.customerInfo.firstName} ${state.customerInfo.lastName}`;
        elements.guestEmail.textContent = state.customerInfo.email;
        elements.guestPhone.textContent = state.customerInfo.phone;
        elements.guestCountry.textContent = countryNames[state.customerInfo.country] || state.customerInfo.country;
        
        // Stay details
        elements.checkInDate.textContent = BookingUtils.formatDateForDisplay(state.dates.checkIn);
        elements.checkOutDate.textContent = BookingUtils.formatDateForDisplay(state.dates.checkOut);
        elements.nightsCount.textContent = `${state.dates.nights} noche${state.dates.nights > 1 ? 's' : ''}`;
        
        // Rooms
        renderRooms();
        
        // Extras
        if (state.extras && state.extras.length > 0) {
            elements.extrasSection.style.display = 'block';
            renderExtras();
        }
        
        // Payment info
        elements.paymentMethod.textContent = paymentMethodNames[state.paymentInfo.method];
        if (state.paymentInfo.method === 'card' && state.paymentInfo.cardDetails) {
            elements.paymentMethod.textContent += ` (**** ${state.paymentInfo.cardDetails.last4})`;
        }
        
        // Pricing
        elements.subtotal.textContent = BookingUtils.formatCurrency(state.pricing.subtotal);
        elements.taxes.textContent = BookingUtils.formatCurrency(state.pricing.taxes);
        elements.totalPaid.textContent = BookingUtils.formatCurrency(state.pricing.total);
        
        // Discount
        if (state.pricing.discount > 0) {
            elements.discountRow.style.display = 'flex';
            elements.discount.textContent = `-${BookingUtils.formatCurrency(state.pricing.discount)}`;
        }
    };
    
    // Render rooms
    const renderRooms = () => {
        const roomsHtml = state.selectedRooms.map(room => {
            const roomTotal = room.price * state.dates.nights;
            return `
                <div class="room-item">
                    <img src="${room.images[0]}" alt="${room.name}" class="room-image">
                    <div class="room-info">
                        <h4 class="room-name">${room.name}</h4>
                        <p class="room-details">
                            ${room.capacity.adults} adulto${room.capacity.adults > 1 ? 's' : ''}
                            ${room.capacity.children > 0 ? `, ${room.capacity.children} niño${room.capacity.children > 1 ? 's' : ''}` : ''}
                            • ${state.dates.nights} noche${state.dates.nights > 1 ? 's' : ''}
                        </p>
                    </div>
                    <div class="room-price">
                        ${BookingUtils.formatCurrency(roomTotal)}
                    </div>
                </div>
            `;
        }).join('');
        
        elements.roomsList.innerHTML = roomsHtml;
    };
    
    // Render extras
    const renderExtras = () => {
        const extrasHtml = state.extras.map(extra => {
            let extraTotal = extra.price;
            
            if (extra.unit.includes('noche')) {
                extraTotal *= state.dates.nights;
            }
            if (extra.unit.includes('persona')) {
                extraTotal *= (state.guests.adults + state.guests.children);
            }
            
            return `
                <div class="extra-item">
                    <span class="extra-name">${extra.name}</span>
                    <span class="extra-price">${BookingUtils.formatCurrency(extraTotal)}</span>
                </div>
            `;
        }).join('');
        
        elements.extrasList.innerHTML = extrasHtml;
    };
    
    // Show error state
    const showError = () => {
        document.querySelector('.main-content').innerHTML = `
            <div class="container">
                <div class="confirmation-header">
                    <h2 class="confirmation-title" style="color: var(--color-error);">
                        No se encontró la reserva
                    </h2>
                    <p class="confirmation-subtitle">
                        No hemos podido cargar los detalles de tu reserva. 
                        Por favor, inicia una nueva reserva.
                    </p>
                    <button class="btn-primary" onclick="location.href='step-1.html'">
                        Nueva reserva
                    </button>
                </div>
            </div>
        `;
    };
    
    // Print confirmation
    const printConfirmation = () => {
        window.print();
    };
    
    // Download PDF (simulated)
    const downloadPDF = () => {
        BookingUtils.showNotification('Generando PDF...', 'info');
        
        // Simulate PDF generation
        setTimeout(() => {
            // Create a blob with confirmation data
            const confirmationText = `
CONFIRMACIÓN DE RESERVA
========================

Número de reserva: ${state.bookingId}
Fecha: ${new Date().toLocaleDateString('es-ES')}

DATOS DEL HUÉSPED
-----------------
Nombre: ${state.customerInfo.firstName} ${state.customerInfo.lastName}
Email: ${state.customerInfo.email}
Teléfono: ${state.customerInfo.phone}
País: ${countryNames[state.customerInfo.country] || state.customerInfo.country}

DETALLES DE LA ESTANCIA
-----------------------
Check-in: ${BookingUtils.formatDateForDisplay(state.dates.checkIn)}
Check-out: ${BookingUtils.formatDateForDisplay(state.dates.checkOut)}
Noches: ${state.dates.nights}

HABITACIONES
------------
${state.selectedRooms.map(room => `- ${room.name}: ${BookingUtils.formatCurrency(room.price * state.dates.nights)}`).join('\n')}

TOTAL PAGADO: ${BookingUtils.formatCurrency(state.pricing.total)}

HOTEL LA MONNAIE
3 Rue de la Monnaie
17000 La Rochelle, Francia
Tel: +33 5 46 50 65 65
Email: contact@hotelmonnaie.com
            `;
            
            const blob = new Blob([confirmationText], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `reserva-${state.bookingId}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            BookingUtils.showNotification('Archivo descargado correctamente', 'success');
        }, 1500);
    };
    
    // Send confirmation email (simulated)
    const sendConfirmationEmail = () => {
        setTimeout(() => {
            BookingUtils.showNotification(
                `Email de confirmación enviado a ${state.customerInfo.email}`, 
                'success',
                5000
            );
        }, 1000);
    };
    
    // Start new booking
    const startNewBooking = () => {
        if (confirm('¿Deseas iniciar una nueva reserva? Se borrarán los datos actuales.')) {
            BookingState.reset();
            BookingUtils.navigateToStep(1);
        }
    };
    
    // Initialize
    const init = () => {
        // Load confirmation data
        loadConfirmationData();
        
        // Setup event listeners
        elements.printButton.addEventListener('click', printConfirmation);
        elements.downloadButton.addEventListener('click', downloadPDF);
        elements.newBookingButton.addEventListener('click', startNewBooking);
        
        // Send confirmation email
        sendConfirmationEmail();
        
        // Smooth scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Add confetti effect (optional fun element)
        addConfettiEffect();
    };
    
    // Add confetti effect
    const addConfettiEffect = () => {
        const confettiCount = 50;
        const colors = ['#0ca16c', '#38454b', '#86ab92', '#f25c24'];
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background-color: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${Math.random() * 100}%;
                top: -10px;
                opacity: ${Math.random()};
                transform: rotate(${Math.random() * 360}deg);
                animation: confettiFall ${3 + Math.random() * 2}s linear;
                z-index: 9999;
            `;
            document.body.appendChild(confetti);
            
            confetti.addEventListener('animationend', () => {
                confetti.remove();
            });
        }
        
        // Add CSS animation if not exists
        if (!document.querySelector('#confetti-animation')) {
            const style = document.createElement('style');
            style.id = 'confetti-animation';
            style.textContent = `
                @keyframes confettiFall {
                    to {
                        transform: translateY(100vh) rotate(720deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    };
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
