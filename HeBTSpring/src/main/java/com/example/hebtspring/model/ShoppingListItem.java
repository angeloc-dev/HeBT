package com.example.hebtspring.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "shopping_list_item")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShoppingListItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_id", nullable = false)
    private Ingredient ingredient;

    @Column(precision = 6, scale = 2, nullable = false)
    private BigDecimal amount;

    @Column(nullable = false, length = 20)
    private String unit;

    // Per spuntare gli ingredienti dal frontend senza cancellarli subito dal db
    @Column(name = "is_purchased", nullable = false)
    @Builder.Default
    private Boolean isPurchased = false;
}