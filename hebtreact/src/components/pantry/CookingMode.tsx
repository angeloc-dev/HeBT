import { type ReactElement, useState, useMemo } from "react";
import type { Recipe } from "@/model/data-model.ts";
import CustomButton from "../ui/CustomButton.tsx";
import Select from "@/components/ui/Select.tsx";
import { FiArrowLeft, FiCheckCircle } from "react-icons/fi";
import { cn } from "@/lib/utils.ts";

const GUEST_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1} ${i === 0 ? "persona" : "persone"}`
}));

const formatUnit = (amount: number, unit: string) => {
    if (unit === "qb") return "q.b.";
    if (unit === "tbsp") return amount === 1 ? "cucchiaio" : "cucchiai";
    if (unit === "tsp") return amount === 1 ? "cucchiaino" : "cucchiaini";
    return unit;
};

interface CookingModeProps {
    recipe: Recipe;
    onExit: () => void;
    onConfirm: (recipeId: number, guests: number) => void;
}

export default function CookingMode({ recipe, onExit, onConfirm }: CookingModeProps): ReactElement {
    const [guests, setGuests] = useState<number | "">("");
    const [isConfirming, setIsConfirming] = useState<boolean>(false);

    const handleConfirm = () => {
        if (guests === "") return;
        setIsConfirming(true);
        onConfirm(recipe.id, guests);
    };

    const isReadyToCook = useMemo(() => guests !== "", [guests]);

    return (
        <div className="flex flex-col gap-8 bg-background/50 rounded-3xl p-4 sm:p-8 border border-border/50 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <button
                    onClick={onExit}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 hover:text-amber-600 transition-colors font-bold cursor-pointer"
                >
                    <FiArrowLeft className="w-5 h-5" /> Esci dalla Cottura
                </button>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                        Ospiti:
                    </span>
                    <div className="w-40">
                        <Select
                            options={GUEST_OPTIONS}
                            value={guests}
                            onChange={(val) => setGuests(Number(val))}
                            placeholder="Quanti siete?"
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
                    <ul className="flex flex-col gap-4">
                        {recipe.ingredients?.map((ing, i) => {
                            const multiplier = guests === "" ? 1 : (guests as number);
                            const finalAmount = Number(ing.amount) * multiplier;

                            return (
                                <li key={i} className="flex justify-between items-center text-lg">
                                    <span className="font-semibold text-foreground">{ing.ingredientName}</span>
                                    <span className="font-black text-primary bg-primary/10 px-3 py-1 rounded-lg">
                                        {ing.unit === "qb" ? "q.b." : `${finalAmount} ${formatUnit(finalAmount, ing.unit)}`}
                                    </span>
                                </li>
                            );
                        })}
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
                    disabled={!isReadyToCook || isConfirming}
                    className={cn(
                        "w-full sm:w-auto h-16 px-12 transition-all duration-300 rounded-2xl border-none",
                        isReadyToCook && !isConfirming
                            ? "bg-emerald-500 hover:bg-emerald-600 hover:scale-105 shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                            : "bg-muted cursor-not-allowed opacity-50"
                    )}
                >
                    <span className={cn("flex items-center justify-center gap-3 text-2xl font-black", isReadyToCook ? "text-white" : "text-muted-foreground")}>
                        <FiCheckCircle className="w-8 h-8" />
                        {isConfirming ? "Svuotamento Dispensa..." : "Conferma Cottura"}
                    </span>
                </CustomButton>
            </div>

        </div>
    );
}