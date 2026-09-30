// gacha.js - Sistema de Banners por Generación sin huecos vacíos

let currentGen = 1;

// Rangos de IDs de Pokédex por Generación
const GEN_RANGES = {
    1: { min: 1, max: 151 },
    2: { min: 152, max: 251 },
    3: { min: 252, max: 386 },
    4: { min: 387, max: 493 },
    5: { min: 494, max: 649 },
    6: { min: 650, max: 721 },
    7: { min: 722, max: 809 },
    8: { min: 810, max: 905 },
    9: { min: 906, max: 1025 }
};

// Cambiar el banner activo
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

// Determinar rareza según probabilidades %
function rollRarity() {
    const rand = Math.random() * 100;
    
    if (rand < 2) return "secreto";       // 2% Mega / Secreto
    if (rand < 7) return "legendario";    // 5% Legendario
    if (rand < 22) return "epico";        // 15% Épico
    if (rand < 52) return "raro";         // 30% Raro
    return "comun";                       // 48% Común
}

// Obtener un Pokémon garantizado sin huecos nulos
function getRandomPokemonFromGen(rarity) {
    if (typeof DATABASE === 'undefined') return null;

    const range = GEN_RANGES[currentGen] || GEN_RANGES[1];
    let pool = DATABASE[rarity] || [];

    // Filtrar Pokémon por generación
    let filtered = pool.filter(pkmn => {
        if (!pkmn) return false;
        if (rarity === 'secreto') {
            // Las Megas tienen ID >= 1026
            return pkmn.id >= 1026;
        }
        return pkmn.id >= range.min && pkmn.id <= range.max;
    });

    // Control de seguridad: Si la piscina está vacía (ej. una gen sin Megas)
    if (filtered.length === 0) {
        // Busca en Legendarios o Épicos de esa misma generación
        const fallbackPool = (DATABASE.legendario.concat(DATABASE.epico)).filter(
            pkmn => pkmn && pkmn.id >= range.min && pkmn.id <= range.max
        );
        filtered = fallbackPool.length > 0 ? fallbackPool : DATABASE.comun;
    }

    // Seleccionar aleatorio del grupo filtrado
    const randomIndex = Math.floor(Math.random() * filtered.length);
    const selected = filtered[randomIndex];

    // Asegurar sprite de respaldo si no existe
    if (selected && !selected.sprite) {
        selected.sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${selected.id}.png`;
    }

    return selected;
}

// Ejecutar tirada individual
function executeSinglePull() {
    let rarity = rollRarity();
    let result = getRandomPokemonFromGen(rarity);

    // Si por algún motivo diera nulo, forzamos un Común de la gen activa
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