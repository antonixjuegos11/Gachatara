// modes.js - Modos de combate: normal (3v3, 6v6), doble (4v4, 6v6), clasificatorio (individual y doble) e historia

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
// Nivel más alto del equipo del jugador
function getTopTeamLevel(team) {
    return Math.max(1, ...(team || []).map(p => Number(p.level) || 1));
}

// Los rivales tienen un nivel semejante al más fuerte (entre 0 y 2 niveles menos, mínimo 1, máximo 100)
function generateEnemyTeam(fixedSize, level = 1) {
    let team = [];
    for (let i = 0; i < fixedSize; i++) {
        const enemyLevel = Math.min(100, Math.max(1, level - Math.floor(Math.random() * 3)));
        team.push(getRandomEnemy(enemyLevel));
    }
    return team;
}

// Obtiene el equipo del jugador sincronizado con el inventario.
// Ya NO se rellena automáticamente con el inventario: hay que tener el equipo montado.
function getSyncedPlayerTeam(storageKey, maxSlots) {
    let rawTeam = [];
    try {
        const saved = localStorage.getItem(storageKey);
        if (saved) rawTeam = JSON.parse(saved);
    } catch (e) {
        rawTeam = [];
    }

    if (!Array.isArray(rawTeam)) return [];

    return rawTeam.slice(0, maxSlots).map(p => {
        if (typeof userInventory !== 'undefined') {
            const realInvPkmn = userInventory.find(item => Number(item.id) === Number(p.id));
            if (!realInvPkmn) return null; // ya no está en el inventario
            return { ...p, level: realInvPkmn.level || 1, xp: realInvPkmn.xp || 0, stars: realInvPkmn.stars || 0, perks: realInvPkmn.perks || {}, sprite: realInvPkmn.sprite || p.sprite };
        }
        return p;
    }).filter(Boolean);
}

// -----------------------------------------
// CONFIGURACIÓN DE MODOS
// -----------------------------------------
const TEAM_KEY_FAST = 'pokemon_active_team_fast';
const TEAM_KEY_STRATEGY = 'pokemon_active_team_strategy';
const TEAM_KEY_QUAD = 'pokemon_active_team_quad';
const RANKED_LEVEL = 50;

const MODE_CONFIG = {
    'quick':         { format: 'single', teamKey: TEAM_KEY_FAST,     teamName: 'Equipo Rápido',      size: 3, battleMode: 'quick',    options: {} },
    'strategy':      { format: 'single', teamKey: TEAM_KEY_STRATEGY, teamName: 'Equipo Estratégico', size: 6, battleMode: 'strategy', options: {} },
    'double6':       { format: 'double', teamKey: TEAM_KEY_STRATEGY, teamName: 'Equipo Estratégico', size: 6, battleMode: 'double',   options: { rewardCoins: 200 } },
    'double4':       { format: 'double', teamKey: TEAM_KEY_QUAD,     teamName: 'Equipo Doble (4)',   size: 4, battleMode: 'double',   options: { rewardCoins: 150 } },
    'ranked-single': { format: 'single', teamKey: TEAM_KEY_STRATEGY, teamName: 'Equipo Estratégico', size: 6, battleMode: 'ranked',   ranked: 'single', fixedLevel: RANKED_LEVEL, options: {} },
    'ranked-double': { format: 'double', teamKey: TEAM_KEY_STRATEGY, teamName: 'Equipo Estratégico', size: 6, battleMode: 'ranked',   ranked: 'double', fixedLevel: RANKED_LEVEL, options: {} }
};

// Rivales del clasificatorio: nivel fijo y estrellas según el rango del jugador
function generateRankedEnemyTeam(size, rankedKind) {
    const rankIdx = typeof getRankedState === 'function' ? getRankedState()[rankedKind].rank : 0;
    const stars = Math.min(7, rankIdx + (rankIdx >= 5 ? 1 : 0));
    const team = [];
    for (let i = 0; i < size; i++) team.push({ ...getRandomEnemy(RANKED_LEVEL), stars });
    return team;
}

function setCombatMenuVisible(visible) {
    const menu = document.getElementById('combat-menu');
    if (menu) menu.style.display = visible ? 'block' : 'none';
    if (visible) {
        const arena = document.getElementById('combat-arena-container');
        if (arena) arena.innerHTML = '';
        renderCombatMenu();
    }
}

