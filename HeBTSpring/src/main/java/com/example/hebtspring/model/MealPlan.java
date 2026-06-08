package com.example.hebtspring.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "meal_plan")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MealPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    @Column(name = "planned_date", nullable = false)
    private LocalDate plannedDate;

    @Column(name = "meal_type", nullable = false, length = 20)
    private String mealType; // Es: PRANZO, CENA

    @Column(nullable = false)
    @Builder.Default
    private Integer servings = 1;
}