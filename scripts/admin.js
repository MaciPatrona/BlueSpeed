// Sidebar Toggle
const sidebarToggle = document.querySelector('.sidebar-toggle');
const adminSidebar = document.querySelector('.admin-sidebar');
const adminMain = document.querySelector('.admin-main');

if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
        adminSidebar.classList.toggle('active');
    });
}

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 992) {
        if (!adminSidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
            adminSidebar.classList.remove('active');
        }
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 992) {
        adminSidebar.classList.remove('active');
    }
});

// Notification System
const notificationButton = document.querySelector('.notification-button');
const notificationBadge = document.querySelector('.notification-badge');

if (notificationButton) {
    notificationButton.addEventListener('click', () => {
        // TODO: Implement notification dropdown
        console.log('Show notifications');
    });
}

// Table Actions
const tableActions = document.querySelectorAll('.table-actions');

tableActions.forEach(actions => {
    const viewButton = actions.querySelector('.fa-eye').parentElement;
    const editButton = actions.querySelector('.fa-edit').parentElement;
    const deleteButton = actions.querySelector('.fa-trash').parentElement;

    if (viewButton) {
        viewButton.addEventListener('click', (e) => {
            e.preventDefault();
            const row = e.target.closest('tr');
            const packageId = row.querySelector('td:first-child').textContent;
            // TODO: Implement view package details
            console.log(`View package ${packageId}`);
        });
    }

    if (editButton) {
        editButton.addEventListener('click', (e) => {
            e.preventDefault();
            const row = e.target.closest('tr');
            const packageId = row.querySelector('td:first-child').textContent;
            // TODO: Implement edit package
            console.log(`Edit package ${packageId}`);
        });
    }

    if (deleteButton) {
        deleteButton.addEventListener('click', (e) => {
            e.preventDefault();
            const row = e.target.closest('tr');
            const packageId = row.querySelector('td:first-child').textContent;
            if (confirm('Сигурни ли сте, че искате да изтриете тази пратка?')) {
                // TODO: Implement delete package
                console.log(`Delete package ${packageId}`);
                showSuccessMessage('Пратката беше успешно изтрита');
            }
        });
    }
});

// Action Buttons
const actionButtons = document.querySelectorAll('.action-button');

actionButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const action = e.target.textContent.trim();
        switch (action) {
            case 'Нова пратка':
                // TODO: Implement new package form
                console.log('Create new package');
                break;
            case 'Експорт':
                // TODO: Implement export functionality
                console.log('Export data');
                break;
        }
    });
});

// View All Buttons
const viewAllButtons = document.querySelectorAll('.view-all');

viewAllButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const section = e.target.closest('.content-card').querySelector('h2').textContent;
        // TODO: Implement view all functionality
        console.log(`View all ${section}`);
    });
});

// Success Message
function showSuccessMessage(message) {
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(successMessage);

    setTimeout(() => {
        successMessage.remove();
    }, 3000);
}

// Search Functionality
const searchInput = document.querySelector('.header-search input');

if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        // TODO: Implement search functionality
        console.log(`Searching for: ${searchTerm}`);
    });
}

// Loading States
function showLoading(element) {
    element.classList.add('loading');
}

function hideLoading(element) {
    element.classList.remove('loading');
}

// Example usage of loading states
const contentCards = document.querySelectorAll('.content-card');

contentCards.forEach(card => {
    card.addEventListener('click', () => {
        showLoading(card);
        // Simulate loading
        setTimeout(() => {
            hideLoading(card);
        }, 1000);
    });
});

// Logout
const logoutButton = document.querySelector('.logout-button');

if (logoutButton) {
    logoutButton.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Сигурни ли сте, че искате да излезете?')) {
            // TODO: Implement logout functionality
            console.log('Logging out...');
            window.location.href = 'login.html';
        }
    });
}

// Initialize tooltips
document.addEventListener('DOMContentLoaded', () => {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', (e) => {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = e.target.dataset.tooltip;
            document.body.appendChild(tooltip);

            const rect = e.target.getBoundingClientRect();
            tooltip.style.top = `${rect.bottom + 5}px`;
            tooltip.style.left = `${rect.left + (rect.width - tooltip.offsetWidth) / 2}px`;
        });

        element.addEventListener('mouseleave', () => {
            const tooltip = document.querySelector('.tooltip');
            if (tooltip) {
                tooltip.remove();
            }
        });
    });
}); 