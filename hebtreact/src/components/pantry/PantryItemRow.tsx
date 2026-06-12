import { type ReactElement, useState, useCallback, useMemo } from "react";
import { FiEdit2, FiTrash2, FiClock, FiAlertCircle } from "react-icons/fi";
import type { PantryItem } from "@/model/data-model.ts";
import { pantryService } from "@/services/pantryService.ts";
import { useToast } from "@/hooks/useToast.ts";
import { cn } from "@/lib/utils.ts";
import PantryFormModal from "@/components/pantry/PantryFormModal.tsx";

interface PantryItemRowProps {
    item: PantryItem;
    onPantryUpdated: () => void;
}

export default function PantryItemRow({ item, onPantryUpdated }: PantryItemRowProps): ReactElement {
    const { addToast } = useToast();
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

    const expirationBadge = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expDate = new Date(item.expirationDate);
        expDate.setHours(0, 0, 0, 0);
        const diffTime = expDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < 0) {
            return {
                text: "Scaduto",
                color: "text-red-500 bg-red-500/10 border-red-500/20",
                icon: FiAlertCircle
            };
        }
        if (diffDays === 0) {
            return {
                text: "Scade oggi",
                color: "text-red-500 bg-red-500/10 border-red-500/20",
                icon: FiAlertCircle
            };
        }
        if (diffDays <= 3) {
            return {
                text: `Scade in ${diffDays} gg`,
                color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
                icon: FiClock
            };
        }
        return {
            text: `Scade il ${expDate.toLocaleDateString("it-IT", { day: '2-digit', month: 'short' })}`,
            color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
            icon: FiClock
        };
    }, [item.expirationDate]);

    const handleDelete = useCallback(async () => {
        setIsDeleting(true);
        try {
            await pantryService.deletePantryItem(item.id);
            addToast(`"${item.ingredientName}" rimosso dalla dispensa.`, "success");
            onPantryUpdated();
        } catch (error) {
            addToast(`Errore durante l'eliminazione: ${error}`, "error");
            setIsDeleting(false);
        }
    }, [item.id, item.ingredientName, onPantryUpdated, addToast]);

    const BadgeIcon = expirationBadge.icon;

    return (
        <>
            <div className="group flex items-center justify-between p-3 sm:p-4 rounded-xl border border-border/50 bg-background hover:border-primary/30 transition-colors gap-3">
                <div className="flex flex-col flex-1 min-w-0 gap-1.5">
                    <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-foreground truncate" title={item.ingredientName}>
                            {item.ingredientName}
                        </span>
                        {item.category && item.category !== "Altro" && (
                            <span className="hidden sm:flex text-[10px] uppercase tracking-wider font-bold text-muted-foreground bg-secondary/20 px-2 py-0.5 rounded-md shrink-0">
                                {item.category}
                            </span>
                        )}
                    </div>
                    <div className={cn(
                        "w-fit flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-bold shrink-0",
                        expirationBadge.color
                    )}>
                        <BadgeIcon className="w-3 h-3 shrink-0" />
                        {expirationBadge.text}
                    </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                    <div className="flex flex-col items-end justify-center min-w-[3rem]">
                        <span className="text-xl font-black text-primary leading-none">
                            {item.currentAmount}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                            {item.unit}
                        </span>
                    </div>
                    <div className="w-px h-8 bg-border/50 hidden sm:block"></div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="p-2 sm:p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 hover:scale-110 transition-all cursor-pointer"
                            title="Modifica Ingrediente"
                        >
                            <FiEdit2 className="w-4 h-4 shrink-0" />
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="p-2 sm:p-2.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 hover:scale-110 transition-all disabled:opacity-50 disabled:hover:scale-100 cursor-pointer"
                            title="Elimina"
                        >
                            <FiTrash2 className="w-4 h-4 shrink-0" />
                        </button>
                    </div>
                </div>
            </div>
            {isEditModalOpen && (
                <PantryFormModal
                    isOpen={isEditModalOpen}
                    existingItem={item}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={() => {
                        setIsEditModalOpen(false);
                        onPantryUpdated();
                    }}
                />
            )}
        </>
    );
}