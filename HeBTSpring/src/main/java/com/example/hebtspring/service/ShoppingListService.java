package com.example.hebtspring.service;

import com.example.hebtspring.dto.PantryItemDTO;
import com.example.hebtspring.dto.ShoppingListItemDTO;
import com.example.hebtspring.model.Ingredient;
import com.example.hebtspring.model.MealPlan;
import com.example.hebtspring.model.RecipeIngredient;
import com.example.hebtspring.model.ShoppingListItem;
import com.example.hebtspring.repository.IngredientRepository;
import com.example.hebtspring.repository.MealPlanRepository;
import com.example.hebtspring.repository.ShoppingListItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ShoppingListService {
    private final ShoppingListItemRepository shoppingListItemRepository;
    private final MealPlanRepository mealPlanRepository;
    private final IngredientRepository ingredientRepository;
    private final PantryService pantryService;
    private final UnitConversionService unitConversionService;

    public List<ShoppingListItemDTO> getActiveShoppingList() {
        return shoppingListItemRepository.findByIsPurchasedFalse().stream()
                .map(this::mapToDTO).toList();
    }

    @Transactional
    public List<ShoppingListItemDTO> generateShoppingList(List<Long> mealPlanIds) {
        if (mealPlanIds == null || mealPlanIds.isEmpty()) {
            throw new IllegalArgumentException("No meal selected for the shopping.");
        }
        List<MealPlan> selectedMeals = mealPlanRepository.findAllById(mealPlanIds);
        Map<Ingredient, UnitConversionService.BaseQuantity> totalNeeds = new HashMap<>();
        for (MealPlan plan : selectedMeals) {
            BigDecimal servings = new BigDecimal(plan.getServings());
            for (RecipeIngredient ri : plan.getRecipe().getIngredients()) {
                Ingredient ing = ri.getIngredient();
                BigDecimal rawAmount = ri.getAmount().multiply(servings);
                UnitConversionService.BaseQuantity baseQty = unitConversionService.convertToBase(
                        rawAmount, ri.getUnit(), ing.getName()
                );
                totalNeeds.merge(ing, baseQty, (oldQty, newQty) ->
                        new UnitConversionService.BaseQuantity(oldQty.amount().add(newQty.amount()), oldQty.baseUnit())
                );
            }
        }
        for (Map.Entry<Ingredient, UnitConversionService.BaseQuantity> entry : totalNeeds.entrySet()) {
            Ingredient ingredient = entry.getKey();
            BigDecimal totalNeededBase = entry.getValue().amount();
            String baseUnit = entry.getValue().baseUnit();
            BigDecimal availableInPantry = pantryService.getAvailableAmountValidForDate(ingredient.getId(), LocalDate.now());
            BigDecimal amountToBuy = totalNeededBase.subtract(availableInPantry);
            if (amountToBuy.compareTo(BigDecimal.ZERO) > 0) {
                Optional<ShoppingListItem> existingItemOpt = shoppingListItemRepository
                        .findByIngredientIdAndIsPurchasedFalse(ingredient.getId());
                if (existingItemOpt.isPresent()) {
                    ShoppingListItem existingItem = existingItemOpt.get();
                    existingItem.setAmount(existingItem.getAmount().add(amountToBuy));
                    shoppingListItemRepository.save(existingItem);
                } else {
                    ShoppingListItem newItem = ShoppingListItem.builder()
                            .ingredient(ingredient)
                            .amount(amountToBuy)
                            .unit(baseUnit)
                            .isPurchased(false)
                            .build();
                    shoppingListItemRepository.save(newItem);
                }
            }
        }
        return getActiveShoppingList();
    }

    @Transactional
    public ShoppingListItemDTO addManualItem(ShoppingListItemDTO dto) {
        Ingredient ingredient;
        if (dto.ingredientId() != null) {
            ingredient = ingredientRepository.findById(dto.ingredientId())
                    .orElseThrow(() -> new IllegalArgumentException("Ingrediente non trovato"));
        } else {
            ingredient = ingredientRepository.findByNameIgnoreCase(dto.ingredientName())
                    .orElseGet(() -> ingredientRepository.save(Ingredient.builder()
                            .name(dto.ingredientName())
                            .category(dto.category() != null ? dto.category() : "Altro")
                            .build()));
        }
        Optional<ShoppingListItem> existing = shoppingListItemRepository.findByIngredientIdAndIsPurchasedFalse(ingredient.getId());
        ShoppingListItem item;
        if (existing.isPresent()) {
            item = existing.get();
            item.setAmount(item.getAmount().add(dto.amount()));
        } else {
            item = ShoppingListItem.builder()
                    .ingredient(ingredient)
                    .amount(dto.amount())
                    .unit(dto.unit())
                    .isPurchased(false)
                    .build();
        }

        return mapToDTO(shoppingListItemRepository.save(item));
    }

    @Transactional
    public ShoppingListItemDTO updateItemAmount(Long id, BigDecimal newAmount) {
        ShoppingListItem item = shoppingListItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Elemento non trovato"));
        item.setAmount(newAmount);
        return mapToDTO(shoppingListItemRepository.save(item));
    }

    @Transactional
    public PantryItemDTO purchaseShoppingListItem(Long id, LocalDate expirationDate) {
        ShoppingListItem listItem = shoppingListItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Shopping List Item not found"));
        if (Boolean.TRUE.equals(listItem.getIsPurchased())) {
            throw new IllegalStateException("Questo elemento è già stato acquistato!");
        }
        PantryItemDTO newPantryItemDTO = new PantryItemDTO(
                null,
                listItem.getIngredient().getId(),
                listItem.getIngredient().getName(),
                listItem.getIngredient().getCategory(),
                listItem.getAmount(),
                listItem.getUnit(),
                expirationDate != null ? expirationDate : LocalDate.now().plusDays(7),
                LocalDate.now()
        );
        PantryItemDTO savedPantryItem = pantryService.addPantryItem(newPantryItemDTO);
        listItem.setIsPurchased(true);
        shoppingListItemRepository.save(listItem);
        return savedPantryItem;
    }

    @Transactional
    public void deleteShoppingListItem(Long id) {
        shoppingListItemRepository.deleteById(id);
    }

    @Transactional
    public void clearList() {
        List<ShoppingListItem> activeItems = shoppingListItemRepository.findByIsPurchasedFalse();
        shoppingListItemRepository.deleteAll(activeItems);
    }

    private ShoppingListItemDTO mapToDTO(ShoppingListItem item) {
        return new ShoppingListItemDTO(
                item.getId(),
                item.getIngredient().getId(),
                item.getIngredient().getName(),
                item.getIngredient().getCategory(),
                item.getAmount(),
                item.getUnit(),
                item.getIsPurchased()
        );
    }
}