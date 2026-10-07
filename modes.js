// modes.js - Modos de Combate (Partida Rápida, Historia, Ranked)

// Genera un Pokémon rival aleatorio desde la Base de Datos
function getRandomEnemy(level = 10) {
    const allPkmn = typeof getAllPokemonFromDB === 'function' ? getAllPokemonFromDB() : [];
    if (allPkmn.length === 0) return null;

    const randomPick = allPkmn[Math.floor(Math.random() * allPkmn.length)];
    return {
        ...randomPick,
        level: level
    };
}

// Iniciar Partida Rápida (Versus IA Aleatoria)
function startQuickBattle() {
    // Tomar los primeros Pokémon del inventario del usuario
    const playerTeam = userInventory.slice(0, 1); // 1v1 para prueba rápida

    if (playerTeam.length === 0) {
        alert("¡Necesitas conseguir al menos 1 Pokémon en el Gacha para poder luchar!");
        return;
    }

    const enemy = getRandomEnemy(playerTeam[0].level || 10);
    if (!enemy) {
        alert("No se pudieron cargar los datos del rival.");
        return;
    }

    startBattle(playerTeam, [enemy], 'quick', (hasWon) => {
        console.log(`Combate rápido finalizado. ¿Victoria?: ${hasWon}`);
    });
}