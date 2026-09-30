// Fondo de Partículas
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const particles = Array.from({ length: 35 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 2 + 1,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3
}));

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 242, 254, 0.25)';
    
    particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    });

    requestAnimationFrame(animate);
}
animate();

// =========================================
// LÓGICA DE NAVEGACIÓN Y SISTEMA GACHA
// =========================================

// Cambiar entre pestañas (Lobby e Invocación)
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(btn => btn.classList.remove('active'));

    const activeTab = document.getElementById(`tab-${tabId}`);
    if (activeTab) activeTab.classList.add('active');

    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
}

// Ejecutar tiradas Gacha
// Ejecutar tiradas Gacha con Animación Escalonada
function pullGacha(amount) {
    const resultsContainer = document.getElementById('gacha-results');
    if (!resultsContainer) return;

    resultsContainer.innerHTML = ''; // Limpiar tiradas anteriores

    let pulls = [];
    if (amount === 1) {
        pulls.push(executeSinglePull());
    } else {
        pulls = executeMultiPull();
    }

    // Dibujar las cartas con un retraso animado entre cada una
    pulls.forEach((pkmn, index) => {
        const card = document.createElement('div');
        card.className = `card-pokemon ${pkmn.rarity}`;
        
        // Retraso de animación para que aparezcan progresivamente
        card.style.animationDelay = `${index * 0.12}s`;

        card.innerHTML = `
            <img src="${pkmn.sprite}" alt="${pkmn.name}">
            <h4>${pkmn.name}</h4>
            <div class="card-rarity">${pkmn.rarity}</div>
        `;
        resultsContainer.appendChild(card);
    });
}

// Inventario/Colección global del jugador (Guarda IDs de Pokémon obtenidos)
const playerCollection = new Set();

// Renderizar la Dex cuando se entra a la pestaña
function renderDex() {
    const grid = document.getElementById('dex-grid');
    const counter = document.getElementById('dex-counter');
    const fill = document.getElementById('dex-progress-fill');
    
    if (!grid || typeof pokemonDB === 'undefined') return;

    grid.innerHTML = '';
    
    const total = pokemonDB.length;
    const unlockedCount = playerCollection.size;
    const percentage = Math.round((unlockedCount / total) * 100);

    // Actualizar barra de progreso
    if (counter) counter.innerText = `${unlockedCount} / ${total} (${percentage}%)`;
    if (fill) fill.style.width = `${percentage}%`;

    // Renderizar las 151 tarjetas
    pokemonDB.forEach(pkmn => {
        const isUnlocked = playerCollection.has(pkmn.id);
        const card = document.createElement('div');
        
        card.className = `dex-card ${isUnlocked ? 'unlocked' : 'locked'}`;
        card.innerHTML = `
            <div class="dex-number">#${String(pkmn.id).padStart(3, '0')}</div>
            <img src="${pkmn.sprite}" alt="${pkmn.name}">
            <div class="dex-name">${isUnlocked ? pkmn.name : '???'}</div>
        `;
        
        grid.appendChild(card);
    });
}

// Modificar switchTab para que actualice la Dex al abrirla
const originalSwitchTab = switchTab;
switchTab = function(tabId, event) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(btn => btn.classList.remove('active'));

    const activeTab = document.getElementById(`tab-${tabId}`);
    if (activeTab) activeTab.classList.add('active');

    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    // Si abrimos la Dex, la refrescamos
    if (tabId === 'dex') {
        renderDex();
    }
};

// Registrar nuevos Pokémon obtenidos tras cada tirada
function registerUnlockedPokemon(pulls) {
    pulls.forEach(pkmn => {
        if (pkmn && pkmn.id) {
            playerCollection.add(pkmn.id);
        }
    });
}