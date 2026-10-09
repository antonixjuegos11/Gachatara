// combat.js - Motor de Combate con Estados Traducidos y Efectos Visuales

// =========================================
// ESTADO Y CONFIGURACIÓN DEL COMBATE
// =========================================

const CombatState = {
    playerTeam: [],
    enemyTeam: [],
    activePlayerIndex: 0,
    activeEnemyIndex: 0,
    turn: 'player', // 'player' | 'enemy' | 'animating'
    isBattleOver: false,
    mode: 'quick', // 'quick' | 'story' | 'ranked'
    onBattleEndCallback: null,
    logHistory: []
};

// Diccionario de traducción de estados al español
const STATUS_TRANSLATIONS = {
    "paralyzed": "paralizado",
    "burned": "quemado",
    "poisoned": "envenenado",
    "frozen": "congelado",
    "asleep": "dormido"
};

// Tabla elemental completa en español
const TYPE_CHART = {
    Normal:   { Roca: 0.5, Fantasma: 0, Acero: 0.5 },
    Fuego:    { Fuego: 0.5, Agua: 0.5, Planta: 2.0, Hielo: 2.0, Bicho: 2.0, Roca: 0.5, Dragón: 0.5, Acero: 2.0 },
    Agua:     { Fuego: 2.0, Agua: 0.5, Planta: 0.5, Tierra: 2.0, Roca: 2.0, Dragón: 0.5 },
    Planta:   { Fuego: 0.5, Agua: 2.0, Planta: 0.5, Veneno: 0.5, Tierra: 2.0, Volador: 0.5, Bicho: 0.5, Roca: 2.0, Dragón: 0.5, Acero: 0.5 },
    Eléctrico:{ Agua: 2.0, Planta: 0.5, Eléctrico: 0.5, Tierra: 0, Volador: 2.0, Dragón: 0.5 },
    Hielo:    { Fuego: 0.5, Agua: 0.5, Planta: 2.0, Hielo: 0.5, Tierra: 2.0, Volador: 2.0, Dragón: 2.0, Acero: 0.5 },
    Lucha:    { Normal: 2.0, Hielo: 2.0, Veneno: 0.5, Volador: 0.5, Psíquico: 0.5, Bicho: 0.5, Roca: 2.0, Fantasma: 0, Siniestro: 2.0, Acero: 2.0, Hada: 0.5 },
    Veneno:   { Planta: 2.0, Veneno: 0.5, Tierra: 0.5, Roca: 0.5, Fantasma: 0.5, Acero: 0, Hada: 2.0 },
    Tierra:   { Fuego: 2.0, Eléctrico: 2.0, Planta: 0.5, Veneno: 2.0, Volador: 0, Bicho: 0.5, Roca: 2.0, Acero: 2.0 },
    Volador:  { Planta: 2.0, Eléctrico: 0.5, Lucha: 2.0, Bicho: 2.0, Roca: 0.5, Acero: 0.5 },
    Psíquico: { Lucha: 2.0, Veneno: 2.0, Psíquico: 0.5, Siniestro: 0, Acero: 0.5 },
    Bicho:    { Fuego: 0.5, Planta: 2.0, Lucha: 0.5, Veneno: 0.5, Volador: 0.5, Psíquico: 2.0, Fantasma: 0.5, Siniestro: 2.0, Acero: 0.5, Hada: 0.5 },
    Roca:     { Fuego: 2.0, Hielo: 2.0, Lucha: 0.5, Tierra: 0.5, Volador: 2.0, Bicho: 2.0, Acero: 0.5 },
    Fantasma: { Normal: 0, Psíquico: 2.0, Fantasma: 2.0, Siniestro: 0.5 },
    Dragón:   { Dragón: 2.0, Acero: 0.5, Hada: 0 },
    Siniestro:{ Lucha: 0.5, Psíquico: 2.0, Fantasma: 2.0, Siniestro: 0.5, Hada: 0.5 },
    Acero:    { Fuego: 0.5, Agua: 0.5, Eléctrico: 0.5, Hielo: 2.0, Roca: 2.0, Acero: 0.5, Hada: 2.0 },
    Hada:     { Fuego: 0.5, Lucha: 2.0, Veneno: 0.5, Dragón: 2.0, Siniestro: 2.0, Acero: 0.5 }
};

/**
 * Normaliza nombres de tipos para asegurar coincidencias con TYPE_CHART
 */
