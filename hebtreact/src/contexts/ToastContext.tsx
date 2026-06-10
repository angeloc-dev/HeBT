import { useState, useCallback, type ReactElement, type ReactNode } from "react";
import { FiCheckCircle, FiAlertTriangle, FiXCircle, FiX } from "react-icons/fi";
import { cn } from "@/lib/utils";
import { ToastContext } from "@/hooks/useToast";
import type {Toast, ToastType} from "@/model/data-model.ts";

export function ToastProvider({ children }: { children: ReactNode }): ReactElement {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed top-24 right-4 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={cn(
                            "pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md animate-in slide-in-from-right-full fade-in duration-300",
                            toast.type === "success" && "bg-green-500/10 border-green-500/20 text-green-500",
                            toast.type === "error" && "bg-destructive/10 border-destructive/20 text-destructive",
                            toast.type === "warning" && "bg-amber-500/10 border-amber-500/20 text-amber-500"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            {toast.type === "success" && <FiCheckCircle className="w-5 h-5 shrink-0" />}
                            {toast.type === "error" && <FiXCircle className="w-5 h-5 shrink-0" />}
                            {toast.type === "warning" && <FiAlertTriangle className="w-5 h-5 shrink-0" />}
                            <p className="text-sm font-medium text-foreground">{toast.message}</p>
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                            <FiX className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}