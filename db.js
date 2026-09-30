// db.js - Carga dinámica de las 9 Generaciones, Ultraentes Legendarios y Unietapas Raros

const DATABASE = {
    comun: [],
    raro: [],
    epico: [],
    legendario: [],
    secreto: []
};

// Carga automática de Pokémon y asignación de rarezas ajustada
async function loadFullDatabase() {
    try {
        console.log("Cargando base de datos completa con Ultraentes y Unietapas ajustados...");
        
        DATABASE.comun = [];
        DATABASE.raro = [];
        DATABASE.epico = [];
        DATABASE.legendario = [];
        DATABASE.secreto = [];

        // 1. Obtener la lista base de los 1025 Pokémon
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
        const data = await response.json();

        // Consultas concurrentes a PokeAPI
        const pokemonPromises = data.results.map(async (pkmn, index) => {
            const id = index + 1;
            
            try {
                const specRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}/`);
                const specData = await specRes.json();

                let rarity = "comun";

                // Ultraentes, Legendarios y Míticos -> LEGENDARIO
                // (Los Ultraentes son identificados como legendarios/míticos en especie o por rango de Pokédex #793-#800)
                const isUltraBeast = (id >= 793 && id <= 800) || id === 803 || id === 804 || id === 805 || id === 806;
                
                if (specData.is_legendary || specData.is_mythical || isUltraBeast) {
                    rarity = "legendario";
                } else {
                    // Determinar por cadena evolutiva
                    const evoRes = await fetch(specData.evolution_chain.url);
                    const evoData = await evoRes.json();

                    let chain = evoData.chain;
                    const hasEvolutions = chain.evolves_to && chain.evolves_to.length > 0;

                    // Si NO tiene evoluciones (etapa única / no evoluciona) -> RARO
                    if (!hasEvolutions) {
                        rarity = "raro";
                    } else if (chain.species.name === specData.name) {
                        // Etapa Base de una cadena de evoluciones -> COMÚN
                        rarity = "comun";
                    } else {
                        // Comprobar si es 2ª etapa (Raro) o 3ª etapa/final larga (Épico)
                        let isStage2 = chain.evolves_to.some(e => e.species.name === specData.name);
                        if (isStage2) {
                            // Si esta 2ª etapa aún evoluciona a otra más -> RARO
                            // Si es la evolución final de 2 etapas -> RARO
                            rarity = "raro";
                        } else {
                            // 3ª etapa evolutiva -> ÉPICO
                            rarity = "epico";
                        }
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
                // Fallback de seguridad
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

        // Agrupar en la base de datos
        loadedPokemon.forEach(pkmn => {
            DATABASE[pkmn.rarity].push(pkmn);
        });

        // 2. Cargar las 48 Megas (Categoría Secreto)
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
            { apiId: 10077, name: "Groudon Primigenio" },
            { apiId: 10078, name: "Kyogre Primigenio" },
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

        console.log("¡Base de datos actualizada con Ultraentes en Legendarios y Unietapas en Raros!", DATABASE);
    } catch (error) {
        console.error("Error cargando la base de datos:", error);
    }
}

// Iniciar
loadFullDatabase();