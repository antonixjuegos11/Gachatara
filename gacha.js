// gacha.js - Sistema de Banners por Generación Garantizado

let currentGen = 1;

// Rangos de IDs por Generación
const GEN_RANGES = {
    1: { min: 1, max: 151, megas: ["Mega Venusaur", "Mega Charizard X", "Mega Charizard Y", "Mega Blastoise", "Mega Alakazam", "Mega Gengar", "Mega Kangaskhan", "Mega Pinsir", "Mega Gyarados", "Mega Aerodactyl", "Mega Mewtwo X", "Mega Mewtwo Y", "Mega Beedrill", "Mega Pidgeot", "Mega Slowbro"] },
    2: { min: 152, max: 251, megas: ["Mega Ampharos", "Mega Scizor", "Mega Heracross", "Mega Houndoom", "Mega Tyranitar", "Mega Steelix"] },
    3: { min: 252, max: 386, megas: ["Mega Blaziken", "Mega Gardevoir", "Mega Mawile", "Mega Aggron", "Mega Medicham", "Mega Manectric", "Mega Banette", "Mega Absol", "Mega Sceptile", "Mega Swampert", "Mega Sableye", "Mega Sharpedo", "Mega Camerupt", "Mega Altaria", "Mega Glalie", "Mega Salamence", "Mega Metagross", "Mega Latias", "Mega Latios", "Groudon Primigenio", "Kyogre Primigenio", "Mega Rayquaza"] },
    4: { min: 387, max: 493, megas: ["Mega Garchomp", "Mega Lucario", "Mega Abomasnow", "Mega Lopunny", "Mega Gallade"] },
    5: { min: 494, max: 649, megas: ["Mega Audino"] },
    6: { min: 650, max: 721, megas: ["Mega Diancie"] },
    7: { min: 722, max: 809, megas: [] },
    8: { min: 810, max: 905, megas: [] },
    9: { min: 906, max: 1025, megas: [] }
};

// Cambiar banner activo
function selectBanner(genNumber) {
    currentGen = genNumber;
    
    document.querySelectorAll('.banner-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`btn-gen-${genNumber}`);
    if (activeBtn) activeBtn.classList.add('active');

    const bannerTitle = document.getElementById('banner-title');
    if (bannerTitle) {
        bannerTitle.innerText = `BANNER GENERACIÓN ${genNumber}`;
    }

    if (typeof renderPityInfo === 'function') renderPityInfo();
}

// =========================================================
// GARANTÍAS DEL GACHA (pity)
// =========================================================
//  · Legendario: 5% base (4% legendario + 1% mega). Desde la tirada 30 sin legendario la probabilidad sube un 4% por tirada
//    y la tirada 50 es legendario (o mega) seguro.
//  · Épico o mejor: cada 10 tiradas sin conseguirlo, la siguiente lo es. La tirada x10 siempre incluye al menos un épico.
//  · Destacado semanal por generación: el 50% de los legendarios es el destacado; si sale otro, el siguiente legendario
//    es seguro el destacado (garantía 50/50).
//  · Chispa: cada tirada suma 1 punto; con 120 puedes elegir cualquier legendario de la generación del banner.
//  · Duplicados de un Pokémon ya a 7★ se convierten en monedas.

const PITY_KEY = 'gachatara_pity';
const PITY_SOFT_START = 30;
const PITY_SOFT_STEP = 0.04;
const PITY_HARD = 50;
const PITY_EPIC = 10;
const FEATURED_RATE = 0.5;
const SPARK_COST = 120;
const DUPLICATE_REFUND = { comun: 50, raro: 100, epico: 250, legendario: 600, secreto: 1000 };
const LEGEND_TIER = ['legendario', 'secreto'];
const EPIC_PLUS = ['epico', 'legendario', 'secreto'];

function getPity() {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(PITY_KEY) || '{}') || {}; } catch (e) { saved = {}; }
    return Object.assign({ sinceLegend: 0, sinceEpic: 0, spark: 0, featuredGuarantee: {}, itemSinceEpic: 0 }, saved);
}

function savePity(pity) {
    localStorage.setItem(PITY_KEY, JSON.stringify(pity));
}

