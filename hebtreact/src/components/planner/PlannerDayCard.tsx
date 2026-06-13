import { type ReactElement, useState, useMemo, useCallback } from "react";
import { FiPlus, FiTrash2, FiEdit2, FiUsers } from "react-icons/fi";
import { cn } from "@/lib/utils.ts";
import type { MealPlan } from "@/model/data-model.ts";
import { mealPlannerService } from "@/services/mealPlannerService.ts";
import { MEAL_SLOTS } from "@/model/constants.ts";
import MealSelectionModal from "@/components/planner/MealSelectionModal.tsx";
import { toast } from "sonner";

interface PlannerDayCardProps {
    date: Date;
    meals: MealPlan[];
    onMealsUpdated: () => void;
    readOnly?: boolean;
}

export default function PlannerDayCard({ date, meals, onMealsUpdated, readOnly = false }: PlannerDayCardProps): ReactElement {
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
        const map = new Map<string, MealPlan[]>();
        meals.forEach(m => {
            if (!map.has(m.mealType)) {
                map.set(m.mealType, []);
            }
            map.get(m.mealType)!.push(m);
        });
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
        const savePromise = async () => {
            try {
                await mealPlannerService.deleteMealPlanner(id);
                onMealsUpdated();
            } finally {
                setIsDeleting(null);
            }
        };
        toast.promise(savePromise(), {
            loading: "Eliminazione del pasto in corso...",
            success: "Pasto eliminato correttamente",
            error: (error) => `Errore durante il salvataggio: ${error?.message || error}`
        });
    }, [onMealsUpdated, isPast, readOnly]);

    const handleModalClose = useCallback(() => {
        setIsModalOpen(false);
        setSelectedSlot(null);
        setMealToEdit(null);
    }, []);

    const handleModalSuccess = useCallback(() => {
        setIsModalOpen(false);
        toast.success(`Piatto salvato con successo`);
        onMealsUpdated();
    }, [onMealsUpdated]);

    const dayName = date.toLocaleDateString('it-IT', { weekday: 'short' }).toUpperCase();
    const dayNumber = date.getDate();

    return (
        <>
            <div className={cn(
                "flex flex-col rounded-2xl border transition-all h-full overflow-hidden",
                isToday ? "border-primary shadow-[0_0_15px_rgba(16,185,129,0.15)] bg-primary/5" : "border-border/50 bg-background/50",
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
                            const slotMeals = mealsBySlot.get(slot.id) || [];
                            const SlotIcon = slot.icon;
                            if (slotMeals.length === 0 && readOnly) return null;

                            if (slotMeals.length > 0) {
                                return (
                                    <div key={slot.id} className="flex flex-col p-2.5 rounded-xl bg-background border border-border/50 shadow-sm gap-2 transition-all hover:border-primary/30">
                                        <div className="flex items-center justify-between pb-1.5 border-b border-border/50">
                                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                                                <SlotIcon className="w-3.5 h-3.5 shrink-0" />
                                                <span>{slot.label}</span>
                                            </div>
                                            {!isPast && !readOnly && (
                                                <button
                                                    onClick={() => handleAddClick(slot.id)}
                                                    className="text-primary hover:bg-primary/20 p-1 rounded-md transition-colors cursor-pointer"
                                                    title={`Aggiungi un altro piatto a ${slot.label}`}
                                                >
                                                    <FiPlus className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            {slotMeals.map(meal => (
                                                <div key={meal.id} className="group relative flex flex-col p-2 rounded-lg bg-secondary/20 border border-transparent hover:border-border/50 transition-all overflow-hidden">
                                                    <div>
                                                        <p
                                                            title={meal.recipeTitle}
                                                            className={cn(
                                                            "text-xs font-bold leading-tight line-clamp-2",
                                                            isPast && !readOnly ? "text-muted-foreground" : "text-foreground"
                                                        )}>
                                                            {meal.recipeTitle}
                                                        </p>
                                                        <div className="flex items-center mt-1 text-[10px] font-bold text-muted-foreground">
                                                            <FiUsers className="w-3 h-3 shrink-0 mr-1"/>
                                                            <span>{meal.servings} {meal.servings === 1 ? 'porzione' : 'porzioni'}</span>
                                                        </div>
                                                    </div>
                                                    {!isPast && !readOnly && (
                                                        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity bg-background p-1 rounded-md shadow-sm border border-border">
                                                            <button
                                                                onClick={() => handleEditClick(meal)}
                                                                className="p-1.5 text-primary hover:bg-primary/20 rounded-md transition-colors cursor-pointer"
                                                                title="Modifica"
                                                            >
                                                                <FiEdit2 className="w-3 h-3 shrink-0" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteClick(meal.id)}
                                                                disabled={isDeleting === meal.id}
                                                                className="p-1.5 text-destructive hover:bg-destructive/20 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
                                                                title="Rimuovi"
                                                            >
                                                                <FiTrash2 className="w-3 h-3 shrink-0" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
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