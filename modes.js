// modes.js - Modos de Combate

function getRandomEnemy(level = 10) {
    const allPkmn = typeof getAllPokemonFromDB === 'function' ? getAllPokemonFromDB() : [];
    
    if (allPkmn.length > 0) {
        const randomPick = allPkmn[Math.floor(Math.random() * allPkmn.length)];
        return { ...randomPick, level };
    }

    // Enemigo por defecto si la base de datos no está cargada aún
    return {
        id: 133,
        name: "Eevee",
        type: "Normal",
        hp: 60,
        attack: 55,
        defense: 50,
        speed: 55,
        sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png",
        level
    };
}

function startQuickBattle() {
    let playerUnit = null;

    // 1. Intentar tomar el primer Pokémon del inventario del jugador
    if (typeof userInventory !== 'undefined' && userInventory.length > 0) {
        playerUnit = userInventory[0];
    } else {
        // Pokémon de prueba si el inventario está vacío
        playerUnit = {
            id: 25,
            name: "Pikachu",
            type: "Eléctrico",
            hp: 70,
            attack: 60,
            defense: 40,
            speed: 90,
            sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
            level: 10
        };
    }

    const enemyUnit = getRandomEnemy(playerUnit.level || 10);

    if (typeof startBattle === 'function') {
        startBattle([playerUnit], [enemyUnit], 'quick', (hasWon) => {
            console.log(`Combate terminado. Resultado: ${hasWon ? 'Victoria' : 'Derrota'}`);
        });
    } else {
        console.error("La función startBattle no está disponible. Revisa que combat.js esté cargado correctamente.");
    }
}