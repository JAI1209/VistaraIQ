type LogoProps = {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
};

const sizeMap = {
  sm: "text-lg tracking-[-0.02em]",
  md: "text-2xl tracking-[-0.02em]",
  lg: "text-3xl tracking-[-0.02em]",
  xl: "text-5xl tracking-[-0.03em]",
};

export function Logo({ className = "", size = "md" }: LogoProps) {
  return (
    <h1
      className={`select-none font-semibold ${sizeMap[size]} ${className}`}
      aria-label="VistaraIQ"
    >
      <span className="text-slate-100">Vistara</span>
      <span className="ml-0.5 bg-gradient-to-r from-[#3B82F6] to-[#7AA2FF] bg-clip-text text-transparent">
        IQ
      </span>
    </h1>
  );
}
