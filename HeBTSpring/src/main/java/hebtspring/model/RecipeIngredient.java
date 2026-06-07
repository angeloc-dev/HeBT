package hebtspring.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "recipe_ingredient", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"recipe_id", "ingredient_id", "section"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecipeIngredient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_id", nullable = false)
    private Ingredient ingredient;

    @Column(precision = 6, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 20)
    private String unit;

    @Column(length = 50)
    private String section;
}