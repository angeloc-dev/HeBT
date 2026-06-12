import { type ReactElement, useState, useEffect, useCallback } from "react";
import { FiX, FiSave, FiAlertCircle } from "react-icons/fi";
import Button from "@/components/ui/Button.tsx";
import InputText from "@/components/ui/InputText.tsx";
import Select from "@/components/ui/Select.tsx";
import { cn } from "@/lib/utils.ts";
import type { MealPlan, Recipe } from "@/model/data-model.ts";
import { recipeService } from "@/services/recipeService.ts";
import { mealPlannerService } from "@/services/mealPlannerService.ts";
import { formatDateForInput, MEAL_SLOT_OPTIONS } from "@/model/constants.ts";

interface MealSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    date: Date;
    mealType: string;
    existingMeal: MealPlan | null;
}

export default function MealSelectionModal({
                                               isOpen,
                                               onClose,
                                               onSuccess,
                                               date,
                                               mealType,
                                               existingMeal
                                           }: MealSelectionModalProps): ReactElement | null {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [isLoadingRecipes, setIsLoadingRecipes] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedRecipeId, setSelectedRecipeId] = useState<number | "">(existingMeal?.recipeId || "");
    const [servings, setServings] = useState<number>(existingMeal?.servings || 1);
    const [selectedDate, setSelectedDate] = useState<string>(
        formatDateForInput(existingMeal ? existingMeal.plannedDate : date)
    );
    const [selectedSlot, setSelectedSlot] = useState<string>(existingMeal?.mealType || mealType);

    const fetchRecipes = useCallback(async () => {
        setIsLoadingRecipes(true);
        setError(null);
        try {
            const data = await recipeService.getAllRecipes();
            setRecipes(data);
        } catch (err) {
            setError(`Impossibile caricare il ricettario: ${err}`);
        } finally {
            setIsLoadingRecipes(false);
        }
    }, []);

    useEffect(() => {
        const loadInitialData = async () => {
            await fetchRecipes();
        };

        if (isOpen) {
            loadInitialData();
        }
    }, [isOpen, fetchRecipes]);

    const recipeOptions = recipes.map(r => ({
        value: r.id,
        label: r.title
    }));

    const handleSave = useCallback(async () => {
        if (!selectedRecipeId) {
            setError("Seleziona una ricetta per procedere.");
            return;
        }
        setIsSaving(true);
        setError(null);
        try {
            const payload: Omit<MealPlan, 'id'> = {
                recipeId: Number(selectedRecipeId),
                recipeTitle: recipes.find(r => r.id === Number(selectedRecipeId))?.title || "",
                plannedDate: selectedDate,
                mealType: selectedSlot,
                servings: servings
            };
            if (existingMeal) {
                await mealPlannerService.updateMealPlan(existingMeal.id, payload as MealPlan);
            } else {
                await mealPlannerService.scheduleMeal(payload);
            }
            onSuccess();
        } catch (error) {
            const err = error as Error;
            setError(err?.message || "Si è verificato un errore durante il salvataggio.");
        } finally {
            setIsSaving(false);
        }
    }, [selectedRecipeId, selectedDate, selectedSlot, servings, existingMeal, recipes, onSuccess]);

    if (!isOpen) return null;

    const isEditMode = !!existingMeal;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl p-6 flex flex-col gap-6 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-start border-b border-border/50 pb-4">
                    <div>
                        <h3 className="text-xl font-bold text-foreground">
                            {isEditMode ? "Modifica Pasto" : "Pianifica Pasto"}
                        </h3>
                        <p className="text-muted-foreground text-sm mt-1">
                            {isEditMode
                                ? "Aggiorna le porzioni o sposta questo piatto in un altro momento."
                                : "Scegli una ricetta dal tuo archivio da cucinare in questo slot."}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isSaving}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-secondary/20"
                    >
                        <FiX className="w-6 h-6" />
                    </button>
                </div>
                {error && (
                    <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
                        <FiAlertCircle className="w-5 h-5 shrink-0" />
                        <p>{error}</p>
                    </div>
                )}
                <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-foreground">Ricetta da cucinare</label>
                        {isLoadingRecipes ? (
                            <div className="h-12 border border-border/50 rounded-xl bg-secondary/10 animate-pulse flex items-center px-4 text-muted-foreground text-sm">
                                Caricamento ricettario...
                            </div>
                        ) : (
                            <Select
                                options={recipeOptions}
                                value={selectedRecipeId}
                                onChange={(val) => setSelectedRecipeId(Number(val))}
                                placeholder="Cerca o seleziona ricetta..."
                            />
                        )}
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1 flex flex-col gap-2">
                            <label className="text-sm font-semibold text-foreground">Slot</label>
                            <Select
                                options={MEAL_SLOT_OPTIONS}
                                value={selectedSlot}
                                onChange={(val) => setSelectedSlot(String(val))}
                            />
                        </div>
                        <div className="flex-1 flex flex-col gap-2">
                            <label className="text-sm font-semibold text-foreground">Data</label>
                            <InputText
                                type="date"
                                min={formatDateForInput(new Date())}
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="h-12"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-foreground">Porzioni / Ospiti</label>
                        <div className="flex items-center">
                            <InputText
                                type="number"
                                min={1}
                                max={50}
                                value={servings}
                                onChange={(e) => setServings(Number(e.target.value))}
                                className="h-12 w-32 text-center text-lg font-bold"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Le quantità della spesa verranno ricalcolate automaticamente in base a questo numero.
                        </p>
                    </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isSaving}
                        className="h-11 px-6"
                    >
                        Annulla
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving || isLoadingRecipes || selectedRecipeId === ""}
                        className="h-11 px-6 bg-primary hover:bg-primary/90 text-foreground transition-all"
                    >
                        <span className="flex items-center gap-2">
                            <FiSave className={cn("w-4 h-4", isSaving && "animate-pulse")} />
                            {isSaving ? "Salvataggio..." : "Salva Pasto"}
                        </span>
                    </Button>
                </div>
            </div>
        </div>
    );
}