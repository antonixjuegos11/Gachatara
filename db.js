// db.js - Carga dinámica de las 9 Generaciones, Ultraentes Legendarios y Unietapas Raros

const DATABASE = {
    comun: [],
    raro: [],
    epico: [],
    legendario: [],
    secreto: []
};

// Carga de Megas con IDs de PokeAPI perfectamente mapeados
function initSecretMegas() {
    DATABASE.secreto = [];
    const allMegas = [
        { apiId: 10033, name: "Mega Venusaur" },
        { apiId: 10034, name: "Mega Charizard X" },
        { apiId: 10035, name: "Mega Charizard Y" },
        { apiId: 10036, name: "Mega Blastoise" },
        { apiId: 10037, name: "Mega Alakazam" },
        { apiId: 10038, name: "Mega Gengar" },
        { apiId: 10039, name: "Mega Kangaskhan" },
        { apiId: 10040, name: "Mega Pinsir" },
        { apiId: 10041, name: "Mega Gyarados" },
        { apiId: 10042, name: "Mega Aerodactyl" },
        { apiId: 10043, name: "Mega Mewtwo X" },
        { apiId: 10044, name: "Mega Mewtwo Y" },
        { apiId: 10045, name: "Mega Ampharos" },
        { apiId: 10046, name: "Mega Scizor" },
        { apiId: 10047, name: "Mega Heracross" },
        { apiId: 10048, name: "Mega Houndoom" },
        { apiId: 10049, name: "Mega Tyranitar" },
        { apiId: 10050, name: "Mega Blaziken" },
        { apiId: 10051, name: "Mega Gardevoir" },
        { apiId: 10052, name: "Mega Mawile" },
        { apiId: 10053, name: "Mega Aggron" },
        { apiId: 10054, name: "Mega Medicham" },
        { apiId: 10055, name: "Mega Manectric" },
        { apiId: 10056, name: "Mega Banette" },
        { apiId: 10057, name: "Mega Absol" },
        { apiId: 10058, name: "Mega Garchomp" },
        { apiId: 10059, name: "Mega Lucario" },
        { apiId: 10060, name: "Mega Abomasnow" },
        { apiId: 10062, name: "Mega Beedrill" },
        { apiId: 10063, name: "Mega Pidgeot" },
        { apiId: 10064, name: "Mega Slowbro" },
        { apiId: 10065, name: "Mega Steelix" },
        { apiId: 10066, name: "Mega Sceptile" },
        { apiId: 10067, name: "Mega Swampert" },
        { apiId: 10068, name: "Mega Sableye" },
        { apiId: 10069, name: "Mega Sharpedo" },
        { apiId: 10070, name: "Mega Camerupt" },
        { apiId: 10071, name: "Mega Altaria" },
        { apiId: 10072, name: "Mega Glalie" },
        { apiId: 10073, name: "Mega Salamence" },
        { apiId: 10074, name: "Mega Metagross" },
        { apiId: 10075, name: "Mega Latias" },
        { apiId: 10076, name: "Mega Latios" },
        { apiId: 10077, name: "Kyogre Primigenio" },
        { apiId: 10078, name: "Groudon Primigenio" },
        { apiId: 10079, name: "Mega Rayquaza" },
        { apiId: 10087, name: "Mega Lopunny" },
        { apiId: 10088, name: "Mega Audino" },
        { apiId: 10089, name: "Mega Diancie" }
    ];

    let nextDexId = 1026;
    allMegas.forEach(m => {
        DATABASE.secreto.push({
            id: nextDexId,
            name: m.name,
            stage: 4,
            rarity: "secreto",
            sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${m.apiId}.png`
        });
        nextDexId++;
    });
}

// Carga automática de Pokémon
async function loadFullDatabase() {
    try {
        console.log("Cargando base de datos completa...");
        
        DATABASE.comun = [];
        DATABASE.raro = [];
        DATABASE.epico = [];
        DATABASE.legendario = [];
        
        initSecretMegas();

        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
        const data = await response.json();

        const evoChainCache = new Map();

        const pokemonPromises = data.results.map(async (pkmn, index) => {
            const id = index + 1;
            
            try {
                const specRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}/`);
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
                    name: pkmn.name.charAt(0).toUpperCase() + pkmn.name.slice(1),
                    stage: rarity === 'comun' ? 1 : rarity === 'raro' ? 2 : 3,
                    rarity: rarity,
                    sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
                };
            } catch (err) {
                return {
                    id: id,
                    name: pkmn.name.charAt(0).toUpperCase() + pkmn.name.slice(1),
                    stage: 1,
                    rarity: "comun",
                    sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
                };
            }
        });

        const loadedPokemon = await Promise.all(pokemonPromises);

        loadedPokemon.forEach(pkmn => {
            if (DATABASE[pkmn.rarity]) {
                DATABASE[pkmn.rarity].push(pkmn);
            }
        });

        console.log("¡Base de datos lista!", DATABASE);
    } catch (error) {
        console.error("Error cargando la base de datos:", error);
    }
}

loadFullDatabase();