// db.js - Carga dinámica de las 9 Generaciones y TODAS las Megas vía PokeAPI

const DATABASE = {
    comun: [],
    raro: [],
    epico: [],
    legendario: [],
    secreto: []
};

// Carga automática de Pokémon (Generaciones 1 a 9 + 48 Megas)
async function loadFullDatabase() {
    try {
        console.log("Cargando base de datos completa...");
        
        // 1. Obtener los 1025 Pokémon (Gen 1 - Gen 9)
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
        const data = await response.json();

        data.results.forEach((pkmn, index) => {
            const id = index + 1;
            let rarity = "comun";
            
            // Filtro de Legendarios y Míticos por rangos de Pokedex
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

        // 2. Lista Completa de TODAS las MegaEvoluciones (IDs Oficiales de la PokeAPI)
        const allMegas = [
            { id: 10033, name: "Mega Venusaur" },
            { id: 10034, name: "Mega Charizard X" },
            { id: 10035, name: "Mega Charizard Y" },
            { id: 10036, name: "Mega Blastoise" },
            { id: 10037, name: "Mega Alakazam" },
            { id: 10038, name: "Mega Gengar" },
            { id: 10039, name: "Mega Kangaskhan" },
            { id: 10040, name: "Mega Pinsir" },
            { id: 10041, name: "Mega Gyarados" },
            { id: 10042, name: "Mega Aerodactyl" },
            { id: 10043, name: "Mega Mewtwo X" },
            { id: 10044, name: "Mega Mewtwo Y" },
            { id: 10045, name: "Mega Ampharos" },
            { id: 10046, name: "Mega Scizor" },
            { id: 10047, name: "Mega Heracross" },
            { id: 10048, name: "Mega Houndoom" },
            { id: 10049, name: "Mega Tyranitar" },
            { id: 10050, name: "Mega Blaziken" },
            { id: 10051, name: "Mega Gardevoir" },
            { id: 10052, name: "Mega Mawile" },
            { id: 10053, name: "Mega Aggron" },
            { id: 10054, name: "Mega Medicham" },
            { id: 10055, name: "Mega Manectric" },
            { id: 10056, name: "Mega Banette" },
            { id: 10057, name: "Mega Absol" },
            { id: 10058, name: "Mega Garchomp" },
            { id: 10059, name: "Mega Lucario" },
            { id: 10060, name: "Mega Abomasnow" },
            { id: 10062, name: "Mega Beedrill" },
            { id: 10063, name: "Mega Pidgeot" },
            { id: 10064, name: "Mega Slowbro" },
            { id: 10065, name: "Mega Steelix" },
            { id: 10066, name: "Mega Sceptile" },
            { id: 10067, name: "Mega Swampert" },
            { id: 10068, name: "Mega Sableye" },
            { id: 10069, name: "Mega Sharpedo" },
            { id: 10070, name: "Mega Camerupt" },
            { id: 10071, name: "Mega Altaria" },
            { id: 10072, name: "Mega Glalie" },
            { id: 10073, name: "Mega Salamence" },
            { id: 10074, name: "Mega Metagross" },
            { id: 10075, name: "Mega Latias" },
            { id: 10076, name: "Mega Latios" },
            { id: 10077, name: "Groudon Primigenio" },
            { id: 10078, name: "Kyogre Primigenio" },
            { id: 10079, name: "Mega Rayquaza" },
            { id: 10087, name: "Mega Lopunny" },
            { id: 10088, name: "Mega Audino" },
            { id: 10089, name: "Mega Diancie" }
        ];

        allMegas.forEach(m => {
            DATABASE.secreto.push({
                id: m.id,
                name: m.name,
                stage: 4,
                rarity: "secreto",
                sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${m.id}.png`
            });
        });

        console.log("¡Base de datos cargada al completo con 1025 Pokémon y 48 Megas!", DATABASE);
    } catch (error) {
        console.error("Error cargando la base de datos de Pokémon:", error);
    }
}

// Iniciar carga
loadFullDatabase();