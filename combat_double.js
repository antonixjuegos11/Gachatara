// combat_double.js - Combates dobles: 2 Pokémon activos por bando
//
// Cada ronda eliges la acción de tus dos Pokémon (ataque + objetivo, o cambio), el rival decide las suyas
// y todo se resuelve por orden de velocidad. Los debilitados se sustituyen al final de la ronda.
// Reutiliza CombatState, el cálculo de daño y el motor de habilidades del combate normal.

const DoubleCombat = {
    round: 1,
    phase: 'select',   // 'select' | 'resolve'
    slots: [],         // posiciones (0/1) de mis Pokémon activos que aún tienen que elegir acción
    cursor: 0,
    queue: [],
    pending: null,     // índice del movimiento esperando objetivo
    switching: false
};

// ---------- Utilidades ----------

function dblAlive(u) { return !!u && u.currentHp > 0; }

function dblIndices(side) { return side === 'p' ? CombatState.activePlayerIndices : CombatState.activeEnemyIndices; }
function dblTeam(side) { return side === 'p' ? CombatState.playerTeam : CombatState.enemyTeam; }
function dblActive(side) { return dblIndices(side).map(i => dblTeam(side)[i]); }

function dblSideOf(unit) { return CombatState.playerTeam.includes(unit) ? 'p' : 'e'; }
function dblSlotOf(unit) {
    const side = dblSideOf(unit);
    return dblIndices(side).findIndex(i => dblTeam(side)[i] === unit);
}
function dblIsActive(unit) { return dblSlotOf(unit) !== -1; }
function dblCardId(unit) { return `dbl-${dblSideOf(unit)}-${dblSlotOf(unit)}`; }

function dblEffSpeed(u) {
    return (u.speed || 1) * ((u.mods && u.mods.spd) || 1) * (u.status === 'paralyzed' ? 0.5 : 1);
}

function dblSyncLegacyIndices() {
    CombatState.activePlayerIndex = dblIndices('p')[0] !== undefined ? dblIndices('p')[0] : 0;
    CombatState.activeEnemyIndex = dblIndices('e')[0] !== undefined ? dblIndices('e')[0] : 0;
}

function dblEnter(unit, noReset) {
    const side = dblSideOf(unit);
    const foes = dblActive(side === 'p' ? 'e' : 'p').filter(dblAlive);
    if (typeof triggerAbility !== 'function') return;

    CombatState.currentFoe = foes[0] || null;
    const msg = triggerAbility('onEnter', unit, foes[0] || null, null, 0, CombatState, { noReset: !!noReset });
    if (msg) addCombatLog(msg);
    foes.slice(1).forEach(f => {
        const extra = abilityEnterExtraFoe(unit, f);
        if (extra) addCombatLog(extra);
    });
}

// ---------- Inicio ----------

function startDoubleBattle(playerUnits, enemyUnits, mode = 'double', onEndCallback = null, options = {}) {
    const team = (playerUnits || []).map(p => prepareCombatUnit(p, p.level || 1)).filter(u => u && u.currentHp > 0);
    if (team.length < 2) {
        alert('¡Necesitas al menos 2 Pokémon con vida en el equipo para un combate doble!');
        return false;
    }

    CombatState.playerTeam = team;
    CombatState.enemyTeam = (enemyUnits || []).map(p => prepareCombatUnit(p, p.level || 1));
    CombatState.double = true;
    CombatState.activePlayerIndices = [0, 1];
    CombatState.activeEnemyIndices = CombatState.enemyTeam.length >= 2 ? [0, 1] : [0];
    dblSyncLegacyIndices();

    CombatState.isBattleOver = false;
    CombatState.mode = mode;
    CombatState.onBattleEndCallback = onEndCallback;
    CombatState.options = options || {};
    CombatState.rankedResult = null;
    CombatState.logHistory = [];
    CombatState.weather = null;
    CombatState.weatherTurns = 0;
    CombatState.terrain = null;
    CombatState.terrainTurns = 0;
    CombatState.currentFoe = null;

    DoubleCombat.round = 1;

    // Se reinician todos los activos y después se aplican las habilidades de entrada
    ['p', 'e'].forEach(side => dblActive(side).forEach(u => { if (u && typeof resetUnitForEntry === 'function') resetUnitForEntry(u); }));

    renderDoubleArena();
    addCombatLog('¡Empieza el combate doble!');
    ['p', 'e'].forEach(side => dblActive(side).forEach(u => { if (dblAlive(u)) dblEnter(u, true); }));

    beginSelection();
    return true;
}

