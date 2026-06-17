import {type ReactElement, useState, useMemo, useCallback} from "react";
import type { Recipe, DraftIngredient } from "@/model/data-model.ts";
import CustomButton from "../ui/CustomButton.tsx";
import InputText from "@/components/ui/InputText.tsx";
import Textarea from "@/components/ui/TextArea.tsx";
import Select from "@/components/ui/Select.tsx";
import { FiCheck, FiPlus, FiTrash2, FiTag } from "react-icons/fi";
import { cn } from "@/lib/utils.ts";
import {convertToAbsoluteUnit, SHOPPING_SECTION_GROUPS, UNIT_GROUPS} from "@/model/constants.ts";
import {toast} from "sonner";

interface RecipeFormProps {
    initialRecipe?: Recipe | null;
    allKnownIngredients: string[];
    isLoading: boolean;
    onSave: (recipeData: Recipe, isEdit: boolean) => Promise<void>;
    onCancel: () => void;
}

export default function RecipeForm({ initialRecipe, allKnownIngredients, isLoading, onSave, onCancel }: RecipeFormProps): ReactElement {
    const [title, setTitle] = useState(initialRecipe?.title || "");
    const [image, setImage] = useState(initialRecipe?.image || "");
    const [description, setDescription] = useState(initialRecipe?.description || "");
    const [instructions, setInstructions] = useState(initialRecipe?.instructions || "");
    const [draftIngredients, setDraftIngredients] = useState<DraftIngredient[]>(() => {
        if (initialRecipe && initialRecipe.ingredients && initialRecipe.ingredients.length > 0) {
            return initialRecipe.ingredients.map(ing => ({
                ingredientId: ing.ingredientId,
                ingredientName: ing.ingredientName,
                amount: ing.amount,
                unit: ing.unit,
                section: ing.section || ""
            }));
        }
        return [{ ingredientName: "", amount: 0, unit: "", section: "" }];
    });
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number | null>(null);

    const updateIngredientRow = (index: number, field: keyof DraftIngredient, value: string | number) => {
        const newIngredients = [...draftIngredients];

        if (field === 'amount' && Number(value) < 0) {
            newIngredients[index] = { ...newIngredients[index], amount: 0 };
        } else {
            newIngredients[index] = { ...newIngredients[index], [field]: value };
        }

        if (field === 'unit' && value === 'qb') {
            newIngredients[index].amount = 0;
        }
        setDraftIngredients(newIngredients);
    };

    const removeIngredientRow = (index: number) => {
        setDraftIngredients(draftIngredients.filter((_, i) => i !== index));
    };

    const addIngredientRow = () => {
        setActiveSuggestionIndex(null);
        setDraftIngredients([...draftIngredients, { ingredientName: "", amount: 0, unit: "", section: "" }]);
    };

    const isFormValid = useMemo(() => {
        if (!title.trim()) return false;

        const areIngredientsValid = draftIngredients.every(ing => {
            const isNameValid = ing.ingredientName.trim() !== "";
            const isUnitValid = ing.unit !== "";
            const isSectionValid = ing.section !== "";
            const isAmountValid = ing.unit === "qb" || Number(ing.amount) > 0;
            return isNameValid && isUnitValid && isSectionValid && isAmountValid;
        });

        return areIngredientsValid;
    }, [title, draftIngredients]);

    const handleSubmit = useCallback(() => {
        if (!isFormValid) {
            toast.warning("Controlla di aver inserito titolo e che tutti gli ingredienti abbiano nome, quantità (> 0), unità e reparto validi.");
            return;
        }
        const validIngredients = draftIngredients.filter(ing => ing.ingredientName.trim() !== "");
        const formattedIngredients = validIngredients.map(ing => {
            const trimmedName = ing.ingredientName.trim();
            const rawAmount = ing.unit === "qb" ? 0 : (Number(ing.amount) || 0);
            const absoluteData = convertToAbsoluteUnit(rawAmount, ing.unit, trimmedName);
            return {
                ingredientId: ing.ingredientId,
                ingredientName: trimmedName,
                amount: absoluteData.amount,
                unit: absoluteData.unit,
                section: ing.section
            };
        });
        const recipeData = {
            id: initialRecipe ? initialRecipe.id : 0,
            title: title.trim(),
            description: description.trim(),
            instructions: instructions.trim(),
            image: image.trim(),
            ingredients: formattedIngredients,
            isInMealPlan: initialRecipe?.isInMealPlan || false
        };
        onSave(recipeData as Recipe, !!initialRecipe);
    }, [description, draftIngredients, image, initialRecipe, instructions, isFormValid, onSave, title]);

    return (
        <div className="flex flex-col gap-6">
            <div className="border-b border-border/50 pb-4">
                <h2 className="text-2xl font-bold text-foreground">
                    {initialRecipe ? "Modifica Ricetta" : "Aggiungi una nuova ricetta"}
                </h2>
                <p className="text-muted-foreground text-sm mt-1">Compila i dettagli del piatto e aggiungi gli ingredienti necessari.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-foreground ml-1">Titolo Ricetta *</label>
                    <InputText
                        placeholder="es. Pasta alla Norma"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        autoComplete="off"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-foreground ml-1">URL Immagine</label>
                    <InputText
                        placeholder="https://..." type="url"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        autoComplete="off"
                    />
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-sm font-semibold text-foreground ml-1">Descrizione Breve</label>
                    <InputText
                        placeholder="Una breve descrizione del piatto..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        autoComplete="off"
                    />
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-sm font-semibold text-foreground ml-1">Istruzioni</label>
                    <Textarea
                        placeholder="Passo 1: Trita la cipolla...&#10;Passo 2: Soffriggi in padella..."
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                    />
                </div>
            </div>
            <div className="p-5 rounded-xl bg-background/30 border border-border/30 mt-2 overflow-visible">
                <h3 className="text-lg font-bold mb-4 text-primary">Ingredienti *</h3>
                <div className="flex flex-col gap-4 mb-4">
                    {draftIngredients.map((ing, index) => (
                        <div
                            key={index}
                            className="grid grid-cols-12 gap-2 sm:gap-3 items-center animate-in fade-in duration-200 pb-4 border-b border-border/30 last:border-0 last:pb-0"
                        >
                            <div className="col-span-3 sm:col-span-2 lg:col-span-1">
                                <InputText
                                    placeholder="Qtà"
                                    value={ing.amount}
                                    onChange={(e) => updateIngredientRow(index, 'amount', e.target.value)}
                                    disabled={ing.unit === "qb"}
                                    className=" text-center"
                                />
                            </div>
                            <div className="col-span-9 sm:col-span-4 lg:col-span-3">
                                <Select
                                    groups={UNIT_GROUPS}
                                    value={ing.unit}
                                    onChange={(val) => updateIngredientRow(index, 'unit', val)}
                                    placeholder="Unità..."
                                />
                            </div>
                            <div className="col-span-12 sm:col-span-6 lg:col-span-4 relative">
                                <InputText
                                    placeholder="Ingrediente (es. Sale)"
                                    value={ing.ingredientName}
                                    onFocus={() => setActiveSuggestionIndex(index)}
                                    onBlur={() => setTimeout(() => setActiveSuggestionIndex(null), 150)}
                                    onChange={(e) => updateIngredientRow(index, 'ingredientName', e.target.value)}
                                    className="w-full"
                                    name={`food-item-${index}`}
                                    autoComplete="off"
                                />
                                {activeSuggestionIndex === index && ing.ingredientName.length > 0 && (
                                    <div className="absolute z-50 top-full left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-background/95 backdrop-blur-md border border-border/50 rounded-xl shadow-xl">
                                        {allKnownIngredients
                                            .filter(name => name.toLowerCase().includes(ing.ingredientName.toLowerCase()) && name.toLowerCase() !== ing.ingredientName.toLowerCase())
                                            .map(suggestion => (
                                                <div
                                                    key={suggestion}
                                                    onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        updateIngredientRow(index, 'ingredientName', suggestion);
                                                        setActiveSuggestionIndex(null);
                                                    }}
                                                    className="p-3 flex items-center gap-2 cursor-pointer hover:bg-primary/20 hover:text-primary transition-colors text-sm text-foreground font-medium border-b border-border/50 last:border-0"
                                                >
                                                    <FiTag className="text-muted-foreground w-4 h-4 shrink-0" />
                                                    {suggestion}
                                                </div>
                                            ))
                                        }
                                    </div>
                                )}
                            </div>
                            <div className="col-span-9 sm:col-span-10 lg:col-span-3">
                                <Select
                                    groups={SHOPPING_SECTION_GROUPS}
                                    value={ing.section}
                                    onChange={(val) => updateIngredientRow(index, 'section', val)}
                                    placeholder="Reparto..."
                                />
                            </div>
                            <div className="col-span-3 sm:col-span-2 lg:col-span-1 flex justify-end">
                                <button
                                    onClick={() => removeIngredientRow(index)}
                                    disabled={draftIngredients.length === 1}
                                    className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-xl border border-border/50 text-destructive hover:bg-destructive/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer w-full lg:w-12"
                                >
                                    <FiTrash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <CustomButton
                    onClick={addIngredientRow}
                    className="h-10 w-full md:w-auto transition-colors bg-secondary/30 hover:bg-secondary/50 text-foreground"
                >
                    <span className="flex items-center justify-center gap-2 text-base font-bold">
                        <FiPlus className="w-4 h-4" /> Aggiungi Ingrediente
                    </span>
                </CustomButton>
            </div>
            <div className="flex justify-end gap-4 mt-4 pt-4 border-t border-border/50">
                <CustomButton onClick={onCancel} className="bg-transparent border border-border hover:bg-background/50 h-11">
                    <span className="text-base font-bold text-foreground">Annulla</span>
                </CustomButton>
                <CustomButton
                    onClick={handleSubmit}
                    disabled={isLoading || !isFormValid}
                    className={cn(
                        "h-11 px-8 transition-all",
                        isLoading ? "bg-muted cursor-wait" : (!isFormValid ? "bg-muted text-muted-foreground opacity-50 cursor-not-allowed" : "bg-primary hover:bg-primary/90")
                    )}
                >
                    <span className="flex items-center justify-center gap-2 text-base font-bold text-white">
                        {isLoading ? "Salvataggio..." : <><FiCheck className="w-5 h-5" /> Salva Ricetta</>}
                    </span>
                </CustomButton>
            </div>
        </div>
    );
}