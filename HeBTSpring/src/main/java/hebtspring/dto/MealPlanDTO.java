package hebtspring.dto;

import java.time.LocalDate;

public record MealPlanDTO(
        Long id,
        Long recipeId,
        String recipeTitle,
        LocalDate plannedDate,
        String mealType,
        Integer servings
) {}