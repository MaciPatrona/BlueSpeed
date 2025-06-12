document.addEventListener('DOMContentLoaded', function() {
    // Initialize map
    const map = L.map('trackingMap').setView([42.6977, 23.3219], 13); // Sofia coordinates
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Tracking form submission
    const trackingForm = document.getElementById('trackingForm');
    const packageStatus = document.getElementById('packageStatus');
    const trackingHistory = document.getElementById('trackingHistory');

    trackingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const trackingNumber = document.getElementById('trackingNumber').value;

        // Simulate API call with mock data
        simulateTracking(trackingNumber);
    });

    function simulateTracking(trackingNumber) {
        // Mock tracking data
        const mockData = {
            status: 'В транзит',
            history: [
                {
                    date: '2024-03-20 10:30',
                    location: 'София',
                    status: 'Пратката е приета в центъра'
                },
                {
                    date: '2024-03-20 12:45',
                    location: 'София',
                    status: 'Пратката е сортирана'
                },
                {
                    date: '2024-03-20 15:20',
                    location: 'Пловдив',
                    status: 'Пратката е в транзит'
                }
            ],
            coordinates: [
                [42.6977, 23.3219], // Sofia
                [42.1354, 24.7453]  // Plovdiv
            ]
        };

        // Update status
        packageStatus.innerHTML = `
            <i class="fas fa-truck"></i>
            <span>${mockData.status}</span>
        `;

        // Update history
        trackingHistory.innerHTML = mockData.history.map(item => `
            <li>
                <strong>${item.date}</strong>
                <p>${item.location}</p>
                <p>${item.status}</p>
            </li>
        `).join('');

        // Update map
        updateMap(mockData.coordinates);
    }

    function updateMap(coordinates) {
        // Clear existing markers and route
        map.eachLayer((layer) => {
            if (layer instanceof L.Marker || layer instanceof L.Polyline) {
                map.removeLayer(layer);
            }
        });

        // Add markers for each location
        coordinates.forEach((coord, index) => {
            L.marker(coord).addTo(map)
                .bindPopup(`Стоп ${index + 1}`)
                .openPopup();
        });

        // Draw route line
        L.polyline(coordinates, {
            color: 'red',
            weight: 3,
            opacity: 0.7
        }).addTo(map);

        // Fit map to show all points
        map.fitBounds(coordinates);
    }

    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mainNav = document.querySelector('.main-nav');

    mobileMenuBtn.addEventListener('click', function() {
        mainNav.classList.toggle('active');
        this.classList.toggle('active');
    });
}); 