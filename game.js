// game.js - Fondo de partículas, Pokédex, Inventario, Monedas, Estrellas y Modal

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
// GESTIÓN DE INVENTARIO, POKÉDEX Y ESTRELLAS
// =========================================

const POKEDEX_KEY = 'pokemon_pokedex_collection';
const INVENTORY_KEY = 'pokemon_user_inventory';

const savedDex = JSON.parse(localStorage.getItem(POKEDEX_KEY) || '[]');
const playerCollection = new Set(savedDex);

let userInventory = JSON.parse(localStorage.getItem(INVENTORY_KEY) || '[]');

// Configuración de costes de duplicados para las 7 estrellas
const DUPE_COSTS_PER_STAR = [1, 2, 3, 5, 8, 12, 18]; 

function getDupeCostForNextStar(currentStars) {
    if (currentStars >= 7) return null;
    return DUPE_COSTS_PER_STAR[currentStars] || 18;
}

function getStatMultiplierForStars(stars) {
    // Cada estrella otorga un +10% acumulativo a las estadísticas base
    return 1 + ((stars || 0) * 0.10);
}

function saveStorage() {
    localStorage.setItem(POKEDEX_KEY, JSON.stringify(Array.from(playerCollection)));
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(userInventory));
}

// Añadir Pokémon al inventario (compatible con duplicados y datos base)
function addPokemonToInventory(pkmn) {
    if (!pkmn || !pkmn.id) return;

    playerCollection.add(Number(pkmn.id));

    // Buscar si ya existe por ID en el inventario del usuario
    let existing = userInventory.find(item => Number(item.id) === Number(pkmn.id));

    if (existing) {
        existing.count = (existing.count || existing.dupes || 1) + 1;
    } else {
        // Enriquecer con datos de la base de datos si faltan
        let fullPkmnData = pkmn;
        if (typeof DATABASE !== 'undefined' && (!pkmn.baseStats || !pkmn.ability)) {
            for (const cat in DATABASE) {
                const found = DATABASE[cat].find(p => Number(p.id) === Number(pkmn.id) || p.name.toLowerCase() === pkmn.name.toLowerCase());
                if (found) {
                    fullPkmnData = { ...found, ...pkmn };
                    break;
                }
            }
        }

        userInventory.push({
            ...fullPkmnData,
            stars: 0,
            count: 1,
            level: pkmn.level || 10,
            baseStats: fullPkmnData.baseStats || { hp: 45, attack: 49, defense: 49, spAtk: 65, spDef: 65, speed: 45 },
            ability: fullPkmnData.ability || pkmn.ability || 'Presión'
        });
    }

    saveStorage();
    renderInventory();
    
    if (typeof updateDexProgress === 'function') {
        updateDexProgress();
    }
}

// Renderizar Inventario ordenado y agrupado
function renderInventory() {
    const container = document.getElementById('inventory-grid') || document.getElementById('team-grid');
    const counterElem = document.getElementById('total-capturados');

    if (counterElem) {
        counterElem.innerText = userInventory.length;
    }

    if (!container) return;

    container.innerHTML = '';

    if (userInventory.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); grid-column: 1/-1; text-align: center; padding: 20px;">No tienes Pokémon en tu inventario aún. ¡Usa el Gacha para conseguir algunos!</p>';
        return;
    }

    const sortedInventory = [...userInventory].sort((a, b) => Number(a.id) - Number(b.id));

    sortedInventory.forEach(pkmn => {
        const rawRarity = pkmn.rarity || 'comun';
        const cleanRarityClass = rawRarity.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        pkmn.stars = pkmn.stars || 0;
        const totalCopies = pkmn.count || pkmn.dupes || 1;
        const starsDisplay = '★'.repeat(pkmn.stars);

        const card = document.createElement('div');
        card.className = `pokemon-card card-pokemon ${cleanRarityClass}`;
        card.style.cursor = 'pointer';
        
        const countBadge = totalCopies > 1 ? `<span class="card-count-badge">x${totalCopies}</span>` : '';

        card.innerHTML = `
            ${countBadge}
            ${pkmn.stars > 0 ? `<div class="card-stars-badge" style="position: absolute; top: 5px; left: 5px; color: #f1c40f; font-size: 11px; text-shadow: 0 1px 2px #000;">${starsDisplay}</div>` : ''}
            <div class="card-id">#${String(pkmn.id).padStart(4, '0')}</div>
            <img src="${pkmn.sprite}" alt="${pkmn.name}">
            <div class="card-name">${pkmn.name}</div>
            <div class="card-rarity">${rawRarity.toUpperCase()}</div>
        `;

        card.onclick = () => openPokemonModal(pkmn.id);
        container.appendChild(card);
    });
}

// =========================================
// MODAL DE INFORMACIÓN Y DESPERTAR ESTRELLAS
// =========================================

