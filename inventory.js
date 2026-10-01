// Estado global del inventario cargado de localStorage
const USER_INVENTORY = JSON.parse(localStorage.getItem('gachatara_inventory')) || [];
const UNLOCKED_IDS = new Set(JSON.parse(localStorage.getItem('gachatara_unlocked_ids')) || []);

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
    const existing = USER_INVENTORY.find(item => item.id === pokemon.id);
    
    if (existing) {
        existing.count = (existing.count || 1) + 1;
    } else {
        USER_INVENTORY.push({
            id: pokemon.id,
            name: pokemon.name,
            rarity: pokemon.rarity,
            sprite: pokemon.sprite,
            stage: pokemon.stage,
            count: 1
        });
    }

    saveInventory();
    renderInventory();
    
    // Si la función de actualizar la Pokédex existe, la ejecutamos
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
    
    // Actualiza contador total de Pokémon distintos
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

    // Ordenar por ID para mantener orden de Pokédex
    USER_INVENTORY.sort((a, b) => a.id - b.id);

    USER_INVENTORY.forEach(item => {
        const card = document.createElement('div');
        card.className = `pokemon-card rarity-${item.rarity}`;
        card.innerHTML = `
            <div class="dup-badge">x${item.count}</div>
            <div class="card-id">#${String(item.id).padStart(4, '0')}</div>
            <img src="${item.sprite}" alt="${item.name}" loading="lazy">
            <div class="card-name">${item.name}</div>
        `;
        inventoryGrid.appendChild(card);
    });
}

/**
 * Cambiar entre pestañas (Lobby, Equipo, Invocación, Dex)
 */
function switchTab(tabName) {
    // 1. Ocultar todos los contenidos de pestaña
    document.querySelectorAll('.tab-content').forEach(sec => {
        sec.classList.remove('active');
    });

    // 2. Desmarcar todos los botones de la navegación superior
    document.querySelectorAll('.nav-tab').forEach(btn => {
        btn.classList.remove('active');
    });

    // 3. Mostrar la sección seleccionada (ej: tab-equipo, tab-lobby, tab-invocacion, tab-dex)
    const targetSec = document.getElementById(`tab-${tabName}`);
    if (targetSec) {
        targetSec.classList.add('active');
    }

    // 4. Marcar botón activo correspondiente en el menú
    const activeBtn = Array.from(document.querySelectorAll('.nav-tab')).find(btn => 
        btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(`'${tabName}'`)
    );
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    // 5. Acciones específicas al entrar en la pestaña
    if (tabName === 'equipo') {
        renderInventory();
    } else if (tabName === 'dex' && typeof renderDex === 'function') {
        renderDex();
    }
}

// Cargar inventario al iniciar la página
document.addEventListener('DOMContentLoaded', renderInventory);