package hebtspring.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PantryItemDTO(
        Long id,
        Long ingredientId,
        String ingredientName,
        BigDecimal currentAmount,
        String unit,
        LocalDate expirationDate,
        LocalDate purchaseDate
) {}