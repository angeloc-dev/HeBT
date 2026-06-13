package com.example.hebtspring.controller;

import com.example.hebtspring.dto.PantryItemDTO;
import com.example.hebtspring.dto.ShoppingListItemDTO;
import com.example.hebtspring.service.ShoppingListService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/shopping-list")
@CrossOrigin(
        originPatterns = {"http://localhost:5173", "http://192.168.1.*:5173"},
        allowCredentials = "true"
)
public class ShoppingListController {
    private final ShoppingListService shoppingListService;

    @GetMapping
    public ResponseEntity<List<ShoppingListItemDTO>> getActiveShoppingList() {
        return ResponseEntity.ok(shoppingListService.getActiveShoppingList());
    }

    @PostMapping("/generate")
    public ResponseEntity<List<ShoppingListItemDTO>> generateShoppingList(@RequestBody List<Long> mealPlanIds) {
        List<ShoppingListItemDTO> newShoppingListItems = shoppingListService.generateShoppingList(mealPlanIds);
        return ResponseEntity.ok(newShoppingListItems);
    }

    @PostMapping
    public ResponseEntity<ShoppingListItemDTO> addManualItem(@RequestBody ShoppingListItemDTO dto) {
        return ResponseEntity.ok(shoppingListService.addManualItem(dto));
    }

    @PutMapping("/{id}/amount")
    public ResponseEntity<ShoppingListItemDTO> updateItemAmount(
            @PathVariable Long id,
            @RequestParam("newAmount") BigDecimal newAmount) {
        return ResponseEntity.ok(shoppingListService.updateItemAmount(id, newAmount));
    }

    public record PurchaseRequestDTO(LocalDate expirationDate) {}

    @PostMapping("/{id}/purchase")
    public ResponseEntity<PantryItemDTO> purchaseShoppingListItem(
            @PathVariable("id") Long id,
            @RequestBody(required = false) PurchaseRequestDTO request) {
        LocalDate expiration = (request != null) ? request.expirationDate() : null;
        PantryItemDTO pantryItemDTO = shoppingListService.purchaseShoppingListItem(id, expiration);
        return ResponseEntity.ok(pantryItemDTO);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteShoppingListItem(@PathVariable Long id) {
        shoppingListService.deleteShoppingListItem(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearShoppingList() {
        shoppingListService.clearList();
        return ResponseEntity.noContent().build();
    }
}