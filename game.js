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

// Inventario global del jugador (guarda los ID únicos obtenidos)
const playerCollection = new Set();

// Registrar Pokémon desbloqueados
function registerUnlockedPokemon(pulls) {
    pulls.forEach(pkmn => {
        if (!pkmn) return;
        const pkmnId = pkmn.id || pkmn.num || pkmn.pokedexId;
        if (pkmnId !== undefined) {
            playerCollection.add(Number(pkmnId));
        }
    });
}

// Renderizar la Pokedéx
function renderDex() {
    const grid = document.getElementById('dex-grid');
    const counter = document.getElementById('dex-counter');
    const fill = document.getElementById('dex-progress-fill');
    
    // Detecta automáticamente cómo se llama tu array en db.js o gacha.js
    const db = window.pokemonDB || window.POKEMON_DATABASE || window.pokemons || (typeof pokemonDB !== 'undefined' ? pokemonDB : []);

    if (!grid) return;
    grid.innerHTML = '';

    if (!db || db.length === 0) {
        grid.innerHTML = '<p style="color: var(--text-secondary); grid-column: 1/-1;">No se detectó la base de datos de Pokémon.</p>';
        return;
    }

    const total = db.length;
    const unlockedCount = playerCollection.size;
    const percentage = Math.round((unlockedCount / total) * 100);

    if (counter) counter.innerText = `${unlockedCount} / ${total} (${percentage}%)`;
    if (fill) fill.style.width = `${percentage}%`;

    db.forEach(pkmn => {
        const pkmnId = Number(pkmn.id || pkmn.num || pkmn.pokedexId);
        const isUnlocked = playerCollection.has(pkmnId);

        const card = document.createElement('div');
        card.className = `dex-card ${isUnlocked ? 'unlocked' : 'locked'}`;
        card.innerHTML = `
            <div class="dex-number">#${String(pkmnId).padStart(3, '0')}</div>
            <img src="${pkmn.sprite || pkmn.image}" alt="${pkmn.name}">
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

    // Ilumina el botón activo en la barra superior
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    } else {
        const navBtns = document.querySelectorAll('.nav-tab');
        if (tabId === 'lobby' && navBtns[0]) navBtns[0].classList.add('active');
        if (tabId === 'invocacion' && navBtns[1]) navBtns[1].classList.add('active');
        if (tabId === 'dex' && navBtns[2]) navBtns[2].classList.add('active');
    }

    // Limpia la pantalla de tiradas al cambiar de pestaña
    if (tabId !== 'invocacion') {
        const resultsContainer = document.getElementById('gacha-results');
        if (resultsContainer) resultsContainer.innerHTML = '';
    }

    // Carga la Dex al cambiar a la pestaña Dex
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

    // Guarda los Pokémon tirados en la colección
    registerUnlockedPokemon(pulls);

    // Dibuja las cartas obtenidas
    pulls.forEach((pkmn, index) => {
        if (!pkmn) return;
        const card = document.createElement('div');
        card.className = `card-pokemon ${pkmn.rarity || 'común'}`;
        card.style.animationDelay = `${index * 0.12}s`;

        card.innerHTML = `
            <img src="${pkmn.sprite || pkmn.image}" alt="${pkmn.name}">
            <h4>${pkmn.name}</h4>
            <div class="card-rarity">${pkmn.rarity || 'común'}</div>
        `;
        resultsContainer.appendChild(card);
    });
}