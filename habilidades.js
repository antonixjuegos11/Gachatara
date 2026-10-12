// habilidades.js - Motor completo de habilidades (traducciones + efectos en combate)

const ABILITIES_TRANSLATIONS = {
    "stench": "Hedor",
    "drizzle": "Llovizna",
    "speed-boost": "Impulso",
    "battle-armor": "Armadura Batalla",
    "sturdy": "Robustez",
    "damp": "Humedad",
    "limber": "Flexibilidad",
    "sand-veil": "Velo Arena",
    "static": "Electricidad Estática",
    "volt-absorb": "Absorbe Electricidad",
    "water-absorb": "Absorbe Agua",
    "oblivious": "Despiste",
    "cloud-nine": "Aclimatación",
    "compound-eyes": "Ojo Compuesto",
    "insomnia": "Insomnio",
    "color-change": "Cambio Color",
    "immunity": "Inmunidad",
    "flash-fire": "Absorbe Fuego",
    "shield-dust": "Polvo Escudo",
    "own-tempo": "Ritmo Propio",
    "suction-cups": "Ventosas",
    "intimidate": "Intimidación",
    "shadow-tag": "Sombra Trampa",
    "rough-skin": "Piel Tosca",
    "wonder-guard": "Superguarda",
    "levitate": "Levitación",
    "effect-spore": "Efecto Espora",
    "synchronize": "Sincronía",
    "clear-body": "Cuerpo Puro",
    "natural-cure": "Cura Natural",
    "lightning-rod": "Pararrayos",
    "serene-grace": "Dicha",
    "swift-swim": "Nado Rápido",
    "chlorophyll": "Clorofila",
    "illuminate": "Iluminación",
    "trace": "Rastro",
    "huge-power": "Potencia",
    "poison-point": "Punto Tóxico",
    "inner-focus": "Foco Interno",
    "magma-armor": "Escudo Magma",
    "water-veil": "Velo Agua",
    "magnet-pull": "Imán",
    "soundproof": "Insonorizar",
    "rain-dish": "Cura Lluvia",
    "sand-stream": "Chorro Arena",
    "pressure": "Presión",
    "thick-fat": "Sebo",
    "early-bird": "Madrugar",
    "flame-body": "Cuerpo Llama",
    "run-away": "Fuga",
    "keen-eye": "Vista Lince",
    "hyper-cutter": "Corte Fuerte",
    "pickup": "Recogida",
    "truant": "Ausente",
    "hustle": "Entusiasmo",
    "cute-charm": "Gran Encanto",
    "plus": "Más",
    "minus": "Menos",
    "forecast": "Predicción",
    "sticky-hold": "Viscosidad",
    "shed-skin": "Mudar",
    "guts": "Agallas",
    "marvel-scale": "Escama Especial",
    "liquid-ooze": "Lodo Líquido",
    "overgrow": "Espesura",
    "blaze": "Mar Llamas",
    "torrent": "Torrente",
    "swarm": "Enjambre",
    "rock-head": "Cabeza Roca",
    "drought": "Sequía",
    "arena-trap": "Trampa Arena",
    "vital-spirit": "Espíritu Vital",
    "white-smoke": "Humo Blanco",
    "pure-power": "Energía Pura",
    "shell-armor": "Caparazón",
    "cacophony": "Cacofonía",
    "air-lock": "Bucle Aire",
    "tangled-feet": "Tumbos",
    "motor-drive": "Electromotor",
    "rivalry": "Rivalidad",
    "steadfast": "Impasible",
    "snow-cloak": "Manto Níveo",
    "gluttony": "Gula",
    "anger-point": "Irascible",
    "unburden": "Liviano",
    "heatproof": "Ignífugo",
    "simple": "Simple",
    "dry-skin": "Piel Seca",
    "download": "Descarga",
    "iron-fist": "Puño Férreo",
    "poison-heal": "Antídoto",
    "adaptability": "Adaptable",
    "skill-link": "Encadenado",
    "hydration": "Hidratación",
    "solar-power": "Poder Solar",
    "quick-feet": "Pies Rápidos",
    "normalize": "Normalidad",
    "sniper": "Francotirador",
    "magic-guard": "Muro Mágico",
    "no-guard": "Indefenso",
    "stall": "Rezagado",
    "technician": "Experto",
    "leaf-guard": "Defensa Hoja",
    "klutz": "Zoquete",
    "mold-breaker": "Rompemoldes",
    "super-luck": "Afortunado",
    "aftermath": "Cálculo Final",
    "anticipation": "Anticipación",
    "forewarn": "Alerta",
    "unaware": "Ignorante",
    "tinted-lens": "Cromolente",
    "filter": "Filtro",
    "slow-start": "Inicio Lento",
    "scrappy": "Intrépido",
    "storm-drain": "Colector",
    "ice-body": "Gélido",
    "solid-rock": "Roca Sólida",
    "snow-warning": "Nevada",
    "honey-gather": "Recogemiel",
    "frisk": "Cacheo",
    "reckless": "Audaz",
    "multitype": "Multitipo",
    "flower-gift": "Don Floral",
    "bad-dreams": "Mal Sueño",
    "pickpocket": "Hurto",
    "sheer-force": "Poder Bruto",
    "contrary": "Respondón",
    "unnerve": "Nerviosismo",
    "defiant": "Competitivo",
    "defeatist": "Flaqueza",
    "cursed-body": "Cuerpo Maldito",
    "healer": "Alma Cura",
    "friend-guard": "Compiescolta",
    "weak-armor": "Armadura Frágil",
    "heavy-metal": "Metal Pesado",
    "light-metal": "Metal Liviano",
    "multiscale": "Multiescama",
    "toxic-boost": "Ímpetu Tóxico",
    "flare-boost": "Ímpetu Ardiente",
    "harvest": "Cosecha",
    "telepathy": "Telepatía",
    "imposter": "Impostor",
    "moody": "Veleta",
    "overcoat": "Funda",
    "poison-touch": "Toque Tóxico",
    "regenerator": "Regeneración",
    "big-pecks": "Sacapecho",
    "sand-rush": "Ímpetu Arena",
    "wonder-skin": "Piel Milagro",
    "analytic": "Cálculo Final",
    "illusion": "Ilusión",
    "imposter": "Impostor",
    "infiltrator": "Allanamiento",
    "moxie": "Autoestima",
    "justified": "Justiciero",
    "rattled": "Cobardía",
    "magic-bounce": "Espejo Mágico",
    "herbivore": "Herbívoro",
    "prankster": "Bromista",
    "sand-force": "Poder Arena",
    "iron-barbs": "Punta Acero",
    "zen-mode": "Modo Daruma",
    "victory-star": "Tinovictoria",
    "turboblaze": "Turbollama",
    "teravolt": "Terravoltaje"
};


// =========================================================
// NOMBRES EN ESPAÑOL ADICIONALES (habilidades sin traducción)
// =========================================================
Object.assign(ABILITIES_TRANSLATIONS, {
    "sap-sipper": "Herbívoro", "mummy": "Momia", "aroma-veil": "Velo Aroma", "flower-veil": "Velo Flor",
    "cheek-pouch": "Carrillo", "protean": "Mutatipo", "fur-coat": "Pelaje Recio", "magician": "Prestidigitador",
    "bulletproof": "Antibalas", "competitive": "Tenacidad", "strong-jaw": "Mandíbula Fuerte",
    "refrigerate": "Piel Helada", "sweet-veil": "Velo Dulce", "stance-change": "Cambio Táctico",
    "gale-wings": "Alas Vendaval", "mega-launcher": "Megadisparador", "grass-pelt": "Manto Frondoso",
    "symbiosis": "Simbiosis", "tough-claws": "Garra Dura", "pixilate": "Piel Feérica", "gooey": "Baba",
    "aerilate": "Piel Celeste", "parental-bond": "Amor Filial", "dark-aura": "Aura Oscura",
    "fairy-aura": "Aura Feérica", "aura-break": "Rompeaura", "primordial-sea": "Mar del Albor",
    "desolate-land": "Tierra del Ocaso", "delta-stream": "Ráfaga Delta", "stamina": "Firmeza",
    "wimp-out": "Huida", "emergency-exit": "Retirada", "water-compaction": "Hidrorrefuerzo",
    "merciless": "Ensañamiento", "shields-down": "Escudo Limitado", "stakeout": "Vigilante",
    "water-bubble": "Pompa", "steelworker": "Metalúrgico", "berserk": "Cólera", "slush-rush": "Quitanieves",
    "long-reach": "Remoto", "liquid-voice": "Voz Fluida", "triage": "Primer Auxilio", "galvanize": "Piel Eléctrica",
    "surge-surfer": "Cola Surf", "schooling": "Banco", "disguise": "Disfraz", "battle-bond": "Fuerte Afecto",
    "power-construct": "Agrupamiento", "corrosion": "Corrosión", "comatose": "Letargo Perenne",
    "queenly-majesty": "Regia Presencia", "innards-out": "Revés", "dancer": "Pareja de Baile",
    "battery": "Batería", "fluffy": "Peluche", "dazzling": "Cuerpo Vívido", "soul-heart": "Coránima",
    "tangling-hair": "Rizos Rebeldes", "receiver": "Receptor", "power-of-alchemy": "Reacción Química",
    "beast-boost": "Ultraimpulso", "rks-system": "Sistema Alfa", "electric-surge": "Electrogénesis",
    "psychic-surge": "Psicogénesis", "misty-surge": "Nebulogénesis", "grassy-surge": "Herbogénesis",
    "full-metal-body": "Guardametal", "shadow-shield": "Guardia Espectro", "prism-armor": "Armadura Prisma",
    "neuroforce": "Fuerza Cerebral", "intrepid-sword": "Espada Indómita", "dauntless-shield": "Escudo Recio",
    "libero": "Líbero", "ball-fetch": "Recogebolas", "cotton-down": "Pelusa", "propeller-tail": "Hélice Caudal",
    "mirror-armor": "Coraza Reflejo", "gulp-missile": "Tragamisil", "stalwart": "Acérrimo",
    "steam-engine": "Combustible", "punk-rock": "Punk Rock", "sand-spit": "Expulsarena",
    "ice-scales": "Escama de Hielo", "ripen": "Maduración", "ice-face": "Cara de Hielo",
    "power-spot": "Fuente Energía", "mimicry": "Mimetismo", "screen-cleaner": "Antibarrera",
    "steely-spirit": "Alma Acerada", "perish-body": "Cuerpo Mortal", "wandering-spirit": "Alma Errante",
    "gorilla-tactics": "Monotema", "neutralizing-gas": "Gas Reactivo", "pastel-veil": "Velo Pastel",
    "hunger-switch": "Mutapetito", "quick-draw": "Mano Rápida", "unseen-fist": "Puño Invisible",
    "curious-medicine": "Medicina Extraña", "transistor": "Transistor", "dragons-maw": "Mandíbula Dragón",
    "chilling-neigh": "Relincho Blanco", "grim-neigh": "Relincho Negro", "lingering-aroma": "Olor Persistente",
    "seed-sower": "Sembrador", "thermal-exchange": "Termoconversión", "purifying-salt": "Sal Purificadora",
    "well-baked-body": "Cuerpo Horneado", "wind-rider": "Surcavientos", "guard-dog": "Perro Guardián",
    "rocky-payload": "Carga Pétrea", "wind-power": "Energía Eólica", "analytic": "Analítico"
});

