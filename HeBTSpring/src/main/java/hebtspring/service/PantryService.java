package hebtspring.service;

import hebtspring.dto.PantryItemDTO;
import hebtspring.model.Ingredient;
import hebtspring.model.PantryItem;
import hebtspring.repository.IngredientRepository;
import hebtspring.repository.PantryItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PantryService {

    private final PantryItemRepository pantryItemRepository;
    private final IngredientRepository ingredientRepository;

    // Metodo di utilità per trasformare l'Entity in DTO
    private PantryItemDTO mapToDTO(PantryItem item) {
        return new PantryItemDTO(
                item.getId(),
                item.getIngredient().getId(),
                item.getIngredient().getName(),
                item.getIngredient().getCategory(),
                item.getCurrentAmount(),
                item.getUnit(),
                item.getExpirationDate(),
                item.getPurchaseDate()
        );
    }

    public List<PantryItemDTO> checkPantryInventory() {
        return pantryItemRepository.findByCurrentAmountGreaterThanOrderByExpirationDateAsc(BigDecimal.ZERO)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    public PantryItemDTO addPantryItem(PantryItemDTO itemDTO) {
        if (itemDTO == null) {
            throw new IllegalArgumentException("Item DTO is null");
        }

        Ingredient ingredient = ingredientRepository.findById(itemDTO.ingredientId())
                .orElseThrow(() -> new IllegalArgumentException("Ingredient not found"));

        PantryItem newPantryItem = PantryItem.builder()
                .ingredient(ingredient)
                .currentAmount(itemDTO.currentAmount())
                .unit(itemDTO.unit())
                .expirationDate(itemDTO.expirationDate())
                .purchaseDate(LocalDate.now())
                .build();

        PantryItem saved = pantryItemRepository.save(newPantryItem);
        return this.mapToDTO(saved);
    }

    public BigDecimal getAvailableAmountValidForDate(Long ingredientId, LocalDate targetDate) {
        List<PantryItem> validBatches = pantryItemRepository
                .findByIngredientIdAndExpirationDateGreaterThanEqual(ingredientId, targetDate);

        return validBatches.stream()
                .map(PantryItem::getCurrentAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public void consumeIngredientFifo(Long ingredientId, BigDecimal amountNeeded) {
        List<PantryItem> batches = pantryItemRepository
                .findByIngredientIdAndCurrentAmountGreaterThanOrderByExpirationDateAsc(ingredientId, BigDecimal.ZERO);

        BigDecimal remainingToConsume = amountNeeded;

        for (PantryItem batch : batches) {
            if (remainingToConsume.compareTo(BigDecimal.ZERO) <= 0) {
                break;
            }
            BigDecimal amountInThisBatch = batch.getCurrentAmount();

            if (amountInThisBatch.compareTo(remainingToConsume) <= 0) {
                remainingToConsume = remainingToConsume.subtract(amountInThisBatch);
                batch.setCurrentAmount(BigDecimal.ZERO);
            } else {
                batch.setCurrentAmount(amountInThisBatch.subtract(remainingToConsume));
                remainingToConsume = BigDecimal.ZERO;
            }
            pantryItemRepository.save(batch);
        }
        if (remainingToConsume.compareTo(BigDecimal.ZERO) > 0) {
            throw new RuntimeException("Warning: You don't have enough in your pantry for ingredient ID. " + ingredientId);
        }
    }
}