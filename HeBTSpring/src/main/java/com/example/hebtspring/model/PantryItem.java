package com.example.hebtspring.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "pantry_item")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PantryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_id", nullable = false)
    private Ingredient ingredient;

    @Column(name = "current_amount", precision = 6, scale = 2, nullable = false)
    private BigDecimal currentAmount;

    @Column(nullable = false, length = 20)
    private String unit;

    @Column(name = "expiration_date", nullable = false)
    private LocalDate expirationDate;

    @Column(name = "purchase_date")
    @Builder.Default
    private LocalDate purchaseDate = LocalDate.now();
}