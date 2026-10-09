// game.js - Fondo de partículas, Pokédex, Inventario, Equipos Activos, Monedas, Estrellas y Modal

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
// GESTIÓN DE INVENTARIO, POKÉDEX, EQUIPOS Y ESTRELLAS
// =========================================

const POKEDEX_KEY = 'pokemon_pokedex_collection';
const INVENTORY_KEY = 'pokemon_user_inventory';
const ACTIVE_TEAM_STRATEGY_KEY = 'pokemon_active_team_strategy';
const ACTIVE_TEAM_FAST_KEY = 'pokemon_active_team_fast';

const savedDex = JSON.parse(localStorage.getItem(POKEDEX_KEY) || '[]');
const playerCollection = new Set(savedDex);

let userInventory = JSON.parse(localStorage.getItem(INVENTORY_KEY) || '[]');
let activeTeamStrategy = JSON.parse(localStorage.getItem(ACTIVE_TEAM_STRATEGY_KEY) || '[]'); // Máx 6
let activeTeamFast = JSON.parse(localStorage.getItem(ACTIVE_TEAM_FAST_KEY) || '[]'); // Máx 3

let currentTeamMode = 'strategy'; // 'strategy' (6) o 'fast' (3)

function switchTeamMode(mode, event) {
    currentTeamMode = mode;
    document.querySelectorAll('.team-builder-tabs .banner-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
    renderActiveTeamSlots();
    renderInventory();
}

// Configuración de costes de duplicados para las 7 estrellas
const DUPE_COSTS_PER_STAR = [1, 2, 3, 5, 8, 12, 18]; 

function getDupeCostForNextStar(currentStars) {
    if (currentStars >= 7) return null;
    return DUPE_COSTS_PER_STAR[currentStars] || 18;
}

function getStatMultiplierForStars(stars) {
    return 1 + ((stars || 0) * 0.10);
}

function saveStorage() {
    localStorage.setItem(POKEDEX_KEY, JSON.stringify(Array.from(playerCollection)));
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(userInventory));
    localStorage.setItem(ACTIVE_TEAM_STRATEGY_KEY, JSON.stringify(activeTeamStrategy));
    localStorage.setItem(ACTIVE_TEAM_FAST_KEY, JSON.stringify(activeTeamFast));
}

// Añadir Pokémon al inventario
function addPokemonToInventory(pkmn) {
    if (!pkmn || !pkmn.id) return;

    playerCollection.add(Number(pkmn.id));

    let existing = userInventory.find(item => Number(item.id) === Number(pkmn.id));

    if (existing) {
        existing.count = (existing.count || existing.dupes || 1) + 1;
    } else {
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
            level: pkmn.level || 1,
            baseStats: fullPkmnData.baseStats || { hp: 45, attack: 49, defense: 49, spAtk: 65, spDef: 65, speed: 45 },
            ability: fullPkmnData.ability || pkmn.ability || 'Presión'
        });
    }

    saveStorage();
    renderInventory();
    renderActiveTeamSlots();
    
    if (typeof updateDexProgress === 'function') {
        updateDexProgress();
    }
}

// Renderizar los slots del equipo activo superior
function renderActiveTeamSlots() {
    const slotsContainer = document.getElementById('active-team-slots');
    if (!slotsContainer) return;

    slotsContainer.innerHTML = '';
    const maxSlots = currentTeamMode === 'strategy' ? 6 : 3;
    const currentTeam = currentTeamMode === 'strategy' ? activeTeamStrategy : activeTeamFast;

    for (let i = 0; i < maxSlots; i++) {
        const pkmn = currentTeam[i];
        const slotDiv = document.createElement('div');
        slotDiv.className = 'active-team-slot';
        slotDiv.style.cssText = 'width: 70px; height: 70px; background: rgba(255,255,255,0.05); border: 2px dashed rgba(0,242,254,0.4); border-radius: 10px; display: flex; align-items: center; justify-content: center; position: relative; cursor: pointer; transition: 0.2s;';

        if (pkmn) {
            slotDiv.style.border = '2px solid #00f2fe';
            slotDiv.innerHTML = `
                <img src="${pkmn.sprite}" alt="${pkmn.name}" style="width: 50px; height: 50px; object-fit: contain;">
                <span style="position: absolute; top: -5px; right: -5px; background: #eb4d4b; color: white; border-radius: 50%; width: 18px; height: 18px; font-size: 10px; display: flex; align-items: center; justify-content: center; font-weight: bold;">✕</span>
            `;
            slotDiv.title = `Quitar a ${pkmn.name} del equipo`;
            slotDiv.onclick = () => removePokemonFromTeam(i);
        } else {
            slotDiv.innerHTML = `<span style="color: rgba(255,255,255,0.3); font-size: 20px;">+</span>`;
            slotDiv.title = `Slot vacío (${i + 1}/${maxSlots})`;
        }

        slotsContainer.appendChild(slotDiv);
    }
}

function removePokemonFromTeam(index) {
    if (currentTeamMode === 'strategy') {
        activeTeamStrategy.splice(index, 1);
    } else {
        activeTeamFast.splice(index, 1);
    }
    saveStorage();
    renderActiveTeamSlots();
    renderInventory();
}

