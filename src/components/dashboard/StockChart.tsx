import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

export function StockChart() {
  const stockData = [
    { site: "Clínica Principal", ppe: 45, injectables: 30, dental: 15, derm: 8, ortho: 2 },
    { site: "Sucursal Norte", ppe: 35, injectables: 25, dental: 20, derm: 15, ortho: 5 },
    { site: "Sucursal Oeste", ppe: 40, injectables: 28, dental: 18, derm: 10, ortho: 4 },
  ];

  const categories = [
    { name: "EPP", color: "bg-chart-primary" },
    { name: "Inyectables", color: "bg-chart-secondary" },
    { name: "Dental", color: "bg-chart-accent" },
    { name: "Derm", color: "bg-chart-gray" },
    { name: "Ortopedia", color: "bg-chart-light-gray" },
  ];

  return (
    <div className="card-enterprise-lg p-6 h-[400px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">Stock by Site</h3>
          <p className="text-sm text-muted-foreground">Main Category Distribution</p>
        </div>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6">
        {categories.map((category) => (
          <div key={category.name} className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded ${category.color}`}></div>
            <span className="text-xs text-muted-foreground">{category.name}</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="space-y-4 flex-1">
        {stockData.map((site, index) => {
          const total = site.ppe + site.injectables + site.dental + site.derm + site.ortho;
          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-card-foreground">{site.site}</span>
                <span className="text-xs text-muted-foreground">{total}% capacity</span>
              </div>
              <div className="flex h-8 bg-muted rounded-lg overflow-hidden">
                <div 
                  className="bg-chart-primary"
                  style={{ width: `${site.ppe}%` }}
                  title={`EPP: ${site.ppe}%`}
                ></div>
                <div 
                  className="bg-chart-secondary"
                  style={{ width: `${site.injectables}%` }}
                  title={`Inyectables: ${site.injectables}%`}
                ></div>
                <div 
                  className="bg-chart-accent"
                  style={{ width: `${site.dental}%` }}
                  title={`Dental: ${site.dental}%`}
                ></div>
                <div 
                  className="bg-chart-gray"
                  style={{ width: `${site.derm}%` }}
                  title={`Derm: ${site.derm}%`}
                ></div>
                <div 
                  className="bg-chart-light-gray"
                  style={{ width: `${site.ortho}%` }}
                  title={`Ortopedia: ${site.ortho}%`}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}