// Determinar rareza (%) teniendo en cuenta las garantías
function rollRarity(pity = getPity(), forceEpic = false) {
    let legendChance = 0.05;
    if (pity.sinceLegend >= PITY_HARD - 1) legendChance = 1;
    else if (pity.sinceLegend >= PITY_SOFT_START - 1) legendChance += (pity.sinceLegend - (PITY_SOFT_START - 2)) * PITY_SOFT_STEP;
    legendChance = Math.min(1, legendChance);

    if (Math.random() < legendChance) return Math.random() < 0.2 ? 'secreto' : 'legendario';
    if (forceEpic || pity.sinceEpic >= PITY_EPIC - 1) return 'epico';

    // Resto de probabilidades originales (épico 15% · raro 30% · común 50%) sobre el 95% restante
    const r = Math.random() * 95;
    if (r < 15) return 'epico';
    if (r < 45) return 'raro';
    return 'comun';
}

// Legendario destacado de una generación (cambia cada lunes)
function getFeaturedPokemon(gen = currentGen) {
    if (typeof DATABASE === 'undefined') return null;
    const range = GEN_RANGES[gen];
    if (!range) return null;
    const pool = (DATABASE.legendario || []).filter(p => p.id >= range.min && p.id <= range.max).sort((a, b) => a.id - b.id);
    if (pool.length === 0) return null;
    const weekKey = typeof getWeekKey === 'function' ? getWeekKey() : getTodayString();
    const rng = seededRandom(hashString(`featured-${weekKey}-gen${gen}`));
    return pool[Math.floor(rng() * pool.length)];
}

// Obtener un Pokémon con garantías
function getRandomPokemonFromGen(rarity, excludeId = null) {
    if (typeof DATABASE === 'undefined') return null;

    const range = GEN_RANGES[currentGen] || GEN_RANGES[1];
    let pool = DATABASE[rarity] || [];

    // Filtrar Pokémon pertenecientes a la gen activa
    let filtered = pool.filter(pkmn => {
        if (!pkmn) return false;
        if (rarity === 'secreto') {
            return range.megas.some(m => m.toLowerCase().trim() === pkmn.name.toLowerCase().trim());
        }
        return pkmn.id >= range.min && pkmn.id <= range.max;
    });

    // FALLBACKS DE SEGURIDAD (Para no dejar ningún hueco nulo nunca)
    if (filtered.length === 0) {
        // Las megas NUNCA se cogen de otra generación: si esta no tiene, se baja a legendario de la misma gen
        filtered = (DATABASE.legendario || []).filter(pkmn => pkmn && pkmn.id >= range.min && pkmn.id <= range.max);
        if (filtered.length === 0) {
            filtered = (DATABASE.comun || []).filter(pkmn => pkmn && pkmn.id >= range.min && pkmn.id <= range.max);
        }
        if (filtered.length === 0) {
            filtered = DATABASE.comun || [];
        }
    }

    if (excludeId !== null) {
        const others = filtered.filter(p => p.id !== excludeId);
        if (others.length) filtered = others;
    }

    const randomIndex = Math.floor(Math.random() * filtered.length);
    return filtered[randomIndex] || null;
}

// Legendario con la garantía del destacado (50/50)
function pickLegendary(pity) {
    const featured = getFeaturedPokemon();
    if (!featured) return getRandomPokemonFromGen('legendario');

    if (pity.featuredGuarantee[currentGen] || Math.random() < FEATURED_RATE) {
        pity.featuredGuarantee[currentGen] = false;
        return featured;
    }
    pity.featuredGuarantee[currentGen] = true;
    return getRandomPokemonFromGen('legendario', featured.id) || featured;
}

// Tirada individual con reintento forzado
function executeSinglePull(opts = {}) {
    const pity = opts.pity || getPity();
    const rarity = rollRarity(pity, !!opts.forceEpic);
    let result = rarity === 'legendario' ? pickLegendary(pity) : getRandomPokemonFromGen(rarity);

    if (!result && DATABASE.comun && DATABASE.comun.length > 0) {
        result = DATABASE.comun[Math.floor(Math.random() * DATABASE.comun.length)];
    }

    pity.sinceLegend = LEGEND_TIER.includes(rarity) ? 0 : pity.sinceLegend + 1;
    pity.sinceEpic = EPIC_PLUS.includes(rarity) ? 0 : pity.sinceEpic + 1;
    pity.spark += 1;
    if (!opts.pity) savePity(pity);

    return result;
}

// Tirada x10 garantizando exactamente 10 elementos siempre (y al menos un épico o mejor)
function executeMultiPull() {
    const pity = getPity();
    const pulls = [];
    while (pulls.length < 10) {
        const forceEpic = pulls.length === 9 && !pulls.some(p => EPIC_PLUS.includes(p.rarity));
        const pkmn = executeSinglePull({ pity, forceEpic });
        if (pkmn) {
            pulls.push(pkmn);
        }
    }
    savePity(pity);
    return pulls;
}

