package hebtspring.service;

import hebtspring.dto.MealPlanDTO;
import hebtspring.dto.ShoppingListItemDTO;
import hebtspring.repository.MealPlanRepository;
import hebtspring.repository.ShoppingListItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MealPlannerService {

    private final MealPlanRepository mealPlanRepository;
    private final ShoppingListItemRepository shoppingListItemRepository;

    // Inietteremo anche gli altri service per l'algoritmo
    private final PantryService pantryService;
    private final RecipeService recipeService;

    /**
     * Inserisce un piatto nel calendario (es. Pranzo del 15 Giugno, 1 persona).
     */
    public MealPlanDTO scheduleMeal(MealPlanDTO mealPlanDTO) {
        // Da implementare
        return null;
    }

    /**
     * Ritorna i pasti programmati per mostrare il calendario sul frontend.
     */
    public List<MealPlanDTO> getMealsBetweenDates(LocalDate startDate, LocalDate endDate) {
        // Da implementare
        return null;
    }

    /**
     * CASO D'USO 2: L'Algoritmo Intelligente della Spesa
     * 1. Recupera tutti i MealPlan tra startDate ed endDate.
     * 2. Moltiplica gli ingredienti delle ricette per il numero di servings.
     * 3. Controlla la dispensa (PantryService), escludendo i lotti con expiration_date < planned_date.
     * 4. Calcola la differenza (Fabbisogno - Dispensa Valida).
     * 5. Salva i risultati positivi in ShoppingListItem (raggruppati per categoria).
     */
    public List<ShoppingListItemDTO> generateShoppingList(LocalDate startDate, LocalDate endDate) {
        // Da implementare
        return null;
    }

    /**
     * CASO D'USO 4 (Innesco): Cucina e Scala
     * Questo metodo viene chiamato dal tasto "Conferma Cottura" sul frontend.
     * 1. Recupera il MealPlan (per sapere la Ricetta e i servings).
     * 2. Recupera la Ricetta e calcola il totale esatto usato di ogni ingrediente.
     * 3. Chiama pantryService.consumeIngredientFifo() per ogni ingrediente.
     * 4. Segna il MealPlan come completato (es. eliminandolo o aggiungendo un flag 'isCooked').
     */
    public void confirmMealCooked(Long mealPlanId) {
        // Da implementare
    }
}