package hebtspring.service;

import hebtspring.dto.RecipeDTO;
import hebtspring.dto.RecipeIngredientDTO;
import hebtspring.model.Recipe;
import hebtspring.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RecipeService {

    private final RecipeRepository recipeRepository;

    // Converte l'intera Ricetta in DTO
    public RecipeDTO getRecipeById(Long id) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ricetta non trovata"));

        List<RecipeIngredientDTO> ingredientDTOs = recipe.getIngredients().stream()
                .map(ri -> new RecipeIngredientDTO(
                        ri.getIngredient().getId(),
                        ri.getIngredient().getName(),
                        ri.getAmount(),
                        ri.getUnit(),
                        ri.getSection()
                ))
                .toList();

        return new RecipeDTO(
                recipe.getId(),
                recipe.getTitle(),
                recipe.getDescription(),
                recipe.getInstructions(),
                ingredientDTOs
        );
    }

    /**
     * CASO D'USO 1: Inserimento Piatto
     * Riceve un DTO dal frontend.
     * 1. Salva la Recipe (Titolo, Istruzioni).
     * 2. Cicla sugli ingredienti del DTO.
     * 3. Se l'ingrediente non ha un ID, chiama IngredientService.createIngredient().
     * 4. Salva le relazioni in RecipeIngredient (dosi e unità di misura).
     */
    public RecipeDTO createRecipe(RecipeDTO recipeDTO) {
        // @todo
        return null;
    }
}