// ---------- Elección de acciones ----------

function beginSelection() {
    if (CombatState.isBattleOver) return;
    DoubleCombat.phase = 'select';
    DoubleCombat.queue = [];
    DoubleCombat.pending = null;
    DoubleCombat.switching = false;
    DoubleCombat.cursor = 0;
    DoubleCombat.slots = dblIndices('p')
        .map((idx, slot) => ({ slot, unit: CombatState.playerTeam[idx] }))
        .filter(x => dblAlive(x.unit))
        .map(x => x.slot);

    CombatState.turn = 'player';
    CombatState.currentFoe = null;
    renderDoubleArena();
}

function dblCurrentUnit() {
    const slot = DoubleCombat.slots[DoubleCombat.cursor];
    return slot === undefined ? null : CombatState.playerTeam[dblIndices('p')[slot]];
}

function dblQueueAction(action) {
    DoubleCombat.queue.push(action);
    DoubleCombat.pending = null;
    DoubleCombat.switching = false;
    DoubleCombat.cursor++;
    if (DoubleCombat.cursor >= DoubleCombat.slots.length) resolveRound();
    else renderDoubleArena();
}

window.dblChooseMove = function (moveIdx) {
    if (DoubleCombat.phase !== 'select' || CombatState.isBattleOver) return;
    const unit = dblCurrentUnit();
    if (!unit) return;
    const move = unit.moves[moveIdx];
    if (!move) return;
    if (move.cost > unit.energy) { addCombatLog(`¡No hay suficiente energía para ${move.name}!`); return; }

    const foes = dblActive('e').filter(dblAlive);
    if (move.power === 0) { dblQueueAction({ type: 'move', unit, move, target: null }); return; }
    if (foes.length === 1) { dblQueueAction({ type: 'move', unit, move, target: foes[0] }); return; }

    DoubleCombat.pending = moveIdx;
    renderDoubleArena();
};

window.dblChooseTarget = function (enemySlot) {
    if (DoubleCombat.pending === null) return;
    const unit = dblCurrentUnit();
    const target = CombatState.enemyTeam[dblIndices('e')[enemySlot]];
    if (!unit || !dblAlive(target)) return;
    dblQueueAction({ type: 'move', unit, move: unit.moves[DoubleCombat.pending], target });
};

window.dblOpenSwitch = function () {
    const unit = dblCurrentUnit();
    if (!unit) return;
    if (typeof abilityTrapMessage === 'function') {
        const trap = abilityTrapMessage(unit);
        if (trap) { addCombatLog(trap); return; }
    }
    DoubleCombat.switching = true;
    DoubleCombat.pending = null;
    renderDoubleArena();
};

window.dblChooseSwitch = function (teamIdx) {
    const unit = dblCurrentUnit();
    const nu = CombatState.playerTeam[teamIdx];
    if (!unit || !dblAlive(nu) || dblIndices('p').includes(teamIdx)) return;
    if (DoubleCombat.queue.some(a => a.type === 'switch' && a.toIdx === teamIdx)) return;
    dblQueueAction({ type: 'switch', unit, toIdx: teamIdx });
};

window.dblBack = function () {
    if (DoubleCombat.pending !== null || DoubleCombat.switching) {
        DoubleCombat.pending = null;
        DoubleCombat.switching = false;
    } else if (DoubleCombat.cursor > 0) {
        DoubleCombat.cursor--;
        DoubleCombat.queue.pop();
    }
    renderDoubleArena();
};

// ---------- IA del rival ----------

function dblChooseEnemyAction(u) {
    const foes = dblActive('p').filter(dblAlive);
    const hpPct = (u.currentHp / u.maxHp) * 100;
    const defensive = u.moves.find(m => m.power === 0 && u.energy >= (m.cost || 30));
    const special = u.moves.find(m => m.isSpecial && u.energy >= (m.cost || 50));

    let mv = u.moves[0];
    if (hpPct < 30 && defensive && Math.random() < 0.7) mv = defensive;
    else if (special && Math.random() < 0.8) mv = special;
    else {
        const affordable = u.moves.filter(m => u.energy >= (m.cost || 0)).sort((a, b) => (b.power || 0) - (a.power || 0));
        if (affordable.length) mv = affordable[0];
    }

    let target = null;
    if (mv.power > 0 && foes.length) {
        const score = f => getTypeEffectiveness(mv.type, f) * (1 + (1 - f.currentHp / f.maxHp));
        target = foes.slice().sort((a, b) => score(b) - score(a))[0];
    }
    return { type: 'move', unit: u, move: mv, target };
}

