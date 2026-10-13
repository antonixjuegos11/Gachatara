// ranked.js - Combates clasificatorios: rangos y puntos (individual y doble por separado)

const RANKED_KEY = 'gachatara_ranked';
const RANK_POINTS_TO_PROMOTE = 100;   // puntos necesarios para subir de rango
const RANK_GAIN = [20, 30];           // puntos ganados por victoria
const RANK_FIRST_DEMOTABLE = 4;       // Masterball y Campeón pueden bajar de rango

const RANKS = [
    { id: 'pokeball',   name: 'Pokéball',        img: 'poke-ball',   icon: '⚪', loss: [5, 10],  color: '#ef4444' },
    { id: 'superball',  name: 'Superball',       img: 'great-ball',  icon: '🔵', loss: [5, 10],  color: '#3b82f6' },
    { id: 'ultraball',  name: 'Ultraball',       img: 'ultra-ball',  icon: '🟡', loss: [5, 10],  color: '#facc15' },
    { id: 'velozball',  name: 'Velozball',       img: 'quick-ball',  icon: '🔷', loss: [5, 10],  color: '#38bdf8' },
    { id: 'masterball', name: 'Masterball',      img: 'master-ball', icon: '🟣', loss: [15, 20], color: '#a855f7' },
    { id: 'campeon',    name: 'Campeón Pokémon', img: null,          icon: '🏆', loss: [15, 20], color: '#fbbf24' }
];

const RANKED_KINDS = {
    single: { name: 'Individual 6v6', icon: '⚔️' },
    double: { name: 'Doble 6v6', icon: '👥' }
};

function rankedRandInt(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}

function getRankedState() {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(RANKED_KEY) || '{}') || {}; } catch (e) { saved = {}; }
    const base = () => ({ rank: 0, points: 0, wins: 0, losses: 0 });
    return { single: Object.assign(base(), saved.single || {}), double: Object.assign(base(), saved.double || {}) };
}

function saveRankedState(state) {
    localStorage.setItem(RANKED_KEY, JSON.stringify(state));
}

// Aplica el resultado de una partida clasificatoria y devuelve el resumen para mostrarlo
function applyRankedResult(kind, won) {
    const state = getRankedState();
    const r = state[kind] || state.single;
    const before = { rank: r.rank, points: r.points };
    let delta, promoted = 0, demoted = false;

    if (won) {
        delta = rankedRandInt(RANK_GAIN[0], RANK_GAIN[1]);
        r.points += delta;
        r.wins += 1;
        while (r.rank < RANKS.length - 1 && r.points >= RANK_POINTS_TO_PROMOTE) {
            r.points -= RANK_POINTS_TO_PROMOTE;
            r.rank += 1;
            promoted += 1;
        }
    } else {
        const [lo, hi] = RANKS[r.rank].loss;
        delta = -rankedRandInt(lo, hi);
        r.points += delta;
        r.losses += 1;
        if (r.points < 0) {
            if (r.rank >= RANK_FIRST_DEMOTABLE) {
                r.rank -= 1;
                r.points = Math.max(0, RANK_POINTS_TO_PROMOTE + r.points);
                demoted = true;
            } else {
                r.points = 0;
            }
        }
    }

    saveRankedState(state);
    return { kind, won, delta, before, after: { rank: r.rank, points: r.points }, promoted, demoted };
}

function rankImageHtml(rankIdx, size = 36) {
    const rank = RANKS[rankIdx] || RANKS[0];
    if (!rank.img) return `<span style="font-size: ${Math.round(size * 0.85)}px; line-height: 1;">${rank.icon}</span>`;
    const url = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${rank.img}.png`;
    return `<img src="${url}" alt="${rank.name}" style="width: ${size}px; height: ${size}px; image-rendering: pixelated; vertical-align: middle;" onerror="this.replaceWith(document.createTextNode('${rank.icon}'))">`;
}

function rankProgressHtml(r) {
    const rank = RANKS[r.rank];
    if (r.rank >= RANKS.length - 1) {
        return `<div style="font-size: 13px; color: ${rank.color}; margin-top: 6px;">${r.points} puntos de campeón</div>`;
    }
    const pct = Math.min(100, Math.max(0, Math.floor((r.points / RANK_POINTS_TO_PROMOTE) * 100)));
    return `
        <div style="background: #0f172a; border: 1px solid #334155; border-radius: 6px; height: 10px; overflow: hidden; margin-top: 6px;">
            <div style="width: ${pct}%; height: 100%; background: ${rank.color};"></div>
        </div>
        <div style="font-size: 12px; color: #94a3b8; margin-top: 3px;">${r.points} / ${RANK_POINTS_TO_PROMOTE} puntos</div>`;
}

// Tarjeta del menú de combate para un tipo de clasificatorio
function renderRankedCard(kind) {
    const r = getRankedState()[kind];
    const rank = RANKS[r.rank];
    const info = RANKED_KINDS[kind];
    return `
        <div style="flex: 1 1 260px; max-width: 340px; background: rgba(255,255,255,0.04); border: 1px solid ${rank.color}; border-radius: 12px; padding: 14px; text-align: center;">
            <div style="font-family: 'Orbitron', sans-serif; font-size: 13px; color: #e2e8f0; margin-bottom: 8px;">${info.icon} ${info.name}</div>
            <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
                ${rankImageHtml(r.rank, 44)}
                <div style="text-align: left;">
                    <div style="font-weight: 700; font-size: 17px; color: ${rank.color};">${rank.name}</div>
                    <div style="font-size: 11px; color: #94a3b8;">${r.wins} V · ${r.losses} D</div>
                </div>
            </div>
            ${rankProgressHtml(r)}
            <button class="btn-pull" style="margin-top: 12px; width: 100%;" onclick="startMode('ranked-${kind}')">Jugar clasificatorio</button>
        </div>`;
}

// Bloque que se añade al cartel final del combate clasificatorio
function getRankedResultHtml() {
    const res = typeof CombatState !== 'undefined' ? CombatState.rankedResult : null;
    if (!res) return '';
    const beforeRank = RANKS[res.before.rank], afterRank = RANKS[res.after.rank];
    let banner = '';
    if (res.promoted > 0) banner = `<div style="color: #4ade80; font-weight: 700; margin-top: 6px;">🎉 ¡Subes a ${afterRank.name}!</div>`;
    else if (res.demoted) banner = `<div style="color: #f87171; font-weight: 700; margin-top: 6px;">⬇️ Bajas a ${afterRank.name}</div>`;

    return `
        <div class="levelup-box" style="margin-top: 10px;">
            <h4>🏅 Clasificatorio ${RANKED_KINDS[res.kind].name}</h4>
            <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin: 6px 0;">
                ${rankImageHtml(res.after.rank, 40)}
                <div style="text-align: left;">
                    <div style="font-weight: 700; color: ${afterRank.color};">${afterRank.name}</div>
                    <div style="font-size: 14px; color: ${res.delta >= 0 ? '#4ade80' : '#f87171'};">${res.delta >= 0 ? '+' : ''}${res.delta} puntos</div>
                </div>
            </div>
            ${banner}
            ${res.after.rank < RANKS.length - 1 ? `<div style="font-size: 12px; color: #94a3b8;">${res.after.points} / ${RANK_POINTS_TO_PROMOTE} puntos para el siguiente rango</div>` : `<div style="font-size: 12px; color: #94a3b8;">${res.after.points} puntos de campeón</div>`}
        </div>`;
}
