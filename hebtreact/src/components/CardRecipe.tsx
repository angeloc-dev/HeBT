import { type ReactElement } from "react";
import type { Recipe } from "../model/data-model";

interface CardRecipeProps {
    recipe: Recipe;
}

function CardRecipe({ recipe }: CardRecipeProps): ReactElement {
    return (
        <div className="relative h-64 w-full rounded-2xl overflow-hidden group cursor-pointer border border-border/50 shadow-lg">
            <img
                src={recipe.image}
                alt={recipe.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
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