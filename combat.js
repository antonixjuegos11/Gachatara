// combat.js - Motor de Combate por Turnos (PvE / PvP Asíncrono)

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

// Tabla elemental simplificada de multiplicadores de daño
const TYPE_CHART = {
    Fuego:    { Planta: 2.0, Agua: 0.5, Fuego: 0.5, Eléctrico: 1.0 },
    Agua:     { Fuego: 2.0, Planta: 0.5, Agua: 0.5, Eléctrico: 1.0 },
    Planta:   { Agua: 2.0, Fuego: 0.5, Planta: 0.5, Eléctrico: 1.0 },
    Eléctrico:{ Agua: 2.0, Planta: 0.5, Eléctrico: 0.5, Fuego: 1.0 },
    Normal:   {}
};

// =========================================
// INICIALIZACIÓN Y ENTRADA AL COMBATE
// =========================================

/**
 * Prepara las estadísticas de combate de un Pokémon basándose en su rareza y nivel
 */
function prepareCombatUnit(pkmn, level = 5) {
    if (!pkmn) return null;

    const baseHp = pkmn.hp || 50;
    const baseAtk = pkmn.attack || 15;
    const baseDef = pkmn.defense || 10;
    const baseSpd = pkmn.speed || 10;

    // Multiplicador por rareza
    let rarityMult = 1.0;
    const rarity = (pkmn.rarity || 'comun').toLowerCase();
    if (rarity.includes('raro')) rarityMult = 1.25;
    if (rarity.includes('epico') || rarity.includes('épico')) rarityMult = 1.5;
    if (rarity.includes('legendario')) rarityMult = 2.0;

    const maxHp = Math.floor((baseHp * 2 + 10) * (level / 10) * rarityMult);
    const attack = Math.floor((baseAtk * 1.5 + 5) * (level / 10) * rarityMult);
    const defense = Math.floor((baseDef * 1.2 + 5) * (level / 10) * rarityMult);
    const speed = Math.floor((baseSpd * 1.2 + 5) * (level / 10) * rarityMult);

    return {
        ...pkmn,
        level,
        maxHp,
        currentHp: maxHp,
        attack,
        defense,
        speed,
        energy: 0,
        maxEnergy: 100,
        type: pkmn.type || 'Normal',
        moves: [
            { name: 'Ataque Rápido', type: pkmn.type || 'Normal', power: 1.0, energyGain: 25, cost: 0 },
            { name: 'Ataque Especial', type: pkmn.type || 'Fuego', power: 1.8, energyGain: 0, cost: 50 },
            { name: 'Habilidad Defensiva', type: 'Normal', power: 0, shield: 0.3, energyGain: 15, cost: 30 }
        ]
    };
}

/**
 * Inicia una batalla entre el equipo del jugador y un equipo enemigo
 */
function startBattle(playerUnits, enemyUnits, mode = 'quick', onEndCallback = null) {
    if (!playerUnits || playerUnits.length === 0) {
        alert("¡Debes tener al menos un Pokémon en tu equipo para luchar!");
        return;
    }

    CombatState.playerTeam = playerUnits.map(p => prepareCombatUnit(p, p.level || 10));
    CombatState.enemyTeam = enemyUnits.map(p => prepareCombatUnit(p, p.level || 10));
    CombatState.activePlayerIndex = 0;
    CombatState.activeEnemyIndex = 0;
    CombatState.isBattleOver = false;
    CombatState.mode = mode;
    CombatState.onBattleEndCallback = onEndCallback;
    CombatState.logHistory = [];

    // Determinar quién empieza según la velocidad
    const pSpeed = CombatState.playerTeam[0].speed;
    const eSpeed = CombatState.enemyTeam[0].speed;
    CombatState.turn = pSpeed >= eSpeed ? 'player' : 'enemy';

    renderCombatArena();
    addCombatLog(`¡Empieza la batalla en modo ${mode.toUpperCase()}!`);
    addCombatLog(`${CombatState.playerTeam[0].name} vs ${CombatState.enemyTeam[0].name}`);

    if (CombatState.turn === 'enemy') {
        setTimeout(executeEnemyTurn, 1000);
    }
}

// =========================================
// LÓGICA DE TURNOS Y ATAQUES
// =========================================

