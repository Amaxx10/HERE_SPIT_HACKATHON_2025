
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Users, ShoppingBag, Star, Clock } from "lucide-react";

const Segments = () => {
  const customerSegments = [
    {
      name: "Premium Buyers",
      count: 2847,
      percentage: 23,
      avgOrderValue: "$156.80",
      frequency: "Weekly",
      growth: 12.5,
      color: "bg-purple-500",
      description: "High-value customers with frequent purchases"
    },
    {
      name: "Regular Shoppers",
      count: 5234,
      percentage: 42,
      avgOrderValue: "$89.20",
      frequency: "Bi-weekly",
      growth: 8.3,
      color: "bg-blue-500",
      description: "Consistent customers with moderate spending"
    },
    {
      name: "Occasional Buyers",
      count: 3456,
      percentage: 28,
      avgOrderValue: "$45.60",
      frequency: "Monthly",
      growth: -2.1,
      color: "bg-green-500",
      description: "Infrequent but loyal customers"
    },
    {
      name: "New Customers",
      count: 891,
      percentage: 7,
      avgOrderValue: "$67.30",
      frequency: "First time",
      growth: 15.7,
      color: "bg-orange-500",
      description: "Recently acquired customers"
    }
  ];

  const behaviorInsights = [
    {
      title: "Peak Shopping Hours",
      value: "2-4 PM, 7-9 PM",
      icon: <Clock className="h-4 w-4" />,
      change: "+5.2%"
    },
    {
      title: "Average Session Duration",
      value: "8.5 minutes",
      icon: <Clock className="h-4 w-4" />,
      change: "+12.3%"
    },
    {
      title: "Return Customer Rate",
      value: "68.4%",
      icon: <Users className="h-4 w-4" />,
      change: "+3.7%"
    },
    {
      title: "Cross-sell Success",
      value: "34.2%",
      icon: <ShoppingBag className="h-4 w-4" />,
      change: "+8.9%"
    }
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Customer Segments</h1>
          <div className="flex gap-2">
            <Button variant="outline">Create Segment</Button>
            <Button variant="outline">Export Data</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {behaviorInsights.map((insight, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {insight.icon}
                    <span className="text-sm font-medium">{insight.title}</span>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">{insight.value}</div>
                  <div className="text-sm text-green-600">{insight.change} vs last month</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Segments Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {customerSegments.map((segment, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${segment.color}`} />
                      <span className="font-medium">{segment.name}</span>
                    </div>
                    <Badge variant={segment.growth > 0 ? "default" : "destructive"}>
                      {segment.growth > 0 ? "+" : ""}{segment.growth}%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{segment.description}</p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Customers:</span>
                      <div className="font-medium">{segment.count.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Avg Order:</span>
                      <div className="font-medium">{segment.avgOrderValue}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Frequency:</span>
                      <div className="font-medium">{segment.frequency}</div>
                    </div>
                  </div>
                  <Progress value={segment.percentage} className="h-2" />
                  <div className="text-xs text-muted-foreground">{segment.percentage}% of total customers</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Segment Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Premium Buyers</div>
                    <div className="text-sm text-muted-foreground">Highest revenue contribution</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="font-bold">$446,790</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Regular Shoppers</div>
                    <div className="text-sm text-muted-foreground">Most stable segment</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="font-bold">$467,092</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">New Customers</div>
                    <div className="text-sm text-muted-foreground">Fastest growing segment</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-green-500" />
                    <span className="font-bold">$59,964</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Recommendations</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Target Premium Buyers with exclusive offers</li>
                    <li>• Create loyalty program for Regular Shoppers</li>
                    <li>• Implement welcome series for New Customers</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Segments;
