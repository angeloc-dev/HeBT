import { type ReactElement, useMemo, useState, useCallback } from "react";
import Button from "@/components/ui/Button.tsx";
import InputText from "@/components/ui/InputText.tsx";
import { FiPlus, FiTrash2, FiShoppingCart, FiX, FiClock } from "react-icons/fi";
import type { ShoppingListItem } from "@/model/data-model.ts";
import { shoppingListService } from "@/services/shoppingListService.ts";
import { useToast } from "@/hooks/useToast.ts";
import ShoppingListItemRow from "@/components/planner/ShoppingListItemRow.tsx";
import AddManualItemModal from "@/components/planner/AddManualItemModal.tsx";
import ConfirmModal from "@/components/ui/ConfirmModal.tsx";
import { cn } from "@/lib/utils.ts";

interface ShoppingListViewProps {
    shoppingList: ShoppingListItem[];
    onListUpdated: () => void;
    searchQuery: string;
}

export default function ShoppingListView({ shoppingList, onListUpdated, searchQuery }: ShoppingListViewProps): ReactElement {
    const { addToast } = useToast();
    const [isClearing, setIsClearing] = useState<boolean>(false);
    const [itemToPurchase, setItemToPurchase] = useState<ShoppingListItem | null>(null);
    const [expirationDate, setExpirationDate] = useState<string>("");
    const [isPurchasing, setIsPurchasing] = useState<boolean>(false);
    const [isManualAddOpen, setIsManualAddOpen] = useState<boolean>(false);
    const [isConfirmClearOpen, setIsConfirmClearOpen] = useState<boolean>(false);

    const groupedList = useMemo(() => {
        const groups: Record<string, ShoppingListItem[]> = {};
        const filteredList = searchQuery.trim()
            ? shoppingList.filter(item => item.ingredientName.toLowerCase().includes(searchQuery.toLowerCase()))
            : shoppingList;

        filteredList.forEach(item => {
            const cat = item.category || "Altro";
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(item);
        });

        return Object.keys(groups).sort().reduce((acc, key) => {
            acc[key] = groups[key];
            return acc;
        }, {} as Record<string, ShoppingListItem[]>);
    }, [shoppingList, searchQuery]);

    const filteredCount = useMemo(() => {
        return Object.values(groupedList).reduce((total, items) => total + items.length, 0);
    }, [groupedList]);

    const handleClearListClick = useCallback(() => {
        setIsConfirmClearOpen(true);
    }, []);

    const handleConfirmClearList = useCallback(async () => {
        setIsConfirmClearOpen(false);
        setIsClearing(true);
        try {
            await shoppingListService.clearShoppingList();
            onListUpdated();
            addToast("Lista della spesa svuotata con successo!", "success");
        } catch (error) {
            addToast(`Errore nello svuotare la lista: ${error}`, "error");
        } finally {
            setIsClearing(false);
        }
    }, [onListUpdated, addToast]);

    const handleInitiatePurchase = useCallback((item: ShoppingListItem) => {
        setItemToPurchase(item);
        setExpirationDate("");
    }, []);

    const handleConfirmPurchase = useCallback(async () => {
        if (!itemToPurchase) return;
        setIsPurchasing(true);
        try {
            const expDate = expirationDate ? new Date(expirationDate) : undefined;
            await shoppingListService.purchaseShoppingListItem(itemToPurchase.id, expDate);
            onListUpdated();
            setItemToPurchase(null);
        } catch (error) {
            addToast(`Errore durante l'acquisto dell'articolo: ${error}`, "error");
        } finally {
            setIsPurchasing(false);
        }
    }, [itemToPurchase, expirationDate, onListUpdated]);

    if (shoppingList.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-20 mt-4 animate-in fade-in zoom-in-95 bg-background/30 rounded-2xl border border-dashed border-border/50">
                <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center text-muted-foreground">
                    <FiShoppingCart className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-foreground">La lista è vuota</h3>
                <p className="text-muted-foreground text-center max-w-sm">
                    Non hai ancora pianificato la spesa o hai acquistato tutto. Vai al Calendario per generarla o aggiungi articoli manualmente.
                </p>
                <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => setIsManualAddOpen(true)}
                >
                    <FiPlus className="w-4 h-4" /> Aggiunta Manuale
                </Button>
                {isManualAddOpen && (
                    <AddManualItemModal
                        isOpen={isManualAddOpen}
                        onClose={() => setIsManualAddOpen(false)}
                        onSuccess={() => {
                            setIsManualAddOpen(false);
                            onListUpdated();
                        }}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out flex flex-col gap-6 mt-2">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                <h2 className="text-2xl font-bold text-foreground">
                    Da Acquistare <span className="text-muted-foreground text-lg font-medium ml-1">
                        ({filteredCount}{searchQuery.trim() ? ` di ${shoppingList.length}` : ''})
                    </span>
                </h2>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button
                        variant="destructive"
                        onClick={handleClearListClick}
                        disabled={isClearing}
                        className="flex-1 md:flex-none"
                    >
                        <FiTrash2 className="w-4 h-4" />
                        {isClearing ? "Svuotamento..." : "Svuota Lista"}
                    </Button>
                    <Button
                        variant="secondary"
                        className="flex-1 md:flex-none text-foreground"
                        onClick={() => setIsManualAddOpen(true)}
                    >
                        <FiPlus className="w-4 h-4" /> Manuale
                    </Button>
                </div>
            </div>
            <div className="flex flex-col bg-background/50 border border-border/50 p-4 md:p-6 rounded-2xl shadow-sm">
                {filteredCount === 0 && searchQuery.trim() !== "" ? (
                    <div className="py-8 text-center text-muted-foreground italic">
                        Nessun ingrediente trovato per "{searchQuery}"
                    </div>
                ) : (
                    Object.entries(groupedList).map(([category, items], index) => (
                        <div
                            key={category}
                            className={cn(
                                "flex flex-col gap-3",
                                index > 0 && "mt-6 pt-6 border-t border-border/30"
                            )}
                        >
                            <h3 className="text-sm font-black text-primary uppercase tracking-widest">
                                {category}
                            </h3>
                            <div className="flex flex-col gap-2">
                                {items.map(item => (
                                    <ShoppingListItemRow
                                        key={item.id}
                                        item={item}
                                        onPurchaseRequest={() => handleInitiatePurchase(item)}
                                        onListUpdated={onListUpdated}
                                    />
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
            {itemToPurchase && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6 flex flex-col gap-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-foreground">Sposta in Dispensa</h3>
                                <p className="text-muted-foreground text-sm mt-1">
                                    Stai spuntando <strong>{itemToPurchase.amount} {itemToPurchase.unit} di {itemToPurchase.ingredientName}</strong>.
                                </p>
                            </div>
                            <button onClick={() => setItemToPurchase(null)} className="text-muted-foreground hover:text-foreground">
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <FiClock className="text-primary" /> Data di Scadenza (Opzionale)
                            </label>
                            <InputText
                                type="date"
                                value={expirationDate}
                                onChange={e => setExpirationDate(e.target.value)}
                            />
                            <span className="text-xs text-muted-foreground">
                                Se lasciata vuota, il sistema imposterà una scadenza standard di 7 giorni.
                            </span>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="ghost" onClick={() => setItemToPurchase(null)}>
                                Annulla
                            </Button>
                            <Button
                                onClick={handleConfirmPurchase}
                                disabled={isPurchasing}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white border-none"
                            >
                                {isPurchasing ? "Salvataggio..." : "Conferma e Spunta"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            {isManualAddOpen && (
                <AddManualItemModal
                    isOpen={isManualAddOpen}
                    onClose={() => setIsManualAddOpen(false)}
                    onSuccess={() => {
                        setIsManualAddOpen(false);
                        onListUpdated();
                    }}
                />
            )}
            {isConfirmClearOpen && (
                <ConfirmModal
                    isOpen={isConfirmClearOpen}
                    title="Svuota Lista della Spesa"
                    message="Sei sicuro di voler svuotare l'intera lista della spesa? Questa azione non è reversibile e rimuoverà tutti gli articoli attuali."
                    confirmText="Svuota"
                    cancelText="Annulla"
                    isDestructive={true}
                    onConfirm={handleConfirmClearList}
                    onCancel={() => setIsConfirmClearOpen(false)}
                />
            )}
        </div>
    );
}