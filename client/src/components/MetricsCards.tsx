import { Card, CardContent } from "@/components/ui/card";
import { Package, CheckCircle, Shield, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface MetricsCardsProps {
  metrics?: any;
  isLoading: boolean;
}

export default function MetricsCards({ metrics, isLoading }: MetricsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const completionRate = metrics?.totalParcels > 0 
    ? ((metrics.processed / metrics.totalParcels) * 100).toFixed(1) 
    : "0.0";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card data-testid="card-total-parcels">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Parcels</p>
              <p className="text-3xl font-bold text-foreground" data-testid="text-total-parcels">
                {metrics?.totalParcels?.toLocaleString() ?? "0"}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="text-blue-600 text-xl" />
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2">
            <span className="inline-block w-0 h-0 border-l-2 border-l-transparent border-r-2 border-r-transparent border-b-2 border-b-green-600 mr-1 mb-0.5"></span>
            12% from yesterday
          </p>
        </CardContent>
      </Card>

      <Card data-testid="card-processed">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Processed</p>
              <p className="text-3xl font-bold text-foreground" data-testid="text-processed">
                {metrics?.processed?.toLocaleString() ?? "0"}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-green-600 text-xl" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {completionRate}% completion rate
          </p>
        </CardContent>
      </Card>

      <Card data-testid="card-pending-insurance">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Insurance</p>
              <p className="text-3xl font-bold text-foreground" data-testid="text-pending-insurance">
                {metrics?.pendingInsurance?.toLocaleString() ?? "0"}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Shield className="text-purple-600 text-xl" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">High-value parcels {'>'} €1,000</p>
        </CardContent>
      </Card>

      <Card data-testid="card-errors">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Processing Errors</p>
              <p className="text-3xl font-bold text-foreground" data-testid="text-errors">
                {metrics?.errors?.toLocaleString() ?? "0"}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="text-red-600 text-xl" />
            </div>
          </div>
          <p className="text-xs text-red-600 mt-2">
            <span className="inline-block w-0 h-0 border-l-2 border-l-transparent border-r-2 border-r-transparent border-t-2 border-t-red-600 mr-1 mt-0.5"></span>
            5 less than yesterday
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
