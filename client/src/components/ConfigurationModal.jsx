var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
export default function ConfigurationModal(_a) {
    var _this = this;
    var isOpen = _a.isOpen, onClose = _a.onClose;
    var queryClient = useQueryClient();
    var toast = useToast().toast;
    var businessRules = useQuery({
        queryKey: ["/api/business-rules"],
        enabled: isOpen,
    }).data;
    var _b = useState({
        mail: { maxWeight: 1.0 },
        regular: { maxWeight: 10.0 },
        heavy: { minWeight: 10.0 },
        insurance: { minValue: 1000.0, enabled: true }
    }), rules = _b[0], setRules = _b[1];
    // Sync rules with fetched data when modal opens
    useEffect(function () {
        var _a, _b, _c, _d;
        if (businessRules && isOpen) {
            setRules({
                mail: (_a = businessRules.mail) !== null && _a !== void 0 ? _a : { maxWeight: 1.0 },
                regular: (_b = businessRules.regular) !== null && _b !== void 0 ? _b : { maxWeight: 10.0 },
                heavy: (_c = businessRules.heavy) !== null && _c !== void 0 ? _c : { minWeight: 10.0 },
                insurance: (_d = businessRules.insurance) !== null && _d !== void 0 ? _d : { minValue: 1000.0, enabled: true },
            });
        }
    }, [businessRules, isOpen]);
    var updateRulesMutation = useMutation({
        mutationFn: function (newRules) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest("PUT", "/api/business-rules", newRules)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/business-rules"] });
            queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
            toast({ title: "Success", description: "Business rules updated successfully" });
            onClose();
        },
        onError: function (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });
    var handleSave = function () {
        // Validate that mail < regular < heavy
        if (rules.mail.maxWeight >= rules.regular.maxWeight) {
            toast({
                title: "Validation Error",
                description: "Mail weight must be less than Regular weight",
                variant: "destructive"
            });
            return;
        }
        if (rules.regular.maxWeight > rules.heavy.minWeight) {
            toast({
                title: "Validation Error",
                description: "Regular weight must be less than Heavy weight",
                variant: "destructive"
            });
            return;
        }
        updateRulesMutation.mutate(rules);
    };
    var handleReset = function () { return setRules({
        mail: { maxWeight: 1.0 },
        regular: { maxWeight: 10.0 },
        heavy: { minWeight: 10.0 },
        insurance: { minValue: 1000.0, enabled: true }
    }); };
    var updateMailWeight = function (value) {
        var numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue > 0)
            setRules(function (prev) { return (__assign(__assign({}, prev), { mail: { maxWeight: numValue } })); });
    };
    var updateRegularWeight = function (value) {
        var numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue > 0)
            setRules(function (prev) { return (__assign(__assign({}, prev), { regular: { maxWeight: numValue } })); });
    };
    var updateHeavyWeight = function (value) {
        var numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue > 0) {
            setRules(function (prev) { return (__assign(__assign({}, prev), { heavy: { minWeight: numValue } })); });
        }
    };
    var updateInsuranceValue = function (value) {
        var numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue >= 0)
            setRules(function (prev) { return (__assign(__assign({}, prev), { insurance: __assign(__assign({}, prev.insurance), { minValue: numValue }) })); });
    };
    var toggleInsuranceEnabled = function (enabled) { return setRules(function (prev) { return (__assign(__assign({}, prev), { insurance: __assign(__assign({}, prev.insurance), { enabled: enabled }) })); }); };
    return (<Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-configuration">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Business Rules Configuration</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">Configure department routing rules and value thresholds</p>
            </div>
            
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Weight-based Rules */}
          <div>
            <h4 className="text-md font-medium text-foreground mb-4">Weight-based Department Routing</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Mail */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Mail Department</Label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">≤</span>
                  <Input type="number" value={rules.mail.maxWeight} step="0.1" min="0.1" onChange={function (e) { return updateMailWeight(e.target.value); }} className="flex-1" data-testid="input-mail-weight"/>
                  <span className="text-sm text-muted-foreground">kg</span>
                </div>
              </div>

              {/* Regular */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Regular Department</Label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">≤</span>
                  <Input type="number" value={rules.regular.maxWeight} step="0.1" min="0.1" onChange={function (e) { return updateRegularWeight(e.target.value); }} className="flex-1" data-testid="input-regular-weight"/>
                  <span className="text-sm text-muted-foreground">kg</span>
                </div>
              </div>

              {/* Heavy */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Heavy Department</Label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">{'>'}</span>
                  <Input type="number" value={rules.heavy.minWeight} step="0.1" min="0.1" onChange={function (e) { return updateHeavyWeight(e.target.value); }} className="flex-1" data-testid="input-heavy-weight"/>
                  <span className="text-sm text-muted-foreground">kg</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Insurance */}
          <div>
            <h4 className="text-md font-medium text-foreground mb-4">Value-based Insurance Requirements</h4>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Label className="text-sm font-medium text-foreground">Insurance Review Threshold</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm text-muted-foreground">{'>'}</span>
                  <span className="text-sm text-muted-foreground">€</span>
                  <Input type="number" value={rules.insurance.minValue} step="100" min="0" onChange={function (e) { return updateInsuranceValue(e.target.value); }} className="flex-1" data-testid="input-insurance-threshold"/>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="enableInsurance" checked={rules.insurance.enabled} onCheckedChange={toggleInsuranceEnabled} data-testid="checkbox-enable-insurance"/>
                <Label htmlFor="enableInsurance" className="text-sm text-foreground">Enable insurance review</Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <div className="flex items-center justify-end space-x-3">
            <Button variant="outline" onClick={handleReset} data-testid="button-reset-defaults">Reset to Defaults</Button>
            <Button variant="outline" onClick={onClose} data-testid="button-cancel">Cancel</Button>
            <Button onClick={handleSave} disabled={updateRulesMutation.isPending} data-testid="button-save-changes">
              {updateRulesMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>);
}
