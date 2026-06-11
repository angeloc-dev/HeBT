package com.example.hebtspring.service;

import com.example.hebtspring.dto.MealPlanDTO;
import com.example.hebtspring.model.MealPlan;
import com.example.hebtspring.model.Recipe;
import com.example.hebtspring.model.RecipeIngredient;
import com.example.hebtspring.repository.MealPlanRepository;
import com.example.hebtspring.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MealPlanService {
    private final MealPlanRepository mealPlanRepository;
    private final RecipeRepository recipeRepository;
    private final PantryService pantryService;
    private final UnitConversionService unitConversionService;

    private MealPlanDTO mapToDTO(MealPlan mealPlan) {
        return new MealPlanDTO(
                mealPlan.getId(),
                mealPlan.getRecipe().getId(),
                mealPlan.getRecipe().getTitle(),
                mealPlan.getPlannedDate(),
                mealPlan.getMealType(),
                mealPlan.getServings()
        );
    }

    public List<MealPlanDTO> getMealsBetweenDates(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException("Start Date and End Date are null");
        }
        return mealPlanRepository.findByPlannedDateBetween(startDate, endDate)
                .stream().map(this::mapToDTO).toList();
    }

    @Transactional
    public MealPlanDTO scheduleMeal(MealPlanDTO mealPlanDTO) {
        Recipe recipe = recipeRepository.findById(mealPlanDTO.recipeId())
                .orElseThrow(() -> new IllegalArgumentException("Recipe not found"));
        Optional<MealPlan> existingPlan = mealPlanRepository.findByPlannedDateAndMealTypeAndRecipe(
                mealPlanDTO.plannedDate(), mealPlanDTO.mealType(), recipe
        );
        if (existingPlan.isPresent()) {
            throw new IllegalArgumentException("Meal plan already exists for this slot!");
        }
        MealPlan newMealPlan = MealPlan.builder()
                .recipe(recipe)
                .plannedDate(mealPlanDTO.plannedDate())
                .mealType(mealPlanDTO.mealType())
                .servings(mealPlanDTO.servings())
                .build();
        return mapToDTO(mealPlanRepository.save(newMealPlan));
    }

    public MealPlanDTO updateMealPlan(Long id, MealPlanDTO dto) {
        MealPlan plan = mealPlanRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Meal Plan not found"));
        if (!plan.getRecipe().getId().equals(dto.recipeId())) {
            Recipe newRecipe = recipeRepository.findById(dto.recipeId())
                    .orElseThrow(() -> new IllegalArgumentException("Recipe not found"));
            plan.setRecipe(newRecipe);
        }
        plan.setPlannedDate(dto.plannedDate());
        plan.setMealType(dto.mealType());
        plan.setServings(dto.servings());

        return mapToDTO(mealPlanRepository.save(plan));
    }

    @Transactional
    public void confirmMealCooked(Long mealPlanId) {
        MealPlan mealPlan = mealPlanRepository.findById(mealPlanId)
                .orElseThrow(() -> new IllegalArgumentException("Meal Plan not found."));
        BigDecimal servings = new BigDecimal(mealPlan.getServings());
        for (RecipeIngredient ri : mealPlan.getRecipe().getIngredients()) {
            BigDecimal rawTotalNeeded = ri.getAmount().multiply(servings);
            UnitConversionService.BaseQuantity baseQty = unitConversionService.convertToBase(
                    rawTotalNeeded, ri.getUnit(), ri.getIngredient().getName()
            );
            pantryService.consumeIngredientFifo(ri.getIngredient().getId(), baseQty.amount());
        }
        mealPlanRepository.delete(mealPlan);
    }

    @Transactional
    public void deleteMealPlanner(Long id) {
        mealPlanRepository.deleteById(id);
    }
}