function normalizeType(typeStr) {
    if (!typeStr) return "Normal";
    const clean = typeStr.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    
    const typeMap = {
        normal: "Normal", fuego: "Fuego", agua: "Agua", planta: "Planta",
        electrico: "Eléctrico", hielo: "Hielo", lucha: "Lucha", veneno: "Veneno",
        tierra: "Tierra", volador: "Volador", psiquico: "Psíquico", bicho: "Bicho",
        roca: "Roca", fantasma: "Fantasma", dragon: "Dragón", siniestro: "Siniestro",
        acero: "Acero", hada: "Hada"
    };

    return typeMap[clean] || "Normal";
}

/**
 * Obtiene el multiplicador acumulado evaluando todos los tipos del defensor
 */
function getTypeEffectiveness(moveType, target) {
    if (!moveType || !target) return 1.0;

    const atkType = normalizeType(moveType);
    let targetTypes = target.types || (target.type ? [target.type] : ['Normal']);
    if (!Array.isArray(targetTypes)) targetTypes = [targetTypes];

    let totalMult = 1.0;

    targetTypes.forEach(t => {
        const defType = normalizeType(t);
        if (TYPE_CHART[atkType] && TYPE_CHART[atkType][defType] !== undefined) {
            totalMult *= TYPE_CHART[atkType][defType];
        }
    });

    return totalMult;
}

function getEffectivenessLabel(mult) {
    if (mult >= 2.0) return { text: "💥 SuperEfectivo", class: "eff-super" };
    if (mult === 0) return { text: "🚫 Inmune", class: "eff-immune" };
    if (mult < 1.0) return { text: "🛡️ Poco Efectivo", class: "eff-weak" };
    return { text: "", class: "" };
}

// =========================================
// INICIALIZACIÓN Y PREPARACIÓN
// =========================================

function prepareCombatUnit(pkmn, level = 1) {
    if (!pkmn) return null;

    let pkmnTypes = pkmn.types || (pkmn.type ? [pkmn.type] : ['Normal']);
    let base = pkmn.baseStats;
    let ability = pkmn.ability || 'none';
    const currentLevel = pkmn.level || level || 1;

    if ((!base || ability === 'none') && typeof DATABASE !== 'undefined') {
        for (const cat in DATABASE) {
            const found = DATABASE[cat].find(p => p.id === pkmn.id || p.name.toLowerCase() === pkmn.name.toLowerCase());
            if (found) {
                if (found.baseStats) base = found.baseStats;
                if (found.types && found.types.length > 0) pkmnTypes = found.types;
                if (found.ability) ability = found.ability;
                break;
            }
        }
    }

    if (!base) {
        base = { hp: 45, attack: 49, defense: 49, spAtk: 65, spDef: 65, speed: 45 };
    }

    const starMultiplier = 1 + ((pkmn.stars || 0) * 0.10);

    const maxHp = Math.floor(((((2 * base.hp) * currentLevel) / 100) + currentLevel + 10) * starMultiplier);
    const attack = Math.floor(((((2 * base.attack) * currentLevel) / 100) + 5) * starMultiplier);
    const defense = Math.floor(((((2 * base.defense) * currentLevel) / 100) + 5) * starMultiplier);
    const spAtk = Math.floor(((((2 * base.spAtk) * currentLevel) / 100) + 5) * starMultiplier);
    const spDef = Math.floor(((((2 * base.spDef) * currentLevel) / 100) + 5) * starMultiplier);
    const speed = Math.floor(((((2 * base.speed) * currentLevel) / 100) + 5) * starMultiplier);

    const primaryType = pkmnTypes[0];
    const secondaryType = pkmnTypes[1] || primaryType;

    const typeEffects = {
        "Fuego": { status: "burned", chance: 0.25 },
        "Eléctrico": { status: "paralyzed", chance: 0.3 },
        "Veneno": { status: "poisoned", chance: 0.4 },
        "Hielo": { status: "frozen", chance: 0.15 },
        "Planta": { status: "poisoned", chance: 0.25 }
    };

    const effectData = typeEffects[primaryType] || { status: null, chance: 0 };

    const dynamicMoves = [
        { 
            name: `Ataque ${primaryType}`, 
            type: primaryType, 
            power: 40, 
            isSpecial: false, 
            energyGain: 25, 
            cost: 0,
            statusEffect: effectData.status,
            statusChance: effectData.chance
        },
        { 
            name: `Especial ${secondaryType}`, 
            type: secondaryType, 
            power: 90, 
            isSpecial: true, 
            energyGain: 0, 
            cost: 50
        },
        { 
            name: 'Habilidad Defensiva', 
            type: 'Normal', 
            power: 0, 
            shield: 0.3, 
            energyGain: 15, 
            cost: 30 
        }
    ];

    return {
        ...pkmn,
        level: currentLevel,
        maxHp,
        currentHp: pkmn.currentHp !== undefined ? pkmn.currentHp : maxHp,
        attack,
        defense,
        spAtk,
        spDef,
        speed,
        energy: pkmn.energy || 0,
        maxEnergy: 100,
        types: pkmnTypes,
        type: primaryType,
        ability,
        status: pkmn.status || null,
        moves: dynamicMoves
    };
}

