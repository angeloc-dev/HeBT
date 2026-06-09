import { type ReactNode, type ReactElement, useRef, useState } from "react";
import { cn } from "@/lib/utils.ts";

interface ContainerProps {
    children: ReactNode;
    className?: string;
}

function Container({ children, className }: ContainerProps): ReactElement {
    const divRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!divRef.current) return;
        const rect = divRef.current.getBoundingClientRect();
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setOpacity(1)}
            onMouseLeave={() => setOpacity(0)}
            className={cn(
                "relative w-full rounded-3xl border border-border/20 bg-transparent overflow-hidden shadow-xl",
                className
            )}
        >
            <div
                className="pointer-events-none absolute -inset-px transition-opacity duration-300 ease-in-out"
                style={{
                    opacity,
                    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(34,197,94,0.3) 0%, rgba(6,182,212,0.15) 25%, rgba(245,158,11,0.05) 50%, transparent 80%)`,
                }}
            />
            <div className="relative h-full w-full rounded-[23px] bg-background/60 backdrop-blur-md p-6 md:p-8">
                {children}
            </div>
        </div>
    );
}

export default Container;