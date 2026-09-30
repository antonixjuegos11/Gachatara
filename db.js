// db.js - Carga dinámica de las 9 Generaciones y TODAS las Megas (IDs correlativos)

const DATABASE = {
    comun: [],
    raro: [],
    epico: [],
    legendario: [],
    secreto: []
};

// Carga automática de Pokémon (Generaciones 1 a 9 + 49 Megas/Primales)
async function loadFullDatabase() {
    try {
        console.log("Cargando base de datos completa...");
        
        // 1. Obtener los 1025 Pokémon (Gen 1 - Gen 9)
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
        const data = await response.json();

        data.results.forEach((pkmn, index) => {
            const id = index + 1;
            let rarity = "comun";
            
            // Filtro de Legendarios y Míticos
            const isLegendaryOrMythical = 
                (id >= 144 && id <= 151) || // Gen 1
                (id >= 243 && id <= 251) || // Gen 2
                (id >= 377 && id <= 386) || // Gen 3
                (id >= 480 && id <= 493) || // Gen 4
                (id >= 638 && id <= 649) || // Gen 5
                (id >= 716 && id <= 721) || // Gen 6
                (id >= 785 && id <= 809) || // Gen 7
                (id >= 888 && id <= 905) || // Gen 8
                (id >= 1001 && id <= 1025); // Gen 9

            if (isLegendaryOrMythical) {
                rarity = "legendario";
            } else if (id % 7 === 0) {
                rarity = "epico";
            } else if (id % 3 === 0) {
                rarity = "raro";
            }

            DATABASE[rarity].push({
                id: id,
                name: pkmn.name.charAt(0).toUpperCase() + pkmn.name.slice(1),
                stage: 1,
                rarity: rarity,
                sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
            });
        });

        // 2. Mapeo de Megas con IDs de Pokédex del juego (a partir del 1026)
        // Guardamos el `apiId` de la PokeAPI solo para descargar el sprite correcto
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
                id: nextDexId, // ID limpio y ordenado para tu juego (1026, 1027, etc.)
                name: m.name,
                stage: 4,
                rarity: "secreto",
                sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${m.apiId}.png`
            });
            nextDexId++;
        });

        console.log("¡Base de datos cargada y ordenada hasta el #" + (nextDexId - 1) + "!", DATABASE);
    } catch (error) {
        console.error("Error cargando la base de datos de Pokémon:", error);
    }
}

// Iniciar carga
loadFullDatabase();