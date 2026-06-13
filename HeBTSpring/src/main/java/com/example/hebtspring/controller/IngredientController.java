package com.example.hebtspring.controller;

import com.example.hebtspring.dto.IngredientDTO;
import com.example.hebtspring.service.IngredientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/ingredients")
@CrossOrigin(
        originPatterns = {"http://localhost:5173", "http://192.168.1.*:5173"},
        allowCredentials = "true"
)
public class IngredientController {
    private final IngredientService ingredientService;

    @GetMapping("/search")
    public ResponseEntity<List<IngredientDTO>> searchIngredients(@RequestParam("q") String testo) {
        List<IngredientDTO> ingredientsDTO = ingredientService.searchIngredients(testo);
        return ResponseEntity.ok(ingredientsDTO);
    }

    @PostMapping
    public ResponseEntity<IngredientDTO> addIngredient(@RequestBody IngredientDTO ingredientDTO) {
        IngredientDTO savedIngredient = ingredientService.createIngredient(ingredientDTO.name(), ingredientDTO.category());
        return ResponseEntity.status(HttpStatus.CREATED).body(savedIngredient);
    }
}
