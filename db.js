// db.js - Carga dinámica de las 9 Generaciones, Ultraentes Legendarios, Megas y Habilidades

const DATABASE = {
    comun: [],
    raro: [],
    epico: [],
    legendario: [],
    secreto: []
};

// Diccionario de traducción de tipos (Inglés -> Español)
const TYPE_TRANSLATIONS = {
    normal: "Normal", fire: "Fuego", water: "Agua", grass: "Planta",
    electric: "Eléctrico", ice: "Hielo", fighting: "Lucha", poison: "Veneno",
    ground: "Tierra", flying: "Volador", psychic: "Psíquico", bug: "Bicho",
    rock: "Roca", ghost: "Fantasma", dragon: "Dragón", dark: "Siniestro",
    steel: "Acero", fairy: "Hada"
};

const MEGA_NAMES = {
    "venusaur-mega": "Mega Venusaur", "charizard-mega-x": "Mega Charizard X",
    "charizard-mega-y": "Mega Charizard Y", "blastoise-mega": "Mega Blastoise",
    "beedrill-mega": "Mega Beedrill", "pidgeot-mega": "Mega Pidgeot",
    "alakazam-mega": "Mega Alakazam", "slowbro-mega": "Mega Slowbro",
    "gengar-mega": "Mega Gengar", "kangaskhan-mega": "Mega Kangaskhan",
    "pinsir-mega": "Mega Pinsir", "gyarados-mega": "Mega Gyarados",
    "aerodactyl-mega": "Mega Aerodactyl", "mewtwo-mega-x": "Mega Mewtwo X",
    "mewtwo-mega-y": "Mega Mewtwo Y", "ampharos-mega": "Mega Ampharos",
    "steelix-mega": "Mega Steelix", "scizor-mega": "Mega Scizor",
    "heracross-mega": "Mega Heracross", "houndoom-mega": "Mega Houndoom",
    "tyranitar-mega": "Mega Tyranitar", "sceptile-mega": "Mega Sceptile",
    "blaziken-mega": "Mega Blaziken", "swampert-mega": "Mega Swampert",
    "gardevoir-mega": "Mega Gardevoir", "sableye-mega": "Mega Sableye",
    "mawile-mega": "Mega Mawile", "aggron-mega": "Mega Aggron",
    "medicham-mega": "Mega Medicham", "manectric-mega": "Mega Manectric",
    "sharpedo-mega": "Mega Sharpedo", "camerupt-mega": "Mega Camerupt",
    "altaria-mega": "Mega Altaria", "banette-mega": "Mega Banette",
    "absol-mega": "Mega Absol", "glalie-mega": "Mega Glalie",
    "salamence-mega": "Mega Salamence", "metagross-mega": "Mega Metagross",
    "latias-mega": "Mega Latias", "latios-mega": "Mega Latios",
    "kyogre-primal": "Kyogre Primigenio", "groudon-primal": "Groudon Primigenio",
    "rayquaza-mega": "Mega Rayquaza", "lopunny-mega": "Mega Lopunny",
    "garchomp-mega": "Mega Garchomp", "lucario-mega": "Mega Lucario",
    "abomasnow-mega": "Mega Abomasnow", "gallade-mega": "Mega Gallade",
    "audino-mega": "Mega Audino", "diancie-mega": "Mega Diancie"
};

function formatPokemonName(name) {
    if (!name) return "Desconocido";
    return name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

async function initSecretMegas() {
    DATABASE.secreto = [];
    let nextDexId = 1026;

    for (const [apiKey, displayName] of Object.entries(MEGA_NAMES)) {
        try {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${apiKey}`);
            if (!res.ok) continue;
            const data = await res.json();

            const types = data.types.map(t => TYPE_TRANSLATIONS[t.type.name] || 'Normal');
            const stats = {};
            data.stats.forEach(s => { stats[s.stat.name] = s.base_stat; });

            const mainAbility = data.abilities && data.abilities.length > 0 ? data.abilities[0].ability.name : 'none';

            DATABASE.secreto.push({
                id: nextDexId,
                name: displayName,
                types: types,
                type: types[0],
                ability: mainAbility,
                baseStats: {
                    hp: stats['hp'] || 80, attack: stats['attack'] || 100,
                    defense: stats['defense'] || 100, spAtk: stats['special-attack'] || 100,
                    spDef: stats['special-defense'] || 100, speed: stats['speed'] || 100
                },
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

async function loadFullDatabase() {
    try {
        console.log("Iniciando carga de la base de datos...");
        DATABASE.comun = []; DATABASE.raro = []; DATABASE.epico = []; DATABASE.legendario = [];

        await initSecretMegas();

        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
        const data = await response.json();

        const evoChainCache = new Map();
        const results = [];
        const BATCH_SIZE = 25;

        for (let i = 0; i < data.results.length; i += BATCH_SIZE) {
            const batch = data.results.slice(i, i + BATCH_SIZE);

            const batchPromises = batch.map(async (pkmn, index) => {
                const id = i + index + 1;

                try {
                    const [pkmnRes, specRes] = await Promise.all([
                        fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`),
                        fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}/`)
                    ]);

                    if (!specRes.ok || !pkmnRes.ok) throw new Error("Error en datos de API");

                    const pkmnData = await pkmnRes.json();
                    const specData = await specRes.json();

                    const types = pkmnData.types.map(t => TYPE_TRANSLATIONS[t.type.name] || 'Normal');
                    const stats = {};
                    pkmnData.stats.forEach(s => { stats[s.stat.name] = s.base_stat; });

                    const mainAbility = pkmnData.abilities && pkmnData.abilities.length > 0 ? pkmnData.abilities[0].ability.name : 'none';

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
                        types: types,
                        type: types[0],
                        ability: mainAbility,
                        baseStats: {
                            hp: stats['hp'] || 50, attack: stats['attack'] || 50,
                            defense: stats['defense'] || 50, spAtk: stats['special-attack'] || 50,
                            spDef: stats['special-defense'] || 50, speed: stats['speed'] || 50
                        },
                        stage: rarity === 'comun' ? 1 : rarity === 'raro' ? 2 : 3,
                        rarity: rarity,
                        sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
                    };
                } catch (err) {
                    return {
                        id: id,
                        name: formatPokemonName(pkmn.name),
                        types: ["Normal"],
                        type: "Normal",
                        ability: "none",
                        baseStats: { hp: 50, attack: 50, defense: 50, spAtk: 50, spDef: 50, speed: 50 },
                        stage: 1,
                        rarity: "comun",
                        sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
                    };
                }
            });

            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);
        }

        results.forEach(pkmn => {
            if (DATABASE[pkmn.rarity]) DATABASE[pkmn.rarity].push(pkmn);
        });

        console.log("¡Base de datos cargada con habilidades y stats oficiales!", DATABASE);
    } catch (error) {
        console.error("Error al cargar la base de datos:", error);
    }
}

loadFullDatabase();