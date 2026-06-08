package com.example.hebtspring.dto;

import java.math.BigDecimal;

public record RecipeIngredientDTO(
        Long ingredientId,
        String ingredientName,
        BigDecimal amount,
        String unit,
        String section
) {}