function togglePokemonInTeam(pkmn) {
    const currentTeam = currentTeamMode === 'strategy' ? activeTeamStrategy : activeTeamFast;
    const maxSlots = currentTeamMode === 'strategy' ? 6 : 3;

    const existingIndex = currentTeam.findIndex(item => Number(item.id) === Number(pkmn.id));

    if (existingIndex !== -1) {
        currentTeam.splice(existingIndex, 1);
    } else {
        if (currentTeam.length >= maxSlots) {
            alert(`¡El equipo ${currentTeamMode === 'strategy' ? 'Estratégico' : 'Rápido'} ya está lleno (${maxSlots}/${maxSlots})!`);
            return;
        }
        currentTeam.push(pkmn);
    }

    saveStorage();
    renderActiveTeamSlots();
    renderInventory();
}

// Renderizar Inventario ordenado y agrupado
// Normaliza texto para buscar sin tildes ni mayúsculas
function normalizeSearchText(text) {
    return String(text || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

// Filtro del buscador del inventario: nombre, número de Pokédex o tipo (+ filtro de rareza)
function matchesInventoryFilter(pkmn) {
    const searchElem = document.getElementById('inventory-search');
    const rarityElem = document.getElementById('inventory-rarity-filter');
    const query = normalizeSearchText(searchElem ? searchElem.value : '');
    const rarity = rarityElem ? rarityElem.value : '';

    if (rarity) {
        const pr = normalizeSearchText(pkmn.rarity || 'comun');
        if (pr !== rarity) return false;
    }
    if (!query) return true;

    const name = normalizeSearchText(pkmn.name);
    const idText = String(pkmn.id);
    const types = normalizeSearchText((pkmn.types || [pkmn.type || '']).join(' '));
    const cleanQuery = query.replace('#', '');

    return name.includes(query) || types.includes(query) || (/^\d+$/.test(cleanQuery) && idText.startsWith(cleanQuery.replace(/^0+/, '')));
}

function clearInventorySearch() {
    const s = document.getElementById('inventory-search');
    const r = document.getElementById('inventory-rarity-filter');
    if (s) s.value = '';
    if (r) r.value = '';
    renderInventory();
}

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

    const currentTeam = currentTeamMode === 'strategy' ? activeTeamStrategy : activeTeamFast;
    const sortedInventory = [...userInventory]
        .sort((a, b) => Number(a.id) - Number(b.id))
        .filter(matchesInventoryFilter);

    const resultsElem = document.getElementById('inventory-results-count');
    if (resultsElem) {
        resultsElem.textContent = `Mostrando ${sortedInventory.length} de ${userInventory.length}`;
    }

    if (sortedInventory.length === 0) {
        container.innerHTML = '<p style="color: #94a3b8; grid-column: 1/-1; text-align: center; padding: 20px;">Ningún Pokémon coincide con tu búsqueda.</p>';
        return;
    }

    sortedInventory.forEach(pkmn => {
        const rawRarity = pkmn.rarity || 'comun';
        const cleanRarityClass = rawRarity.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        pkmn.stars = pkmn.stars || 0;
        const totalCopies = pkmn.count || pkmn.dupes || 1;
        const starsDisplay = '★'.repeat(pkmn.stars);
        const isInTeam = currentTeam.some(item => Number(item.id) === Number(pkmn.id));

        const card = document.createElement('div');
        card.className = `pokemon-card card-pokemon ${cleanRarityClass} ${isInTeam ? 'in-active-team' : ''}`;
        card.style.cssText = 'cursor: pointer; position: relative;';
        
        if (isInTeam) {
            card.style.border = '2px solid #2ed573';
            card.style.boxShadow = '0 0 10px rgba(46, 213, 115, 0.4)';
        }

        const countBadge = totalCopies > 1 ? `<span class="card-count-badge">x${totalCopies}</span>` : '';
        const teamBadge = isInTeam ? `<span style="position: absolute; top: 5px; right: 5px; background: #2ed573; color: #000; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px;">EN EQUIPO</span>` : '';

        const cardLevel = Number(pkmn.level) || 1;
        const cardXp = Number(pkmn.xp) || 0;
        const cardXpPct = Math.min(100, Math.max(0, Math.floor((cardXp / (cardLevel * 100)) * 100)));
        const treeBadge = (typeof getPendingPerkCount === 'function' && getPendingPerkCount(pkmn) > 0)
            ? '<div title="Nodo del árbol de habilidades disponible" style="position: absolute; bottom: 5px; left: 5px; font-size: 13px;">🌳</div>' : '';

        card.innerHTML = `
            ${countBadge}
            ${teamBadge}
            ${treeBadge}
            ${pkmn.stars > 0 ? `<div class="card-stars-badge" style="position: absolute; top: 5px; left: 5px; color: #f1c40f; font-size: 11px; text-shadow: 0 1px 2px #000;">${starsDisplay}</div>` : ''}
            <div class="card-id">#${String(pkmn.id).padStart(4, '0')}</div>
            <img src="${pkmn.sprite}" alt="${pkmn.name}">
            <div class="card-name">${pkmn.name}</div>
            <div class="card-rarity">${rawRarity.toUpperCase()}</div>
            <div style="font-size: 11px; color: #aaa; margin-top: 2px;">Nv. ${cardLevel}</div>
            <div style="background: #0f172a; border-radius: 4px; height: 6px; width: 90%; margin: 3px auto 0 auto; overflow: hidden; border: 1px solid #334155;">
                <div style="width: ${cardXpPct}%; background: #38bdf8; height: 100%;"></div>
            </div>
            <div style="display: flex; gap: 5px; margin-top: 5px;">
                <button onclick="event.stopPropagation(); togglePokemonInTeam(${JSON.stringify(pkmn).replace(/"/g, '&quot;')})" style="flex: 1; background: ${isInTeam ? '#eb4d4b' : '#2ed573'}; color: white; border: none; padding: 4px; font-size: 10px; font-weight: bold; border-radius: 4px; cursor: pointer;">
                    ${isInTeam ? 'Quitar' : 'Añadir'}
                </button>
            </div>
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
    
    let abilityName = pkmn.ability || 'Ninguna';
    if (typeof getAbilityDisplayName === 'function') {
        abilityName = getAbilityDisplayName(pkmn.ability);
    }

    const nextCost = getDupeCostForNextStar(pkmn.stars);
    const canAwaken = pkmn.stars < 7 && totalCopies > nextCost;
    const starsDisplay = '★'.repeat(pkmn.stars) + '☆'.repeat(7 - pkmn.stars);

    const mult = getStatMultiplierForStars(pkmn.stars);
    const base = pkmn.baseStats || { hp: 45, attack: 49, defense: 49, spAtk: 65, spDef: 65, speed: 45 };
    const level = Number(pkmn.level) || 1;

    // Mejoras del árbol de habilidades
    const perkInfo = typeof getPerkBonuses === 'function' ? getPerkBonuses(pkmn) : null;
    const pm = perkInfo ? perkInfo.mult : { hp: 1, attack: 1, defense: 1, speed: 1 };
    const pendingPerks = typeof getPendingPerkCount === 'function' ? getPendingPerkCount(pkmn) : 0;
    const itemSlots = perkInfo ? perkInfo.itemSlots : 0;
    
    const calcHp = Math.floor((Math.floor(((2 * base.hp) * level) / 100) + level + 10) * mult * pm.hp);
    const calcAtk = Math.floor((Math.floor(((2 * base.attack) * level) / 100) + 5) * mult * pm.attack);
    const calcDef = Math.floor((Math.floor(((2 * base.defense) * level) / 100) + 5) * mult * pm.defense);
    const calcSpd = Math.floor((Math.floor(((2 * base.speed) * level) / 100) + 5) * mult * pm.speed);

    const currentXp = Number(pkmn.xp) || 0;
    const xpNeeded = level * 100;
    const xpPercent = Math.min(100, Math.max(0, Math.floor((currentXp / xpNeeded) * 100)));

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

                <div style="margin-top: 10px; background: rgba(0,0,0,0.3); padding: 8px; border-radius: 6px;">
                    <div style="display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8; margin-bottom: 4px;">
                        <span>Experiencia (XP)</span>
                        <span><strong>${currentXp}</strong> / ${xpNeeded} (${xpPercent}%)</span>
                    </div>
                    <div style="background: #0f172a; border-radius: 4px; height: 8px; width: 100%; overflow: hidden; border: 1px solid #334155;">
                        <div style="width: ${xpPercent}%; background: linear-gradient(90deg, #38bdf8, #0284c7); height: 100%; transition: width 0.3s ease;"></div>
                    </div>
                </div>

                <div class="modal-ability-info" style="margin-top: 8px;">
                    <p>✨ <strong>Habilidad:</strong> ${abilityName}</p>
                </div>
            </div>
        </div>

        ${typeof openSkillTree === 'function' ? `
        <button id="st-open-btn" onclick="openSkillTree(${pkmn.id})" style="width: 100%; margin-bottom: 12px; background: linear-gradient(135deg, #0ea5e9, #6366f1); color: white; border: none; padding: 10px 20px; font-size: 14px; font-weight: bold; border-radius: 8px; cursor: pointer;">
            🌳 Árbol de Habilidades ${pendingPerks > 0 ? `<span style="background: #fbbf24; color: #0f172a; border-radius: 10px; padding: 1px 8px; margin-left: 6px;">${pendingPerks} nuevo(s)</span>` : ''}
            <span style="font-weight: normal; font-size: 12px; opacity: .85;"> · 🎒 ${itemSlots} ranura(s)</span>
        </button>` : ''}

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
        renderActiveTeamSlots();
    }
}

// Inicializar vistas e interfaz al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    updateCurrenciesUI();
    renderInventory();
    renderActiveTeamSlots();
});

window.addEventListener('storage', () => {
    updateCurrenciesUI();
    renderInventory();
    renderActiveTeamSlots();
});