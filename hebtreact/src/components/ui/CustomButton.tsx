import type { ButtonHTMLAttributes, ReactElement } from "react";
import { cn } from "@/lib/utils";
import type {ButtonVariant} from "@/model/data-model.ts";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
}

const variantStyles: Record<ButtonVariant, string> = {
    default: "bg-primary text-primary-foreground shadow-md hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground shadow-md hover:brightness-110",
    outline: "border-2 border-border/50 bg-transparent hover:border-primary/50 hover:bg-primary/5 text-foreground shadow-sm",
    ghost: "bg-transparent hover:bg-secondary/20 text-foreground shadow-none",
    destructive: "bg-destructive text-destructive-foreground shadow-md hover:bg-destructive/90",
};

export default function CustomButton({
                                   children,
                                   className,
                                   variant = "secondary",
                                   type = "button",
                                   ...props
                               }: ButtonProps): ReactElement {

    return (
        <button
            type={type}
            className={cn(
                "inline-flex items-center justify-center gap-2 px-5 h-11 font-semibold rounded-[8px] text-sm cursor-pointer",
                "transition-all duration-200 ease-in-out transform outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                "hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0",
                "disabled:opacity-50 disabled:pointer-events-none disabled:hover:scale-100 disabled:hover:translate-y-0",
                variantStyles[variant],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}