// gacha.js - Sistema de Banners por Generación Garantizado

let currentGen = 1;

// Rangos de IDs por Generación
const GEN_RANGES = {
    1: { min: 1, max: 151, megas: ["Mega Venusaur", "Mega Charizard X", "Mega Charizard Y", "Mega Blastoise", "Mega Alakazam", "Mega Gengar", "Mega Kangaskhan", "Mega Pinsir", "Mega Gyarados", "Mega Aerodactyl", "Mega Mewtwo X", "Mega Mewtwo Y", "Mega Beedrill", "Mega Pidgeot", "Mega Slowbro"] },
    2: { min: 152, max: 251, megas: ["Mega Ampharos", "Mega Scizor", "Mega Heracross", "Mega Houndoom", "Mega Tyranitar"] },
    3: { min: 252, max: 386, megas: ["Mega Blaziken", "Mega Gardevoir", "Mega Mawile", "Mega Aggron", "Mega Medicham", "Mega Manectric", "Mega Banette", "Mega Absol", "Mega Sceptile", "Mega Swampert", "Mega Sableye", "Mega Sharpedo", "Mega Camerupt", "Mega Altaria", "Mega Glalie", "Mega Salamence", "Mega Metagross", "Mega Latias", "Mega Latios", "Groudon Primigenio", "Kyogre Primigenio", "Mega Rayquaza"] },
    4: { min: 387, max: 493, megas: ["Mega Garchomp", "Mega Lucario", "Mega Abomasnow", "Mega Lopunny"] },
    5: { min: 494, max: 649, megas: ["Mega Audino"] },
    6: { min: 650, max: 721, megas: ["Mega Diancie"] },
    7: { min: 722, max: 809, megas: [] },
    8: { min: 810, max: 905, megas: [] },
    9: { min: 906, max: 1025, megas: [] }
};

// Cambiar banner activo
function selectBanner(genNumber) {
    currentGen = genNumber;
    
    document.querySelectorAll('.banner-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`btn-gen-${genNumber}`);
    if (activeBtn) activeBtn.classList.add('active');

    const bannerTitle = document.getElementById('banner-title');
    if (bannerTitle) {
        bannerTitle.innerText = `BANNER GENERACIÓN ${genNumber}`;
    }
}

// Determinar rareza (%)
function rollRarity() {
    const rand = Math.random() * 100;
    
    if (rand < 1) return "secreto";       // 1% Mega / Secreto
    if (rand < 5) return "legendario";    // 4% Legendario
    if (rand < 20) return "epico";        // 15% Épico
    if (rand < 50) return "raro";         // 30% Raro
    return "comun";                       // 50% Común
}

// Obtener un Pokémon con garantías
function getRandomPokemonFromGen(rarity) {
    if (typeof DATABASE === 'undefined') return null;

    const range = GEN_RANGES[currentGen] || GEN_RANGES[1];
    let pool = DATABASE[rarity] || [];

    // Filtrar Pokémon pertenecientes a la gen activa
    let filtered = pool.filter(pkmn => {
        if (!pkmn) return false;
        if (rarity === 'secreto') {
            return range.megas.some(m => m.toLowerCase().trim() === pkmn.name.toLowerCase().trim());
        }
        return pkmn.id >= range.min && pkmn.id <= range.max;
    });

    // FALLBACKS DE SEGURIDAD (Para no dejar ningún hueco nulo nunca)
    if (filtered.length === 0) {
        if (rarity === 'secreto') {
            filtered = DATABASE.secreto || [];
        }
        if (filtered.length === 0) {
            filtered = (DATABASE.legendario || []).filter(pkmn => pkmn && pkmn.id >= range.min && pkmn.id <= range.max);
        }
        if (filtered.length === 0) {
            filtered = (DATABASE.comun || []).filter(pkmn => pkmn && pkmn.id >= range.min && pkmn.id <= range.max);
        }
        if (filtered.length === 0) {
            filtered = DATABASE.comun || [];
        }
    }

    const randomIndex = Math.floor(Math.random() * filtered.length);
    return filtered[randomIndex] || null;
}

// Tirada individual con reintento forzado
function executeSinglePull() {
    let rarity = rollRarity();
    let result = getRandomPokemonFromGen(rarity);

    if (!result && DATABASE.comun && DATABASE.comun.length > 0) {
        result = DATABASE.comun[Math.floor(Math.random() * DATABASE.comun.length)];
    }

    return result;
}

// Tirada x10 garantizando exactamente 10 elementos siempre
function executeMultiPull() {
    const pulls = [];
    while (pulls.length < 10) {
        const pkmn = executeSinglePull();
        if (pkmn) {
            pulls.push(pkmn);
        }
    }
    return pulls;
}

// --- FUNCIÓN DE REALIZAR TIRADA Y GUARDAR EN EL INVENTARIO/EQUIPO ---
function pullGacha(amount) {
    const resultsContainer = document.getElementById('gacha-results');
    if (!resultsContainer) return;

    // 1. Obtener el saldo de monedas/tickets
    const currencies = getCurrencies();

    // 2. Verificar si tiene suficientes tickets
    if (currencies.tickets < amount) {
        alert(`¡No tienes suficientes tickets! Necesitas ${amount} ticket(s) y tienes ${currencies.tickets}.`);
        return;
    }

    // 3. Descontar tickets y guardar los cambios
    currencies.tickets -= amount;
    saveCurrencies(currencies);

    // 4. Limpiar los resultados anteriores
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

    // 5. Guardar cada Pokémon en el Inventario y Pokédex
    pulls.forEach(pkmn => {
        if (pkmn) {
            addPokemonToInventory(pkmn);
        }
    });

    // 6. Pintar cartas en pantalla con animación
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