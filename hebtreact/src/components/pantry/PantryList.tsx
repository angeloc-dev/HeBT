import { type ReactElement, useState, useMemo } from "react";
import type { PantryItem, SortMode } from "@/model/data-model.ts";
import { FiFilter, FiInbox } from "react-icons/fi";
import Select from "@/components/ui/Select.tsx";
import PantryItemRow from "@/components/pantry/PantryItemRow.tsx";

interface PantryListProps {
    items: PantryItem[];
    isLoading: boolean;
    onPantryUpdated: () => void;
    searchQuery: string;
}

const SORT_OPTIONS = [
    { value: "expiration_asc", label: "Più vicini alla scadenza" },
    { value: "category_asc", label: "Per Categoria (A-Z)" }
];

export default function PantryList({ items, isLoading, onPantryUpdated, searchQuery }: PantryListProps): ReactElement {
    const [sortMode, setSortMode] = useState<SortMode>("expiration_asc");

    const sortedAndFilteredItems = useMemo(() => {
        if (!items || items.length === 0) return [];
        const query = searchQuery.toLowerCase().trim();
        let result = items;

        if (query) {
            result = result.filter(item =>
                item.ingredientName.toLowerCase().includes(query) ||
                (item.category && item.category.toLowerCase().includes(query))
            );
        }

        return result.sort((a, b) => {
            if (sortMode === "expiration_asc") {
                const dateA = new Date(a.expirationDate).getTime();
                const dateB = new Date(b.expirationDate).getTime();
                if (dateA !== dateB) return dateA - dateB;
                return a.ingredientName.localeCompare(b.ingredientName);
            }
            if (sortMode === "category_asc") {
                const catCompare = (a.category || "").localeCompare(b.category || "");
                if (catCompare !== 0) return catCompare;
                return a.ingredientName.localeCompare(b.ingredientName);
            }
            return 0;
        });
    }, [items, sortMode, searchQuery]);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-background/50 p-3 rounded-xl border border-border/50">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <FiFilter className="w-4 h-4" />
                    <span>Ordina per:</span>
                </div>
                <div className="w-full sm:w-64">
                    <Select
                        options={SORT_OPTIONS}
                        value={sortMode}
                        onChange={(val) => setSortMode(val as SortMode)}
                        placeholder="Seleziona..."
                    />
                </div>
            </div>
            <div className="flex flex-col gap-3">
                {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                        <div key={`skeleton-${index}`} className="h-16 w-full rounded-xl bg-border/30 animate-pulse" />
                    ))
                ) : sortedAndFilteredItems.length > 0 ? (
                    sortedAndFilteredItems.map((item) => (
                        <PantryItemRow
                            key={item.id}
                            item={item}
                            onPantryUpdated={onPantryUpdated}
                        />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-background/30 rounded-2xl border border-dashed border-border/50">
                        <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center text-muted-foreground mb-4">
                            <FiInbox className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-1">
                            {searchQuery ? "Nessun risultato trovato" : "La dispensa è vuota"}
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            {searchQuery
                                ? `Non ci sono ingredienti che corrispondono a "${searchQuery}".`
                                : "Non hai ancora aggiunto ingredienti. Clicca su 'Aggiungi Ingrediente' o spunta gli articoli dalla spesa."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}