// ---------- Resolución ----------

function resolveRound() {
    DoubleCombat.phase = 'resolve';
    CombatState.turn = 'animating';

    const actions = DoubleCombat.queue.slice();
    dblActive('e').forEach(u => { if (dblAlive(u)) actions.push(dblChooseEnemyAction(u)); });

    const ordered = actions
        .map(a => ({ a, key: a.type === 'switch' ? 1e9 : dblEffSpeed(a.unit), r: Math.random() }))
        .sort((x, y) => (y.key - x.key) || (y.r - x.r))
        .map(o => o.a);

    renderDoubleArena();
    addCombatLog(`— Ronda ${DoubleCombat.round} —`);
    runDoubleActions(ordered, 0);
}

function runDoubleActions(list, i) {
    if (CombatState.isBattleOver) return;
    if (i >= list.length) { setTimeout(endDoubleRound, 700); return; }

    const acted = executeDoubleAction(list[i]);
    if (CombatState.isBattleOver) return;
    setTimeout(() => runDoubleActions(list, i + 1), acted ? 1100 : 0);
}

function dblDoSwitch(act) {
    const unit = act.unit;
    const side = dblSideOf(unit);
    const slot = dblSlotOf(unit);
    const nu = dblTeam(side)[act.toIdx];
    if (slot === -1 || !dblAlive(nu) || dblIndices(side).includes(act.toIdx)) return false;

    if (typeof abilityTrapMessage === 'function') {
        const trap = abilityTrapMessage(unit);
        if (trap) { addCombatLog(trap); return true; }
    }
    CombatState.currentFoe = dblActive(side === 'p' ? 'e' : 'p').find(dblAlive) || null;
    if (typeof triggerAbility === 'function') {
        const leaveMsg = triggerAbility('onSwitchOut', unit, CombatState.currentFoe, null, 0, CombatState);
        if (leaveMsg) addCombatLog(leaveMsg);
    }

    dblIndices(side)[slot] = act.toIdx;
    dblSyncLegacyIndices();
    addCombatLog(side === 'p' ? `🔄 ¡Retiramos a ${unit.name}, adelante ${nu.name}!` : `🔄 ¡El rival retira a ${unit.name} y saca a ${nu.name}!`);
    if (typeof resetUnitForEntry === 'function') resetUnitForEntry(nu);
    dblEnter(nu, true);
    renderDoubleArena();
    return true;
}

function executeDoubleAction(act) {
    const unit = act.unit;
    if (!dblAlive(unit) || !dblIsActive(unit)) return false;
    if (act.type === 'switch') return dblDoSwitch(act);

    const side = dblSideOf(unit);
    const foes = dblActive(side === 'p' ? 'e' : 'p').filter(dblAlive);
    let move = act.move;
    let target = act.target;

    if (move.power > 0) {
        if (foes.length === 0) return false;
        if (!target || !dblAlive(target) || !foes.includes(target)) target = foes[Math.floor(Math.random() * foes.length)];
        CombatState.currentFoe = target;
    } else {
        CombatState.currentFoe = foes[0] || null;
    }

    // Estados, Ausente, amedrentado...
    if (processStatusBeforeTurn(unit)) {
        updateDoubleUI();
        dblCheckFaints();
        return true;
    }

    if (move.cost > unit.energy) move = unit.moves[0];
    unit.energy -= move.cost;

    if (move.power === 0) {
        const healAmount = Math.floor(unit.maxHp * (move.shield || 0.2));
        unit.currentHp = Math.min(unit.maxHp, unit.currentHp + healAmount);
        unit.energy = Math.min(unit.maxEnergy, unit.energy + (move.energyGain || 0));
        addCombatLog(`✨ ${side === 'p' ? '' : 'El '}${unit.name}${side === 'p' ? '' : ' enemigo'} usó ${move.name} y recuperó +${healAmount} HP.`);
        triggerUnitAnimation(dblCardId(unit), 'buff');
        updateDoubleUI();
        return true;
    }

    const result = calculateDamage(unit, target, move);
    target.currentHp = Math.max(0, target.currentHp - result.damage);
    unit.energy = Math.min(unit.maxEnergy, unit.energy + move.energyGain);

    if (move.statusEffect && result.damage > 0 && !target.status) {
        const chance = typeof abilityStatusChance === 'function'
            ? abilityStatusChance(unit, target, move, move.statusChance || 0.2)
            : (move.statusChance || 0.2);
        if (Math.random() < chance) tryApplyStatus(target, move.statusEffect, unit);
    }

    triggerUnitAnimation(dblCardId(unit), 'attack');
    triggerUnitAnimation(dblCardId(target), 'hit');
    showFloatingDamage(dblCardId(target), result.damage, result.isCrit, result.effMessage);

    let text = `${side === 'p' ? '⚔️' : '🔴'} ${unit.name}${side === 'p' ? '' : ' enemigo'} usó ${move.name} contra ${target.name} e infligió ${result.damage} de daño.`;
    if (result.isCrit) text += ' ¡CRÍTICO!';
    if (result.effMessage) text += ` (${result.effMessage})`;
    addCombatLog(text);

    if (typeof applyPostHitAbilities === 'function') applyPostHitAbilities(unit, target, move, result);

    updateDoubleUI();
    dblCheckFaints();
    return true;
}

