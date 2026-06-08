import Navbar from "./components/Navbar";
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';

const Home = () => <div className="p-8 text-2xl font-bold">Dashboard & Calendario</div>;
const Recipes = () => <div className="p-8 text-2xl font-bold">Ricettario (Caso d'Uso 1)</div>;
const Shopping = () => <div className="p-8 text-2xl font-bold">Lista della Spesa (Caso d'Uso 2)</div>;
const Pantry = () => <div className="p-8 text-2xl font-bold">La tua Dispensa (Caso d'Uso 3)</div>;

function App() {
    return (
        <Router>
            <div className="min-h-screen flex flex-col bg-background">
                <Navbar />
                <main className="flex-grow container mx-auto">
                   <Routes>
                       <Route path="/" element={<Home />} />
                       <Route path="/recipes" element={<Recipes />} />
                       <Route path="/shopping" element={<Shopping />} />
                       <Route path="/pantry" element={<Pantry />} />
                   </Routes>
                </main>
            </div>
        </Router>
    )
}

export default App