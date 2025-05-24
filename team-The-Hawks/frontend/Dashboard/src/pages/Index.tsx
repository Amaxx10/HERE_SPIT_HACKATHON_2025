
import { useState } from 'react';
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { HereMap } from "@/components/map/HereMap";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RecommendationCard } from "@/components/dashboard/RecommendationCard";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { Button } from "@/components/ui/button";
import { ChartBar, Users, ShoppingCart, Truck, Calendar, Clock, RefreshCw } from "lucide-react";
import { useBusinessData } from "@/hooks/useBusinessData";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [mapExpanded, setMapExpanded] = useState(false);
  const { metrics, isLoading, refreshData } = useBusinessData();
  const { toast } = useToast();

  // Sample data for charts
  const performanceData = [
    { name: 'Jan', revenue: 4000, traffic: 2400, forecast: 4200 },
    { name: 'Feb', revenue: 3000, traffic: 1398, forecast: 3100 },
    { name: 'Mar', revenue: 2000, traffic: 9800, forecast: 2200 },
    { name: 'Apr', revenue: 2780, traffic: 3908, forecast: 2900 },
    { name: 'May', revenue: 1890, traffic: 4800, forecast: 2000 },
    { name: 'Jun', revenue: 2390, traffic: 3800, forecast: 2500 },
    { name: 'Jul', revenue: 3490, traffic: 4300, forecast: 3600 },
    { name: 'Aug', revenue: 4000, traffic: 2400, forecast: 4200 },
    { name: 'Sep', revenue: 3000, traffic: 1398, forecast: 3100 },
    { name: 'Oct', revenue: 2000, traffic: 9800, forecast: 2200 },
    { name: 'Nov', revenue: 2780, traffic: 3908, forecast: 2900 },
    { name: 'Dec', revenue: 1890, traffic: 4800, forecast: 2000 },
  ];

  const handleRefreshData = async () => {
    await refreshData();
    toast({
      title: "Data Updated",
      description: "Dashboard metrics have been refreshed with latest data.",
    });
  };

  const handleApplyRecommendation = (title: string) => {
    toast({
      title: "Recommendation Applied",
      description: `${title} has been implemented successfully.`,
    });
  };

  const handleDismissRecommendation = (title: string) => {
    toast({
      title: "Recommendation Dismissed",
      description: `${title} has been dismissed.`,
    });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">MetaCommerce AI Dashboard</h1>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleRefreshData}
              disabled={isLoading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button size="sm" variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Today
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Revenue"
            value={`$${metrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            trend={metrics.revenueGrowth}
            trendLabel="vs last month"
            icon={<ChartBar className="h-4 w-4 text-muted-foreground" />}
          />
          <MetricCard
            title="Store Traffic"
            value={metrics.storeTraffic.toLocaleString()}
            trend={metrics.trafficGrowth}
            trendLabel="vs last month"
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
          />
          <MetricCard
            title="Conversion Rate"
            value={`${metrics.conversionRate.toFixed(1)}%`}
            trend={metrics.conversionGrowth}
            trendLabel="vs last month"
            icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
          />
          <MetricCard
            title="Delivery Time"
            value={`${Math.round(metrics.deliveryTime)} min`}
            trend={metrics.deliveryGrowth}
            trendLabel="vs last month"
            icon={<Truck className="h-4 w-4 text-muted-foreground" />}
          />
        </div>

        <div className={`grid gap-4 ${mapExpanded ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>
          <div className={`${mapExpanded ? 'col-span-1' : 'col-span-1 lg:col-span-2'}`}>
            <HereMap 
              className={mapExpanded ? "h-[600px]" : "h-[400px]"}
              expanded={mapExpanded}
              onToggleExpand={() => setMapExpanded(!mapExpanded)}
            />
          </div>
          
          {!mapExpanded && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">AI Recommendations</h2>
              <RecommendationCard
                title="Staff Optimization"
                description="Increase staff at Downtown Store from 4-7pm due to predicted 35% surge in foot traffic."
                priority="high"
                icon={<Clock className="h-4 w-4 text-meta-coral" />}
                actions={
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDismissRecommendation("Staff Optimization")}
                    >
                      Dismiss
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleApplyRecommendation("Staff Optimization")}
                    >
                      Apply
                    </Button>
                  </div>
                }
              />
              <RecommendationCard
                title="Delivery Route Optimization"
                description="Reroute deliveries to avoid traffic congestion on Market St. Estimated time savings: 12 min/delivery."
                priority="medium"
                icon={<Truck className="h-4 w-4 text-meta-amber" />}
                actions={
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDismissRecommendation("Delivery Route Optimization")}
                    >
                      Dismiss
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleApplyRecommendation("Delivery Route Optimization")}
                    >
                      Apply
                    </Button>
                  </div>
                }
              />
              <RecommendationCard
                title="Pop-up Store Location"
                description="Optimal location for weekend pop-up: Central Plaza. Estimated foot traffic: 15k visitors."
                priority="low"
                icon={<ShoppingCart className="h-4 w-4 text-meta-mint" />}
                actions={
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDismissRecommendation("Pop-up Store Location")}
                    >
                      Dismiss
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleApplyRecommendation("Pop-up Store Location")}
                    >
                      Apply
                    </Button>
                  </div>
                }
              />
            </div>
          )}
        </div>

        {!mapExpanded && (
          <div className="grid grid-cols-1 gap-4">
            <PerformanceChart 
              title="Business Performance & Forecast" 
              data={performanceData} 
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Index;
