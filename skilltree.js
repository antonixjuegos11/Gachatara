// skilltree.js - Árbol de habilidades por Pokémon (un nodo cada 10 niveles)
//
// Cada Pokémon guarda sus elecciones en  pokemon.perks = { "10": "vit", "20": "musculo", ... }
// Nodos de tipo:
//   stat  -> eliges 1 de 3 mejoras de estadísticas (distintas "builds")
//   item  -> desbloquea una ranura de objeto (los objetos llegarán más adelante)
//   final -> eliges la versión (física o especial) del Ataque Final (nv. 80)
//   title -> al nivel 100 se desbloquea un título de jugador para el perfil

const SKILL_NODE_LEVELS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
const SKILL_RESPEC_COST = 500; // monedas para reiniciar el árbol de un Pokémon

const SKILL_STAT_NAMES = {
    hp: 'HP', attack: 'Ataque', defense: 'Defensa',
    spAtk: 'At. Esp.', spDef: 'Def. Esp.', speed: 'Velocidad'
};

const SKILL_TREE = {
    10: {
        type: 'stat', title: 'Entrenamiento Básico',
        options: [
            { id: 'vit', icon: '❤️', name: 'Vitalidad', bonus: { hp: 0.15 } },
            { id: 'pow', icon: '⚔️', name: 'Poder',     bonus: { attack: 0.10, spAtk: 0.10 } },
            { id: 'ref', icon: '⚡', name: 'Reflejos',  bonus: { speed: 0.12 } }
        ]
    },
    20: {
        type: 'stat', title: 'Especialización',
        options: [
            { id: 'piel',  icon: '🛡️', name: 'Piel Dura', bonus: { defense: 0.12, spDef: 0.12 } },
            { id: 'musc',  icon: '💪', name: 'Músculo',   bonus: { attack: 0.15 } },
            { id: 'intel', icon: '🧠', name: 'Intelecto', bonus: { spAtk: 0.15 } }
        ]
    },
    30: { type: 'item', title: 'Ranura de Objeto I', slots: 1,
          desc: 'Tu Pokémon puede equipar 1 objeto. (Los objetos llegarán pronto)' },
    40: {
        type: 'stat', title: 'Resistencia de Combate',
        options: [
            { id: 'resi', icon: '🏋️', name: 'Resistencia', bonus: { hp: 0.20 } },
            { id: 'impu', icon: '💨', name: 'Impulso',     bonus: { speed: 0.15 } },
            { id: 'equi', icon: '☯️', name: 'Equilibrio',  bonus: { hp: 0.08, attack: 0.08, defense: 0.08, spAtk: 0.08, spDef: 0.08, speed: 0.08 } }
        ]
    },
    50: {
        type: 'stat', title: 'Camino del Combatiente',
        options: [
            { id: 'guer', icon: '🗡️', name: 'Guerrero',  bonus: { attack: 0.15, defense: 0.10 } },
            { id: 'mago', icon: '🔮', name: 'Mago',      bonus: { spAtk: 0.15, spDef: 0.10 } },
            { id: 'cent', icon: '🦅', name: 'Centinela', bonus: { hp: 0.10, speed: 0.10 } }
        ]
    },
    60: {
        type: 'stat', title: 'Dominio',
        options: [
            { id: 'tita', icon: '🗿', name: 'Titán',      bonus: { hp: 0.15, defense: 0.10 } },
            { id: 'caza', icon: '🏹', name: 'Cazador',    bonus: { attack: 0.12, speed: 0.12 } },
            { id: 'hech', icon: '✨', name: 'Hechicero',  bonus: { spAtk: 0.12, speed: 0.12 } }
        ]
    },
    70: { type: 'item', title: 'Ranura de Objeto II', slots: 1,
          desc: 'Una segunda ranura de objeto. (Los objetos llegarán pronto)' },
    80: {
        type: 'final', title: 'Ataque Final',
        options: [
            { id: 'phys', icon: '💥', name: 'Final Físico',   kind: 'phys',
              desc: 'Aprende un ataque final físico (potencia 150, cuesta 100 de energía).' },
            { id: 'spec', icon: '🌟', name: 'Final Especial', kind: 'spec',
              desc: 'Aprende un ataque final especial (potencia 150, cuesta 100 de energía).' }
        ]
    },
    90: {
        type: 'stat', title: 'Maestría',
        options: [
            { id: 'mofe', icon: '🔥', name: 'Maestría Ofensiva', bonus: { attack: 0.12, spAtk: 0.12 } },
            { id: 'mode', icon: '🧱', name: 'Maestría Defensiva', bonus: { hp: 0.12, defense: 0.12, spDef: 0.12 } },
            { id: 'move', icon: '🌪️', name: 'Maestría Veloz',    bonus: { speed: 0.20 } }
        ]
    },
    100: { type: 'title', title: 'Título de Maestro',
           desc: 'Desbloqueas el título de jugador «Maestro de …» para tu perfil.' }
};

