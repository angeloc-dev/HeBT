package com.example.hebtspring.controller;

import com.example.hebtspring.dto.RecipeDTO;
import com.example.hebtspring.service.RecipeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/recipes")
@CrossOrigin(
        originPatterns = {"http://localhost:5173", "http://192.168.1.*:5173"},
        allowCredentials = "true"
)
public class RecipeController {
    private final RecipeService recipeService;

    @GetMapping
    public ResponseEntity<List<RecipeDTO>> allRecipe() {
        List<RecipeDTO> recipesDTO = recipeService.getAllRecipes();
        return ResponseEntity.ok(recipesDTO);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecipeDTO> recipe(@PathVariable("id") Long id) {
        RecipeDTO recipeDTO = recipeService.getRecipeById(id);
        return ResponseEntity.ok(recipeDTO);
    }

    @GetMapping("/cookable")
    public ResponseEntity<List<RecipeDTO>> getCookableRecipes() {
        return ResponseEntity.ok(recipeService.getCookableRecipes());
    }

    @PostMapping
    public ResponseEntity<RecipeDTO> createRecipe(@RequestBody RecipeDTO recipeDTO) {
        RecipeDTO savedRecipe = recipeService.createRecipe(recipeDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedRecipe);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RecipeDTO> editRecipe(@PathVariable("id") Long id, @RequestBody RecipeDTO recipeDTO) {
        RecipeDTO updatedRecipe = recipeService.updateRecipe(id, recipeDTO);
        return ResponseEntity.ok(updatedRecipe);
    }

    @PostMapping("/{id}/cook")
    public ResponseEntity<Void> cookRecipe(
            @PathVariable("id") Long id,
            @RequestBody(required = false) Map<String, Integer> payload) {
        Integer guests = (payload != null && payload.containsKey("guests")) ? payload.get("guests") : null;
        recipeService.cookRecipeFree(id, guests);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecipe(@PathVariable("id") Long id) {
        recipeService.deleteRecipe(id);
        return ResponseEntity.noContent().build();
    }
}
