import { type ReactElement, useState, useCallback, useEffect } from "react";
import { FiTrash2, FiCheck } from "react-icons/fi";
import { cn } from "@/lib/utils.ts";
import type { ShoppingListItem } from "@/model/data-model.ts";
import { shoppingListService } from "@/services/shoppingListService.ts";
import InputText from "@/components/ui/InputText.tsx";
import { useToast } from "@/hooks/useToast.ts";

interface ShoppingListItemRowProps {
    item: ShoppingListItem;
    onListUpdated: () => void;
    onPurchaseRequest: () => void;
}

export default function ShoppingListItemRow({ item, onListUpdated, onPurchaseRequest }: ShoppingListItemRowProps): ReactElement {
    const { addToast } = useToast();
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [amountValue, setAmountValue] = useState<number | string>(item.amount);

    useEffect(() => {
        const loadInitialData = async () => {
            setAmountValue(item.amount);
        };

        loadInitialData();
    }, [item.amount]);

    const handleAmountUpdate = useCallback(async () => {
        const parsedAmount = Number(amountValue);
        if (isNaN(parsedAmount) || parsedAmount <= 0 || parsedAmount === item.amount) {
            setAmountValue(item.amount);
            return;
        }
        try {
            await shoppingListService.updateItemAmount(item.id, parsedAmount);
            onListUpdated();
        } catch (error) {
            addToast(`Errore nell'aggiornamento della quantità: ${error}`, "error");
            setAmountValue(item.amount);
        }
    }, [amountValue, item.amount, item.id, onListUpdated, addToast]);

    const handleDelete = useCallback(async () => {
        setIsDeleting(true);
        try {
            await shoppingListService.deleteShoppingListItem(item.id);
            onListUpdated();
        } catch (error) {
            addToast(`Errore nell'eliminazione della voce: ${error}`, "error");
            setIsDeleting(false);
        }
    }, [item.id, onListUpdated, addToast]);

    return (
        <div className="group flex items-center justify-between p-3 rounded-xl border border-border/50 bg-background hover:border-primary/30 transition-colors">
            <div className="flex items-center gap-4 flex-1">
                <button
                    onClick={onPurchaseRequest}
                    className="w-6 h-6 rounded border-2 border-muted-foreground hover:border-emerald-500 hover:text-emerald-500 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                    title="Spunta articolo (Sposta in Dispensa)"
                >
                    <FiCheck className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                </button>
                <span className="text-base font-semibold text-foreground truncate">
                    {item.ingredientName}
                </span>
            </div>
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-secondary/20 rounded-lg p-1 pr-3 border border-border/50">
                    <InputText
                        type="number"
                        step="0.1"
                        min="0"
                        value={amountValue}
                        onChange={(e) => setAmountValue(e.target.value)}
                        onBlur={handleAmountUpdate}
                        className="w-16 h-8 text-center bg-transparent border-none focus-visible:ring-0 text-sm font-bold p-0 shadow-none"
                    />
                    <span className="text-xs font-bold text-muted-foreground w-6 text-left">
                        {item.unit}
                    </span>
                </div>
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className={cn(
                        "text-muted-foreground hover:text-destructive transition-colors p-2 rounded-md hover:bg-destructive/10 cursor-pointer",
                        isDeleting && "opacity-50 cursor-not-allowed"
                    )}
                    title="Elimina voce"
                >
                    <FiTrash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}