function startBattle(playerUnits, enemyUnits, mode = 'quick', onEndCallback = null) {
    let resolvedTeam = playerUnits;
    if (!resolvedTeam || resolvedTeam.length <= 1) {
        const activeStrategyKey = 'pokemon_active_team_strategy';
        const activeFastKey = 'pokemon_active_team_fast';
        
        let savedTeam = [];
        try {
            if (mode === 'strategy') {
                savedTeam = JSON.parse(localStorage.getItem(activeStrategyKey) || '[]');
            } else {
                savedTeam = JSON.parse(localStorage.getItem(activeFastKey) || '[]');
            }
            if (savedTeam.length === 0) {
                savedTeam = JSON.parse(localStorage.getItem(activeFastKey) || localStorage.getItem(activeStrategyKey) || '[]');
            }
        } catch(e) {
            savedTeam = [];
        }

        if (savedTeam.length > 0) {
            resolvedTeam = savedTeam;
        }
    }

    if (!resolvedTeam || resolvedTeam.length === 0) {
        resolvedTeam = playerUnits;
    }

    CombatState.playerTeam = resolvedTeam.map(p => prepareCombatUnit(p, p.level || 1));
    CombatState.enemyTeam = enemyUnits.map(p => prepareCombatUnit(p, p.level || 1));
    CombatState.activePlayerIndex = 0;
    CombatState.activeEnemyIndex = 0;
    CombatState.isBattleOver = false;
    CombatState.mode = mode;
    CombatState.onBattleEndCallback = onEndCallback;
    CombatState.logHistory = [];

    const pActive = CombatState.playerTeam[0];
    const eActive = CombatState.enemyTeam[0];

    CombatState.turn = pActive.speed >= eActive.speed ? 'player' : 'enemy';

    renderCombatArena();
    addCombatLog(`¡Empieza la batalla en modo ${mode.toUpperCase()}!`);
    addCombatLog(`${pActive.name} vs ${eActive.name}`);

    if (typeof triggerAbility === 'function') {
        const pEnterMsg = triggerAbility('onEnter', pActive, eActive, null, 0, CombatState);
        if (pEnterMsg) addCombatLog(pEnterMsg);

        const eEnterMsg = triggerAbility('onEnter', eActive, pActive, null, 0, CombatState);
        if (eEnterMsg) addCombatLog(eEnterMsg);
    }

    if (CombatState.turn === 'enemy') {
        setTimeout(executeEnemyTurn, 1000);
    }
}

// =========================================
// GESTIÓN DE ESTADOS ALTERADOS EN TURNO
// =========================================

function processStatusBeforeTurn(unit) {
    if (!unit || !unit.status) return false;

    const statusNameEs = STATUS_TRANSLATIONS[unit.status] || unit.status;

    if (unit.status === "poisoned" || unit.status === "burned") {
        const statusDamage = Math.max(1, Math.floor(unit.maxHp * 0.1));
        unit.currentHp = Math.max(0, unit.currentHp - statusDamage);
        addCombatLog(`⚠️ ${unit.name} sufre por su estado (${statusNameEs}) y pierde ${statusDamage} HP.`);
    }

    if (unit.status === "paralyzed" && Math.random() < 0.25) {
        addCombatLog(`⚡ ¡${unit.name} está tan paralizado que no puede moverse!`);
        return true;
    }

    return false;
}

// =========================================
// LÓGICA DE ATAQUE Y CÁLCULO DE DAÑO
// =========================================

