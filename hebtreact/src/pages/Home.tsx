import { useNavigate } from "react-router-dom";
import CustomButton from "../components/ui/CustomButton";
import { FiBook, FiPackage, FiSearch, FiCalendar } from "react-icons/fi";
import { Swiper as SwiperCarousel, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import CardRecipe from "@/components/CardRecipe.tsx";
import type { Recipe, MealPlan } from "@/model/data-model.ts";
import { FreeMode, Mousewheel } from "swiper/modules";
import { useCallback, useEffect, useMemo, useState } from "react";
import Container from "@/components/ui/Container.tsx";
import { recipeService } from "@/services/recipeService.ts";
import { mealPlannerService } from "@/services/mealPlannerService.ts";
import PlannerCalendar from "@/components/planner/PlannerCalendar.tsx";
import {toast} from "sonner";

export default function Home() {
    const navigate = useNavigate();
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const fetchDashboardData = useCallback(async () => {
        setIsLoading(true);
        try {
            const today = new Date();
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            const [recipesData, mealPlansData] = await Promise.all([
                recipeService.getAllRecipes(),
                mealPlannerService.getAllMealPlannerBetweenDates(startOfMonth, endOfMonth)
            ]);
            setRecipes(recipesData);
            setMealPlans(mealPlansData);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Errore nel caricamento della dashboard");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const loadInitialData = async () => {
            await fetchDashboardData();
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
                            <SwiperSlide key={`today-${recipe.id}`}
                                         className="h-auto cursor-pointer"
                                         onClick={() => navigate(`/recipes/${recipe.id}`)}
                            >
                                <div className="relative rounded-2xl ring-2 ring-primary/50 shadow-[0_0_15px_rgba(16,185,129,0.15)] h-full overflow-hidden">
                                    <div className="absolute top-2 left-2 z-10 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md shadow-md">
                                        Previsto per Oggi
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