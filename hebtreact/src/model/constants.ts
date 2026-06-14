import type {MealSlotConfig, OptionGroup} from "@/model/data-model.ts";
import {
    FiBox, FiDroplet, FiHash, FiCoffee, FiWind,
    FiSunrise, FiShoppingBag, FiPackage, FiThermometer, FiClock, FiSun, FiMoon, FiStar
} from "react-icons/fi";

export const API_BASE_URL = `http://${window.location.hostname}:8080/api`;

export const UNIT_GROUPS: OptionGroup[] = [
    {
        label: "Sistema Metrico (Assolute)",
        options: [
            { value: "g", label: "Grammi (g)", icon: FiBox },
            { value: "kg", label: "Chilogrammi (kg)", icon: FiBox },
            { value: "ml", label: "Millilitri (ml)", icon: FiDroplet },
            { value: "cl", label: "Centilitri (cl)", icon: FiDroplet },
            { value: "dl", label: "Decilitri (dl)", icon: FiDroplet },
            { value: "l", label: "Litri (l)", icon: FiDroplet },
            { value: "pz", label: "Pezzi (pz)", icon: FiHash }
        ]
    },
    {
        label: "Sistema Anglosassone",
        options: [
            { value: "oz", label: "Once (oz)", icon: FiBox },
            { value: "lb", label: "Libbre (lb)", icon: FiBox }
        ]
    },
    {
        label: "Misurazioni Casalinghe",
        options: [
            { value: "cup", label: "Tazza (Cup)", icon: FiCoffee },
            { value: "tbsp", label: "Cucchiaio (Tbsp)", icon: FiCoffee },
            { value: "tsp", label: "Cucchiaino (Tsp)", icon: FiCoffee }
        ]
    },
    {
        label: "Empiriche",
        options: [
            { value: "qb", label: "Quanto Basta (q.b.)", icon: FiWind },
            { value: "pizzico", label: "Pizzico", icon: FiWind }
        ]
    }
];

export const TABLESPOON_WEIGHTS: Record<string, number> = {
    "farina": 10,
    "cacao": 8,
    "lievito": 8,
    "zucchero a velo": 5,
    "zucchero": 12,
    "sale": 18,
    "riso": 12,
    "burro": 20,
    "miele": 15,
    "olio": 15,
    "acqua": 15,
    "latte": 15,
    "vino": 15
};

export const normalizeIngredientName = (name: string): string => {
    const lowerName = name.toLowerCase();
    for (const key of Object.keys(TABLESPOON_WEIGHTS)) {
        if (lowerName.includes(key)) return key;
    }
    return "default";
};

export const formatRecipeIngredient = (
    amountInGramsOrMl: number,
    unit: string,
    ingredientName: string
): string => {
    if (unit.toLowerCase() === "qb" || amountInGramsOrMl === 0) {
        return "q.b.";
    }
    if (unit === "pz") {
        return `${Math.round(amountInGramsOrMl)} pz`;
    }
    if (unit === "ml" && amountInGramsOrMl >= 1000) {
        return `${(amountInGramsOrMl / 1000).toFixed(1).replace('.0', '')} L`;
    }
    if (unit === "g" && amountInGramsOrMl >= 1000) {
        return `${(amountInGramsOrMl / 1000).toFixed(1).replace('.0', '')} Kg`;
    }
    if (amountInGramsOrMl <= 60 && (unit === "g" || unit === "ml")) {
        const normalizedName = normalizeIngredientName(ingredientName);
        if (normalizedName !== "default") {
            const weightPerSpoon = TABLESPOON_WEIGHTS[normalizedName];
            const spoons = amountInGramsOrMl / weightPerSpoon;
            if (spoons % 0.5 === 0 && spoons <= 4) {
                return `${spoons} ${spoons === 1 ? 'Cucchiaio' : 'Cucchiai'}`;
            }
        }
    }
    if (unit === "cup" || unit === "tbsp" || unit === "tsp") {
        switch (unit) {
            case "cup":
                if (amountInGramsOrMl > 1) return `${Math.round(amountInGramsOrMl)} Tazze`;
                else return `${Math.round(amountInGramsOrMl)} Tazza`;
            case "tbsp":
                if (amountInGramsOrMl > 1) return `${Math.round(amountInGramsOrMl)} Cucchiai`;
                else return `${Math.round(amountInGramsOrMl)} Cucchiaio`;
            case "tsp":
                if (amountInGramsOrMl > 1) return `${Math.round(amountInGramsOrMl)} Cucchiaini`;
                else return `${Math.round(amountInGramsOrMl)} Cucchiaino`;
        }
    }
    return `${Math.round(amountInGramsOrMl)} ${unit}`;
};

