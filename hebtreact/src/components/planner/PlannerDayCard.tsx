import { type ReactElement, useState, useMemo, useCallback } from "react";
import { FiPlus, FiTrash2, FiEdit2, FiUsers } from "react-icons/fi";
import { cn } from "@/lib/utils.ts";
import type { MealPlan } from "@/model/data-model.ts";
import { mealPlannerService } from "@/services/mealPlannerService.ts";
import { useToast } from "@/hooks/useToast.ts";
import { MEAL_SLOTS } from "@/model/constants.ts";
import MealSelectionModal from "@/components/planner/MealSelectionModal.tsx";

interface PlannerDayCardProps {
    date: Date;
    meals: MealPlan[];
    onMealsUpdated: () => void;
    readOnly?: boolean;
}

export default function PlannerDayCard({ date, meals, onMealsUpdated, readOnly = false }: PlannerDayCardProps): ReactElement {
    const { addToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [mealToEdit, setMealToEdit] = useState<MealPlan | null>(null);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);

    const isToday = useMemo(() => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    }, [date]);

    const isPast = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const cardDate = new Date(date);
        cardDate.setHours(0, 0, 0, 0);
        return cardDate.getTime() < today.getTime();
    }, [date]);

    const mealsBySlot = useMemo(() => {
        const map = new Map<string, MealPlan>();
        meals.forEach(m => map.set(m.mealType, m));
        return map;
    }, [meals]);

    const handleAddClick = useCallback((slotId: string) => {
        if (isPast || readOnly) return;
        setSelectedSlot(slotId);
        setMealToEdit(null);
        setIsModalOpen(true);
    }, [isPast, readOnly]);

    const handleEditClick = useCallback((meal: MealPlan) => {
        if (isPast || readOnly) return;
        setSelectedSlot(meal.mealType);
        setMealToEdit(meal);
        setIsModalOpen(true);
    }, [isPast, readOnly]);

    const handleDeleteClick = useCallback(async (id: number) => {
        if (isPast || readOnly) return;
        setIsDeleting(id);
        try {
            await mealPlannerService.deleteMealPlanner(id);
            addToast(`Pasto eliminato correttamente.`, "success");
            onMealsUpdated();
        } catch (error) {
            addToast(`Errore nell'eliminazione del pasto: ${error}`, "error");
        } finally {
            setIsDeleting(null);
        }
    }, [onMealsUpdated, isPast, readOnly, addToast]);

    const handleModalClose = useCallback(() => {
        setIsModalOpen(false);
        setSelectedSlot(null);
        setMealToEdit(null);
    }, []);

    const handleModalSuccess = useCallback(() => {
        setIsModalOpen(false);
        addToast(`Piatto salvato con successo`, "success");
        onMealsUpdated();
    }, [onMealsUpdated, addToast]);

    const dayName = date.toLocaleDateString('it-IT', { weekday: 'short' }).toUpperCase();
    const dayNumber = date.getDate();

    return (
        <>
            <div className={cn(
                "flex flex-col rounded-2xl border transition-all h-full overflow-hidden",
                isToday ? "border-primary shadow-[0_0_15px_rgba(var(--primary),0.15)] bg-primary/5" : "border-border/50 bg-background/50",
                isPast && "opacity-60"
            )}>
                <div className={cn(
                    "flex flex-col items-center justify-center py-3 border-b",
                    isToday ? "bg-primary text-primary-foreground border-primary" : "border-border/50 bg-secondary/10"
                )}>
                    <span className="text-xs font-bold tracking-wider opacity-80">{dayName}</span>
                    <span className="text-2xl font-black">{dayNumber}</span>
                </div>
                <div className="flex flex-col flex-1 p-2 gap-2">
                    {meals.length === 0 && readOnly ? (
                        <div className="flex-1 flex items-center justify-center p-4">
                            <span className="text-xs text-muted-foreground italic text-center">Nessun pasto pianificato</span>
                        </div>
                    ) : (
                        MEAL_SLOTS.map((slot) => {
                            const meal = mealsBySlot.get(slot.id);
                            const SlotIcon = slot.icon;

                            // Se siamo in modalità readOnly e non c'è il pasto per questo slot, lo nascondiamo
                            if (!meal && readOnly) return null;

                            if (meal) {
                                return (
                                    <div key={slot.id} className="group relative flex flex-col p-3 rounded-xl bg-background border border-border/50 shadow-sm transition-all hover:border-primary/50">
                                        <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wide min-w-0">
                                                <SlotIcon className="w-3 h-3 shrink-0" />
                                                <span className="truncate">{slot.label}</span>
                                            </div>
                                            <div className="flex items-center flex-nowrap shrink-0 text-[10px] font-bold bg-secondary/30 px-1.5 py-0.5 rounded text-muted-foreground">
                                                <FiUsers className="w-3 h-3 shrink-0 mr-1"/>
                                                <span>{meal.servings}</span>
                                            </div>
                                        </div>
                                        <p className={cn(
                                            "text-sm font-semibold leading-tight line-clamp-2",
                                            isPast && !readOnly ? "text-muted-foreground" : "text-foreground"
                                        )}>
                                            {meal.recipeTitle}
                                        </p>

                                        {/* Nascondi il pannello di overlay se in readOnly */}
                                        {!isPast && !readOnly && (
                                            <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-xl">
                                                <button
                                                    onClick={() => handleEditClick(meal)}
                                                    className="p-2 bg-primary text-primary-foreground rounded-lg hover:scale-110 transition-transform cursor-pointer"
                                                    title="Modifica o Sposta"
                                                >
                                                    <FiEdit2 className="w-4 h-4 shrink-0" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(meal.id)}
                                                    disabled={isDeleting === meal.id}
                                                    className="p-2 bg-destructive text-destructive-foreground rounded-lg hover:scale-110 transition-transform disabled:opacity-50 disabled:scale-100 cursor-pointer"
                                                    title="Rimuovi"
                                                >
                                                    <FiTrash2 className="w-4 h-4 shrink-0" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            }
                            return (
                                <button
                                    key={slot.id}
                                    onClick={() => handleAddClick(slot.id)}
                                    disabled={isPast}
                                    className={cn(
                                        "group flex items-center gap-2 p-2.5 rounded-xl border border-dashed text-left w-full transition-colors",
                                        isPast
                                            ? "border-transparent opacity-50 cursor-not-allowed"
                                            : "border-transparent hover:border-primary/30 hover:bg-primary/5 cursor-pointer"
                                    )}
                                >
                                    <div className={cn(
                                        "w-6 h-6 rounded-md bg-secondary/20 flex items-center justify-center text-muted-foreground shrink-0 transition-colors",
                                        !isPast && "group-hover:bg-primary/10 group-hover:text-primary"
                                    )}>
                                        <SlotIcon className="w-3.5 h-3.5" />
                                    </div>
                                    <span className={cn(
                                        "text-xs font-medium text-muted-foreground transition-colors flex-1",
                                        !isPast && "group-hover:text-foreground"
                                    )}>
                                        {slot.label}
                                    </span>
                                    {!isPast && <FiPlus className="w-4 h-4 text-primary opacity-0 shrink-0 group-hover:opacity-100 transition-opacity" />}
                                </button>
                            );
                        })
                    )}
                </div>
            </div>
            {isModalOpen && selectedSlot && !isPast && !readOnly && (
                <MealSelectionModal
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    onSuccess={handleModalSuccess}
                    date={date}
                    mealType={selectedSlot}
                    existingMeal={mealToEdit}
                />
            )}
        </>
    );
}