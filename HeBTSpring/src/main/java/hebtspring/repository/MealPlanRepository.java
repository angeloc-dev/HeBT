package hebtspring.repository;

import hebtspring.model.MealPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MealPlanRepository extends JpaRepository<MealPlan, Long> {

    // Recupera i piatti pianificati tra una data di inizio e una di fine
    List<MealPlan> findByPlannedDateBetween(LocalDate startDate, LocalDate endDate);
}