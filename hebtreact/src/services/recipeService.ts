import type {Recipe} from "@/model/data-model.ts";

const API_BASE_URL = "http://localhost:8080/api/";

export const recipeService = {
    async getAllRecipes(): Promise<Recipe[]> {
        const response = await fetch(`${API_BASE_URL}/recipes`);
        if (!response.ok) {
            throw new Error(`Errore durante il recupero delle ricette: ${response.statusText}`);
        }

        return response.json();
    },
    async getRecipeById(id: string): Promise<Recipe> {
        const response = await fetch(`${API_BASE_URL}/recipes/${id}`);
        if (!response.ok) throw new Error("Ricetta non trovata");
        return response.json();
    }
};