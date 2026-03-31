import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const LOGO_LIGHT = "/logo-jelt.png";
const LOGO_DARK = "/logo_jelt_white.png";

type JeltLogoProps = {
  className?: string;
  alt?: string;
};

export function JeltLogo({ className, alt = "Jelt" }: JeltLogoProps) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const src =
    mounted && resolvedTheme === "dark" ? LOGO_DARK : LOGO_LIGHT;

  return (
    <img
      src={src}
      alt={alt}
      className={cn("h-auto w-auto object-contain object-left", className)}
      decoding="async"
    />
  );
}
