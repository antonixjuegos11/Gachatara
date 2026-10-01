// db.js - Carga dinámica de las 9 Generaciones, Ultraentes Legendarios y Unietapas Raros

const DATABASE = {
    comun: [],
    raro: [],
    epico: [],
    legendario: [],
    secreto: []
};

// Nombres legibles en español/formato correcto para la Dex
const MEGA_NAMES = {
    "venusaur-mega": "Mega Venusaur",
    "charizard-mega-x": "Mega Charizard X",
    "charizard-mega-y": "Mega Charizard Y",
    "blastoise-mega": "Mega Blastoise",
    "beedrill-mega": "Mega Beedrill",
    "pidgeot-mega": "Mega Pidgeot",
    "alakazam-mega": "Mega Alakazam",
    "slowbro-mega": "Mega Slowbro",
    "gengar-mega": "Mega Gengar",
    "kangaskhan-mega": "Mega Kangaskhan",
    "pinsir-mega": "Mega Pinsir",
    "gyarados-mega": "Mega Gyarados",
    "aerodactyl-mega": "Mega Aerodactyl",
    "mewtwo-mega-x": "Mega Mewtwo X",
    "mewtwo-mega-y": "Mega Mewtwo Y",
    "ampharos-mega": "Mega Ampharos",
    "steelix-mega": "Mega Steelix",
    "scizor-mega": "Mega Scizor",
    "heracross-mega": "Mega Heracross",
    "houndoom-mega": "Mega Houndoom",
    "tyranitar-mega": "Mega Tyranitar",
    "sceptile-mega": "Mega Sceptile",
    "blaziken-mega": "Mega Blaziken",
    "swampert-mega": "Mega Swampert",
    "gardevoir-mega": "Mega Gardevoir",
    "sableye-mega": "Mega Sableye",
    "mawile-mega": "Mega Mawile",
    "aggron-mega": "Mega Aggron",
    "medicham-mega": "Mega Medicham",
    "manectric-mega": "Mega Manectric",
    "sharpedo-mega": "Mega Sharpedo",
    "camerupt-mega": "Mega Camerupt",
    "altaria-mega": "Mega Altaria",
    "banette-mega": "Mega Banette",
    "absol-mega": "Mega Absol",
    "glalie-mega": "Mega Glalie",
    "salamence-mega": "Mega Salamence",
    "metagross-mega": "Mega Metagross",
    "latias-mega": "Mega Latias",
    "latios-mega": "Mega Latios",
    "kyogre-primal": "Kyogre Primigenio",
    "groudon-primal": "Groudon Primigenio",
    "rayquaza-mega": "Mega Rayquaza",
    "lopunny-mega": "Mega Lopunny",
    "garchomp-mega": "Mega Garchomp",
    "lucario-mega": "Mega Lucario",
    "abomasnow-mega": "Mega Abomasnow",
    "gallade-mega": "Mega Gallade",
    "audino-mega": "Mega Audino",
    "diancie-mega": "Mega Diancie"
};

/**
 * Formatea el nombre eliminando guiones y capitalizando palabras
 */
function formatPokemonName(name) {
    if (!name) return "Desconocido";
    return name
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Carga automática de Megas consultando directamente a la PokéAPI
async function initSecretMegas() {
    DATABASE.secreto = [];
    let nextDexId = 1026;

    for (const [apiKey, displayName] of Object.entries(MEGA_NAMES)) {
        try {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${apiKey}`);
            if (!res.ok) continue;
            const data = await res.json();

            DATABASE.secreto.push({
                id: nextDexId,
                name: displayName,
                stage: 4,
                rarity: "secreto",
                sprite: data.sprites.front_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.id}.png`
            });
            nextDexId++;
        } catch (e) {
            console.error(`Error cargando mega ${apiKey}:`, e);
        }
    }
}

// Carga automática de Pokémon base y Ultraentes con ejecución optimizada en lotes
async function loadFullDatabase() {
    try {
        console.log("Iniciando carga de la base de datos...");

        DATABASE.comun = [];
        DATABASE.raro = [];
        DATABASE.epico = [];
        DATABASE.legendario = [];

        // 1. Cargar Megas primero
        await initSecretMegas();

        // 2. Obtener lista base de los 1025 Pokémon
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
        const data = await response.json();

        const evoChainCache = new Map();
        const results = [];
        const BATCH_SIZE = 25; // Procesa en bloques de 25 para optimizar el rendimiento

        for (let i = 0; i < data.results.length; i += BATCH_SIZE) {
            const batch = data.results.slice(i, i + BATCH_SIZE);

            const batchPromises = batch.map(async (pkmn, index) => {
                const id = i + index + 1;

                try {
                    const specRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}/`);
                    if (!specRes.ok) throw new Error("Error en datos de especie");
                    const specData = await specRes.json();

                    let rarity = "comun";
                    const isUltraBeast = (id >= 793 && id <= 800) || (id >= 803 && id <= 806);

                    if (specData.is_legendary || specData.is_mythical || isUltraBeast) {
                        rarity = "legendario";
                    } else if (specData.evolution_chain && specData.evolution_chain.url) {
                        const evoUrl = specData.evolution_chain.url;
                        let chainData;

                        if (evoChainCache.has(evoUrl)) {
                            chainData = evoChainCache.get(evoUrl);
                        } else {
                            const evoRes = await fetch(evoUrl);
                            chainData = await evoRes.json();
                            evoChainCache.set(evoUrl, chainData);
                        }

                        const chain = chainData.chain;
                        const hasEvolutions = chain.evolves_to && chain.evolves_to.length > 0;

                        if (!hasEvolutions) {
                            rarity = "raro";
                        } else if (chain.species.name === specData.name) {
                            rarity = "comun";
                        } else {
                            const isStage2 = chain.evolves_to.some(e => e.species.name === specData.name);
                            rarity = isStage2 ? "raro" : "epico";
                        }
                    }

                    return {
                        id: id,
                        name: formatPokemonName(pkmn.name),
                        stage: rarity === 'comun' ? 1 : rarity === 'raro' ? 2 : 3,
                        rarity: rarity,
                        sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
                    };
                } catch (err) {
                    return {
                        id: id,
                        name: formatPokemonName(pkmn.name),
                        stage: 1,
                        rarity: "comun",
                        sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
                    };
                }
            });

            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);
        }

        // Clasificar los resultados en la base de datos
        results.forEach(pkmn => {
            if (DATABASE[pkmn.rarity]) {
                DATABASE[pkmn.rarity].push(pkmn);
            }
        });

        console.log("¡Base de datos cargada y lista con éxito!", DATABASE);
    } catch (error) {
        console.error("Error al cargar la base de datos:", error);
    }
}

// Iniciar la carga al importar el archivo
loadFullDatabase();