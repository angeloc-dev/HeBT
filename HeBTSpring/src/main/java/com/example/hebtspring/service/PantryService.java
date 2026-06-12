package com.example.hebtspring.service;

import com.example.hebtspring.dto.IngredientDTO;
import com.example.hebtspring.dto.PantryItemDTO;
import com.example.hebtspring.model.Ingredient;
import com.example.hebtspring.model.PantryItem;
import com.example.hebtspring.repository.IngredientRepository;
import com.example.hebtspring.repository.PantryItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PantryService {

    private final PantryItemRepository pantryItemRepository;
    private final IngredientRepository ingredientRepository;
    private final IngredientService ingredientService;

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
                .orElseGet(() -> ingredientRepository.findByNameIgnoreCase(itemDTO.ingredientName())
                        .orElseGet(() -> {
                            IngredientDTO newIng = ingredientService.createIngredient(
                                    itemDTO.ingredientName(),
                                    itemDTO.category()
                            );
                            return ingredientRepository.findById(newIng.id())
                                    .orElseThrow(() -> new IllegalStateException("Errore nella creazione dell'ingrediente"));
                        }));
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

    public void deletePantryItem(Long id) {
        if (!pantryItemRepository.existsById(id)) {
            throw new IllegalArgumentException("Oggetto della dispensa non trovato: " + id);
        }
        pantryItemRepository.deleteById(id);
    }
}