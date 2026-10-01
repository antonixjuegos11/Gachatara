// Estado global del inventario cargado de localStorage
const USER_INVENTORY = JSON.parse(localStorage.getItem('gachatara_inventory')) || [];

/**
 * Guarda y actualiza la lista de personajes
 */
function saveInventory() {
    localStorage.setItem('gachatara_inventory', JSON.stringify(USER_INVENTORY));
}

/**
 * Añade un Pokémon al inventario (se usa al hacer tiradas)
 */
function addPokemonToInventory(pokemon) {
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
        const totalUnicos = USER_INVENTORY.length;
        totalCounter.textContent = totalUnicos;
    }

    if (USER_INVENTORY.length === 0) {
        inventoryGrid.innerHTML = `
            <div class="empty-inventory">
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
 * Cambiar entre pestañas
 */
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    const targetSec = document.getElementById(`sec-${tabName}`);
    if (targetSec) targetSec.classList.add('active');

    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    // Si entra en la pestaña de equipo, re-renderizar
    if (tabName === 'equipo') {
        renderInventory();
    }
}

// Cargar inventario en el inicio
document.addEventListener('DOMContentLoaded', renderInventory);