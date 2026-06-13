package com.example.hebtspring.service;

import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
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
        String u = (unit != null) ? unit.toLowerCase().trim() : "";
        String name = (ingredientName != null) ? ingredientName.toLowerCase().trim() : "";
        if ("qb".equals(u)) {
            return new BaseQuantity(BigDecimal.ZERO, "qb");
        }
        BigDecimal safeAmount = (amount == null || amount.compareTo(BigDecimal.ZERO) < 0)
                ? BigDecimal.ZERO : amount;
        switch (u) {
            case "g": case "ml": case "pz":
                return new BaseQuantity(safeAmount.setScale(2, RoundingMode.HALF_UP), u);
            case "kg":
                return new BaseQuantity(safeAmount.multiply(new BigDecimal("1000")).setScale(2, RoundingMode.HALF_UP), "g");
            case "l":
                return new BaseQuantity(safeAmount.multiply(new BigDecimal("1000")).setScale(2, RoundingMode.HALF_UP), "ml");
            case "dl":
                return new BaseQuantity(safeAmount.multiply(new BigDecimal("100")).setScale(2, RoundingMode.HALF_UP), "ml");
            case "cl":
                return new BaseQuantity(safeAmount.multiply(new BigDecimal("10")).setScale(2, RoundingMode.HALF_UP), "ml");
            case "oz":
                return new BaseQuantity(safeAmount.multiply(new BigDecimal("28.35")).setScale(2, RoundingMode.HALF_UP), "g");
            case "lb":
                return new BaseQuantity(safeAmount.multiply(new BigDecimal("453.59")).setScale(2, RoundingMode.HALF_UP), "g");
            case "pizzico":
                return new BaseQuantity(safeAmount.multiply(new BigDecimal("2.0")).setScale(2, RoundingMode.HALF_UP), "g");
        }
        Double weightPerCup = findDensity(name);
        BigDecimal result = switch (u) {
            case "cup", "tazza" ->
                    safeAmount.multiply(BigDecimal.valueOf(weightPerCup));
            case "bicchiere" ->
                    safeAmount.multiply(BigDecimal.valueOf(weightPerCup * (200.0 / 240.0)));
            case "tazzina" ->
                    safeAmount.multiply(BigDecimal.valueOf(weightPerCup * (50.0 / 240.0)));
            case "tbsp", "cucchiaio" ->
                    safeAmount.multiply(BigDecimal.valueOf(weightPerCup / 16.0));
            case "tsp", "cucchiaino" ->
                    safeAmount.multiply(BigDecimal.valueOf(weightPerCup / 48.0));
            default ->
                    safeAmount;
        };

        String finalUnit = u.matches("cup|tazza|bicchiere|tazzina|tbsp|cucchiaio|tsp|cucchiaino") ? "g" : u;

        return new BaseQuantity(result.setScale(2, RoundingMode.HALF_UP), finalUnit);
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