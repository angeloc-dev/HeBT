import {type ReactElement, useCallback, useEffect, useState} from "react";
import Container from "@/components/ui/Container.tsx";
import CardRecipe from "@/components/CardRecipe.tsx";
import type {Recipe, DraftIngredient} from "@/model/data-model.ts";
import { recipeService } from "@/services/recipeService.ts";
import Button from "@/components/ui/Button.tsx";
import { FiArrowLeft, FiCheck, FiPlay, FiPlus, FiSearch, FiUsers, FiX, FiTrash2, FiEdit2 } from "react-icons/fi";
import InputText from "@/components/ui/InputText.tsx";
import Textarea from "@/components/ui/TextArea.tsx";
import Select from "@/components/ui/Select.tsx";
import {cn} from "@/lib/utils.ts";
import {useNavigate, useParams} from "react-router-dom";
import {useToast} from "@/hooks/useToast.ts";

const UNIT_OPTIONS = [
    { value: "g", label: "Grammi (g)" },
    { value: "kg", label: "Chili (kg)" },
    { value: "ml", label: "Millilitri (ml)" },
    { value: "l", label: "Litri (l)" },
    { value: "pz", label: "Pezzi (pz)" },
    { value: "cucchiaio", label: "Cucchiaio" },
    { value: "cucchiaino", label: "Cucchiaino" },
    { value: "qb", label: "Quanto Basta (q.b.)" }
];

