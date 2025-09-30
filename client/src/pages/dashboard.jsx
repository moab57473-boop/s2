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
    var _this = this;
    var _a = useState(false), isConfigOpen = _a[0], setIsConfigOpen = _a[1];
    var _b = useState(null), uploadFile = _b[0], setUploadFile = _b[1];
    var queryClient = useQueryClient();
    var toast = useToast().toast;
    var _c = useQuery({
        queryKey: ["/api/dashboard/metrics"],
        refetchOnMount: true,
        staleTime: 0,
        gcTime: 0
    }), metrics = _c.data, metricsLoading = _c.isLoading;
    var refreshMutation = useMutation({
        mutationFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("/api/reset", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include"
                        })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error('Failed to reset data');
                        }
                        // Reset file upload state
                        setUploadFile(null);
                        // First invalidate all queries
                        return [4 /*yield*/, queryClient.invalidateQueries()];
                    case 2:
                        // First invalidate all queries
                        _a.sent();
                        // Then force immediate refetch of specific queries
                        return [4 /*yield*/, Promise.all([
                                queryClient.refetchQueries({ queryKey: ["/api/dashboard/metrics"], exact: true }),
                                queryClient.refetchQueries({ queryKey: ["/api/parcels"], exact: false }),
                                queryClient.refetchQueries({ queryKey: ["/api/business-rules"], exact: true })
                            ])];
                    case 3:
                        // Then force immediate refetch of specific queries
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        onSuccess: function () {
            // Force a refetch of the metrics query specifically
            queryClient.refetchQueries({ queryKey: ["/api/dashboard/metrics"], exact: true });
            toast({
                title: "Success",
                description: "All data has been refreshed",
            });
        },
        onError: function (error) {
            toast({
                title: "Refresh Error",
                description: error.message,
                variant: "destructive",
            });
        }
    });
    var uploadMutation = useMutation({
        mutationFn: function (file) { return __awaiter(_this, void 0, void 0, function () {
            var formData, response, text;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        formData = new FormData();
                        formData.append('xmlFile', file);
                        return [4 /*yield*/, fetch('/api/parcels/upload-xml', {
                                method: 'POST',
                                body: formData,
                                credentials: 'include',
                            })];
                    case 1:
                        response = _a.sent();
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.text()];
                    case 2:
                        text = _a.sent();
                        throw new Error("Upload failed: ".concat(text));
                    case 3: return [4 /*yield*/, response.json()];
                    case 4: return [2 /*return*/, _a.sent()];
                }
            });
        }); },
        onSuccess: function (data) {
            var _a;
            // Force refetch the queries - use exact: false to match all parcel queries with different filter parameters
            Promise.all([
                queryClient.refetchQueries({ queryKey: ["/api/dashboard/metrics"], exact: true }),
                queryClient.refetchQueries({ queryKey: ["/api/parcels"], exact: false })
            ]);
            // Reset the file input value
            var fileInput = document.querySelector('input[type="file"]');
            if (fileInput) {
                fileInput.value = '';
            }
            setUploadFile(null);
            toast({
                title: "Success",
                description: "Successfully processed ".concat(((_a = data.parcels) === null || _a === void 0 ? void 0 : _a.length) || 0, " parcels"),
            });
        },
        onError: function (error) {
            // Reset the file input value even on error
            var fileInput = document.querySelector('input[type="file"]');
            if (fileInput) {
                fileInput.value = '';
            }
            setUploadFile(null);
            toast({
                title: "Upload Error",
                description: error.message,
                variant: "destructive",
            });
        }
    });
    var handleRefresh = function () {
        refreshMutation.mutate();
    };
    var fileInputRef = React.useRef(null);
    var resetFileInput = function () {
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setUploadFile(null);
    };
    var handleFileUpload = function () {
        if (uploadFile) {
            uploadMutation.mutate(uploadFile);
        }
    };
    var handleFileChange = function (e) {
        var _a;
        var file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (file) {
            if (file.type === 'text/xml' || file.name.toLowerCase().endsWith('.xml')) {
                setUploadFile(file);
            }
            else {
                resetFileInput();
                toast({
                    title: "Invalid File",
                    description: "Please select a valid XML file",
                    variant: "destructive",
                });
            }
        }
    };
    return (<Layout>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
    <header className="bg-card border-b border-border px-6 py-4">
  <div className="flex items-center justify-between">
    <h2 className="text-2xl font-bold text-foreground">Parcel Processing Dashboard</h2>
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        <Input type="file" accept=".xml" onChange={handleFileChange} className="w-48" data-testid="input-xml-file"/>
        <Button onClick={handleFileUpload} disabled={!uploadFile || uploadMutation.isPending} data-testid="button-upload-xml">
          <Upload className="h-4 w-4 mr-2"/>
          {uploadMutation.isPending ? "Processing..." : "Upload XML"}
        </Button>
      </div>
      <Button variant="outline" onClick={handleRefresh} disabled={refreshMutation.isPending} data-testid="button-refresh">
        <RotateCcw className={"h-4 w-4 mr-2 ".concat(refreshMutation.isPending ? "animate-spin" : "")}/>
        Refresh
      </Button>
      <Button onClick={function () { return setIsConfigOpen(true); }} data-testid="button-configure-rules">
        <Settings className="h-4 w-4 mr-2"/>
        Configure Rules
      </Button>
    </div>
  </div>
    </header>



        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            <MetricsCards metrics={metrics} isLoading={metricsLoading}/>
            <DepartmentOverview metrics={metrics} isLoading={metricsLoading}/>
            <ParcelTable />
          </div>
        </div>
      </div>

      <ConfigurationModal isOpen={isConfigOpen} onClose={function () { return setIsConfigOpen(false); }}/>
    </Layout>);
}
