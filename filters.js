// filters.js - Buscador, filtros, orden y favoritos (pestañas Equipo y Dex)
//
// Equipo: buscar por nombre, nº o tipo · filtrar por rareza, tipo, generación, favoritos y "en el equipo" · ordenar.
// Dex:    buscar por nº (y por nombre solo los ya conseguidos) · filtrar por rareza, tipo, generación y estado.
// Favoritos: ⭐ en cada carta y en el menú del Pokémon. Se guardan en el propio Pokémon (pkmn.fav).
// Los filtros se recuerdan entre visitas.

const FILTERS_KEY = 'gachatara_filters';

const FILTER_TYPES = ['Normal', 'Fuego', 'Agua', 'Planta', 'Eléctrico', 'Hielo', 'Lucha', 'Veneno', 'Tierra', 'Volador',
    'Psíquico', 'Bicho', 'Roca', 'Fantasma', 'Dragón', 'Siniestro', 'Acero', 'Hada'];
const FILTER_RARITIES = [['comun', 'Común'], ['raro', 'Raro'], ['epico', 'Épico'], ['legendario', 'Legendario'], ['secreto', 'Secreto / Mega']];
const FILTER_SORTS = [['id', 'Nº Pokédex'], ['fav', 'Favoritos primero'], ['name', 'Nombre (A-Z)'], ['level', 'Nivel (mayor)'], ['rarity', 'Rareza (mayor)'], ['stars', 'Estrellas (más)']];
const FILTER_RARITY_ORDER = ['comun', 'raro', 'epico', 'legendario', 'secreto'];

const FILTER_DEFAULTS = {
    inventory: { search: '', rarity: '', type: '', gen: '', sort: 'id', favOnly: false, teamOnly: false },
    dex: { search: '', rarity: '', type: '', gen: '', status: 'all' }
};

let filterState = loadFilterState();

function loadFilterState() {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(FILTERS_KEY) || '{}') || {}; } catch (e) { saved = {}; }
    return {
        inventory: Object.assign({}, FILTER_DEFAULTS.inventory, saved.inventory || {}),
        dex: Object.assign({}, FILTER_DEFAULTS.dex, saved.dex || {})
    };
}
function saveFilterState() { localStorage.setItem(FILTERS_KEY, JSON.stringify(filterState)); }

// ---------- Utilidades ----------

