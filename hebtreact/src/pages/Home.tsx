import {useNavigate} from "react-router-dom";
import Button from "../components/ui/Button";
import {FiBook, FiClock, FiPackage, FiShoppingCart} from "react-icons/fi";
import { Swiper as SwiperCarousel, SwiperSlide } from "swiper/react";
import "swiper/css";

const MOCK_RECIPES = [
    {
        id: 1,
        title: "Pasta alla Milanese (Siciliana)",
        time: "40 min",
        image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=800&auto=format&fit=crop"
    },
    {
        id: 2,
        title: "Caponata di Melanzane",
        time: "60 min",
        image: "https://images.unsplash.com/photo-1574484284002-952d92456975?q=80&w=800&auto=format&fit=crop"
    },
    {
        id: 3,
        title: "Risotto allo Zafferano",
        time: "35 min",
        image: "https://images.unsplash.com/photo-1595295333158-4742f28fbd85?q=80&w=800&auto=format&fit=crop"
    },
    {
        id: 4,
        title: "Spaghetti alle Vongole",
        time: "25 min",
        image: "https://images.unsplash.com/photo-1563379926898-05f45c5100ae?q=80&w=800&auto=format&fit=crop"
    }
];

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col gap-10 py-6">
            <section>
                <h2 className="text-2xl font-bold mb-4">I Tuoi Prossimi Pasti</h2>
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                </div>
            </section>
            <section className="w-full overflow-hidden">
                <h2 className="text-2xl font-bold mb-4 text-foreground">Ispirazione dalla Cucina</h2>

                <SwiperCarousel
                    // Impostazioni per il responsive design
                    spaceBetween={16}
                    slidesPerView={1.2} // Mostra 1 card e un "pezzettino" della successiva per far capire che si scrolla
                    breakpoints={{
                        640: { slidesPerView: 2.2 },
                        1024: { slidesPerView: 3.5 },
                        1280: { slidesPerView: 4.5 }
                    }}
                    className="w-full pb-4" // pb-4 dà spazio per l'ombra delle card
                >
                    {MOCK_RECIPES.map((recipe) => (
                        <SwiperSlide key={recipe.id} className="h-auto">
                            {/* Card della Ricetta */}
                            <div className="relative h-64 w-full rounded-2xl overflow-hidden group cursor-pointer border border-border/50 shadow-lg">
                                {/* Immagine di Sfondo con zoom all'hover */}
                                <img
                                    src={recipe.image}
                                    alt={recipe.title}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />

                                {/* Gradiente Scuro: essenziale per rendere sempre leggibile il testo bianco */}
                                <div className="absolute inset-0 bg-linear-to-t from-background/95 via-background/40 to-transparent" />

                                {/* Contenuto testuale posizionato in basso */}
                                <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-2 transition-transform duration-300 transform translate-y-2 group-hover:translate-y-0">
                                    <h3 className="text-lg font-bold text-white leading-tight">
                                        {recipe.title}
                                    </h3>
                                    <div className="flex items-center gap-1.5 text-sm text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                        <FiClock />
                                        <span>{recipe.time}</span>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </SwiperCarousel>
            </section>
            <section className="flex flex-col md:flex-row justify-center gap-4 md:gap-8 mx-auto w-full max-w-4xl mt-4">
                <Button
                    className="flex-1 h-14"
                    onClick={() => navigate("/recipes")}
                >
                    <span className="flex items-center gap-2 text-lg font-bold text-foreground">
                        <FiBook className="w-5 h-5" />
                        Ricettario
                    </span>
                </Button>
                <Button
                    className="flex-1 h-14"
                    onClick={() => navigate("/shopping")}
                >
                    <span className="flex items-center gap-2 text-lg font-bold text-foreground">
                        <FiShoppingCart className="w-5 h-5" />
                        Crea Spesa
                    </span>
                </Button>

                <Button
                    className="flex-1 h-14"
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