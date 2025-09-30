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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Package, Weight, Shield } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
export default function DepartmentOverview(_a) {
    var _this = this;
    var metrics = _a.metrics, isLoading = _a.isLoading;
    // Fetch business rules to display dynamic descriptions
    var _b = useQuery({
        queryKey: ["/api/business-rules"],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest("GET", "/api/business-rules")];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        }); },
    }), businessRules = _b.data, isLoadingRules = _b.isLoading;
    if (isLoading || isLoadingRules) {
        return (<Card>
        <CardHeader>
          <CardTitle>Department Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {__spreadArray([], Array(4), true).map(function (_, i) { return (<Skeleton key={i} className="h-24 w-full"/>); })}
          </div>
        </CardContent>
      </Card>);
    }
    var defaultRules = {
        mail: { maxWeight: 1.0 },
        regular: { maxWeight: 10.0 },
        heavy: { minWeight: 10.0 },
        insurance: { minValue: 1000.0, enabled: true }
    };
    var rules = businessRules !== null && businessRules !== void 0 ? businessRules : defaultRules;
    var departments = [
        {
            name: "Mail Department",
            key: "mail",
            icon: Mail,
            iconColor: "text-cyan-600",
            getDescription: function (rules) { var _a, _b; return "Weight: \u2264 ".concat((_b = (_a = rules === null || rules === void 0 ? void 0 : rules.mail) === null || _a === void 0 ? void 0 : _a.maxWeight) !== null && _b !== void 0 ? _b : 1.0, "kg"); }
        },
        {
            name: "Regular Department",
            key: "regular",
            icon: Package,
            iconColor: "text-blue-600",
            getDescription: function (rules) {
                var _a, _b, _c, _d;
                var mailMax = (_b = (_a = rules === null || rules === void 0 ? void 0 : rules.mail) === null || _a === void 0 ? void 0 : _a.maxWeight) !== null && _b !== void 0 ? _b : 1.0;
                var regularMax = (_d = (_c = rules === null || rules === void 0 ? void 0 : rules.regular) === null || _c === void 0 ? void 0 : _c.maxWeight) !== null && _d !== void 0 ? _d : 10.0;
                return "Weight: ".concat(mailMax < regularMax ? "".concat(mailMax, "-") : '').concat(regularMax, "kg");
            }
        },
        {
            name: "Heavy Department",
            key: "heavy",
            icon: Weight,
            iconColor: "text-orange-600",
            getDescription: function (rules) { var _a, _b; return "Weight: > ".concat((_b = (_a = rules === null || rules === void 0 ? void 0 : rules.heavy) === null || _a === void 0 ? void 0 : _a.minWeight) !== null && _b !== void 0 ? _b : 10.0, "kg"); }
        },
        {
            name: "Insurance Review",
            key: "insurance",
            icon: Shield,
            iconColor: "text-purple-600",
            getDescription: function (rules) { var _a, _b; return "Value: > \u20AC".concat(((_b = (_a = rules === null || rules === void 0 ? void 0 : rules.insurance) === null || _a === void 0 ? void 0 : _a.minValue) !== null && _b !== void 0 ? _b : 1000.0).toLocaleString()); }
        }
    ];
    var getDepartmentData = function (key) {
        var _a, _b;
        var defaultData = key === "insurance"
            ? { count: 0, approved: 0, reviewing: 0 }
            : { count: 0, processed: 0, pending: 0 };
        return (_b = (_a = metrics === null || metrics === void 0 ? void 0 : metrics.departments) === null || _a === void 0 ? void 0 : _a[key]) !== null && _b !== void 0 ? _b : defaultData;
    };
    return (<Card data-testid="card-department-overview">
      <CardHeader>
        <CardTitle>Department Status Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {departments.map(function (dept) {
            var _a, _b, _c, _d, _e, _f;
            var Icon = dept.icon;
            var isInsurance = dept.key === "insurance";
            var data = getDepartmentData(dept.key);
            var description = dept.getDescription(rules);
            return (<div key={dept.key} className="rounded-lg p-4 border bg-card hover:shadow-md transition-shadow" data-testid={"card-department-".concat(dept.key)}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-foreground">{dept.name}</h4>
                  <Icon className={dept.iconColor} size={20} aria-hidden="true"/>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{description}</p>
                <p className="text-2xl font-bold text-foreground" data-testid={"text-".concat(dept.key, "-count")} aria-label={"".concat(dept.name, " total count")}>
                  {(_b = (_a = data.count) === null || _a === void 0 ? void 0 : _a.toLocaleString()) !== null && _b !== void 0 ? _b : "0"}
                </p>
                <div className="mt-2 text-xs text-muted-foreground">
                  {isInsurance ? (<>
                      <span className="text-green-600" data-testid={"text-".concat(dept.key, "-approved")}>
                        {(_c = data.approved) !== null && _c !== void 0 ? _c : 0} approved
                      </span>
                      {" • "}
                      <span className="text-purple-600" data-testid={"text-".concat(dept.key, "-reviewing")}>
                        {(_d = data.reviewing) !== null && _d !== void 0 ? _d : 0} reviewing
                      </span>
                    </>) : (<>
                      <span className="text-green-600" data-testid={"text-".concat(dept.key, "-processed")}>
                        {(_e = data.processed) !== null && _e !== void 0 ? _e : 0} processed
                      </span>
                      {" • "}
                      <span className="text-yellow-600" data-testid={"text-".concat(dept.key, "-pending")}>
                        {(_f = data.pending) !== null && _f !== void 0 ? _f : 0} pending
                      </span>
                    </>)}
                </div>
              </div>);
        })}
        </div>
      </CardContent>
    </Card>);
}
