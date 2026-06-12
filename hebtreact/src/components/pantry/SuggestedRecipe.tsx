import { type ReactElement, useMemo } from "react";
import { FiPlayCircle } from "react-icons/fi";
import type { Recipe, PantryItem } from "@/model/data-model.ts";
import Button from "@/components/ui/Button.tsx";
import {PiChefHat} from "react-icons/pi";

interface SuggestedRecipesProps {
    recipes: Recipe[];
    pantryItems: PantryItem[];
    isLoading: boolean;
    onCook: (recipe: Recipe) => void;
}

export default function SuggestedRecipes({ recipes, pantryItems, isLoading, onCook }: SuggestedRecipesProps): ReactElement {
    const cookableRecipes = useMemo(() => {
        if (!recipes.length || !pantryItems.length) return [];
        const pantryTotals = new Map<string, number>();
        pantryItems.forEach(item => {
            const name = item.ingredientName.toLowerCase().trim();
            pantryTotals.set(name, (pantryTotals.get(name) || 0) + Number(item.currentAmount));
        });
        return recipes.filter(recipe => {
            if (!recipe.ingredients || recipe.ingredients.length === 0) return false;
            const canCook = recipe.ingredients.every(reqIng => {
                if (reqIng.unit === "qb") return true;
                const requiredAmount = Number(reqIng.amount);
                const availableAmount = pantryTotals.get(reqIng.ingredientName.toLowerCase().trim()) || 0;
                return availableAmount >= requiredAmount;
            });
            return canCook;
        });
    }, [recipes, pantryItems]);

    return (
        <div className="flex flex-col gap-4 w-full">
            {isLoading ? (
                <div className="flex flex-col gap-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="w-full h-24 bg-border/30 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : cookableRecipes.length > 0 ? (
                <div className="flex flex-col gap-3">
                    {cookableRecipes.map(recipe => (
                        <div
                            key={recipe.id}
                            className="group flex flex-col sm:flex-row items-center gap-4 p-3 bg-background rounded-2xl border border-border/50 hover:border-emerald-500/50 shadow-sm transition-colors"
                        >
                            <div className="w-full sm:w-24 h-24 rounded-xl overflow-hidden bg-secondary/10 shrink-0">
                                {recipe.image ? (
                                    <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                        <PiChefHat className="w-6 h-6 opacity-50" />
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col flex-1 w-full gap-2">
                                <h4 className="text-base font-bold text-foreground leading-tight line-clamp-2">
                                    {recipe.title}
                                </h4>
                                <Button
                                    onClick={() => onCook(recipe)}
                                    className="w-full sm:w-fit h-9 px-4 bg-emerald-500 hover:bg-emerald-600 text-white border-none mt-auto"
                                >
                                    <span className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                                        <FiPlayCircle className="w-4 h-4 shrink-0" /> Cucina Ora
                                    </span>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-background/30 rounded-2xl border border-dashed border-border/50">
                    <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center text-muted-foreground mb-4">
                        <PiChefHat className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-1">Niente di pronto</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                        Al momento non hai abbastanza ingredienti per completare al 100% nessuna delle tue ricette. Fai la spesa o aggiungi nuove ricette!
                    </p>
                </div>
            )}
        </div>
    );
}