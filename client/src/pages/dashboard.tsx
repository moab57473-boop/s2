import Layout from "@/components/Layout";
import MetricsCards from "@/components/MetricsCards";
import DepartmentOverview from "@/components/DepartmentOverview";
import ParcelTable from "@/components/ParcelTable";
import ConfigurationModal from "@/components/ConfigurationModal";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { RotateCcw, Settings } from "lucide-react";

export default function Dashboard() {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      // Refresh all data by invalidating queries
      await queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/parcels"] });
      return true;
    }
  });

  const handleRefresh = () => {
    refreshMutation.mutate();
  };

  return (
    <Layout>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Parcel Processing Dashboard</h2>
              <p className="text-muted-foreground">
                Container_68465468.xml - Processed at{" "}
                <span data-testid="text-processing-time">
                  {new Date().toLocaleTimeString('en-US', { 
                    timeZone: 'UTC',
                    hour12: false 
                  })} UTC
                </span>
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshMutation.isPending}
                data-testid="button-refresh"
              >
                <RotateCcw className={`h-4 w-4 mr-2 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={() => setIsConfigOpen(true)}
                data-testid="button-configure-rules"
              >
                <Settings className="h-4 w-4 mr-2" />
                Configure Rules
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            <MetricsCards metrics={metrics} isLoading={metricsLoading} />
            <DepartmentOverview metrics={metrics} isLoading={metricsLoading} />
            <ParcelTable />
          </div>
        </div>
      </div>

      <ConfigurationModal 
        isOpen={isConfigOpen} 
        onClose={() => setIsConfigOpen(false)} 
      />
    </Layout>
  );
}