// --- FUNCIÓN DE REALIZAR TIRADA Y GUARDAR EN EL INVENTARIO/EQUIPO ---
function pullGacha(amount) {
    const resultsContainer = document.getElementById('gacha-results');
    if (!resultsContainer) return;

    // 1. Obtener el saldo de monedas/tickets
    const currencies = getCurrencies();

    // 2. Verificar si tiene suficientes tickets
    if (currencies.tickets < amount) {
        alert(`¡No tienes suficientes tickets! Necesitas ${amount} ticket(s) y tienes ${currencies.tickets}.`);
        return;
    }

    // 3. Descontar tickets y guardar los cambios
    currencies.tickets -= amount;
    saveCurrencies(currencies);

    // 4. Limpiar los resultados anteriores
    resultsContainer.innerHTML = '';

    let pulls = [];
    if (amount === 1) {
        const result = executeSinglePull();
        if (result) pulls.push(result);
    } else {
        pulls = executeMultiPull();
    }

    // 5. Guardar cada Pokémon (los duplicados de un Pokémon ya a 7★ se convierten en monedas)
    const refunds = {};
    let refundTotal = 0;
    pulls.forEach((pkmn, index) => {
        if (!pkmn) return;
        const owned = userInventory.find(i => Number(i.id) === Number(pkmn.id));
        if (owned && (owned.stars || 0) >= 7) {
            const refund = DUPLICATE_REFUND[pkmn.rarity] || 50;
            refunds[index] = refund;
            refundTotal += refund;
        } else {
            addPokemonToInventory(pkmn);
        }
    });
    if (refundTotal > 0) {
        const cur = getCurrencies();
        cur.coins = (cur.coins || 0) + refundTotal;
        saveCurrencies(cur);
    }

    // Misiones
    if (typeof trackMission === 'function') {
        trackMission('pokemon_pull', pulls.length);
        const rare = pulls.filter(p => p && EPIC_PLUS.includes(p.rarity)).length;
        if (rare) trackMission('rare_pull', rare);
    }

    // 6. Pintar cartas en pantalla con animación
    const featured = getFeaturedPokemon();
    pulls.forEach((pkmn, index) => {
        if (!pkmn) return;

        const rawRarity = pkmn.rarity || 'comun';
        const cleanRarityClass = rawRarity.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        const card = document.createElement('div');
        card.className = `card-pokemon ${cleanRarityClass}`;
        card.style.animationDelay = `${(index * 0.1).toFixed(2)}s`;

        const isFeatured = featured && Number(featured.id) === Number(pkmn.id);
        card.innerHTML = `
            <img src="${pkmn.sprite}" alt="${pkmn.name}">
            <h4>${pkmn.name}</h4>
            <div class="card-rarity">${rawRarity.toUpperCase()}</div>
            ${isFeatured ? '<div style="font-size: 11px; color: #fbbf24;">⭐ DESTACADO</div>' : ''}
            ${refunds[index] ? `<div style="font-size: 11px; color: #4ade80;">Duplicado máx. → +${refunds[index]} 🪙</div>` : ''}
        `;

        resultsContainer.appendChild(card);
    });

    renderPityInfo();
}

// ---------- Información de garantías ----------

function pityBar(value, max, color, label) {
    const pct = Math.min(100, Math.floor((value / max) * 100));
    return `<div style="margin: 6px 0;">
        <div style="display: flex; justify-content: space-between; font-size: 12px; color: #cbd5e1;"><span>${label}</span><span>${value} / ${max}</span></div>
        <div style="background: #0f172a; border: 1px solid #334155; border-radius: 6px; height: 9px; overflow: hidden;"><div style="width: ${pct}%; height: 100%; background: ${color};"></div></div>
    </div>`;
}