window.executePlayerMove = function(moveIndex) {
    if (CombatState.isBattleOver) return;

    if (CombatState.turn !== 'player') {
        CombatState.turn = 'player';
    }

    const attacker = CombatState.playerTeam[CombatState.activePlayerIndex];
    const defender = CombatState.enemyTeam[CombatState.activeEnemyIndex];

    if (!attacker || !defender) return;

    if (processStatusBeforeTurn(attacker)) {
        updateCombatUI();
        if (attacker.currentHp <= 0) {
            setTimeout(handlePlayerFaint, 1000);
        } else {
            setTimeout(endTurn, 1200);
        }
        return;
    }

    const move = attacker.moves[moveIndex];
    if (!move) return;

    if (move.cost > attacker.energy) {
        addCombatLog(`¡No hay suficiente energía para ${move.name}!`);
        return;
    }

    CombatState.turn = 'animating';
    attacker.energy -= move.cost;

    if (move.power === 0) {
        const healAmount = Math.floor(attacker.maxHp * (move.shield || 0.2));
        attacker.currentHp = Math.min(attacker.maxHp, attacker.currentHp + healAmount);
        addCombatLog(`✨ ${attacker.name} usó ${move.name} y recuperó +${healAmount} HP.`);
        triggerUnitAnimation('player-card', 'buff');
        updateCombatUI();

        setTimeout(endTurn, 1200);
        return;
    }

    const damageResult = calculateDamage(attacker, defender, move);
    defender.currentHp = Math.max(0, defender.currentHp - damageResult.damage);
    attacker.energy = Math.min(attacker.maxEnergy, attacker.energy + move.energyGain);

    if (move.statusEffect && !defender.status && Math.random() < (move.statusChance || 0.2)) {
        defender.status = move.statusEffect;
        const statusNameEs = STATUS_TRANSLATIONS[move.statusEffect] || move.statusEffect;
        addCombatLog(`🦠 ¡${defender.name} ha quedado ${statusNameEs}!`);
    }

    triggerUnitAnimation('player-card', 'attack');
    triggerUnitAnimation('enemy-card', 'hit');
    showFloatingDamage('enemy-card', damageResult.damage, damageResult.isCrit, damageResult.effMessage);

    let logText = `⚔️ ${attacker.name} usó ${move.name} e infligió ${damageResult.damage} de daño.`;
    if (damageResult.isCrit) logText += " ¡CRÍTICO!";
    if (damageResult.effMessage) logText += ` (${damageResult.effMessage})`;
    addCombatLog(logText);

    updateCombatUI();

    if (defender.currentHp <= 0) {
        setTimeout(handleEnemyFaint, 1000);
    } else {
        setTimeout(endTurn, 1200);
    }
};

function executeEnemyTurn() {
    if (CombatState.isBattleOver) return;

    const attacker = CombatState.enemyTeam[CombatState.activeEnemyIndex];
    const defender = CombatState.playerTeam[CombatState.activePlayerIndex];

    if (!attacker || !defender) return;

    if (processStatusBeforeTurn(attacker)) {
        updateCombatUI();
        if (attacker.currentHp <= 0) {
            setTimeout(handleEnemyFaint, 1000);
        } else {
            setTimeout(() => {
                CombatState.turn = 'player';
                updateCombatUI();
            }, 1200);
        }
        return;
    }

    let selectedMove = attacker.moves[0];
    if (attacker.energy >= 50 && attacker.moves[1]) {
        selectedMove = attacker.moves[1];
    }

    attacker.energy -= selectedMove.cost;

    const damageResult = calculateDamage(attacker, defender, selectedMove);
    defender.currentHp = Math.max(0, defender.currentHp - damageResult.damage);
    attacker.energy = Math.min(attacker.maxEnergy, attacker.energy + selectedMove.energyGain);

    if (selectedMove.statusEffect && !defender.status && Math.random() < (selectedMove.statusChance || 0.2)) {
        defender.status = selectedMove.statusEffect;
        const statusNameEs = STATUS_TRANSLATIONS[selectedMove.statusEffect] || selectedMove.statusEffect;
        addCombatLog(`🦠 ¡Tu ${defender.name} ha quedado ${statusNameEs}!`);
    }

    triggerUnitAnimation('enemy-card', 'attack');
    triggerUnitAnimation('player-card', 'hit');
    showFloatingDamage('player-card', damageResult.damage, damageResult.isCrit, damageResult.effMessage);

    let logText = `🔴 ${attacker.name} enemigo usó ${selectedMove.name} e infligió ${damageResult.damage} de daño.`;
    if (damageResult.isCrit) logText += " ¡CRÍTICO!";
    if (damageResult.effMessage) logText += ` (${damageResult.effMessage})`;
    addCombatLog(logText);

    updateCombatUI();

    if (defender.currentHp <= 0) {
        setTimeout(handlePlayerFaint, 1000);
    } else {
        setTimeout(() => {
            CombatState.turn = 'player';
            updateCombatUI();
        }, 1200);
    }
}

function endTurn() {
    if (CombatState.isBattleOver) return;

    if (typeof triggerAbility === 'function') {
        const pTurnMsg = triggerAbility('onTurnEnd', CombatState.playerTeam[CombatState.activePlayerIndex], CombatState.enemyTeam[CombatState.activeEnemyIndex]);
        if (pTurnMsg) addCombatLog(pTurnMsg);

        const eTurnMsg = triggerAbility('onTurnEnd', CombatState.enemyTeam[CombatState.activeEnemyIndex], CombatState.playerTeam[CombatState.activePlayerIndex]);
        if (eTurnMsg) addCombatLog(eTurnMsg);
    }

    CombatState.turn = 'enemy';
    updateCombatUI();
    setTimeout(executeEnemyTurn, 1000);
}

