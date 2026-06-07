package hebtspring.dto;

import java.util.List;

public record RecipeDTO(
        Long id,
        String title,
        String description,
        String instructions,
        List<RecipeIngredientDTO> ingredients
) {}