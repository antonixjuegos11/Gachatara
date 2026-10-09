// Estado global del inventario cargado de localStorage
const USER_INVENTORY = JSON.parse(localStorage.getItem('gachatara_inventory')) || [];
const UNLOCKED_IDS = new Set(JSON.parse(localStorage.getItem('gachatara_unlocked_ids')) || []);

// Variable global para rastrear qué índice del inventario se está inspeccionando en el modal
let currentInspectedIndex = null;

// Configuración del sistema de estrellas (7 niveles)
const DUPE_COSTS_PER_STAR = [1, 2, 3, 5, 8, 12, 18]; 

function getDupeCostForNextStar(currentStars) {
    if (currentStars >= 7) return null;
    return DUPE_COSTS_PER_STAR[currentStars] || 18;
}

function getStatMultiplierForStars(stars) {
    // Cada estrella otorga un +10% acumulativo a las estadísticas base
    return 1 + ((stars || 0) * 0.10);
}

/**
 * Guarda y actualiza la lista de personajes e IDs desbloqueados
 */
function saveInventory() {
    localStorage.setItem('gachatara_inventory', JSON.stringify(USER_INVENTORY));
    localStorage.setItem('gachatara_unlocked_ids', JSON.stringify(Array.from(UNLOCKED_IDS)));
}

/**
 * Añade un Pokémon al inventario y a la Dex (se usa al hacer tiradas)
 */
function addPokemonToInventory(pokemon) {
    if (!pokemon || !pokemon.id) return;

    // Guardar ID en los desbloqueados de la Pokédex
    UNLOCKED_IDS.add(pokemon.id);

    // Guardar en el inventario de Equipo
    const existing = USER_INVENTORY.find(item => Number(item.id) === Number(pokemon.id));
    
    if (existing) {
        // Se incrementa el contador de copias (duplicados)
        existing.count = (existing.count || 1) + 1;
    } else {
        USER_INVENTORY.push({
            id: pokemon.id,
            name: pokemon.name,
            rarity: pokemon.rarity,
            sprite: pokemon.sprite,
            stage: pokemon.stage,
            types: pokemon.types || [pokemon.type || 'Normal'],
            baseStats: pokemon.baseStats || { hp: 45, attack: 49, defense: 49, spAtk: 65, spDef: 65, speed: 45 },
            ability: pokemon.ability || 'none',
            level: Number(pokemon.level) || 1,
            xp: Number(pokemon.xp) || 0,
            stars: 0, // Nivel de estrella inicial
            count: 1  // Copias disponibles para gastar en despertar
        });
    }

    saveInventory();
    renderInventory();
    
    if (typeof updateDexProgress === 'function') {
        updateDexProgress();
    }
}

/**
 * Renderiza todas las cartas del jugador en la pestaña Equipo
 */
function renderInventory() {
    const inventoryGrid = document.getElementById('inventory-grid');
    const totalCounter = document.getElementById('total-capturados');
    
    if (!inventoryGrid) return;

    inventoryGrid.innerHTML = '';
    
    if (totalCounter) {
        totalCounter.textContent = USER_INVENTORY.length;
    }

    if (USER_INVENTORY.length === 0) {
        inventoryGrid.innerHTML = `
            <div class="empty-inventory" style="grid-column: 1 / -1; text-align: center; padding: 50px 20px; color: #888;">
                <p>Aún no tienes ningún Pokémon en tu equipo.</p>
                <p>¡Ve a la pestaña de <strong>Invocación</strong> para conseguir el primero!</p>
            </div>
        `;
        return;
    }

    USER_INVENTORY.sort((a, b) => a.id - b.id);

    USER_INVENTORY.forEach((item, index) => {
        item.stars = item.stars || 0;
        item.level = Number(item.level) || 1;
        item.xp = Number(item.xp) || 0;
        const starsDisplay = '★'.repeat(item.stars);

        // Cálculos de XP seguros para la tarjeta pequeña
        const xpNeeded = item.level * 100;
        const xpPercent = Math.min(100, Math.max(0, Math.floor((item.xp / xpNeeded) * 100)));

        const card = document.createElement('div');
        card.className = `pokemon-card rarity-${item.rarity}`;
        card.style.cursor = 'pointer';
        card.innerHTML = `
            <div class="dup-badge">x${item.count}</div>
            <div class="card-stars-badge" style="position: absolute; top: 5px; left: 5px; color: #f1c40f; font-size: 11px;">${starsDisplay}</div>
            <div class="card-id">#${String(item.id).padStart(4, '0')}</div>
            <img src="${item.sprite}" alt="${item.name}" loading="lazy">
            <div class="card-name">${item.name}</div>
            <div style="font-size: 11px; color: #aaa; margin-top: 2px;">Nv. ${item.level}</div>
            
            <!-- Barra de XP en miniatura -->
            <div style="background: #0f172a; border-radius: 4px; height: 6px; width: 90%; margin: 4px auto 0 auto; overflow: hidden; border: 1px solid #334155;">
                <div style="width: ${xpPercent}%; background: #38bdf8; height: 100%; transition: width 0.3s ease;"></div>
            </div>
        `;
        
        card.onclick = () => openPokemonModal(index);
        inventoryGrid.appendChild(card);
    });
}

// =========================================
// MODAL DE INFORMACIÓN Y DESPERTAR ESTRELLAS
// =========================================

