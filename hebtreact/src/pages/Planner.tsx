import { type ReactElement, useState, useMemo, useCallback, useEffect, useRef } from "react";
import CustomButton from "../components/ui/CustomButton.tsx";
import {FiCalendar, FiShoppingBag, FiShoppingCart} from "react-icons/fi";
import type {ShoppingListItem, MealPlan, PlannerView} from "@/model/data-model.ts";
import { shoppingListService } from "@/services/shoppingListService.ts";
import { mealPlannerService } from "@/services/mealPlannerService.ts";
import PageHeader from "@/components/PageHeader.tsx";
import PlannerCalendar from "@/components/planner/PlannerCalendar.tsx";
import ShoppingListView from "@/components/planner/ShoppingListView.tsx";
import GenerateSpesaModal from "@/components/planner/GenerateSpesaModal.tsx";
import type { PlannerCalendarRef } from "@/components/planner/PlannerCalendar.tsx";
import {toast} from "sonner";
import {cn} from "@/lib/utils.ts";

export default function Planner(): ReactElement {
    const [currentView, setCurrentView] = useState<PlannerView>('CALENDAR');
    const [isGeneratingSpesa, setIsGeneratingSpesa] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
    const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const calendarRef = useRef<PlannerCalendarRef>(null);

    const fetchShoppingList = useCallback(async (showLoader: boolean) => {
        const controller = new AbortController();
        if (showLoader) setIsLoading(true);
        try {
            const data = await shoppingListService.getActiveShoppingList(controller.signal);
            setShoppingList(data);
        } catch (err) {
            if (err instanceof Error && err.name !== "CanceledError" && err.name !== "AbortError") {
                toast.error("Errore nel caricamento della lista della spesa");
            }
        } finally {
            if (showLoader) setIsLoading(false);
            controller.abort();
        }
    }, []);

    const fetchMealPlans = useCallback(async (showLoader: boolean) => {
        const controller = new AbortController();
        if (showLoader) setIsLoading(true);
        try {
            const today = new Date();
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            const data = await mealPlannerService.getAllMealPlannerBetweenDates(startOfMonth, endOfMonth);
            setMealPlans(data);
        } catch (err) {
            if (err instanceof Error && err.name !== "CanceledError" && err.name !== "AbortError") {
                toast.error("Errore nel caricamento del calendario");
            }
        } finally {
            if (showLoader) setIsLoading(false);
            controller.abort();
        }
    }, []);

    useEffect(() => {
        const loadInitialData = async () => {
            if (currentView === 'SHOPPING_LIST') {
                await fetchShoppingList(true);
            } else {
                await fetchMealPlans(true);
            }
        };

        loadInitialData();
    }, [currentView, fetchShoppingList, fetchMealPlans]);

    const toggleView = useCallback(() => {
        setSearchQuery("");
        setCurrentView(prev => prev === 'CALENDAR' ? 'SHOPPING_LIST' : 'CALENDAR');
    }, []);

    const handleGenerateSpesaClick = useCallback(() => {
        setIsGeneratingSpesa(true);
    }, []);

    const handleCloseGenerateSpesa = useCallback(() => {
        setIsGeneratingSpesa(false);
    }, []);

    const handleSpesaGenerated = useCallback(async () => {
        setIsGeneratingSpesa(false);
        setCurrentView('SHOPPING_LIST');
        await fetchShoppingList(false);
    }, [fetchShoppingList]);

    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        if (currentView === 'CALENDAR') {
            return mealPlans.filter(m =>
                m.recipeTitle.toLowerCase().includes(searchQuery.toLowerCase())
            );
        } else {
            return shoppingList.filter(s =>
                s.ingredientName.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
    }, [searchQuery, currentView, mealPlans, shoppingList]);

    const handleSearchSelection = (item: MealPlan | ShoppingListItem) => {
        setSearchQuery("");
        if (currentView === 'CALENDAR') {
            const meal = item as MealPlan;
            calendarRef.current?.navigateToDate(new Date(meal.plannedDate));
        }
    };

    return (
        <div className="flex flex-col gap-8 py-6 max-w-7xl mx-auto px-4 relative">
            <PageHeader
                title={currentView === 'CALENDAR' ? "Calendario Pasti" : "Lista della Spesa"}
                description={currentView === 'CALENDAR'
                    ? "Pianifica i tuoi pasti settimanali e organizza la tua dieta."
                    : "Gestisci gli ingredienti da acquistare. Gli articoli spuntati finiranno in dispensa."}
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder={currentView === 'CALENDAR' ? "Cerca ricetta..." : "Cerca ingrediente..."}
                searchOverlay={
                    searchQuery.trim() && (
                        <div className="bg-card border border-border rounded-xl shadow-2xl p-1 max-h-60 overflow-y-auto w-full">
                            {searchResults.length === 0 ? (
                                <div className="p-3 text-sm text-muted-foreground italic">Nessun risultato trovato</div>
                            ) : (
                                searchResults.map((item: MealPlan | ShoppingListItem) => {
                                    const isMeal = currentView === 'CALENDAR';
                                    const title = isMeal ? (item as MealPlan).recipeTitle : (item as ShoppingListItem).ingredientName;
                                    const subtitle = isMeal ? (item as MealPlan).mealType : (item as ShoppingListItem).category;

                                    return (
                                        <button
                                            key={item.id}
                                            className="w-full text-left p-3 hover:bg-secondary/30 rounded-lg text-sm font-medium transition-colors flex items-center gap-3"
                                            onClick={() => handleSearchSelection(item)}
                                        >
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                {isMeal ? <FiCalendar className="w-4 h-4" /> : <FiShoppingBag className="w-4 h-4" />}
                                            </div>
                                            <div className="flex flex-col flex-1 truncate">
                                                <span className="truncate text-foreground">{title}</span>
                                                <span className="text-xs text-muted-foreground block truncate">
                                                    {subtitle}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    )
                }
                action={
                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                        {currentView === 'CALENDAR' && (
                            <CustomButton
                                onClick={handleGenerateSpesaClick}
                                disabled={mealPlans.length === 0}
                                className="h-12 shrink-0 px-6 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                            >
                                <span className="flex items-center justify-center gap-2 text-base font-bold text-white">
                                    <FiShoppingCart className="w-5 h-5" />
                                    Genera Spesa
                                </span>
                            </CustomButton>
                        )}
                        <div className="inline-flex items-center w-full md:w-auto h-12 p-1 rounded-xl border border-border/40 shrink-0 select-none">
                            <button
                                type="button"
                                onClick={() => currentView !== 'CALENDAR' && toggleView()}
                                className={cn(
                                    "flex-1 md:flex-none md:px-5 h-full flex items-center justify-center gap-2 text-sm font-bold rounded-lg transition-all duration-200 cursor-pointer",
                                    currentView === 'CALENDAR'
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/20"
                                )}
                            >
                                <FiCalendar className={cn("w-4 h-4", currentView === 'CALENDAR' ? "text-primary" : "")} />
                                <span>Calendario</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => currentView === 'CALENDAR' && toggleView()}
                                className={cn(
                                    "flex-1 md:flex-none md:px-5 h-full flex items-center justify-center gap-2 text-sm font-bold rounded-lg transition-all duration-200 cursor-pointer",
                                    currentView !== 'CALENDAR'
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/20"
                                )}
                            >
                                <FiShoppingCart className={cn("w-4 h-4", currentView !== 'CALENDAR' ? "text-emerald-500" : "")} />
                                <span>Lista Spesa</span>
                            </button>
                        </div>
                    </div>
                }
            />
            {isLoading ? (
                <div className="animate-pulse flex flex-col gap-6 w-full">
                    {currentView === 'CALENDAR' ? (
                        <>
                            <div className="h-16 bg-secondary/20 rounded-xl w-full"></div>
                            <div className="grid grid-cols-1 xl:grid-cols-7 gap-4">
                                {Array.from({ length: 7 }).map((_, i) => (
                                    <div key={i} className="h-96 bg-secondary/20 rounded-2xl"></div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex justify-between items-center mb-2">
                                <div className="h-8 bg-secondary/20 rounded-md w-48"></div>
                                <div className="h-10 bg-secondary/20 rounded-xl w-64"></div>
                            </div>
                            <div className="flex flex-col gap-3 bg-background/50 border border-border/50 p-4 rounded-2xl">
                                <div className="h-5 bg-secondary/20 rounded w-32 mb-2"></div>
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="h-14 bg-secondary/20 rounded-xl w-full"></div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            ) : currentView === 'CALENDAR' ? (
                <PlannerCalendar
                    ref={calendarRef}
                    mealPlans={mealPlans}
                    onMealsUpdated={() => fetchMealPlans(false)}
                />
            ) : (
                <ShoppingListView
                    shoppingList={shoppingList}
                    onListUpdated={() => fetchShoppingList(false)}
                    searchQuery={searchQuery}
                />
            )}
            {isGeneratingSpesa && (
                <GenerateSpesaModal
                    mealPlans={mealPlans}
                    onClose={handleCloseGenerateSpesa}
                    onSuccess={handleSpesaGenerated}
                />
            )}
        </div>
    );
}