function getAbilityDisplayName(abilityKey) {
    if (!abilityKey || abilityKey === 'none') return 'Ninguna';
    const cleanKey = String(abilityKey).toLowerCase().trim();
    return ABILITIES_TRANSLATIONS[cleanKey] || (typeof formatPokemonName === 'function' ? formatPokemonName(cleanKey) : cleanKey);
}

function getAbilityDescription(abilityKey) {
    if (!abilityKey || abilityKey === 'none') return '';
    const h = AB[String(abilityKey).toLowerCase().trim()];
    return h ? h.desc : 'Habilidad sin efecto especial en combate.';
}

// =========================================================
// UTILIDADES DEL MOTOR
// =========================================================

const AB = {};
const ABILITIES_DB = AB; // alias por compatibilidad

function defineAbility(keys, desc, handlers) {
    (Array.isArray(keys) ? keys : [keys]).forEach(k => { AB[k] = Object.assign({ desc: desc }, handlers || {}); });
}

const STAT_ES = { atk: 'Ataque', def: 'Defensa', spAtk: 'At. Esp.', spDef: 'Def. Esp.', spd: 'Velocidad' };
const MOLD_BREAKER_IGNORES = new Set([
    'levitate', 'sturdy', 'wonder-guard', 'multiscale', 'filter', 'solid-rock', 'prism-armor', 'thick-fat',
    'heatproof', 'flash-fire', 'volt-absorb', 'water-absorb', 'lightning-rod', 'storm-drain', 'sap-sipper',
    'motor-drive', 'dry-skin', 'fluffy', 'fur-coat', 'marvel-scale', 'battle-armor', 'shell-armor',
    'bulletproof', 'water-bubble', 'magic-bounce', 'limber', 'insomnia', 'vital-spirit', 'immunity',
    'water-veil', 'magma-armor', 'sweet-veil', 'leaf-guard', 'shield-dust', 'sand-veil', 'snow-cloak',
    'tangled-feet', 'earth-eater', 'well-baked-body', 'wind-rider', 'ice-scales', 'friend-guard',
    'wonder-skin', 'shadow-shield', 'purifying-salt', 'thermal-exchange', 'pastel-veil', 'good-as-gold'
]);

function abKey(u) { return u && u.ability ? String(u.ability).toLowerCase().trim() : ''; }
function abName(u) { return getAbilityDisplayName(abKey(u)); }

function ensureUnit(u) {
    if (!u) return u;
    if (!u.mods) u.mods = { atk: 1, def: 1, spAtk: 1, spDef: 1, spd: 1 };
    if (!u.flags) u.flags = {};
    if (!u.persist) u.persist = {};
    if (u.turnsIn === undefined) u.turnsIn = 0;
    return u;
}

function resetUnitForEntry(u) {
    u.mods = { atk: 1, def: 1, spAtk: 1, spDef: 1, spd: 1 };
    u.flags = { justEntered: true };
    u.turnsIn = 0;
    if (!u.persist) u.persist = {};
}

function logAb(msg) { if (msg && typeof addCombatLog === 'function') addCombatLog(msg); }
function hasT(u, t) { return !!u && (u.types || [u.type]).includes(t); }
function isFlyer(u) { return hasT(u, 'Volador') || abKey(u) === 'levitate'; }
function isContactMove(move, attacker) { return !!move && !move.isSpecial && move.power > 0 && abKey(attacker) !== 'long-reach'; }

function activePlayerUnit() { return CombatState.playerTeam[CombatState.activePlayerIndex]; }
function activeEnemyUnit() { return CombatState.enemyTeam[CombatState.activeEnemyIndex]; }

function foeOf(unit) {
    if (typeof CombatState === 'undefined' || !unit) return null;
    if (CombatState.playerTeam.includes(unit)) return activeEnemyUnit() || null;
    if (CombatState.enemyTeam.includes(unit)) return activePlayerUnit() || null;
    return null;
}

function teamOf(unit) {
    if (typeof CombatState === 'undefined') return [];
    if (CombatState.playerTeam.includes(unit)) return CombatState.playerTeam;
    if (CombatState.enemyTeam.includes(unit)) return CombatState.enemyTeam;
    return [];
}

// Gas Reactivo: anula las habilidades del rival mientras esté en combate
function suppressed(unit) {
    if (!unit) return true;
    if (unit.flags && unit.flags.noAbility) return true;
    const foe = foeOf(unit);
    return !!(foe && foe.currentHp > 0 && abKey(foe) === 'neutralizing-gas' && abKey(unit) !== 'neutralizing-gas' && !(foe.flags && foe.flags.noAbility));
}

function breaksMold(unit) {
    if (!unit || suppressed(unit)) return false;
    const h = AB[abKey(unit)];
    return !!(h && h.ignoreAbilities);
}

function handlerOf(unit, attacker) {
    if (!unit || !unit.ability || unit.ability === 'none') return null;
    if (suppressed(unit)) return null;
    const key = abKey(unit);
    const h = AB[key];
    if (!h) return null;
    if (attacker && attacker !== unit && MOLD_BREAKER_IGNORES.has(key) && breaksMold(attacker)) return null;
    return h;
}

function hasAb(unit, key) { return abKey(unit) === key && !!handlerOf(unit); }

function indirect(unit, amount) {
    if (!unit || amount <= 0 || unit.currentHp <= 0) return 0;
    if (hasAb(unit, 'magic-guard')) return 0;
    const dealt = Math.min(unit.currentHp, Math.max(1, Math.floor(amount)));
    unit.currentHp -= dealt;
    return dealt;
}

function healFrac(unit, frac) {
    if (!unit || unit.currentHp <= 0) return 0;
    const amt = Math.max(1, Math.floor(unit.maxHp * frac));
    const before = unit.currentHp;
    unit.currentHp = Math.min(unit.maxHp, unit.currentHp + amt);
    return unit.currentHp - before;
}

// ---------- Cambios de estadísticas (en combate, se reinician al salir) ----------

function clampMod(v) { return Math.min(3, Math.max(0.4, v)); }

function boostStat(unit, stat, factor) {
    ensureUnit(unit);
    let f = factor;
    if (hasAb(unit, 'contrary')) f = 1 / f;
    if (hasAb(unit, 'simple')) f = Math.pow(f, 2);
    unit.mods[stat] = clampMod(unit.mods[stat] * f);
    return f;
}

// Baja una estadística aplicando inmunidades y reacciones (Cuerpo Puro, Competitivo, Coraza Reflejo...)
function lowerStat(target, stat, factor, source) {
    ensureUnit(target);
    const key = abKey(target);
    const h = handlerOf(target);
    const fromFoe = source && source !== target;

    if (h && fromFoe) {
        if (key === 'mirror-armor') {
            const reflected = lowerStat(source, stat, factor, null);
            return `🪞 ¡${abName(target)} de ${target.name} devolvió el efecto! ${reflected}`;
        }
        const blocks = ['clear-body', 'white-smoke', 'full-metal-body'].includes(key) ||
            (key === 'hyper-cutter' && stat === 'atk') || (key === 'big-pecks' && stat === 'def');
        if (blocks) return `🛡️ ¡${abName(target)} de ${target.name} impide que le bajen ${STAT_ES[stat]}!`;
    }

    const before = target.mods[stat];
    boostStat(target, stat, factor);
    const dropped = target.mods[stat] < before;
    let msg = `${dropped ? '📉' : '📈'} ¡${STAT_ES[stat]} de ${target.name} ${dropped ? 'bajó' : 'subió'}!`;

    if (h && fromFoe && dropped) {
        if (key === 'defiant') { boostStat(target, 'atk', 1.5); msg += ` ¡${abName(target)} le sube el Ataque!`; }
        if (key === 'competitive') { boostStat(target, 'spAtk', 1.5); msg += ` ¡${abName(target)} le sube el At. Esp.!`; }
    }
    return msg;
}

function raiseMsg(unit, stat, factor, label) {
    boostStat(unit, stat, factor);
    return `📈 ¡${label || abName(unit)} de ${unit.name} subió su ${STAT_ES[stat]}!`;
}

// ---------- Clima y terreno ----------

function setWeather(type, turns = 5) {
    const st = CombatState;
    const primal = ['harsh-sun', 'heavy-rain', 'wind'];
    if (st.weather === type) return null;
    if (primal.includes(st.weather) && !primal.includes(type)) return null;
    st.weather = type;
    st.weatherTurns = primal.includes(type) ? 999 : turns;
    return {
        'rain': '🌧️ ¡Empezó a llover!', 'sun': '☀️ ¡El sol brilla intensamente!',
        'sand': '🌪️ ¡Se desató una tormenta de arena!', 'snow': '❄️ ¡Empezó a nevar!',
        'harsh-sun': '🔥 ¡El sol es abrasador!', 'heavy-rain': '🌊 ¡Cae una lluvia torrencial!',
        'wind': '💨 ¡Soplan vientos misteriosos!'
    }[type];
}

function setTerrain(type, turns = 5) {
    const st = CombatState;
    if (st.terrain === type) return null;
    st.terrain = type;
    st.terrainTurns = turns;
    return {
        'electric': '⚡ ¡Una corriente eléctrica recorre el campo!', 'grassy': '🌿 ¡El campo se llenó de hierba!',
        'misty': '🌫️ ¡La niebla cubre el campo!', 'psychic': '🔮 ¡El campo se volvió extraño!'
    }[type];
}

function weatherNow() {
    const st = CombatState;
    if (!st || !st.weather) return null;
    const act = [activePlayerUnit(), activeEnemyUnit()];
    if (act.some(u => u && u.currentHp > 0 && (abKey(u) === 'cloud-nine' || abKey(u) === 'air-lock') && !suppressed(u))) return null;
    return st.weather;
}
function sunny() { const w = weatherNow(); return w === 'sun' || w === 'harsh-sun'; }
function rainy() { const w = weatherNow(); return w === 'rain' || w === 'heavy-rain'; }
function sandy() { return weatherNow() === 'sand'; }
function snowy() { return weatherNow() === 'snow'; }
function terrainIs(t) { return !!CombatState && CombatState.terrain === t; }

// Multiplicador de daño por clima y terreno según el tipo del ataque
function fieldDamageMult(atkType) {
    let m = 1;
    const w = weatherNow();
    if (w === 'rain') { if (atkType === 'Agua') m *= 1.5; if (atkType === 'Fuego') m *= 0.5; }
    if (w === 'heavy-rain') { if (atkType === 'Agua') m *= 1.5; if (atkType === 'Fuego') m *= 0; }
    if (w === 'sun') { if (atkType === 'Fuego') m *= 1.5; if (atkType === 'Agua') m *= 0.5; }
    if (w === 'harsh-sun') { if (atkType === 'Fuego') m *= 1.5; if (atkType === 'Agua') m *= 0; }
    const t = CombatState.terrain;
    if (t === 'electric' && atkType === 'Eléctrico') m *= 1.3;
    if (t === 'grassy' && atkType === 'Planta') m *= 1.3;
    if (t === 'psychic' && atkType === 'Psíquico') m *= 1.3;
    if (t === 'misty' && atkType === 'Dragón') m *= 0.5;
    return m;
}

function weatherChipImmune(unit, w) {
    const key = hasAb(unit, abKey(unit)) ? abKey(unit) : '';
    if (key === 'magic-guard' || key === 'overcoat') return true;
    if (w === 'sand') return hasT(unit, 'Roca') || hasT(unit, 'Tierra') || hasT(unit, 'Acero') || ['sand-veil', 'sand-rush', 'sand-force'].includes(key);
    if (w === 'snow') return hasT(unit, 'Hielo') || ['ice-body', 'snow-cloak', 'slush-rush'].includes(key);
    return true;
}

