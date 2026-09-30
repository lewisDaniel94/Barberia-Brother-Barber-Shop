// Manejo del menú móvil desplegable
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    // Cerrar menú al hacer clic en enlaces del menú móvil
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
        });
    });
}

// Objeto para almacenar los datos de la reserva actual
let bookingData = {
    service: '',
    price: 0,
    barber: '',
    date: '',
    time: '',
    clientName: '',
    clientPhone: ''
};

// Función auxiliar para obtener el precio real y actualizado de un servicio seleccionado
function getServicePrice(radioElement) {
    if (!radioElement) return 0;
    
    // 1. Intentar leer desde el atributo data-price
    let price = parseFloat(radioElement.getAttribute('data-price'));
    
    // 2. Si no existe o es inválido, buscar el precio automáticamente en el texto del label o elemento contenedor
    if (isNaN(price) || price <= 0) {
        const label = radioElement.closest('label') || radioElement.parentElement;
        if (label) {
            const text = label.textContent || '';
            // Buscar patrones como $15 o números seguidos
            const match = text.match(/\$\s*(\d+(\.\d+)?)/) || text.match(/(\d+(\.\d+)?)/);
            if (match) {
                price = parseFloat(match[1]) || 0;
            }
        }
    }
    return price;
}

// Función auxiliar para actualizar los indicadores visuales de los pasos
function updateStepIndicators(stepNumber) {
    for (let i = 1; i <= 4; i++) {
        const stepEl = document.getElementById(`step-${i}`);
        if (stepEl) {
            if (i === stepNumber) {
                stepEl.classList.remove('hidden');
            } else {
                stepEl.classList.add('hidden');
            }
        }
        
        const indicator = document.getElementById(`step-indicator-${i}`);
        if (indicator) {
            const span = indicator.querySelector('span');
            if (i < stepNumber) {
                indicator.className = "flex items-center gap-2 text-neonBlue opacity-60";
                if (span) span.className = "w-7 h-7 rounded-full border border-neonBlue flex items-center justify-center font-bold bg-neonBlue/10";
            } else if (i === stepNumber) {
                indicator.className = "flex items-center gap-2 text-neonBlue font-bold";
                if (span) span.className = "w-7 h-7 rounded-full border border-neonBlue flex items-center justify-center font-bold bg-neonBlue/10";
            } else {
                indicator.className = "flex items-center gap-2 text-gray-500";
                if (span) span.className = "w-7 h-7 rounded-full border border-gray-700 flex items-center justify-center font-bold";
            }
        }
    }
}

// Funciones para avanzar entre los pasos del formulario de reservas
function nextStep(stepNumber) {
    if (stepNumber === 2) {
        const selectedService = document.querySelector('input[name="service"]:checked');
        if (!selectedService) {
            alert('Por favor selecciona un servicio antes de continuar.');
            return;
        }
        bookingData.service = selectedService.value;
        bookingData.price = getServicePrice(selectedService);
    } else if (stepNumber === 3) {
        const selectedService = document.querySelector('input[name="service"]:checked');
        if (selectedService) {
            bookingData.service = selectedService.value;
            bookingData.price = getServicePrice(selectedService);
        }

        const selectedBarber = document.querySelector('input[name="barber"]:checked');
        if (!selectedBarber) {
            alert('Por favor selecciona un barbero antes de continuar.');
            return;
        }
        bookingData.barber = selectedBarber.value;
    } else if (stepNumber === 4) {
        const dateInput = document.getElementById('booking-date').value;
        const timeInput = document.getElementById('booking-time').value;
        
        if (!dateInput || !timeInput) {
            alert('Por favor selecciona la fecha y la hora para tu cita.');
            return;
        }

        // Validación de fecha y hora actual (mínimo hoy 2026)
        const selectedDateTime = new Date(`${dateInput}T${timeInput}`);
        const now = new Date();
        if (selectedDateTime < now) {
            alert('No puedes seleccionar una fecha u hora pasada. Por favor, elige un horario válido.');
            return;
        }

        bookingData.date = dateInput;
        bookingData.time = timeInput;
        updateBookingSummary();
    }

    updateStepIndicators(stepNumber);
}

function prevStep(stepNumber) {
    updateStepIndicators(stepNumber);
}

// Accesos directos para seleccionar servicio desde las tarjetas principales
function selectService(serviceName, price) {
    bookingData.service = serviceName;
    bookingData.price = parseFloat(price) || 0;
    
    // Marcar el radio correspondiente en el formulario
    const radios = document.querySelectorAll('input[name="service"]');
    radios.forEach(radio => {
        if (radio.value === serviceName) {
            radio.checked = true;
            bookingData.price = getServicePrice(radio);
        }
    });

    nextStep(2);
}