function executePlayerMove(moveIndex) {
    if (CombatState.turn !== 'player' || CombatState.isBattleOver) return;

    const attacker = CombatState.playerTeam[CombatState.activePlayerIndex];
    const defender = CombatState.enemyTeam[CombatState.activeEnemyIndex];
    const move = attacker.moves[moveIndex];

    if (!move) return;

    if (move.cost > attacker.energy) {
        addCombatLog(`¡No hay suficiente energía para ${move.name}!`);
        return;
    }

    CombatState.turn = 'animating';
    attacker.energy -= move.cost;

    // Habilidad Defensiva / Buff
    if (move.power === 0) {
        const healAmount = Math.floor(attacker.maxHp * (move.shield || 0.2));
        attacker.currentHp = Math.min(attacker.maxHp, attacker.currentHp + healAmount);
        addCombatLog(`✨ ${attacker.name} usó ${move.name} y recuperó +${healAmount} HP.`);
        triggerUnitAnimation('player-card', 'buff');
        updateCombatUI();

        setTimeout(endTurn, 1200);
        return;
    }

    // Cálculo de Daño
    const damageResult = calculateDamage(attacker, defender, move);
    defender.currentHp = Math.max(0, defender.currentHp - damageResult.damage);
    attacker.energy = Math.min(attacker.maxEnergy, attacker.energy + move.energyGain);

    // Animación y Pop-up de Daño
    triggerUnitAnimation('player-card', 'attack');
    triggerUnitAnimation('enemy-card', 'hit');
    showFloatingDamage('enemy-card', damageResult.damage, damageResult.isCrit, damageResult.effMessage);

    let logText = `⚔️ ${attacker.name} usó ${move.name} e infligió ${damageResult.damage} de daño.`;
    if (damageResult.isCrit) logText += " ¡CRÍTICO!";
    if (damageResult.effMessage) logText += ` (${damageResult.effMessage})`;
    addCombatLog(logText);

    updateCombatUI();

    // Comprobar si el enemigo fue debilitado
    if (defender.currentHp <= 0) {
        setTimeout(handleEnemyFaint, 1000);
    } else {
        setTimeout(endTurn, 1200);
    }
}

function executeEnemyTurn() {
    if (CombatState.isBattleOver) return;

    const attacker = CombatState.enemyTeam[CombatState.activeEnemyIndex];
    const defender = CombatState.playerTeam[CombatState.activePlayerIndex];

    // IA Enemiga: usa movimiento cargado si tiene energía suficiente
    let selectedMove = attacker.moves[0];
    if (attacker.energy >= 50 && attacker.moves[1]) {
        selectedMove = attacker.moves[1];
    }

    attacker.energy -= selectedMove.cost;

    const damageResult = calculateDamage(attacker, defender, selectedMove);
    defender.currentHp = Math.max(0, defender.currentHp - damageResult.damage);
    attacker.energy = Math.min(attacker.maxEnergy, attacker.energy + selectedMove.energyGain);

    triggerUnitAnimation('enemy-card', 'attack');
    triggerUnitAnimation('player-card', 'hit');
    showFloatingDamage('player-card', damageResult.damage, damageResult.isCrit, damageResult.effMessage);

    let logText = `🔴 ${attacker.name} enemigo usó ${selectedMove.name} e infligió ${damageResult.damage} de daño.`;
    if (damageResult.isCrit) logText += " ¡CRÍTICO!";
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
    CombatState.turn = 'enemy';
    updateCombatUI();
    setTimeout(executeEnemyTurn, 1000);
}

// =========================================
// SISTEMA DE CÁLCULO DE DAÑO Y ELEMENTOS
// =========================================

function calculateDamage(attacker, defender, move) {
    const isCrit = Math.random() < 0.15; // 15% Probabilidad de crítico
    const critMult = isCrit ? 1.5 : 1.0;

    // Multiplicador elemental
    let elementMult = 1.0;
    let effMessage = '';
    const atkType = move.type || 'Normal';
    const defType = defender.type || 'Normal';

    if (TYPE_CHART[atkType] && TYPE_CHART[atkType][defType]) {
        elementMult = TYPE_CHART[atkType][defType];
        if (elementMult > 1.0) effMessage = '¡Super efectivo!';
        if (elementMult < 1.0) effMessage = 'Poco efectivo...';
    }

    const rawDamage = ((attacker.attack * move.power) - (defender.defense * 0.4)) * critMult * elementMult;
    const variation = 0.9 + Math.random() * 0.2; // Variación entre 90% y 110%
    const finalDamage = Math.max(5, Math.floor(rawDamage * variation));

    return { damage: finalDamage, isCrit, effMessage };
}

// =========================================
// GESTIÓN DE DERROTAS Y SUSTITUCIONES
// =========================================

function handleEnemyFaint() {
    addCombatLog(`💀 ¡El ${CombatState.enemyTeam[CombatState.activeEnemyIndex].name} enemigo ha sido derrotado!`);
    CombatState.activeEnemyIndex++;

    if (CombatState.activeEnemyIndex >= CombatState.enemyTeam.length) {
        finishBattle(true);
    } else {
        addCombatLog(`⚠️ ¡El rival envía a ${CombatState.enemyTeam[CombatState.activeEnemyIndex].name}!`);
        CombatState.turn = 'player';
        renderCombatArena();
    }
}

