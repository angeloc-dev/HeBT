package com.example.hebtspring.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "recipe")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Recipe {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String instructions;

    // Relazione bidirezionale per avere subito gli ingredienti quando viene caricata la ricetta
    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<RecipeIngredient> ingredients = new ArrayList<>();
}