import type {ReactElement} from "react";
import { FiAlertTriangle, FiHome } from "react-icons/fi";
import CustomButton from "@/components/ui/CustomButton.tsx";
import { useNavigate } from "react-router-dom";
import Container from "@/components/ui/Container.tsx";

function NotFound(): ReactElement {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col gap-10 py-6 max-w-7xl mx-auto px-4">
            <Container>
                <div className="flex flex-col items-center justify-center gap-4 py-20 mt-4 animate-in fade-in zoom-in-95 bg-background/30 rounded-2xl border border-dashed border-border/50">
                    <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center text-muted-foreground">
                        <FiAlertTriangle className="w-8 h-8" />
                    </div>
                    <h2>404</h2>
                    <h3 className="text-xl font-bold text-foreground">Pagina non trovata</h3>
                    <p className="text-muted-foreground text-center max-w-sm">
                        La pagina che stai cercando non esiste, è stata eliminata o l'URL è errato.
                    </p>
                    <CustomButton
                        variant="outline"
                        className="mt-2"
                        onClick={() => navigate("/")}
                    >
                        <FiHome className="w-4 h-4" /> Torna alla Home
                    </CustomButton>
                </div>
            </Container>
        </div>
    );
}

export default NotFound;