// Se ejecuta al final de cada turno: duración del clima/terreno y daño de la tormenta
function processFieldEndTurn() {
    const st = CombatState;
    const units = [activePlayerUnit(), activeEnemyUnit()].filter(u => u && u.currentHp > 0);
    const w = weatherNow();

    if (w === 'sand' || w === 'snow') {
        units.forEach(u => {
            if (!weatherChipImmune(u, w)) {
                const d = indirect(u, u.maxHp / 16);
                if (d > 0) logAb(`${w === 'sand' ? '🌪️' : '❄️'} ¡${u.name} sufre ${d} de daño por ${w === 'sand' ? 'la tormenta de arena' : 'la nevada'}!`);
            }
        });
    }

    if (st.terrain === 'grassy') {
        units.forEach(u => {
            if (!isFlyer(u)) { const h = healFrac(u, 1 / 16); if (h > 0) logAb(`🌿 ¡${u.name} recupera ${h} HP del campo de hierba!`); }
        });
    }

    if (st.weather && st.weatherTurns < 900) {
        st.weatherTurns--;
        if (st.weatherTurns <= 0) {
            logAb({ rain: '🌤️ ¡Dejó de llover!', sun: '🌤️ ¡El sol vuelve a la normalidad!', sand: '🌤️ ¡Amainó la tormenta de arena!', snow: '🌤️ ¡Dejó de nevar!' }[st.weather] || '🌤️ ¡El clima se calmó!');
            st.weather = null;
        }
    }
    if (st.terrain) {
        st.terrainTurns--;
        if (st.terrainTurns <= 0) { logAb('🌤️ ¡El terreno volvió a la normalidad!'); st.terrain = null; }
    }
}

// ---------- Estados alterados ----------

function tryApplyStatus(target, status, source, cause) {
    if (!target || target.currentHp <= 0 || target.status || !status) return false;
    ensureUnit(target);

    if (terrainIs('misty') && !isFlyer(target)) return false;
    if (status === 'asleep' && terrainIs('electric') && !isFlyer(target)) return false;

    const h = handlerOf(target, source);
    if (h && h.status) {
        const r = h.status(target, status, source);
        if (r && r.reflect && source && source !== target) {
            logAb(`🪞 ¡${abName(target)} de ${target.name} devolvió el estado!`);
            return tryApplyStatus(source, status, null, abName(target));
        }
        if (r) { logAb(typeof r === 'string' ? r : `🛡️ ¡${abName(target)} de ${target.name} lo protege del estado!`); return false; }
    }

    target.status = status;
    if (status === 'asleep') {
        target.sleepTurns = 2 + Math.floor(Math.random() * 2);
        if (hasAb(target, 'early-bird')) target.sleepTurns = 1;
    }
    const es = (typeof STATUS_TRANSLATIONS !== 'undefined' && STATUS_TRANSLATIONS[status]) || status;
    logAb(`🦠 ¡${target.name} ha quedado ${es}!${cause ? ` (${cause})` : ''}`);

    if (source && source !== target && source.currentHp > 0 && ['poisoned', 'burned', 'paralyzed'].includes(status) && hasAb(target, 'synchronize')) {
        tryApplyStatus(source, status, null, abName(target));
    }
    return true;
}

// Probabilidad real de aplicar el efecto secundario de un ataque
function abilityStatusChance(attacker, defender, move, base) {
    const ha = handlerOf(attacker);
    if (ha && ha.noSecondary) return 0;
    const hd = handlerOf(defender, attacker);
    if (hd && hd.blocksSecondary) return 0;
    let c = base;
    if (ha && ha.statusChanceMult) c *= ha.statusChanceMult;
    return Math.min(1, c);
}

// Efecto de los estados al inicio del turno (Antídoto, Muro Mágico, Ignífugo...)
function abilityStatusTick(unit, status) {
    if (hasAb(unit, 'magic-guard')) return { damage: 0 };
    if (status === 'poisoned' && hasAb(unit, 'poison-heal')) return { heal: Math.max(1, Math.floor(unit.maxHp / 8)) };
    let dmg = Math.max(1, Math.floor(unit.maxHp * 0.1));
    if (status === 'burned' && hasAb(unit, 'heatproof')) dmg = Math.max(1, Math.floor(dmg / 2));
    return { damage: dmg };
}

// ---------- Ganchos de cálculo de daño ----------

function abilityModifyMove(attacker, defender, move) {
    const mv = { ...move, powerMult: 1 };
    const h = handlerOf(attacker);
    if (h && h.move) {
        const r = h.move(attacker, defender, mv);
        if (r) { if (r.type) mv.type = r.type; if (r.mult) mv.powerMult *= r.mult; }
    }
    if (!mv.type) mv.type = attacker.type || 'Normal';
    return mv;
}

function abilityCritInfo(attacker, defender) {
    let rate = 0.0625, mult = 1.5, blocked = false;
    const ha = handlerOf(attacker);
    if (ha) {
        if (ha.critRate) rate *= ha.critRate;
        if (ha.critMult) mult = ha.critMult;
        if (ha.critForce && ha.critForce(attacker, defender)) rate = 1;
    }
    const hd = handlerOf(defender, attacker);
    if (hd && hd.noCrit) blocked = true;
    return { rate, mult, blocked };
}

function abilityAdjustEffectiveness(attacker, defender, atkType, mult) {
    const ha = handlerOf(attacker);
    if (ha && ha.ignoresGhost && mult === 0 && hasT(defender, 'Fantasma') && (atkType === 'Normal' || atkType === 'Lucha')) {
        const rest = (defender.types || []).filter(t => t !== 'Fantasma');
        mult = getTypeEffectiveness(atkType, { types: rest.length ? rest : ['Normal'] });
    }
    if (weatherNow() === 'wind' && hasT(defender, 'Volador') && mult > 1 && ['Eléctrico', 'Hielo', 'Roca'].includes(atkType)) mult = mult / 2;
    return mult;
}

function abilityStabMult(attacker, atkType) {
    const h = handlerOf(attacker);
    const key = abKey(attacker);
    if (h && (key === 'protean' || key === 'libero')) return 1.5;
    if (hasT(attacker, atkType)) return (h && key === 'adaptability') ? 2.0 : 1.5;
    return 1.0;
}

function ignoresFoeMods(unit) { return hasAb(unit, 'unaware'); }

function runDamageHook(kind, owner, other, move, damage, c) {
    const h = kind === 'def' ? handlerOf(owner, other) : handlerOf(owner);
    if (!h || !h[kind]) return { damage, message: null };
    const r = h[kind](owner, other, move, Object.assign({}, c || {}, { damage }));
    if (r === undefined || r === null) return { damage, message: null };
    if (typeof r === 'number') return { damage: r <= 0 ? 0 : Math.max(1, Math.floor(damage * r)), message: null };
    let out = damage;
    if (r.damage !== undefined) out = r.damage;
    else if (r.mult !== undefined) out = r.mult <= 0 ? 0 : Math.max(1, Math.floor(damage * r.mult));
    return { damage: out, message: r.msg || null };
}

// Eventos posteriores al golpe: contacto, KO, etc.
function runEvent(eventName, owner, other, move, dmg, c) {
    const h = handlerOf(owner);
    if (!h || !h[eventName]) return null;
    return h[eventName](owner, other, move, dmg, c) || null;
}

function applyPostHitAbilities(attacker, defender, move, result) {
    const dmg = result.damage;
    if (!attacker || !defender || dmg <= 0) return;
    ensureUnit(attacker); ensureUnit(defender);

    const c = { contact: isContactMove(move, attacker), isCrit: result.isCrit, elementMult: result.elementMult, moveType: result.moveType, damage: dmg };

    if (defender.currentHp > 0) logAb(runEvent('hit', defender, attacker, move, dmg, c));
    else logAb(runEvent('faint', defender, attacker, move, dmg, c));

    if (attacker.currentHp > 0) logAb(runEvent('strike', attacker, defender, move, dmg, c));
    if (defender.currentHp <= 0 && attacker.currentHp > 0) logAb(runEvent('ko', attacker, defender, move, dmg, c));
}

// ---------- Cambios de Pokémon ----------

function abilityTrapMessage(unit) {
    const foe = foeOf(unit);
    if (!unit || !foe || foe.currentHp <= 0 || suppressed(foe)) return null;
    if (hasT(unit, 'Fantasma') || hasAb(unit, 'run-away')) return null;
    const fk = abKey(foe);
    if (fk === 'shadow-tag' && abKey(unit) !== 'shadow-tag') return `🕸️ ¡${abName(foe)} de ${foe.name} impide que ${unit.name} huya!`;
    if (fk === 'arena-trap' && !isFlyer(unit)) return `🕳️ ¡${abName(foe)} de ${foe.name} atrapa a ${unit.name}!`;
    if (fk === 'magnet-pull' && hasT(unit, 'Acero')) return `🧲 ¡${abName(foe)} de ${foe.name} atrae a ${unit.name} y no puede huir!`;
    return null;
}

// =========================================================
// DEFINICIÓN DE HABILIDADES
// =========================================================

// ---------- Fábricas ----------
const pinch = (type, icon) => ({
    atk: (s, f, mv, c) => (c.moveType === type && s.currentHp <= s.maxHp / 3)
        ? { mult: 1.5, msg: `${icon} ¡${abName(s)} potenció el ataque de ${s.name}!` } : 1
});
const typeBoost = (type, m) => ({ atk: (s, f, mv, c) => c.moveType === type ? m : 1 });
const physBoost = m => ({ atk: (s, f, mv) => !mv.isSpecial ? m : 1 });
const specBoost = m => ({ atk: (s, f, mv) => mv.isSpecial ? m : 1 });
const flatAtk = m => ({ atk: () => m });
const flatDef = m => ({ def: () => m });
const typeResist = (types, m) => ({ def: (s, f, mv, c) => types.includes(c.moveType) ? m : 1 });
const absorbType = (type, effect) => ({
    def: (s, f, mv, c) => c.moveType !== type ? 1 : { mult: 0, msg: `✨ ¡${abName(s)} de ${s.name} absorbió el ataque!${effect ? effect(s, f) : ''}` }
});
const healAbsorb = (type, frac) => absorbType(type, s => { const h = healFrac(s, frac); return h > 0 ? ` (+${h} HP)` : ''; });
const boostAbsorb = (type, stat, factor) => absorbType(type, s => { boostStat(s, stat, factor); return ` ¡Sube ${STAT_ES[stat]}!`; });
const blockStatus = list => ({ status: (s, st) => list.includes(st) ? `🛡️ ¡${abName(s)} de ${s.name} lo protege del estado!` : false });
const contactStatus = (status, chance) => ({
    hit: (s, f, mv, dmg, c) => { if (c.contact && Math.random() < chance) tryApplyStatus(f, status, s, abName(s)); return null; }
});
const contactHurt = frac => ({
    hit: (s, f, mv, dmg, c) => {
        if (!c.contact) return null;
        const d = indirect(f, f.maxHp * frac);
        return d > 0 ? `🌵 ¡${abName(s)} de ${s.name} hirió a ${f.name} (-${d} HP)!` : null;
    }
});
const weatherSetter = (type, label) => ({ enter: () => setWeather(type) });
const terrainSetter = type => ({ enter: () => setTerrain(type) });
const weatherSpeed = (check, m) => ({ atk: () => check() ? m : 1 });
const koBoost = (stat, factor) => ({ ko: s => raiseMsg(s, stat, factor) });
const intimidateImmune = { intimidateImmune: true };
const recolector = (chance, frac) => ({
    turn: s => { if (s.currentHp < s.maxHp && Math.random() < chance) { const h = healFrac(s, frac); return h > 0 ? `🍓 ¡${s.name} encontró una baya y recuperó ${h} HP!` : null; } return null; }
});
const minor = () => ({ def: () => 0.95 });