function handlePlayerFaint() {
    addCombatLog(`💀 ¡Tu ${CombatState.playerTeam[CombatState.activePlayerIndex].name} se ha debilitado!`);
    CombatState.activePlayerIndex++;

    if (CombatState.activePlayerIndex >= CombatState.playerTeam.length) {
        finishBattle(false);
    } else {
        addCombatLog(`⚠️ ¡Adelante, ${CombatState.playerTeam[CombatState.activePlayerIndex].name}!`);
        CombatState.turn = 'player';
        renderCombatArena();
    }
}

function finishBattle(hasPlayerWon) {
    CombatState.isBattleOver = true;
    CombatState.turn = 'none';

    if (hasPlayerWon) {
        addCombatLog(`🏆 ¡VICTORIA! Has ganado la batalla.`);
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
// RENDERIZADO E INTERFAZ GRÁFICA (UI)
// =========================================

function renderCombatArena() {
    // Buscar el contenedor de la arena dentro de la pestaña de combate
    const container = document.getElementById('combat-arena-container') || 
                      document.getElementById('tab-combate') || 
                      document.getElementById('tab-combat');
                      
    if (!container) {
        console.error("No se encontró el contenedor para la arena de combate.");
        return;
    }

    const player = CombatState.playerTeam[CombatState.activePlayerIndex];
    const enemy = CombatState.enemyTeam[CombatState.activeEnemyIndex];

    // Comprobación de seguridad para obtener el sprite correcto
    const playerImg = player.sprite || (player.sprites ? player.sprites.front : '') || '';
    const enemyImg = enemy.sprite || (enemy.sprites ? enemy.sprites.front : '') || '';

    container.innerHTML = `
        <div class="combat-arena">
            <!-- POKÉMON ENEMIGO -->
            <div class="combat-card enemy-card" id="enemy-card">
                <div class="unit-info">
                    <span class="unit-name">${enemy.name} (Nv. ${enemy.level || 10})</span>
                    <span class="unit-type ${(enemy.type || 'normal').toLowerCase()}">${enemy.type || 'Normal'}</span>
                </div>
                <div class="hp-bar-container">
                    <div class="hp-bar-fill" id="enemy-hp-fill" style="width: ${(enemy.currentHp / enemy.maxHp) * 100}%"></div>
                </div>
                <div class="hp-text" id="enemy-hp-text">${enemy.currentHp} / ${enemy.maxHp} HP</div>
                <div class="sprite-box">
                    <img id="enemy-sprite" src="${enemyImg}" alt="${enemy.name}">
                </div>
            </div>

            <!-- VS BADGE -->
            <div class="combat-vs-badge">VS</div>

            <!-- POKÉMON JUGADOR -->
            <div class="combat-card player-card" id="player-card">
                <div class="sprite-box">
                    <img id="player-sprite" src="${playerImg}" alt="${player.name}">
                </div>
                <div class="unit-info">
                    <span class="unit-name">${player.name} (Nv. ${player.level || 10})</span>
                    <span class="unit-type ${(player.type || 'normal').toLowerCase()}">${player.type || 'Normal'}</span>
                </div>
                <div class="hp-bar-container">
                    <div class="hp-bar-fill" id="player-hp-fill" style="width: ${(player.currentHp / player.maxHp) * 100}%"></div>
                </div>
                <div class="hp-text" id="player-hp-text">${player.currentHp} / ${player.maxHp} HP</div>
                
                <!-- Barra de Energía -->
                <div class="energy-bar-container">
                    <div class="energy-bar-fill" id="player-energy-fill" style="width: ${(player.energy / player.maxEnergy) * 100}%"></div>
                </div>
            </div>
        </div>

        <!-- PANEL DE ACCIONES Y CONTROLES -->
        <div class="combat-controls">
            <div class="moves-grid" id="moves-grid">
                ${player.moves.map((move, idx) => `
                    <button class="btn-move" onclick="executePlayerMove(${idx})" ${CombatState.turn !== 'player' || player.energy < move.cost ? 'disabled' : ''}>
                        <span class="move-name">${move.name}</span>
                        <span class="move-cost">${move.cost > 0 ? `⚡ ${move.cost}` : 'Gratis'}</span>
                    </button>
                `).join('')}
            </div>
        </div>

        <!-- LOG DE COMBATE -->
        <div class="combat-log-box" id="combat-log-box"></div>
    `;

    updateCombatUI();
}