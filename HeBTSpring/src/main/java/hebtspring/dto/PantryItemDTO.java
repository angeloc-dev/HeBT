package hebtspring.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PantryItemDTO(
        Long id,
        Long ingredientId,
        String ingredientName,
        String category,
        BigDecimal currentAmount,
        String unit,
        LocalDate expirationDate,
        LocalDate purchaseDate
) {}