function calculateDamage(attacker, defender, move) {
    const isCrit = Math.random() < 0.0625;
    const critMult = isCrit ? 1.5 : 1.0;

    const atkType = move.type || attacker.type || 'Normal';
    const elementMult = getTypeEffectiveness(atkType, defender);
    const effInfo = getEffectivenessLabel(elementMult);

    if (elementMult === 0) {
        return { damage: 0, isCrit: false, effMessage: effInfo.text, elementMult };
    }

    let atkStat = move.isSpecial ? attacker.spAtk : attacker.attack;
    const defStat = move.isSpecial ? defender.spDef : defender.defense;

    if (attacker.status === "burned" && !move.isSpecial) {
        atkStat = Math.floor(atkStat * 0.5);
    }

    const hasSTAB = attacker.types && attacker.types.includes(atkType) ? 1.5 : 1.0;
    const levelFactor = ((2 * attacker.level) / 5) + 2;
    const baseDamage = ((levelFactor * move.power * (atkStat / defStat)) / 50) + 2;
    const variation = (Math.floor(Math.random() * 16) + 85) / 100;

    let finalDamage = Math.max(1, Math.floor(baseDamage * critMult * elementMult * hasSTAB * variation));

    if (typeof triggerAbility === 'function') {
        const atkAbility = triggerAbility('onDamage', attacker, defender, move, finalDamage, CombatState);
        if (atkAbility) {
            finalDamage = atkAbility.damage;
            if (atkAbility.message) addCombatLog(atkAbility.message);
        }

        const defAbility = triggerAbility('onReceiveDamage', defender, attacker, move, finalDamage, CombatState);
        if (defAbility) {
            finalDamage = defAbility.damage;
            if (defAbility.message) addCombatLog(defAbility.message);
        }
    }

    return { damage: finalDamage, isCrit, effMessage: effInfo.text, elementMult };
}

// =========================================
// PANEL LATERAL DE CAMBIO DE POKÉMON
// =========================================

window.openTeamSwitchModal = function() {
    if (CombatState.isBattleOver || CombatState.turn !== 'player') return;

    let modal = document.getElementById('team-switch-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'team-switch-modal';
        modal.className = 'combat-side-drawer';
        document.body.appendChild(modal);
    }

    let listHtml = CombatState.playerTeam.map((pkmn, idx) => {
        const isCurrent = idx === CombatState.activePlayerIndex;
        const isFainted = pkmn.currentHp <= 0;
        let statusBadge = pkmn.status ? ` [${STATUS_TRANSLATIONS[pkmn.status] || pkmn.status}]` : '';

        return `
            <div class="side-drawer-slot ${isCurrent ? 'current' : ''} ${isFainted ? 'fainted' : ''}" 
                 onclick="${!isCurrent && !isFainted ? `window.executeTeamSwitch(${idx})` : ''}">
                <img src="${pkmn.sprite || (pkmn.sprites ? pkmn.sprites.front : '')}" width="40" height="40" alt="${pkmn.name}">
                <div class="side-slot-info">
                    <strong>${pkmn.name}${statusBadge}</strong><br>
                    <small>Nv. ${pkmn.level || 1} | HP: ${pkmn.currentHp}/${pkmn.maxHp}</small>
                </div>
                ${isCurrent ? '<span class="badge-tag active">En combate</span>' : ''}
                ${isFainted ? '<span class="badge-tag fainted">K.O.</span>' : ''}
            </div>
        `;
    }).join('');

    modal.innerHTML = `
        <div class="side-drawer-header">
            <h4>🔄 Cambiar Pokémon</h4>
            <button class="btn-close-drawer" onclick="document.getElementById('team-switch-modal').style.display='none'">✕</button>
        </div>
        <div class="side-drawer-list">
            <p style="font-size:11px; color:#aaa; margin-bottom:8px;">Selecciona el Pokémon que deseas enviar a la batalla:</p>
            ${listHtml}
        </div>
        <button class="btn-cancel-drawer" onclick="document.getElementById('team-switch-modal').style.display='none'">Cancelar</button>
    `;
    modal.style.display = 'block';
};

