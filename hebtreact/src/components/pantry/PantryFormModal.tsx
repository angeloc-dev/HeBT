import { type ReactElement, useState, useMemo, useCallback } from "react";
import { FiX, FiCheck } from "react-icons/fi";
import type { PantryItem } from "@/model/data-model.ts";
import { pantryService } from "@/services/pantryService.ts";
import InputText from "@/components/ui/InputText.tsx";
import Select from "@/components/ui/Select.tsx";
import CustomButton from "../ui/CustomButton.tsx";
import {UNIT_GROUPS, SHOPPING_SECTION_GROUPS, formatExpirationDateForInput} from "@/model/constants.ts";
import { cn } from "@/lib/utils.ts";
import {toast} from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover.tsx";
import { Button } from "../ui/button.tsx";
import { Calendar } from "../ui/calendar.tsx";
import { format, parseISO } from "date-fns";
import { it } from "date-fns/locale";

interface PantryFormModalProps {
    isOpen: boolean;
    existingItem?: PantryItem | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function PantryFormModal({ isOpen, existingItem, onClose, onSuccess }: PantryFormModalProps): ReactElement | null {
    const [name, setName] = useState<string>(existingItem ? existingItem.ingredientName : "");
    const [amount, setAmount] = useState<number | string>(existingItem ? existingItem.currentAmount : "");
    const [unit, setUnit] = useState<string>(existingItem ? existingItem.unit : "");
    const [category, setCategory] = useState<string>(existingItem ? (existingItem.category || "") : "");
    const [expirationDate, setExpirationDate] = useState<string>(() => {
        if (existingItem) return formatExpirationDateForInput(existingItem.expirationDate);
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 7);
        return formatExpirationDateForInput(targetDate);
    });
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isDateOpen, setIsDateOpen] = useState<boolean>(false);

    const isFormValid = useMemo(() => {
        return (
            name.trim() !== "" &&
            unit !== "" &&
            category !== "" &&
            expirationDate !== "" &&
            amount !== "" &&
            Number(amount) > 0
        );
    }, [name, amount, unit, category, expirationDate]);

    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!isFormValid) return;
        setIsSaving(true);

        const payload: PantryItem = {
            id: existingItem ? existingItem.id : 0,
            ingredientId: existingItem ? existingItem.ingredientId : 0,
            ingredientName: name.trim(),
            category: category,
            currentAmount: Number(amount),
            unit: unit,
            expirationDate: new Date(expirationDate),
            purchaseDate: existingItem ? new Date(existingItem.purchaseDate) : new Date()
        };

        const savePromise = async () => {
            try {
                if (existingItem && existingItem.id) {
                    await pantryService.updatePantryItem(existingItem.id, payload);
                } else {
                    await pantryService.addPantryItem(payload);
                }
                onSuccess();
            } finally {
                setIsSaving(false);
            }
        };

        toast.promise(savePromise(), {
            loading: "Aggiorno la dispensa...",
            success: existingItem
                ? "Ingrediente aggiornato correttamente!"
                : "Ingrediente aggiunto alla dispensa!",
            error: (error) => `Errore durante il salvataggio: ${error?.message || error}`,
        });
    }, [isFormValid, existingItem, name, category, amount, unit, expirationDate, onSuccess]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl p-6 flex flex-col gap-6 animate-in zoom-in-95 duration-200 overflow-visible">
                <div className="flex justify-between items-start border-b border-border/50 pb-3">
                    <div>
                        <h3 className="text-xl font-bold text-foreground">
                            {existingItem ? "Modifica Ingrediente" : "Nuovo Ingrediente"}
                        </h3>
                        <p className="text-muted-foreground text-xs mt-1">
                            {existingItem ? "Aggiorna la quantità o la scadenza del lotto." : "Inserisci un alimento presente nella tua dispensa reale."}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 transition-colors cursor-pointer">
                        <FiX className="w-5 h-5" />
                    </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <label className="text-xs font-bold text-foreground ml-1">Nome Alimento *</label>
                        <InputText
                            placeholder="es. Farina di grano tenero"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={!!existingItem}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-foreground ml-1">Quantità *</label>
                        <InputText
                            type="number"
                            step="0.1"
                            min="0"
                            placeholder="0.0"
                            value={amount}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (Number(val) >= 0) setAmount(val);
                            }}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5 relative">
                        <label className="text-xs font-bold text-foreground ml-1">Unità *</label>
                        <Select
                            groups={UNIT_GROUPS}
                            value={unit}
                            onChange={(val) => setUnit(String(val))}
                            placeholder="Seleziona..."
                        />
                    </div>
                    <div className="flex flex-col gap-1.5 sm:col-span-2 relative">
                        <label className="text-xs font-bold text-foreground ml-1">Reparto / Categoria *</label>
                        <Select
                            groups={SHOPPING_SECTION_GROUPS}
                            value={category}
                            onChange={(val) => setCategory(String(val))}
                            placeholder="Seleziona il reparto..."
                        />
                    </div>
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <label className="text-xs font-bold text-foreground ml-1">Data di Scadenza *</label>
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
                                            setIsDateOpen(false);
                                        }
                                    }}
                                    locale={it}
                                    disabled={{ before: today }}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                <div className="flex justify-end gap-3 pt-3 border-t border-border/50">
                    <CustomButton variant="ghost" onClick={onClose} className="h-11 px-5">
                        Annulla
                    </CustomButton>
                    <CustomButton
                        onClick={handleSubmit}
                        disabled={!isFormValid || isSaving}
                        className={cn(
                            "h-11 px-6 border-none transition-all duration-200",
                            isFormValid && !isSaving
                                ? "bg-emerald-500 hover:bg-emerald-600 text-white hover:scale-105 shadow-md shadow-emerald-500/10"
                                : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                        )}
                    >
                        <span className="flex items-center justify-center gap-2 text-sm font-bold">
                            <FiCheck className="w-4 h-4 shrink-0" />
                            {isSaving ? "Salvataggio..." : "Conferma e Salva"}
                        </span>
                    </CustomButton>
                </div>
            </div>
        </div>
    );
}