import { type ReactElement, useCallback, useEffect, useState, useMemo } from "react";
import Container from "@/components/ui/Container.tsx";
import CardRecipe from "@/components/CardRecipe.tsx";
import type { Recipe } from "@/model/data-model.ts";
import { recipeService } from "@/services/recipeService.ts";
import {FiPlus, FiX, FiBook, FiTag, FiBookOpen} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import ConfirmModal from "@/components/ui/ConfirmModal.tsx";
import RecipeDetail from "../components/recipes/RecipeDetails.tsx";
import PageHeader from "@/components/PageHeader.tsx";
import RecipeForm from "../components/recipes/RecipeForm.tsx";
import {toast} from "sonner";

export default function Recipes(): ReactElement {
    const navigate = useNavigate();
    const { id } = useParams();
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
    const [isAddingRecipe, setIsAddingRecipe] = useState<boolean>(false);
    const [editingRecipeId, setEditingRecipeId] = useState<number | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);
    const selectedRecipe = id && recipes.length > 0
        ? recipes.find(r => r.id === Number(id)) || null
        : null;

    const recipeToEdit = editingRecipeId
        ? recipes.find(r => r.id === editingRecipeId) || null
        : null;

    const allKnownIngredients = Array.from(new Set(
        recipes.flatMap(r => r.ingredients?.map(i => i.ingredientName) || [])
    )).filter(Boolean);

    const searchSuggestions = useMemo(() => {
        if (!searchTerm.trim()) return [];
        const term = searchTerm.toLowerCase();
        const suggestions: { type: 'recipe' | 'ingredient', recipeId: number, text: string, subtext?: string }[] = [];

        recipes.forEach(r => {
            if (r.title.toLowerCase().includes(term)) {
                suggestions.push({ type: 'recipe', recipeId: r.id, text: r.title });
            }
            r.ingredients?.forEach(i => {
                if (i.ingredientName.toLowerCase().includes(term)) {
                    if (!suggestions.some(s => s.type === 'ingredient' && s.recipeId === r.id && s.text === i.ingredientName)) {
                        suggestions.push({ type: 'ingredient', recipeId: r.id, text: i.ingredientName, subtext: `in ${r.title}` });
                    }
                }
            });
        });
        return suggestions.slice(0, 6);
    }, [searchTerm, recipes]);

    const fetchRecipes = useCallback(async (showLoader = true) => {
        const controller = new AbortController();
        if (showLoader) setIsLoading(true);
        try {
            const data = await recipeService.getAllRecipes(controller.signal);
            setRecipes(data);
        } catch (err) {
            if (err instanceof Error && err.name !== "CanceledError" && err.name !== "AbortError") {
                toast.error("Errore nel caricamento del ricettario");
            }
        } finally {
            if (showLoader) setIsLoading(false);
            controller.abort();
        }
    }, []);

    useEffect(() => {
        const loadInitialData = async () => {
            await fetchRecipes(true);
        };

        loadInitialData();
    }, [fetchRecipes]);

    const handleSaveRecipe = useCallback(async (recipeData: Recipe, isEdit: boolean) => {
        setIsLoading(true);
        const savePromise = async () => {
            try {
                if (isEdit) {
                    await recipeService.editRecipe(recipeData.id, recipeData);
                } else {
                    await recipeService.createRecipe(recipeData);
                }
            } finally {
                setIsAddingRecipe(false);
                setEditingRecipeId(null);
                setIsLoading(false);
            }
        };
        toast.promise(savePromise(), {
            loading: "Aggiornamento della ricetta in corso...",
            success : isEdit ? "Ricetta aggiornata con successo!" : "Ricetta aggiunta con successo!",
            error: (error) => `Errore durante il salvataggio: ${error?.message || error}`
        });
    }, []);

    const confirmDelete = useCallback(async () => {
        if (!recipeToDelete) return;
        setIsLoading(true);

        const savePromise = async () => {
            try {
                await recipeService.deleteRecipe(recipeToDelete.id);
                await fetchRecipes(false);
                navigate(`/recipes`);
            } finally {
                setIsLoading(false);
            }
        };
        toast.promise(savePromise(), {
            loading: "Eliminazione della ricetta in corso...",
            success: "Ricetta eliminata con successo.",
            error: (error) => `Errore durante il salvataggio: ${error?.message || error}`
        });
    }, [fetchRecipes, navigate, recipeToDelete]);

    const handleOpenRecipe = (recipeId: number) => {
        setSearchTerm("");
        setIsSearchFocused(false);
        navigate(`/recipes/${recipeId}`);
    };

    const handleAddRecipe = () => {
        setEditingRecipeId(null);
        setIsAddingRecipe(true);
        navigate(`/recipes`);
    };

    const handleEditClick = () => {
        if (!selectedRecipe) return;
        setEditingRecipeId(selectedRecipe.id);
        setIsAddingRecipe(true);
        navigate(`/recipes`);
    };

    const handleCancelForm = () => {
        setIsAddingRecipe(false);
        setEditingRecipeId(null);
    };

    const requestDelete = () => {
        if (!selectedRecipe) return;
        setRecipeToDelete(selectedRecipe);
        setIsDeleteModalOpen(true);
    };

    const getTopButtonText = () => {
        if (isAddingRecipe) {
            return editingRecipeId ? "Annulla Modifica" : "Annulla Inserimento";
        }
        return "Nuova Ricetta";
    };

    return (
        <div className="flex flex-col gap-8 py-6 max-w-7xl mx-auto px-4">
            <PageHeader
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                onSearchFocus={() => setIsSearchFocused(true)}
                onSearchBlur={() => setTimeout(() => setIsSearchFocused(false), 150)}
                searchPlaceholder="Cerca ricetta o ingrediente..."
                buttonText={getTopButtonText()}
                buttonIcon={isAddingRecipe ? <FiX className="w-5 h-5" /> : <FiPlus className="w-5 h-5" />}
                onButtonClick={() => isAddingRecipe ? handleCancelForm() : handleAddRecipe()}
                searchOverlay={
                    isSearchFocused && searchTerm.trim() !== "" && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-md border border-border shadow-xl rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                            {searchSuggestions.length > 0 ? (
                                <div className="flex flex-col">
                                    {searchSuggestions.map((sug, i) => (
                                        <div
                                            key={`${sug.recipeId}-${sug.text}-${i}`}
                                            className="p-3 flex items-center gap-3 cursor-pointer hover:bg-secondary/20 transition-colors border-b border-border/50 last:border-0"
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                handleOpenRecipe(sug.recipeId);
                                            }}
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                                {sug.type === 'recipe' ? <FiBook className="w-4 h-4" /> : <FiTag className="w-4 h-4" />}
                                            </div>
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="text-sm font-bold text-foreground truncate">{sug.text}</span>
                                                {sug.subtext && <span className="text-xs text-muted-foreground truncate">{sug.subtext}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                    Nessun risultato trovato.
                                </div>
                            )}
                        </div>
                    )
                }
            />
            {isAddingRecipe && (
                <Container className="animate-in slide-in-from-top-4 duration-300 ease-out pb-32 md:pb-8">
                    <RecipeForm
                        key={recipeToEdit ? `edit-${recipeToEdit.id}` : 'new'}
                        initialRecipe={recipeToEdit}
                        allKnownIngredients={allKnownIngredients}
                        isLoading={isLoading}
                        onSave={handleSaveRecipe}
                        onCancel={handleCancelForm}
                    />
                </Container>
            )}
            {!isAddingRecipe && (
                !selectedRecipe ? (
                    <Container className="animate-in fade-in zoom-in-95 duration-500 ease-out">
                        <h2 className="text-2xl font-bold mb-6 text-foreground">Il tuo Ricettario</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {isLoading ? (
                                Array.from({ length: 8 }).map((_, index) => (
                                    <div key={`skeleton-${index}`} className="relative h-64 w-full rounded-2xl bg-border/30 animate-pulse" />
                                ))
                            ) : recipes.length === 0 ? (
                               <div>
                                   <div className="flex flex-col items-center justify-center w-full h-64 bg-secondary/5 border border-dashed border-border/50 rounded-2xl p-6 text-center animate-in fade-in duration-500">
                                       <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-3">
                                           <FiBookOpen className="w-6 h-6 text-muted-foreground" />
                                       </div>
                                       <span className="text-foreground font-bold text-lg mb-1">Nessuna ricetta trovata</span>
                                       <span className="text-muted-foreground text-sm max-w-sm">
                                           Non ci sono ricette disponibili al momento. Aggiungi il tuo primo piatto per vederlo qui!
                                       </span>
                                   </div>
                               </div>
                            ) : (
                                recipes.map((recipe) => (
                                <div key={recipe.id} onClick={() => handleOpenRecipe(recipe.id)} className="transition-transform duration-300 hover:-translate-y-1 cursor-pointer">
                                    <CardRecipe recipe={recipe} />
                                </div>
                            ))
                            )}
                        </div>
                    </Container>
                ) : (
                    <Container className="animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out">
                        <RecipeDetail
                            recipe={selectedRecipe}
                            onBack={() => navigate(`/recipes`)}
                            onEdit={handleEditClick}
                            onDelete={requestDelete}
                        />
                        <ConfirmModal
                            isOpen={isDeleteModalOpen}
                            title="Elimina Ricetta"
                            message={`Sei sicuro di voler eliminare definitivamente "${recipeToDelete?.title}"? Questa operazione non può essere annullata.`}
                            confirmText="Elimina"
                            isDestructive={true}
                            onConfirm={confirmDelete}
                            onCancel={() => setIsDeleteModalOpen(false)}
                        />
                    </Container>
                )
            )}
        </div>
    );
}