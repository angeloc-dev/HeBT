
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
    imageUrl?: string;
    ingredients: Ingredient[];
}

export interface RecipeIngredient {
    ingredientId: number;
    ingredientName: string;
    amount: number;
    unit: string;
    section: string;
}

export interface MealPlan {
    id: number;
    recipeId: number;
    recipeTitle: string;
    plannedData: Date;
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