// ---------- Entrada al combate ----------
defineAbility('intimidate', 'Al entrar, baja un 15% el Ataque del rival.', {
    enter: (s, f) => {
        if (!f) return null;
        if (hasAb(f, 'guard-dog')) return `🐕 ¡${f.name} se crece con la Intimidación! ${raiseMsg(f, 'atk', 1.3, 'Perro Guardián')}`;
        if (['own-tempo', 'oblivious', 'inner-focus', 'scrappy'].includes(abKey(f)) && handlerOf(f)) return `👁️ ¡${f.name} no se deja intimidar!`;
        return `👁️ ¡La Intimidación de ${s.name} actúa! ${lowerStat(f, 'atk', 0.85, s)}`;
    }
});
defineAbility('download', 'Al entrar, sube el Ataque o el At. Esp. según la defensa más débil del rival.', {
    enter: (s, f) => {
        if (!f) return null;
        return f.defense < f.spDef ? `💻 ${raiseMsg(s, 'atk', 1.3, 'Descarga')}` : `💻 ${raiseMsg(s, 'spAtk', 1.3, 'Descarga')}`;
    }
});
defineAbility('trace', 'Al entrar, copia la habilidad del rival.', {
    enter: (s, f, st) => {
        if (!f || !f.ability || f.ability === 'none' || abKey(f) === 'trace') return null;
        s.ability = f.ability;
        const copied = AB[abKey(s)];
        const extra = copied && copied.enter ? copied.enter(s, f, st) : null;
        return `🔍 ¡${s.name} copió ${abName(s)} de ${f.name}!${extra ? ' ' + extra : ''}`;
    }
});
defineAbility('imposter', 'Al entrar, se transforma en el rival copiando sus estadísticas y tipos.', {
    enter: (s, f) => {
        if (!f || s.persist.transformed) return null;
        s.persist.transformed = true;
        ['attack', 'defense', 'spAtk', 'spDef', 'speed'].forEach(k => { s[k] = f[k]; });
        s.types = [...f.types]; s.type = f.type;
        return `🪞 ¡${s.name} se transformó en ${f.name}!`;
    }
});
defineAbility('drizzle', 'Invoca lluvia al entrar.', weatherSetter('rain'));
defineAbility('drought', 'Invoca sol al entrar.', weatherSetter('sun'));
defineAbility('sand-stream', 'Invoca una tormenta de arena al entrar.', weatherSetter('sand'));
defineAbility('snow-warning', 'Invoca nevada al entrar.', weatherSetter('snow'));
defineAbility('desolate-land', 'Sol abrasador: el agua no funciona.', weatherSetter('harsh-sun'));
defineAbility('primordial-sea', 'Lluvia torrencial: el fuego no funciona.', weatherSetter('heavy-rain'));
defineAbility('delta-stream', 'Vientos que protegen a los Voladores de sus debilidades.', weatherSetter('wind'));
defineAbility('electric-surge', 'Crea un campo eléctrico al entrar.', terrainSetter('electric'));
defineAbility('grassy-surge', 'Crea un campo de hierba al entrar.', terrainSetter('grassy'));
defineAbility('misty-surge', 'Crea un campo de niebla al entrar.', terrainSetter('misty'));
defineAbility('psychic-surge', 'Crea un campo psíquico al entrar.', terrainSetter('psychic'));
defineAbility('seed-sower', 'Al ser golpeado crea un campo de hierba.', { hit: (s, f, mv, d) => setTerrain('grassy') });
defineAbility('sand-spit', 'Al ser golpeado desata una tormenta de arena.', { hit: () => setWeather('sand') });
defineAbility('orichalcum-pulse', 'Invoca sol y potencia el Ataque bajo el sol.', {
    enter: () => setWeather('sun'), atk: (s, f, mv) => (sunny() && !mv.isSpecial) ? 1.33 : 1
});
defineAbility('hadron-engine', 'Crea un campo eléctrico y potencia el At. Esp. en él.', {
    enter: () => setTerrain('electric'), atk: (s, f, mv) => (terrainIs('electric') && mv.isSpecial) ? 1.33 : 1
});
defineAbility('teraform-zero', 'Al entrar elimina el clima y el terreno.', {
    enter: () => { CombatState.weather = null; CombatState.terrain = null; return '🌐 ¡El clima y el terreno desaparecen!'; }
});
defineAbility(['cloud-nine', 'air-lock'], 'Anula los efectos del clima.', { enter: s => `🌫️ ¡${abName(s)} de ${s.name} anula los efectos del clima!` });
defineAbility('neutralizing-gas', 'Anula las habilidades del rival mientras esté en combate.', { enter: s => `☣️ ¡Un gas reactivo envuelve el campo! (${s.name})` });
defineAbility('pressure', 'Cada golpe que recibes drena 5 de energía al rival.', {
    enter: s => `⚡ ¡${s.name} ejerce una gran Presión!`,
    hit: (s, f) => { f.energy = Math.max(0, (f.energy || 0) - 5); return null; }
});
defineAbility('unnerve', 'El rival se pone nervioso y no puede comer bayas. Además resistes un 5% más.', {
    enter: (s, f) => f ? `😰 ¡${f.name} está tan nervioso que no puede comer bayas!` : null, def: () => 0.95
});
defineAbility('frisk', 'Al entrar, revela la habilidad del rival.', {
    enter: (s, f) => f ? `🔎 ¡${s.name} ve que ${f.name} tiene ${abName(f)}!` : null
});
defineAbility('forewarn', 'Al entrar, revela el ataque más fuerte del rival.', {
    enter: (s, f) => {
        if (!f || !f.moves) return null;
        const best = f.moves.slice().sort((a, b) => (b.power || 0) - (a.power || 0))[0];
        return best ? `🔮 ¡${s.name} presiente que ${f.name} usará ${best.name}!` : null;
    }
});
defineAbility('anticipation', 'Se estremece si el rival tiene ataques superefectivos y recibe un 5% menos de daño.', {
    enter: (s, f) => {
        if (!f) return null;
        const types = f.types || [f.type];
        return types.some(t => getTypeEffectiveness(t, s) > 1) ? `😨 ¡${s.name} se estremece ante ${f.name}!` : null;
    },
    def: () => 0.95
});
defineAbility('screen-cleaner', 'Al entrar elimina todas las mejoras y reducciones de estadísticas del rival.', {
    enter: (s, f) => { if (!f) return null; f.mods = { atk: 1, def: 1, spAtk: 1, spDef: 1, spd: 1 }; return `🧹 ¡${s.name} limpió los cambios de estadísticas de ${f.name}!`; }
});
defineAbility('curious-medicine', 'Al entrar elimina las reducciones de sus propias estadísticas.', {
    enter: s => { Object.keys(s.mods).forEach(k => { s.mods[k] = Math.max(1, s.mods[k]); }); return `💊 ¡${s.name} se recuperó de los cambios negativos!`; }
});
defineAbility('hospitality', 'Al entrar, recupera un 10% de HP.', {
    enter: s => { const h = healFrac(s, 0.10); return h > 0 ? `🍵 ¡${s.name} se reconforta y recupera ${h} HP!` : null; }
});
defineAbility('supersweet-syrup', 'Al entrar, el rival queda pringoso: -10% Defensa.', {
    enter: (s, f) => f ? `🍯 ¡${s.name} baña a ${f.name} de jarabe! ${lowerStat(f, 'def', 0.9, s)}` : null
});
defineAbility('intrepid-sword', 'Al entrar, sube el Ataque.', { enter: s => raiseMsg(s, 'atk', 1.3) });
defineAbility('dauntless-shield', 'Al entrar, sube la Defensa.', { enter: s => raiseMsg(s, 'def', 1.3) });
defineAbility('embody-aspect-teal', 'Al entrar, sube la Velocidad.', { enter: s => raiseMsg(s, 'spd', 1.3) });
defineAbility('embody-aspect-wellspring', 'Al entrar, sube la Def. Esp.', { enter: s => raiseMsg(s, 'spDef', 1.3) });
defineAbility('embody-aspect-hearthflame', 'Al entrar, sube el Ataque.', { enter: s => raiseMsg(s, 'atk', 1.3) });
defineAbility('embody-aspect-cornerstone', 'Al entrar, sube la Defensa.', { enter: s => raiseMsg(s, 'def', 1.3) });
defineAbility(['mold-breaker', 'teravolt', 'turboblaze'], 'Ignora las habilidades defensivas del rival.', {
    ignoreAbilities: true, enter: s => `💥 ¡${s.name} rompe el molde con ${abName(s)}!`
});
defineAbility('slow-start', 'Durante 5 turnos su ataque se reduce a la mitad.', {
    enter: s => `🐌 ¡${s.name} no se ha puesto en marcha!`, atk: s => s.turnsIn < 5 ? 0.5 : 1
});
defineAbility('tera-shift', 'Cambia de forma al entrar en combate.', { enter: s => `✨ ¡${s.name} cambió de forma!` });
defineAbility('as-one-glastrier', 'Combina Relincho Blanco y Nerviosismo.', {
    enter: (s, f) => f ? `😰 ¡${f.name} está nervioso!` : null, ko: s => raiseMsg(s, 'atk', 1.3)
});
defineAbility('as-one-spectrier', 'Combina Relincho Negro y Nerviosismo.', {
    enter: (s, f) => f ? `😰 ¡${f.name} está nervioso!` : null, ko: s => raiseMsg(s, 'spAtk', 1.3)
});
defineAbility(['dark-aura', 'fairy-aura'], 'Potencia un 33% los ataques de su tipo (Siniestro / Hada).', {
    enter: s => `🌀 ¡${s.name} irradia su aura!`,
    atk: (s, f, mv, c) => c.moveType === (abKey(s) === 'dark-aura' ? 'Siniestro' : 'Hada') ? 1.33 : 1
});
defineAbility('aura-break', 'Los ataques Siniestro y Hada que recibe pierden un 25% de potencia.', {
    enter: s => `🌀 ¡${s.name} rompe las auras!`,
    def: (s, f, mv, c) => (c.moveType === 'Siniestro' || c.moveType === 'Hada') ? 0.75 : 1
});

