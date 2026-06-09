import { useState, useRef, useEffect, type ReactElement } from "react";
import { FiChevronDown } from "react-icons/fi";
import { cn } from "@/lib/utils";

export interface SelectOption {
    value: string | number;
    label: string;
}

interface SelectProps {
    options: SelectOption[];
    value: string | number;
    onChange: (value: string | number) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export default function Select({ options, value, onChange, placeholder = "Seleziona...", className, disabled }: SelectProps): ReactElement {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find((opt) => opt.value === value);

    return (
        <div className={cn("relative w-full", className)} ref={dropdownRef}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex h-12 w-full items-center justify-between rounded-xl border border-border/50 bg-background/50 px-4 py-2 text-sm text-foreground transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-primary",
                    disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-background/80"
                )}
            >
                <span className={selectedOption ? "text-foreground" : "text-muted-foreground"}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <FiChevronDown className={cn("w-5 h-5 transition-transform duration-200 text-muted-foreground", isOpen && "rotate-180")} />
            </button>
            {isOpen && !disabled && (
                <div className="absolute left-0 right-0 top-[calc(100%+5px)] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-60 overflow-y-auto rounded-xl border border-border/50 bg-background/95 backdrop-blur-xl p-1 shadow-2xl">      {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer text-left text-foreground",
                                    option.value === value ? "bg-primary/20 text-primary font-bold" : "hover:bg-background/80"
                                )}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}