var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { Card, CardContent } from "@/components/ui/card";
import { Package, CheckCircle, Shield, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
export default function MetricsCards(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j;
    var metrics = _a.metrics, isLoading = _a.isLoading;
    if (isLoading) {
        return (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {__spreadArray([], Array(4), true).map(function (_, i) { return (<Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-16 w-full"/>
            </CardContent>
          </Card>); })}
      </div>);
    }
    var completionRate = (metrics === null || metrics === void 0 ? void 0 : metrics.totalParcels) > 0
        ? ((metrics.processed / metrics.totalParcels) * 100).toFixed(1)
        : "0.0";
    return (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card data-testid="card-total-parcels">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Parcels</p>
              <p className="text-3xl font-bold text-foreground" data-testid="text-total-parcels">
                {(_c = (_b = metrics === null || metrics === void 0 ? void 0 : metrics.totalParcels) === null || _b === void 0 ? void 0 : _b.toLocaleString()) !== null && _c !== void 0 ? _c : "0"}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="text-blue-600 text-xl"/>
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2">
            <span className="inline-block w-0 h-0 border-l-2 border-l-transparent border-r-2 border-r-transparent border-b-2 border-b-green-600 mr-1 mb-0.5"></span>
            {(metrics === null || metrics === void 0 ? void 0 : metrics.totalParcels) > 0 ? "".concat(completionRate, "% completed") : "No parcels yet"}
          </p>
        </CardContent>
      </Card>

      <Card data-testid="card-processed">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Processed</p>
              <p className="text-3xl font-bold text-foreground" data-testid="text-processed">
                {(_e = (_d = metrics === null || metrics === void 0 ? void 0 : metrics.processed) === null || _d === void 0 ? void 0 : _d.toLocaleString()) !== null && _e !== void 0 ? _e : "0"}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-green-600 text-xl"/>
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
                {(_g = (_f = metrics === null || metrics === void 0 ? void 0 : metrics.pendingInsurance) === null || _f === void 0 ? void 0 : _f.toLocaleString()) !== null && _g !== void 0 ? _g : "0"}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Shield className="text-purple-600 text-xl"/>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {(metrics === null || metrics === void 0 ? void 0 : metrics.pendingInsurance) > 0 ? "".concat(((metrics.pendingInsurance / metrics.totalParcels) * 100).toFixed(1), "% of total") : "All insured"}
          </p>
        </CardContent>
      </Card>

      <Card data-testid="card-errors">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Processing Errors</p>
              <p className="text-3xl font-bold text-foreground" data-testid="text-errors">
                {(_j = (_h = metrics === null || metrics === void 0 ? void 0 : metrics.errors) === null || _h === void 0 ? void 0 : _h.toLocaleString()) !== null && _j !== void 0 ? _j : "0"}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="text-red-600 text-xl"/>
            </div>
          </div>
          <p className="text-xs text-red-600 mt-2">
            <span className="inline-block w-0 h-0 border-l-2 border-l-transparent border-r-2 border-r-transparent border-t-2 border-t-red-600 mr-1 mt-0.5"></span>
            {(metrics === null || metrics === void 0 ? void 0 : metrics.errors) > 0 ? "".concat(((metrics.errors / metrics.totalParcels) * 100).toFixed(1), "% error rate") : "No errors"}
          </p>
        </CardContent>
      </Card>
    </div>);
}