// ---------- Golpes críticos y precisión ----------
defineAbility(['battle-armor', 'shell-armor'], 'Los golpes críticos no le afectan.', { noCrit: true });
defineAbility('super-luck', 'Aumenta mucho la probabilidad de golpe crítico.', { critRate: 2 });
defineAbility('sniper', 'Sus golpes críticos hacen más daño.', { critMult: 2.25 });
defineAbility('merciless', 'Si el rival está envenenado, sus golpes son siempre críticos.', { critForce: (s, f) => f && f.status === 'poisoned' });
defineAbility('anger-point', 'Si recibe un golpe crítico, su Ataque llega al máximo.', {
    hit: (s, f, mv, d, c) => { if (!c.isCrit) return null; s.mods.atk = 3; return `😡 ¡${abName(s)} de ${s.name} llevó su Ataque al máximo!`; }
});
defineAbility('compound-eyes', 'Mejora la precisión: +10% de daño.', flatAtk(1.1));
defineAbility('no-guard', 'Todos los ataques aciertan: +10% de daño.', flatAtk(1.1));
defineAbility('victory-star', 'Mejora la precisión: +10% de daño.', flatAtk(1.1));
defineAbility('keen-eye', 'Visión aguda: +5% de daño.', flatAtk(1.05));
defineAbility('illuminate', 'Ilumina el combate: +5% de daño.', flatAtk(1.05));
defineAbility('hustle', 'Sube el Ataque físico un 50%.', physBoost(1.5));
defineAbility('scrappy', 'Los ataques Normal y Lucha golpean a los Fantasma. Inmune a Intimidación.', { ignoresGhost: true });
defineAbility('minds-eye', 'Los ataques Normal y Lucha golpean a los Fantasma.', { ignoresGhost: true });
defineAbility('serene-grace', 'Duplica la probabilidad de los efectos secundarios.', { statusChanceMult: 2 });
defineAbility('sheer-force', 'Sin efectos secundarios, pero +30% de daño en ataques que los tendrían.', {
    noSecondary: true, atk: (s, f, mv) => mv.statusEffect ? 1.3 : 1
});
defineAbility('shield-dust', 'Inmune a los efectos secundarios de los ataques.', { blocksSecondary: true });
defineAbility('unaware', 'Ignora los cambios de estadísticas del rival.', {});
defineAbility('tinted-lens', 'Los ataques poco efectivos hacen el doble de daño.', { atk: (s, f, mv, c) => c.elementMult < 1 ? 2 : 1 });
defineAbility('neuroforce', 'Los ataques superefectivos hacen +25% de daño.', { atk: (s, f, mv, c) => c.elementMult > 1 ? 1.25 : 1 });
defineAbility('adaptability', 'El bonus por tipo propio (STAB) pasa de x1.5 a x2.', {});
defineAbility(['protean', 'libero'], 'Cambia su tipo al del ataque: siempre aplica el bonus STAB.', {});
defineAbility(['normalize'], 'Todos sus ataques se vuelven Normal con +20% de potencia.', { move: () => ({ type: 'Normal', mult: 1.2 }) });
defineAbility('pixilate', 'Los ataques Normal pasan a Hada con +20% de potencia.', { move: (s, f, mv) => mv.type === 'Normal' ? { type: 'Hada', mult: 1.2 } : null });
defineAbility('aerilate', 'Los ataques Normal pasan a Volador con +20% de potencia.', { move: (s, f, mv) => mv.type === 'Normal' ? { type: 'Volador', mult: 1.2 } : null });
defineAbility('refrigerate', 'Los ataques Normal pasan a Hielo con +20% de potencia.', { move: (s, f, mv) => mv.type === 'Normal' ? { type: 'Hielo', mult: 1.2 } : null });
defineAbility('galvanize', 'Los ataques Normal pasan a Eléctrico con +20% de potencia.', { move: (s, f, mv) => mv.type === 'Normal' ? { type: 'Eléctrico', mult: 1.2 } : null });
defineAbility('liquid-voice', 'Los ataques especiales Normal pasan a Agua.', { move: (s, f, mv) => (mv.isSpecial && mv.type === 'Normal') ? { type: 'Agua' } : null });
defineAbility('long-reach', 'Sus ataques no hacen contacto: no activa las habilidades de contacto del rival.', {});

// ---------- Potenciadores de ataque ----------
defineAbility('huge-power', 'Duplica el Ataque físico.', physBoost(2));
defineAbility('pure-power', 'Duplica el Ataque físico.', physBoost(2));
defineAbility('guts', 'Con un estado alterado sube el Ataque físico un 50% (y ignora la quemadura).', {
    atk: (s, f, mv) => (s.status && !mv.isSpecial) ? (s.status === 'burned' ? 3 : 1.5) : 1
});
defineAbility('toxic-boost', 'Envenenado: +50% de Ataque físico.', { atk: (s, f, mv) => (s.status === 'poisoned' && !mv.isSpecial) ? 1.5 : 1 });
defineAbility('flare-boost', 'Quemado: +50% de At. Esp.', { atk: (s, f, mv) => (s.status === 'burned' && mv.isSpecial) ? 1.5 : 1 });
defineAbility('technician', 'Los ataques de poca potencia (60 o menos) hacen un 50% más de daño.', { atk: (s, f, mv) => mv.power <= 60 ? 1.5 : 1 });
defineAbility('iron-fist', 'Potencia un 20% los ataques físicos.', physBoost(1.2));
defineAbility('tough-claws', 'Potencia un 30% los ataques físicos (de contacto).', physBoost(1.3));
defineAbility('strong-jaw', 'Potencia un 20% los ataques físicos.', physBoost(1.2));
defineAbility('sharpness', 'Potencia un 20% los ataques físicos (cortantes).', physBoost(1.2));
defineAbility('mega-launcher', 'Potencia un 20% los ataques especiales.', specBoost(1.2));
defineAbility('punk-rock', 'Potencia un 20% los ataques especiales.', specBoost(1.2));
defineAbility('reckless', 'Ataca sin pensar: +10% de daño.', flatAtk(1.1));
defineAbility('rivalry', 'Rivalidad: +10% de daño.', flatAtk(1.1));
defineAbility('skill-link', 'Encadena los golpes: +10% de daño.', flatAtk(1.1));
defineAbility('parental-bond', 'Ataca dos veces: +25% de daño total.', flatAtk(1.25));
defineAbility('stance-change', 'Postura de ataque: +20% de daño.', flatAtk(1.2));
defineAbility('gorilla-tactics', 'Sube el Ataque físico un 50%.', physBoost(1.5));
defineAbility('quick-draw', 'Desenfunda rápido: +10% de daño.', flatAtk(1.1));
defineAbility('unseen-fist', 'Puño invisible: +5% de daño.', flatAtk(1.05));
defineAbility('mycelium-might', 'Micelio: +5% de daño.', flatAtk(1.05));
defineAbility('infiltrator', 'Se cuela entre defensas: +5% de daño.', flatAtk(1.05));
defineAbility(['plus', 'minus'], 'Sube un 10% el At. Esp.', specBoost(1.1));
defineAbility('power-spot', 'Fuente de energía: +10% de daño.', flatAtk(1.1));
defineAbility('battery', 'Batería: +10% de At. Esp.', specBoost(1.1));
defineAbility('prankster', 'En su primer turno en combate hace +30% de daño.', { atk: s => s.turnsIn === 0 ? 1.3 : 1 });
defineAbility('stakeout', 'Duplica el daño al rival que acaba de entrar.', { atk: (s, f) => (f && f.flags && f.flags.justEntered) ? 2 : 1 });
defineAbility('analytic', 'Si es más lento que el rival, +30% de daño.', { atk: (s, f) => (f && s.speed < f.speed) ? 1.3 : 1 });
defineAbility('defeatist', 'Con menos de la mitad de HP, su ataque se reduce a la mitad.', { atk: s => s.currentHp < s.maxHp / 2 ? 0.5 : 1 });
defineAbility('zen-mode', 'Con la mitad de HP o menos, sube mucho su At. Esp.', { atk: (s, f, mv) => (s.currentHp <= s.maxHp / 2 && mv.isSpecial) ? 1.4 : 1 });
defineAbility('solar-power', 'Bajo el sol, +50% de At. Esp. pero pierde HP cada turno.', {
    atk: (s, f, mv) => (sunny() && mv.isSpecial) ? 1.5 : 1,
    turn: s => { if (!sunny()) return null; const d = indirect(s, s.maxHp / 8); return d > 0 ? `☀️ ¡${s.name} pierde ${d} HP por Poder Solar!` : null; }
});
defineAbility('corrosion', 'Sus ataques Veneno hacen +10% de daño.', typeBoost('Veneno', 1.1));
defineAbility('poison-puppeteer', 'Hace +10% de daño a rivales envenenados.', { atk: (s, f) => (f && f.status === 'poisoned') ? 1.1 : 1 });
defineAbility('supreme-overlord', 'Gana +10% de daño por cada aliado debilitado (máx. 5).', {
    atk: s => 1 + 0.1 * Math.min(5, teamOf(s).filter(u => u !== s && u.currentHp <= 0).length)
});
defineAbility('sword-of-ruin', 'Reduce la Defensa del rival: +33% a tus ataques físicos.', physBoost(1.33));
defineAbility('beads-of-ruin', 'Reduce la Def. Esp. del rival: +33% a tus ataques especiales.', specBoost(1.33));
defineAbility('tablets-of-ruin', 'Reduce el Ataque del rival: recibe -25% de daño físico.', { def: (s, f, mv) => !mv.isSpecial ? 0.75 : 1 });
defineAbility('vessel-of-ruin', 'Reduce el At. Esp. del rival: recibe -25% de daño especial.', { def: (s, f, mv) => mv.isSpecial ? 0.75 : 1 });
defineAbility('protosynthesis', 'Bajo el sol sube su mejor estadística de ataque un 30%.', {
    atk: (s, f, mv) => (sunny() && (mv.isSpecial ? s.spAtk >= s.attack : s.attack > s.spAtk)) ? 1.3 : 1
});
defineAbility('quark-drive', 'En campo eléctrico sube su mejor estadística de ataque un 30%.', {
    atk: (s, f, mv) => (terrainIs('electric') && (mv.isSpecial ? s.spAtk >= s.attack : s.attack > s.spAtk)) ? 1.3 : 1
});
defineAbility('flash-fire', 'Absorbe el Fuego y potencia sus ataques de Fuego.', {
    def: (s, f, mv, c) => { if (c.moveType !== 'Fuego') return 1; s.flags.flashFire = true; return { mult: 0, msg: `🔥 ¡${abName(s)} de ${s.name} absorbió el fuego y se potencia!` }; },
    atk: (s, f, mv, c) => (s.flags.flashFire && c.moveType === 'Fuego') ? 1.5 : 1,
    status: (s, st) => st === 'burned' ? `🛡️ ¡${abName(s)} impide la quemadura!` : false
});

// Ataques por tipo
defineAbility('blaze', 'Con poca vida potencia los ataques de Fuego.', pinch('Fuego', '🔥'));
defineAbility('torrent', 'Con poca vida potencia los ataques de Agua.', pinch('Agua', '🌊'));
defineAbility('overgrow', 'Con poca vida potencia los ataques de Planta.', pinch('Planta', '🌿'));
defineAbility('swarm', 'Con poca vida potencia los ataques de Bicho.', pinch('Bicho', '🐛'));
defineAbility('steelworker', 'Potencia un 50% los ataques de Acero.', typeBoost('Acero', 1.5));
defineAbility('steely-spirit', 'Potencia un 50% los ataques de Acero.', typeBoost('Acero', 1.5));
defineAbility('transistor', 'Potencia un 50% los ataques Eléctricos.', typeBoost('Eléctrico', 1.5));
defineAbility('dragons-maw', 'Potencia un 50% los ataques de Dragón.', typeBoost('Dragón', 1.5));
defineAbility('rocky-payload', 'Potencia un 50% los ataques de Roca.', typeBoost('Roca', 1.5));
defineAbility('sand-force', 'En tormenta de arena potencia Roca, Tierra y Acero un 30%.', {
    atk: (s, f, mv, c) => (sandy() && ['Roca', 'Tierra', 'Acero'].includes(c.moveType)) ? 1.3 : 1
});
defineAbility('electromorphosis', 'Al ser golpeado se carga: su próximo ataque Eléctrico hace el doble.', {
    hit: s => { s.flags.charged = true; return `⚡ ¡${s.name} se cargó de electricidad!`; },
    atk: (s, f, mv, c) => { if (s.flags.charged && c.moveType === 'Eléctrico') { s.flags.charged = false; return 2; } return 1; }
});
defineAbility('wind-power', 'Al ser golpeado por un ataque Volador se carga: su próximo ataque Eléctrico hace el doble.', {
    hit: (s, f, mv, d, c) => { if (c.moveType !== 'Volador') return null; s.flags.charged = true; return `⚡ ¡${s.name} se cargó con el viento!`; },
    atk: (s, f, mv, c) => { if (s.flags.charged && c.moveType === 'Eléctrico') { s.flags.charged = false; return 2; } return 1; }
});