const FINAL_MOVE_NAMES = {
    "Normal": "Hiperrayo Final", "Fuego": "Llamarada Final", "Agua": "Hidrocañón Final",
    "Planta": "Rayo Solar Final", "Eléctrico": "Trueno Final", "Hielo": "Ventisca Final",
    "Lucha": "Puño Supremo", "Veneno": "Bomba Letal", "Tierra": "Terremoto Final",
    "Volador": "Vendaval Final", "Psíquico": "Psicorrayo Final", "Bicho": "Enjambre Final",
    "Roca": "Alud Final", "Fantasma": "Maldición Final", "Dragón": "Cometa Final",
    "Siniestro": "Eclipse Final", "Acero": "Cañón Acero Final", "Hada": "Fulgor Final"
};

// ---------- Lógica ----------

function formatSkillBonus(bonus) {
    return Object.entries(bonus || {})
        .map(([stat, v]) => `+${Math.round(v * 100)}% ${SKILL_STAT_NAMES[stat] || stat}`)
        .join(', ');
}

// Bonificaciones totales de un Pokémon según su nivel y sus elecciones
function getPerkBonuses(pkmn) {
    const result = {
        mult: { hp: 1, attack: 1, defense: 1, spAtk: 1, spDef: 1, speed: 1 },
        itemSlots: 0,
        finalKind: null
    };
    if (!pkmn) return result;

    const level = Number(pkmn.level) || 1;
    const perks = pkmn.perks || {};
    const sums = { hp: 0, attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0 };

    SKILL_NODE_LEVELS.forEach(lvl => {
        if (level < lvl) return;
        const node = SKILL_TREE[lvl];
        if (!node) return;

        if (node.type === 'item') {
            result.itemSlots += node.slots || 1;
        } else if (node.type === 'stat') {
            const opt = node.options.find(o => o.id === perks[lvl]);
            if (opt) Object.entries(opt.bonus).forEach(([k, v]) => { sums[k] += v; });
        } else if (node.type === 'final') {
            const opt = node.options.find(o => o.id === perks[lvl]);
            if (opt) result.finalKind = opt.kind;
        }
    });

    Object.keys(sums).forEach(k => { result.mult[k] = 1 + sums[k]; });
    return result;
}

// Nodos desbloqueados por nivel en los que aún no se ha elegido nada
function getPendingPerkCount(pkmn) {
    if (!pkmn) return 0;
    const level = Number(pkmn.level) || 1;
    const perks = pkmn.perks || {};
    return SKILL_NODE_LEVELS.filter(lvl => {
        const node = SKILL_TREE[lvl];
        return level >= lvl && node && (node.type === 'stat' || node.type === 'final') && !perks[lvl];
    }).length;
}

// Ataque final que se añade a los movimientos en combate
function buildFinalMove(primaryType, isSpecial) {
    return {
        name: FINAL_MOVE_NAMES[primaryType] || 'Ataque Final',
        type: primaryType,
        power: 150,
        isSpecial: !!isSpecial,
        energyGain: 0,
        cost: 100,
        isFinal: true
    };
}

// Títulos de jugador disponibles (un Pokémon a nivel 100 = un título)
function getPlayerTitles() {
    if (typeof userInventory === 'undefined') return [];
    const titles = [];
    userInventory.forEach(p => {
        if ((Number(p.level) || 1) >= 100) {
            const t = `Maestro de ${p.name}`;
            if (!titles.includes(t)) titles.push(t);
        }
    });
    return titles;
}

function findOwnedPokemon(pokemonId) {
    if (typeof userInventory === 'undefined') return null;
    return userInventory.find(x => Number(x.id) === Number(pokemonId)) || null;
}

function selectPerk(pokemonId, nodeLevel, optionId) {
    const p = findOwnedPokemon(pokemonId);
    const node = SKILL_TREE[nodeLevel];
    if (!p || !node || !node.options) return;
    if ((Number(p.level) || 1) < nodeLevel) return;

    p.perks = p.perks || {};
    if (p.perks[nodeLevel]) return; // ya elegido (solo se cambia reiniciando el árbol)
    if (!node.options.some(o => o.id === optionId)) return;

    p.perks[nodeLevel] = optionId;
    refreshAfterPerkChange(p);
}

