import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Eye, Check, Truck, Wrench, Search, Mail, Package, Weight, Shield, HelpCircle, Clock, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function ParcelTable() {
  const [statusFilter, setStatusFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: parcels = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/parcels", { 
      status: statusFilter && statusFilter !== 'all' ? statusFilter : undefined,
      department: departmentFilter && departmentFilter !== 'all' ? departmentFilter : undefined,
      search: searchQuery || undefined
    }],
  });

  const approveInsuranceMutation = useMutation({
    mutationFn: async (parcelId: string) => {
      return await apiRequest("POST", `/api/parcels/${parcelId}/approve-insurance`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parcels"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({
        title: "Success",
        description: "Insurance approved successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const completeProcessingMutation = useMutation({
    mutationFn: async (parcelId: string) => {
      return await apiRequest("POST", `/api/parcels/${parcelId}/complete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parcels"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({
        title: "Success",
        description: "Parcel processing completed",
      });
    },
    onError: (error) => {
      toast({
        title: "Error", 
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { className: "status-pending", icon: Clock, label: "Pending" },
      processing: { className: "status-processing", icon: Loader2, label: "Processing" },
      completed: { className: "status-completed", icon: CheckCircle, label: "Completed" },
      insurance_review: { className: "status-insurance", icon: Shield, label: "Insurance Review" },
      error: { className: "status-error", icon: AlertTriangle, label: "Error" }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.error;
    const Icon = config.icon;

    return (
      <Badge className={`inline-flex items-center ${config.className}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getDepartmentBadge = (department: string) => {
    const deptConfig = {
      mail: { className: "bg-cyan-100 text-cyan-800", icon: Mail, label: "Mail" },
      regular: { className: "bg-blue-100 text-blue-800", icon: Package, label: "Regular" },
      heavy: { className: "bg-orange-100 text-orange-800", icon: Weight, label: "Heavy" },
      insurance: { className: "bg-purple-100 text-purple-800", icon: Shield, label: "Insurance" },
      unassigned: { className: "bg-gray-100 text-gray-800", icon: HelpCircle, label: "Unassigned" }
    };

    const config = deptConfig[department as keyof typeof deptConfig] || deptConfig.unassigned;
    const Icon = config.icon;

    return (
      <Badge className={`inline-flex items-center ${config.className}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const formatValue = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(numValue) ? "€0.00" : `€${numValue.toFixed(2)}`;
  };

  const formatWeight = (weight: string | number) => {
    const numWeight = typeof weight === 'string' ? parseFloat(weight) : weight;
    return isNaN(numWeight) ? "ERROR" : `${numWeight.toFixed(1)} kg`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Parcels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-parcel-table">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Parcels</CardTitle>
          <div className="flex items-center space-x-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40" data-testid="select-status-filter">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="insurance_review">Insurance Review</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-40" data-testid="select-department-filter">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="mail">Mail</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="heavy">Heavy</SelectItem>
                <SelectItem value="insurance">Insurance</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search parcels..."
                className="pl-10 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-parcels"
              />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parcel ID</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Processing Time</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(parcels as any[]).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No parcels found. Upload an XML file to get started.
                  </TableCell>
                </TableRow>
              ) : (
                parcels.map((parcel: any) => (
                  <TableRow key={parcel.id} className="hover:bg-muted/50 transition-colors" data-testid={`row-parcel-${parcel.id}`}>
                    <TableCell>
                      <div className="font-mono text-sm text-foreground" data-testid={`text-parcel-id-${parcel.id}`}>
                        {parcel.parcelId}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-foreground" data-testid={`text-weight-${parcel.id}`}>
                        {formatWeight(parcel.weight)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-foreground" data-testid={`text-value-${parcel.id}`}>
                        {formatValue(parcel.value)}
                      </div>
                    </TableCell>
                    <TableCell data-testid={`text-department-${parcel.id}`}>
                      {getDepartmentBadge(parcel.department)}
                    </TableCell>
                    <TableCell data-testid={`text-status-${parcel.id}`}>
                      {getStatusBadge(parcel.status)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground" data-testid={`text-processing-time-${parcel.id}`}>
                        {new Date(parcel.processingTime).toLocaleTimeString('en-US', {
                          timeZone: 'UTC',
                          hour12: false
                        })} UTC
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" data-testid={`button-view-${parcel.id}`}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {parcel.status === "insurance_review" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => approveInsuranceMutation.mutate(parcel.parcelId)}
                            disabled={approveInsuranceMutation.isPending}
                            className="text-purple-600 hover:text-purple-500"
                            data-testid={`button-approve-insurance-${parcel.id}`}
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {parcel.status === "processing" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => completeProcessingMutation.mutate(parcel.parcelId)}
                            disabled={completeProcessingMutation.isPending}
                            className="text-green-600 hover:text-green-500"
                            data-testid={`button-complete-${parcel.id}`}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {parcel.status === "completed" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-500"
                            data-testid={`button-track-${parcel.id}`}
                          >
                            <Truck className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {parcel.status === "error" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-500"
                            data-testid={`button-fix-error-${parcel.id}`}
                          >
                            <Wrench className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {(parcels as any[]).length > 0 && (
          <div className="px-6 py-3 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground" data-testid="text-pagination-info">
                Showing <span className="font-medium">1</span> to{" "}
                <span className="font-medium">{Math.min((parcels as any[]).length, 20)}</span> of{" "}
                <span className="font-medium">{(parcels as any[]).length}</span> results
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled data-testid="button-previous">
                  Previous
                </Button>
                <Button variant="default" size="sm" data-testid="button-page-1">1</Button>
                <Button variant="outline" size="sm" data-testid="button-next">
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
