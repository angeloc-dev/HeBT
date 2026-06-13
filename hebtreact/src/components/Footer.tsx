import { FiMail } from "react-icons/fi";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full border-t border-border/50 bg-background/80 backdrop-blur-sm mt-auto">
            <div className="container mx-auto px-4 py-6 max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-col items-center md:items-start gap-1">
                    <span className="text-lg font-bold text-foreground tracking-tight">
                        HeBT - Help Buy To Eat
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                        &copy; {currentYear} Angelo Cannella. Tutti i diritti riservati.
                    </span>
                </div>
                <a
                    href="mailto:cannnella@icloud.com?subject=Segnalazione%20Problema%20App"
                    className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/30 hover:bg-secondary/60 border border-transparent hover:border-border/50 transition-all duration-200"
                >
                    <div className="bg-background p-1.5 rounded-md shadow-sm group-hover:scale-105 transition-transform">
                        <FiMail className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-foreground leading-none">
                            Hai un problema?
                        </span>
                        <span className="text-[10px] text-muted-foreground leading-none mt-1">
                            Contatta il supporto
                        </span>
                    </div>
                </a>
            </div>
        </footer>
    );
}