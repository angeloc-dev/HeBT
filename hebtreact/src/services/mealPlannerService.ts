import type { MealPlan } from "@/model/data-model.ts";
import axios from "axios";
import { API_BASE_URL, formatDateLocal } from "@/model/constants.ts";

export const mealPlannerService = {
    async getAllMealPlannerBetweenDates(startDate: Date, endDate: Date): Promise<MealPlan[]> {
        try {
            const params = {
                startDate: formatDateLocal(startDate),
                endDate: formatDateLocal(endDate),
            };
            const response = await axios.get(`${API_BASE_URL}/meal-plans`, { params });
            return response.data;
        } catch (error) {
            console.error("Errore nel reperimento dei piatti programmati:", error);
            throw error;
        }
    },
    async scheduleMeal(mealPlan: Omit<MealPlan, 'id'>): Promise<MealPlan> {
        try {
            const response = await axios.post(`${API_BASE_URL}/meal-plans`, mealPlan);
            return response.data;
        } catch (error) {
            console.error("Errore nel programmare un piatto:", error);
            throw error;
        }
    },
    async updateMealPlan(id: number, mealPlan: MealPlan): Promise<MealPlan> {
        try {
            const response = await axios.put(`${API_BASE_URL}/meal-plans/${id}`, mealPlan);
            return response.data;
        } catch (error) {
            console.error("Errore nell'aggiornare un piatto programmato:", error);
            throw error;
        }
    },
    async confirmMealCooked(id: number, guests: number): Promise<void> {
        try {
            await axios.post(`${API_BASE_URL}/meal-plans/${id}/cook`, { guests });
        } catch (error) {
            console.error("Errore nel confermare la cottura di un piatto:", error);
            throw error;
        }
    },
    async deleteMealPlanner(id: number): Promise<void> {
        try {
            await axios.delete(`${API_BASE_URL}/meal-plans/${id}`);
        } catch (error) {
            console.error("Errore durante l'eliminazione di un piatto:", error);
            throw error;
        }
    }
};