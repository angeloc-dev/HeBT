import Navbar from "./components/Navbar";
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import SoftAurora from "./components/SoftAurora.jsx";
import Home from "./pages/Home";
import Recipes from "./pages/Recipes";
import Shopping from "./pages/Shopping";
import Pantry from "./pages/Pantry";

function App() {
    return (
        <Router>
            <div className="relative h-screen bg-background overflow-hidden">
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <SoftAurora
                        speed={0.4}
                        scale={0.4}
                        brightness={0.8}
                        color1="#22c55e"
                        color2="#F59E0B"
                        noiseFrequency={3.5}
                        noiseAmplitude={2}
                        bandHeight={0.5}
                        bandSpread={0.9}
                        octaveDecay={0.28}
                        layerOffset={0.45}
                        colorSpeed={1.5}
                        enableMouseInteraction={false}
                        mouseInfluence={0.2}
                    />
                </div>
                <div className="relative z-10 flex flex-col h-screen overflow-y-auto">
                    <Navbar />
                    <main className="flex-grow container mx-auto">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/recipes" element={<Recipes />} />
                            <Route path="/recipes/:id" element={<Recipes />} />
                            <Route path="/shopping" element={<Shopping />} />
                            <Route path="/pantry" element={<Pantry />} />
                        </Routes>
                    </main>
                </div>

            </div>
        </Router>
    )
}

export default App;