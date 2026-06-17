import { type ReactElement, useState, useMemo, useCallback, useEffect } from "react";
import { pantryService } from "@/services/pantryService.ts";
import { recipeService } from "@/services/recipeService.ts";
import type { PantryItem, Recipe } from "@/model/data-model.ts";
import Container from "@/components/ui/Container.tsx";
import PageHeader from "@/components/PageHeader.tsx";
import CustomButton from "../components/ui/CustomButton.tsx";
import { FiPlus } from "react-icons/fi";
import CookingMode from "@/components/pantry/CookingMode.tsx";
import PantryList from "@/components/pantry/PantryList.tsx";
import PantryFormModal from "@/components/pantry/PantryFormModal.tsx";
import SuggestedRecipes from "@/components/pantry/SuggestedRecipe.tsx";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";

export default function Pantry(): ReactElement {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState("");

    const cookingRecipe = useMemo(() => {
        if (!id || recipes.length === 0) return null;
        return recipes.find(r => r.id === Number(id)) || null;
    }, [id, recipes]);

    const fetchData = useCallback(async (showLoader = true) => {
        const controller = new AbortController();
        if (showLoader) setIsLoading(true);

        try {
            const [pantryData, recipesData] = await Promise.all([
                pantryService.getPantry(controller.signal),
                recipeService.getAllRecipes(controller.signal)
            ]);
            setPantryItems(pantryData);
            setRecipes(recipesData);
        } catch (err) {
            if (err instanceof Error && err.name !== "CanceledError" && err.name !== "AbortError") {
                toast.error("Errore nel caricamento della dispensa");
            }
        } finally {
            if (showLoader) setIsLoading(false);
            controller.abort();
        }
    }, []);

    useEffect(() => {
        const loadInitialData = async () => {
            await fetchData(true);
        };
        loadInitialData();
    }, [fetchData]);

    useEffect(() => {
        if (id && recipes.length > 0 && !cookingRecipe) {
            toast.error("Ricetta non trovata");
            navigate('/pantry', { replace: true });
        }
    }, [id, recipes, cookingRecipe, navigate]);

    const handleStartCooking = useCallback((recipe: Recipe) => {
        navigate(`/pantry/to-cook/${recipe.id}`);
    }, [navigate]);

    const handleConfirmCooking = useCallback(async (recipeId: number, guests: number) => {
        setIsLoading(true);
        const savePromise = async () => {
            try {
                await recipeService.cookRecipeFree(recipeId, guests);
                await fetchData();
            } finally {
                setIsLoading(false);
                navigate(`/pantry`);
            }
        };
        toast.promise(savePromise(), {
            loading: "Aggiorno la dispensa...",
            success: "Piatto cucinato con successo! Dispensa aggiornata.",
            error: (error) => `Errore durante il salvataggio: ${error?.message || error}`,
        });
    }, [fetchData, navigate]);

    if (cookingRecipe) {
        return (
            <div className="py-6 max-w-4xl mx-auto px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CookingMode
                    recipe={cookingRecipe}
                    pantryItems={pantryItems}
                    onExit={() => navigate('/pantry', { replace: true })} // Semplificato
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
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Cerca ingredienti o categorie..."
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
                            onPantryUpdated={() => fetchData(false)}
                            searchQuery={searchQuery}
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