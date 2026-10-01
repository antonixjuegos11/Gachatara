// game.js - Fondo de partículas, Pokédex y Renderizado de Invocación

// =========================================
// FONDO ANIMADO DE PARTÍCULAS
// =========================================
const canvas = document.getElementById('particles-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;

if (canvas && ctx) {
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
}

// =========================================
// COLECCIÓN GLOBAL Y POKÉDEX
// =========================================

// Cargar la colección guardada del almacenamiento local o iniciar vacía
const STORAGE_KEY = 'pokemon_pokedex_collection';
const savedCollection = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
const playerCollection = new Set(savedCollection);

// Guardar los datos actuales de la colección
function saveCollection() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(playerCollection)));
}

// Obtener la lista completa de Pokémon desde DATABASE ordenados por ID
function getAllPokemonFromDB() {
    if (typeof DATABASE === 'undefined') return [];
    
    let allPkmn = [];
    Object.keys(DATABASE).forEach(rarityKey => {
        if (Array.isArray(DATABASE[rarityKey])) {
            allPkmn = allPkmn.concat(DATABASE[rarityKey]);
        }
    });

    return allPkmn.sort((a, b) => a.id - b.id);
}

// Registrar Pokémon desbloqueados y guardar progreso
function registerUnlockedPokemon(pulls) {
    if (!Array.isArray(pulls)) return;
    let newUnlocked = false;

    pulls.forEach(pkmn => {
        if (pkmn && pkmn.id !== undefined) {
            const pkmnId = Number(pkmn.id);
            if (!playerCollection.has(pkmnId)) {
                playerCollection.add(pkmnId);
                newUnlocked = true;
            }
        }
    });

    if (newUnlocked) {
        saveCollection();
    }
}

// Renderizar Pokédex
function renderDex() {
    const grid = document.getElementById('dex-grid');
    const counter = document.getElementById('dex-counter');
    const fill = document.getElementById('dex-progress-fill');
    
    if (!grid) return;
    grid.innerHTML = '';

    const dbList = getAllPokemonFromDB();

    if (dbList.length === 0) {
        grid.innerHTML = '<p style="color: var(--text-secondary); grid-column: 1/-1; text-align: center;">Cargando Pokédex...</p>';
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

    // Limpiar pantalla de invocación al cambiar de pestaña
    if (tabId !== 'invocacion') {
        const resultsContainer = document.getElementById('gacha-results');
        if (resultsContainer) resultsContainer.innerHTML = '';
    }

    // Renderizar Pokédex
    if (tabId === 'dex') {
        renderDex();
    }
}

// =========================================
// SISTEMA DE RENDERIZADO DE TIRADAS GACHA
// =========================================

function pullGacha(amount) {
    const resultsContainer = document.getElementById('gacha-results');
    if (!resultsContainer) return;

    resultsContainer.innerHTML = '';

    let pulls = [];
    if (amount === 1) {
        if (typeof executeSinglePull === 'function') {
            const result = executeSinglePull();
            if (result) pulls.push(result);
        }
    } else {
        if (typeof executeMultiPull === 'function') {
            pulls = executeMultiPull();
        }
    }

    // Guardar en Pokédex y almacenamiento local
    registerUnlockedPokemon(pulls);

    // Opcional: Agregar al inventario/equipo si existe la función correspondiente
    if (typeof addPokemonToInventory === 'function') {
        pulls.forEach(pkmn => {
            if (pkmn) addPokemonToInventory(pkmn);
        });
    }

    // Pintar cartas en pantalla con animación
    pulls.forEach((pkmn, index) => {
        if (!pkmn) return;

        // Limpiar nombre de rareza para la clase CSS
        const rawRarity = pkmn.rarity || 'comun';
        const cleanRarityClass = rawRarity
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        const card = document.createElement('div');
        card.className = `card-pokemon ${cleanRarityClass}`;
        
        // Retardo de animación por carta corregido
        card.style.animationDelay = `${(index * 0.1).toFixed(2)}s`;

        card.innerHTML = `
            <img src="${pkmn.sprite}" alt="${pkmn.name}">
            <h4>${pkmn.name}</h4>
            <div class="card-rarity">${rawRarity.toUpperCase()}</div>
        `;
        
        resultsContainer.appendChild(card);
    });
}