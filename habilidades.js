// habilidades.js - Motor Inteligente de Habilidades con Traducción Completa al Español

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

const ABILITIES_DB = {
    // --- CLASE: ENTRADA AL CAMPO (onEnter) ---
    "intimidate": {
        name: "Intimidación",
        trigger: "onEnter",
        description: "Baja un 15% el Ataque del rival al entrar en combate.",
        execute: (owner, opponent) => {
            opponent.attack = Math.floor(opponent.attack * 0.85);
            return `👁️ ¡La Intimidación de ${owner.name} redujo el Ataque de ${opponent.name}!`;
        }
    },
    "pressure": {
        name: "Presión",
        trigger: "onEnter",
        description: "Ejerce una presión asfixiante sobre el rival al entrar en combate.",
        execute: (owner, opponent) => {
            return `⚡ ¡${owner.name} ejerce una gran Presión sobre ${opponent.name}!`;
        }
    },
    "drizzle": {
        name: "Llovizna",
        trigger: "onEnter",
        description: "Invoca Lluvia al entrar al campo.",
        execute: (owner, opponent, battleState) => {
            if (battleState) battleState.weather = "rain";
            return `🌧️ ¡La Llovizna de ${owner.name} hizo empezar a llover!`;
        }
    },
    "drought": {
        name: "Sequía",
        trigger: "onEnter",
        description: "Invoca Sol Abrasador al entrar al campo.",
        execute: (owner, opponent, battleState) => {
            if (battleState) battleState.weather = "sun";
            return `☀️ ¡La Sequía de ${owner.name} hizo intensificar la luz solar!`;
        }
    },
    "download": {
        name: "Descarga",
        trigger: "onEnter",
        description: "Aumenta un stat ofensivo según las defensas del rival.",
        execute: (owner, opponent) => {
            if (opponent.defense < opponent.spDef) {
                owner.attack = Math.floor(owner.attack * 1.3);
                return `💻 ¡Descarga aumentó el Ataque Físico de ${owner.name}!`;
            } else {
                owner.spAtk = Math.floor(owner.spAtk * 1.3);
                return `💻 ¡Descarga aumentó el Ataque Especial de ${owner.name}!`;
            }
        }
    },

    // --- CLASE: MODIFICADORES DE DAÑO (onDamage / onReceiveDamage) ---
    "blaze": {
        name: "Mar Llamas",
        trigger: "onDamage",
        description: "Potencia los movimientos de Fuego con poca salud.",
        execute: (owner, defender, move, currentDamage) => {
            if (move.type === 'Fuego' && owner.currentHp <= owner.maxHp * 0.33) {
                return { damage: Math.floor(currentDamage * 1.5), message: `🔥 ¡Mar Llamas potenció el ataque de ${owner.name}!` };
            }
            return { damage: currentDamage, message: null };
        }
    },
    "torrent": {
        name: "Torrente",
        trigger: "onDamage",
        description: "Potencia los movimientos de Agua con poca salud.",
        execute: (owner, defender, move, currentDamage) => {
            if (move.type === 'Agua' && owner.currentHp <= owner.maxHp * 0.33) {
                return { damage: Math.floor(currentDamage * 1.5), message: `🌊 ¡Torrente potenció el ataque de ${owner.name}!` };
            }
            return { damage: currentDamage, message: null };
        }
    },
    "overgrow": {
        name: "Espesura",
        trigger: "onDamage",
        description: "Potencia los movimientos de Planta con poca salud.",
        execute: (owner, defender, move, currentDamage) => {
            if (move.type === 'Planta' && owner.currentHp <= owner.maxHp * 0.33) {
                return { damage: Math.floor(currentDamage * 1.5), message: `🌿 ¡Espesura potenció el ataque de ${owner.name}!` };
            }
            return { damage: currentDamage, message: null };
        }
    },
    "levitate": {
        name: "Levitación",
        trigger: "onDamage",
        description: "Inmunidad total frente a ataques de tipo Tierra.",
        execute: (owner, defender, move, currentDamage) => {
            if (move.type === 'Tierra') {
                return { damage: 0, message: `🕊️ ¡${owner.name} levita y evade el ataque de Tierra!` };
            }
            return { damage: currentDamage, message: null };
        }
    },
    "sturdy": {
        name: "Robustez",
        trigger: "onReceiveDamage",
        description: "Aguanta un golpe mortal si tiene la salud al máximo.",
        execute: (owner, attacker, move, damage) => {
            if (owner.currentHp === owner.maxHp && damage >= owner.maxHp) {
                return { damage: owner.maxHp - 1, message: `🛡️ ¡${owner.name} aguantó el golpe gracias a Robustez!` };
            }
            return { damage: damage, message: null };
        }
    },

    // --- CLASE: FIN DE TURNO (onTurnEnd) ---
    "rain-dish": {
        name: "Cura Lluvia",
        trigger: "onTurnEnd",
        description: "Recupera HP al final de cada turno.",
        execute: (owner) => {
            if (owner.currentHp < owner.maxHp) {
                const heal = Math.floor(owner.maxHp * 0.06);
                owner.currentHp = Math.min(owner.maxHp, owner.currentHp + heal);
                return `💧 ${owner.name} recuperó +${heal} HP gracias a Cura Lluvia.`;
            }
            return null;
        }
    },
    "speed-boost": {
        name: "Impulso",
        trigger: "onTurnEnd",
        description: "Aumenta la velocidad progresivamente en cada turno.",
        execute: (owner) => {
            owner.speed = Math.floor(owner.speed * 1.1);
            return `⚡ ¡La velocidad de ${owner.name} aumentó gracias a Impulso!`;
        }
    }
};

/**
 * Obtiene el nombre traducido de la habilidad de forma limpia
 */
function getAbilityDisplayName(abilityKey) {
    if (!abilityKey || abilityKey === 'none') return 'Ninguna';
    const cleanKey = abilityKey.toLowerCase().trim();
    return ABILITIES_TRANSLATIONS[cleanKey] || formatPokemonName(cleanKey);
}

/**
 * Motor de Activación con Respaldo Inteligente (Fallback)
 */
function triggerAbility(triggerType, owner, target, move = null, damage = 0, battleState = null) {
    if (!owner || !owner.ability || owner.ability === 'none') return null;

    const abilityKey = owner.ability.toLowerCase().trim();
    const displayName = getAbilityDisplayName(abilityKey);
    
    // 1. Buscar en la base de datos manual
    if (ABILITIES_DB[abilityKey]) {
        const ability = ABILITIES_DB[abilityKey];
        if (ability.trigger === triggerType) {
            return ability.execute(owner, target, move, damage, battleState);
        }
        return null;
    }

    // 2. Sistema Inteligente de Respaldo con nombres traducidos
    if (triggerType === 'onEnter') {
        if (abilityKey.includes('shield') || abilityKey.includes('armor')) {
            owner.defense = Math.floor(owner.defense * 1.1);
            return `🛡️ ¡La habilidad ${displayName} de ${owner.name} fortificó su defensa al entrar!`;
        }
        return `✨ ¡${owner.name} despliega su habilidad ${displayName}!`;
    }

    return null;
}