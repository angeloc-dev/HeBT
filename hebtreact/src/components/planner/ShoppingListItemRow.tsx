import { type ReactElement, useState, useCallback, useEffect, memo } from "react";
import { FiTrash2, FiCheck } from "react-icons/fi";
import { cn } from "@/lib/utils.ts";
import type { ShoppingListItem } from "@/model/data-model.ts";
import { shoppingListService } from "@/services/shoppingListService.ts";
import InputText from "@/components/ui/InputText.tsx";
import { toast } from "sonner";

interface ShoppingListItemRowProps {
    item: ShoppingListItem;
    onListUpdated: (silent?: boolean) => void;
    onPurchaseRequest: () => void;
}

const ShoppingListItemRow = memo(({ item, onListUpdated, onPurchaseRequest }: ShoppingListItemRowProps): ReactElement => {
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [displayAmount, setDisplayAmount] = useState<string>("");
    const [displayUnit, setDisplayUnit] = useState<string>("");
    const isQb = item.unit.toLowerCase() === "qb";

    useEffect(() => {
        let amt = item.amount;
        let u = item.unit.toLowerCase();

        if (u === "g" && amt >= 1000) {
            amt = amt / 1000;
            u = "Kg";
        } else if (u === "ml" && amt >= 1000) {
            amt = amt / 1000;
            u = "L";
        } else if (u === "pz") {
            amt = Math.ceil(amt);
        }
        const formattedAmt = amt % 1 !== 0 ? Number(amt.toFixed(2)) : amt;
        setDisplayAmount(formattedAmt.toString());
        setDisplayUnit(u === "kg" ? "Kg" : u === "l" ? "L" : u);
    }, [item.amount, item.unit]);

    const handleAmountUpdate = useCallback(async () => {
        if (isQb) return;
        const parsedDisplayAmount = Number(displayAmount);
        if (isNaN(parsedDisplayAmount) || parsedDisplayAmount <= 0) {
            setDisplayAmount(item.amount.toString());
            return;
        }
        let rawAmountToSave = parsedDisplayAmount;
        if (displayUnit === "Kg") rawAmountToSave *= 1000;
        if (displayUnit === "L") rawAmountToSave *= 1000;
        rawAmountToSave = Math.round(rawAmountToSave * 100) / 100;
        if (rawAmountToSave === item.amount) return;

        setIsProcessing(true);
        const savePromise = async () => {
            try {
                await shoppingListService.updateItemAmount(item.id, rawAmountToSave);
                onListUpdated(false);
            } finally {
                setIsProcessing(false);
            }
        };
        toast.promise(savePromise(), {
            loading: "Aggiornamento quantità...",
            success: "Quantità aggiornata.",
            error: (error) => `Errore: ${error?.message || error}`
        });
    }, [displayAmount, displayUnit, item.amount, item.id, isQb, onListUpdated]);

    const handleDelete = useCallback(async () => {
        setIsProcessing(true);
        const savePromise = async () => {
            try {
                await shoppingListService.deleteShoppingListItem(item.id);
                onListUpdated(false);
            } finally {
                setIsProcessing(false);
            }
        };
        toast.promise(savePromise(), {
            loading: "Eliminazione in corso...",
            success: "Voce eliminata.",
            error: (error) => `Errore: ${error?.message || error}`
        });
    }, [item.id, onListUpdated]);

    return (
        <div className="group flex items-center justify-between p-3 rounded-xl border border-border/50 bg-background hover:border-primary/30 transition-colors gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <button
                    onClick={onPurchaseRequest}
                    className="w-6 h-6 rounded border-2 border-muted-foreground hover:border-emerald-500 hover:text-emerald-500 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                    title="Spunta articolo (Sposta in Dispensa)"
                >
                    <FiCheck className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                </button>
                <span className="text-base font-semibold text-foreground truncate" title={item.ingredientName}>
                    {item.ingredientName}
                </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                {isQb ? (
                    <div className="flex items-center justify-center bg-secondary/10 rounded-lg h-10 px-4 border border-border/50">
                        <span className="text-sm font-bold text-muted-foreground">q.b.</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1 bg-secondary/20 rounded-lg p-1 pr-3 border border-border/50">
                        <InputText
                            type="number"
                            step="0.1"
                            min="0"
                            value={displayAmount}
                            onChange={(e) => setDisplayAmount(e.target.value)}
                            onBlur={handleAmountUpdate}
                            className="w-14 sm:w-16 h-8 text-center bg-transparent border-none focus-visible:ring-0 text-sm font-bold p-0 shadow-none"
                        />
                        <span className="text-xs font-bold text-muted-foreground w-6 text-left truncate">
                            {displayUnit}
                        </span>
                    </div>
                )}
                <button
                    onClick={handleDelete}
                    disabled={isProcessing}
                    className={cn(
                        "text-muted-foreground hover:text-destructive transition-colors p-2 rounded-md hover:bg-destructive/10 cursor-pointer shrink-0",
                        isProcessing && "opacity-50 cursor-not-allowed"
                    )}
                    title="Elimina voce"
                >
                    <FiTrash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
});

ShoppingListItemRow.displayName = "ShoppingListItemRow";

export default ShoppingListItemRow;