// ---------- Debilitados, relevos y fin ----------

function dblCheckFaints() {
    ['p', 'e'].forEach(side => {
        dblActive(side).forEach(u => {
            if (u && u.currentHp <= 0 && !(u.flags && u.flags.faintLogged)) {
                if (u.flags) u.flags.faintLogged = true;
                addCombatLog(side === 'p' ? `💀 ¡Tu ${u.name} se ha debilitado!` : `💀 ¡El ${u.name} enemigo ha sido derrotado!`);
            }
        });
    });
    return dblCheckBattleOver();
}

function dblCheckBattleOver() {
    if (CombatState.isBattleOver) return true;
    if (!CombatState.enemyTeam.some(dblAlive)) { finishBattle(true); return true; }
    if (!CombatState.playerTeam.some(dblAlive)) { finishBattle(false); return true; }
    return false;
}

function dblReplaceFainted() {
    ['p', 'e'].forEach(side => {
        const idxs = dblIndices(side);
        const team = dblTeam(side);

        for (let s = idxs.length - 1; s >= 0; s--) {
            if (dblAlive(team[idxs[s]])) continue;

            const bench = team.findIndex((t, i) => dblAlive(t) && !idxs.includes(i));
            if (bench === -1) { idxs.splice(s, 1); continue; }

            idxs[s] = bench;
            const nu = team[bench];
            addCombatLog(side === 'p' ? `⚠️ ¡Adelante, ${nu.name}!` : `⚠️ ¡El rival envía a ${nu.name}!`);
            if (typeof resetUnitForEntry === 'function') resetUnitForEntry(nu);
            dblEnter(nu, true);
        }
    });
    dblSyncLegacyIndices();
}

function endDoubleRound() {
    if (CombatState.isBattleOver) return;
    CombatState.currentFoe = null;

    if (typeof processFieldEndTurn === 'function') processFieldEndTurn();

    ['p', 'e'].forEach(side => dblActive(side).forEach(u => {
        if (!dblAlive(u) || typeof triggerAbility !== 'function') return;
        const msg = triggerAbility('onTurnEnd', u, foeOf(u));
        if (msg) addCombatLog(msg);
    }));

    updateDoubleUI();
    if (dblCheckFaints()) return;

    dblReplaceFainted();
    if (dblCheckBattleOver()) return;

    DoubleCombat.round++;
    beginSelection();
}

// ---------- Interfaz ----------

