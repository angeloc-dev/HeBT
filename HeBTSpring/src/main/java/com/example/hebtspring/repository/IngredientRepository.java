package com.example.hebtspring.repository;

import com.example.hebtspring.model.Ingredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IngredientRepository extends JpaRepository<Ingredient, Long> {

    // Per autocompletamento: cerca ingredienti che contengono la stringa (ignorando maiuscole/minuscole)
    List<Ingredient> findByNameContainingIgnoreCase(String name);

    // Per evitare doppioni: cerca l'ingrediente esatto
    Optional<Ingredient> findByNameIgnoreCase(String name);
}