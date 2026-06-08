package hebtspring.controller;

import hebtspring.dto.PantryItemDTO;
import hebtspring.dto.ShoppingListItemDTO;
import hebtspring.service.MealPlannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/shopping-list")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class ShoppingListController {
    private final MealPlannerService mealPlannerService;

    @PostMapping("/generate")
    public ResponseEntity<List<ShoppingListItemDTO>> generateShoppingList(@RequestParam("startDate") LocalDate startDate,
                                                                          @RequestParam("endDate") LocalDate endDate) {
        List<ShoppingListItemDTO> newShoppingListItems = mealPlannerService.generateShoppingList(startDate, endDate);
        return ResponseEntity.ok(newShoppingListItems);
    }

    public record PurchaseRequestDTO(LocalDate expirationDate) {}

    @PostMapping("/{id}/purchase")
    public ResponseEntity<PantryItemDTO> purchaseShoppingListItem(@PathVariable("id") Long id,
                                                                  @RequestBody PurchaseRequestDTO request) {
        PantryItemDTO pantryItemDTO = mealPlannerService.purchaseShoppingListItem(id, request.expirationDate());
        return ResponseEntity.ok(pantryItemDTO);
    }
}