// Ágiles (aquí la velocidad solo decide quién empieza, así que dan bonus de daño)
defineAbility('swift-swim', 'Bajo la lluvia hace +20% de daño.', weatherSpeed(rainy, 1.2));
defineAbility('chlorophyll', 'Bajo el sol hace +20% de daño.', weatherSpeed(sunny, 1.2));
defineAbility('sand-rush', 'En tormenta de arena hace +20% de daño y es inmune a ella.', weatherSpeed(sandy, 1.2));
defineAbility('slush-rush', 'Bajo la nevada hace +20% de daño y es inmune a ella.', weatherSpeed(snowy, 1.2));
defineAbility('surge-surfer', 'En campo eléctrico hace +20% de daño.', { atk: () => terrainIs('electric') ? 1.2 : 1 });
defineAbility('quick-feet', 'Con un estado alterado hace +15% de daño.', { atk: s => s.status ? 1.15 : 1 });
defineAbility('gale-wings', 'Con la vida completa, sus ataques Volador hacen +20%.', { atk: (s, f, mv, c) => (c.moveType === 'Volador' && s.currentHp === s.maxHp) ? 1.2 : 1 });
defineAbility('speed-boost', 'Cada turno gana velocidad y, con ella, un poco más de daño.', {
    turn: s => { boostStat(s, 'spd', 1.2); return `⚡ ¡La velocidad de ${s.name} aumentó gracias a ${abName(s)}!`; }
});
defineAbility('hunger-switch', 'Alterna de forma cada turno: en una hace +15% de daño.', {
    atk: s => s.flags.hangry ? 1.15 : 1, turn: s => { s.flags.hangry = !s.flags.hangry; return null; }
});
defineAbility('schooling', 'Con más del 25% de HP forma un banco: +40% de daño y -20% de daño recibido.', {
    atk: s => s.currentHp > s.maxHp * 0.25 ? 1.4 : 1, def: s => s.currentHp > s.maxHp * 0.25 ? 0.8 : 1
});
defineAbility('zero-to-hero', 'Al salir del combate se transforma en héroe: +50% de daño al volver.', {
    leave: s => { s.persist.hero = true; return `🦸 ¡${s.name} se transforma en héroe!`; },
    atk: s => s.persist.hero ? 1.5 : 1
});

// ---------- Defensa ----------
defineAbility('sturdy', 'Con la vida al máximo aguanta un golpe mortal.', {
    def: (s, f, mv, c) => (s.currentHp === s.maxHp && c.damage >= s.currentHp)
        ? { damage: s.currentHp - 1, msg: `🛡️ ¡${s.name} aguantó el golpe gracias a ${abName(s)}!` } : 1
});
defineAbility('levitate', 'Inmune a los ataques de Tierra.', { def: (s, f, mv, c) => c.moveType === 'Tierra' ? { mult: 0, msg: `🕊️ ¡${s.name} levita y evade el ataque de Tierra!` } : 1 });
defineAbility('wonder-guard', 'Solo le dañan los ataques superefectivos.', {
    def: (s, f, mv, c) => c.elementMult > 1 ? 1 : { mult: 0, msg: `🛡️ ¡${abName(s)} de ${s.name} anula el ataque!` }
});
defineAbility('multiscale', 'Con la vida completa recibe la mitad de daño.', { def: s => s.currentHp === s.maxHp ? 0.5 : 1 });
defineAbility('shadow-shield', 'Con la vida completa recibe la mitad de daño.', { def: s => s.currentHp === s.maxHp ? 0.5 : 1 });
defineAbility('tera-shell', 'Con la vida completa, todos los ataques son poco efectivos.', {
    def: (s, f, mv, c) => (s.currentHp === s.maxHp && c.elementMult > 0) ? 0.5 / c.elementMult : 1
});
defineAbility(['filter', 'solid-rock', 'prism-armor'], 'Reduce un 25% el daño de los ataques superefectivos.', { def: (s, f, mv, c) => c.elementMult > 1 ? 0.75 : 1 });
defineAbility('thick-fat', 'Reduce a la mitad el daño de Fuego y Hielo.', typeResist(['Fuego', 'Hielo'], 0.5));
defineAbility('heatproof', 'Reduce a la mitad el daño de Fuego y de la quemadura.', typeResist(['Fuego'], 0.5));
defineAbility('damp', 'La humedad reduce un 20% el daño de Fuego.', typeResist(['Fuego'], 0.8));
defineAbility('fur-coat', 'Reduce a la mitad el daño físico.', { def: (s, f, mv) => !mv.isSpecial ? 0.5 : 1 });
defineAbility('ice-scales', 'Reduce a la mitad el daño especial.', { def: (s, f, mv) => mv.isSpecial ? 0.5 : 1 });
defineAbility('fluffy', 'Los ataques de contacto hacen la mitad, pero el Fuego hace el doble.', {
    def: (s, f, mv, c) => (c.contact ? 0.5 : 1) * (c.moveType === 'Fuego' ? 2 : 1)
});
defineAbility('marvel-scale', 'Con un estado alterado, la Defensa sube un 50%.', { def: (s, f, mv) => (s.status && !mv.isSpecial) ? 1 / 1.5 : 1 });
defineAbility('flower-gift', 'Bajo el sol sube el Ataque y la Def. Esp.', {
    atk: (s, f, mv) => (sunny() && !mv.isSpecial) ? 1.5 : 1, def: (s, f, mv) => (sunny() && mv.isSpecial) ? 1 / 1.5 : 1
});
defineAbility('grass-pelt', 'En campo de hierba reduce el daño físico recibido.', { def: (s, f, mv) => (terrainIs('grassy') && !mv.isSpecial) ? 0.67 : 1 });
defineAbility('shields-down', 'Con más de la mitad de HP está protegido: recibe -30% de daño e inmune a estados.', {
    def: s => s.currentHp > s.maxHp / 2 ? 0.7 : 1, status: s => s.currentHp > s.maxHp / 2 ? `🛡️ ¡El escudo de ${s.name} lo protege!` : false
});
defineAbility('purifying-salt', 'Inmune a los estados y recibe la mitad de daño Fantasma.', {
    def: (s, f, mv, c) => c.moveType === 'Fantasma' ? 0.5 : 1, status: s => `🧂 ¡${abName(s)} de ${s.name} purifica el estado!`
});
defineAbility('friend-guard', 'Reduce un 10% el daño recibido.', flatDef(0.9));
defineAbility(['wimp-out', 'emergency-exit'], 'Con menos de la mitad de HP se retira y recibe un 20% menos de daño.', { def: s => s.currentHp < s.maxHp / 2 ? 0.8 : 1 });
defineAbility('disguise', 'El primer ataque que recibe lo absorbe el disfraz.', {
    def: s => {
        if (s.persist.disguise) return 1;
        s.persist.disguise = true;
        const chip = indirect(s, s.maxHp / 8);
        return { mult: 0, msg: `🎭 ¡El disfraz de ${s.name} lo protegió! (-${chip} HP)` };
    }
});
defineAbility('ice-face', 'La cara de hielo absorbe el primer golpe físico y se regenera con nieve.', {
    def: (s, f, mv) => {
        if (mv.isSpecial || s.persist.iceBroken) return 1;
        s.persist.iceBroken = true;
        return { mult: 0, msg: `🧊 ¡La cara de hielo de ${s.name} absorbió el golpe!` };
    },
    turn: s => { if (snowy() && s.persist.iceBroken) { s.persist.iceBroken = false; return `🧊 ¡La cara de ${s.name} se regeneró!`; } return null; }
});
defineAbility('illusion', 'Su ilusión reduce un 30% el primer golpe recibido.', {
    def: s => { if (s.persist.illusionBroken) return 1; s.persist.illusionBroken = true; return { mult: 0.7, msg: `🎭 ¡La ilusión de ${s.name} se desvaneció!` }; }
});
defineAbility('sand-veil', 'En tormenta de arena esquiva el 20% de los ataques y es inmune a ella.', {
    def: s => (sandy() && Math.random() < 0.2) ? { mult: 0, msg: `💨 ¡${s.name} esquivó el ataque entre la arena!` } : 1
});
defineAbility('snow-cloak', 'Bajo la nevada esquiva el 20% de los ataques y es inmune a ella.', {
    def: s => (snowy() && Math.random() < 0.2) ? { mult: 0, msg: `💨 ¡${s.name} esquivó el ataque entre la nieve!` } : 1
});
defineAbility('tangled-feet', 'Esquiva el 12% de los ataques con sus pasos torpes.', {
    def: s => Math.random() < 0.12 ? { mult: 0, msg: `💃 ¡${s.name} esquivó el ataque con sus pasos!` } : 1
});
defineAbility('wonder-skin', 'Resiste a la mitad de los estados alterados.', { status: s => Math.random() < 0.5 ? `🛡️ ¡${abName(s)} de ${s.name} lo protege del estado!` : false });
defineAbility('magic-bounce', 'Refleja los estados alterados al rival.', { status: () => ({ reflect: true }) });
defineAbility('poison-heal', 'Envenenado, en vez de perder HP recupera un 12% cada turno.', {});
defineAbility('magic-guard', 'No sufre daño indirecto (estados, clima, retroceso).', {});
defineAbility('overcoat', 'Inmune al daño del clima.', {});
defineAbility('stamina', 'Cada golpe recibido sube su Defensa.', { hit: s => raiseMsg(s, 'def', 1.1) });
defineAbility('weak-armor', 'Al recibir un golpe físico baja la Defensa y sube la Velocidad.', {
    hit: (s, f, mv) => { if (mv.isSpecial) return null; boostStat(s, 'def', 0.85); boostStat(s, 'spd', 1.3); return `🧱 ¡La armadura de ${s.name} se resquebraja!`; }
});
defineAbility('water-compaction', 'Si le golpea un ataque de Agua sube mucho su Defensa.', {
    hit: (s, f, mv, d, c) => c.moveType === 'Agua' ? raiseMsg(s, 'def', 1.5) : null
});
defineAbility('justified', 'Si le golpea un ataque Siniestro sube su Ataque.', {
    hit: (s, f, mv, d, c) => c.moveType === 'Siniestro' ? raiseMsg(s, 'atk', 1.5) : null
});
defineAbility('rattled', 'Si le golpea un ataque Bicho, Fantasma o Siniestro se asusta pero gana velocidad.', {
    hit: (s, f, mv, d, c) => ['Bicho', 'Fantasma', 'Siniestro'].includes(c.moveType) ? raiseMsg(s, 'spd', 1.3) : null
});
defineAbility('steam-engine', 'Si le golpea Fuego o Agua sube mucho su velocidad.', {
    hit: (s, f, mv, d, c) => ['Fuego', 'Agua'].includes(c.moveType) ? raiseMsg(s, 'spd', 1.5) : null
});
defineAbility('thermal-exchange', 'Si le golpea Fuego sube su Ataque. Inmune a la quemadura.', {
    hit: (s, f, mv, d, c) => c.moveType === 'Fuego' ? raiseMsg(s, 'atk', 1.3) : null, status: (s, st) => st === 'burned' ? `🛡️ ¡${abName(s)} impide la quemadura!` : false
});
defineAbility('berserk', 'Al bajar de la mitad de HP por un golpe, sube su At. Esp.', {
    hit: (s, f, mv, dmg) => (s.currentHp < s.maxHp / 2 && s.currentHp + dmg >= s.maxHp / 2) ? raiseMsg(s, 'spAtk', 1.5) : null
});
defineAbility('anger-shell', 'Al bajar de la mitad de HP por un golpe, sube su ataque pero baja su defensa.', {
    hit: (s, f, mv, dmg) => {
        if (!(s.currentHp < s.maxHp / 2 && s.currentHp + dmg >= s.maxHp / 2)) return null;
        boostStat(s, 'atk', 1.3); boostStat(s, 'spAtk', 1.3); boostStat(s, 'def', 0.9);
        return `😤 ¡${s.name} estalla de ira!`;
    }
});
defineAbility('power-construct', 'Al bajar de la mitad de HP se completa y recupera un 30% de vida (una vez).', {
    hit: s => {
        if (s.persist.constructed || s.currentHp >= s.maxHp / 2) return null;
        s.persist.constructed = true; const h = healFrac(s, 0.3);
        return `🧩 ¡${s.name} se completó y recuperó ${h} HP!`;
    }
});
defineAbility('color-change', 'Cambia su tipo al del último ataque recibido.', {
    hit: (s, f, mv, d, c) => { if (!c.moveType || hasT(s, c.moveType)) return null; s.types = [c.moveType]; s.type = c.moveType; return `🦎 ¡${s.name} cambió a tipo ${c.moveType}!`; }
});
defineAbility('gulp-missile', 'Al ser golpeado devuelve un proyectil (20% de probabilidad).', {
    hit: (s, f) => { if (Math.random() >= 0.2) return null; const d = indirect(f, f.maxHp / 8); return d > 0 ? `🐦 ¡${s.name} lanzó un proyectil contra ${f.name}! (-${d} HP)` : null; }
});

