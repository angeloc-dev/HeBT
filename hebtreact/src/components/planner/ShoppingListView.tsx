import { type ReactElement, useMemo, useState, useCallback } from "react";
import CustomButton from "../ui/CustomButton.tsx";
import { FiPlus, FiTrash2, FiShoppingCart, FiX, FiClock } from "react-icons/fi";
import type { ShoppingListItem } from "@/model/data-model.ts";
import { shoppingListService } from "@/services/shoppingListService.ts";
import ShoppingListItemRow from "@/components/planner/ShoppingListItemRow.tsx";
import AddManualItemModal from "@/components/planner/AddManualItemModal.tsx";
import ConfirmModal from "@/components/ui/ConfirmModal.tsx";
import { cn } from "@/lib/utils.ts";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.tsx";
import { Button } from "@/components/ui/button.tsx";
import { format, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar.tsx";
import {CATEGORY_EXPIRATION_DAYS, getDefaultExpirationForCategory, SUPERMARKET_ORDER} from "@/model/constants.ts";

interface ShoppingListViewProps {
    shoppingList: ShoppingListItem[];
    onListUpdated: () => void;
    searchQuery: string;
}

export default function ShoppingListView({ shoppingList, onListUpdated, searchQuery }: ShoppingListViewProps): ReactElement {
    const [isClearing, setIsClearing] = useState<boolean>(false);
    const [itemToPurchase, setItemToPurchase] = useState<ShoppingListItem | null>(null);
    const [expirationDate, setExpirationDate] = useState<string>("");
    const [isPurchasing, setIsPurchasing] = useState<boolean>(false);
    const [isManualAddOpen, setIsManualAddOpen] = useState<boolean>(false);
    const [isConfirmClearOpen, setIsConfirmClearOpen] = useState<boolean>(false);
    const [isDateOpen, setIsDateOpen] = useState<boolean>(false);

    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

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
        const sortedCategories = Object.keys(groups).sort((a, b) => {
            const indexA = SUPERMARKET_ORDER.indexOf(a);
            const indexB = SUPERMARKET_ORDER.indexOf(b);
            const weightA = indexA === -1 ? 999 : indexA;
            const weightB = indexB === -1 ? 999 : indexB;

            if (weightA !== weightB) {
                return weightA - weightB;
            }
            return a.localeCompare(b);
        });
        return sortedCategories.reduce((acc, key) => {
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
        const savePromise = async () => {
            try {
                await shoppingListService.clearShoppingList();
                onListUpdated();
            } finally {
                setIsClearing(false);
            }
        };
        toast.promise(savePromise(), {
            loading: "Svuotamento della lista in corso...",
            success: "Lista della spesa svuotata con successo.",
            error: (error) => `Errore durante il salvataggio: ${error?.message || error}`
        });
    }, [onListUpdated]);

    const handleInitiatePurchase = useCallback((item: ShoppingListItem) => {
        setItemToPurchase(item);
        const suggestedDate = getDefaultExpirationForCategory(item.category || "Altro");
        setExpirationDate(format(suggestedDate, "yyyy-MM-dd"));
    }, []);

    const handleConfirmPurchase = useCallback(async () => {
        if (!itemToPurchase) return;
        const expDate = expirationDate ? new Date(expirationDate) : undefined;

        setIsPurchasing(true);
        const savePromise = async () => {
            try {
                await shoppingListService.purchaseShoppingListItem(itemToPurchase.id, expDate);
                onListUpdated();
                setItemToPurchase(null);
            } finally {
                setIsPurchasing(false);
            }
        };
        toast.promise(savePromise(), {
            loading: "Aggiungo l'articolo alla dispensa...",
            success: "Articolo aggiunto alla dispensa con successo.",
            error: (error) => `Errore durante il salvataggio: ${error?.message || error}`
        });
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
                <CustomButton
                    variant="outline"
                    className="mt-2"
                    onClick={() => setIsManualAddOpen(true)}
                >
                    <FiPlus className="w-4 h-4" /> Aggiunta Manuale
                </CustomButton>
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
                    <CustomButton
                        variant="destructive"
                        onClick={handleClearListClick}
                        disabled={isClearing}
                        className="flex-1 md:flex-none"
                    >
                        <FiTrash2 className="w-4 h-4" />
                        {isClearing ? "Svuotamento..." : "Svuota Lista"}
                    </CustomButton>
                    <CustomButton
                        variant="secondary"
                        className="flex-1 md:flex-none text-foreground"
                        onClick={() => setIsManualAddOpen(true)}
                    >
                        <FiPlus className="w-4 h-4" /> Manuale
                    </CustomButton>
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
                            <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal bg-background h-10",
                                            !expirationDate && "text-muted-foreground"
                                        )}
                                    >
                                        {expirationDate ? (
                                            format(parseISO(expirationDate), "PPP", { locale: it })
                                        ) : (
                                            <span>Seleziona una data</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 z-[100]" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={expirationDate ? parseISO(expirationDate) : undefined}
                                        onSelect={(date) => {
                                            if (date) {
                                                const formatted = format(date, "yyyy-MM-dd");
                                                setExpirationDate(formatted);
                                                if (expirationDate && parseISO(expirationDate) < date) {
                                                    setExpirationDate(formatted);
                                                }
                                                setIsDateOpen(false);
                                            }
                                        }}
                                        locale={it}
                                        disabled={{ before: today }}
                                    />
                                </PopoverContent>
                            </Popover>
                            <span className="text-xs text-muted-foreground">
                                Se lasciata vuota, il sistema imposterà una scadenza standard di {CATEGORY_EXPIRATION_DAYS[itemToPurchase.category]} giorni.
                            </span>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <CustomButton variant="ghost" onClick={() => setItemToPurchase(null)}>
                                Annulla
                            </CustomButton>
                            <CustomButton
                                onClick={handleConfirmPurchase}
                                disabled={isPurchasing}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white border-none"
                            >
                                {isPurchasing ? "Salvataggio..." : "Conferma e Spunta"}
                            </CustomButton>
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