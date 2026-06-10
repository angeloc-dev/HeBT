package com.example.hebtspring.service;

import com.example.hebtspring.dto.IngredientDTO;
import com.example.hebtspring.model.Ingredient;
import com.example.hebtspring.repository.IngredientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class IngredientService {

    private final IngredientRepository ingredientRepository;

    // Metodo per mappare Entity -> DTO
    private IngredientDTO mapToDTO(Ingredient ingredient) {
        return new IngredientDTO(ingredient.getId(), ingredient.getName(), ingredient.getCategory());
    }

    // Ricerca per l'autocompletamento lato React
    public List<IngredientDTO> searchIngredients(String query) {
        return ingredientRepository.findByNameContainingIgnoreCase(query)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    // Inserimento con controllo doppioni
    public IngredientDTO createIngredient(String name, String category) {
        Optional<Ingredient> existing = ingredientRepository.findByNameIgnoreCase(name);
        if (existing.isPresent()) {
            return mapToDTO(existing.get()); // Se esiste già, restituisco quello vecchio
        }

        Ingredient newIngredient = Ingredient.builder()
                .name(name)
                .category(category)
                .build();

        Ingredient saved = ingredientRepository.save(newIngredient);
        return mapToDTO(saved);
    }

    public void deleteIngredient(Long id) {
        if (!ingredientRepository.existsById(id)) {
            throw new IllegalArgumentException("Ingrediente non trovato: " + id);
        }
        ingredientRepository.deleteById(id);
    }
}