function openPokemonModal(index) {
    currentInspectedIndex = index;
    const pkmn = USER_INVENTORY[index];
    if (!pkmn) return;

    pkmn.stars = pkmn.stars || 0;
    pkmn.count = pkmn.count || 1;
    pkmn.level = Number(pkmn.level) || 1;
    pkmn.xp = Number(pkmn.xp) || 0;

    // Asegurarnos de inyectar el HTML del modal si no existe en el DOM
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
    const abilityName = typeof getAbilityDisplayName === 'function' ? getAbilityDisplayName(pkmn.ability) : (pkmn.ability || 'Ninguna');

    const nextCost = getDupeCostForNextStar(pkmn.stars);
    const canAwaken = pkmn.stars < 7 && pkmn.count > nextCost;
    const starsDisplay = '★'.repeat(pkmn.stars) + '☆'.repeat(7 - pkmn.stars);

    // Calcular stats reales afectados por el multiplicador de estrellas
    const mult = getStatMultiplierForStars(pkmn.stars);
    const base = pkmn.baseStats || { hp: 45, attack: 49, defense: 49, speed: 45 };
    const level = pkmn.level;
    
    const calcHp = Math.floor((Math.floor(((2 * base.hp) * level) / 100) + level + 10) * mult);
    const calcAtk = Math.floor((Math.floor(((2 * base.attack) * level) / 100) + 5) * mult);
    const calcDef = Math.floor((Math.floor(((2 * base.defense) * level) / 100) + 5) * mult);
    const calcSpd = Math.floor((Math.floor(((2 * base.speed) * level) / 100) + 5) * mult);

    // Cálculos de XP seguros para el modal
    const currentXp = pkmn.xp;
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
                <span class="modal-type-badge" style="display: block; margin-top: 8px; font-weight: bold; font-size: 12px;">${typeLabel}</span>
            </div>

            <div class="modal-stats-box" style="flex: 1.2; font-size: 14px; line-height: 1.6;">
                <h3 style="margin: 0 0 10px 0; font-size: 15px; color: #7bed9f; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px;">Estadísticas (Nv. ${level})</h3>
                <p>❤️ HP: <strong>${calcHp}</strong></p>
                <p>⚔️ Ataque: <strong>${calcAtk}</strong></p>
                <p>🛡️ Defensa: <strong>${calcDef}</strong></p>
                <p>⚡ Velocidad: <strong>${calcSpd}</strong></p>

                <!-- Barra de XP detallada en el modal -->
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

        <div class="modal-awakening-section" style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 10px; text-align: center;">
            <div class="dupes-counter" style="margin-bottom: 10px; font-size: 14px; color: #dfe4ea;">
                📦 Copias totales: <strong>${pkmn.count}</strong> (Necesitas ${nextCost + 1} para subir estrella)
            </div>
            ${pkmn.stars < 7 ? `
                <button class="btn-awaken ${canAwaken ? 'active' : 'disabled'}" onclick="awakenPokemon(${index})" ${!canAwaken ? 'disabled' : ''} style="background: ${canAwaken ? '#2ed573' : '#718093'}; color: white; border: none; padding: 10px 20px; font-size: 14px; font-weight: bold; border-radius: 8px; cursor: ${canAwaken ? 'pointer' : 'not-allowed'}; width: 100%;">
                    🌟 Despertar Estrella (-${nextCost} copias)
                </button>
            ` : `
                <div class="max-rank-text" style="color: #f1c40f; font-weight: bold;">🎉 ¡Este Pokémon ha alcanzado el Poder Máximo (7 Estrellas)!</div>
            `}
        </div>
    `;

    modal.style.display = 'flex';
}

function closePokemonModal() {
    const modal = document.getElementById('pokemon-modal');
    if (modal) modal.style.display = 'none';
    currentInspectedIndex = null;
}

function awakenPokemon(index) {
    const pkmn = USER_INVENTORY[index];
    if (!pkmn) return;

    const nextCost = getDupeCostForNextStar(pkmn.stars);
    if (pkmn.stars < 7 && pkmn.count > nextCost) {
        pkmn.count -= nextCost;
        pkmn.stars += 1;        
        saveInventory();
        openPokemonModal(index);
        renderInventory();
    }
}

/**
 * Cambiar entre pestañas (Lobby, Equipo, Invocación, Dex)
 */
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(sec => {
        sec.classList.remove('active');
    });

    document.querySelectorAll('.nav-tab').forEach(btn => {
        btn.classList.remove('active');
    });

    const targetSec = document.getElementById(`tab-${tabName}`);
    if (targetSec) {
        targetSec.classList.add('active');
    }

    const activeBtn = Array.from(document.querySelectorAll('.nav-tab')).find(btn => 
        btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(`'${tabName}'`)
    );
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    if (tabName === 'equipo') {
        renderInventory();
    } else if (tabName === 'dex' && typeof renderDex === 'function') {
        renderDex();
    }
}

// Cargar inventario al iniciar la página
document.addEventListener('DOMContentLoaded', renderInventory);

// Escuchador global de clics en el inventario para asegurar que el modal siempre se abra
document.addEventListener('click', function(event) {
    const card = event.target.closest('.pokemon-card');
    if (!card) return;

    const inventoryGrid = document.getElementById('inventory-grid');
    if (!inventoryGrid || !inventoryGrid.contains(card)) return;

    const cards = Array.from(inventoryGrid.querySelectorAll('.pokemon-card'));
    const index = cards.indexOf(card);

    if (index !== -1 && typeof openPokemonModal === 'function') {
        openPokemonModal(index);
    }
});