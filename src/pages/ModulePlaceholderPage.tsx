import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type ModulePlaceholderPageProps = {
  title: string;
  description?: string;
};

export default function ModulePlaceholderPage({ title, description }: ModulePlaceholderPageProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-md w-full rounded-xl border border-[hsl(var(--border))] bg-card p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-foreground mb-2">{title}</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {description ??
            "Módulo en preparación para la demo. Aquí conectaremos el flujo real cuando el cliente apruebe la propuesta."}
        </p>
        <Button variant="outline" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al inicio
        </Button>
      </div>
    </div>
  );
}
