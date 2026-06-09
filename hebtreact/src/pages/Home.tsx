import {useNavigate} from "react-router-dom";
import Button from "../components/ui/Button";
import {FiBook, FiPackage, FiShoppingCart} from "react-icons/fi";
import {Swiper as SwiperCarousel, SwiperSlide} from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import CardRecipe from "@/components/CardRecipe.tsx";
import type {Recipe} from "@/model/data-model.ts";
import {FreeMode, Mousewheel} from "swiper/modules";
import {useMemo} from "react";
import Container from "@/components/ui/Container.tsx";

const MOCK_RECIPES: Recipe[] = [
    {
        id: 1,
        title: "Pasta alla Milanese (Siciliana)",
        description: "",
        instructions: "",
        ingredients: [],
        image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=800&auto=format&fit=crop"
    },
    {
        id: 2,
        title: "Caponata di Melanzane",
        description: "",
        instructions: "",
        ingredients: [],
        image: "https://images.unsplash.com/photo-1574484284002-952d92456975?q=80&w=800&auto=format&fit=crop"
    },
    {
        id: 3,
        title: "Risotto allo Zafferano",
        description: "",
        instructions: "",
        ingredients: [],
        image: "https://images.unsplash.com/photo-1595295333158-4742f28fbd85?q=80&w=800&auto=format&fit=crop"
    },
    {
        id: 4,
        title: "Pasta alla Milanese (Siciliana)",
        description: "",
        instructions: "",
        ingredients: [],
        image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=800&auto=format&fit=crop"
    },
    {
        id: 5,
        title: "Caponata di Melanzane",
        description: "",
        instructions: "",
        ingredients: [],
        image: "https://images.unsplash.com/photo-1574484284002-952d92456975?q=80&w=800&auto=format&fit=crop"
    },
    {
        id: 6,
        title: "Risotto allo Zafferano",
        description: "",
        instructions: "",
        ingredients: [],
        image: "https://images.unsplash.com/photo-1595295333158-4742f28fbd85?q=80&w=800&auto=format&fit=crop"
    }
];

export default function Home() {
    const navigate = useNavigate();

    const calendarDays = useMemo(() => {
        const days = [];
        const today = new Date();

        for (let i = 0; i < 14; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            // Popoliamo alcuni giorni con ricette finte per testare la grafica
            let meals: { id: number, name: string }[] = [];
            if (i === 0) meals = [{ id: 101, name: "Pasta alla Milanese (Siciliana)" }, { id: 102, name: "Caponata di Melanzane" }];
            if (i === 1) meals = [{ id: 103, name: "Spaghetti alle Vongole" }];
            // Testiamo un giorno molto pieno per vedere se la cella si allunga correttamente
            if (i === 3) meals = [
                { id: 104, name: "Uova e Bacon" }, { id: 105, name: "Spuntino Proteico" },
                { id: 106, name: "Risotto Zafferano" }, { id: 107, name: "Frutta" }, { id: 108, name: "Bistecca ai ferri" }
            ];

            days.push({
                date,
                isToday: i === 0,
                meals
            });
        }
        return days;
    }, []);

    return (
        <div className="flex flex-col gap-10 py-6 max-w-7xl mx-auto px-4">
            <Container>
                <h2 className="text-2xl font-bold mb-6 text-foreground">I Tuoi Prossimi Pasti</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-3 md:gap-4">
                    {calendarDays.map((day, idx) => (
                        <div
                            key={idx}
                            className={`flex flex-col min-h-32.5 p-3 rounded-[10px] border transition-colors duration-300 cursor-default
                                ${day.isToday
                                ? 'border-primary/60 bg-primary/10'
                                : 'border-border/40 bg-card hover:border-border/80'
                            }
                            `}
                        >
                            <div className={`text-xs font-bold mb-3 uppercase tracking-wider ${day.isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                                {day.date.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric' })}
                            </div>

                            <div className="flex flex-col gap-1.5 flex-1">
                                {day.meals.map(meal => (
                                    <button
                                        key={meal.id}
                                        onClick={() => navigate('/recipes')}
                                        className="text-left text-[11px] sm:text-xs font-medium px-2 py-1.5 rounded-md bg-background/50 text-foreground border border-transparent hover:border-secondary/50 hover:bg-secondary/15 hover:text-secondary transition-all duration-200 text-wrap w-full cursor-pointer"
                                        title={meal.name}
                                    >
                                        {meal.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </Container>
            <Container className="overflow-hidden">
                <h2 className="text-2xl font-bold mb-6 text-foreground">Ispirazione dalla Cucina</h2>
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
                    {MOCK_RECIPES.map((recipe) => (
                        <SwiperSlide key={recipe.id} className="h-auto">
                            <CardRecipe recipe={recipe} />
                        </SwiperSlide>
                    ))}
                </SwiperCarousel>
            </Container>
            <section className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mx-auto w-full max-w-4xl mt-4">
                <Button
                    className="w-[80%] md:w-64 h-14"
                    onClick={() => navigate("/recipes")}
                >
                    <span className="flex items-center gap-2 text-lg font-bold text-foreground">
                        <FiBook className="w-5 h-5" />
                        Ricettario
                    </span>
                </Button>

                <Button
                    className="w-[80%] md:w-64 h-14"
                    onClick={() => navigate("/shopping")}
                >
                    <span className="flex items-center gap-2 text-lg font-bold text-foreground">
                        <FiShoppingCart className="w-5 h-5" />
                        Crea Spesa
                    </span>
                </Button>

                <Button
                    className="w-[80%] md:w-64 h-14"
                    onClick={() => navigate("/pantry")}
                >
                    <span className="flex items-center gap-2 text-lg font-bold text-foreground">
                        <FiPackage className="w-5 h-5" />
                        Dispensa
                    </span>
                </Button>
            </section>
        </div>
    );
}