window.executeTeamSwitch = function(newIndex) {
    const modal = document.getElementById('team-switch-modal');
    if (modal) modal.style.display = 'none';

    const oldPokemon = CombatState.playerTeam[CombatState.activePlayerIndex];
    const newPokemon = CombatState.playerTeam[newIndex];

    if (!newPokemon || newPokemon.currentHp <= 0 || newIndex === CombatState.activePlayerIndex) return;

    CombatState.activePlayerIndex = newIndex;
    addCombatLog(`🔄 ¡Retiramos a ${oldPokemon.name}, adelante ${newPokemon.name}!`);

    if (typeof triggerAbility === 'function') {
        const pEnterMsg = triggerAbility('onEnter', newPokemon, CombatState.enemyTeam[CombatState.activeEnemyIndex], null, 0, CombatState);
        if (pEnterMsg) addCombatLog(pEnterMsg);
    }

    renderCombatArena();

    CombatState.turn = 'enemy';
    updateCombatUI();
    setTimeout(executeEnemyTurn, 1000);
};

// =========================================
// SUSTITUCIONES Y FIN DE COMBATE (LIMPIO Y UNIFICADO)
// =========================================

function handlePlayerFaint() {
    const currentPkmn = CombatState.playerTeam[CombatState.activePlayerIndex];
    addCombatLog(`💀 ¡Tu ${currentPkmn.name} se ha debilitado!`);
    
    currentPkmn.currentHp = 0;

    let nextIndex = -1;
    for (let i = 0; i < CombatState.playerTeam.length; i++) {
        if (CombatState.playerTeam[i].currentHp > 0) {
            nextIndex = i;
            break;
        }
    }

    if (nextIndex === -1) {
        finishBattle(false);
    } else {
        CombatState.activePlayerIndex = nextIndex;
        const newPlayer = CombatState.playerTeam[CombatState.activePlayerIndex];
        addCombatLog(`⚠️ ¡Adelante, ${newPlayer.name}!`);

        if (typeof triggerAbility === 'function') {
            const pEnterMsg = triggerAbility('onEnter', newPlayer, CombatState.enemyTeam[CombatState.activeEnemyIndex], null, 0, CombatState);
            if (pEnterMsg) addCombatLog(pEnterMsg);
        }

        CombatState.turn = 'player';
        renderCombatArena();
    }
}

function handleEnemyFaint() {
    const currentEnemy = CombatState.enemyTeam[CombatState.activeEnemyIndex];
    addCombatLog(`💀 ¡El ${currentEnemy.name} enemigo ha sido derrotado!`);
    
    currentEnemy.currentHp = 0;
    CombatState.activeEnemyIndex++;

    if (CombatState.activeEnemyIndex >= CombatState.enemyTeam.length) {
        finishBattle(true);
    } else {
        const newEnemy = CombatState.enemyTeam[CombatState.activeEnemyIndex];
        addCombatLog(`⚠️ ¡El rival envía a ${newEnemy.name}!`);

        if (typeof triggerAbility === 'function') {
            const eEnterMsg = triggerAbility('onEnter', newEnemy, CombatState.playerTeam[CombatState.activePlayerIndex], null, 0, CombatState);
            if (eEnterMsg) addCombatLog(eEnterMsg);
        }

        CombatState.turn = 'player';
        renderCombatArena();
    }
}

function finishBattle(hasPlayerWon) {
    CombatState.isBattleOver = true;
    CombatState.turn = 'none';

    if (hasPlayerWon) {
        addCombatLog(`🏆 ¡VICTORIA! Has ganado la batalla.`);
        
        // Aplicar experiencia ganada a todo el equipo participante de forma persistente
        if (typeof awardTeamExperience === 'function') {
            awardTeamExperience(CombatState.playerTeam);
        } else if (typeof userInventory !== 'undefined') {
            CombatState.playerTeam.forEach(pkmn => {
                let inv = userInventory.find(i => Number(i.id) === Number(pkmn.id));
                if (inv) {
                    inv.level = Math.min(100, (inv.level || 1) + 1);
                }
            });
            if (typeof saveStorage === 'function') saveStorage();
            if (typeof renderInventory === 'function') renderInventory();
        }

        awardRewards();
    } else {
        addCombatLog(`❌ DERROTA. Tu equipo ha sido vencido.`);
    }

    updateCombatUI();

    if (typeof CombatState.onBattleEndCallback === 'function') {
        CombatState.onBattleEndCallback(hasPlayerWon, CombatState.mode);
    }
}

function awardRewards() {
    const currencies = typeof getCurrencies === 'function' ? getCurrencies() : { coins: 0, tickets: 0 };
    let coinReward = 100;
    let ticketReward = 0;

    if (CombatState.mode === 'story') coinReward = 250;
    if (CombatState.mode === 'ranked') { coinReward = 300; ticketReward = 1; }

    currencies.coins = (currencies.coins || 0) + coinReward;
    currencies.tickets = (currencies.tickets || 0) + ticketReward;

    if (typeof saveCurrencies === 'function') {
        saveCurrencies(currencies);
    }

    addCombatLog(`🎁 Recompensas: +${coinReward} Monedas ${ticketReward > 0 ? `y +${ticketReward} Ticket(s)` : ''}`);
}