function dblCardHtml(u, side, slot) {
    if (!u) {
        return `<div class="combat-card" style="opacity: .35; display: flex; align-items: center; justify-content: center; min-height: 120px;">—</div>`;
    }
    const alive = dblAlive(u);
    const isCurrent = side === 'p' && DoubleCombat.phase === 'select' && dblCurrentUnit() === u;
    const statusText = u.status ? ` [${STATUS_TRANSLATIONS[u.status] || u.status}]` : '';
    const hpPct = Math.max(0, (u.currentHp / u.maxHp) * 100);
    const img = u.sprite || (u.sprites ? u.sprites.front : '') || '';
    const glow = isCurrent ? 'box-shadow: 0 0 14px #fbbf24; border-color: #fbbf24;' : '';

    return `
        <div class="combat-card ${side === 'p' ? 'player-card' : 'enemy-card'}" id="dbl-${side}-${slot}" style="${alive ? '' : 'opacity: .45; filter: grayscale(1);'} ${glow}">
            <div class="unit-info">
                <span class="unit-name" id="dbl-st-${side}-${slot}">${u.name}${statusText} (Nv. ${u.level || 1})</span>
            </div>
            <div class="hp-bar-container"><div class="hp-bar-fill" id="dbl-hp-${side}-${slot}" style="width: ${hpPct}%"></div></div>
            <div class="hp-text" id="dbl-hptxt-${side}-${slot}">${u.currentHp} / ${u.maxHp} HP</div>
            ${side === 'p' ? `<div class="energy-bar-container"><div class="energy-bar-fill" id="dbl-en-${side}-${slot}" style="width: ${(u.energy / u.maxEnergy) * 100}%"></div></div>` : ''}
            <div class="sprite-box"><img src="${img}" alt="${u.name}" style="max-height: 90px;"></div>
            ${alive ? '' : '<div style="text-align:center; font-size:12px;">💀 Debilitado</div>'}
        </div>`;
}

function dblControlsHtml() {
    if (CombatState.isBattleOver) return '';
    if (DoubleCombat.phase !== 'select') {
        return `<div style="text-align: center; color: #94a3b8; padding: 14px;">⏳ Resolviendo la ronda ${DoubleCombat.round}...</div>`;
    }
    const unit = dblCurrentUnit();
    if (!unit) return '';

    const head = `<div style="text-align: center; color: #fbbf24; margin-bottom: 8px; font-weight: 700;">
        Ronda ${DoubleCombat.round} · ¿Qué hará ${unit.name}? (${DoubleCombat.cursor + 1}/${DoubleCombat.slots.length})</div>`;
    const backBtn = (DoubleCombat.cursor > 0 || DoubleCombat.pending !== null || DoubleCombat.switching)
        ? `<button class="btn-move" onclick="dblBack()"><span class="move-name">↩ Volver</span></button>` : '';

    if (DoubleCombat.pending !== null) {
        const move = unit.moves[DoubleCombat.pending];
        const targets = dblIndices('e').map((idx, slot) => ({ slot, u: CombatState.enemyTeam[idx] })).filter(x => dblAlive(x.u));
        return `${head}<div class="combat-controls"><div class="moves-grid">
            ${targets.map(t => {
                const eff = getEffectivenessLabel(getTypeEffectiveness(move.type, t.u));
                return `<button class="btn-move" onclick="dblChooseTarget(${t.slot})">
                    <span class="move-name">🎯 ${t.u.name}</span>
                    <span class="move-cost">${t.u.currentHp}/${t.u.maxHp} HP</span>
                    ${eff.text ? `<span class="move-eff ${eff.class}">${eff.text}</span>` : ''}
                </button>`;
            }).join('')}${backBtn}</div></div>`;
    }

    if (DoubleCombat.switching) {
        const taken = DoubleCombat.queue.filter(a => a.type === 'switch').map(a => a.toIdx);
        const bench = CombatState.playerTeam.map((u, i) => ({ u, i }))
            .filter(x => dblAlive(x.u) && !dblIndices('p').includes(x.i) && !taken.includes(x.i));
        return `${head}<div class="combat-controls"><div class="moves-grid">
            ${bench.length ? bench.map(b => `<button class="btn-move" onclick="dblChooseSwitch(${b.i})">
                <span class="move-name">🔄 ${b.u.name}</span><span class="move-cost">${b.u.currentHp}/${b.u.maxHp} HP</span></button>`).join('')
                : '<div style="color:#94a3b8; padding: 8px;">No quedan Pokémon en el banquillo.</div>'}
            ${backBtn}</div></div>`;
    }

    return `${head}<div class="combat-controls"><div class="moves-grid">
        ${unit.moves.map((move, idx) => `
            <button class="btn-move" onclick="dblChooseMove(${idx})" ${unit.energy < move.cost ? 'disabled' : ''}>
                <span class="move-name">${move.name} (${move.type})</span>
                <span class="move-cost">${move.cost > 0 ? `⚡ ${move.cost}` : 'Gratis'}</span>
            </button>`).join('')}
        <button class="btn-move btn-switch-action" onclick="dblOpenSwitch()"><span class="move-name">🔄 Cambiar Pokémon</span><span class="move-cost">Equipo</span></button>
        ${backBtn}
    </div></div>`;
}

