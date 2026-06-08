package com.example.hebtspring.service;

import com.example.hebtspring.dto.RecipeDTO;
import com.example.hebtspring.dto.RecipeIngredientDTO;
import com.example.hebtspring.model.Ingredient;
import com.example.hebtspring.model.Recipe;
import com.example.hebtspring.model.RecipeIngredient;
import com.example.hebtspring.repository.IngredientRepository;
import com.example.hebtspring.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final IngredientRepository ingredientRepository;

    private RecipeDTO mapToDTO(Recipe recipe) {
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

    public RecipeDTO getRecipeById(Long id) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recipe not found."));
        return mapToDTO(recipe);
    }

    public RecipeDTO createRecipe(RecipeDTO recipeDTO) {
        if (recipeDTO == null){
            throw new IllegalArgumentException("RecipeDTO is null.");
        }

        Recipe newRecipe = Recipe.builder()
                .title(recipeDTO.title())
                .description(recipeDTO.description())
                .instructions(recipeDTO.instructions())
                .build();

        if (recipeDTO.ingredients() != null) {
            for (RecipeIngredientDTO riDTO : recipeDTO.ingredients()) {

                Ingredient ingredient;

                if (riDTO.ingredientId() != null) {
                    ingredient = ingredientRepository.findById(riDTO.ingredientId())
                            .orElseThrow(() -> new IllegalArgumentException("Ingredient not found: " + riDTO.ingredientId()));
                } else {
                    ingredient = ingredientRepository.findByNameIgnoreCase(riDTO.ingredientName())
                            .orElseGet(() -> {
                                Ingredient newIng = Ingredient.builder()
                                        .name(riDTO.ingredientName())
                                        .category("todo")
                                        .build();
                                return ingredientRepository.save(newIng);
                            });
                }

                RecipeIngredient recipeIngredient = RecipeIngredient.builder()
                        .recipe(newRecipe)
                        .ingredient(ingredient)
                        .amount(riDTO.amount())
                        .unit(riDTO.unit())
                        .section(riDTO.section())
                        .build();

                newRecipe.getIngredients().add(recipeIngredient);
            }
        }

        Recipe savedRecipe = recipeRepository.save(newRecipe);

        return mapToDTO(savedRecipe);
    }
}