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

// =========================================
// TABLA DE TIPOS COMPLETA Y EFECTIVIDAD
// =========================================

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
 * Obtiene el multiplicador de daño entre dos tipos
 */
function getTypeEffectiveness(moveType, targetType) {
    if (!moveType || !targetType) return 1.0;
    const atk = moveType.charAt(0).toUpperCase() + moveType.slice(1).toLowerCase();
    const def = targetType.charAt(0).toUpperCase() + targetType.slice(1).toLowerCase();

    if (TYPE_CHART[atk] && TYPE_CHART[atk][def] !== undefined) {
        return TYPE_CHART[atk][def];
    }
    return 1.0;
}

/**
 * Devuelve un texto formateado con badge de efectividad
 */
function getEffectivenessLabel(mult) {
    if (mult >= 2.0) return { text: "💥 SuperEfectivo", class: "eff-super" };
    if (mult === 0) return { text: "🚫 Inmune", class: "eff-immune" };
    if (mult < 1.0) return { text: "🛡️ Poco Efectivo", class: "eff-weak" };
    return { text: "", class: "" };
}

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

window.executePlayerMove = function(moveIndex) {
    if (CombatState.isBattleOver) return;

    if (CombatState.turn !== 'player') {
        CombatState.turn = 'player';
    }

    const attacker = CombatState.playerTeam[CombatState.activePlayerIndex];
    const defender = CombatState.enemyTeam[CombatState.activeEnemyIndex];

    if (!attacker || !defender) return;

    const move = attacker.moves[moveIndex];
    if (!move) return;

    if (move.cost > attacker.energy) {
        addCombatLog(`¡No hay suficiente energía para ${move.name}!`);
        return;
    }

    CombatState.turn = 'animating';
    attacker.energy -= move.cost;

    // Habilidad Defensiva / Curación
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

    // Animaciones
    triggerUnitAnimation('player-card', 'attack');
    triggerUnitAnimation('enemy-card', 'hit');
    showFloatingDamage('enemy-card', damageResult.damage, damageResult.isCrit, damageResult.effMessage);

    let logText = `⚔️ ${attacker.name} usó ${move.name} e infligió ${damageResult.damage} de daño.`;
    if (damageResult.isCrit) logText += " ¡CRÍTICO!";
    if (damageResult.effMessage) logText += ` (${damageResult.effMessage})`;
    addCombatLog(logText);

    updateCombatUI();

    // Comprobar si el enemigo cayó
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

    // IA Enemiga
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
    CombatState.turn = 'enemy';
    updateCombatUI();
    setTimeout(executeEnemyTurn, 1000);
}

// =========================================
// SISTEMA DE CÁLCULO DE DAÑO Y ELEMENTOS
// =========================================

function calculateDamage(attacker, defender, move) {
    const isCrit = Math.random() < 0.15;
    const critMult = isCrit ? 1.5 : 1.0;

    const atkType = move.type || attacker.type || 'Normal';
    const defType = defender.type || 'Normal';

    const elementMult = getTypeEffectiveness(atkType, defType);
    const effInfo = getEffectivenessLabel(elementMult);

    if (elementMult === 0) {
        return { damage: 0, isCrit: false, effMessage: effInfo.text, elementMult };
    }

    const rawDamage = ((attacker.attack * (move.power || 1.0)) - (defender.defense * 0.4)) * critMult * elementMult;
    const variation = 0.9 + Math.random() * 0.2;
    const finalDamage = Math.max(5, Math.floor(rawDamage * variation));

    return { damage: finalDamage, isCrit, effMessage: effInfo.text, elementMult };
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
    const container = document.getElementById('combat-arena-container') || 
                      document.getElementById('tab-combate') || 
                      document.getElementById('tab-combat');
                      
    if (!container) {
        console.error("No se encontró el contenedor para la arena de combate.");
        return;
    }

    const player = CombatState.playerTeam[CombatState.activePlayerIndex];
    const enemy = CombatState.enemyTeam[CombatState.activeEnemyIndex];

    const playerImg = player.sprite || (player.sprites ? player.sprites.front : '') || '';
    const enemyImg = enemy.sprite || (enemy.sprites ? enemy.sprites.front : '') || '';

    container.innerHTML = `
        <div class="combat-arena">
            <!-- POKÉMON JUGADOR (IZQUIERDA) -->
            <div class="combat-card player-card" id="player-card">
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

                <div class="sprite-box">
                    <img id="player-sprite" src="${playerImg}" alt="${player.name}">
                </div>
            </div>

            <!-- VS BADGE -->
            <div class="combat-vs-badge">VS</div>

            <!-- POKÉMON ENEMIGO (DERECHA) -->
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
        </div>

        <!-- PANEL DE ACCIONES Y CONTROLES -->
        <div class="combat-controls">
            <div class="moves-grid" id="moves-grid">
                ${player.moves.map((move, idx) => {
                    const effMult = move.power > 0 ? getTypeEffectiveness(move.type || player.type, enemy.type) : 1.0;
                    const effLabel = move.power > 0 ? getEffectivenessLabel(effMult) : { text: '', class: '' };

                    return `
                        <button class="btn-move" onclick="window.executePlayerMove(${idx})" ${CombatState.turn !== 'player' || player.energy < move.cost ? 'disabled' : ''}>
                            <span class="move-name">${move.name} (${move.type || player.type})</span>
                            <span class="move-cost">${move.cost > 0 ? `⚡ ${move.cost}` : 'Gratis'}</span>
                            ${effLabel.text ? `<span class="move-eff ${effLabel.class}">${effLabel.text}</span>` : ''}
                        </button>
                    `;
                }).join('')}
            </div>
        </div>

        <!-- LOG DE COMBATE -->
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

    const moveButtons = document.querySelectorAll('.btn-move');
    moveButtons.forEach((btn, idx) => {
        const move = player.moves[idx];
        if (move) {
            btn.disabled = CombatState.turn !== 'player' || player.energy < move.cost || CombatState.isBattleOver;
        }
    });

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