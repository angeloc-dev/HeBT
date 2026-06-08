package com.example.hebtspring.controller;

import com.example.hebtspring.dto.RecipeDTO;
import com.example.hebtspring.service.RecipeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/recipes")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class RecipeController {
    private final RecipeService recipeService;

    @GetMapping("/{id}")
    public ResponseEntity<RecipeDTO> recipe(@PathVariable("id") Long id) {
        RecipeDTO recipeDTO = recipeService.getRecipeById(id);
        return ResponseEntity.ok(recipeDTO);
    }

    @PostMapping
    public ResponseEntity<RecipeDTO> createRecipe(@RequestBody RecipeDTO recipeDTO) {
        RecipeDTO savedRecipe = recipeService.createRecipe(recipeDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedRecipe);
    }
}
