// db.js - Carga dinámica de las 9 Generaciones con Rarezas Reales por Especie y Evolución

const DATABASE = {
    comun: [],
    raro: [],
    epico: [],
    legendario: [],
    secreto: []
};

// Carga automática de Pokémon y asignación de rareza real
async function loadFullDatabase() {
    try {
        console.log("Cargando base de datos completa de las 9 Generaciones...");
        
        DATABASE.comun = [];
        DATABASE.raro = [];
        DATABASE.epico = [];
        DATABASE.legendario = [];
        DATABASE.secreto = [];

        // 1. Obtener la lista base de los 1025 Pokémon
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
        const data = await response.json();

        // Promesas concurrentes para consultar el estatus oficial de especie
        const pokemonPromises = data.results.map(async (pkmn, index) => {
            const id = index + 1;
            
            try {
                // Consultar datos de especie para verificar si es legendario/mítico o su cadena
                const specRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}/`);
                const specData = await specRes.json();

                let rarity = "comun";

                if (specData.is_legendary || specData.is_mythical) {
                    rarity = "legendario";
                } else {
                    // Determinar por etapa evolutiva
                    const evoRes = await fetch(specData.evolution_chain.url);
                    const evoData = await evoRes.json();

                    let stage = 1;
                    let chain = evoData.chain;

                    if (chain.species.name === specData.name) {
                        stage = 1; // Etapa base -> Común
                    } else {
                        // Buscar si está en la 2ª o 3ª etapa
                        let foundInStage2 = chain.evolves_to.some(e => e.species.name === specData.name);
                        if (foundInStage2) {
                            stage = 2; // Raro
                        } else {
                            stage = 3; // Épico (3ª etapa o final de línea larga)
                        }
                    }

                    if (stage === 1) rarity = "comun";
                    else if (stage === 2) rarity = "raro";
                    else if (stage === 3) rarity = "epico";
                }

                return {
                    id: id,
                    name: pkmn.name.charAt(0).toUpperCase() + pkmn.name.slice(1),
                    stage: rarity === 'comun' ? 1 : rarity === 'raro' ? 2 : 3,
                    rarity: rarity,
                    sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
                };
            } catch (err) {
                // Fallback de seguridad en caso de fallo de red puntual
                let fallbackRarity = "comun";
                if ((id >= 144 && id <= 151) || (id >= 243 && id <= 251) || (id >= 377 && id <= 386) || 
                    (id >= 480 && id <= 493) || (id >= 638 && id <= 649) || (id >= 716 && id <= 721) || 
                    (id >= 785 && id <= 809) || (id >= 888 && id <= 905) || (id >= 1001 && id <= 1025)) {
                    fallbackRarity = "legendario";
                } else if (id % 3 === 0) {
                    fallbackRarity = "raro";
                }
                
                return {
                    id: id,
                    name: pkmn.name.charAt(0).toUpperCase() + pkmn.name.slice(1),
                    stage: 1,
                    rarity: fallbackRarity,
                    sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
                };
            }
        });

        // Esperar a resolver todas las especies
        const loadedPokemon = await Promise.all(pokemonPromises);

        // Agrupar en DATABASE
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

        console.log("¡Base de datos cargada con éxito y rarezas precisas por evolución!", DATABASE);
    } catch (error) {
        console.error("Error cargando la base de datos de Pokémon:", error);
    }
}

// Iniciar carga
loadFullDatabase();