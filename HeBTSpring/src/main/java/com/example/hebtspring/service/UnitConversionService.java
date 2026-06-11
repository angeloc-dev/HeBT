package com.example.hebtspring.service;

import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.Map;

@Service
public class UnitConversionService {
    private static final Map<String, Double> DENSITY_MAP = Map.ofEntries(
            // --- Farine e Polveri ---
            Map.entry("farina integrale", 120.0),
            Map.entry("farina", 130.0),
            Map.entry("cacao", 100.0),
            Map.entry("zucchero a velo", 120.0),
            Map.entry("lievito", 150.0),
            Map.entry("caffè", 100.0),
            // --- Zuccheri, Sali e Solidi Densi ---
            Map.entry("zucchero di canna", 220.0),
            Map.entry("zucchero", 200.0),
            Map.entry("sale", 273.0),
            // --- Cereali e Legumi secchi ---
            Map.entry("riso", 190.0),
            Map.entry("avena", 90.0),
            Map.entry("farro", 200.0),
            Map.entry("quinoa", 170.0),
            Map.entry("lenticchie", 190.0),
            Map.entry("ceci", 200.0),
            // --- Grassi, Creme e Liquidi Densi ---
            Map.entry("burro", 225.0),
            Map.entry("margarina", 225.0),
            Map.entry("miele", 340.0),
            Map.entry("sciroppo", 320.0),
            Map.entry("yogurt", 245.0),
            Map.entry("panna", 240.0),
            Map.entry("maionese", 230.0),
            Map.entry("nutella", 290.0),
            Map.entry("marmellata", 320.0),
            // --- Liquidi Puri ---
            Map.entry("acqua", 240.0),
            Map.entry("latte", 240.0),
            Map.entry("olio", 225.0),
            Map.entry("vino", 240.0),
            Map.entry("aceto", 240.0)
    );

    /**
     * Converte quantità e unità di misura in Unità di Base (Grammi, Millilitri, o Pezzi).
     */
    public BaseQuantity convertToBase(BigDecimal amount, String unit, String ingredientName) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            return new BaseQuantity(new BigDecimal("5.0"), "g");
        }
        String u = (unit != null) ? unit.toLowerCase().trim() : "";
        String name = (ingredientName != null) ? ingredientName.toLowerCase().trim() : "";

        switch (u) {
            case "g", "ml", "pz":
                return new BaseQuantity(amount, u);
            case "kg": return new BaseQuantity(amount.multiply(new BigDecimal("1000")), "g");
            case "l": return new BaseQuantity(amount.multiply(new BigDecimal("1000")), "ml");
            case "cl": return new BaseQuantity(amount.multiply(new BigDecimal("10")), "ml");
            case "dl": return new BaseQuantity(amount.multiply(new BigDecimal("100")), "ml");
            case "oz": return new BaseQuantity(amount.multiply(new BigDecimal("28.35")), "g");
            case "lb": return new BaseQuantity(amount.multiply(new BigDecimal("453.59")), "g");
            case "pizzico": return new BaseQuantity(amount.multiply(new BigDecimal("1.0")), "g");
            case "qb": return new BaseQuantity(new BigDecimal("5.0"), "g");
        }

        Double weightPerCup = findDensity(name);

        return switch (u) {
            case "cup", "tazza" ->
                    new BaseQuantity(amount.multiply(BigDecimal.valueOf(weightPerCup)), "g");
            case "tbsp", "cucchiaio" ->
                    new BaseQuantity(amount.multiply(BigDecimal.valueOf(weightPerCup / 16.0)), "g");
            case "tsp", "cucchiaino" ->
                    new BaseQuantity(amount.multiply(BigDecimal.valueOf(weightPerCup / 48.0)), "g");
            default ->
                    new BaseQuantity(amount, u);
        };
    }

    private Double findDensity(String ingredientName) {
        return DENSITY_MAP.entrySet().stream()
                .filter(entry -> ingredientName.contains(entry.getKey()))
                .map(Map.Entry::getValue)
                .findFirst()
                .orElse(240.0);
    }

    public record BaseQuantity(BigDecimal amount, String baseUnit) {}
}