// game.js - Fondo de partículas, Pokédex, Inventario, Monedas y Navegación

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
// GESTIÓN DE MONEDAS Y RECURSOS
// =========================================

const CURRENCIES_KEY = 'pokemon_user_currencies';

// Obtener las monedas guardadas o valores por defecto
function getCurrencies() {
    const defaultCurrencies = { tickets: 10, shards: 100, coins: 500 };
    const saved = localStorage.getItem(CURRENCIES_KEY);
    if (!saved) {
        localStorage.setItem(CURRENCIES_KEY, JSON.stringify(defaultCurrencies));
        return defaultCurrencies;
    }
    return JSON.parse(saved);
}

function saveCurrencies(currencies) {
    localStorage.setItem(CURRENCIES_KEY, JSON.stringify(currencies));
    updateCurrenciesUI();
}

// Actualizar los textos del contador en el header
function updateCurrenciesUI() {
    const currencies = getCurrencies();
    
    const ticketsElem = document.getElementById('currency-tickets');
    const shardsElem = document.getElementById('currency-shards');
    const coinsElem = document.getElementById('currency-coins');

    if (ticketsElem) ticketsElem.innerText = currencies.tickets ?? 0;
    if (shardsElem) shardsElem.innerText = currencies.shards ?? 0;
    if (coinsElem) coinsElem.innerText = currencies.coins ?? 0;
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

// Renderizar Inventario / Equipo agrupado por ID y ordenado
function renderInventory() {
    const container = document.getElementById('inventory-grid') || document.getElementById('team-grid');
    const counterElem = document.getElementById('total-capturados');

    // 1. Actualizar el número total en el contador del HTML
    if (counterElem) {
        counterElem.innerText = userInventory.length;
    }

    if (!container) return;

    container.innerHTML = '';

    if (userInventory.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); grid-column: 1/-1; text-align: center; padding: 20px;">No tienes Pokémon en tu inventario aún. ¡Usa el Gacha para conseguir algunos!</p>';
        return;
    }

    // 2. Agrupar repeticiones por ID de Pokémon
    const groupedInventory = {};

    userInventory.forEach(pkmn => {
        const pkmnId = Number(pkmn.id);
        if (!groupedInventory[pkmnId]) {
            groupedInventory[pkmnId] = {
                ...pkmn,
                count: 1
            };
        } else {
            groupedInventory[pkmnId].count += 1;
        }
    });

    // 3. Ordenar de menor a mayor por ID de Pokédex
    const sortedInventory = Object.values(groupedInventory).sort((a, b) => Number(a.id) - Number(b.id));

    // 4. Renderizar las cartas acumuladas
    sortedInventory.forEach(pkmn => {
        const rawRarity = pkmn.rarity || 'comun';
        const cleanRarityClass = rawRarity
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        const card = document.createElement('div');
        card.className = `pokemon-card card-pokemon ${cleanRarityClass}`;
        
        // Badge de repetición si se posee más de 1 unidad
        const countBadge = pkmn.count > 1 ? `<span class="card-count-badge">x${pkmn.count}</span>` : '';

        card.innerHTML = `
            ${countBadge}
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

// Inicializar vistas e interfaz al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    updateCurrenciesUI();
    renderInventory();
});

// Escuchar cambios de LocalStorage (por si se reinician datos en Ajustes)
window.addEventListener('storage', () => {
    updateCurrenciesUI();
    renderInventory();
});