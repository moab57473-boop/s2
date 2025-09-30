var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create(
        (typeof Iterator === "function" ? Iterator : Object).prototype
      );
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                  ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                  : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Eye,
  Check,
  Truck,
  Wrench,
  Search,
  Mail,
  Package,
  Weight,
  Shield,
  HelpCircle,
  Clock,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
export default function ParcelTable() {
  var _this = this;
  var _a = useState(""),
    statusFilter = _a[0],
    setStatusFilter = _a[1];
  var _b = useState(""),
    departmentFilter = _b[0],
    setDepartmentFilter = _b[1];
  var _c = useState(""),
    searchQuery = _c[0],
    setSearchQuery = _c[1];
  var _d = useState(1),
    currentPage = _d[0],
    setCurrentPage = _d[1];
  var pageSize = 20;
  var queryClient = useQueryClient();
  var toast = useToast().toast;
  var _e = useQuery({
      queryKey: [
        "/api/parcels",
        {
          status: statusFilter !== "all" ? statusFilter : undefined,
          department: departmentFilter !== "all" ? departmentFilter : undefined,
          search: searchQuery || undefined,
          page: currentPage,
          limit: pageSize,
        },
      ],
    }),
    _f = _e.data,
    parcels = _f === void 0 ? [] : _f,
    isLoading = _e.isLoading;
  // Reset page to 1 on filter/search change
  useEffect(
    function () {
      setCurrentPage(1);
    },
    [statusFilter, departmentFilter, searchQuery]
  );
  var approveInsuranceMutation = useMutation({
    mutationFn: function (parcelId) {
      return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
          return [
            2 /*return*/,
            apiRequest(
              "POST",
              "/api/parcels/".concat(parcelId, "/approve-insurance")
            ),
          ];
        });
      });
    },
    onSuccess: function () {
      queryClient.invalidateQueries({ queryKey: ["/api/parcels"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({
        title: "Success",
        description: "Insurance approved successfully",
      });
    },
    onError: function (error) {
      return toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  var completeProcessingMutation = useMutation({
    mutationFn: function (parcelId) {
      return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
          return [
            2 /*return*/,
            apiRequest("POST", "/api/parcels/".concat(parcelId, "/complete")),
          ];
        });
      });
    },
    onSuccess: function () {
      queryClient.invalidateQueries({ queryKey: ["/api/parcels"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({ title: "Success", description: "Parcel processing completed" });
    },
    onError: function (error) {
      return toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  var getStatusBadge = function (status) {
    var statusConfig = {
      pending: { className: "status-pending", icon: Clock, label: "Pending" },
      processing: {
        className: "status-processing",
        icon: Loader2,
        label: "Processing",
      },
      completed: {
        className: "status-completed",
        icon: CheckCircle,
        label: "Completed",
      },
      insurance_review: {
        className: "status-insurance",
        icon: Shield,
        label: "Insurance Review",
      },
      error: { className: "status-error", icon: AlertTriangle, label: "Error" },
    };
    var config = statusConfig[status] || statusConfig.error;
    var Icon = config.icon;
    return (
      <Badge className={"inline-flex items-center ".concat(config.className)}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };
  var getDepartmentBadge = function (department) {
    var deptConfig = {
      mail: {
        className: "bg-cyan-100 text-cyan-800",
        icon: Mail,
        label: "Mail",
      },
      regular: {
        className: "bg-blue-100 text-blue-800",
        icon: Package,
        label: "Regular",
      },
      heavy: {
        className: "bg-orange-100 text-orange-800",
        icon: Weight,
        label: "Heavy",
      },
      insurance: {
        className: "bg-purple-100 text-purple-800",
        icon: Shield,
        label: "Insurance",
      },
      unassigned: {
        className: "bg-gray-100 text-gray-800",
        icon: HelpCircle,
        label: "Unassigned",
      },
    };
    var config = deptConfig[department] || deptConfig.unassigned;
    var Icon = config.icon;
    return (
      <Badge className={"inline-flex items-center ".concat(config.className)}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };
  var formatValue = function (value) {
    var numValue = typeof value === "string" ? parseFloat(value) : value;
    return isNaN(numValue) ? "€0.00" : "\u20AC".concat(numValue.toFixed(2));
  };
  var formatWeight = function (weight) {
    var numWeight = typeof weight === "string" ? parseFloat(weight) : weight;
    return isNaN(numWeight) ? "ERROR" : "".concat(numWeight.toFixed(1), " kg");
  };
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Parcels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {__spreadArray([], Array(5), true).map(function (_, i) {
              return <Skeleton key={i} className="h-16 w-full" />;
            })}
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
              <SelectTrigger
                className="w-40"
                data-testid="select-status-filter"
              >
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="insurance_review">
                  Insurance Review
                </SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={departmentFilter}
              onValueChange={setDepartmentFilter}
            >
              <SelectTrigger
                className="w-40"
                data-testid="select-department-filter"
              >
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
                onChange={function (e) {
                  return setSearchQuery(e.target.value);
                }}
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
              {parcels.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No parcels found. Upload an XML file to get started.
                  </TableCell>
                </TableRow>
              ) : (
                parcels.map(function (parcel) {
                  return (
                    <TableRow
                      key={parcel.id}
                      className="hover:bg-muted/50 transition-colors"
                      data-testid={"row-parcel-".concat(parcel.id)}
                    >
                      <TableCell>
                        <div className="font-mono text-sm text-foreground">
                          {parcel.parcelId}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-foreground">
                          {formatWeight(parcel.weight)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-foreground">
                          {formatValue(parcel.value)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getDepartmentBadge(parcel.department)}
                      </TableCell>
                      <TableCell>{getStatusBadge(parcel.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {new Date(parcel.processingTime).toLocaleTimeString(
                            "en-US",
                            { timeZone: "UTC", hour12: false }
                          )}{" "}
                          UTC
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {parcel.status === "insurance_review" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={function () {
                                return approveInsuranceMutation.mutate(
                                  parcel.parcelId
                                );
                              }}
                              disabled={approveInsuranceMutation.isPending}
                              className="text-purple-600 hover:text-purple-500"
                            >
                              <Shield className="h-4 w-4" />
                            </Button>
                          )}
                          {parcel.status === "processing" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={function () {
                                return completeProcessingMutation.mutate(
                                  parcel.parcelId
                                );
                              }}
                              disabled={completeProcessingMutation.isPending}
                              className="text-green-600 hover:text-green-500"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          {parcel.status === "completed" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-500"
                            >
                              <Truck className="h-4 w-4" />
                            </Button>
                          )}
                          {parcel.status === "error" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-500"
                            >
                              <Wrench className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {parcels.length > 0 && (
          <div className="px-6 py-3 border-t border-border flex items-center justify-between">
            <div
              className="text-sm text-muted-foreground"
              data-testid="text-pagination-info"
            >
              Showing{" "}
              <span className="font-medium">
                {(currentPage - 1) * pageSize + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(currentPage * pageSize, parcels.length)}
              </span>{" "}
              of <span className="font-medium">{parcels.length}</span> results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={function () {
                  return setCurrentPage(function (prev) {
                    return Math.max(prev - 1, 1);
                  });
                }}
                data-testid="button-previous"
              >
                Previous
              </Button>
              <Button
                variant="default"
                size="sm"
                data-testid={"button-page-".concat(currentPage)}
              >
                {currentPage}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={parcels.length < pageSize}
                onClick={function () {
                  return setCurrentPage(function (prev) {
                    return prev + 1;
                  });
                }}
                data-testid="button-next"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
