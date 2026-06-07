package hebtspring.service;

import hebtspring.dto.PantryItemDTO;
import hebtspring.repository.PantryItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PantryService {

    private final PantryItemRepository pantryItemRepository;

    /**
     * CASO D'USO 3: Controllare la Dispensa
     * Ritorna tutti i lotti attualmente disponibili in casa (current_amount > 0).
     * * Funzionalità "Smart" da implementare qui:
     * 1. Filtrare in automatico i record dove current_amount è sceso a 0.
     * 2. Ordinare i risultati: prima quelli che stanno per scadere (Scadenza ASC).
     * 3. (Opzionale) Raggruppare le risposte per 'categoria' per mostrare
     * la dispensa divisa a schermo (es. Frigo, Secco, Ortofrutta).
     */
    public List<PantryItemDTO> checkPantryInventory() {
        // @todo
        // return pantryItemRepository.findByCurrentAmountGreaterThanOrderByExpirationDateAsc(BigDecimal.ZERO)
        //        .stream().map(this::mapToDTO).toList();
        return null;
    }

    /**
     * Aggiunge un nuovo acquisto (Lotto) in dispensa con la sua scadenza.
     */
    public PantryItemDTO addPantryItem(PantryItemDTO itemDTO) {
        // @todo
        return null;
    }

    /**
     * CASO D'USO 4 (Parte core): Logica FIFO
     * 1. Recupera i lotti dell'ingrediente ordinati per scadenza (ASC).
     * 2. Cicla sui lotti e sottrae la 'amountNeeded'.
     * 3. Se un lotto va a 0, lo elimina (o lo imposta a 0) e passa al lotto successivo.
     * 4. Lancia eccezione se la dispensa non ha abbastanza quantità.
     */
    public void consumeIngredientFifo(Long ingredientId, BigDecimal amountNeeded) {
        // @todo
    }
}