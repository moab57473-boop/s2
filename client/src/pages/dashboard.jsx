import * as React from "react";
import Layout from "@/components/Layout";
import MetricsCards from "@/components/MetricsCards";
import DepartmentOverview from "@/components/DepartmentOverview";
import ParcelTable from "@/components/ParcelTable";
import ConfigurationModal from "@/components/ConfigurationModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { RotateCcw, Settings, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const fileInputRef = React.useRef(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
    refetchOnMount: true,
    staleTime: 0,
    gcTime: 0,
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to reset data");
      }

      setUploadFile(null);
      await queryClient.invalidateQueries();
      await Promise.all([
        queryClient.refetchQueries({
          queryKey: ["/api/dashboard/metrics"],
          exact: true,
        }),
        queryClient.refetchQueries({
          queryKey: ["/api/parcels"],
          exact: false,
        }),
        queryClient.refetchQueries({
          queryKey: ["/api/business-rules"],
          exact: true,
        }),
      ]);
    },
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: ["/api/dashboard/metrics"],
        exact: true,
      });
      toast({
        title: "Success",
        description: "All data has been refreshed",
      });
    },
    onError: (error) => {
      toast({
        title: "Refresh Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append("xmlFile", file);

      const response = await fetch("/api/parcels/upload-xml", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Upload failed: ${text}`);
      }

      return await response.json();
    },
    onSuccess: (data) => {
      Promise.all([
        queryClient.refetchQueries({
          queryKey: ["/api/dashboard/metrics"],
          exact: true,
        }),
        queryClient.refetchQueries({
          queryKey: ["/api/parcels"],
          exact: false,
        }),
      ]);

      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        fileInput.value = "";
      }
      setUploadFile(null);

      toast({
        title: "Success",
        description: `Successfully processed ${
          data.parcels?.length || 0
        } parcels`,
      });
    },
    onError: (error) => {
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        fileInput.value = "";
      }
      setUploadFile(null);

      toast({
        title: "Upload Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRefresh = () => {
    refreshMutation.mutate();
  };

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setUploadFile(null);
  };

  const handleFileUpload = () => {
    if (uploadFile) {
      uploadMutation.mutate(uploadFile);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (
        file.type === "text/xml" ||
        file.name.toLowerCase().endsWith(".xml")
      ) {
        setUploadFile(file);
      } else {
        resetFileInput();
        toast({
          title: "Invalid File",
          description: "Please select a valid XML file",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Layout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">
              Parcel Processing Dashboard
            </h2>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Input
                  type="file"
                  accept=".xml"
                  onChange={handleFileChange}
                  className="w-48"
                  data-testid="input-xml-file"
                />
                <Button
                  onClick={handleFileUpload}
                  disabled={!uploadFile || uploadMutation.isPending}
                  data-testid="button-upload-xml"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadMutation.isPending ? "Processing..." : "Upload XML"}
                </Button>
              </div>
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshMutation.isPending}
                data-testid="button-refresh"
              >
                <RotateCcw
                  className={`h-4 w-4 mr-2 ${
                    refreshMutation.isPending ? "animate-spin" : ""
                  }`}
                />
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