// Absorciones de tipo
defineAbility('volt-absorb', 'Absorbe los ataques Eléctricos y recupera HP.', healAbsorb('Eléctrico', 0.25));
defineAbility('water-absorb', 'Absorbe los ataques de Agua y recupera HP.', healAbsorb('Agua', 0.25));
defineAbility('earth-eater', 'Absorbe los ataques de Tierra y recupera HP.', healAbsorb('Tierra', 0.25));
defineAbility('dry-skin', 'Absorbe Agua; sufre más con Fuego y con el sol; se cura con la lluvia.', {
    def: (s, f, mv, c) => {
        if (c.moveType === 'Agua') { const h = healFrac(s, 0.25); return { mult: 0, msg: `💧 ¡${s.name} absorbió el agua! (+${h} HP)` }; }
        return c.moveType === 'Fuego' ? 1.25 : 1;
    },
    turn: s => {
        if (rainy()) { const h = healFrac(s, 1 / 8); return h > 0 ? `💧 ¡${s.name} recupera ${h} HP con la lluvia!` : null; }
        if (sunny()) { const d = indirect(s, s.maxHp / 8); return d > 0 ? `☀️ ¡${s.name} pierde ${d} HP por el sol!` : null; }
        return null;
    }
});
defineAbility('lightning-rod', 'Atrae y absorbe los ataques Eléctricos, subiendo su At. Esp.', boostAbsorb('Eléctrico', 'spAtk', 1.5));
defineAbility('storm-drain', 'Atrae y absorbe los ataques de Agua, subiendo su At. Esp.', boostAbsorb('Agua', 'spAtk', 1.5));
defineAbility('motor-drive', 'Absorbe los ataques Eléctricos y sube su velocidad.', boostAbsorb('Eléctrico', 'spd', 1.3));
defineAbility('sap-sipper', 'Absorbe los ataques de Planta y sube su Ataque.', boostAbsorb('Planta', 'atk', 1.5));
defineAbility('well-baked-body', 'Absorbe los ataques de Fuego y sube mucho su Defensa.', boostAbsorb('Fuego', 'def', 1.5));
defineAbility('wind-rider', 'Absorbe los ataques Voladores y sube su Ataque.', boostAbsorb('Volador', 'atk', 1.5));

// ---------- Contacto / reacciones ----------
defineAbility('static', 'Al recibir un golpe físico puede paralizar al atacante (30%).', contactStatus('paralyzed', 0.3));
defineAbility('poison-point', 'Al recibir un golpe físico puede envenenar al atacante (30%).', contactStatus('poisoned', 0.3));
defineAbility('flame-body', 'Al recibir un golpe físico puede quemar al atacante (30%).', contactStatus('burned', 0.3));
defineAbility('effect-spore', 'Al recibir un golpe físico puede dormir, envenenar o paralizar al atacante (30%).', {
    hit: (s, f, mv, d, c) => {
        if (c.contact && Math.random() < 0.3) tryApplyStatus(f, ['poisoned', 'paralyzed', 'asleep'][Math.floor(Math.random() * 3)], s, abName(s));
        return null;
    }
});
defineAbility('cute-charm', 'Al recibir un golpe físico puede enamorar al atacante (30%).', {
    hit: (s, f, mv, d, c) => { if (c.contact && Math.random() < 0.3 && !f.flags.charmed) { f.flags.charmed = true; return `💘 ¡${f.name} se enamoró de ${s.name}!`; } return null; }
});
defineAbility('rough-skin', 'Hiere al atacante que le golpea con contacto.', contactHurt(1 / 8));
defineAbility('iron-barbs', 'Hiere al atacante que le golpea con contacto.', contactHurt(1 / 8));
defineAbility('liquid-ooze', 'Su lodo hiere un poco al atacante que le golpea con contacto.', contactHurt(1 / 16));
defineAbility('aftermath', 'Si es debilitado por un golpe de contacto, hiere al atacante.', {
    faint: (s, f, mv, d, c) => { if (!c.contact) return null; const x = indirect(f, f.maxHp / 4); return x > 0 ? `💥 ¡${abName(s)} de ${s.name} hirió a ${f.name} (-${x} HP)!` : null; }
});
defineAbility('innards-out', 'Al ser debilitado hiere al atacante con el daño del último golpe.', {
    faint: (s, f, mv, d) => { const x = indirect(f, d); return x > 0 ? `💥 ¡${abName(s)} de ${s.name} devolvió el daño a ${f.name} (-${x} HP)!` : null; }
});
defineAbility('mummy', 'Al recibir un golpe físico, el atacante adquiere Momia.', {
    hit: (s, f, mv, d, c) => { if (!c.contact || abKey(f) === 'mummy') return null; f.ability = 'mummy'; return `🧟 ¡La habilidad de ${f.name} se convirtió en Momia!`; }
});
defineAbility('lingering-aroma', 'Al recibir un golpe físico, el atacante adquiere Olor Persistente.', {
    hit: (s, f, mv, d, c) => { if (!c.contact || abKey(f) === 'lingering-aroma') return null; f.ability = 'lingering-aroma'; return `🌸 ¡${f.name} se impregnó de un olor persistente!`; }
});
defineAbility('wandering-spirit', 'Al recibir un golpe físico, intercambia su habilidad con la del atacante.', {
    hit: (s, f, mv, d, c) => { if (!c.contact) return null; const t = s.ability; s.ability = f.ability; f.ability = t; return `👻 ¡${s.name} y ${f.name} intercambiaron habilidades!`; }
});
defineAbility(['gooey', 'tangling-hair'], 'Al recibir un golpe físico baja la velocidad del atacante.', {
    hit: (s, f, mv, d, c) => c.contact ? lowerStat(f, 'spd', 0.8, s) : null
});
defineAbility('cotton-down', 'Al ser golpeado baja la velocidad del atacante.', { hit: (s, f) => lowerStat(f, 'spd', 0.8, s) });
defineAbility('cursed-body', 'Al ser golpeado puede drenar la energía del atacante (30%).', {
    hit: (s, f) => { if (Math.random() >= 0.3) return null; f.energy = Math.max(0, (f.energy || 0) - 20); return `👁️ ¡${abName(s)} de ${s.name} bloqueó la energía de ${f.name}!`; }
});
defineAbility('perish-body', 'Al recibir un golpe físico, ambos se debilitarán en 3 turnos.', {
    hit: (s, f, mv, d, c) => {
        if (!c.contact || s.flags.perish || f.flags.perish) return null;
        s.flags.perish = 3; f.flags.perish = 3;
        return `☠️ ¡${abName(s)} de ${s.name} condena a ambos: se debilitarán en 3 turnos!`;
    }
});
defineAbility('toxic-debris', 'Al recibir un golpe físico puede envenenar al atacante (50%).', contactStatus('poisoned', 0.5));

// ---------- Tras atacar ----------
defineAbility('stench', 'Sus ataques tienen un 10% de amedrentar al rival.', {
    strike: (s, f) => { if (Math.random() >= 0.1 || ['inner-focus', 'steadfast'].includes(abKey(f)) && handlerOf(f)) return null; f.flags.flinch = true; return `😵 ¡${f.name} se amedrentó por el hedor!`; }
});
defineAbility('poison-touch', 'Sus ataques físicos pueden envenenar al rival (30%).', {
    strike: (s, f, mv, d, c) => { if (c.contact && Math.random() < 0.3) tryApplyStatus(f, 'poisoned', s, abName(s)); return null; }
});
defineAbility('toxic-chain', 'Sus ataques pueden envenenar gravemente al rival (30%).', {
    strike: (s, f) => { if (Math.random() < 0.3) tryApplyStatus(f, 'poisoned', s, abName(s)); return null; }
});
defineAbility('moxie', 'Al debilitar a un rival sube su Ataque.', koBoost('atk', 1.3));
defineAbility('chilling-neigh', 'Al debilitar a un rival sube su Ataque.', koBoost('atk', 1.3));
defineAbility('grim-neigh', 'Al debilitar a un rival sube su At. Esp.', koBoost('spAtk', 1.3));
defineAbility('beast-boost', 'Al debilitar a un rival sube su mejor estadística de ataque.', {
    ko: s => s.attack >= s.spAtk ? raiseMsg(s, 'atk', 1.3) : raiseMsg(s, 'spAtk', 1.3)
});
defineAbility('battle-bond', 'Al debilitar a un rival sube su Ataque y At. Esp.', {
    ko: s => { boostStat(s, 'atk', 1.2); boostStat(s, 'spAtk', 1.2); return `🔗 ¡El vínculo de ${s.name} lo hace más fuerte!`; }
});
defineAbility('soul-heart', 'Cuando un Pokémon es debilitado sube su At. Esp.', koBoost('spAtk', 1.2));
defineAbility('magician', 'Roba objetos al atacar (sin objetos: recupera 3% de HP).', {
    strike: s => { const h = healFrac(s, 0.03); return h > 0 ? `🎩 ¡${s.name} recuperó ${h} HP con su prestidigitación!` : null; }
});
defineAbility('pickpocket', 'Roba objetos al ser golpeado (sin objetos: recupera 3% de HP).', {
    hit: s => { const h = healFrac(s, 0.03); return h > 0 ? `🫳 ¡${s.name} recuperó ${h} HP!` : null; }
});

