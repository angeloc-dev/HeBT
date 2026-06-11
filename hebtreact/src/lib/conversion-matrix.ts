/**
 * Peso specifico approssimativo in grammi per 1 Cup (Tazza USA = ~240ml)
 * per gli ingredienti più comuni. Tutto il resto cadrà in un fallback.
 */
const INGREDIENT_DENSITY: Record<string, number> = {
    // Farine e polveri leggere
    "farina": 130, "farina 00": 130, "cacao": 100, "zucchero a velo": 120,
    // Zuccheri e solidi densi
    "zucchero": 200, "zucchero di canna": 220, "sale": 273, "riso": 190,
    // Grassi e liquidi densi
    "burro": 225, "miele": 340, "yogurt": 245,
    // Liquidi (acqua, latte, olio - densità ~1g/ml o poco meno)
    "latte": 240, "acqua": 240, "olio": 225, "olio evo": 225
};

/**
 * Tenta di stimare i grammi (o ml) in base all'ingrediente e all'unità.
 */
export function estimateBaseAmount(amount: number, unit: string, ingredientName: string): { amount: number, baseUnit: string } {
    const nameStr = ingredientName.toLowerCase().trim();

    if (unit === "g") return { amount, baseUnit: "g" };
    if (unit === "kg") return { amount: amount * 1000, baseUnit: "g" };
    if (unit === "oz") return { amount: amount * 28.35, baseUnit: "g" };
    if (unit === "lb") return { amount: amount * 453.59, baseUnit: "g" };
    if (unit === "ml") return { amount, baseUnit: "ml" };
    if (unit === "cl") return { amount: amount * 10, baseUnit: "ml" };
    if (unit === "dl") return { amount: amount * 100, baseUnit: "ml" };
    if (unit === "l") return { amount: amount * 1000, baseUnit: "ml" };
    if (unit === "pz") return { amount, baseUnit: "pz" };
    if (unit === "pizzico") return { amount: amount * 1, baseUnit: "g" };
    if (unit === "qb") return { amount: 5, baseUnit: "g" };
    const weightPerCup = Object.keys(INGREDIENT_DENSITY).find(key => nameStr.includes(key))
        ? INGREDIENT_DENSITY[Object.keys(INGREDIENT_DENSITY).find(key => nameStr.includes(key))!]
        : 240;
    if (unit === "cup") return { amount: amount * weightPerCup, baseUnit: "g" };
    if (unit === "tbsp") return { amount: amount * (weightPerCup / 16), baseUnit: "g" };
    if (unit === "tsp") return { amount: amount * (weightPerCup / 48), baseUnit: "g" };
    return { amount, baseUnit: unit };
}