function normText(text) {
    return String(text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

// Generación de un Pokémon (las megas se ubican por su nombre)
function getGenOfPokemon(p) {
    if (typeof GEN_RANGES === 'undefined') return 0;
    const id = Number(p.id);
    for (const [gen, r] of Object.entries(GEN_RANGES)) {
        if (id >= r.min && id <= r.max) return Number(gen);
    }
    const name = normText(p.name);
    for (const [gen, r] of Object.entries(GEN_RANGES)) {
        if ((r.megas || []).some(m => normText(m) === name)) return Number(gen);
    }
    return 0;
}

function rarityRank(p) {
    const i = FILTER_RARITY_ORDER.indexOf(normText(p.rarity || 'comun'));
    return i < 0 ? 0 : i;
}

function pokemonTypes(p) { return (p.types || [p.type || 'Normal']).map(normText); }

function matchesCommon(p, f) {
    if (f.rarity && normText(p.rarity || 'comun') !== f.rarity) return false;
    if (f.type && !pokemonTypes(p).includes(normText(f.type))) return false;
    if (f.gen && getGenOfPokemon(p) !== Number(f.gen)) return false;
    return true;
}

// ---------- Favoritos ----------

function isFavorite(p) { return !!(p && p.fav); }

function toggleFavorite(pokemonId) {
    if (typeof userInventory === 'undefined') return;
    const inv = userInventory.find(x => Number(x.id) === Number(pokemonId));
    if (!inv) return;
    inv.fav = !inv.fav;
    if (!inv.fav) delete inv.fav;

    if (typeof saveStorage === 'function') saveStorage();
    if (typeof renderInventory === 'function') renderInventory();
    const pm = document.getElementById('pokemon-modal');
    if (pm && pm.style.display === 'flex' && typeof openPokemonModal === 'function') openPokemonModal(inv.id);
}

// ---------- Equipo (inventario) ----------

function filtersMatchInventory(p) {
    const f = filterState.inventory;
    if (!matchesCommon(p, f)) return false;
    if (f.favOnly && !isFavorite(p)) return false;

    if (f.teamOnly) {
        const team = typeof getTeamArray === 'function' ? getTeamArray(currentTeamMode) : [];
        if (!team.some(t => Number(t.id) === Number(p.id))) return false;
    }

    const q = normText(f.search);
    if (!q) return true;
    if (q.startsWith('#')) return String(p.id) === q.slice(1).replace(/^0+/, '');   // #25 = exactamente el nº 25
    return normText(p.name).includes(q) || pokemonTypes(p).some(t => t.includes(q)) ||
        (/^\d+$/.test(q) && String(p.id).startsWith(q.replace(/^0+/, '')));
}

function sortInventoryList(list) {
    const sort = filterState.inventory.sort;
    const byId = (a, b) => Number(a.id) - Number(b.id);
    const out = list.slice();
    if (sort === 'name') out.sort((a, b) => a.name.localeCompare(b.name, 'es') || byId(a, b));
    else if (sort === 'level') out.sort((a, b) => (Number(b.level) || 1) - (Number(a.level) || 1) || byId(a, b));
    else if (sort === 'rarity') out.sort((a, b) => rarityRank(b) - rarityRank(a) || byId(a, b));
    else if (sort === 'stars') out.sort((a, b) => (b.stars || 0) - (a.stars || 0) || byId(a, b));
    else if (sort === 'fav') out.sort((a, b) => (isFavorite(b) ? 1 : 0) - (isFavorite(a) ? 1 : 0) || byId(a, b));
    else out.sort(byId);
    return out;
}

// ---------- Dex ----------

function filtersMatchDex(p, unlocked) {
    const f = filterState.dex;
    if (!matchesCommon(p, f)) return false;
    if (f.status === 'captured' && !unlocked) return false;
    if (f.status === 'missing' && unlocked) return false;

    const q = normText(f.search);
    if (!q) return true;
    if (q.startsWith('#')) return String(p.id) === q.slice(1).replace(/^0+/, '');
    if (/^\d+$/.test(q)) return String(p.id).startsWith(q.replace(/^0+/, ''));
    return unlocked && normText(p.name).includes(q);   // el nombre de los no conseguidos no se revela
}

// ---------- Barra de filtros ----------

function filterOptions(list, current, firstLabel) {
    return `<option value="">${firstLabel}</option>` + list.map(([v, l]) => `<option value="${v}" ${String(current) === String(v) ? 'selected' : ''}>${l}</option>`).join('');
}

function filterSelect(scope, key, optionsHtml) {
    return `<select onchange="setFilter('${scope}', '${key}', this.value)" style="background: #1e293b; border: 1px solid #334155; color: #fff; border-radius: 8px; padding: 8px 10px; font-size: 13px;">${optionsHtml}</select>`;
}

function filterCheck(scope, key, checked, label) {
    return `<label style="display: inline-flex; align-items: center; gap: 5px; font-size: 13px; color: #cbd5e1; cursor: pointer; white-space: nowrap;">
        <input type="checkbox" ${checked ? 'checked' : ''} onchange="setFilter('${scope}', '${key}', this.checked)"> ${label}</label>`;
}

function buildFilterBarHtml(scope) {
    const f = filterState[scope];
    const types = FILTER_TYPES.map(t => [t, t]);
    const gens = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(g => [g, `Gen ${g}`]);
    const placeholder = scope === 'dex' ? '🔍 Buscar por nº o nombre (conseguidos)...' : '🔍 Buscar por nombre, nº o tipo...';

    const controls = [
        `<input type="text" value="${String(f.search).replace(/"/g, '&quot;')}" placeholder="${placeholder}" oninput="setFilter('${scope}', 'search', this.value)" autocomplete="off"
            style="flex: 1 1 230px; max-width: 340px; background: #1e293b; border: 1px solid #334155; color: #fff; border-radius: 8px; padding: 8px 12px; font-size: 14px;">`,
        filterSelect(scope, 'rarity', filterOptions(FILTER_RARITIES, f.rarity, 'Todas las rarezas')),
        filterSelect(scope, 'type', filterOptions(types, f.type, 'Todos los tipos')),
        filterSelect(scope, 'gen', filterOptions(gens, f.gen, 'Todas las gens'))
    ];

    if (scope === 'inventory') {
        controls.push(filterSelect(scope, 'sort', FILTER_SORTS.map(([v, l]) => `<option value="${v}" ${f.sort === v ? 'selected' : ''}>Orden: ${l}</option>`).join('')));
        controls.push(filterCheck(scope, 'favOnly', f.favOnly, '⭐ Favoritos'));
        controls.push(filterCheck(scope, 'teamOnly', f.teamOnly, '🛡️ En el equipo'));
    } else {
        controls.push(filterSelect(scope, 'status', [['all', 'Todos'], ['captured', 'Conseguidos'], ['missing', 'Por conseguir']]
            .map(([v, l]) => `<option value="${v}" ${f.status === v ? 'selected' : ''}>${l}</option>`).join('')));
    }

    controls.push(`<button class="banner-btn" onclick="resetFilters('${scope}')">Limpiar</button>`);
    controls.push(`<span id="${scope}-results-count" style="font-size: 12px; color: #94a3b8;"></span>`);

    return `<div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center; justify-content: center; margin-bottom: 14px;">${controls.join('')}</div>`;
}

function renderFilterBar(scope) {
    const el = document.getElementById(`${scope}-filter-bar`);
    if (el) el.innerHTML = buildFilterBarHtml(scope);
}

function rerenderScope(scope) {
    if (scope === 'dex') { if (typeof renderDex === 'function') renderDex(); }
    else if (typeof renderInventory === 'function') renderInventory();
}

function setFilter(scope, key, value) {
    filterState[scope][key] = value;
    saveFilterState();
    rerenderScope(scope);
}

function resetFilters(scope) {
    filterState[scope] = Object.assign({}, FILTER_DEFAULTS[scope]);
    saveFilterState();
    renderFilterBar(scope);
    rerenderScope(scope);
}

// Se mantiene por compatibilidad con el botón antiguo
function clearInventorySearch() { resetFilters('inventory'); }

function hasActiveFilters(scope) {
    const f = filterState[scope], d = FILTER_DEFAULTS[scope];
    return Object.keys(d).some(k => f[k] !== d[k] && !(k === 'sort'));
}

document.addEventListener('DOMContentLoaded', () => {
    renderFilterBar('inventory');
    renderFilterBar('dex');
});
