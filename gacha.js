// gacha.js - Sistema de Banners por Generación (1 a 9) Corregido

// Generación activa por defecto (Gen 1)
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

// Cambiar el banner activo
function selectBanner(genNumber) {
    currentGen = genNumber;
    
    // Actualizar botones en la UI
    document.querySelectorAll('.banner-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`btn-gen-${genNumber}`);
    if (activeBtn) activeBtn.classList.add('active');

    // Actualizar título del banner
    const bannerTitle = document.getElementById('banner-title');
    if (bannerTitle) {
        bannerTitle.innerText = `BANNER GENERACIÓN ${genNumber}`;
    }
}

// Obtener un Pokémon aleatorio sin huecos nulos
function getRandomPokemonFromGen(rarity) {
    if (typeof DATABASE === 'undefined') return null;

    const range = GEN_RANGES[currentGen] || GEN_RANGES[1];
    let pool = DATABASE[rarity] || [];

    // Filtrar Pokémon por la generación activa
    let filtered = pool.filter(pkmn => {
        if (!pkmn) return false;
        if (rarity === 'secreto') {
            // Comparación no sensible a mayúsculas/minúsculas para no fallar
            return range.megas.some(m => m.toLowerCase().trim() === pkmn.name.toLowerCase().trim());
        }
        return pkmn.id >= range.min && pkmn.id <= range.max;
    });

    // FALLBACK SEGURO: Si no hay Megas en esta Gen (Gens 7, 8, 9) o la categoría está vacía
    if (filtered.length === 0) {
        if (rarity === 'secreto') {
            // Si sale Secreto en Gen sin megas, damos un Legendario de esa Gen
            filtered = (DATABASE.legendario || []).filter(pkmn => pkmn && pkmn.id >= range.min && pkmn.id <= range.max);
        }
        // Si aun así está vacío, caemos a Épico o Raro de esa misma Gen
        if (filtered.length === 0) {
            filtered = (DATABASE.epico || []).filter(pkmn => pkmn && pkmn.id >= range.min && pkmn.id <= range.max);
        }
        // Último recurso: un Común de la Gen activa
        if (filtered.length === 0) {
            filtered = (DATABASE.comun || []).filter(pkmn => pkmn && pkmn.id >= range.min && pkmn.id <= range.max);
        }
    }

    // Elegir aleatorio
    const randomIndex = Math.floor(Math.random() * filtered.length);
    return filtered[randomIndex] || null;
}

// Determinar la rareza de la tirada según %
function rollRarity() {
    const rand = Math.random() * 100;
    
    if (rand < 2) return "secreto";       // 2% Mega / Secreto
    if (rand < 7) return "legendario";    // 5% Legendario
    if (rand < 22) return "epico";        // 15% Épico
    if (rand < 52) return "raro";         // 30% Raro
    return "comun";                       // 48% Común
}

// Ejecutar tirada individual asegurando resultado válido
function executeSinglePull() {
    let rarity = rollRarity();
    let result = getRandomPokemonFromGen(rarity);

    // Si por alguna razón diera null, aseguramos un Pokémon de la generación
    if (!result) {
        result = getRandomPokemonFromGen("comun");
    }

    return result;
}

// Ejecutar tirada múltiple (x10)
function executeMultiPull() {
    const pulls = [];
    for (let i = 0; i < 10; i++) {
        const pkmn = executeSinglePull();
        if (pkmn) pulls.push(pkmn);
    }
    return pulls;
}