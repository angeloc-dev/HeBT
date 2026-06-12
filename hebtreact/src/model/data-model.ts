import type { IconType } from "react-icons/lib";

export interface Ingredient {
    id: number;
    name: string;
    category: string;
}

export interface Recipe {
    id: number;
    title: string;
    description: string;
    instructions: string;
    image?: string;
    ingredients: RecipeIngredient[];
    isInMealPlan: boolean;
}

export interface RecipeIngredient {
    ingredientId: number;
    ingredientName: string;
    amount: number;
    unit: string;
    section: string;
}

export type DraftIngredient = Omit<RecipeIngredient, 'ingredientId'> & { ingredientId?: number };

export interface MealPlan {
    id: number;
    recipeId: number;
    recipeTitle: string;
    plannedDate: string;
    mealType: string;
    servings: number;
}

export interface PantryItem {
    id: number;
    ingredientId: number;
    ingredientName: string;
    category: string;
    currentAmount: number;
    unit: string;
    expirationDate: Date;
    purchaseDate: Date;
}

export interface ShoppingListItem {
    id: number;
    ingredientId: number;
    ingredientName: string;
    category: string;
    amount: number;
    unit: string;
    isPurchased: boolean;
}

// -- TOAST
export type ToastType = "success" | "error" | "warning";

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

export interface ToastContextType {
    addToast: (message: string, type: ToastType) => void;
}
// -- MENU A TENDINA
export interface OptionGroup {
    label: string;
    options: SelectOption[];
}

export interface SelectOption {
    value: string | number;
    label: string;
    icon?: IconType;
}

// -- Vista Planner
export type PlannerView = 'CALENDAR' | 'SHOPPING_LIST';

export interface MealSlotConfig {
    id: string;
    label: string;
    icon: IconType;
}

export type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "destructive";

// -- Vista Pantry

export type SortMode = "expiration_asc" | "category_asc";