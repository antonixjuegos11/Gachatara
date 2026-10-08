// modes.js - Modos de Combate sincronizados con el Inventario y Niveles reales

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

function generateEnemyTeam(playerTeam, count) {
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

// Función maestra para sincronizar el equipo del jugador directamente con el inventario (niveles reales)
function getSyncedPlayerTeam(storageKey, maxSlots) {
    let rawTeam = [];
    try {
        const saved = localStorage.getItem(storageKey);
        if (saved) rawTeam = JSON.parse(saved);
    } catch (e) {
        rawTeam = [];
    }

    // Si no hay equipo configurado, tomamos los primeros del inventario
    if ((!rawTeam || rawTeam.length === 0) && typeof userInventory !== 'undefined' && userInventory.length > 0) {
        rawTeam = userInventory.slice(0, maxSlots);
    }

    // Mapeamos cada Pokémon para asegurar que coge el Nivel y datos frescos del userInventory
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

    const teamSize = finalPlayerTeam.length; // Respetará 1, 2 o 3 según lo que tengas puesto
    const enemyTeam = generateEnemyTeam(finalPlayerTeam, teamSize);

    if (typeof startBattle === 'function') {
        startBattle(finalPlayerTeam, enemyTeam, 'quick', (hasWon) => {
            if (hasWon) awardTeamExperience(finalPlayerTeam, 50);
        });
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

    const teamSize = finalPlayerTeam.length; // Respetará de 1 a 6 según tu configuración
    const enemyTeam = generateEnemyTeam(finalPlayerTeam, teamSize);

    if (typeof startBattle === 'function') {
        startBattle(finalPlayerTeam, enemyTeam, 'strategy', (hasWon) => {
            if (hasWon) awardTeamExperience(finalPlayerTeam, 100);
        });
    }
}

// Sistema unificado de subida de experiencia y guardado en inventario
function awardTeamExperience(winningTeam, expAmount) {
    if (!winningTeam || winningTeam.length === 0 || typeof userInventory === 'undefined') return;

    winningTeam.forEach(pkmn => {
        let inventoryPkmn = userInventory.find(item => Number(item.id) === Number(pkmn.id));
        if (inventoryPkmn) {
            inventoryPkmn.level = inventoryPkmn.level || 1;
            if (inventoryPkmn.level < 100) {
                inventoryPkmn.level += 1; // Sube de nivel de forma permanente
            }
        }
    });

    if (typeof saveStorage === 'function') saveStorage();
    if (typeof renderInventory === 'function') renderInventory();
}