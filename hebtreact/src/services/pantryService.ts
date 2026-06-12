import type {PantryItem} from "@/model/data-model.ts";
import {API_BASE_URL} from "@/model/constants.ts";
import axios from "axios";

export const pantryService = {
    async getPantry(): Promise<PantryItem[]> {
        try {
            const response = await axios.get(`${API_BASE_URL}/pantry`);
            return response.data;
        } catch (error) {
            console.error("Errore nel reperimento degli elementi della dispensa:", error);
            throw error;
        }
    },
    async addPantryItem(pantryItem: PantryItem): Promise<PantryItem> {
        try {
            const response = await axios.post(`${API_BASE_URL}/pantry`, pantryItem);
            return response.data;
        } catch (error) {
            console.error("Errore nell'aggiunta di un elemento alla dispensa:", error);
            throw error;
        }
    },
    async deletePantryItem(id: number): Promise<void> {
        try {
            await axios.delete(`${API_BASE_URL}/pantry/${id}`);
        } catch (error) {
            console.error("Errore durante l'eliminazione di un elemento della dispensa:", error);
            throw error;
        }
    },
}