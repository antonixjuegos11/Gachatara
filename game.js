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
// COLECCIÓN GLOBAL Y POKÉDEX
// =========================================

// Inventario global del jugador (IDs obtenidos)
const playerCollection = new Set();

// Función auxiliar para obtener la lista completa de Pokémon desde DATABASE
function getAllPokemonFromDB() {
    if (typeof DATABASE === 'undefined') return [];
    
    let allPkmn = [];
    Object.keys(DATABASE).forEach(rarityKey => {
        if (Array.isArray(DATABASE[rarityKey])) {
            allPkmn = allPkmn.concat(DATABASE[rarityKey]);
        }
    });

    // Ordenamos por ID de Pokédex de menor a mayor
    return allPkmn.sort((a, b) => a.id - b.id);
}

// Registrar Pokémon desbloqueados tras tirar en el Gacha
function registerUnlockedPokemon(pulls) {
    pulls.forEach(pkmn => {
        if (pkmn && pkmn.id !== undefined) {
            playerCollection.add(Number(pkmn.id));
        }
    });
}

// Renderizar la Pokédex
function renderDex() {
    const grid = document.getElementById('dex-grid');
    const counter = document.getElementById('dex-counter');
    const fill = document.getElementById('dex-progress-fill');
    
    if (!grid) return;
    grid.innerHTML = '';

    const dbList = getAllPokemonFromDB();

    if (dbList.length === 0) {
        grid.innerHTML = '<p style="color: var(--text-secondary); grid-column: 1/-1;">Cargando base de datos de Pokémon...</p>';
        return;
    }

    const total = dbList.length;
    const unlockedCount = playerCollection.size;
    const percentage = Math.round((unlockedCount / total) * 100);

    if (counter) counter.innerText = `${unlockedCount} / ${total} (${percentage}%)`;
    if (fill) fill.style.width = `${percentage}%`;

    dbList.forEach(pkmn => {
        const pkmnId = Number(pkmn.id);
        const isUnlocked = playerCollection.has(pkmnId);

        const card = document.createElement('div');
        card.className = `dex-card ${isUnlocked ? 'unlocked' : 'locked'}`;
        card.innerHTML = `
            <div class="dex-number">#${String(pkmnId).padStart(3, '0')}</div>
            <img src="${pkmn.sprite}" alt="${pkmn.name}">
            <div class="dex-name">${isUnlocked ? pkmn.name : '???'}</div>
        `;
        
        grid.appendChild(card);
    });
}

// =========================================
// NAVEGACIÓN ENTRE PESTAÑAS
// =========================================

function switchTab(tabId, event) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(btn => btn.classList.remove('active'));

    const activeTab = document.getElementById(`tab-${tabId}`);
    if (activeTab) activeTab.classList.add('active');

    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    } else {
        const navBtns = document.querySelectorAll('.nav-tab');
        if (tabId === 'lobby' && navBtns[0]) navBtns[0].classList.add('active');
        if (tabId === 'invocacion' && navBtns[1]) navBtns[1].classList.add('active');
        if (tabId === 'dex' && navBtns[2]) navBtns[2].classList.add('active');
    }

    // Limpiar pantalla de invocación al salir
    if (tabId !== 'invocacion') {
        const resultsContainer = document.getElementById('gacha-results');
        if (resultsContainer) resultsContainer.innerHTML = '';
    }

    // Cargar Dex al entrar a la pestaña Dex
    if (tabId === 'dex') {
        renderDex();
    }
}

// =========================================
// SISTEMA DE TIRADAS GACHA
// =========================================

function pullGacha(amount) {
    const resultsContainer = document.getElementById('gacha-results');
    if (!resultsContainer) return;

    resultsContainer.innerHTML = '';

    let pulls = [];
    if (amount === 1) {
        if (typeof executeSinglePull === 'function') {
            pulls.push(executeSinglePull());
        }
    } else {
        if (typeof executeMultiPull === 'function') {
            pulls = executeMultiPull();
        }
    }

    // Guardar Pokémon obtenidos en la colección de la Pokédex
    registerUnlockedPokemon(pulls);

    // Dibujar resultados en pantalla con clases de rareza normalizadas para el CSS
    pulls.forEach((pkmn, index) => {
        if (!pkmn) return;

        // Limpiar la cadena de rareza (remueve tildes para evitar desajustes en el CSS)
        const rawRarity = pkmn.rarity || 'comun';
        const cleanRarityClass = rawRarity
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        const card = document.createElement('div');
        card.className = `card-pokemon ${cleanRarityClass}`;
        card.style.animationDelay = `${index * 0.12}s`;

        card.innerHTML = `
            <img src="${pkmn.sprite}" alt="${pkmn.name}">
            <h4>${pkmn.name}</h4>
            <div class="card-rarity">${rawRarity.toUpperCase()}</div>
        `;
        resultsContainer.appendChild(card);
    });
}