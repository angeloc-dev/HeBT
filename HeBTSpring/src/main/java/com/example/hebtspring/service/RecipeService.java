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

import java.util.ArrayList;
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
                recipe.getImageUrl(),
                ingredientDTOs
        );
    }

    public RecipeDTO getRecipeById(Long id) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recipe not found."));
        return mapToDTO(recipe);
    }

    public List<RecipeDTO> getAllRecipes() {
        List<Recipe> recipes = recipeRepository.findAll();
        List<RecipeDTO> recipeDTOS = new ArrayList<>();
        for (Recipe recipe : recipes) {
            recipeDTOS.add(mapToDTO(recipe));
        }
        return  recipeDTOS;
    }

    public RecipeDTO createRecipe(RecipeDTO recipeDTO) {
        if (recipeDTO == null){
            throw new IllegalArgumentException("RecipeDTO is null.");
        }
        Recipe newRecipe = Recipe.builder()
                .title(recipeDTO.title())
                .description(recipeDTO.description())
                .instructions(recipeDTO.instructions())
                .imageUrl(recipeDTO.image())
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

    public RecipeDTO updateRecipe(Long id, RecipeDTO recipeDTO) {
        Recipe existingRecipe = recipeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Ricetta non trovata: " + id));
        existingRecipe.setTitle(recipeDTO.title());
        existingRecipe.setDescription(recipeDTO.description());
        existingRecipe.setInstructions(recipeDTO.instructions());
        existingRecipe.setImageUrl(recipeDTO.image());
        existingRecipe.getIngredients().clear();

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
                        .recipe(existingRecipe)
                        .ingredient(ingredient)
                        .amount(riDTO.amount())
                        .unit(riDTO.unit())
                        .section(riDTO.section())
                        .build();

                existingRecipe.getIngredients().add(recipeIngredient);
            }
        }
        Recipe savedRecipe = recipeRepository.save(existingRecipe);
        return mapToDTO(savedRecipe);
    }

    public void deleteRecipe(Long id) {
        if (!recipeRepository.existsById(id)) {
            throw new IllegalArgumentException("Ricetta non trovata: " + id);
        }
        recipeRepository.deleteById(id);
    }
}