const GUEST_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1} ${i === 0 ? "persona" : "persone"}`
}));

export default function Recipes(): ReactElement {
    const navigate = useNavigate();
    const { id } = useParams();
    const { addToast } = useToast();
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [guests, setGuests] = useState<number | "">("");
    const [isAddingRecipe, setIsAddingRecipe] = useState<boolean>(false);
    const [editingRecipeId, setEditingRecipeId] = useState<number | null>(null);
    const [recipeForm, setRecipeForm] = useState({ title: "", image: "", description: "", instructions: "" });
    const [draftIngredients, setDraftIngredients] = useState<DraftIngredient[]>([]);
    const selectedRecipe = id && recipes.length > 0
        ? recipes.find(r => r.id === Number(id)) || null
        : null;

    const fetchRecipes = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await recipeService.getAllRecipes();
            setRecipes(data);
        } catch (err) {
            addToast(err instanceof Error ? err.message : "Errore sconosciuto", "error");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchRecipes();
    }, [fetchRecipes]);

    const handleOpenRecipe = (recipe: Recipe) => {
        setGuests("")
        navigate(`/recipes/${recipe.id}`);
    };

    const handleAddRecipe = () => {
        setIsAddingRecipe(true);
        navigate(`/recipes`);
    };

    const updateIngredientRow = (index: number, field: string, value: string | number) => {
        const newIngredients = [...draftIngredients];
        newIngredients[index] = { ...newIngredients[index], [field]: value };

        if (field === 'unit' && value === 'qb') {
            newIngredients[index].amount = 0;
        }

        setDraftIngredients(newIngredients);
    };

    const removeIngredientRow = (index: number) => {
        setDraftIngredients(draftIngredients.filter((_, i) => i !== index));
    };

    const addIngredientRow = () => {
        setDraftIngredients([...draftIngredients, { ingredientName: "", amount: 0, unit: "", section: "" }]);
    };

    const canAddIngredient = draftIngredients.every(ing =>
        ing.ingredientName.trim() !== "" &&
        ing.unit !== "" &&
        (ing.unit === "qb" || String(ing.amount).trim() !== "")
    );

    const handleSubmitRecipe = async () => {
        if (!recipeForm.title.trim()) {
            addToast("Il titolo della ricetta è obbligatorio.", "warning");
            return;
        }

        const formattedIngredients = draftIngredients.map(ing => ({
            ...ing,
            amount: ing.unit === "qb" ? 0 : Number(ing.amount) || 0
        }));

        const recipeData = {
            id: editingRecipeId || 0,
            title: recipeForm.title,
            description: recipeForm.description,
            instructions: recipeForm.instructions,
            image: recipeForm.image,
            ingredients: formattedIngredients,
            isInMealPlan: false
        };
        try {
            setIsLoading(true);
            if (editingRecipeId) {
                await recipeService.editRecipe(editingRecipeId, recipeData as Recipe);
                addToast("Ricetta aggiornata con successo!", "success");
            } else {
                await recipeService.createRecipe(recipeData as Recipe);
                addToast("Ricetta aggiunta con successo!", "success");
            }
            handleCancelForm();
            fetchRecipes();
        } catch (err) {
            addToast(err instanceof Error ? err.message : "Errore durante il salvataggio.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditClick = () => {
        if (!selectedRecipe) return;
        setEditingRecipeId(selectedRecipe.id);
        setRecipeForm({
            title: selectedRecipe.title,
            description: selectedRecipe.description,
            instructions: selectedRecipe.instructions,
            image: selectedRecipe.image || ""
        });
        if (selectedRecipe.ingredients && selectedRecipe.ingredients.length > 0) {
            setDraftIngredients(selectedRecipe.ingredients.map(ing => ({
                ingredientId: ing.ingredientId,
                ingredientName: ing.ingredientName,
                amount: ing.amount,
                unit: ing.unit,
                section: ing.section || ""
            })));
        } else {
            setDraftIngredients([{ ingredientName: "", amount: 0, unit: "", section: "" }]);
        }
        setIsAddingRecipe(true);
        navigate(`/recipes`);
    };

    const handleDeleteClick = async () => {
        if (!selectedRecipe) return;
        const confirmDelete = window.confirm(`Sei sicuro di voler eliminare "${selectedRecipe.title}"?`);
        if (confirmDelete) {
            recipeService.deleteRecipe(selectedRecipe.id);
            fetchRecipes();
        }
        navigate(`/recipes`);
    };

    const handleCancelForm = () => {
        setIsAddingRecipe(false);
        setEditingRecipeId(null);
        setRecipeForm({ title: "", image: "", description: "", instructions: "" });
        setDraftIngredients([{ ingredientName: "", amount: 0, unit: "", section: "" }]);
    };

    return (
        <div className="flex flex-col gap-8 py-6 max-w-7xl mx-auto px-4">
            <Container>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiSearch className="text-muted-foreground w-5 h-5" />
                        </div>
                        <InputText type="text" placeholder="Cerca una ricetta per nome o ingrediente..." className="pl-10" />
                    </div>
                    <Button onClick={() => isAddingRecipe ? handleCancelForm() : handleAddRecipe()}
                            className="w-full md:w-auto h-12 px-6">
                        <span className="flex items-center justify-center gap-2 text-base font-bold text-foreground">
                            {isAddingRecipe ? <FiX className="w-5 h-5" /> : <FiPlus className="w-5 h-5" />}
                            {isAddingRecipe ? "Annulla Inserimento" : "Nuova Ricetta"}
                        </span>
                    </Button>
                </div>
            </Container>
            {isAddingRecipe && (
                <Container className="animate-in slide-in-from-top-4 duration-300 ease-out pb-32 md:pb-8">
                    <div className="flex flex-col gap-6">
                        <div className="border-b border-border/50 pb-4">
                            <h2 className="text-2xl font-bold text-foreground">
                                {recipeForm.title ? "Modifica Ricetta" : "Aggiungi una nuova ricetta"}
                            </h2>
                            <p className="text-muted-foreground text-sm mt-1">Compila i dettagli del piatto e aggiungi gli ingredienti necessari.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-foreground ml-1">Titolo Ricetta</label>
                                <InputText
                                    placeholder="es. Pasta alla Norma"
                                    value={recipeForm.title}
                                    onChange={(e) => setRecipeForm({...recipeForm, title: e.target.value})}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-foreground ml-1">URL Immagine</label>
                                <InputText
                                    placeholder="https://..." type="url"
                                    value={recipeForm.image}
                                    onChange={(e) => setRecipeForm({...recipeForm, image: e.target.value})}
                                />
                            </div>
                            <div className="flex flex-col gap-2 md:col-span-2">
                                <label className="text-sm font-semibold text-foreground ml-1">Descrizione Breve</label>
                                <InputText
                                    placeholder="Una breve descrizione del piatto..."
                                    value={recipeForm.description}
                                    onChange={(e) => setRecipeForm({...recipeForm, description: e.target.value})}
                                />
                            </div>
                            <div className="flex flex-col gap-2 md:col-span-2">
                                <label className="text-sm font-semibold text-foreground ml-1">Istruzioni</label>
                                <Textarea
                                    placeholder="Passo 1: Trita la cipolla...&#10;Passo 2: Soffriggi in padella..."
                                    value={recipeForm.instructions}
                                    onChange={(e) => setRecipeForm({...recipeForm, instructions: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="p-5 rounded-xl bg-background/30 border border-border/30 mt-2 overflow-visible">
                            <h3 className="text-lg font-bold mb-4 text-primary">Ingredienti</h3>
                            <div className="flex flex-col gap-3 mb-4">
                                {draftIngredients.map((ing, index) => (
                                    <div key={index} className="flex flex-col md:flex-row gap-3 items-start md:items-center animate-in fade-in duration-200">
                                        <InputText
                                            placeholder="Nome (es. Sale)"
                                            value={ing.ingredientName}
                                            onChange={(e) => updateIngredientRow(index, 'ingredientName', e.target.value)}
                                            className="w-full md:flex-1"
                                        />
                                        <div className="flex gap-3 w-full md:w-auto">
                                            <InputText
                                                type="number"
                                                placeholder="Qtà"
                                                value={ing.amount}
                                                onChange={(e) => updateIngredientRow(index, 'amount', e.target.value)}
                                                className="w-20"
                                                disabled={ing.unit === "qb"}
                                            />
                                            <div className="w-40">
                                                <Select
                                                    options={UNIT_OPTIONS}
                                                    value={ing.unit}
                                                    onChange={(val) => updateIngredientRow(index, 'unit', val)}
                                                    placeholder="Unità..."
                                                />
                                            </div>
                                            <div className="w-40">
                                                <InputText
                                                    type="text"
                                                    placeholder="Reparto"
                                                    value={ing.section}
                                                    onChange={(e) => updateIngredientRow(index, 'section', e.target.value)}
                                                    className="w-40"
                                                />
                                            </div>
                                            <button
                                                onClick={() => removeIngredientRow(index)}
                                                disabled={draftIngredients.length === 1}
                                                className="h-12 w-12 flex-shrink-0 flex items-center justify-center rounded-xl border border-border/50 text-destructive hover:bg-destructive/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                                            >
                                                <FiTrash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Button
                                onClick={addIngredientRow}
                                disabled={!canAddIngredient}
                                className={cn(
                                    "h-10 w-full md:w-auto transition-colors",
                                    canAddIngredient ? "bg-primary/20 hover:bg-primary/30" : "bg-muted cursor-not-allowed opacity-50"
                                )}
                            >
                                <span className={cn("flex items-center justify-center gap-2 text-base font-bold", canAddIngredient ? "text-foreground" : "text-muted-foreground")}>
                                    <FiPlus className="w-4 h-4" /> Aggiungi Ingrediente
                                </span>
                            </Button>
                        </div>
                        <div className="flex justify-end gap-4 mt-4 pt-4 border-t border-border/50">
                            <Button onClick={handleCancelForm} className="bg-transparent border border-border hover:bg-background/50 h-11">
                                <span className="text-base font-bold text-foreground">Annulla</span>
                            </Button>
                            <Button
                                onClick={handleSubmitRecipe}
                                disabled={isLoading}
                                className={cn(
                                    "h-11 px-8 transition-all",
                                    isLoading ? "bg-muted cursor-wait" : "bg-primary hover:bg-primary/90"
                                )}
                            >
                                <span className="flex items-center justify-center gap-2 text-base font-bold text-foreground">
                                    {isLoading ? "Salvataggio..." : <><FiCheck className="w-5 h-5" /> Salva Ricetta</>}
                                </span>
                            </Button>
                        </div>
                    </div>
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
                            ) : (
                                recipes.map((recipe) => (
                                    <div key={recipe.id} onClick={() => handleOpenRecipe(recipe)} className="transition-transform duration-300 hover:-translate-y-1">
                                        <CardRecipe recipe={recipe} />
                                    </div>
                                ))
                            )}
                        </div>
                    </Container>
                ) : (
                    <Container className="animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out">
                        <div className="flex justify-between items-center mb-6">
                            <button
                                onClick={() => navigate(`/recipes`)}
                                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium cursor-pointer"
                            >
                                <FiArrowLeft className="w-5 h-5" /> Torna al ricettario
                            </button>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleEditClick}
                                    className="h-10 w-10 flex items-center justify-center rounded-xl bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors border border-secondary/20 cursor-pointer"
                                    title="Modifica Ricetta"
                                >
                                    <FiEdit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handleDeleteClick}
                                    disabled={selectedRecipe.isInMealPlan} // Disabilita il bottone nativamente
                                    className={cn(
                                        "h-10 w-10 flex items-center justify-center rounded-xl transition-colors border",
                                        selectedRecipe.isInMealPlan
                                            ? "bg-muted text-muted-foreground border-border/50 cursor-not-allowed opacity-40" // Stile quando è bloccato
                                            : "bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20 cursor-pointer" // Stile normale
                                    )}
                                    title={
                                        selectedRecipe.isInMealPlan
                                            ? "Impossibile eliminare: questa ricetta è inserita in un piano pasti."
                                            : "Elimina Ricetta"
                                    }
                                >
                                    <FiTrash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="flex flex-col gap-6">
                                <div className="w-full h-72 md:h-96 rounded-2xl overflow-hidden border border-border/50 shadow-lg relative">
                                    {selectedRecipe.image ? (
                                        <img src={selectedRecipe.image} alt={selectedRecipe.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-secondary/10 flex items-center justify-center">
                                            <span className="text-muted-foreground">Nessuna immagine</span>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground mb-2">{selectedRecipe.title}</h1>
                                    <p className="text-muted-foreground text-lg leading-relaxed">
                                        {selectedRecipe.description || "Nessuna descrizione disponibile per questo piatto."}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-8">
                                <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 overflow-visible">
                                    <div className="flex flex-col gap-2 flex-1 w-full relative">
                                        <label className="text-sm font-bold text-foreground flex items-center gap-2">
                                            <FiUsers className="text-primary" /> Ospiti a cena
                                        </label>
                                        <Select
                                            options={GUEST_OPTIONS}
                                            value={guests}
                                            onChange={(val) => setGuests(Number(val))}
                                            placeholder="Seleziona numero..."
                                        />
                                    </div>
                                    <div className="w-full sm:w-auto sm:mt-7">
                                        <Button
                                            disabled={guests === ""}
                                            className={`w-full h-12 px-6 transition-all duration-300
                                            ${guests !== ""
                                                ? "bg-primary hover:bg-primary/90 hover:scale-105 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                                                : "bg-muted cursor-not-allowed opacity-50"
                                            }
                                        `}
                                        >
                                        <span className={`flex items-center justify-center gap-2 text-base font-bold ${guests !== "" ? "text-foreground" : "text-muted-foreground"}`}>
                                            <FiPlay className="w-5 h-5" />
                                            Cucina piatto
                                        </span>
                                        </Button>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-foreground mb-4 border-b border-border/50 pb-2">Procedimento</h3>
                                    <div className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
                                        {selectedRecipe.instructions || "Istruzioni non fornite."}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Container>
                )
            )}
        </div>
    );
}