function renderDoubleArena() {
    const container = document.getElementById('combat-arena-container') ||
                      document.getElementById('tab-combate') ||
                      document.getElementById('tab-combat');
    if (!container) return;

    const enemies = dblIndices('e').map((idx, slot) => dblCardHtml(CombatState.enemyTeam[idx], 'e', slot)).join('');
    const players = dblIndices('p').map((idx, slot) => dblCardHtml(CombatState.playerTeam[idx], 'p', slot)).join('');
    const benchP = CombatState.playerTeam.filter((u, i) => dblAlive(u) && !dblIndices('p').includes(i)).length;
    const benchE = CombatState.enemyTeam.filter((u, i) => dblAlive(u) && !dblIndices('e').includes(i)).length;

    container.innerHTML = `
        <div id="field-badge" style="text-align: center; font-size: 13px; color: #fbbf24; margin-bottom: 6px; font-weight: 700; display: none;"></div>
        <div style="text-align: center; font-size: 12px; color: #94a3b8; margin-bottom: 4px;">Rival · banquillo: ${benchE}</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 10px;">${enemies}</div>
        <div class="combat-vs-badge" style="margin: 0 auto 10px auto; text-align: center;">VS</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 4px;">${players}</div>
        <div style="text-align: center; font-size: 12px; color: #94a3b8; margin-bottom: 10px;">Tu banquillo: ${benchP}</div>
        ${dblControlsHtml()}
        <div class="combat-log-box" id="combat-log-box"></div>
    `;
    updateDoubleUI();
}

// Actualización ligera: barras, estados y registro (sin reconstruir las tarjetas)
function updateDoubleUI() {
    ['p', 'e'].forEach(side => {
        dblIndices(side).forEach((idx, slot) => {
            const u = dblTeam(side)[idx];
            if (!u) return;
            const fill = document.getElementById(`dbl-hp-${side}-${slot}`);
            const txt = document.getElementById(`dbl-hptxt-${side}-${slot}`);
            const name = document.getElementById(`dbl-st-${side}-${slot}`);
            const en = document.getElementById(`dbl-en-${side}-${slot}`);
            if (fill) fill.style.width = `${Math.max(0, (u.currentHp / u.maxHp) * 100)}%`;
            if (txt) txt.innerText = `${u.currentHp} / ${u.maxHp} HP`;
            if (name) name.innerText = `${u.name}${u.status ? ` [${STATUS_TRANSLATIONS[u.status] || u.status}]` : ''} (Nv. ${u.level || 1})`;
            if (en) en.style.width = `${(u.energy / u.maxEnergy) * 100}%`;
        });
    });

    const badge = document.getElementById('field-badge');
    if (badge) {
        const weatherNames = { rain: '🌧️ Lluvia', sun: '☀️ Sol', sand: '🌪️ Tormenta de arena', snow: '❄️ Nevada', 'harsh-sun': '🔥 Sol abrasador', 'heavy-rain': '🌊 Lluvia torrencial', wind: '💨 Vientos' };
        const terrainNames = { electric: '⚡ Campo eléctrico', grassy: '🌿 Campo de hierba', misty: '🌫️ Campo de niebla', psychic: '🔮 Campo psíquico' };
        const parts = [];
        if (CombatState.weather) parts.push(weatherNames[CombatState.weather] || CombatState.weather);
        if (CombatState.terrain) parts.push(terrainNames[CombatState.terrain] || CombatState.terrain);
        badge.textContent = parts.join('  ·  ');
        badge.style.display = parts.length ? 'block' : 'none';
    }

    const logBox = document.getElementById('combat-log-box');
    if (logBox) {
        logBox.innerHTML = CombatState.logHistory.slice(-6).map(msg => `<div class="log-item">${msg}</div>`).join('');
        logBox.scrollTop = logBox.scrollHeight;
    }
}
