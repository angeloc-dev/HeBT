import { useState, useRef, useEffect, type ReactElement } from "react";
import { FiChevronDown } from "react-icons/fi";
import { cn } from "@/lib/utils";
import type { OptionGroup, SelectOption } from "@/model/data-model.ts";

interface SelectProps {
    options?: SelectOption[];
    groups?: OptionGroup[];
    value: string | number;
    onChange: (value: string | number) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export default function Select({
                                   options = [],
                                   groups,
                                   value,
                                   onChange,
                                   placeholder = "Seleziona...",
                                   className,
                                   disabled
                               }: SelectProps): ReactElement {
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

    const allOptions = groups ? groups.flatMap(g => g.options) : options;
    const selectedOption = allOptions.find((opt) => opt.value === value);
    const SelectedIcon = selectedOption?.icon;

    const renderOption = (option: SelectOption) => {
        const Icon = option.icon;
        return (
            <button
                key={option.value}
                type="button"
                onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                }}
                className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer text-left text-foreground",
                    option.value === value ? "bg-primary/20 text-primary font-bold" : "hover:bg-background/80"
                )}
            >
                {Icon && <Icon className={cn("w-4 h-4 shrink-0", option.value === value ? "text-primary" : "text-muted-foreground")} />}
                <span className="truncate">{option.label}</span>
            </button>
        );
    };

    return (
        <div className={cn("relative w-full", className)} ref={dropdownRef}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                data-1p-ignore="true"
                data-lpignore="true"
                data-form-type="other"
                className={cn(
                    "flex h-12 w-full items-center justify-between rounded-xl border border-border/50 bg-background/50 px-4 py-2 text-sm text-foreground transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-primary",
                    disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-background/80"
                )}
            >
                <span className={cn("flex items-center gap-2 truncate", selectedOption ? "text-foreground" : "text-muted-foreground")}>
                    {SelectedIcon && <SelectedIcon className="w-4 h-4 text-muted-foreground shrink-0" />}
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <FiChevronDown className={cn("w-5 h-5 transition-transform duration-200 text-muted-foreground shrink-0", isOpen && "rotate-180")} />
            </button>
            {isOpen && !disabled && (
                <div className="absolute left-0 right-0 top-[calc(100%+5px)] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-60 overflow-y-auto rounded-xl border border-border/50 bg-background/95 backdrop-blur-xl p-1 shadow-2xl custom-scrollbar">
                        {groups ? (
                            groups.map((group, groupIndex) => (
                                <div key={groupIndex} className="mb-2 last:mb-0">
                                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-background/80 sticky top-0 backdrop-blur-md z-10 rounded-md mb-1">
                                        {group.label}
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        {group.options.map(renderOption)}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col gap-0.5">
                                {options.map(renderOption)}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}