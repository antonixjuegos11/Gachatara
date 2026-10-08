// modes.js - Modos de Combate (3v3 Rápido y 6v6 Estratégico)

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

// Función auxiliar para generar un equipo enemigo de N miembros
function generateEnemyTeam(playerTeam, count) {
    // Calcula el nivel medio del equipo del jugador (o toma el del primer Pokémon, mínimo nivel 1)
    let avgLevel = 1;
    if (playerTeam && playerTeam.length > 0) {
        const totalLevel = playerTeam.reduce((sum, p) => sum + (p.level || 1), 0);
        avgLevel = Math.max(1, Math.floor(totalLevel / playerTeam.length));
    }

    let team = [];
    for (let i = 0; i < count; i++) {
        team.push(getRandomEnemy(avgLevel));
    }
    return team;
}

// -----------------------------------------
// MODO RÁPIDO (3v3)
// -----------------------------------------
function startQuickBattle() {
    let playerTeam = [];

    // Intentar leer el equipo rápido de 3 desde el almacenamiento local
    const savedFastTeam = localStorage.getItem('pokemon_active_team_fast');
    if (savedFastTeam) {
        try {
            playerTeam = JSON.parse(savedFastTeam);
        } catch (e) {
            playerTeam = [];
        }
    }

    // Si está vacío, intentamos usar el inventario general o un fallback de prueba
    if (!playerTeam || playerTeam.length === 0) {
        if (typeof userInventory !== 'undefined' && userInventory.length > 0) {
            playerTeam = userInventory.slice(0, 3); // Tomamos hasta 3
        } else {
            playerTeam = [{
                id: 25,
                name: "Pikachu",
                type: "Eléctrico",
                hp: 70,
                attack: 60,
                defense: 40,
                speed: 90,
                sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
                level: 10
            }];
        }
    }

    const avgLevel = playerTeam[0]?.level || 10;
    const enemyTeam = generateEnemyTeam(playerTeam.length, avgLevel); // Mismo número de enemigos que de aliados (máx 3)

    if (typeof startBattle === 'function') {
        startBattle(playerTeam, enemyTeam, 'quick', (hasWon) => {
            console.log(`Combate Rápido terminado. Resultado: ${hasWon ? 'Victoria' : 'Derrota'}`);
        });
    } else {
        console.error("La función startBattle no está disponible.");
    }
}

// -----------------------------------------
// MODO ESTRATÉGICO (6v6)
// -----------------------------------------
function startStrategyBattle() {
    let playerTeam = [];

    // Intentar leer el equipo estratégico de 6 desde el almacenamiento local
    const savedStrategyTeam = localStorage.getItem('pokemon_active_team_strategy');
    if (savedStrategyTeam) {
        try {
            playerTeam = JSON.parse(savedStrategyTeam);
        } catch (e) {
            playerTeam = [];
        }
    }

    if (!playerTeam || playerTeam.length === 0) {
        alert("¡No tienes un Equipo Estratégico configurado! Ve a la pestaña 'Equipo' y añade hasta 6 Pokémon.");
        return;
    }

    const avgLevel = playerTeam[0]?.level || 10;
    const enemyTeam = generateEnemyTeam(playerTeam.length, avgLevel); // Genera equipo enemigo de hasta 6 Pokémon

    if (typeof startBattle === 'function') {
        startBattle(playerTeam, enemyTeam, 'strategy', (hasWon) => {
            console.log(`Combate Estratégico terminado. Resultado: ${hasWon ? 'Victoria' : 'Derrota'}`);
        });
    } else {
        console.error("La función startBattle no está disponible.");
    }
}