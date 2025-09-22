import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Package, Weight, Shield } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DepartmentOverviewProps {
  metrics?: any;
  isLoading: boolean;
}

export default function DepartmentOverview({ metrics, isLoading }: DepartmentOverviewProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Department Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const departments = [
    {
      name: "Mail Department",
      key: "mail",
      description: "Weight: ≤ 1kg",
      icon: Mail,
      className: "dept-mail border",
      iconColor: "text-cyan-600",
      data: metrics?.departments?.mail ?? { count: 0, processed: 0, pending: 0 }
    },
    {
      name: "Regular Department", 
      key: "regular",
      description: "Weight: 1-10kg",
      icon: Package,
      className: "dept-regular border",
      iconColor: "text-blue-600",
      data: metrics?.departments?.regular ?? { count: 0, processed: 0, pending: 0 }
    },
    {
      name: "Heavy Department",
      key: "heavy", 
      description: "Weight: >10kg",
      icon: Weight,
      className: "dept-heavy border",
      iconColor: "text-orange-600",
      data: metrics?.departments?.heavy ?? { count: 0, processed: 0, pending: 0 }
    },
    {
      name: "Insurance Review",
      key: "insurance",
      description: "Value: >€1,000", 
      icon: Shield,
      className: "dept-insurance border",
      iconColor: "text-purple-600",
      data: metrics?.departments?.insurance ?? { count: 0, approved: 0, reviewing: 0 }
    }
  ];

  return (
    <Card data-testid="card-department-overview">
      <CardHeader>
        <CardTitle>Department Status Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {departments.map((dept) => {
            const Icon = dept.icon;
            const isInsurance = dept.key === "insurance";
            
            return (
              <div key={dept.key} className={`${dept.className} rounded-lg p-4`} data-testid={`card-department-${dept.key}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-foreground">{dept.name}</h4>
                  <Icon className={`${dept.iconColor}`} size={20} />
                </div>
                <p className="text-sm text-muted-foreground mb-1">{dept.description}</p>
                <p className="text-2xl font-bold text-foreground" data-testid={`text-${dept.key}-count`}>
                  {dept.data.count?.toLocaleString() ?? "0"}
                </p>
                <div className="mt-2 text-xs text-muted-foreground">
                  {isInsurance ? (
                    <>
                      <span className="text-green-600" data-testid={`text-${dept.key}-approved`}>
                        {dept.data.approved} approved
                      </span>{" "}
                      •{" "}
                      <span className="text-purple-600" data-testid={`text-${dept.key}-reviewing`}>
                        {dept.data.reviewing} reviewing
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-green-600" data-testid={`text-${dept.key}-processed`}>
                        {dept.data.processed} processed
                      </span>{" "}
                      •{" "}
                      <span className="text-yellow-600" data-testid={`text-${dept.key}-pending`}>
                        {dept.data.pending} pending
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
