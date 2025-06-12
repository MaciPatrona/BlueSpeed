document.addEventListener('DOMContentLoaded', function() {
    const sendForm = document.getElementById('sendForm');
    const cashOnDelivery = document.getElementById('cashOnDelivery');
    const codAmountGroup = document.getElementById('codAmountGroup');
    const codAmount = document.getElementById('codAmount');

    // Toggle cash on delivery amount field
    cashOnDelivery.addEventListener('change', function() {
        codAmountGroup.style.display = this.checked ? 'block' : 'none';
        if (this.checked) {
            codAmount.setAttribute('required', 'required');
        } else {
            codAmount.removeAttribute('required');
            codAmount.value = '';
        }
    });

    // Form validation
    sendForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Validate phone numbers
        const phoneRegex = /^(\+359|0)[0-9]{9}$/;
        const senderPhone = document.getElementById('senderPhone').value;
        const receiverPhone = document.getElementById('receiverPhone').value;

        if (!phoneRegex.test(senderPhone)) {
            alert('Моля, въведете валиден телефонен номер на изпращача');
            return;
        }

        if (!phoneRegex.test(receiverPhone)) {
            alert('Моля, въведете валиден телефонен номер на получателя');
            return;
        }

        // Validate weight
        const weight = parseFloat(document.getElementById('packageWeight').value);
        if (weight <= 0) {
            alert('Моля, въведете валидно тегло на пратката');
            return;
        }

        // Validate cash on delivery amount if enabled
        if (cashOnDelivery.checked) {
            const amount = parseFloat(codAmount.value);
            if (amount <= 0) {
                alert('Моля, въведете валидна сума за наложен платеж');
                return;
            }
        }

        // Simulate form submission
        simulateFormSubmission();
    });

    function simulateFormSubmission() {
        // Show loading state
        const submitButton = sendForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Изпращане...';

        // Simulate API call
        setTimeout(() => {
            // Generate tracking number
            const trackingNumber = generateTrackingNumber();

            // Show success message
            alert(`Пратката е успешно регистрирана!\nНомер на товарителница: ${trackingNumber}`);

            // Reset form
            sendForm.reset();
            codAmountGroup.style.display = 'none';
            submitButton.disabled = false;
            submitButton.textContent = originalText;

            // Redirect to tracking page
            window.location.href = `track.html?number=${trackingNumber}`;
        }, 2000);
    }

    function generateTrackingNumber() {
        const prefix = 'BS';
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${prefix}${timestamp}${random}`;
    }

    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mainNav = document.querySelector('.main-nav');

    mobileMenuBtn.addEventListener('click', function() {
        mainNav.classList.toggle('active');
        this.classList.toggle('active');
    });
}); 