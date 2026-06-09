import type {Recipe} from "@/model/data-model.ts";

const API_BASE_URL = "http://localhost:8080/api";

export const recipeService = {
    async getAllRecipes(): Promise<Recipe[]> {
        const response = await fetch(`${API_BASE_URL}/recipes`);
        if (!response.ok) {
            throw new Error(`Errore durante il recupero delle ricette: ${response.statusText}`);
        }

        return response.json();
    },

    async getRecipeById(id: number): Promise<Recipe> {
        const response = await fetch(`${API_BASE_URL}/recipes/${id}`);
        if (!response.ok) throw new Error("Ricetta non trovata");
        return response.json();
    },
    async createRecipe(Recipe: Recipe): Promise<Recipe> {
        const response = await fetch(`${API_BASE_URL}/recipes`, {
            method: "POST",
            body: JSON.stringify(Recipe),
        });
        if (!response.ok) {
            throw new Error(`Errore durante l'aggiunta della ricetta: ${response.statusText}`);
        }
        return response.json();
    },
    async editRecipe(id: number, Recipe: Recipe): Promise<Recipe> {
        const response = await fetch(`${API_BASE_URL}/recipes/${id}`, {
            method: "PUT",
            body: JSON.stringify(Recipe),
        });
        if (!response.ok) {
            throw new Error(`Errore durante la modifica della ricetta: ${response.statusText}`);
        }
        return response.json();
    },
    async deleteRecipe(id: number): Promise<Recipe> {
        const response = await fetch(`${API_BASE_URL}/recipes/${id}`, {
            method: "DELETE"
        });
        if (!response.ok) {
            throw new Error(`Errore durante l'eliminazione della ricetta: ${response.statusText}`);
        }
        return response.json();
    }
};