// =========================================
// RENDERIZADO E INTERFAZ GRÁFICA (CON FILTROS DE ESTADO)
// =========================================

function getStatusFilterStyle(status) {
    if (!status) return '';
    switch (status) {
        case 'paralyzed': return 'filter: drop-shadow(0 0 8px yellow) sepia(1) saturate(5) hue-rotate(10deg);';
        case 'burned': return 'filter: drop-shadow(0 0 8px orange) sepia(1) saturate(4) hue-rotate(-30deg);';
        case 'poisoned': return 'filter: drop-shadow(0 0 8px purple) sepia(1) saturate(3) hue-rotate(220deg);';
        case 'frozen': return 'filter: drop-shadow(0 0 8px cyan) sepia(1) saturate(3) hue-rotate(140deg);';
        default: return '';
    }
}

function renderCombatArena() {
    const container = document.getElementById('combat-arena-container') || 
                      document.getElementById('tab-combate') || 
                      document.getElementById('tab-combat');
                      
    if (!container) return;

    const player = CombatState.playerTeam[CombatState.activePlayerIndex];
    const enemy = CombatState.enemyTeam[CombatState.activeEnemyIndex];

    const playerImg = player.sprite || (player.sprites ? player.sprites.front : '') || '';
    const enemyImg = enemy.sprite || (enemy.sprites ? enemy.sprites.front : '') || '';

    const playerTypeLabel = (player.types || [player.type || 'Normal']).join(' / ');
    const enemyTypeLabel = (enemy.types || [enemy.type || 'Normal']).join(' / ');

    const playerStatusText = player.status ? ` [${STATUS_TRANSLATIONS[player.status] || player.status}]` : '';
    const enemyStatusText = enemy.status ? ` [${STATUS_TRANSLATIONS[enemy.status] || enemy.status}]` : '';

    const playerFilter = getStatusFilterStyle(player.status);
    const enemyFilter = getStatusFilterStyle(enemy.status);

    container.innerHTML = `
        <div class="combat-arena">
            <!-- POKÉMON JUGADOR -->
            <div class="combat-card player-card" id="player-card">
                <div class="unit-info">
                    <span class="unit-name">${player.name}${playerStatusText} (Nv. ${player.level || 1})</span>
                    <span class="unit-type ${(player.types ? player.types[0] : player.type || 'normal').toLowerCase()}">${playerTypeLabel}</span>
                </div>
                <div class="hp-bar-container">
                    <div class="hp-bar-fill" id="player-hp-fill" style="width: ${(player.currentHp / player.maxHp) * 100}%"></div>
                </div>
                <div class="hp-text" id="player-hp-text">${player.currentHp} / ${player.maxHp} HP</div>
                
                <div class="energy-bar-container">
                    <div class="energy-bar-fill" id="player-energy-fill" style="width: ${(player.energy / player.maxEnergy) * 100}%"></div>
                </div>

                <div class="sprite-box">
                    <img id="player-sprite" src="${playerImg}" alt="${player.name}" style="${playerFilter}">
                </div>
            </div>

            <div class="combat-vs-badge">VS</div>

            <!-- POKÉMON ENEMIGO -->
            <div class="combat-card enemy-card" id="enemy-card">
                <div class="unit-info">
                    <span class="unit-name">${enemy.name}${enemyStatusText} (Nv. ${enemy.level || 1})</span>
                    <span class="unit-type ${(enemy.types ? enemy.types[0] : enemy.type || 'normal').toLowerCase()}">${enemyTypeLabel}</span>
                </div>
                <div class="hp-bar-container">
                    <div class="hp-bar-fill" id="enemy-hp-fill" style="width: ${(enemy.currentHp / enemy.maxHp) * 100}%"></div>
                </div>
                <div class="hp-text" id="enemy-hp-text">${enemy.currentHp} / ${enemy.maxHp} HP</div>
                
                <div class="sprite-box">
                    <img id="enemy-sprite" src="${enemyImg}" alt="${enemy.name}" style="${enemyFilter}">
                </div>
            </div>
        </div>

        <!-- PANEL DE ACCIONES -->
        <div class="combat-controls">
            <div class="moves-grid" id="moves-grid">
                ${player.moves.map((move, idx) => {
                    const effMult = move.power > 0 ? getTypeEffectiveness(move.type, enemy) : 1.0;
                    const effLabel = move.power > 0 ? getEffectivenessLabel(effMult) : { text: '', class: '' };

                    return `
                        <button class="btn-move" onclick="window.executePlayerMove(${idx})" ${CombatState.turn !== 'player' || player.energy < move.cost ? 'disabled' : ''}>
                            <span class="move-name">${move.name} (${move.type})</span>
                            <span class="move-cost">${move.cost > 0 ? `⚡ ${move.cost}` : 'Gratis'}</span>
                            ${effLabel.text ? `<span class="move-eff ${effLabel.class}">${effLabel.text}</span>` : ''}
                        </button>
                    `;
                }).join('')}

                <!-- Botón de cambio integrado con el mismo formato -->
                <button class="btn-move btn-switch-action" onclick="window.openTeamSwitchModal()" ${CombatState.turn !== 'player' ? 'disabled' : ''}>
                    <span class="move-name">🔄 Cambiar Pokémon</span>
                    <span class="move-cost">Equipo</span>
                </button>
            </div>
        </div>

        <div class="combat-log-box" id="combat-log-box"></div>
    `;

    updateCombatUI();
}

