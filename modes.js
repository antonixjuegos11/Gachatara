// modes.js - Modos de Combate (3v3 Rápido y 6v6 Estratégico)

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

// -----------------------------------------
// MODO RÁPIDO (3v3)
// -----------------------------------------
function startQuickBattle() {
    let playerTeam = [];
    const savedFastTeam = localStorage.getItem('pokemon_active_team_fast');
    
    if (savedFastTeam) {
        try { 
            let rawTeam = JSON.parse(savedFastTeam);
            // Sincronizamos con los datos más recientes del inventario (incluyendo el nivel real)
            playerTeam = rawTeam.map(p => {
                const realInvPkmn = userInventory.find(item => Number(item.id) === Number(p.id));
                return realInvPkmn ? { ...p, ...realInvPkmn } : p;
            });
        } catch (e) { playerTeam = []; }
    }

    if (!playerTeam || playerTeam.length === 0) {
        playerTeam = [{ id: 25, name: "Pikachu", level: 1, sprite: "..." }];
    }

    const teamSize = Math.min(3, playerTeam.length);
    const finalPlayerTeam = playerTeam.slice(0, teamSize);
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
    let playerTeam = [];

    const savedStrategyTeam = localStorage.getItem('pokemon_active_team_strategy');
    if (savedStrategyTeam) {
        try { playerTeam = JSON.parse(savedStrategyTeam); } catch (e) { playerTeam = []; }
    }

    if (!playerTeam || playerTeam.length === 0) {
        alert("¡No tienes un Equipo Estratégico configurado! Ve a la pestaña 'Equipo' y añade hasta 6 Pokémon.");
        return;
    }

    const teamSize = Math.min(6, playerTeam.length);
    const finalPlayerTeam = playerTeam.slice(0, teamSize);
    const enemyTeam = generateEnemyTeam(finalPlayerTeam, teamSize); // Genera 6 enemigos

    if (typeof startBattle === 'function') {
        startBattle(finalPlayerTeam, enemyTeam, 'strategy', (hasWon) => {
            if (hasWon) awardTeamExperience(finalPlayerTeam, 100); // Otorga EXP al ganar
        });
    }
}
// Sistema de subida de nivel (Máximo Nivel 100)
function awardTeamExperience(winningTeam, expAmount) {
    if (!winningTeam || winningTeam.length === 0) return;

    winningTeam.forEach(pkmn => {
        // Buscamos el Pokémon real dentro del inventario del usuario para actualizarlo de forma permanente
        let inventoryPkmn = userInventory.find(item => Number(item.id) === Number(pkmn.id));
        if (!inventoryPkmn) return;

        inventoryPkmn.level = inventoryPkmn.level || 1;
        
        if (inventoryPkmn.level < 100) {
            inventoryPkmn.level += 1; // Sube 1 nivel por victoria (puedes ajustar esto si prefieres una barra de EXP)
            if (inventoryPkmn.level > 100) inventoryPkmn.level = 100;
        }
    });

    // Guardamos los cambios en el almacenamiento local para que no se pierdan
    if (typeof saveStorage === 'function') {
        saveStorage();
    }
    if (typeof renderInventory === 'function') {
        renderInventory();
    }
}