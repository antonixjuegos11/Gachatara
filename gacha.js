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
    
    if (rand < 1) return "secreto";       // 3% Mega / Secreto
    if (rand < 5) return "legendario";    // 5% Legendario
    if (rand < 20) return "epico";        // 17% Épico
    if (rand < 50) return "raro";         // 30% Raro
    return "comun";                       // 45% Común
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
            // Si la Gen activa no tiene Megas (o aun están cargando), busca una Mega global
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

    // Si diera nulo por retardo de red, intenta forzar con común de DATABASE
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
