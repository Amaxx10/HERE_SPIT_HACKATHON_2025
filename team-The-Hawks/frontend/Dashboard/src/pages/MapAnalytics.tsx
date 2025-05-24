
  import { DashboardLayout } from "@/components/layout/DashboardLayout";
  import { HereMap } from "@/components/map/HereMap";
  import { MetricCard } from "@/components/dashboard/MetricCard";
  import { Button } from "@/components/ui/button";
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
  import { MapPin, Navigation, Users, TrendingUp } from "lucide-react";

  const MapAnalytics = () => {
    return (
      <DashboardLayout>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Map Analytics</h1>
            <Button variant="outline">
              Export Data
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Active Stores"
              value="12"
              trend={8.5}
              trendLabel="vs last week"
              icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
            />
            <MetricCard
              title="Total Visits"
              value="24,847"
              trend={12.3}
              trendLabel="vs last week"
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
            />
            <MetricCard
              title="Avg Distance"
              value="2.4 km"
              trend={-5.2}
              trendLabel="vs last week"
              icon={<Navigation className="h-4 w-4 text-muted-foreground" />}
            />
            <MetricCard
              title="Engagement Rate"
              value="68.5%"
              trend={15.7}
              trendLabel="vs last week"
              icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <HereMap className="h-[600px]" />
            </div>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Locations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Downtown Store</span>
                      <span className="text-sm text-muted-foreground">$85,000</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">SOMA Location</span>
                      <span className="text-sm text-muted-foreground">$73,000</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Mission District</span>
                      <span className="text-sm text-muted-foreground">$62,000</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Castro Store</span>
                      <span className="text-sm text-muted-foreground">$47,000</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  };

  export default MapAnalytics;
