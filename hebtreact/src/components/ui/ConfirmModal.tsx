import { type ReactElement, useEffect } from "react";
import { createPortal } from "react-dom";
import Button from "@/components/ui/Button.tsx";

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
}

export default function ConfirmModal({
                                         isOpen,
                                         title,
                                         message,
                                         onConfirm,
                                         onCancel,
                                         confirmText = "Conferma",
                                         cancelText = "Annulla",
                                         isDestructive = false
                                     }: ConfirmModalProps): ReactElement | null {

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6 flex flex-col gap-6 animate-in zoom-in-95 duration-200">
                <div>
                    <h3 className="text-xl font-bold text-foreground">{title}</h3>
                    <p className="text-muted-foreground text-sm mt-2">{message}</p>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                    <Button onClick={onCancel} className="bg-transparent border border-border text-foreground hover:bg-background/50">
                        {cancelText}
                    </Button>
                    <Button
                        onClick={onConfirm}
                        className={isDestructive ? "bg-destructive hover:bg-destructive/90 text-white border-transparent" : "bg-primary hover:bg-primary/90 text-primary-foreground border-transparent"}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
}