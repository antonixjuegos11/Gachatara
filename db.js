// Base de Datos de Personajes (Kanto Gen 1 + Megas)
const DATABASE = {
    // RAREZA: COMUN (1ª Etapa Evolutiva)
    común: [
        { id: 1, name: "Bulbasaur", stage: 1, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png" },
        { id: 4, name: "Charmander", stage: 1, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png" },
        { id: 7, name: "Squirtle", stage: 1, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png" },
        { id: 10, name: "Caterpie", stage: 1, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10.png" },
        { id: 13, name: "Weedle", stage: 1, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/13.png" },
        { id: 16, name: "Pidgey", stage: 1, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/16.png" },
        { id: 19, name: "Rattata", stage: 1, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/19.png" },
        { id: 23, name: "Ekans", stage: 1, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/23.png" },
        { id: 25, name: "Pikachu", stage: 1, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png" },
        { id: 27, name: "Sandshrew", stage: 1, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/27.png" },
        { id: 35, name: "Clefairy", stage: 1, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/35.png" },
        { id: 37, name: "Vulpix", stage: 1, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/37.png" },
        { id: 41, name: "Zubat", stage: 1, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/41.png" },
        { id: 43, name: "Oddish", stage: 1, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/43.png" },
        { id: 52, name: "Meowth", stage: 1, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/52.png" },
        { id: 60, name: "Poliwag", stage: 1, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/60.png" },
        { id: 63, name: "Abra", stage: 1, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/63.png" },
        { id: 66, name: "Machop", stage: 1, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/66.png" },
        { id: 74, name: "Geodude", stage: 1, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/74.png" },
        { id: 92, name: "Gastly", stage: 1, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/92.png" },
        { id: 129, name: "Magikarp", stage: 1, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/129.png" },
        { id: 133, name: "Eevee", stage: 1, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png" },
        { id: 147, name: "Dratini", stage: 1, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/147.png" }
    ],

    // RAREZA: RARO (2ª Etapa Evolutiva + Monofásicos Básicos)
    raro: [
        { id: 2, name: "Ivysaur", stage: 2, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png" },
        { id: 5, name: "Charmeleon", stage: 2, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/5.png" },
        { id: 8, name: "Wartortle", stage: 2, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/8.png" },
        { id: 11, name: "Metapod", stage: 2, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/11.png" },
        { id: 14, name: "Kakuna", stage: 2, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/14.png" },
        { id: 17, name: "Pidgeotto", stage: 2, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/17.png" },
        { id: 26, name: "Raichu", stage: 2, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/26.png" },
        { id: 64, name: "Kadabra", stage: 2, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/64.png" },
        { id: 67, name: "Machoke", stage: 2, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/67.png" },
        { id: 75, name: "Graveler", stage: 2, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/75.png" },
        { id: 83, name: "Farfetch'd", stage: "único", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/83.png" },
        { id: 93, name: "Haunter", stage: 2, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/93.png" },
        { id: 95, name: "Onix", stage: "único", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/95.png" },
        { id: 114, name: "Tangela", stage: "único", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/114.png" },
        { id: 148, name: "Dragonair", stage: 2, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/148.png" }
    ],

    // RAREZA: ÉPICO (3ª Etapa Evolutiva + Monofásicos Potentes)
    épico: [
        { id: 3, name: "Venusaur", stage: 3, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png" },
        { id: 6, name: "Charizard", stage: 3, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png" },
        { id: 9, name: "Blastoise", stage: 3, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png" },
        { id: 12, name: "Butterfree", stage: 3, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/12.png" },
        { id: 15, name: "Beedrill", stage: 3, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/15.png" },
        { id: 18, name: "Pidgeot", stage: 3, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/18.png" },
        { id: 65, name: "Alakazam", stage: 3, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/65.png" },
        { id: 68, name: "Machamp", stage: 3, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/68.png" },
        { id: 76, name: "Golem", stage: 3, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/76.png" },
        { id: 94, name: "Gengar", stage: 3, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png" },
        { id: 123, name: "Scyther", stage: "único", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/123.png" },
        { id: 127, name: "Pinsir", stage: "único", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/127.png" },
        { id: 130, name: "Gyarados", stage: 2, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/130.png" },
        { id: 131, name: "Lapras", stage: "único", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/131.png" },
        { id: 143, name: "Snorlax", stage: "único", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png" },
        { id: 149, name: "Dragonite", stage: 3, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/149.png" }
    ],

    // RAREZA: LEGENDARIO (Legendarios y Singulares)
    legendario: [
        { id: 144, name: "Articuno", stage: "legendario", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/144.png" },
        { id: 145, name: "Zapdos", stage: "legendario", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/145.png" },
        { id: 146, name: "Moltres", stage: "legendario", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/146.png" },
        { id: 150, name: "Mewtwo", stage: "legendario", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png" },
        { id: 151, name: "Mew", stage: "singular", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/151.png" }
    ],

    // RAREZA: SECRETO (Megaevoluciones)
    secreto: [
        { id: 10033, name: "Mega-Venusaur", stage: "mega", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10033.png" },
        { id: 10034, name: "Mega-Charizard X", stage: "mega", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10034.png" },
        { id: 10035, name: "Mega-Charizard Y", stage: "mega", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10035.png" },
        { id: 10036, name: "Mega-Blastoise", stage: "mega", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10036.png" },
        { id: 10037, name: "Mega-Beedrill", stage: "mega", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10037.png" },
        { id: 10038, name: "Mega-Pidgeot", stage: "mega", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10038.png" },
        { id: 10039, name: "Mega-Alakazam", stage: "mega", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10039.png" },
        { id: 10040, name: "Mega-Gengar", stage: "mega", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10040.png" },
        { id: 10043, name: "Mega-Mewtwo X", stage: "mega", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10043.png" },
        { id: 10044, name: "Mega-Mewtwo Y", stage: "mega", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10044.png" }
    ]
};

// Futura Base de Datos para Skins / Shiny (Preparada)
const SKINS_DATABASE = [];