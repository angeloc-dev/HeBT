import { type ReactElement, useState, useMemo } from "react";
import type { Recipe, PantryItem } from "@/model/data-model.ts";
import CustomButton from "../ui/CustomButton.tsx";
import Select from "@/components/ui/Select.tsx";
import { FiArrowLeft, FiCheckCircle, FiAlertTriangle } from "react-icons/fi";
import { cn } from "@/lib/utils.ts";
import { GUEST_OPTIONS, formatRecipeIngredient } from "@/model/constants.ts";

interface CookingModeProps {
    recipe: Recipe;
    pantryItems: PantryItem[];
    onExit: () => void;
    onConfirm: (recipeId: number, guests: number) => void;
}

export default function CookingMode({ recipe, pantryItems, onExit, onConfirm }: CookingModeProps): ReactElement {
    const [guests, setGuests] = useState<number | "">("");
    const [isConfirming, setIsConfirming] = useState<boolean>(false);

    const inventory = useMemo(() => {
        const map = new Map<string, number>();
        pantryItems.forEach(item => {
            const name = item.ingredientName.toLowerCase().trim();
            const current = map.get(name) || 0;
            map.set(name, current + item.currentAmount);
        });
        return map;
    }, [pantryItems]);

    const { ingredientStatus, maxPossibleGuests, canCook } = useMemo(() => {
        let maxGuests = Infinity;
        let allAvailable = true;
        const multiplier = guests === "" ? 1 : guests;

        const status = recipe.ingredients?.map(ing => {
            const baseAmount = Number(ing.amount);
            const requiredAmount = baseAmount * multiplier;
            const isQb = ing.unit === "qb";
            const invName = ing.ingredientName.toLowerCase().trim();
            const availableAmount = inventory.get(invName) || 0;

            if (!isQb && baseAmount > 0) {
                const possibleForThis = Math.floor(availableAmount / baseAmount);
                if (possibleForThis < maxGuests) {
                    maxGuests = possibleForThis;
                }
            }

            const hasEnough = isQb || availableAmount >= requiredAmount;
            if (!hasEnough) allAvailable = false;

            return {
                ...ing,
                requiredAmount,
                availableAmount,
                hasEnough,
                isQb
            };
        }) || [];
        if (maxGuests === Infinity) maxGuests = 10;

        return {
            ingredientStatus: status,
            maxPossibleGuests: Math.max(0, maxGuests),
            canCook: guests !== "" && allAvailable
        };
    }, [recipe.ingredients, guests, inventory]);

    const handleConfirm = () => {
        if (!canCook || guests === "") return;
        setIsConfirming(true);
        onConfirm(recipe.id, guests);
    };

    return (
        <div className="flex flex-col gap-8 bg-background/50 rounded-3xl p-4 sm:p-8 border border-border/50 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <button
                    onClick={onExit}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 hover:text-amber-600 transition-colors font-bold cursor-pointer"
                >
                    <FiArrowLeft className="w-5 h-5" /> Esci
                </button>
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                            Ospiti
                        </span>
                        <span className={cn(
                            "text-[10px] font-black uppercase mt-0.5",
                            maxPossibleGuests === 0 ? "text-destructive" : "text-emerald-500"
                        )}>
                            Max {maxPossibleGuests} {maxPossibleGuests === 1 ? 'porzione' : 'porzioni'}
                        </span>
                    </div>
                    <div className="w-32">
                        <Select
                            options={GUEST_OPTIONS}
                            value={guests}
                            onChange={(val) => setGuests(Number(val))}
                            placeholder="Seleziona..."
                        />
                    </div>
                </div>
            </div>
            <div className="text-center">
                <h1 className="text-4xl sm:text-5xl font-black text-foreground mb-4">{recipe.title}</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Prepara gli ingredienti sul piano di lavoro e segui le istruzioni.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                <div className="bg-card rounded-2xl p-6 border border-border shadow-sm h-fit">
                    <h2 className="text-2xl font-bold text-primary mb-6 border-b border-primary/20 pb-2">
                        Da preparare
                    </h2>
                    <ul className="flex flex-col gap-3">
                        {ingredientStatus.map((ing, i) => (
                            <li key={i} className="flex flex-col gap-1 border-b border-border/30 last:border-0 pb-3 last:pb-0">
                                <div className="flex justify-between items-center text-lg">
                                    <span className={cn(
                                        "font-semibold",
                                        !ing.hasEnough && guests !== "" ? "text-destructive" : "text-foreground"
                                    )}>
                                        {ing.ingredientName}
                                    </span>
                                    <span className={cn(
                                        "font-black px-3 py-1 rounded-lg text-sm sm:text-base",
                                        !ing.hasEnough && guests !== ""
                                            ? "text-destructive bg-destructive/10"
                                            : "text-primary bg-primary/10"
                                    )}>
                                        {formatRecipeIngredient(ing.requiredAmount, ing.unit, ing.ingredientName)}
                                    </span>
                                </div>
                                {!ing.hasEnough && guests !== "" && (
                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-destructive/80 bg-destructive/5 p-2 rounded-md mt-1">
                                        <FiAlertTriangle className="w-4 h-4 shrink-0" />
                                        <span>
                                            Disponibili: {formatRecipeIngredient(ing.availableAmount, ing.unit, ing.ingredientName)}{" "}
                                            (mancano {formatRecipeIngredient(ing.requiredAmount - ing.availableAmount, ing.unit, ing.ingredientName)})
                                        </span>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-card rounded-2xl p-6 border border-border shadow-sm h-fit">
                    <h2 className="text-2xl font-bold text-foreground mb-6 border-b border-border/50 pb-2">
                        Procedimento
                    </h2>
                    <div className="text-foreground/90 text-lg leading-loose whitespace-pre-wrap font-medium">
                        {recipe.instructions || "Nessuna istruzione fornita."}
                    </div>
                </div>
            </div>
            <div className="mt-8 flex justify-center border-t border-border/50 pt-8">
                <CustomButton
                    onClick={handleConfirm}
                    disabled={!canCook || isConfirming}
                    className={cn(
                        "w-full sm:w-auto h-16 px-12 transition-all duration-300 rounded-2xl border-none",
                        canCook && !isConfirming
                            ? "bg-emerald-500 hover:bg-emerald-600 hover:scale-105 shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                            : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                    )}
                >
                    <span className="flex items-center justify-center gap-3 text-xl sm:text-2xl font-black">
                        {canCook && !isConfirming && <FiCheckCircle className="w-8 h-8" />}
                        {isConfirming
                            ? "Svuotamento Dispensa..."
                            : !canCook && guests !== ""
                                ? "Ingredienti Insufficienti"
                                : "Conferma Cottura"}
                    </span>
                </CustomButton>
            </div>
        </div>
    );
}