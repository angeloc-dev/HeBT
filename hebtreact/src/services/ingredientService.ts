import axios from "axios";
import { API_BASE_URL } from "@/model/constants.ts";
import type { Ingredient } from "@/model/data-model.ts";

export const ingredientService = {
    async searchIngredients(query: string): Promise<Ingredient[]> {
        try {
            const response = await axios.get(`${API_BASE_URL}/ingredients/search`, {
                params: { q: query }
            });
            return response.data;
        } catch (error) {
            console.error("Errore nella ricerca degli ingredienti:", error);
            throw error;
        }
    },
    async addIngredient(ingredient: Omit<Ingredient, 'id'>): Promise<Ingredient> {
        try {
            const response = await axios.post(`${API_BASE_URL}/ingredients`, ingredient);
            return response.data;
        } catch (error) {
            console.error("Errore nell'aggiunta dell'ingrediente:", error);
            throw error;
        }
    }
};