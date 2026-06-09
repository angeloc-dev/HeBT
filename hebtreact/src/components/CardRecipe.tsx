import { type ReactElement } from "react";
import type { Recipe } from "../model/data-model";
import { FiImage } from "react-icons/fi";

interface CardRecipeProps {
    recipe: Recipe;
}

function CardRecipe({ recipe }: CardRecipeProps): ReactElement {
    return (
        <div className="relative h-64 w-full rounded-2xl overflow-hidden group cursor-pointer pointer-events-auto border border-border/50 shadow-lg bg-card">
            {recipe.image ? (
                <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
            ) : (
                <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-secondary/10 to-background/80 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                    <FiImage className="w-12 h-12 text-muted-foreground/30" />
                </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-2 transition-transform duration-300 transform translate-y-2 group-hover:translate-y-0">
                <h3 className="text-lg font-bold text-white leading-tight">
                    {recipe.title}
                </h3>
            </div>

        </div>
    );
}

export default CardRecipe;