export const VOLUME_TO_WEIGHT: Record<string, number> = {
    "cup": 240,
    "tbsp": 15,
    "tsp": 5,
    "cucchiaio": 15,
    "cucchiaino": 5,
    "bicchiere": 200,
    "tazzina": 50,
};

export const convertToAbsoluteUnit = (amount: number, unit: string, ingredientName: string): { amount: number, unit: string } => {
    const lowerUnit = unit.toLowerCase();
    if (["g", "ml", "pz", "qb"].includes(lowerUnit)) {
        return { amount, unit: lowerUnit };
    }
    if (lowerUnit === "l") return { amount: amount * 1000, unit: "ml" };
    if (lowerUnit === "dl") return { amount: amount * 100, unit: "ml" };
    if (lowerUnit === "cl") return { amount: amount * 10, unit: "ml" };
    if (lowerUnit === "kg") return { amount: amount * 1000, unit: "g" };
    if (lowerUnit === "oz") return { amount: amount * 28.35, unit: "g" };
    if (lowerUnit === "lb") return { amount: amount * 453.59, unit: "g" };
    if (lowerUnit === "pizzico") {
        return { amount: (amount * 2) || 2, unit: "g" };
    }
    if (VOLUME_TO_WEIGHT[lowerUnit]) {
        const baseVolumeMl = VOLUME_TO_WEIGHT[lowerUnit];
        const normalizedName = normalizeIngredientName(ingredientName);
        if (normalizedName !== "default" && TABLESPOON_WEIGHTS[normalizedName]) {
            const standardSpoonsInVolume = baseVolumeMl / 15;
            const weightForThisVolume = standardSpoonsInVolume * TABLESPOON_WEIGHTS[normalizedName];
            return {
                amount: amount * weightForThisVolume,
                unit: "g"
            };
        }
        return {
            amount: amount * baseVolumeMl,
            unit: "ml"
        };
    }
    return { amount, unit };
};

export const formatShoppingListUnit = (amount: number, unit: string): string => {
    const lowerUnit = unit.toLowerCase();
    if (lowerUnit === "qb") return "q.b.";
    if (lowerUnit === "pz") return `${Math.ceil(amount)} pz`;
    if (lowerUnit === "g") {
        if (amount >= 1000) {
            return `${(amount / 1000).toFixed(2).replace(/\.00$/, '')} Kg`;
        }
        return `${Math.ceil(amount)} g`;
    }
    if (lowerUnit === "ml") {
        if (amount >= 1000) {
            return `${(amount / 1000).toFixed(2).replace(/\.00$/, '')} L`;
        }
        return `${Math.ceil(amount)} ml`;
    }
    return `${Math.ceil(amount)} ${unit}`;
};

export const SUPERMARKET_ORDER = [
    "Ortofrutta",
    "Panetteria e Pasticceria",
    "Gastronomia",
    "Macelleria",
    "Pescheria",
    "Colazione e Biscotti",
    "Farine e Preparati",
    "Pasta e Riso",
    "Sughi, Salse e Condimenti",
    "Scatolame e Conserve",
    "Cereali e Zuppe",
    "Olio e Spezie",
    "Snack e Aperitivi",
    "Acqua e Bibite",
    "Vini e Alcolici",
    "Freschi",
    "Latticini e Derivati",
    "Surgelati",
    "Altro"
];

