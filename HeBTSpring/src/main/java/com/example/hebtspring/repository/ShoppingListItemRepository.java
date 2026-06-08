package com.example.hebtspring.repository;

import com.example.hebtspring.model.ShoppingListItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShoppingListItemRepository extends JpaRepository<ShoppingListItem, Long> {

    // Trova solo gli elementi della spesa non ancora spuntati
    List<ShoppingListItem> findByIsPurchasedFalse();
}