function resetSkillTree(pokemonId) {
    const p = findOwnedPokemon(pokemonId);
    if (!p || !p.perks || Object.keys(p.perks).length === 0) return;

    const currencies = typeof getCurrencies === 'function' ? getCurrencies() : { coins: 0 };
    if ((currencies.coins || 0) < SKILL_RESPEC_COST) {
        alert(`Necesitas ${SKILL_RESPEC_COST} monedas para reiniciar el árbol y tienes ${currencies.coins || 0}.`);
        return;
    }
    if (!confirm(`¿Reiniciar el árbol de ${p.name} por ${SKILL_RESPEC_COST} monedas? Podrás volver a elegir todos los nodos.`)) return;

    currencies.coins -= SKILL_RESPEC_COST;
    if (typeof saveCurrencies === 'function') saveCurrencies(currencies);
    if (typeof updateCurrenciesUI === 'function') updateCurrenciesUI();

    p.perks = {};
    refreshAfterPerkChange(p);
}

function refreshAfterPerkChange(p) {
    if (typeof saveStorage === 'function') saveStorage();
    renderSkillTree(p.id);

    // Refresca el menú del Pokémon si está abierto (estadísticas nuevas) y el inventario
    const pm = document.getElementById('pokemon-modal');
    if (pm && pm.style.display === 'flex' && typeof openPokemonModal === 'function') {
        const idx = userInventory.findIndex(x => Number(x.id) === Number(p.id));
        if (idx !== -1) openPokemonModal(idx);
    }
    if (typeof renderInventory === 'function') renderInventory();
}

// ---------- Interfaz ----------

function injectSkillTreeStyles() {
    if (document.getElementById('skilltree-styles')) return;
    const st = document.createElement('style');
    st.id = 'skilltree-styles';
    st.textContent = `
    .st-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 10050; display: none; align-items: center; justify-content: center; padding: 15px; }
    .st-box { background: #0f172a; border: 1px solid rgba(0,242,254,0.4); border-radius: 12px; width: 100%; max-width: 580px; max-height: 92vh; overflow-y: auto; padding: 18px; color: #e2e8f0; position: relative; box-shadow: 0 0 30px rgba(0,0,0,0.6); }
    .st-close { position: absolute; top: 10px; right: 12px; background: none; border: none; color: #fff; font-size: 18px; cursor: pointer; }
    .st-head { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
    .st-head img { width: 64px; height: 64px; object-fit: contain; background: rgba(255,255,255,0.05); border-radius: 10px; }
    .st-head h2 { margin: 0; font-family: 'Orbitron', sans-serif; font-size: 1.1rem; color: #00f2fe; }
    .st-summary { background: rgba(0,0,0,0.3); border-radius: 8px; padding: 8px 10px; font-size: 12px; color: #94a3b8; margin-bottom: 12px; line-height: 1.6; }
    .st-node { display: flex; gap: 10px; margin-bottom: 10px; }
    .st-level { flex: 0 0 52px; text-align: center; font-family: 'Orbitron', sans-serif; font-size: 12px; padding: 8px 0; border-radius: 8px; background: #1e293b; color: #64748b; border: 1px solid #334155; height: fit-content; }
    .st-node.open .st-level { background: #0c4a6e; color: #38bdf8; border-color: #38bdf8; }
    .st-node.done .st-level { background: #14532d; color: #4ade80; border-color: #4ade80; }
    .st-body { flex: 1; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 8px 10px; }
    .st-node.locked .st-body { opacity: 0.45; }
    .st-title { font-weight: 700; font-size: 14px; margin-bottom: 6px; }
    .st-desc { font-size: 12px; color: #94a3b8; }
    .st-options { display: flex; gap: 6px; flex-wrap: wrap; }
    .st-opt { flex: 1 1 130px; background: #1e293b; border: 1px solid #334155; border-radius: 8px; color: #e2e8f0; padding: 7px 8px; text-align: left; cursor: pointer; font-size: 12px; }
    .st-opt b { display: block; font-size: 13px; margin-bottom: 2px; }
    .st-opt span { color: #94a3b8; }
    .st-opt:hover:not(:disabled) { border-color: #00f2fe; }
    .st-opt.chosen { background: #14532d; border-color: #4ade80; }
    .st-opt:disabled { cursor: not-allowed; opacity: 0.5; }
    .st-opt.chosen:disabled { opacity: 1; }
    .st-reset { width: 100%; margin-top: 8px; background: linear-gradient(135deg, #e11d48, #9f1239); border: none; color: #fff; padding: 9px; border-radius: 8px; font-weight: 700; cursor: pointer; }
    `;
    document.head.appendChild(st);
}

