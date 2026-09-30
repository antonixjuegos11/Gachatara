// db.js - Carga dinámica de las 9 Generaciones y Megas vía PokeAPI

const DATABASE = {
    comun: [],
    raro: [],
    epico: [],
    legendario: [],
    secreto: []
};

// Asignación de rarezas basada en ID / Tipos de Pokémon
function determineRarity(id, isLegendary, isMythical, isMega) {
    if (isMega) return "secreto";
    if (isLegendary || isMythical) return "legendario";
    if (id % 5 === 0) return "epico";
    if (id % 2 === 0) return "raro";
    return "comun";
}

// Carga automática de Pokémon (Generaciones 1 a 9: IDs 1 al 1025 + Megas)
async function loadFullDatabase() {
    try {
        console.log("Cargando base de datos completa de Pokémon...");
        
        // Petición a PokeAPI para obtener los primeros 1025 Pokémon (Gen 1 - Gen 9)
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
        const data = await response.json();

        data.results.forEach((pkmn, index) => {
            const id = index + 1;
            
            // Asignación aproximada de rareza según ID y Pokémon especiales conocidos
            let rarity = "comun";
            
            // Legendarios/Míticos destacados (rangos y IDs específicos)
            const isLegendaryOrMythical = 
                (id >= 144 && id <= 151) || // Kanto
                (id >= 243 && id <= 251) || // Johto
                (id >= 377 && id <= 386) || // Hoenn
                (id >= 480 && id <= 493) || // Sinnoh
                (id >= 638 && id <= 649) || // Unova
                (id >= 716 && id <= 721) || // Kalos
                (id >= 785 && id <= 809) || // Alola
                (id >= 888 && id <= 905) || // Galar
                (id >= 1001 && id <= 1025); // Paldea

            if (isLegendaryOrMythical) {
                rarity = "legendario";
            } else if (id % 7 === 0) {
                rarity = "epico";
            } else if (id % 3 === 0) {
                rarity = "raro";
            }

            const pokemonObj = {
                id: id,
                name: pkmn.name.charAt(0).toUpperCase() + pkmn.name.slice(1),
                stage: 1,
                rarity: rarity,
                sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
            };

            DATABASE[rarity].push(pokemonObj);
        });

        // Agregar Megas principales a la categoría Secreto
        const megas = [
            { id: 10033, name: "Mega Venusaur" },
            { id: 10034, name: "Mega Charizard X" },
            { id: 10035, name: "Mega Charizard Y" },
            { id: 10036, name: "Mega Blastoise" },
            { id: 10037, name: "Mega Alakazam" },
            { id: 10038, name: "Mega Gengar" },
            { id: 10043, name: "Mega Mewtwo X" },
            { id: 10044, name: "Mega Mewtwo Y" },
            { id: 10045, name: "Mega Lucario" },
            { id: 10048, name: "Mega Rayquaza" },
            { id: 10075, name: "Mega Rayquaza Alt" }
        ];

        megas.forEach(m => {
            DATABASE.secreto.push({
                id: m.id,
                name: m.name,
                stage: 4,
                rarity: "secreto",
                sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${m.id}.png`
            });
        });

        console.log("¡Base de datos cargada con éxito!", DATABASE);
    } catch (error) {
        console.error("Error cargando la base de datos de Pokémon:", error);
    }
}

// Iniciar carga
loadFullDatabase();