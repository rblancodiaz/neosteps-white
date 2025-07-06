/**
 * Step 3: Payment Process
 * Handles payment form validation and submission
 */

(() => {
    // State
    const state = BookingState.getState();
    let selectedPaymentMethod = 'card';
    let isProcessing = false;
    
    // Form fields
    const fields = {
        firstName: document.getElementById('firstName'),
        lastName: document.getElementById('lastName'),
        email: document.getElementById('email'),
        phone: document.getElementById('phone'),
        country: document.getElementById('country'),
        specialRequests: document.getElementById('specialRequests'),
        cardNumber: document.getElementById('cardNumber'),
        cardHolder: document.getElementById('cardHolder'),
        cardExpiry: document.getElementById('cardExpiry'),
        cardCvv: document.getElementById('cardCvv'),
        termsCheckbox: document.getElementById('termsCheckbox'),
        marketingCheckbox: document.getElementById('marketingCheckbox')
    };
    
    // Error elements
    const errors = {
        firstName: document.getElementById('firstNameError'),
        lastName: document.getElementById('lastNameError'),
        email: document.getElementById('emailError'),
        phone: document.getElementById('phoneError'),
        country: document.getElementById('countryError'),
        cardNumber: document.getElementById('cardNumberError'),
        cardHolder: document.getElementById('cardHolderError'),
        cardExpiry: document.getElementById('cardExpiryError'),
        cardCvv: document.getElementById('cardCvvError'),
        terms: document.getElementById('termsError')
    };
    
    // Other elements
    const elements = {
        paymentMethods: document.querySelectorAll('input[name="paymentMethod"]'),
        cardDetails: document.getElementById('cardDetails'),
        paypalDetails: document.getElementById('paypalDetails'),
        hotelDetails: document.getElementById('hotelDetails'),
        payButton: document.getElementById('payButton'),
        payButtonText: document.getElementById('payButtonText'),
        footerTooltip: document.getElementById('footerTooltip'),
        // Summary elements
        summaryCheckIn: document.getElementById('summaryCheckIn'),
        summaryCheckOut: document.getElementById('summaryCheckOut'),
        summaryNights: document.getElementById('summaryNights'),
        roomsSummaryList: document.getElementById('roomsSummaryList'),
        extrasSummaryList: document.getElementById('extrasSummaryList'),
        extrasSummarySection: document.getElementById('extrasSummarySection'),
        summarySubtotal: document.getElementById('summarySubtotal'),
        summaryDiscountRow: document.getElementById('summaryDiscountRow'),
        summaryDiscount: document.getElementById('summaryDiscount'),
        summaryTaxes: document.getElementById('summaryTaxes'),
        summaryTotal: document.getElementById('summaryTotal')
    };
    
    // Load saved customer info
    const loadSavedInfo = () => {
        if (state.customerInfo) {
            Object.keys(state.customerInfo).forEach(key => {
                if (fields[key]) {
                    fields[key].value = state.customerInfo[key];
                }
            });
        }
        
        // Update summary
        updateBookingSummary();
    };
    
    // Update booking summary
    const updateBookingSummary = () => {
        // Dates
        elements.summaryCheckIn.textContent = BookingUtils.formatDate(state.dates.checkIn);
        elements.summaryCheckOut.textContent = BookingUtils.formatDate(state.dates.checkOut);
        elements.summaryNights.textContent = state.dates.nights;
        
        // Rooms
        if (state.selectedRooms && state.selectedRooms.length > 0) {
            elements.roomsSummaryList.innerHTML = state.selectedRooms.map(room => `
                <div class="summary-row">
                    <span>${room.name}</span>
                    <span>${BookingUtils.formatCurrency(room.price * state.dates.nights)}</span>
                </div>
            `).join('');
        }
        
        // Extras
        if (state.extras && state.extras.length > 0) {
            elements.extrasSummarySection.style.display = 'block';
            elements.extrasSummaryList.innerHTML = state.extras.map(extra => {
                let extraTotal = extra.price;
                if (extra.unit.includes('día')) {
                    extraTotal *= state.dates.nights;
                }
                if (extra.unit.includes('persona')) {
                    extraTotal *= (state.guests.adults + state.guests.children);
                }
                
                return `
                    <div class="summary-row">
                        <span>${extra.name}</span>
                        <span>${BookingUtils.formatCurrency(extraTotal)}</span>
                    </div>
                `;
            }).join('');
        }
        
        // Pricing
        if (state.pricing) {
            elements.summarySubtotal.textContent = BookingUtils.formatCurrency(state.pricing.subtotal);
            elements.summaryTaxes.textContent = BookingUtils.formatCurrency(state.pricing.taxes);
            elements.summaryTotal.textContent = BookingUtils.formatCurrency(state.pricing.total);
            
            // Discount
            if (state.pricing.discount > 0) {
                elements.summaryDiscountRow.style.display = 'flex';
                elements.summaryDiscount.textContent = `-${BookingUtils.formatCurrency(state.pricing.discount)}`;
            }
        }
    };
    
    // Setup payment method selection
    const setupPaymentMethods = () => {
        elements.paymentMethods.forEach(radio => {
            radio.addEventListener('change', (e) => {
                selectedPaymentMethod = e.target.value;
                
                // Hide all payment details
                elements.cardDetails.style.display = 'none';
                elements.paypalDetails.style.display = 'none';
                elements.hotelDetails.style.display = 'none';
                
                // Show selected payment details
                switch (selectedPaymentMethod) {
                    case 'card':
                        elements.cardDetails.style.display = 'block';
                        elements.payButtonText.textContent = 'Pagar ahora';
                        break;
                    case 'paypal':
                        elements.paypalDetails.style.display = 'block';
                        elements.payButtonText.textContent = 'Continuar con PayPal';
                        break;
                    case 'hotel':
                        elements.hotelDetails.style.display = 'block';
                        elements.payButtonText.textContent = 'Confirmar reserva';
                        break;
                }
                
                validateForm();
            });
        });
    };
    
    // Format card number
    const formatCardNumber = () => {
        let value = fields.cardNumber.value.replace(/\s/g, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        fields.cardNumber.value = formattedValue;
        
        // Detect card type
        const cardIcons = {
            visa: document.getElementById('visaIcon'),
            mastercard: document.getElementById('mastercardIcon'),
            amex: document.getElementById('amexIcon')
        };
        
        // Reset all icons
        Object.values(cardIcons).forEach(icon => icon.classList.remove('active'));
        
        // Detect and activate appropriate icon
        if (value.startsWith('4')) {
            cardIcons.visa.classList.add('active');
        } else if (value.startsWith('5')) {
            cardIcons.mastercard.classList.add('active');
        } else if (value.startsWith('3')) {
            cardIcons.amex.classList.add('active');
        }
    };
    
    // Format expiry date
    const formatExpiry = () => {
        let value = fields.cardExpiry.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
        fields.cardExpiry.value = value;
    };
    
    // Validate individual field
    const validateField = (field, errorElement) => {
        let isValid = true;
        let errorMessage = '';
        
        switch (field.id) {
            case 'firstName':
            case 'lastName':
                if (!field.value.trim()) {
                    isValid = false;
                    errorMessage = 'Este campo es obligatorio';
                } else if (field.value.trim().length < 2) {
                    isValid = false;
                    errorMessage = 'Debe tener al menos 2 caracteres';
                }
                break;
                
            case 'email':
                if (!field.value.trim()) {
                    isValid = false;
                    errorMessage = 'Este campo es obligatorio';
                } else if (!BookingUtils.validateEmail(field.value)) {
                    isValid = false;
                    errorMessage = 'Email no válido';
                }
                break;
                
            case 'phone':
                if (!field.value.trim()) {
                    isValid = false;
                    errorMessage = 'Este campo es obligatorio';
                } else if (!BookingUtils.validatePhone(field.value)) {
                    isValid = false;
                    errorMessage = 'Teléfono no válido';
                }
                break;
                
            case 'country':
                if (!field.value) {
                    isValid = false;
                    errorMessage = 'Selecciona un país';
                }
                break;
                
            case 'cardNumber':
                if (selectedPaymentMethod === 'card') {
                    const cleanNumber = field.value.replace(/\s/g, '');
                    if (!cleanNumber) {
                        isValid = false;
                        errorMessage = 'Este campo es obligatorio';
                    } else if (!BookingUtils.validateCardNumber(cleanNumber)) {
                        isValid = false;
                        errorMessage = 'Número de tarjeta no válido';
                    }
                }
                break;
                
            case 'cardHolder':
                if (selectedPaymentMethod === 'card' && !field.value.trim()) {
                    isValid = false;
                    errorMessage = 'Este campo es obligatorio';
                }
                break;
                
            case 'cardExpiry':
                if (selectedPaymentMethod === 'card') {
                    if (!field.value.trim()) {
                        isValid = false;
                        errorMessage = 'Este campo es obligatorio';
                    } else if (!BookingUtils.validateExpiry(field.value)) {
                        isValid = false;
                        errorMessage = 'Fecha no válida o expirada';
                    }
                }
                break;
                
            case 'cardCvv':
                if (selectedPaymentMethod === 'card') {
                    const cvvLength = field.value.length;
                    if (!field.value.trim()) {
                        isValid = false;
                        errorMessage = 'Este campo es obligatorio';
                    } else if (cvvLength < 3 || cvvLength > 4) {
                        isValid = false;
                        errorMessage = 'CVV no válido';
                    }
                }
                break;
        }
        
        // Update UI
        if (errorElement) {
            errorElement.textContent = errorMessage;
            if (isValid) {
                field.classList.remove('error');
            } else {
                field.classList.add('error');
            }
        }
        
        return isValid;
    };
    
    // Validate entire form
    const validateForm = () => {
        let isValid = true;
        
        // Validate customer fields
        ['firstName', 'lastName', 'email', 'phone', 'country'].forEach(fieldName => {
            if (!validateField(fields[fieldName], errors[fieldName])) {
                isValid = false;
            }
        });
        
        // Validate payment fields if card selected
        if (selectedPaymentMethod === 'card') {
            ['cardNumber', 'cardHolder', 'cardExpiry', 'cardCvv'].forEach(fieldName => {
                if (!validateField(fields[fieldName], errors[fieldName])) {
                    isValid = false;
                }
            });
        }
        
        // Validate terms
        if (!fields.termsCheckbox.checked) {
            isValid = false;
            errors.terms.textContent = 'Debes aceptar los términos y condiciones';
        } else {
            errors.terms.textContent = '';
        }
        
        // Update button state
        elements.payButton.disabled = !isValid;
        
        // Update footer tooltip
        if (!isValid) {
            elements.footerTooltip.textContent = 'Completa todos los campos obligatorios';
        } else {
            elements.footerTooltip.textContent = `Total a pagar: ${BookingUtils.formatCurrency(state.pricing.total)}`;
        }
        
        return isValid;
    };
    
    // Setup form validation
    const setupValidation = () => {
        // Real-time validation
        Object.entries(fields).forEach(([name, field]) => {
            if (field && field.tagName === 'INPUT' || field.tagName === 'SELECT' || field.tagName === 'TEXTAREA') {
                field.addEventListener('blur', () => {
                    validateField(field, errors[name]);
                    saveCustomerInfo();
                });
                
                field.addEventListener('input', () => {
                    // Clear error on input
                    if (errors[name]) {
                        errors[name].textContent = '';
                        field.classList.remove('error');
                    }
                    
                    // Format specific fields
                    if (field.id === 'cardNumber') {
                        formatCardNumber();
                    } else if (field.id === 'cardExpiry') {
                        formatExpiry();
                    } else if (field.id === 'cardCvv') {
                        field.value = field.value.replace(/\D/g, '');
                    }
                    
                    // Debounced validation
                    clearTimeout(field.validationTimeout);
                    field.validationTimeout = setTimeout(() => {
                        validateForm();
                    }, 300);
                });
            }
        });
        
        // Terms checkbox
        fields.termsCheckbox.addEventListener('change', validateForm);
    };
    
    // Save customer info to state
    const saveCustomerInfo = () => {
        const customerInfo = {
            firstName: fields.firstName.value,
            lastName: fields.lastName.value,
            email: fields.email.value,
            phone: fields.phone.value,
            country: fields.country.value,
            specialRequests: fields.specialRequests.value
        };
        
        BookingState.setNestedState('customerInfo', customerInfo);
    };
    
    // Process payment
    const processPayment = async () => {
        if (isProcessing || !validateForm()) return;
        
        isProcessing = true;
        elements.payButton.disabled = true;
        elements.payButtonText.style.display = 'none';
        document.querySelector('.loading-spinner').style.display = 'inline-block';
        
        // Save payment info (excluding sensitive data)
        const paymentInfo = {
            method: selectedPaymentMethod,
            cardDetails: selectedPaymentMethod === 'card' ? {
                last4: fields.cardNumber.value.replace(/\s/g, '').slice(-4),
                holder: fields.cardHolder.value
            } : null
        };
        
        BookingState.setNestedState('paymentInfo', paymentInfo);
        
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Generate booking ID
        BookingState.generateBookingId();
        
        // Simulate payment result
        const success = Math.random() > 0.1; // 90% success rate
        
        if (success) {
            BookingUtils.showNotification('Pago procesado correctamente', 'success');
            
            // Navigate to confirmation
            setTimeout(() => {
                BookingUtils.navigateToStep(4);
            }, 500);
        } else {
            isProcessing = false;
            elements.payButton.disabled = false;
            elements.payButtonText.style.display = 'inline';
            document.querySelector('.loading-spinner').style.display = 'none';
            
            BookingUtils.showNotification('Error al procesar el pago. Por favor, inténtalo de nuevo.', 'error');
        }
    };
    
    // PayPal redirect simulation
    const redirectToPayPal = () => {
        BookingUtils.showNotification('Redirigiendo a PayPal...', 'info');
        
        // Save state before redirect
        saveCustomerInfo();
        
        // Simulate PayPal redirect
        setTimeout(() => {
            BookingUtils.showNotification('Demo: Pago con PayPal completado', 'success');
            BookingState.generateBookingId();
            BookingUtils.navigateToStep(4);
        }, 2000);
    };
    
    // Initialize
    const init = () => {
        // Check if coming from valid step
        if (!BookingState.validateStep(2)) {
            BookingUtils.navigateToStep(2);
            return;
        }
        
        // Load saved info
        loadSavedInfo();
        
        // Setup payment methods
        setupPaymentMethods();
        
        // Setup validation
        setupValidation();
        
        // Payment button handler
        elements.payButton.addEventListener('click', (e) => {
            e.preventDefault();
            
            if (selectedPaymentMethod === 'paypal') {
                redirectToPayPal();
            } else {
                processPayment();
            }
        });
        
        // PayPal button
        const paypalBtn = document.querySelector('.btn-paypal');
        if (paypalBtn) {
            paypalBtn.addEventListener('click', redirectToPayPal);
        }
        
        // Initial validation
        validateForm();
    };
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();