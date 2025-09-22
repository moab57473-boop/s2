import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { X, Plus, Edit, Trash2, Snowflake } from "lucide-react";

interface ConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConfigurationModal({ isOpen, onClose }: ConfigurationModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: businessRules } = useQuery({
    queryKey: ["/api/business-rules"],
    enabled: isOpen,
  });

  const [rules, setRules] = useState({
    mail: { maxWeight: 1.0 },
    regular: { maxWeight: 10.0 },
    insurance: { minValue: 1000.0, enabled: true }
  });

  // Sync rules with fetched data when modal opens
  useEffect(() => {
    if (businessRules && isOpen) {
      setRules(businessRules);
    }
  }, [businessRules, isOpen]);
  
  const currentRules = rules || {
    mail: { maxWeight: 1.0 },
    regular: { maxWeight: 10.0 },
    insurance: { minValue: 1000.0, enabled: true }
  };

  const updateRulesMutation = useMutation({
    mutationFn: async (newRules: any) => {
      return await apiRequest("PUT", "/api/business-rules", newRules);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/business-rules"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({
        title: "Success",
        description: "Business rules updated successfully",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSave = () => {
    updateRulesMutation.mutate(rules);
  };

  const handleReset = () => {
    setRules({
      mail: { maxWeight: 1.0 },
      regular: { maxWeight: 10.0 },
      insurance: { minValue: 1000.0, enabled: true }
    });
  };

  const updateMailWeight = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setRules(prev => ({
        ...prev,
        mail: { ...prev.mail, maxWeight: numValue }
      }));
    }
  };

  const updateRegularWeight = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setRules(prev => ({
        ...prev,
        regular: { ...prev.regular, maxWeight: numValue }
      }));
    }
  };

  const updateInsuranceValue = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setRules(prev => ({
        ...prev,
        insurance: { ...prev.insurance, minValue: numValue }
      }));
    }
  };

  const toggleInsuranceEnabled = (enabled: boolean) => {
    setRules(prev => ({
      ...prev,
      insurance: { ...prev.insurance, enabled }
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-configuration">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Business Rules Configuration</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Configure department routing rules and value thresholds
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-modal">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Weight-based Rules */}
          <div>
            <h4 className="text-md font-medium text-foreground mb-4">Weight-based Department Routing</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Mail Department</Label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">≤</span>
                  <Input
                    type="number"
                    value={currentRules.mail?.maxWeight || 1.0}
                    step="0.1"
                    min="0.1"
                    onChange={(e) => updateMailWeight(e.target.value)}
                    className="flex-1"
                    data-testid="input-mail-weight"
                  />
                  <span className="text-sm text-muted-foreground">kg</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Regular Department</Label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">≤</span>
                  <Input
                    type="number"
                    value={currentRules.regular?.maxWeight || 10.0}
                    step="0.1"
                    min="0.1"
                    onChange={(e) => updateRegularWeight(e.target.value)}
                    className="flex-1"
                    data-testid="input-regular-weight"
                  />
                  <span className="text-sm text-muted-foreground">kg</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Heavy Department</Label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">{'>'}</span>
                  <Input
                    type="number"
                    value={currentRules.regular?.maxWeight || 10.0}
                    className="flex-1"
                    readOnly
                    data-testid="input-heavy-weight"
                  />
                  <span className="text-sm text-muted-foreground">kg</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Value-based Rules */}
          <div>
            <h4 className="text-md font-medium text-foreground mb-4">Value-based Insurance Requirements</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Label className="text-sm font-medium text-foreground">Insurance Review Threshold</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm text-muted-foreground">{'>'}</span>
                    <span className="text-sm text-muted-foreground">€</span>
                    <Input
                      type="number"
                      value={currentRules.insurance?.minValue || 1000.0}
                      step="100"
                      min="0"
                      onChange={(e) => updateInsuranceValue(e.target.value)}
                      className="flex-1"
                      data-testid="input-insurance-threshold"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="enableInsurance"
                    checked={currentRules.insurance?.enabled ?? true}
                    onCheckedChange={toggleInsuranceEnabled}
                    data-testid="checkbox-enable-insurance"
                  />
                  <Label htmlFor="enableInsurance" className="text-sm text-foreground">
                    Enable insurance review
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Custom Departments */}
          <div>
            <h4 className="text-md font-medium text-foreground mb-4">Custom Departments</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-border rounded-md">
                <div className="flex items-center space-x-3">
                  <Snowflake className="text-blue-600" size={20} />
                  <div>
                    <span className="text-sm font-medium text-foreground">Frozen Goods</span>
                    <div className="text-xs text-muted-foreground">Temperature-controlled items</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" data-testid="button-edit-department">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" data-testid="button-remove-department">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full border-2 border-dashed"
                data-testid="button-add-department"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Custom Department
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <div className="flex items-center justify-end space-x-3">
            <Button variant="outline" onClick={handleReset} data-testid="button-reset-defaults">
              Reset to Defaults
            </Button>
            <Button variant="outline" onClick={onClose} data-testid="button-cancel">
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={updateRulesMutation.isPending}
              data-testid="button-save-changes"
            >
              {updateRulesMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
