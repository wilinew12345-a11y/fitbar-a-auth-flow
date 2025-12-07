import { Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";

interface FitBarcaLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const FitBarcaLogo = ({ size = "md", className }: FitBarcaLogoProps) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  const textSizes = {
    sm: "text-2xl",
    md: "text-3xl",
    lg: "text-4xl",
  };

  return (
    <div className={cn("flex items-center justify-center gap-3", className)}>
      <div className="bg-primary/20 p-3 rounded-xl backdrop-blur-sm">
        <Dumbbell className={cn(sizeClasses[size], "text-primary")} />
      </div>
      <div>
        <h1 className={cn(textSizes[size], "font-extrabold tracking-tight")}>
          Fit<span className="text-barca-gold">Barça</span>
        </h1>
      </div>
    </div>
  );
};

export default FitBarcaLogo;
