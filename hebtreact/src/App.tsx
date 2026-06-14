import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Home from "./pages/Home";
import Recipes from "./pages/Recipes";
import Planner from "./pages/Planner";
import Pantry from "./pages/Pantry";
import SoftAurora from "./components/SoftAurora.tsx";
import {Toaster} from "sonner";
import NotFound from "@/pages/NotFound.tsx";

function App() {
    return (
        <Router>
            <Toaster position="top-center" theme="dark" />
            <div className="relative h-screen bg-background overflow-hidden">
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <SoftAurora
                        speed={0.4}
                        scale={1.1}
                        brightness={0.7}
                        color1="#22c55e"
                        color2="#F59E0B"
                        noiseFrequency={2}
                        noiseAmplitude={1}
                        bandHeight={0.5}
                        bandSpread={0.8}
                        octaveDecay={0.08}
                        layerOffset={0}
                        colorSpeed={1}
                        enableMouseInteraction={false}
                        mouseInfluence={0.25}
                    />
                </div>
                <div className="relative z-10 flex flex-col h-screen overflow-y-auto">
                    <Navbar />
                    <main className="flex-grow container mx-auto">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/recipes" element={<Recipes />} />
                            <Route path="/recipes/:id" element={<Recipes />} />
                            <Route path="/planner" element={<Planner />} />
                            <Route path="/pantry" element={<Pantry />} />
                            <Route path="/pantry/to-cook/:id" element={<Pantry />} />
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </main>
                    <Footer />
                </div>

            </div>
        </Router>
    )
}

export default App;