// ---------- Fin de turno ----------
defineAbility('rain-dish', 'Bajo la lluvia recupera HP cada turno.', {
    turn: s => { if (!rainy()) return null; const h = healFrac(s, 1 / 16); return h > 0 ? `💧 ¡${s.name} recupera ${h} HP con ${abName(s)}!` : null; }
});
defineAbility('ice-body', 'Bajo la nevada recupera HP cada turno.', {
    turn: s => { if (!snowy()) return null; const h = healFrac(s, 1 / 16); return h > 0 ? `❄️ ¡${s.name} recupera ${h} HP con ${abName(s)}!` : null; }
});
defineAbility('hydration', 'Bajo la lluvia se cura de sus estados alterados.', {
    turn: s => { if (!rainy() || !s.status) return null; s.status = null; return `💦 ¡${s.name} se curó con la lluvia!`; }
});
defineAbility('shed-skin', 'Cada turno puede curarse de un estado alterado (33%).', {
    turn: s => { if (!s.status || Math.random() >= 0.33) return null; s.status = null; return `🐍 ¡${s.name} mudó la piel y se curó!`; }
});
defineAbility('healer', 'Cada turno puede curarse de un estado alterado (30%).', {
    turn: s => { if (!s.status || Math.random() >= 0.3) return null; s.status = null; return `💚 ¡${s.name} se curó a sí mismo!`; }
});
defineAbility('triage', 'Recupera un 3% de HP cada turno.', { turn: s => { const h = healFrac(s, 0.03); return h > 0 ? `🩹 ¡${s.name} recupera ${h} HP!` : null; } });
defineAbility('bad-dreams', 'Cada turno daña al rival si está dormido.', {
    turn: (s, f) => { if (!f || f.status !== 'asleep') return null; const d = indirect(f, f.maxHp / 8); return d > 0 ? `😈 ¡Las pesadillas hieren a ${f.name} (-${d} HP)!` : null; }
});
defineAbility('moody', 'Cada turno sube una estadística y baja otra.', {
    turn: s => {
        const stats = ['atk', 'def', 'spAtk', 'spDef'];
        const up = stats[Math.floor(Math.random() * stats.length)];
        const down = stats.filter(x => x !== up)[Math.floor(Math.random() * 3)];
        boostStat(s, up, 1.25); boostStat(s, down, 0.9);
        return `🎭 ¡${s.name} cambia de humor! (+${STAT_ES[up]}, -${STAT_ES[down]})`;
    }
});
defineAbility('opportunist', 'Copia las mejoras de estadísticas del rival.', {
    turn: (s, f) => { if (!f) return null; let copied = false; Object.keys(s.mods).forEach(k => { if (f.mods[k] > s.mods[k]) { s.mods[k] = f.mods[k]; copied = true; } }); return copied ? `🪞 ¡${s.name} copió las mejoras de ${f.name}!` : null; }
});
defineAbility('forecast', 'Cambia de tipo según el clima.', {
    enter: s => { const t = sunny() ? 'Fuego' : rainy() ? 'Agua' : snowy() ? 'Hielo' : 'Normal'; s.types = [t]; s.type = t; return null; },
    turn: s => {
        const t = sunny() ? 'Fuego' : rainy() ? 'Agua' : snowy() ? 'Hielo' : 'Normal';
        if (hasT(s, t) && s.types.length === 1) return null;
        s.types = [t]; s.type = t;
        return `🌦️ ¡${s.name} cambió a tipo ${t}!`;
    }
});
defineAbility('natural-cure', 'Al salir del combate se cura de los estados alterados.', {
    leave: s => { if (!s.status) return null; s.status = null; return `🌿 ¡${s.name} se curó al retirarse!`; }
});
defineAbility('regenerator', 'Al salir del combate recupera un tercio de su vida.', {
    leave: s => { const h = healFrac(s, 1 / 3); return h > 0 ? `💗 ¡${s.name} recuperó ${h} HP al retirarse!` : null; }
});

// ---------- Inmunidades a estados ----------
defineAbility('limber', 'Inmune a la parálisis.', blockStatus(['paralyzed']));
defineAbility(['insomnia', 'vital-spirit', 'sweet-veil'], 'Inmune al sueño.', blockStatus(['asleep']));
defineAbility(['immunity', 'pastel-veil'], 'Inmune al envenenamiento.', blockStatus(['poisoned']));
defineAbility('water-veil', 'Inmune a la quemadura.', blockStatus(['burned']));
defineAbility('water-bubble', 'Inmune a la quemadura, recibe la mitad de daño de Fuego y duplica su Agua.', {
    status: (s, st) => st === 'burned' ? `🛡️ ¡${abName(s)} impide la quemadura!` : false,
    def: (s, f, mv, c) => c.moveType === 'Fuego' ? 0.5 : 1, atk: (s, f, mv, c) => c.moveType === 'Agua' ? 2 : 1
});
defineAbility('magma-armor', 'Inmune a la congelación.', blockStatus(['frozen']));
defineAbility('leaf-guard', 'Bajo el sol es inmune a los estados alterados.', { status: s => sunny() ? `🍃 ¡${abName(s)} de ${s.name} lo protege del estado!` : false });
defineAbility('comatose', 'Siempre medio dormido: inmune a los estados alterados.', { status: s => `😪 ¡${s.name} está demasiado aletargado para sufrir estados!` });
defineAbility('good-as-gold', 'Inmune a los estados alterados.', { status: s => `🏅 ¡${s.name} es inmune a los estados!` });
defineAbility('flower-veil', 'Los Pokémon Planta son inmunes a los estados alterados.', { status: s => hasT(s, 'Planta') ? `🌸 ¡${abName(s)} protege a ${s.name}!` : false });
defineAbility('synchronize', 'Si le paralizan, envenenan o queman, el rival sufre lo mismo.', {});
defineAbility('early-bird', 'Se despierta mucho antes del sueño.', {});

// ---------- Impedir huida / otros ----------
defineAbility(['shadow-tag', 'arena-trap', 'magnet-pull'], 'Impide que el rival cambie de Pokémon.', {
    enter: s => `🕸️ ¡${abName(s)} de ${s.name} atrapa al rival!`
});
defineAbility('truant', 'Solo puede actuar un turno de cada dos.', {
    before: s => {
        if (s.flags.loaf) { s.flags.loaf = false; return `😴 ¡${s.name} está holgazaneando!`; }
        s.flags.loaf = true;
        return null;
    }
});
defineAbility('steadfast', 'No se amedrenta.', {});
defineAbility('inner-focus', 'No se amedrenta. Inmune a Intimidación.', {});
defineAbility(['own-tempo', 'oblivious'], 'Inmune a Intimidación.', {});
defineAbility(['clear-body', 'white-smoke', 'full-metal-body', 'hyper-cutter', 'big-pecks', 'mirror-armor'], 'Impide que el rival le baje las estadísticas.', {});
defineAbility('contrary', 'Invierte los cambios de estadísticas.', {});
defineAbility('simple', 'Duplica los cambios de estadísticas.', {});
defineAbility(['defiant', 'competitive'], 'Si le bajan una estadística, sube mucho su Ataque / At. Esp.', {});
defineAbility('guard-dog', 'La Intimidación le sube el Ataque.', {});

// ---------- Pasivas sin mecánica equivalente: efecto menor ----------
['pickup', 'honey-gather', 'ball-fetch'].forEach(k => defineAbility(k, 'Cada turno puede encontrar una baya y recuperar HP (15%).', recolector(0.15, 0.06)));
defineAbility('harvest', 'Cada turno puede recuperar una baya y sanar HP (50%).', recolector(0.5, 0.06));
defineAbility('cud-chew', 'Cada turno puede rumiar una baya y sanar HP (30%).', recolector(0.3, 0.06));
defineAbility('cheek-pouch', 'Cada turno puede recuperar HP de sus carrillos (30%).', recolector(0.3, 0.06));
defineAbility(['ripen', 'gluttony', 'symbiosis'], 'Aprovecha mejor las bayas: puede recuperar HP cada turno (20%).', recolector(0.2, 0.06));
defineAbility('unburden', 'Ligero: +5% de daño.', flatAtk(1.05));
defineAbility('klutz', 'Torpe: sin efecto en combate.', {});
defineAbility('sticky-hold', 'Sin efecto en combate, resiste un 5% más.', minor());
defineAbility('run-away', 'Huye de las trampas del rival.', {});
defineAbility(['heavy-metal', 'light-metal'], 'Su peso no influye en el combate: resiste un 5% más.', minor());
defineAbility('telepathy', 'Telepatía: recibe un 5% menos de daño.', minor());
defineAbility('stall', 'Resiste un 5% más al actuar con calma.', minor());
defineAbility('soundproof', 'Aislado del ruido: recibe un 5% menos de daño especial.', { def: (s, f, mv) => mv.isSpecial ? 0.95 : 1 });
defineAbility('rock-head', 'Cabeza dura: recibe un 5% menos de daño.', minor());
defineAbility('suction-cups', 'Bien agarrado: recibe un 5% menos de daño.', minor());
defineAbility('propeller-tail', 'Cola hélice: recibe un 5% menos de daño.', minor());
defineAbility('stalwart', 'Acérrimo: recibe un 5% menos de daño.', minor());
defineAbility('bulletproof', 'Antibalas: recibe un 5% menos de daño.', minor());
defineAbility(['queenly-majesty', 'dazzling', 'armor-tail'], 'Su presencia intimida: recibe un 10% menos de daño.', flatDef(0.9));
defineAbility(['aroma-veil', 'multitype', 'rks-system', 'mimicry', 'dancer', 'receiver', 'power-of-alchemy', 'commander', 'costar'], 'Habilidad de equipo: concede un 5% menos de daño recibido en este modo.', minor());

// =========================================================
// DISPATCHER PRINCIPAL
// =========================================================

function abilityEnter(owner, foe, st) {
    resetUnitForEntry(owner);
    const key = abKey(owner);
    if (!key || key === 'none') return null;
    if (!AB[key]) return `✨ ¡${owner.name} despliega su habilidad ${getAbilityDisplayName(key)}!`;
    const h = handlerOf(owner);
    if (h && h.enter) return h.enter(owner, foe, st || CombatState) || null;
    return null;
}

function abilityTurnEnd(owner, foe, st) {
    if (!owner || owner.currentHp <= 0) return null;
    owner.turnsIn = (owner.turnsIn || 0) + 1;
    const msgs = [];

    if (owner.flags.perish > 0) {
        owner.flags.perish--;
        if (owner.flags.perish === 0) { owner.currentHp = 0; msgs.push(`☠️ ¡${owner.name} se debilitó por la cuenta atrás!`); }
        else msgs.push(`⏳ La cuenta atrás de ${owner.name}: ${owner.flags.perish}`);
    }

    const h = owner.currentHp > 0 ? handlerOf(owner) : null;
    if (h && h.turn) { const m = h.turn(owner, foe, st || CombatState); if (m) msgs.push(m); }

    owner.flags.justEntered = false;
    return msgs.length ? msgs.join(' ') : null;
}

function triggerAbility(triggerType, owner, target, move = null, damage = 0, battleState = null, extra = null) {
    const isDamageHook = triggerType === 'onDamage' || triggerType === 'onReceiveDamage';
    if (!owner) return isDamageHook ? { damage, message: null } : null;
    ensureUnit(owner);
    if (target) ensureUnit(target);

    switch (triggerType) {
        case 'onEnter': return abilityEnter(owner, target, battleState);
        case 'onTurnEnd': return abilityTurnEnd(owner, target, battleState);
        case 'onDamage': return runDamageHook('atk', owner, target, move, damage, extra);
        case 'onReceiveDamage': return runDamageHook('def', owner, target, move, damage, extra);
        case 'onBeforeMove': {
            const h = handlerOf(owner);
            if (h && h.before) { const m = h.before(owner, target, battleState); if (m) return { skip: true, message: m }; }
            return null;
        }
        case 'onSwitchOut': {
            const h = handlerOf(owner);
            return h && h.leave ? (h.leave(owner, target, battleState) || null) : null;
        }
        default: return null;
    }
}
