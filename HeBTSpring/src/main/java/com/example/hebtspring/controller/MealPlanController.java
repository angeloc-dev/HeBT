package com.example.hebtspring.controller;

import com.example.hebtspring.dto.MealPlanDTO;
import com.example.hebtspring.service.MealPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/meal-plans")
@CrossOrigin(
        originPatterns = {"http://localhost:5173", "http://192.168.1.*:5173"},
        allowCredentials = "true"
)
public class MealPlanController {
    private final MealPlanService mealPlanService;

    @GetMapping
    public ResponseEntity<List<MealPlanDTO>> getMealsBetweenDates(
            @RequestParam("startDate") LocalDate startDate,
            @RequestParam("endDate") LocalDate endDate) {
        List<MealPlanDTO> mealPlanDTO = mealPlanService.getMealsBetweenDates(startDate, endDate);
        return ResponseEntity.ok(mealPlanDTO);
    }

    @PostMapping
    public ResponseEntity<MealPlanDTO> scheduleMeal(@RequestBody MealPlanDTO mealPlanDTO) {
        MealPlanDTO scheduledMealPlanDTO = mealPlanService.scheduleMeal(mealPlanDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(scheduledMealPlanDTO);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MealPlanDTO> updateMealPlan(@PathVariable Long id, @RequestBody MealPlanDTO mealPlanDTO) {
        MealPlanDTO updatedMealPlan = mealPlanService.updateMealPlan(id, mealPlanDTO);
        return ResponseEntity.ok(updatedMealPlan);
    }

    @PostMapping("/{id}/cook")
    public ResponseEntity<Void> confirmMealCooked(
            @PathVariable("id") Long id,
            @RequestBody(required = false) Map<String, Integer> payload) {
        Integer guests = (payload != null && payload.containsKey("guests")) ? payload.get("guests") : null;
        mealPlanService.confirmMealCooked(id, guests);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMealPlanner(@PathVariable Long id) {
        mealPlanService.deleteMealPlanner(id);
        return ResponseEntity.noContent().build();
    }
}