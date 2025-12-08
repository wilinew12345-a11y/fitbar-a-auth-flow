import { cn } from "@/lib/utils";

interface FitBarcaLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const FitBarcaLogo = ({ size = "md", className }: FitBarcaLogoProps) => {
  const textSizes = {
    sm: "text-3xl",
    md: "text-4xl",
    lg: "text-5xl",
  };

  const lineSizes = {
    sm: "w-12",
    md: "w-16",
    lg: "w-20",
  };

  const dotSizes = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-2.5 h-2.5",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
      <h1 className={cn(textSizes[size], "font-extrabold tracking-widest")}>
        <span className="text-primary">FIT</span>
        <span className="text-accent">BARÇA</span>
      </h1>
      {/* Decorative line */}
      <div className="flex items-center gap-2">
        <div className={cn(lineSizes[size], "h-0.5 bg-primary rounded-full")} />
        <div className={cn(dotSizes[size], "bg-barca-gold rounded-full")} />
        <div className={cn(lineSizes[size], "h-0.5 bg-accent rounded-full")} />
      </div>
    </div>
  );
};

export default FitBarcaLogo;