function updateCombatUI() {
    const player = CombatState.playerTeam[CombatState.activePlayerIndex];
    const enemy = CombatState.enemyTeam[CombatState.activeEnemyIndex];

    if (!player || !enemy) return;

    const pHpPct = Math.max(0, (player.currentHp / player.maxHp) * 100);
    const eHpPct = Math.max(0, (enemy.currentHp / enemy.maxHp) * 100);

    const pHpFill = document.getElementById('player-hp-fill');
    const eHpFill = document.getElementById('enemy-hp-fill');
    if (pHpFill) pHpFill.style.width = `${pHpPct}%`;
    if (eHpFill) eHpFill.style.width = `${eHpPct}%`;

    const pHpText = document.getElementById('player-hp-text');
    const eHpText = document.getElementById('enemy-hp-text');
    if (pHpText) pHpText.innerText = `${player.currentHp} / ${player.maxHp} HP`;
    if (eHpText) eHpText.innerText = `${enemy.currentHp} / ${enemy.maxHp} HP`;

    const pEnergyFill = document.getElementById('player-energy-fill');
    if (pEnergyFill) pEnergyFill.style.width = `${(player.energy / player.maxEnergy) * 100}%`;

    const playerCardName = document.querySelector('.player-card .unit-name');
    const enemyCardName = document.querySelector('.enemy-card .unit-name');
    const playerImgElem = document.getElementById('player-sprite');
    const enemyImgElem = document.getElementById('enemy-sprite');

    if (playerCardName) {
        const statusEs = player.status ? ` [${STATUS_TRANSLATIONS[player.status] || player.status}]` : '';
        playerCardName.innerText = `${player.name}${statusEs} (Nv. ${player.level || 1})`;
    }
    if (enemyCardName) {
        const statusEs = enemy.status ? ` [${STATUS_TRANSLATIONS[enemy.status] || enemy.status}]` : '';
        enemyCardName.innerText = `${enemy.name}${statusEs} (Nv. ${enemy.level || 1})`;
    }
    if (playerImgElem) playerImgElem.style = getStatusFilterStyle(player.status);
    if (enemyImgElem) enemyImgElem.style = getStatusFilterStyle(enemy.status);

    const moveButtons = document.querySelectorAll('.btn-move:not(.btn-switch-action)');
    moveButtons.forEach((btn, idx) => {
        const move = player.moves[idx];
        if (move) {
            btn.disabled = CombatState.turn !== 'player' || player.energy < move.cost || CombatState.isBattleOver;
        }
    });

    const switchButton = document.querySelector('.btn-switch-action');
    if (switchButton) {
        switchButton.disabled = CombatState.turn !== 'player' || CombatState.isBattleOver;
    }

    const logBox = document.getElementById('combat-log-box');
    if (logBox) {
        logBox.innerHTML = CombatState.logHistory.slice(-5).map(msg => `<div class="log-item">${msg}</div>`).join('');
        logBox.scrollTop = logBox.scrollHeight;
    }
}

function addCombatLog(msg) {
    CombatState.logHistory.push(msg);
    updateCombatUI();
}

function triggerUnitAnimation(cardId, animType) {
    const elem = document.getElementById(cardId);
    if (!elem) return;

    elem.classList.remove('anim-attack', 'anim-hit', 'anim-buff');
    void elem.offsetWidth;
    elem.classList.add(`anim-${animType}`);
}

function showFloatingDamage(cardId, amount, isCrit = false, message = '') {
    const card = document.getElementById(cardId);
    if (!card) return;

    const popup = document.createElement('div');
    popup.className = `damage-popup ${isCrit ? 'crit' : ''}`;
    popup.innerText = `-${amount} ${message ? `\n${message}` : ''}`;

    card.appendChild(popup);

    setTimeout(() => popup.remove(), 1000);
}