function renderPityInfo() {
    const el = document.getElementById('gacha-pity-info');
    if (!el) return;

    const pity = getPity();
    const featured = getFeaturedPokemon();
    const untilLegend = Math.max(0, PITY_HARD - pity.sinceLegend);
    const softOn = pity.sinceLegend >= PITY_SOFT_START - 1;

    el.innerHTML = `
        <div style="max-width: 560px; margin: 0 auto 14px auto; background: rgba(255,255,255,0.04); border: 1px solid rgba(251,191,36,0.35); border-radius: 12px; padding: 12px 16px; color: #e2e8f0;">
            ${featured ? `
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                <img src="${featured.sprite}" alt="${featured.name}" style="width: 56px; height: 56px; object-fit: contain;">
                <div style="font-size: 13px; line-height: 1.4;">
                    <b style="color: #fbbf24;">⭐ Destacado de la semana: ${featured.name}</b><br>
                    El 50% de tus legendarios es el destacado.
                    ${pity.featuredGuarantee[currentGen] ? '<b style="color: #4ade80;"> ¡Tu próximo legendario será el destacado!</b>' : ''}
                </div>
            </div>` : ''}
            ${pityBar(pity.sinceLegend, PITY_HARD, softOn ? '#f59e0b' : '#a855f7', `Legendario seguro en ${untilLegend} tirada${untilLegend === 1 ? '' : 's'}${softOn ? ' · ¡probabilidad aumentada!' : ''}`)}
            ${pityBar(pity.sinceEpic, PITY_EPIC, '#3b82f6', 'Épico o mejor asegurado cada 10 tiradas')}
            ${pityBar(Math.min(pity.spark, SPARK_COST), SPARK_COST, '#4ade80', '✨ Chispa (1 por tirada)')}
            <div style="text-align: center; margin-top: 8px;">
                <button class="btn-pull" style="padding: 6px 16px; font-size: 13px; ${pity.spark >= SPARK_COST ? '' : 'opacity: .5; cursor: not-allowed;'}" ${pity.spark >= SPARK_COST ? '' : 'disabled'} onclick="openSparkExchange()">Canjear chispa: elige un legendario</button>
            </div>
            <div style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 6px;">La tirada x10 incluye siempre un épico o mejor. Los duplicados de un Pokémon a 7★ se convierten en monedas.</div>
        </div>`;
}

// ---------- Canje de chispa ----------

function openSparkExchange() {
    const range = GEN_RANGES[currentGen];
    const pool = (DATABASE.legendario || []).filter(p => range && p.id >= range.min && p.id <= range.max).sort((a, b) => a.id - b.id);
    if (pool.length === 0) { alert('No hay legendarios en esta generación.'); return; }

    let overlay = document.getElementById('spark-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'spark-overlay';
        overlay.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.78); z-index: 10070; display: flex; align-items: center; justify-content: center; padding: 15px;';
        overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
        document.body.appendChild(overlay);
    }
    overlay.style.display = 'flex';
    overlay.innerHTML = `
        <div style="background: #0f172a; border: 1px solid rgba(251,191,36,0.5); border-radius: 12px; width: 100%; max-width: 560px; max-height: 88vh; overflow-y: auto; padding: 16px; color: #e2e8f0; position: relative;">
            <button onclick="document.getElementById('spark-overlay').remove()" style="position: absolute; top: 10px; right: 12px; background: none; border: none; color: #fff; font-size: 18px; cursor: pointer;">✖</button>
            <h3 style="font-family: 'Orbitron', sans-serif; color: #fbbf24; font-size: 1rem; margin: 0 0 4px 0;">✨ Canje de chispa (${SPARK_COST})</h3>
            <div style="font-size: 12px; color: #94a3b8; margin-bottom: 10px;">Elige un legendario de la generación ${currentGen}.</div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 8px;">
                ${pool.map(p => `
                    <div style="background: rgba(255,255,255,0.04); border: 1px solid #334155; border-radius: 8px; padding: 8px; text-align: center;">
                        <img src="${p.sprite}" alt="${p.name}" style="width: 60px; height: 60px; object-fit: contain;">
                        <div style="font-size: 12px; margin: 2px 0 6px 0;">${p.name}</div>
                        <button class="btn-pull" style="padding: 4px 8px; font-size: 12px; width: 100%;" onclick="exchangeSpark(${p.id})">Elegir</button>
                    </div>`).join('')}
            </div>
        </div>`;
}

function exchangeSpark(pokemonId) {
    const pity = getPity();
    if (pity.spark < SPARK_COST) { alert('No tienes suficientes puntos de chispa.'); return; }
    const pkmn = (DATABASE.legendario || []).find(p => Number(p.id) === Number(pokemonId));
    if (!pkmn) return;

    pity.spark -= SPARK_COST;
    savePity(pity);

    const owned = userInventory.find(i => Number(i.id) === Number(pkmn.id));
    if (owned && (owned.stars || 0) >= 7) {
        const refund = DUPLICATE_REFUND.legendario;
        const cur = getCurrencies();
        cur.coins = (cur.coins || 0) + refund;
        saveCurrencies(cur);
    } else {
        addPokemonToInventory(pkmn);
    }

    const overlay = document.getElementById('spark-overlay');
    if (overlay) overlay.remove();
    if (typeof showShopToast === 'function') showShopToast(`✨ Has canjeado tu chispa por ${pkmn.name}`);
    renderPityInfo();
}

document.addEventListener('DOMContentLoaded', renderPityInfo);
