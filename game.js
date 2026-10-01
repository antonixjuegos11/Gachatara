// game.js - Fondo de partículas, Pokédex, Inventario y Navegación Corregida

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
// GESTIÓN DE INVENTARIO Y POKÉDEX (LOCALSTORAGE)
// =========================================

const POKEDEX_KEY = 'pokemon_pokedex_collection';
const INVENTORY_KEY = 'pokemon_user_inventory';

// Cargar Pokédex (desbloqueados únicos)
const savedDex = JSON.parse(localStorage.getItem(POKEDEX_KEY) || '[]');
const playerCollection = new Set(savedDex);

// Cargar Inventario (Pokémon obtenidos con fecha/instancia)
let userInventory = JSON.parse(localStorage.getItem(INVENTORY_KEY) || '[]');

function saveStorage() {
    localStorage.setItem(POKEDEX_KEY, JSON.stringify(Array.from(playerCollection)));
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(userInventory));
}

// Añadir Pokémon al inventario del usuario
function addPokemonToInventory(pkmn) {
    if (!pkmn) return;

    // Registrar en Pokédex
    playerCollection.add(Number(pkmn.id));

    // Guardar copia en el inventario/equipo
    userInventory.push({
        ...pkmn,
        uid: Date.now() + Math.random().toString(36).substring(2, 7) // Identificador único
    });

    saveStorage();
}

// Renderizar Inventario / Equipo
// Renderizar Inventario / Equipo ordenado por ID y con contador dinámico
function renderInventory() {
    const container = document.getElementById('inventory-grid') || document.getElementById('team-grid');
    const counterElem = document.getElementById('total-captured');

    if (!container) return;

    // 1. Actualizar el contador total de capturados
    if (counterElem) {
        counterElem.innerText = `Total capturados: ${userInventory.length}`;
    }

    container.innerHTML = '';

    if (userInventory.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); grid-column: 1/-1; text-align: center;">No tienes Pokémon en tu inventario aún. ¡Usa el Gacha para conseguir algunos!</p>';
        return;
    }

    // 2. Ordenar de menor a mayor por número de Pokédex (ID)
    const sortedInventory = [...userInventory].sort((a, b) => Number(a.id) - Number(b.id));

    // 3. Crear las cartas alineadas
    sortedInventory.forEach(pkmn => {
        const rawRarity = pkmn.rarity || 'comun';
        const cleanRarityClass = rawRarity
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        const card = document.createElement('div');
        card.className = `pokemon-card card-pokemon ${cleanRarityClass}`;
        card.innerHTML = `
            <div class="card-id">#${String(pkmn.id).padStart(4, '0')}</div>
            <img src="${pkmn.sprite}" alt="${pkmn.name}">
            <div class="card-name">${pkmn.name}</div>
            <div class="card-rarity">${rawRarity.toUpperCase()}</div>
        `;
        container.appendChild(card);
    });
}

// =========================================
// OBTENER POKÉMON DE LA BASE DE DATOS
// =========================================

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
// NAVEGACIÓN ENTRE PESTAÑAS (CORREGIDA)
// =========================================

function switchTab(tabId, event) {
    // 1. Ocultar todas las pestañas
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    
    // 2. Desmarcar todos los botones de navegación
    document.querySelectorAll('.nav-tab').forEach(btn => btn.classList.remove('active'));

    // 3. Activar el contenedor de la pestaña seleccionada
    const activeTab = document.getElementById(`tab-${tabId}`);
    if (activeTab) activeTab.classList.add('active');

    // 4. Activar el botón correcto
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    } else {
        // Buscar el botón correspondiente por su llamada onclick o data-tab
        const targetBtn = document.querySelector(`.nav-tab[onclick*="'${tabId}'"]`) || 
                          document.querySelector(`.nav-tab[data-tab="${tabId}"]`);
        if (targetBtn) {
            targetBtn.classList.add('active');
        }
    }

    // 5. Limpiar tiradas gacha si salimos de la pestaña invocación
    if (tabId !== 'invocacion') {
        const resultsContainer = document.getElementById('gacha-results');
        if (resultsContainer) resultsContainer.innerHTML = '';
    }

    // 6. Actualizar vistas según la pestaña seleccionada
    if (tabId === 'dex') {
        renderDex();
    } else if (tabId === 'inventory' || tabId === 'equipo' || tabId === 'lobby') {
        renderInventory();
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

    // Guardar cada Pokémon en el Inventario y Pokédex
    pulls.forEach(pkmn => {
        if (pkmn) {
            addPokemonToInventory(pkmn);
        }
    });

    // Pintar cartas en pantalla con animación
    pulls.forEach((pkmn, index) => {
        if (!pkmn) return;

        const rawRarity = pkmn.rarity || 'comun';
        const cleanRarityClass = rawRarity.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        const card = document.createElement('div');
        card.className = `card-pokemon ${cleanRarityClass}`;
        card.style.animationDelay = `${(index * 0.1).toFixed(2)}s`;

        card.innerHTML = `
            <img src="${pkmn.sprite}" alt="${pkmn.name}">
            <h4>${pkmn.name}</h4>
            <div class="card-rarity">${rawRarity.toUpperCase()}</div>
        `;
        
        resultsContainer.appendChild(card);
    });
}

// Inicializar vistas al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    renderInventory();
});