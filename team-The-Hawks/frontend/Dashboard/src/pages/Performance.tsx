
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Target, Zap, Calendar } from "lucide-react";

const Performance = () => {
  const performanceData = [
    { name: 'Jan', revenue: 4000, target: 3500, efficiency: 85 },
    { name: 'Feb', revenue: 3000, target: 3500, efficiency: 78 },
    { name: 'Mar', revenue: 2000, target: 3500, efficiency: 92 },
    { name: 'Apr', revenue: 2780, target: 3500, efficiency: 88 },
    { name: 'May', revenue: 1890, target: 3500, efficiency: 91 },
    { name: 'Jun', revenue: 2390, target: 3500, efficiency: 87 },
    { name: 'Jul', revenue: 3490, target: 3500, efficiency: 94 },
  ];

  const kpis = [
    {
      name: "Revenue Growth",
      current: "12.5%",
      target: "15%",
      status: "warning",
      trend: 2.3
    },
    {
      name: "Customer Acquisition",
      current: "847",
      target: "1000",
      status: "danger",
      trend: -5.2
    },
    {
      name: "Operational Efficiency",
      current: "89.2%",
      target: "85%",
      status: "success",
      trend: 4.1
    },
    {
      name: "Market Penetration",
      current: "23.8%",
      target: "25%",
      status: "warning",
      trend: 1.2
    }
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Performance Analytics</h1>
          <div className="flex gap-2">
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              This Month
            </Button>
            <Button variant="outline">Export Report</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Revenue"
            value="$267,430"
            trend={12.5}
            trendLabel="vs last month"
            icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          />
          <MetricCard
            title="Avg Order Value"
            value="$87.45"
            trend={-2.1}
            trendLabel="vs last month"
            icon={<Target className="h-4 w-4 text-muted-foreground" />}
          />
          <MetricCard
            title="Processing Speed"
            value="1.2s"
            trend={15.3}
            trendLabel="improvement"
            icon={<Zap className="h-4 w-4 text-muted-foreground" />}
          />
          <MetricCard
            title="Customer Satisfaction"
            value="94.2%"
            trend={3.7}
            trendLabel="vs last month"
            icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PerformanceChart 
              title="Performance vs Targets" 
              data={performanceData}
            />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Key Performance Indicators</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {kpis.map((kpi, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{kpi.name}</span>
                    <Badge variant={
                      kpi.status === 'success' ? 'default' : 
                      kpi.status === 'warning' ? 'secondary' : 'destructive'
                    }>
                      {kpi.current}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Target: {kpi.target}</span>
                    <div className="flex items-center gap-1">
                      {kpi.trend > 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      )}
                      <span className={kpi.trend > 0 ? 'text-green-600' : 'text-red-600'}>
                        {Math.abs(kpi.trend)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        kpi.status === 'success' ? 'bg-green-600' :
                        kpi.status === 'warning' ? 'bg-yellow-600' : 'bg-red-600'
                      }`}
                      style={{ 
                        width: `${Math.min(100, (parseFloat(kpi.current.replace('%', '').replace('$', '').replace(',', '')) / parseFloat(kpi.target.replace('%', '').replace('$', '').replace(',', ''))) * 100)}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Performance;
