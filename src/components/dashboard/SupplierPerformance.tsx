import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";

export function SupplierPerformance() {
  const supplierData = [
    {
      supplier: "MedSup A",
      fillRate: 98,
      onTime: 96,
      avgLeadTime: 3.2,
      landedCostIndex: 0.85,
      recommended: true,
      leadTimeTrend: [3.8, 3.5, 3.2, 3.1, 3.2],
    },
    {
      supplier: "PharmaX",
      fillRate: 94,
      onTime: 98,
      avgLeadTime: 4.1,
      landedCostIndex: 0.92,
      recommended: true,
      leadTimeTrend: [4.5, 4.3, 4.2, 4.0, 4.1],
    },
    {
      supplier: "DentalPro",
      fillRate: 97,
      onTime: 92,
      avgLeadTime: 5.8,
      landedCostIndex: 1.15,
      recommended: false,
      leadTimeTrend: [6.2, 6.0, 5.9, 5.7, 5.8],
    },
    {
      supplier: "DermLine",
      fillRate: 91,
      onTime: 89,
      avgLeadTime: 7.2,
      landedCostIndex: 1.32,
      recommended: false,
      leadTimeTrend: [7.8, 7.5, 7.3, 7.1, 7.2],
    },
  ];

  const Sparkline = ({ data, className }: { data: number[], className?: string }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;
    
    return (
      <svg width="60" height="20" className={className}>
        <path
          d={data.map((value, index) => {
            const x = (index / (data.length - 1)) * 58 + 1;
            const y = 19 - ((value - min) / range) * 18;
            return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
          }).join(' ')}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    );
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-6">
      <div className="card-enterprise-lg p-6">
        <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">Supplier Score & Total Cost</h3>
          <p className="text-sm text-muted-foreground">Performance metrics and cost analysis</p>
        </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table-enterprise">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Fill Rate (%)</th>
                <th>On Time (%)</th>
                <th>Avg Lead Time (d)</th>
                <th>Lead Time Trend</th>
                <th>Total Cost Index</th>
                <th>Recommended</th>
              </tr>
            </thead>
            <tbody>
              {supplierData.map((supplier, index) => (
                <tr key={index} className="hover:bg-muted/30">
                  <td className="font-medium">{supplier.supplier}</td>
                  <td className="text-right">
                    <span className={`font-medium ${
                      supplier.fillRate >= 95 ? 'text-success' : 
                      supplier.fillRate >= 90 ? 'text-warning' : 'text-danger'
                    }`}>
                      {supplier.fillRate}%
                    </span>
                  </td>
                  <td className="text-right">
                    <span className={`font-medium ${
                      supplier.onTime >= 95 ? 'text-success' : 
                      supplier.onTime >= 90 ? 'text-warning' : 'text-danger'
                    }`}>
                      {supplier.onTime}%
                    </span>
                  </td>
                  <td className="text-right">
                    <span className={`font-medium ${
                      supplier.avgLeadTime <= 4 ? 'text-success' : 
                      supplier.avgLeadTime <= 6 ? 'text-warning' : 'text-danger'
                    }`}>
                      {supplier.avgLeadTime}
                    </span>
                  </td>
                  <td className="text-center">
                    <Sparkline 
                      data={supplier.leadTimeTrend} 
                      className={`${
                        supplier.avgLeadTime <= 4 ? 'text-success' : 
                        supplier.avgLeadTime <= 6 ? 'text-warning' : 'text-danger'
                      }`}
                    />
                  </td>
                  <td className="text-right">
                    <span className={`font-medium ${
                      supplier.landedCostIndex <= 1.0 ? 'text-success' : 
                      supplier.landedCostIndex <= 1.2 ? 'text-warning' : 'text-danger'
                    }`}>
                      {supplier.landedCostIndex.toFixed(2)}
                    </span>
                  </td>
                  <td>
                    {supplier.recommended ? (
                      <Badge className="badge-success flex items-center space-x-1 w-fit">
                        <CheckCircle className="w-3 h-3" />
                        <span>Yes</span>
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="flex items-center space-x-1 w-fit text-muted-foreground">
                        <XCircle className="w-3 h-3" />
                        <span>No</span>
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-xs text-muted-foreground">
          <p>
            <strong>Recommended:</strong> Fill Rate ≥95% & On Time ≥95% & Cost Index ≤1.0
          </p>
        </div>
      </div>
    </div>
  );
}