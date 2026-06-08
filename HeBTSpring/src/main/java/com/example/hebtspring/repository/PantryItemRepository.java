package com.example.hebtspring.repository;

import com.example.hebtspring.model.Ingredient;
import com.example.hebtspring.model.PantryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface PantryItemRepository extends JpaRepository<PantryItem, Long> {

    // Trova tutti i lotti di un ingrediente ordinati per scadenza (dal più vicino a scadere in poi)
    List<PantryItem> findByIngredientOrderByExpirationDateAsc(Ingredient ingredient);

    // Per checkPantryInventory (Tutti i lotti > 0 ordinati per scadenza)
    List<PantryItem> findByCurrentAmountGreaterThanOrderByExpirationDateAsc(BigDecimal amount);

    // Per getAvailableAmountValidForDate (Lotti non scaduti rispetto alla data del pasto)
    List<PantryItem> findByIngredientIdAndExpirationDateGreaterThanEqual(Long ingredientId, LocalDate date);

    // Per consumeIngredientFifo (Lotti disponibili ordinati per scadenza)
    List<PantryItem> findByIngredientIdAndCurrentAmountGreaterThanOrderByExpirationDateAsc(Long ingredientId, BigDecimal amount);
}