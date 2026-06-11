import type {MealSlotConfig, OptionGroup} from "@/model/data-model.ts";
import {
    FiBox, FiDroplet, FiHash, FiCoffee, FiWind,
    FiSunrise, FiShoppingBag, FiPackage, FiThermometer, FiClock, FiSun, FiMoon, FiStar
} from "react-icons/fi";

export const API_BASE_URL = "http://localhost:8080/api";

export const formatDateLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

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