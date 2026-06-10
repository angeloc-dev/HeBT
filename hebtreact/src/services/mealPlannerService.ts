import type {MealPlan} from "@/model/data-model.ts";
import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

export const mealPlannerService = {
    async getAllMealPlannerBetweenDates(startDate: Date, endDate: Date): Promise<MealPlan[]> {
        try {
            const params = {
                startDate: startDate,
                endDate: endDate,
            };
            const response = await axios.get(`${API_BASE_URL}/meal-plans`,
                { params });
            return response.data();
        } catch (error) {
            console.log(error);
            return [];
        }

    },
};