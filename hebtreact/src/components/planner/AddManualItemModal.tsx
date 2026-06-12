import { type ReactElement, useState, useEffect, useCallback, useRef } from "react";
import { FiX, FiPlus, FiSearch } from "react-icons/fi";
import CustomButton from "../ui/CustomButton.tsx";
import InputText from "@/components/ui/InputText.tsx";
import Select from "@/components/ui/Select.tsx";
import { cn } from "@/lib/utils.ts";
import type { Ingredient } from "@/model/data-model.ts";
import { ingredientService } from "@/services/ingredientService.ts";
import { shoppingListService } from "@/services/shoppingListService.ts";
import { UNIT_GROUPS, SHOPPING_SECTION_GROUPS } from "@/model/constants.ts";
import {toast} from "sonner";

interface AddManualItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddManualItemModal({ isOpen, onClose, onSuccess }: AddManualItemModalProps): ReactElement | null {
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [nameQuery, setNameQuery] = useState<string>("");
    const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
    const [amount, setAmount] = useState<number>(1);
    const [unit, setUnit] = useState<string>("pz");
    const [category, setCategory] = useState<string>("Altro");
    const [suggestions, setSuggestions] = useState<Ingredient[]>([]);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (!nameQuery.trim() || selectedIngredient?.name === nameQuery) {
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const results = await ingredientService.searchIngredients(nameQuery);
                setSuggestions(results);
                setShowSuggestions(true);
            } catch (error) {
                toast.error(`Errore nella ricerca ingredienti: ${error}`);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [nameQuery, selectedIngredient]);

    const handleNameChange = (val: string) => {
        setNameQuery(val);
        if (selectedIngredient && val !== selectedIngredient.name) {
            setSelectedIngredient(null);
        }
        if (!val.trim()) {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSelectSuggestion = (ing: Ingredient) => {
        setSelectedIngredient(ing);
        setNameQuery(ing.name);
        setCategory(ing.category || "Altro");
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const handleSave = useCallback(() => {
        if (!nameQuery.trim()) {
            toast.warning("Inserisci il nome dell'articolo.");
            return;
        }
        if (amount <= 0) {
            toast.warning("La quantità deve essere maggiore di zero.");
            return;
        }
        setIsSaving(true);
        const savePromise = async () => {
            try {
                await shoppingListService.addManualItem({
                    ingredientId: selectedIngredient?.id || 0,
                    ingredientName: nameQuery.trim(),
                    category: category,
                    amount: amount,
                    unit: unit
                });
                onSuccess();
            } finally {
                setIsSaving(false);
            }
        };
        toast.promise(savePromise(), {
            loading: "Aggiunta dell'articolo in corso...",
            success: "Articolo aggiunto alla lista!",
            error: (error) => `Errore durante il salvataggio: ${error?.message || error}`,
        });
    }, [nameQuery, amount, unit, category, selectedIngredient, onSuccess]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6 flex flex-col gap-6 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-start border-b border-border/50 pb-4">
                    <div>
                        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <FiPlus className="text-primary" /> Aggiunta Manuale
                        </h3>
                        <p className="text-muted-foreground text-sm mt-1">
                            Hai dimenticato qualcosa? Aggiungilo qui.
                        </p>
                    </div>
                    <button onClick={onClose} disabled={isSaving} className="text-muted-foreground hover:text-foreground">
                        <FiX className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2 relative" ref={dropdownRef}>
                        <label className="text-sm font-semibold text-foreground">Nome Articolo</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiSearch className={cn("w-4 h-4 text-muted-foreground", isSearching && "animate-pulse text-primary")} />
                            </div>
                            <InputText
                                type="text"
                                placeholder="Es. Spaghetti..."
                                value={nameQuery}
                                onChange={(e) => handleNameChange(e.target.value)}
                                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                                className="pl-9 h-12"
                            />
                        </div>
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute top-[calc(100%+5px)] left-0 right-0 z-50 max-h-48 overflow-y-auto bg-background border border-border/50 rounded-xl shadow-xl p-1 custom-scrollbar">
                                {suggestions.map(ing => (
                                    <button
                                        key={ing.id}
                                        onClick={() => handleSelectSuggestion(ing)}
                                        className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-secondary/20 rounded-lg transition-colors cursor-pointer flex justify-between items-center"
                                    >
                                        <span className="font-semibold">{ing.name}</span>
                                        <span className="text-xs text-muted-foreground">{ing.category}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                        {!selectedIngredient && nameQuery.trim().length > 0 && !showSuggestions && (
                            <span className="text-xs text-primary font-medium mt-1">
                                Questo è un nuovo elemento. Verrà aggiunto al database.
                            </span>
                        )}
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-[0.5] flex flex-col gap-2">
                            <label className="text-sm font-semibold text-foreground">Q.tà</label>
                            <InputText
                                type="number"
                                step="0.1"
                                min="0.1"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                className="h-12"
                            />
                        </div>
                        <div className="flex-1 flex flex-col gap-2">
                            <label className="text-sm font-semibold text-foreground">Unità</label>
                            <Select
                                groups={UNIT_GROUPS}
                                value={unit}
                                onChange={(val) => setUnit(String(val))}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-foreground">Reparto (per ordinarlo nella lista)</label>
                        <Select
                            groups={SHOPPING_SECTION_GROUPS}
                            value={category}
                            onChange={(val) => setCategory(String(val))}
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                    <CustomButton variant="ghost" onClick={onClose} disabled={isSaving}>
                        Annulla
                    </CustomButton>
                    <CustomButton onClick={handleSave} disabled={isSaving || !nameQuery.trim()} className="bg-emerald-500 hover:bg-emerald-600 text-white border-none">
                        {isSaving ? "Salvataggio..." : "Aggiungi"}
                    </CustomButton>
                </div>
            </div>
        </div>
    );
}