package com.example.hebtspring.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ingredient")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ingredient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 50)
    private String category;
}