package hebtspring.repository;

import hebtspring.model.MealPlan;
import hebtspring.model.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MealPlanRepository extends JpaRepository<MealPlan, Long> {

    // Recupera i piatti pianificati tra una data di inizio e una di fine
    List<MealPlan> findByPlannedDateBetween(LocalDate startDate, LocalDate endDate);

    // Recupera un piatto pianificato per controllo doppioni
    Optional<MealPlan> findByPlannedDateAndMealTypeAndRecipe(LocalDate plannedDate, String mealType, Recipe recipe);
}