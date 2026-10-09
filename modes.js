// modes.js - Modos de Combate corregidos para 3v3 y 6v6 con rivales múltiples y EXP persistente

function getRandomEnemy(level = 10) {
    const allPkmn = typeof getAllPokemonFromDB === 'function' ? getAllPokemonFromDB() : [];
    
    if (allPkmn.length > 0) {
        const randomPick = allPkmn[Math.floor(Math.random() * allPkmn.length)];
        return { ...randomPick, level };
    }

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

// Genera un array con exactamente la cantidad de enemigos requerida (3 o 6)
function generateEnemyTeam(fixedSize, level = 1) {
    let team = [];
    for (let i = 0; i < fixedSize; i++) {
        team.push(getRandomEnemy(level));
    }
    return team;
}

// Obtiene el equipo del jugador sincronizado con el inventario
function getSyncedPlayerTeam(storageKey, maxSlots) {
    let rawTeam = [];
    try {
        const saved = localStorage.getItem(storageKey);
        if (saved) rawTeam = JSON.parse(saved);
    } catch (e) {
        rawTeam = [];
    }

    if ((!rawTeam || rawTeam.length === 0) && typeof userInventory !== 'undefined' && userInventory.length > 0) {
        rawTeam = userInventory.slice(0, maxSlots);
    }

    return rawTeam.slice(0, maxSlots).map(p => {
        if (typeof userInventory !== 'undefined') {
            const realInvPkmn = userInventory.find(item => Number(item.id) === Number(p.id));
            if (realInvPkmn) {
                return { ...p, level: realInvPkmn.level || 1, stars: realInvPkmn.stars || 0 };
            }
        }
        return p;
    });
}

// -----------------------------------------
// MODO RÁPIDO (3v3)
// -----------------------------------------
function startQuickBattle() {
    const finalPlayerTeam = getSyncedPlayerTeam('pokemon_active_team_fast', 3);

    if (!finalPlayerTeam || finalPlayerTeam.length === 0) {
        alert("¡No tienes Pokémon en tu equipo rápido ni en el inventario!");
        return;
    }

    // Nivel promedio del equipo para nivelar a los 3 rivales
    const avgLevel = Math.floor(finalPlayerTeam.reduce((sum, p) => sum + (p.level || 1), 0) / finalPlayerTeam.length);
    
    // Forzamos un equipo enemigo de EXACTAMENTE 3 Pokémon
    const enemyTeam = generateEnemyTeam(3, avgLevel);

    if (typeof startBattle === 'function') {
        startBattle(finalPlayerTeam, enemyTeam, 'quick', (hasWon) => {
            if (hasWon) {
                awardTeamExperience(finalPlayerTeam);
            }
        });
    } else {
        console.error("La función startBattle no está disponible.");
    }
}

// -----------------------------------------
// MODO ESTRATÉGICO (6v6)
// -----------------------------------------
function startStrategyBattle() {
    const finalPlayerTeam = getSyncedPlayerTeam('pokemon_active_team_strategy', 6);

    if (!finalPlayerTeam || finalPlayerTeam.length === 0) {
        alert("¡No tienes un Equipo Estratégico configurado! Ve a la pestaña 'Equipo'.");
        return;
    }

    // Nivel promedio del equipo para nivelar a los 6 rivales
    const avgLevel = Math.floor(finalPlayerTeam.reduce((sum, p) => sum + (p.level || 1), 0) / finalPlayerTeam.length);
    
    // Forzamos un equipo enemigo de EXACTAMENTE 6 Pokémon
    const enemyTeam = generateEnemyTeam(6, avgLevel);

    if (typeof startBattle === 'function') {
        startBattle(finalPlayerTeam, enemyTeam, 'strategy', (hasWon) => {
            if (hasWon) {
                awardTeamExperience(finalPlayerTeam);
            }
        });
    } else {
        console.error("La función startBattle no está disponible.");
    }
}

// La XP y las subidas de nivel ya se calculan, guardan y muestran en finishBattle() (combat.js).
// Aquí solo refrescamos la interfaz para no dar la experiencia dos veces.
function awardTeamExperience(winningTeam) {
    if (typeof renderInventory === 'function') renderInventory();
}
