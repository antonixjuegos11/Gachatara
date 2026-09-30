// gacha.js - Sistema de Banners por Generación (1 a 9)

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
    
    // Actualizar botones de selector de banner en la UI si existen
    document.querySelectorAll('.banner-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`btn-gen-${genNumber}`);
    if (activeBtn) activeBtn.classList.add('active');

    // Actualizar título del banner
    const bannerTitle = document.getElementById('banner-title');
    if (bannerTitle) {
        bannerTitle.innerText = `BANNER GENERACIÓN ${genNumber}`;
    }
}

// Obtener un Pokémon aleatorio filtrado por la Generación activa
function getRandomPokemonFromGen(rarity) {
    const pool = DATABASE[rarity] || [];
    const range = GEN_RANGES[currentGen];

    if (!range) return null;

    // Filtrar los Pokémon de esa rareza que pertenecen a la generación activa
    let filtered = pool.filter(pkmn => {
        if (rarity === 'secreto') {
            // Si es secreto (Mega), comprobamos si la mega pertenece a esta Gen
            return range.megas.includes(pkmn.name);
        }
        return pkmn.id >= range.min && pkmn.id <= range.max;
    });

    // Fallback por si una categoría se queda vacía en esa Gen
    if (filtered.length === 0) {
        filtered = pool;
    }

    const randomIndex = Math.floor(Math.random() * filtered.length);
    return filtered[randomIndex];
}

// Determinar la rareza de la tirada según probabilidades %
function rollRarity() {
    const rand = Math.random() * 100;
    
    if (rand < 1) return "secreto";       // 1% Mega / Secreto
    if (rand < 5) return "legendario";    // 4% Legendario
    if (rand < 20) return "epico";        // 15% Épico
    if (rand < 50) return "raro";         // 30% Raro
    return "comun";                       // 50% Común
}

// Ejecutar tirada individual
function executeSinglePull() {
    const rarity = rollRarity();
    return getRandomPokemonFromGen(rarity);
}

// Ejecutar tirada múltiple (x10)
function executeMultiPull() {
    const pulls = [];
    for (let i = 0; i < 10; i++) {
        pulls.push(executeSinglePull());
    }
    return pulls;
}