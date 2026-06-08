package hebtspring.service;

import hebtspring.dto.MealPlanDTO;
import hebtspring.dto.ShoppingListItemDTO;
import hebtspring.model.*;
import hebtspring.repository.MealPlanRepository;
import hebtspring.repository.RecipeRepository;
import hebtspring.repository.ShoppingListItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class MealPlannerService {

    private final MealPlanRepository mealPlanRepository;
    private final RecipeRepository recipeRepository;
    private final ShoppingListItemRepository shoppingListItemRepository;
    private final PantryService pantryService;

    private MealPlanDTO mapToDTO(MealPlan mealPlan) {
        return new MealPlanDTO(mealPlan.getId(), mealPlan.getRecipe().getId(), mealPlan.getRecipe().getTitle(),mealPlan.getPlannedDate(),
                mealPlan.getMealType(),mealPlan.getServings());
    }

    public MealPlanDTO scheduleMeal(MealPlanDTO mealPlanDTO) {
        if (mealPlanDTO == null) {
            throw new IllegalArgumentException("Meal Plan DTO is null");
        }

        Recipe recipe = recipeRepository.findById(mealPlanDTO.recipeId())
                .orElseThrow(() -> new IllegalArgumentException("Recipe not found"));

        // Cerca se esiste già un pasto identico
        Optional<MealPlan> existingPlan = mealPlanRepository.findByPlannedDateAndMealTypeAndRecipe(
                mealPlanDTO.plannedDate(), mealPlanDTO.mealType(), recipe
        );

        if (existingPlan.isPresent()) {
            throw new IllegalArgumentException("Meal plan already exists!");
        }

        MealPlan newMealPlan = MealPlan.builder()
                .recipe(recipe)
                .plannedDate(mealPlanDTO.plannedDate())
                .mealType(mealPlanDTO.mealType())
                .servings(mealPlanDTO.servings())
                .build();

        MealPlan saved = mealPlanRepository.save(newMealPlan);
        return mapToDTO(saved);
    }

    public List<MealPlanDTO> getMealsBetweenDates(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException("Start Date and End Date are null");
        }
        List<MealPlan> mealPlans = mealPlanRepository.findByPlannedDateBetween(startDate, endDate);
        return mealPlans.stream().map(this::mapToDTO).toList();
    }

    public List<ShoppingListItemDTO> generateShoppingList(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException("Start Date and End Date are null");
        }

        List<MealPlan> mealPlans = mealPlanRepository.findByPlannedDateBetween(startDate, endDate);
        Map<Ingredient, BigDecimal> totalNeeds = new HashMap<>();
        Map<Ingredient, String> units = new HashMap<>();

        for (MealPlan plan : mealPlans) {
            BigDecimal servings = new BigDecimal(plan.getServings());

            for (RecipeIngredient ri : plan.getRecipe().getIngredients()) {
                Ingredient ing = ri.getIngredient();
                BigDecimal amountForThisMeal = ri.getAmount().multiply(servings);
                BigDecimal currentTotal = totalNeeds.getOrDefault(ing, BigDecimal.ZERO);
                totalNeeds.put(ing, currentTotal.add(amountForThisMeal));
                units.putIfAbsent(ing, ri.getUnit());
            }
        }

        List<ShoppingListItem> itemsToSave = new ArrayList<>();

        for (Map.Entry<Ingredient, BigDecimal> entry : totalNeeds.entrySet()) {
            Ingredient ingredient = entry.getKey();
            BigDecimal totalNeededAmount = entry.getValue();
            BigDecimal availableInPantry = pantryService.getAvailableAmountValidForDate(ingredient.getId(), startDate);

            BigDecimal amountToBuy = totalNeededAmount.subtract(availableInPantry);
            if (amountToBuy.compareTo(BigDecimal.ZERO) > 0) {
                ShoppingListItem item = ShoppingListItem.builder()
                        .ingredient(ingredient)
                        .amount(amountToBuy)
                        .unit(units.get(ingredient))
                        .isPurchased(false)
                        .build();
                itemsToSave.add(item);
            }
        }

        List<ShoppingListItem> savedItems = shoppingListItemRepository.saveAll(itemsToSave);

        return savedItems.stream().map(item -> new ShoppingListItemDTO(
                item.getId(),
                item.getIngredient().getId(),
                item.getIngredient().getName(),
                item.getIngredient().getCategory(),
                item.getAmount(),
                item.getUnit(),
                item.getIsPurchased()
        )).toList();
    }

    public void confirmMealCooked(Long mealPlanId) {
        MealPlan mealPlan = mealPlanRepository.findById(mealPlanId)
                .orElseThrow(() -> new IllegalArgumentException("Meal Plan not found."));

        BigDecimal servings = new BigDecimal(mealPlan.getServings());

        for (RecipeIngredient ri : mealPlan.getRecipe().getIngredients()) {
            BigDecimal totalAmountUsed = ri.getAmount().multiply(servings);
            pantryService.consumeIngredientFifo(ri.getIngredient().getId(), totalAmountUsed);
        }

        mealPlanRepository.delete(mealPlan);
    }
}