function openSkillTree(pokemonId) {
    injectSkillTreeStyles();

    let modal = document.getElementById('skilltree-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'skilltree-modal';
        modal.className = 'st-overlay';
        modal.addEventListener('click', e => { if (e.target === modal) closeSkillTree(); });
        document.body.appendChild(modal);
    }

    renderSkillTree(pokemonId);
    modal.style.display = 'flex';
}

function closeSkillTree() {
    const modal = document.getElementById('skilltree-modal');
    if (modal) modal.style.display = 'none';
}

function renderSkillTree(pokemonId) {
    const modal = document.getElementById('skilltree-modal');
    const p = findOwnedPokemon(pokemonId);
    if (!modal || !p) return;

    p.perks = p.perks || {};
    const level = Number(p.level) || 1;
    const pb = getPerkBonuses(p);

    const summaryParts = Object.entries(pb.mult)
        .filter(([, m]) => m > 1.0001)
        .map(([k, m]) => `+${Math.round((m - 1) * 100)}% ${SKILL_STAT_NAMES[k]}`);
    const summary = `
        <div><b>Bonificaciones activas:</b> ${summaryParts.length ? summaryParts.join(' · ') : 'ninguna todavía'}</div>
        <div>🎒 Ranuras de objeto: <b>${pb.itemSlots}</b> &nbsp;|&nbsp; 💥 Ataque final: <b>${pb.finalKind ? (pb.finalKind === 'phys' ? 'Físico' : 'Especial') : 'no aprendido'}</b></div>
    `;

    const nodesHtml = SKILL_NODE_LEVELS.map(lvl => {
        const node = SKILL_TREE[lvl];
        const unlocked = level >= lvl;
        const chosenId = p.perks[lvl];
        const needsChoice = node.type === 'stat' || node.type === 'final';

        let state = 'locked';
        if (unlocked) state = (!needsChoice || chosenId) ? 'done' : 'open';

        let inner = '';
        if (needsChoice) {
            inner = `<div class="st-options">` + node.options.map(o => {
                const isChosen = chosenId === o.id;
                const disabled = !unlocked || !!chosenId;
                const detail = node.type === 'stat' ? formatSkillBonus(o.bonus) : o.desc;
                return `
                    <button class="st-opt ${isChosen ? 'chosen' : ''}" ${disabled ? 'disabled' : ''}
                        onclick="selectPerk(${p.id}, ${lvl}, '${o.id}')">
                        <b>${o.icon} ${o.name}</b><span>${detail}</span>
                    </button>`;
            }).join('') + `</div>`;
        } else if (node.type === 'item') {
            inner = `<div class="st-desc">${node.desc} ${unlocked ? '✅' : '🔒'}</div>`;
        } else if (node.type === 'title') {
            inner = `<div class="st-desc">${node.desc} <b>«Maestro de ${p.name}»</b> ${unlocked ? '✅' : '🔒'}</div>`;
        }

        return `
            <div class="st-node ${state}">
                <div class="st-level">Nv.<br>${lvl}</div>
                <div class="st-body">
                    <div class="st-title">${node.title} ${state === 'open' ? '<span style="color:#fbbf24;">¡Elige!</span>' : ''}</div>
                    ${inner}
                </div>
            </div>`;
    }).join('');

    const hasPerks = Object.keys(p.perks).length > 0;

    modal.innerHTML = `
        <div class="st-box">
            <button class="st-close" onclick="closeSkillTree()">✖</button>
            <div class="st-head">
                <img src="${p.sprite || ''}" alt="${p.name}">
                <div>
                    <h2>🌳 Árbol de ${p.name}</h2>
                    <div style="font-size:12px; color:#94a3b8;">Nivel ${level} · un nodo cada 10 niveles</div>
                </div>
            </div>
            <div class="st-summary">${summary}</div>
            ${nodesHtml}
            ${hasPerks ? `<button class="st-reset" onclick="resetSkillTree(${p.id})">♻️ Reiniciar árbol (${SKILL_RESPEC_COST} 🪙)</button>` : ''}
        </div>
    `;
}