function openPokemonModal(pokemonId) {
    const pkmn = userInventory.find(item => Number(item.id) === Number(pokemonId));
    if (!pkmn) return;

    pkmn.stars = pkmn.stars || 0;
    const totalCopies = pkmn.count || pkmn.dupes || 1;

    let modal = document.getElementById('pokemon-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'pokemon-modal';
        modal.className = 'pokemon-modal-overlay';
        modal.style.display = 'none';
        modal.innerHTML = `
            <div class="pokemon-modal-content">
                <button class="modal-close-btn" onclick="closePokemonModal()">✖</button>
                <div id="modal-body-content"></div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    const content = document.getElementById('modal-body-content');
    const sprite = pkmn.sprite || '';
    const typeLabel = (pkmn.types || [pkmn.type || 'Normal']).join(' / ');
    
    // Resolución segura de la habilidad usando el archivo habilidades.js
    let abilityName = pkmn.ability || 'Ninguna';
    if (typeof getAbilityDisplayName === 'function') {
        abilityName = getAbilityDisplayName(pkmn.ability);
    }

    const nextCost = getDupeCostForNextStar(pkmn.stars);
    const canAwaken = pkmn.stars < 7 && totalCopies > nextCost;
    const starsDisplay = '★'.repeat(pkmn.stars) + '☆'.repeat(7 - pkmn.stars);

    // Calcular estadísticas con el multiplicador de estrellas (+10% por estrella)
    const mult = getStatMultiplierForStars(pkmn.stars);
    const base = pkmn.baseStats || { hp: 45, attack: 49, defense: 49, spAtk: 65, spDef: 65, speed: 45 };
    const level = pkmn.level || 10;
    
    const calcHp = Math.floor((Math.floor(((2 * base.hp) * level) / 100) + level + 10) * mult);
    const calcAtk = Math.floor((Math.floor(((2 * base.attack) * level) / 100) + 5) * mult);
    const calcDef = Math.floor((Math.floor(((2 * base.defense) * level) / 100) + 5) * mult);
    const calcSpd = Math.floor((Math.floor(((2 * base.speed) * level) / 100) + 5) * mult);

    content.innerHTML = `
        <div class="modal-header-section">
            <h2 class="modal-pkmn-name">${pkmn.name}</h2>
            <div class="modal-stars">${starsDisplay} (Rango ${pkmn.stars}/7)</div>
        </div>

        <div class="modal-body-grid" style="display: flex; gap: 20px; align-items: center; margin-bottom: 20px;">
            <div class="modal-sprite-box" style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; text-align: center; flex: 1;">
                <img src="${sprite}" alt="${pkmn.name}" style="width: 100px; height: 100px; object-fit: contain;">
                <span class="modal-type-badge" style="display: inline-block; margin-top: 8px; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; background: #576574; color: white;">${typeLabel}</span>
            </div>

            <div class="modal-stats-box" style="flex: 1.2; font-size: 14px; line-height: 1.6;">
                <h3 style="margin: 0 0 10px 0; font-size: 15px; color: #7bed9f; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px;">Estadísticas (Nv. ${level})</h3>
                <p>❤️ HP: <strong>${calcHp}</strong></p>
                <p>⚔️ Ataque: <strong>${calcAtk}</strong></p>
                <p>🛡️ Defensa: <strong>${calcDef}</strong></p>
                <p>⚡ Velocidad: <strong>${calcSpd}</strong></p>
                <div class="modal-ability-info" style="margin-top: 8px;">
                    <p>✨ <strong>Habilidad:</strong> ${abilityName}</p>
                </div>
            </div>
        </div>

        <div class="modal-awakening-section" style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 10px; text-align: center;">
            <div class="dupes-counter" style="margin-bottom: 10px; font-size: 14px; color: #dfe4ea;">
                📦 Copias totales: <strong>${totalCopies}</strong> (Necesitas ${nextCost} duplicados adicionales)
            </div>
            ${pkmn.stars < 7 ? `
                <button class="btn-awaken" onclick="awakenPokemon(${pkmn.id})" ${!canAwaken ? 'disabled' : ''} style="background: ${canAwaken ? '#2ed573' : '#718093'}; color: white; border: none; padding: 10px 20px; font-size: 14px; font-weight: bold; border-radius: 8px; cursor: ${canAwaken ? 'pointer' : 'not-allowed'}; width: 100%; transition: 0.2s;">
                    🌟 Despertar Estrella (-${nextCost} copias)
                </button>
            ` : `
                <div class="max-rank-text" style="color: #f1c40f; font-weight: bold; font-size: 14px;">🎉 ¡Este Pokémon ha alcanzado el Poder Máximo (7 Estrellas)!</div>
            `}
        </div>
    `;

    modal.style.display = 'flex';
}

function closePokemonModal() {
    const modal = document.getElementById('pokemon-modal');
    if (modal) modal.style.display = 'none';
}

function awakenPokemon(pokemonId) {
    const pkmn = userInventory.find(item => Number(item.id) === Number(pokemonId));
    if (!pkmn) return;

    const nextCost = getDupeCostForNextStar(pkmn.stars);
    let totalCopies = pkmn.count || pkmn.dupes || 1;

    if (pkmn.stars < 7 && totalCopies > nextCost) {
        totalCopies -= nextCost; 
        pkmn.count = totalCopies;
        pkmn.dupes = totalCopies;
        pkmn.stars += 1;        
        
        saveStorage();
        openPokemonModal(pokemonId); 
        renderInventory();       
    }
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
        const targetBtn = document.querySelector(`.nav-tab[onclick*="'${tabId}'"]`) || 
                          document.querySelector(`.nav-tab[data-tab="${tabId}"]`);
        if (targetBtn) {
            targetBtn.classList.add('active');
        }
    }

    if (tabId !== 'invocacion') {
        const resultsContainer = document.getElementById('gacha-results');
        if (resultsContainer) resultsContainer.innerHTML = '';
    }

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

window.addEventListener('storage', () => {
    updateCurrenciesUI();
    renderInventory();
});