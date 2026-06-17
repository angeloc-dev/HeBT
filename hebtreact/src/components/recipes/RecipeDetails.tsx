import { type ReactElement, useState, useEffect } from "react";
import type { Recipe, PantryItem } from "@/model/data-model.ts";
import { FiArrowLeft, FiEdit2, FiTrash2 } from "react-icons/fi";
import { cn } from "@/lib/utils.ts";
import { pantryService } from "@/services/pantryService.ts";
import { toast } from "sonner";
import { formatRecipeIngredient } from "@/model/constants.ts";

interface RecipeDetailProps {
    recipe: Recipe;
    onBack: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

export default function RecipeDetail({ recipe, onBack, onEdit, onDelete }: RecipeDetailProps): ReactElement {
    const [, setPantryItems] = useState<PantryItem[]>([]);
    const [, setIsLoadingPantry] = useState<boolean>(true);

    useEffect(() => {
        const fetchPantry = async () => {
            try {
                const data = await pantryService.getPantry();
                setPantryItems(data);
            } catch (error) {
                toast.error(`Errore nel caricamento della dispensa: ${error}`);
            } finally {
                setIsLoadingPantry(false);
            }
        };
        fetchPantry();
    }, []);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center bg-background/50 backdrop-blur-sm p-3 rounded-2xl border border-border/50">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium cursor-pointer pl-2"
                >
                    <FiArrowLeft className="w-5 h-5" /> Torna al ricettario
                </button>
                <div className="flex items-center gap-3 pr-1">
                    <button
                        onClick={onEdit}
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors border border-secondary/20 cursor-pointer"
                        title="Modifica Ricetta"
                    >
                        <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onDelete}
                        disabled={recipe.isInMealPlan}
                        className={cn(
                            "h-10 w-10 flex items-center justify-center rounded-xl transition-colors border",
                            recipe.isInMealPlan
                                ? "bg-muted text-muted-foreground border-border/50 cursor-not-allowed opacity-40"
                                : "bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20 cursor-pointer"
                        )}
                        title={recipe.isInMealPlan ? "Impossibile eliminare: inserita a piano pasti." : "Elimina Ricetta"}
                    >
                        <FiTrash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-y-8 lg:gap-8 lg:items-start">
                <div className="contents lg:flex lg:flex-col lg:col-span-5 gap-8">
                    <div className="order-2 lg:order-none w-full h-72 md:h-96 rounded-2xl overflow-hidden border border-border/50 shadow-lg shrink-0">
                        {recipe.image ? (
                            <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-secondary/10 flex items-center justify-center">
                                <span className="text-muted-foreground">Nessuna immagine</span>
                            </div>
                        )}
                    </div>
                    <div className="order-3 lg:order-none bg-background rounded-2xl border border-border/50 p-6 shadow-sm">
                        <h3 className="text-xl font-bold text-foreground mb-4 border-b border-border/50 pb-2">Ingredienti</h3>
                        {recipe.ingredients && recipe.ingredients.length > 0 ? (
                            <ul className="flex flex-col gap-3">
                                {recipe.ingredients.map((ing, i) => (
                                    <li key={i} className="group flex justify-between items-start sm:items-center p-3 rounded-lg hover:bg-secondary/5 transition-colors border-b border-border/30 last:border-0 gap-4">
                                        <div className="flex-1 min-w-0 leading-tight">
                                            <span className="font-semibold text-foreground break-words mr-2 align-middle">
                                                {ing.ingredientName}
                                            </span>
                                            {ing.section && (
                                                <span className="inline-block align-middle text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-secondary/20 px-2 py-0.5 rounded-md mb-0.5">
                                                    {ing.section}
                                                </span>
                                            )}
                                        </div>
                                        <span className="font-bold text-primary shrink-0 whitespace-nowrap text-right mt-1 sm:mt-0">
                                            {formatRecipeIngredient(Number(ing.amount), ing.unit, ing.ingredientName)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted-foreground italic">Nessun ingrediente specificato.</p>
                        )}
                    </div>
                </div>
                <div className="contents lg:flex lg:flex-col lg:col-span-7 gap-8">
                    <div className="order-1 lg:order-none flex flex-col gap-4 bg-background rounded-2xl border border-border/50 p-6 shadow-sm">
                        <h1 className="text-3xl font-bold text-foreground">{recipe.title}</h1>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            {recipe.description || "Nessuna descrizione disponibile per questo piatto."}
                        </p>
                    </div>
                    <div className="order-4 lg:order-none bg-background rounded-2xl border border-border/50 p-6 shadow-sm">
                        <h3 className="text-xl font-bold text-foreground mb-4 border-b border-border/50 pb-2">Procedimento</h3>
                        <div className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
                            {recipe.instructions || "Istruzioni non fornite."}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}