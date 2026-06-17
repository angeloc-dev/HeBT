import { API_BASE_URL } from "@/model/constants";
import type { Recipe } from "@/model/data-model.ts";
import axios from "axios";

export const recipeService = {
    async getAllRecipes(signal?: AbortSignal): Promise<Recipe[]> {
        try {
            const response = await axios.get(`${API_BASE_URL}/recipes`, { signal });
            return response.data;
        } catch (error) {
            console.error("Errore nel recupero delle ricette:", error);
            throw error;
        }
    },
    async getRecipeById(id: number): Promise<Recipe> {
        try {
            const response = await axios.get(`${API_BASE_URL}/recipes/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Errore nel recupero della ricetta ${id}:`, error);
            throw error;
        }
    },
    async getCookableRecipes(): Promise<Recipe[]> {
        try {
            const response = await axios.get(`${API_BASE_URL}/recipes/cookable`);
            return response.data;
        } catch (error) {
            console.error("Errore nel recupero delle ricette disponibili:", error);
            throw error;
        }
    },
    async cookRecipeFree(id: number, guests: number): Promise<void> {
        try {
            await axios.post(`${API_BASE_URL}/recipes/${id}/cook`, { guests });
        } catch (error) {
            console.error("Errore nel confermare la cottura libera della ricetta:", error);
            throw error;
        }
    },
    async createRecipe(recipe: Recipe): Promise<Recipe> {
        try {
            const response = await axios.post(`${API_BASE_URL}/recipes`, recipe);
            return response.data;
        } catch (error){
            console.error("Errore nella creazione della ricetta:", error);
            throw error;
        }
    },

    async editRecipe(id: number, recipe: Recipe): Promise<Recipe> {
        try {
            const response = await axios.put(`${API_BASE_URL}/recipes/${id}`, recipe);
            return response.data;
        } catch (error){
            console.error("Errore nella modifica della ricetta:", error);
            throw error;
        }
    },

    async deleteRecipe(id: number): Promise<void> {
        try {
            await axios.delete(`${API_BASE_URL}/recipes/${id}`);
        } catch (error){
            console.error("Errore nell'eliminazione della ricetta:", error);
            throw error;
        }
    }
};