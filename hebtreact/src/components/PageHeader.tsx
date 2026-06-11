import { type ReactElement, type ReactNode } from "react";
import Container from "@/components/ui/Container.tsx";
import InputText from "@/components/ui/InputText.tsx";
import Button from "@/components/ui/Button.tsx";
import { FiSearch } from "react-icons/fi";

interface PageHeaderProps {
    title?: string;
    description?: string;
    action?: ReactNode;
    searchValue?: string;
    onSearchChange?: (val: string) => void;
    onSearchFocus?: () => void;
    onSearchBlur?: () => void;
    searchPlaceholder?: string;
    searchOverlay?: ReactNode;
    hideSearch?: boolean;
    buttonText?: string;
    buttonIcon?: ReactNode;
    onButtonClick?: () => void;
    buttonClassName?: string;
}

export default function PageHeader({
                                       title,
                                       description,
                                       action,
                                       searchValue,
                                       onSearchChange,
                                       onSearchFocus,
                                       onSearchBlur,
                                       searchPlaceholder = "Cerca...",
                                       searchOverlay,
                                       hideSearch = false,
                                       buttonText,
                                       buttonIcon,
                                       onButtonClick,
                                       buttonClassName
                                   }: PageHeaderProps): ReactElement {
    return (
        <Container className="overflow-visible relative z-50 flex flex-col gap-6">
            {(title || description) && (
                <div className="flex flex-col gap-1.5 border-b border-border/50 pb-4">
                    {title && (
                        <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                            {title}
                        </h1>
                    )}
                    {description && (
                        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                            {description}
                        </p>
                    )}
                </div>
            )}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                {!hideSearch ? (
                    <div className="relative w-full md:max-w-md z-50">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiSearch className="text-muted-foreground w-5 h-5" />
                        </div>
                        <InputText
                            type="text"
                            placeholder={searchPlaceholder}
                            className="pl-10"
                            value={searchValue || ""}
                            autoComplete="off"
                            data-1p-ignore
                            onChange={(e) => onSearchChange?.(e.target.value)}
                            onFocus={onSearchFocus}
                            onBlur={onSearchBlur}
                        />
                        {searchOverlay && (
                            <div className="absolute top-full left-0 w-full mt-2 z-[100]">
                                {searchOverlay}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="hidden md:block flex-1" />
                )}
                <div className="w-full md:w-auto shrink-0">
                    {action ? (
                        action
                    ) : (
                        buttonText && onButtonClick && (
                            <Button
                                onClick={onButtonClick}
                                className={`w-full md:w-auto text-foreground ${buttonClassName || ""}`}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    {buttonIcon}
                                    {buttonText}
                                </span>
                            </Button>
                        )
                    )}
                </div>
            </div>
        </Container>
    );
}