// Create particle effects for login.html
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;

    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        const size = Math.random() * 10 + 5;
        const posX = Math.random() * 100;
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}%`;
        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `${delay}s`;
        
        const randomHue = Math.random() > 0.5 ? 
            '180, 100%, 50%' : '300, 100%, 50%';
        particle.style.backgroundColor = `hsla(${randomHue}, 0.5)`;
        
        particlesContainer.appendChild(particle);
    }
}

// Form validation for login.html
function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        let isValid = true;
        
        document.getElementById('usernameError').textContent = '';
        document.getElementById('passwordError').textContent = '';
        
        if (username.length < 4) {
            document.getElementById('usernameError').textContent = 'ID must be at least 4 characters';
            isValid = false;
            animateError('username');
        }
        
        if (password.length < 8) {
            document.getElementById('passwordError').textContent = 'Auth code must be 8+ characters';
            isValid = false;
            animateError('password');
        }
        
        if (isValid) {
            simulateLogin();
        }
    });
}

function animateError(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    field.style.transform = 'translateX(5px)';
    setTimeout(() => {
        field.style.transform = 'translateX(-5px)';
        setTimeout(() => {
            field.style.transform = 'translateX(0)';
        }, 50);
    }, 50);
}

function simulateLogin() {
    const btn = document.querySelector('.login-btn');
    const container = document.querySelector('.login-container');
    if (!btn || !container) return;

    btn.innerHTML = '<span class="loading-dots"><span>•</span><span>•</span><span>•</span></span>';
    btn.disabled = true;
    
    setTimeout(() => {
        container.style.boxShadow = '0 0 30px rgba(0, 255, 100, 0.5)';
        createSuccessParticles();
        
        setTimeout(() => {
            window.location.href = '/dashboard?' + new Date().getTime();
        }, 1500);
    }, 2000);
}

function createSuccessParticles() {
    const container = document.querySelector('.login-container');
    if (!container) return;

    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = '4px';
        particle.style.height = '4px';
        particle.style.backgroundColor = '#00ff88';
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        particle.style.left = `${x}%`;
        particle.style.top = `${y}%`;
        
        particle.style.animation = `success-particle 1s ${i * 0.02}s forwards`;
        
        container.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
        }, 1000 + i * 20);
    }
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes success-particle {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(20); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// Fetch real data from backend and update dashboard
async function fetchCarData() {
    try {
        const response = await fetch('/api/data');
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Error fetching car data:', error);
        return null;
    }
}

function updateDashboard(data) {
    if (!data) return;

    // Update last update time
    const lastUpdate = new Date(data.last_update * 1000).toLocaleTimeString();
    document.querySelector('.car-meta p').textContent = 
        `VIN: WBSJF0C05L6P12345 • Last update: ${lastUpdate}`;

    // Update status
    document.querySelector('.status').textContent = data.battery_voltage < 12.0 ? 'Warning' : 'Optimal';

    // Update engine temperature card
    const engineTempCard = document.querySelector('.grid .card:nth-child(1)');
    if (engineTempCard) {
        engineTempCard.querySelector('.card-value').textContent = `${data.engine_temp.toFixed(1)}°C`;
        const tempProgress = ((data.engine_temp - 30) / 120 * 100);
        engineTempCard.querySelector('.progress-bar').style.width = `${Math.min(100, tempProgress)}%`;
    }

    // Update oil pressure card
    const oilPressureCard = document.querySelector('.grid .card:nth-child(2)');
    if (oilPressureCard) {
        oilPressureCard.querySelector('.card-value').textContent = `${data.oil_pressure.toFixed(1)} bar`;
        const pressureProgress = ((data.oil_pressure - 1) / 4 * 100);
        oilPressureCard.queryQuerySelector('.progress-bar').style.width = `${Math.min(100, pressureProgress)}%`;
    }

    // Update battery card
    const batteryCard = document.querySelector('.grid .card:nth-child(3)');
    if (batteryCard) {
        batteryCard.querySelector('.card-value').textContent = `${data.battery_voltage.toFixed(1)}V`;
        const voltageProgress = ((data.battery_voltage - 9) / 6 * 100);
        batteryCard.querySelector('.progress-bar').style.width = `${Math.min(100, voltageProgress)}%`;
        
        // Update warning status based on voltage
        if (data.battery_voltage < 11.5) {
            batteryCard.classList.add('danger');
            batteryCard.classList.remove('warning');
        } else if (data.battery_voltage < 12.0) {
            batteryCard.classList.add('warning');
            batteryCard.classList.remove('danger');
        } else {
            batteryCard.classList.remove('warning', 'danger');
        }
    }

    // Update detailed stats
    document.querySelector('.stat:nth-child(1) .stat-value').textContent = `${data.engine_load}%`;
    document.querySelector('.stat:nth-child(1) .progress-bar').style.width = `${data.engine_load}%`;
    document.querySelector('.stat:nth-child(2) .stat-value').textContent = `${data.intake_air_temp}°C`;
    document.querySelector('.stat:nth-child(3) .stat-value').textContent = `${data.fuel_pressure.toFixed(1)} bar`;
    document.querySelector('.stat:nth-child(4) .stat-value').textContent = `${data.throttle_position}%`;
    document.querySelector('.stat:nth-child(5) .stat-value').textContent = `${data.oil_temp}°C`;
    document.querySelector('.stat:nth-child(6) .stat-value').textContent = data.coolant_level;
}

// Schedule button effect for dashboard.html
function setupScheduleButtons() {
    const buttons = document.querySelectorAll('.btn');
    if (buttons.length === 0) return;

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.innerHTML = '<i class="fas fa-check"></i> Scheduled';
            btn.style.background = 'var(--success)';
            setTimeout(() => {
                btn.innerHTML = 'Schedule';
                btn.style.background = 'var(--primary)';
            }, 2000);
        });
    });
}

// Initialize the dashboard
async function initDashboard() {
    if (!document.querySelector('.grid')) return;
    
    // Initial data load
    const data = await fetchCarData();
    updateDashboard(data);
    
    // Set up periodic updates
    setInterval(async () => {
        const newData = await fetchCarData();
        updateDashboard(newData);
    }, 3000);
    
    setupScheduleButtons();
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize login page features
    createParticles();
    setupLoginForm();

    // Initialize dashboard
    initDashboard();

    // Styles for loading dots
    const style = document.createElement('style');
    style.textContent = `
        .loading-dots span {
            animation: dot-pulse 1.5s infinite ease-in-out;
            display: inline-block;
            opacity: 0;
        }
        .loading-dots span:nth-child(1) { animation-delay: 0.1s; }
        .loading-dots span:nth-child(2) { animation-delay: 0.3s; }
        .loading-dots span:nth-child(3) { animation-delay: 0.5s; }
        @keyframes dot-pulse {
            0%, 100% { opacity: 0; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.2); }
        }
    `;
    document.head.appendChild(style);
});