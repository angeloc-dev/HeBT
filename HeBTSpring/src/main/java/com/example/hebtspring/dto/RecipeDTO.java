package com.example.hebtspring.dto;

import java.util.List;

public record RecipeDTO(
        Long id,
        String title,
        String description,
        String instructions,
        String image,
        List<RecipeIngredientDTO> ingredients,
        Boolean isInMealPlan
) {}