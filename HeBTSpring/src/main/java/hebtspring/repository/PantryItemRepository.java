package hebtspring.repository;

import hebtspring.model.Ingredient;
import hebtspring.model.PantryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PantryItemRepository extends JpaRepository<PantryItem, Long> {

    // Trova tutti i lotti di un ingrediente ordinati per scadenza (dal più vicino a scadere in poi)
    List<PantryItem> findByIngredientOrderByExpirationDateAsc(Ingredient ingredient);
}