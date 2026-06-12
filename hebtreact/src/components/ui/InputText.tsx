import { type InputHTMLAttributes, type ReactElement, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputTextProps extends InputHTMLAttributes<HTMLInputElement> {
    className?: string;
}

const InputText = forwardRef<HTMLInputElement, InputTextProps>(
    ({ className, type, autoComplete = "off", ...props }, ref): ReactElement => {
        return (
            <input
                type={type}
                autoComplete={autoComplete}
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck="false"
                data-1p-ignore="true"
                data-lpignore="true"
                data-form-type="other"
                className={cn(
                    "flex h-12 w-full rounded-xl border border-border/50 bg-background/50 px-4 py-2 text-sm text-foreground",
                    "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent",
                    "disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
InputText.displayName = "Input";

export default InputText;