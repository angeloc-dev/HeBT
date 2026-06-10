import { createContext, useContext } from "react";
import type {ToastContextType} from "@/model/data-model.ts";

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast deve essere usato all'interno di un ToastProvider");
    }
    return context;
}