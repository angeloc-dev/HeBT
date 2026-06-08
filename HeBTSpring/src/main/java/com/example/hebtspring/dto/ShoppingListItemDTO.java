package com.example.hebtspring.dto;

import java.math.BigDecimal;

public record ShoppingListItemDTO(
        Long id,
        Long ingredientId,
        String ingredientName,
        String category, // Comodo per raggruppare la lista per reparti del supermercato
        BigDecimal amount,
        String unit,
        Boolean isPurchased
) {}