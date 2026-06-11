import { type ReactElement, useState, useMemo, useCallback, useEffect } from "react";
import { FiX, FiShoppingCart, FiCheckSquare, FiSquare, FiCalendar } from "react-icons/fi";
import Button from "@/components/ui/Button.tsx";
import InputText from "@/components/ui/InputText.tsx";
import { cn } from "@/lib/utils.ts";
import { useToast } from "@/hooks/useToast.ts";
import type { MealPlan } from "@/model/data-model.ts";
import { shoppingListService } from "@/services/shoppingListService.ts";
import {formatDateForInput} from "@/model/constants.ts";

interface GenerateSpesaModalProps {
    mealPlans: MealPlan[];
    onClose: () => void;
    onSuccess: () => void;
}


export default function GenerateSpesaModal({ mealPlans, onClose, onSuccess }: GenerateSpesaModalProps): ReactElement | null {
    const { addToast } = useToast();
    const [startDate, setStartDate] = useState<string>(() => formatDateForInput(new Date()));
    const [endDate, setEndDate] = useState<string>(() => {
        const d = new Date();
        d.setDate(d.getDate() + 7);
        return formatDateForInput(d);
    });
    const [isGenerating, setIsGenerating] = useState<boolean>(false);

    const mealsInRange = useMemo(() => {
        if (!startDate || !endDate) return [];
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();

        return mealPlans.filter(m => {
            const mealTime = new Date(m.plannedDate).getTime();
            return mealTime >= start && mealTime <= end;
        }).sort((a, b) => new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime());
    }, [mealPlans, startDate, endDate]);

    const groupedMeals = useMemo(() => {
        const map = new Map<string, MealPlan[]>();
        mealsInRange.forEach(m => {
            const dateStr = new Date(m.plannedDate).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
            if (!map.has(dateStr)) map.set(dateStr, []);
            map.get(dateStr)?.push(m);
        });
        return map;
    }, [mealsInRange]);

    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    useEffect(() => {
        const loadInitialData = async () => {
            setSelectedIds(new Set(mealsInRange.map(m => m.id)));
        };

        loadInitialData();
    }, [mealsInRange]);

    const toggleSelection = useCallback((id: number) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const toggleAll = useCallback(() => {
        if (selectedIds.size === mealsInRange.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(mealsInRange.map(m => m.id)));
        }
    }, [selectedIds.size, mealsInRange]);

    const handleGenerate = useCallback(async () => {
        if (selectedIds.size === 0) {
            addToast("Seleziona almeno un pasto per generare la spesa.", "warning");
            return;
        }
        setIsGenerating(true);
        try {
            const idsArray = Array.from(selectedIds);
            await shoppingListService.generateShoppingList(idsArray);
            addToast("Lista della spesa generata con successo!", "success");
            onSuccess();
        } catch (error) {
            console.error("Errore generazione spesa:", error);
            addToast("Si è verificato un errore durante la generazione della spesa.", "error");
        } finally {
            setIsGenerating(false);
        }
    }, [selectedIds, onSuccess, addToast]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-2xl max-h-[90vh] rounded-2xl border border-border shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-start border-b border-border/50 p-6 shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <FiShoppingCart className="text-emerald-500" /> Pianifica Spesa
                        </h3>
                        <p className="text-muted-foreground text-sm mt-1">
                            Scegli il periodo e i piatti per cui vuoi acquistare gli ingredienti.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isGenerating}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-secondary/20"
                    >
                        <FiX className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex flex-col flex-1 overflow-y-auto p-6 gap-6 custom-scrollbar">
                    <div className="flex flex-col sm:flex-row gap-4 bg-secondary/10 p-4 rounded-xl border border-border/50 shrink-0">
                        <div className="flex-1 flex flex-col gap-2">
                            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <FiCalendar className="text-primary" /> Da
                            </label>
                            <InputText type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                        </div>
                        <div className="flex-1 flex flex-col gap-2">
                            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <FiCalendar className="text-primary" /> A
                            </label>
                            <InputText type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                        </div>
                    </div>
                    {mealsInRange.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground bg-background/50 rounded-xl border border-dashed border-border/50">
                            <FiCalendar className="w-10 h-10 mb-3 opacity-20" />
                            <p>Nessun pasto programmato in questo periodo.</p>
                            <span className="text-sm mt-1">Torna al calendario per aggiungere delle ricette.</span>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-center border-b border-border/50 pb-2">
                                <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                                    Pasti Selezionati ({selectedIds.size}/{mealsInRange.length})
                                </span>
                                <button
                                    onClick={toggleAll}
                                    className="text-sm font-semibold text-primary hover:underline"
                                >
                                    {selectedIds.size === mealsInRange.length ? "Deseleziona tutto" : "Seleziona tutto"}
                                </button>
                            </div>
                            <div className="flex flex-col gap-6">
                                {Array.from(groupedMeals.entries()).map(([dateStr, dailyMeals]) => (
                                    <div key={dateStr} className="flex flex-col gap-2">
                                        <h4 className="text-sm font-bold text-foreground capitalize bg-background sticky top-0 py-1 z-10">
                                            {dateStr}
                                        </h4>
                                        <div className="flex flex-col gap-1">
                                            {dailyMeals.map(meal => {
                                                const isSelected = selectedIds.has(meal.id);
                                                return (
                                                    <button
                                                        key={meal.id}
                                                        onClick={() => toggleSelection(meal.id)}
                                                        className={cn(
                                                            "flex items-center gap-3 p-3 rounded-lg border transition-all text-left cursor-pointer",
                                                            isSelected
                                                                ? "bg-primary/5 border-primary/30"
                                                                : "bg-background border-border/50 hover:bg-secondary/10 opacity-60"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "flex items-center justify-center w-5 h-5 rounded-[4px] shrink-0 transition-colors",
                                                            isSelected ? "text-primary" : "text-muted-foreground"
                                                        )}>
                                                            {isSelected ? <FiCheckSquare className="w-5 h-5" /> : <FiSquare className="w-5 h-5" />}
                                                        </div>
                                                        <div className="flex flex-col flex-1 truncate">
                                                            <span className={cn(
                                                                "text-sm font-bold truncate",
                                                                isSelected ? "text-foreground" : "text-muted-foreground"
                                                            )}>
                                                                {meal.recipeTitle}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {meal.mealType} • {meal.servings} porzioni
                                                            </span>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex justify-end gap-3 p-6 border-t border-border/50 shrink-0 bg-background/50 rounded-b-2xl">
                    <Button variant="ghost" onClick={onClose} disabled={isGenerating}>
                        Annulla
                    </Button>
                    <Button
                        onClick={handleGenerate}
                        disabled={isGenerating || selectedIds.size === 0}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white border-none min-w-[160px]"
                    >
                        {isGenerating ? "Generazione..." : "Genera Spesa"}
                    </Button>
                </div>
            </div>
        </div>
    );
}