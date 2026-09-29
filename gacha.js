// Algoritmo de Probabilidades Gacha
function getRandomRarity() {
    const rand = Math.random() * 100;
    if (rand < 1) return "secreto";       // 1%
    if (rand < 6) return "legendario";    // 5%
    if (rand < 20) return "épico";        // 14%
    if (rand < 50) return "raro";         // 30%
    return "común";                       // 50%
}

// Obtener un Pokémon aleatorio según raridad elegida
function getRandomPokemonByRarity(rarity) {
    const pool = DATABASE[rarity];
    const randomIndex = Math.floor(Math.random() * pool.length);
    return { ...pool[randomIndex], rarity };
}

// Ejecutar Tirada Individual (x1 Ticket)
function executeSinglePull() {
    const rarity = getRandomRarity();
    return getRandomPokemonByRarity(rarity);
}

// Ejecutar Multi-Tirada (x10 Tickets con Épico o superior asegurado)
function executeMultiPull() {
    const results = [];
    let hasEpicOrHigher = false;

    // 9 tiradas normales
    for (let i = 0; i < 9; i++) {
        const item = executeSinglePull();
        if (item.rarity === "épico" || item.rarity === "legendario" || item.rarity === "secreto") {
            hasEpicOrHigher = true;
        }
        results.push(item);
    }

    // Décima tirada: aseguramos que haya al menos 1 Épico o superior
    if (hasEpicOrHigher) {
        results.push(executeSinglePull());
    } else {
        const guaranteedRarities = ["épico", "legendario", "secreto"];
        const randRarity = guaranteedRarities[Math.floor(Math.random() * guaranteedRarities.length)];
        results.push(getRandomPokemonByRarity(randRarity));
    }

    return results;
}