// modes.js - Modos de Combate corregidos (Enemigos fijos: 3 para Rápido, 6 para Estratégico y Exp persistente)

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

// Genera el equipo enemigo asegurando el tamaño fijo del modo (3 o 6)
function generateEnemyTeam(playerTeam, fixedSize) {
    let avgLevel = 1;
    if (playerTeam && playerTeam.length > 0) {
        const totalLevel = playerTeam.reduce((sum, p) => sum + (p.level || 1), 0);
        avgLevel = Math.max(1, Math.floor(totalLevel / playerTeam.length));
    }

    let team = [];
    for (let i = 0; i < fixedSize; i++) {
        team.push(getRandomEnemy(avgLevel));
    }
    return team;
}

// Sincroniza el equipo del jugador directamente con el inventario para rescatar sus niveles reales
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
// MODO RÁPIDO (3v3 - 3 Pokémon tuyos vs 3 del rival)
// -----------------------------------------
function startQuickBattle() {
    const finalPlayerTeam = getSyncedPlayerTeam('pokemon_active_team_fast', 3);

    if (!finalPlayerTeam || finalPlayerTeam.length === 0) {
        alert("¡No tienes Pokémon en tu equipo rápido ni en el inventario!");
        return;
    }

    // El rival SIEMPRE tendrá 3 Pokémon en Partida Rápida
    const enemyTeam = generateEnemyTeam(finalPlayerTeam, 3);

    if (typeof startBattle === 'function') {
        startBattle(finalPlayerTeam, enemyTeam, 'quick', (hasWon) => {
            if (hasWon) {
                awardTeamExperience(finalPlayerTeam);
            }
        });
    }
}

// -----------------------------------------
// MODO ESTRATÉGICO (6v6 - Tus 6 Pokémon vs 6 del rival)
// -----------------------------------------
function startStrategyBattle() {
    const finalPlayerTeam = getSyncedPlayerTeam('pokemon_active_team_strategy', 6);

    if (!finalPlayerTeam || finalPlayerTeam.length === 0) {
        alert("¡No tienes un Equipo Estratégico configurado! Ve a la pestaña 'Equipo' y añade hasta 6 Pokémon.");
        return;
    }

    // El rival SIEMPRE tendrá 6 Pokémon en Partida Estratégica
    const enemyTeam = generateEnemyTeam(finalPlayerTeam, 6);

    if (typeof startBattle === 'function') {
        startBattle(finalPlayerTeam, enemyTeam, 'strategy', (hasWon) => {
            if (hasWon) {
                awardTeamExperience(finalPlayerTeam);
            }
        });
    }
}

// Sistema de experiencia y subida de nivel persistente para ambos modos
function awardTeamExperience(winningTeam) {
    if (!winningTeam || winningTeam.length === 0 || typeof userInventory === 'undefined') return;

    winningTeam.forEach(pkmn => {
        let inventoryPkmn = userInventory.find(item => Number(item.id) === Number(pkmn.id));
        if (inventoryPkmn) {
            inventoryPkmn.level = inventoryPkmn.level || 1;
            if (inventoryPkmn.level < 100) {
                inventoryPkmn.level += 1; // Sube 1 nivel de forma permanente al ganar
            }
        }
    });

    // Guardar cambios en el almacenamiento local para que se reflejen en cualquier modo
    if (typeof saveStorage === 'function') {
        saveStorage();
    }
    if (typeof renderInventory === 'function') {
        renderInventory();
    }
}