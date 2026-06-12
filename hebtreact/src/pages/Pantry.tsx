import { type ReactElement, useState, useCallback, useEffect } from "react";
import { pantryService } from "@/services/pantryService.ts";
import { recipeService } from "@/services/recipeService.ts";
import type { PantryItem, Recipe } from "@/model/data-model.ts";
import Container from "@/components/ui/Container.tsx";
import PageHeader from "@/components/PageHeader.tsx";
import CustomButton from "../components/ui/CustomButton.tsx";
import { FiPlus } from "react-icons/fi";
import {mealPlannerService} from "@/services/mealPlannerService.ts";
import CookingMode from "@/components/pantry/CookingMode.tsx";
import PantryList from "@/components/pantry/PantryList.tsx";
import PantryFormModal from "@/components/pantry/PantryFormModal.tsx";
import SuggestedRecipes from "@/components/pantry/SuggestedRecipe.tsx";

export default function Pantry(): ReactElement {
    const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [cookingRecipe, setCookingRecipe] = useState<Recipe | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [pantryData, recipesData] = await Promise.all([
                pantryService.getPantry(),
                recipeService.getAllRecipes()
            ]);
            setPantryItems(pantryData);
            setRecipes(recipesData);
        } catch (error) {
            toast.error(`Errore nel caricamento dei dati: ${error}`);
        } finally {
            setIsLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        const loadInitialData = async () => {
            await fetchData();
        };

        loadInitialData();
    }, [fetchData]);

    const handleStartCooking = useCallback((recipe: Recipe) => {
        setCookingRecipe(recipe);
    }, []);

    const handleConfirmCooking = useCallback(async (mealPlanId: number, guests: number) => {
        try {
            await mealPlannerService.confirmMealCooked(mealPlanId, guests);
            await fetchData();
            setCookingRecipe(null);
            addToast("Piatto cucinato con successo! Dispensa aggiornata.", "success");
        } catch (error) {
            addToast(`Errore: ${error}`, "error");
        }
    }, [fetchData, addToast]);

    if (cookingRecipe) {
        return (
            <div className="py-6 max-w-4xl mx-auto px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CookingMode
                    recipe={cookingRecipe}
                    onExit={() => setCookingRecipe(null)}
                    onConfirm={handleConfirmCooking}
                />
            </div>
        );
    }
    return (
        <div className="flex flex-col gap-8 py-6 max-w-7xl mx-auto px-4 animate-in fade-in duration-300">
            <PageHeader
                title="La Tua Dispensa"
                description="Gestisci gli ingredienti a casa, monitora le scadenze e scopri cosa cucinare oggi."
                action={
                    <CustomButton
                        onClick={() => setIsAddModalOpen(true)}
                        className="w-full md:w-auto h-12 px-6 bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 border-none transition-all hover:scale-105"
                    >
                        <span className="flex items-center justify-center gap-2 text-base font-bold">
                            <FiPlus className="w-5 h-5" /> Aggiungi Ingrediente
                        </span>
                    </CustomButton>
                }
            />
            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7 w-full flex flex-col gap-6">
                    <Container>
                        <h2 className="text-xl font-bold mb-4 text-foreground border-b border-border/50 pb-2">
                            Ingredienti Disponibili
                        </h2>
                        <PantryList
                            items={pantryItems}
                            isLoading={isLoading}
                            onPantryUpdated={fetchData}
                        />
                    </Container>
                </div>
                <div className="lg:col-span-5 w-full flex flex-col gap-6 sticky top-6">
                    <Container>
                        <h2 className="text-xl font-bold mb-4 text-foreground border-b border-border/50 pb-2">
                            Ricette Suggerite
                        </h2>
                        <SuggestedRecipes
                            recipes={recipes}
                            pantryItems={pantryItems}
                            isLoading={isLoading}
                            onCook={handleStartCooking}
                        />
                    </Container>
                </div>
            </div>
            {isAddModalOpen && (
                <PantryFormModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSuccess={() => {
                        setIsAddModalOpen(false);
                        fetchData();
                    }}
                />
            )}
        </div>
    );
}