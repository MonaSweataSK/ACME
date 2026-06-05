import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

interface SpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  size?: "small" | "medium" | "large";
}

export function Spinner({ className, size = "medium", ...props }: SpinnerProps) {
  return (
    <Loader2
      className={cn(
        "animate-spin text-current",
        {
          "h-4 w-4": size === "small",
          "h-6 w-6": size === "medium",
          "h-8 w-8": size === "large",
        },
        className
      )}
      {...props}
    />
  );
}