function startMode(modeId) {
    const cfg = MODE_CONFIG[modeId];
    if (!cfg) return;

    let team = getSyncedPlayerTeam(cfg.teamKey, cfg.size);

    if (!team || team.length === 0) {
        alert(`¡Necesitas al menos 1 Pokémon en tu ${cfg.teamName} para luchar! Ve a la pestaña 'Equipo'.`);
        return;
    }
    if (cfg.format === 'double' && team.length < 2) {
        alert(`¡Un combate doble necesita al menos 2 Pokémon en tu ${cfg.teamName}! Ve a la pestaña 'Equipo'.`);
        return;
    }
    if (cfg.ranked && team.length < cfg.size) {
        alert(`¡El clasificatorio exige un equipo completo de ${cfg.size} Pokémon! Ahora tienes ${team.length} en tu ${cfg.teamName}.`);
        return;
    }
    if (cfg.format === 'single' && typeof startBattle !== 'function') { console.error('startBattle no está disponible.'); return; }
    if (cfg.format === 'double' && typeof startDoubleBattle !== 'function') { console.error('startDoubleBattle no está disponible.'); return; }

    let enemyTeam;
    if (cfg.fixedLevel) {
        // Competitivo: todos a nivel 50
        team = team.map(p => ({ ...p, level: cfg.fixedLevel }));
        enemyTeam = generateRankedEnemyTeam(cfg.size, cfg.ranked);
    } else {
        enemyTeam = generateEnemyTeam(cfg.size, getTopTeamLevel(team));
    }

    const options = Object.assign({}, cfg.options, { format: cfg.format, ranked: cfg.ranked || null, noXp: !!cfg.fixedLevel });
    const onEnd = (hasWon) => {
        if (hasWon) awardTeamExperience(team);
        setCombatMenuVisible(true);
    };

    setCombatMenuVisible(false);

    if (cfg.format === 'double') {
        const started = startDoubleBattle(team, enemyTeam, cfg.battleMode, onEnd, options);
        if (!started) setCombatMenuVisible(true);
    } else {
        startBattle(team, enemyTeam, cfg.battleMode, onEnd, options);
    }
}

// Accesos antiguos (el botón del lobby y otros)
function startQuickBattle() { startMode('quick'); }
function startStrategyBattle() { startMode('strategy'); }

// La XP y las subidas de nivel ya se calculan, guardan y muestran en finishBattle() (combat.js).
// Aquí solo refrescamos la interfaz para no dar la experiencia dos veces.
function awardTeamExperience(winningTeam) {
    if (typeof renderInventory === 'function') renderInventory();
}

// -----------------------------------------
// MENÚ DE COMBATE
// -----------------------------------------
function renderCombatMenu() {
    const menu = document.getElementById('combat-menu');
    if (!menu) return;

    const modeBtn = (id, title, sub) => `
        <button class="btn-pull" style="min-width: 190px;" onclick="startMode('${id}')">
            ${title}<span style="display: block; font-size: 11px; opacity: .8; font-weight: 400;">${sub}</span>
        </button>`;
    const sectionTitle = (text) => `<h3 style="font-family: 'Orbitron', sans-serif; color: #7bed9f; font-size: 0.95rem; margin: 22px 0 10px 0;">${text}</h3>`;
    const row = 'display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;';

    menu.innerHTML = `
        <div style="text-align: center; padding: 10px;">
            <h2 style="font-family: 'Orbitron', sans-serif; color: #00f2fe; margin-bottom: 4px;">MODOS DE COMBATE</h2>

            ${sectionTitle('⚔️ COMBATE NORMAL')}
            <div class="gacha-buttons" style="${row}">
                ${modeBtn('quick', '3 vs 3', 'Equipo Rápido')}
                ${modeBtn('strategy', '6 vs 6', 'Equipo Estratégico')}
            </div>

            ${sectionTitle('👥 COMBATE DOBLE')}
            <div class="gacha-buttons" style="${row}">
                ${modeBtn('double6', '6 vs 6 (doble)', 'Equipo Estratégico')}
                ${modeBtn('double4', '4 vs 4 (doble)', 'Equipo Doble (4)')}
            </div>

            ${sectionTitle('🏆 CLASIFICATORIO (todos a nivel 50)')}
            <div style="${row}">
                ${typeof renderRankedCard === 'function' ? renderRankedCard('single') + renderRankedCard('double') : ''}
            </div>

            ${sectionTitle('📖 MODO HISTORIA')}
            <div class="gacha-buttons" style="${row}">
                <button class="btn-pull" style="min-width: 190px; opacity: .5; cursor: not-allowed;" disabled title="Próximamente">
                    📖 Modo Historia<span style="display: block; font-size: 11px; font-weight: 400;">Próximamente</span>
                </button>
            </div>
        </div>`;
}

document.addEventListener('DOMContentLoaded', renderCombatMenu);
