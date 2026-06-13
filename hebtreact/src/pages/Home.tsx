import { useNavigate } from "react-router-dom";
import CustomButton from "../components/ui/CustomButton";
import { FiBook, FiPackage, FiSearch, FiCalendar, FiClock, FiTrendingDown, FiCheckCircle } from "react-icons/fi";
import { Swiper as SwiperCarousel, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import CardRecipe from "@/components/CardRecipe.tsx";
import type { Recipe, MealPlan, PantryItem } from "@/model/data-model.ts";
import { FreeMode, Mousewheel } from "swiper/modules";
import { useCallback, useEffect, useMemo, useState } from "react";
import Container from "@/components/ui/Container.tsx";
import { recipeService } from "@/services/recipeService.ts";
import { mealPlannerService } from "@/services/mealPlannerService.ts";
import { pantryService } from "@/services/pantryService.ts";
import PlannerCalendar from "@/components/planner/PlannerCalendar.tsx";
import { toast } from "sonner";

export default function Home() {
    const navigate = useNavigate();
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
    const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const fetchDashboardData = useCallback(async (showLoader = true) => {
        const controller = new AbortController();
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        if (showLoader) setIsLoading(true);
        try {
            const [recipesData, mealPlansData, pantryData] = await Promise.all([
                recipeService.getAllRecipes(controller.signal),
                mealPlannerService.getAllMealPlannerBetweenDates(startOfMonth, endOfMonth, controller.signal),
                pantryService.getPantry(controller.signal)
            ]);
            setRecipes(recipesData);
            setMealPlans(mealPlansData);
            setPantryItems(pantryData);
        } catch (err) {
            if (err instanceof Error && err.name !== "CanceledError" && err.name !== "AbortError") {
                toast.error("Errore nel caricamento della dashboard");
            }
        } finally {
            if (showLoader) setIsLoading(false);
            controller.abort();
        }
    }, []);

    useEffect(() => {
        const loadInitialData = async () => {
            await fetchDashboardData(true);
        };

        loadInitialData();
    }, [fetchDashboardData]);

    const todaysRecipes = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        const todaysMeals = mealPlans.filter(m => m.plannedDate === todayStr);
        const matchedRecipes = todaysMeals
            .map(meal => recipes.find(r => r.title === meal.recipeTitle))
            .filter(Boolean) as Recipe[];
        const uniqueRecipes = Array.from(new Set(matchedRecipes.map(r => r.id)))
            .map(id => matchedRecipes.find(r => r.id === id)!);

        return uniqueRecipes;
    }, [mealPlans, recipes]);

    const { expiringItems, lowStockItems } = useMemo(() => {
        const expiring: PantryItem[] = [];
        const low: PantryItem[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        pantryItems.forEach(item => {
            const expDate = new Date(item.expirationDate);
            expDate.setHours(0, 0, 0, 0);
            const diffTime = expDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            let isExpiring = false;
            if (diffDays <= 3) {
                expiring.push(item);
                isExpiring = true;
            }
            if (!isExpiring && Number(item.currentAmount) <= 5) {
                low.push(item);
            }
        });
        expiring.sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime());
        return { expiringItems: expiring, lowStockItems: low };
    }, [pantryItems]);

    const formatShortDate = (dateValue: string | Date) => {
        const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
        return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
    };

    return (
        <div className="flex flex-col gap-10 py-6 max-w-7xl mx-auto px-4">
            <Container>
                <div className="flex items-center justify-between mb-6 border-b border-border/50 pb-2">
                    <h2 className="text-2xl font-bold text-foreground">I Tuoi Prossimi Pasti</h2>
                    <CustomButton variant="ghost" onClick={() => navigate("/planner")} className="text-primary hover:bg-primary/10">
                        Gestisci Planner
                    </CustomButton>
                </div>
                {isLoading ? (
                    <div className="animate-pulse h-96 bg-secondary/20 rounded-2xl w-full"></div>
                ) : (
                    <PlannerCalendar
                        mealPlans={mealPlans}
                        readOnly={true}
                    />
                )}
            </Container>
            <Container className="overflow-hidden">
                <h2 className="text-xl font-bold mb-4 text-foreground border-b border-border/50 pb-2">
                    Stato Dispensa
                </h2>
                {isLoading ? (
                    <div className="flex gap-4">
                        <div className="animate-pulse h-24 bg-secondary/20 rounded-xl w-full"></div>
                        <div className="animate-pulse h-24 bg-secondary/20 rounded-xl w-full hidden md:block"></div>
                    </div>
                ) : expiringItems.length === 0 && lowStockItems.length === 0 ? (
                    <div className="flex items-center gap-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl border border-emerald-500/20">
                        <FiCheckCircle className="w-5 h-5 shrink-0" />
                        <span className="text-sm font-medium">La tua dispensa è in perfette condizioni! Nessun ingrediente in scadenza o in esaurimento.</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {expiringItems.length > 0 && (
                            <div className="flex flex-col gap-3 bg-destructive/5 border border-destructive/20 p-4 rounded-xl">
                                <h3 className="text-sm font-bold text-destructive flex items-center gap-2">
                                    <FiClock className="w-4 h-4" /> In Scadenza (≤ 3 giorni)
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {expiringItems.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => navigate('/pantry')}
                                            className="text-xs font-semibold bg-background hover:bg-destructive/10 border border-destructive/30 text-foreground px-2.5 py-1.5 rounded-md shadow-sm transition-colors cursor-pointer"
                                        >
                                            {item.ingredientName} <span className="text-destructive font-black ml-1">({formatShortDate(item.expirationDate)})</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {lowStockItems.length > 0 && (
                            <div className="flex flex-col gap-3 bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl">
                                <h3 className="text-sm font-bold text-amber-600 dark:text-amber-500 flex items-center gap-2">
                                    <FiTrendingDown className="w-4 h-4" /> In Esaurimento
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {lowStockItems.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => navigate('/pantry')}
                                            className="text-xs font-semibold bg-background hover:bg-amber-500/10 border border-amber-500/30 text-foreground px-2.5 py-1.5 rounded-md shadow-sm transition-colors cursor-pointer"
                                        >
                                            {item.ingredientName} <span className="text-amber-600 dark:text-amber-500 font-black ml-1">({Number(item.currentAmount)} {item.unit})</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Container>
            <Container className="overflow-hidden">
                <h2 className="text-2xl font-bold mb-6 text-foreground border-b border-border/50 pb-2">
                    Ispirazione dalla Cucina
                </h2>
                <SwiperCarousel
                    modules={[FreeMode, Mousewheel]}
                    mousewheel={{ forceToAxis: true }}
                    freeMode={true}
                    spaceBetween={16}
                    slidesPerView={1.2}
                    breakpoints={{
                        640: { slidesPerView: 2.2 },
                        1024: { slidesPerView: 3.5 },
                        1280: { slidesPerView: 4.5 }
                    }}
                    className="w-full pb-4"
                >
                    {isLoading ? (
                        Array.from({ length: 5 }).map((_, index) => (
                            <SwiperSlide key={`skeleton-insp-${index}`} className="h-auto">
                                <div className="relative h-64 w-full rounded-2xl bg-border/30 animate-pulse" />
                            </SwiperSlide>
                        ))
                    ) : recipes.length > 0 ? (
                        recipes.map((recipe) => (
                            <SwiperSlide key={recipe.id}
                                         className="h-auto cursor-pointer"
                                         onClick={() => navigate(`/recipes/${recipe.id}`)}
                            >
                                <CardRecipe recipe={recipe} />
                            </SwiperSlide>
                        ))
                    ) : (
                        <SwiperSlide className="w-full h-auto">
                            <div className="flex flex-col items-center justify-center w-full h-64 bg-secondary/5 border border-dashed border-border/50 rounded-2xl p-6 text-center animate-in fade-in duration-500">
                                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-3">
                                    <FiSearch className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <span className="text-foreground font-bold text-lg mb-1">Nessuna ricetta trovata</span>
                                <span className="text-muted-foreground text-sm max-w-sm">
                                    Non ci sono ricette disponibili al momento. Aggiungi il tuo primo piatto per vederlo qui!
                                </span>
                            </div>
                        </SwiperSlide>
                    )}
                </SwiperCarousel>
            </Container>
            <Container className="overflow-hidden">
                <h2 className="text-2xl font-bold mb-6 text-foreground border-b border-border/50 pb-2">
                    Oggi in Tavola
                </h2>
                <SwiperCarousel
                    modules={[FreeMode, Mousewheel]}
                    mousewheel={{ forceToAxis: true }}
                    freeMode={true}
                    spaceBetween={16}
                    slidesPerView={1.2}
                    breakpoints={{
                        640: { slidesPerView: 2.2 },
                        1024: { slidesPerView: 3.5 },
                        1280: { slidesPerView: 4.5 }
                    }}
                    className="w-full pb-4"
                >
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, index) => (
                            <SwiperSlide key={`skeleton-today-${index}`} className="h-auto">
                                <div className="relative h-64 w-full rounded-2xl bg-primary/10 animate-pulse border border-primary/20" />
                            </SwiperSlide>
                        ))
                    ) : todaysRecipes.length > 0 ? (
                        todaysRecipes.map((recipe) => (
                            <SwiperSlide
                                key={`today-${recipe.id}`}
                                className="h-auto cursor-pointer group"
                                onClick={() => navigate(`/recipes/${recipe.id}`)}
                            >
                                <div className="relative rounded-2xl border-2 border-primary/10 bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-[0_8px_30px_rgba(16,185,129,0.12)] hover:-translate-y-1 h-full overflow-hidden">
                                    <div className="absolute top-3 left-3 z-10 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-sm">
                                        Oggi
                                    </div>
                                    <CardRecipe recipe={recipe} />
                                </div>
                            </SwiperSlide>
                        ))
                    ) : (
                        <SwiperSlide className="w-full h-auto">
                            <div className="flex flex-col items-center justify-center w-full h-64 bg-primary/5 border border-dashed border-primary/30 rounded-2xl p-6 text-center">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                                    <FiCalendar className="w-6 h-6 text-primary" />
                                </div>
                                <span className="text-foreground font-bold text-lg mb-1">Nessun pasto per oggi</span>
                                <span className="text-muted-foreground text-sm max-w-sm">
                                    Non hai ancora pianificato niente per la giornata. Vai al Planner per organizzare i tuoi pasti!
                                </span>
                            </div>
                        </SwiperSlide>
                    )}
                </SwiperCarousel>
            </Container>
            <section className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mx-auto w-full max-w-4xl mt-4 mb-8">
                <CustomButton
                    className="w-[80%] md:w-64 h-14 shadow-lg shadow-primary/20"
                    onClick={() => navigate("/recipes")}
                >
                    <span className="flex items-center gap-2 text-lg font-bold text-foreground">
                        <FiBook className="w-5 h-5" /> Ricettario
                    </span>
                </CustomButton>
                <CustomButton
                    className="w-[80%] md:w-64 h-14 shadow-lg shadow-primary/20"
                    onClick={() => navigate("/planner")}
                >
                    <span className="flex items-center gap-2 text-lg font-bold text-foreground">
                        <FiCalendar className="w-5 h-5" /> Planner
                    </span>
                </CustomButton>
                <CustomButton
                    className="w-[80%] md:w-64 h-14 shadow-lg shadow-primary/20"
                    onClick={() => navigate("/pantry")}
                >
                    <span className="flex items-center gap-2 text-lg font-bold text-foreground">
                        <FiPackage className="w-5 h-5" /> Dispensa
                    </span>
                </CustomButton>
            </section>
        </div>
    );
}