import type {ButtonHTMLAttributes, ReactElement} from "react";
import { cn } from "../../lib/utils";


function Button({ children, className, type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement>): ReactElement {
  return (
      <button
          type={type}
          className={cn(
              "flex items-center justify-center gap-2 px-5 w-fit h-11 font-semibold rounded-[8px] text-sm",
              "bg-secondary text-secondary-foreground shadow-md cursor-pointer",
              "transition-all duration-200 ease-in-out transform",
              "hover:scale-102 hover:-translate-y-0.5 hover:brightness-110",
              "active:scale-98 active:translate-y-0",
              "disabled:opacity-50 disabled:pointer-events-none",
              className
          )}
          {...props}
      >
        {children}
      </button>
  );
}

export default Button;