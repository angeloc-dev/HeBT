import { type ReactElement, useState, useCallback, useMemo } from "react";
import { FiEdit2, FiTrash2, FiClock, FiAlertCircle } from "react-icons/fi";
import type { PantryItem } from "@/model/data-model.ts";
import { pantryService } from "@/services/pantryService.ts";
import { cn } from "@/lib/utils.ts";
import PantryFormModal from "@/components/pantry/PantryFormModal.tsx";
import { toast } from "sonner";

interface PantryItemRowProps {
    item: PantryItem;
    onPantryUpdated: (showLoader?: boolean) => void;
}

export default function PantryItemRow({ item, onPantryUpdated }: PantryItemRowProps): ReactElement {
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const isLowStock = item.currentAmount <= 5;

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
        const savePromise = async () => {
            try {
                await pantryService.deletePantryItem(item.id);
                onPantryUpdated(false);
            } finally {
                setIsDeleting(false);
            }
        };
        toast.promise(savePromise(), {
            loading: "Rimozione dell'ingrediente in corso...",
            success: `"${item.ingredientName}" rimosso dalla dispensa.`,
            error: (error) => `Errore durante la rimozione: ${error?.message || error}`,
        });
    }, [item.id, item.ingredientName, onPantryUpdated]);

    const BadgeIcon = expirationBadge.icon;

    return (
        <>
            <div className={cn(
                "group flex items-center justify-between p-3 sm:p-4 rounded-xl border transition-all gap-3",
                isLowStock
                    ? "bg-orange-500/5 border-orange-500/30 hover:border-orange-500/60"
                    : "bg-background border-border/50 hover:border-primary/30"
            )}>
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
                        {isLowStock && (
                            <span className="hidden sm:flex items-center gap-1 text-[10px] uppercase font-bold text-orange-600 bg-orange-500/20 px-2 py-0.5 rounded-md shrink-0">
                                <FiAlertCircle className="w-3 h-3" /> In Esaurimento
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
                    <div className="flex flex-row gap-1 items-end justify-center min-w-[3rem]">
                        <span className={cn(
                            "text-xl font-black leading-none",
                            isLowStock ? "text-orange-600" : "text-primary"
                        )}>
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
                        onPantryUpdated(false);
                    }}
                />
            )}
        </>
    );
}