// Accesos directos para seleccionar barbero desde su sección
function selectBarber(barberName) {
    bookingData.barber = barberName;
    
    // Marcar el radio correspondiente
    const radios = document.querySelectorAll('input[name="barber"]');
    radios.forEach(radio => {
        if (radio.value === barberName) {
            radio.checked = true;
        }
    });

    const serviceSelected = document.querySelector('input[name="service"]:checked');
    if (!serviceSelected) {
        nextStep(1);
    } else {
        bookingData.service = serviceSelected.value;
        bookingData.price = getServicePrice(serviceSelected);
        nextStep(3);
    }
    
    const reservasSection = document.getElementById('reservas');
    if (reservasSection) {
        reservasSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Actualizar el resumen en tiempo real en el paso 4
function updateBookingSummary() {
    const sService = document.getElementById('summary-service');
    const sBarber = document.getElementById('summary-barber');
    const sDatetime = document.getElementById('summary-datetime');
    const sPrice = document.getElementById('summary-price');

    const activeService = document.querySelector('input[name="service"]:checked');
    const activeBarber = document.querySelector('input[name="barber"]:checked');
    const dateVal = document.getElementById('booking-date').value;
    const timeVal = document.getElementById('booking-time').value;

    if (activeService) {
        bookingData.service = activeService.value;
        bookingData.price = getServicePrice(activeService);
    }
    if (activeBarber) {
        bookingData.barber = activeBarber.value;
    }
    if (dateVal) bookingData.date = dateVal;
    if (timeVal) bookingData.time = timeVal;

    if (sService) sService.textContent = bookingData.service || '-';
    if (sBarber) sBarber.textContent = bookingData.barber || '-';
    if (sDatetime) sDatetime.textContent = (bookingData.date && bookingData.time) ? `${bookingData.date} a las ${bookingData.time}` : '-';
    if (sPrice) sPrice.textContent = bookingData.price ? `$${bookingData.price.toFixed(2)}` : '-';
}

// Confirmar la reserva y mostrar la pantalla de éxito con enlace a WhatsApp
function confirmBooking(event) {
    event.preventDefault();

    const activeService = document.querySelector('input[name="service"]:checked');
    if (activeService) {
        bookingData.service = activeService.value;
        bookingData.price = getServicePrice(activeService);
    }

    const nameInput = document.getElementById('client-name');
    const phoneInput = document.getElementById('client-phone');

    if (!nameInput || !phoneInput || !nameInput.value.trim() || !phoneInput.value.trim()) {
        alert('Por favor ingresa tu nombre y número de teléfono.');
        return;
    }

    bookingData.clientName = nameInput.value.trim();
    bookingData.clientPhone = phoneInput.value.trim();

    // Rellenar pantalla de éxito
    const sucName = document.getElementById('suc-name');
    const sucService = document.getElementById('suc-service');
    const sucBarber = document.getElementById('suc-barber');
    const sucDatetime = document.getElementById('suc-datetime');
    const sucPrice = document.getElementById('suc-price');

    if (sucName) sucName.textContent = bookingData.clientName;
    if (sucService) sucService.textContent = bookingData.service;
    if (sucBarber) sucBarber.textContent = bookingData.barber;
    if (sucDatetime) sucDatetime.textContent = `${bookingData.date} a las ${bookingData.time}`;
    if (sucPrice) sucPrice.textContent = `$${bookingData.price.toFixed(2)}`;

    // Construir mensaje para WhatsApp con el precio fresco y actualizado con dos decimales
    const formattedPrice = `$${bookingData.price.toFixed(2)}`;
    const whatsappMessage = `¡Hola Brothers Barber Shop! 💈%0A%0AQuiero confirmar mi cita con los siguientes datos:%0A- *Cliente:* ${bookingData.clientName}%0A- *Teléfono:* ${bookingData.clientPhone}%0A- *Servicio:* ${bookingData.service}%0A- *Barbero:* ${bookingData.barber}%0A- *Fecha y Hora:* ${bookingData.date} a las ${bookingData.time}%0A- *Total:* ${formattedPrice}%0A%0A¡Espero su confirmación!`;
    
    const whatsappUrl = `https://wa.me/584126613818?text=${whatsappMessage}`;
    const whatsappBtn = document.getElementById('whatsapp-btn');
    if (whatsappBtn) {
        whatsappBtn.setAttribute('href', whatsappUrl);
    }

    // Ocultar formulario actual y mostrar pantalla de éxito
    const bookingForm = document.getElementById('booking-form');
    const successScreen = document.getElementById('success-screen');

    if (bookingForm) bookingForm.classList.add('hidden');
    if (successScreen) {
        successScreen.classList.remove('hidden');
        successScreen.scrollIntoView({ behavior: 'smooth' });
    }
}

// Reiniciar el proceso de reserva
function resetBooking() {
    const bookingForm = document.getElementById('booking-form');
    const successScreen = document.getElementById('success-screen');

    if (bookingForm) {
        bookingForm.reset();
        bookingForm.classList.remove('hidden');
    }
    if (successScreen) {
        successScreen.classList.add('hidden');
    }
    
    bookingData = {
        service: '',
        price: 0,
        barber: '',
        date: '',
        time: '',
        clientName: '',
        clientPhone: ''
    };
    
    nextStep(1);
}