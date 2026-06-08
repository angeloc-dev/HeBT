package com.example.hebtspring.controller;

import com.example.hebtspring.dto.PantryItemDTO;
import com.example.hebtspring.service.PantryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/pantry")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class PantryController {
    private final PantryService pantryService;

    @GetMapping
    public ResponseEntity<List<PantryItemDTO>> getPantry() {
        List<PantryItemDTO> pantryItemsDTO = pantryService.checkPantryInventory();
        return ResponseEntity.ok(pantryItemsDTO);
    }

    @PostMapping
    public ResponseEntity<PantryItemDTO> addPantryItem(@RequestBody PantryItemDTO pantryItemDTO) {
        PantryItemDTO savedPantryItem = pantryService.addPantryItem(pantryItemDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPantryItem);
    }
}
