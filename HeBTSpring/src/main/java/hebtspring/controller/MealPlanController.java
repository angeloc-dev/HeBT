package hebtspring.controller;

import hebtspring.dto.MealPlanDTO;
import hebtspring.service.MealPlannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/meal-plans")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class MealPlanController {
    private final MealPlannerService mealPlannerService;

    @GetMapping
    public ResponseEntity<List<MealPlanDTO>> getMealsBetweenDates(@RequestParam("startDate") LocalDate startDate,
                                                                  @RequestParam("endDate") LocalDate endDate) {
        List<MealPlanDTO> mealPlanDTO = mealPlannerService.getMealsBetweenDates(startDate, endDate);
        return ResponseEntity.ok(mealPlanDTO);
    }

    @PostMapping
    public ResponseEntity<MealPlanDTO> scheduleMeal(@RequestBody MealPlanDTO mealPlanDTO) {
        MealPlanDTO scheduledMealPlanDTO = mealPlannerService.scheduleMeal(mealPlanDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(scheduledMealPlanDTO);
    }

    @PostMapping("{id}/cook")
    public ResponseEntity<MealPlanDTO> confirmMealCooked(@PathVariable("id") Long id) {
        mealPlannerService.confirmMealCooked(id);
        return ResponseEntity.noContent().build();
    }
}
