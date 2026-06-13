import type { PantryItem, ShoppingListItem } from "@/model/data-model.ts";
import axios from "axios";
import {API_BASE_URL, formatDateLocal} from "@/model/constants.ts";

export const shoppingListService = {
    async getActiveShoppingList(signal?: AbortSignal): Promise<ShoppingListItem[]> {
        try {
            const response = await axios.get(`${API_BASE_URL}/shopping-list`, {signal});
            return response.data;
        } catch (error) {
            console.error("Errore nel reperire la lista della spesa:", error);
            throw error;
        }
    },
    async generateShoppingList(mealPlanIds: number[]): Promise<ShoppingListItem[]> {
        try {
            const response = await axios.post(`${API_BASE_URL}/shopping-list/generate`, mealPlanIds);
            return response.data;
        } catch (error) {
            console.error("Errore nel generare la lista della spesa:", error);
            throw error;
        }
    },
    async addManualItem(item: Omit<ShoppingListItem, 'id' | 'isPurchased'>): Promise<ShoppingListItem> {
        try {
            const response = await axios.post(`${API_BASE_URL}/shopping-list`, item);
            return response.data;
        } catch (error) {
            console.error("Errore nell'aggiungere un elemento manuale:", error);
            throw error;
        }
    },
    async updateItemAmount(id: number, newAmount: number): Promise<ShoppingListItem> {
        try {
            const params = { newAmount };
            const response = await axios.put(`${API_BASE_URL}/shopping-list/${id}/amount`, null, { params });
            return response.data;
        } catch (error) {
            console.error("Errore nella modifica della quantità:", error);
            throw error;
        }
    },
    async purchaseShoppingListItem(id: number, expirationDate?: Date): Promise<PantryItem> {
        try {
            const payload = expirationDate ? { expirationDate: formatDateLocal(expirationDate) } : {};
            const response = await axios.post(`${API_BASE_URL}/shopping-list/${id}/purchase`, payload);
            return response.data;
        } catch (error) {
            console.error("Errore nel spuntare un elemento della lista della spesa:", error);
            throw error;
        }
    },
    async deleteShoppingListItem(id: number): Promise<void> {
        try {
            await axios.delete(`${API_BASE_URL}/shopping-list/${id}`);
        } catch (error) {
            console.error("Errore nell'eliminare la voce dalla spesa:", error);
            throw error;
        }
    },
    async clearShoppingList(): Promise<void> {
        try {
            await axios.delete(`${API_BASE_URL}/shopping-list/clear`);
        } catch (error) {
            console.error("Errore nello svuotare la lista della spesa:", error);
            throw error;
        }
    }
};