export const SHOPPING_SECTION_GROUPS: OptionGroup[] = [
    {
        label: "Freschi e Deperibili",
        options: [
            { value: "Ortofrutta", label: "Ortofrutta", icon: FiSunrise },
            { value: "Panetteria e Pasticceria", label: "Panetteria e Pasticceria", icon: FiShoppingBag },
            { value: "Macelleria", label: "Macelleria", icon: FiShoppingBag },
            { value: "Pescheria", label: "Pescheria", icon: FiDroplet },
            { value: "Gastronomia", label: "Gastronomia", icon: FiShoppingBag },
            { value: "Freschi", label: "Freschi", icon: FiThermometer }
        ]
    },
    {
        label: "Dispensa",
        options: [
            { value: "Pasta e Riso", label: "Pasta e Riso", icon: FiPackage },
            { value: "Sughi, Salse e Condimenti", label: "Sughi, Salse", icon: FiDroplet },
            { value: "Olio e Spezie", label: "Olio e Spezie", icon: FiDroplet },
            { value: "Farine e Preparati", label: "Farine e Preparati", icon: FiBox },
            { value: "Scatolame e Conserve", label: "Scatolame e Conserve", icon: FiPackage },
            { value: "Cereali e Zuppe", label: "Cereali e Zuppe", icon: FiPackage },
            { value: "Colazione e Biscotti", label: "Colazione e Biscotti", icon: FiCoffee },
            { value: "Snack e Aperitivi", label: "Snack e Aperitivi", icon: FiBox }
        ]
    },
    {
        label: "Freddo",
        options: [
            { value: "Latticini e Derivati", label: "Latticini e Derivati", icon: FiThermometer },
            { value: "Surgelati", label: "Surgelati", icon: FiThermometer }
        ]
    },
    {
        label: "Bevande",
        options: [
            { value: "Acqua e Bibite", label: "Acqua e Bibite", icon: FiDroplet },
            { value: "Vini e Alcolici", label: "Vini e Alcolici", icon: FiDroplet }
        ]
    },
    {
        label: "Altro",
        options: [
            { value: "Altro", label: "Altro", icon: FiBox }
        ]
    }
];

export const CATEGORY_EXPIRATION_DAYS: Record<string, number> = {
    "Ortofrutta": 7,
    "Panetteria e Pasticceria": 3,
    "Macelleria": 3,
    "Pescheria": 1,
    "Gastronomia": 3,
    "Freschi": 5,
    "Pasta e Riso": 365,
    "Sughi, Salse e Condimenti": 180,
    "Olio e Spezie": 365,
    "Farine e Preparati": 180,
    "Scatolame e Conserve": 365,
    "Cereali e Zuppe": 180,
    "Colazione e Biscotti": 180,
    "Snack e Aperitivi": 180,
    "Latticini e Derivati": 14,
    "Surgelati": 180,
    "Acqua e Bibite": 365,
    "Vini e Alcolici": 365,
    "Altro": 30
};

export const getDefaultExpirationForCategory = (category: string): Date | number => {
    const days = CATEGORY_EXPIRATION_DAYS[category] || 7;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    return targetDate;
};

export const MEAL_SLOTS: MealSlotConfig[] = [
    { id: "COLAZIONE", label: "Colazione", icon: FiCoffee },
    { id: "SPUNTINO_MATTINA", label: "Spuntino", icon: FiClock },
    { id: "PRANZO", label: "Pranzo", icon: FiSun },
    { id: "MERENDA", label: "Merenda", icon: FiClock },
    { id: "CENA", label: "Cena", icon: FiMoon },
    { id: "SPUNTINO_NOTTE", label: "Spuntino Notte", icon: FiStar }
];

export const MEAL_SLOT_OPTIONS = [
    { value: "COLAZIONE", label: "Colazione" },
    { value: "SPUNTINO_MATTINA", label: "Spuntino Mattina" },
    { value: "PRANZO", label: "Pranzo" },
    { value: "MERENDA", label: "Merenda" },
    { value: "CENA", label: "Cena" },
    { value: "SPUNTINO_NOTTE", label: "Spuntino Notte" }
];

export const formatUnit = (amount: number, unit: string) => {
    if (unit === "qb") return "q.b.";
    if (unit === "tbsp") return amount === 1 ? "cucchiaio" : "cucchiai";
    if (unit === "tsp") return amount === 1 ? "cucchiaino" : "cucchiaini";
    return unit;
};

export const formatDateForInput = (d: Date | string): string => {
    const dateObj = new Date(d);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const getStartOfWeek = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
};

export const formatDateLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const formatExpirationDateForInput = (dateInput: Date | string | undefined): string => {
    if (!dateInput) return "";
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
};

export const GUEST_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1} ${i === 0 ? "persona" : "persone"}`
}));
