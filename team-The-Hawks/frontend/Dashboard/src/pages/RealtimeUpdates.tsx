
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import {
  Bell,
  TrendingUp,
  RefreshCw,
  ShoppingCart,
  Users,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";

interface ActivityItem {
  id: number;
  type: "order" | "customer" | "alert" | "system";
  message: string;
  timestamp: Date;
  read: boolean;
  priority: "high" | "medium" | "low";
}

interface LiveMetric {
  id: string;
  name: string;
  value: number;
  trend: number;
  unit: string;
}

const RealtimeUpdates = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [liveMetrics, setLiveMetrics] = useState<LiveMetric[]>([
    { id: "traffic", name: "Store Traffic", value: 42, trend: 3.2, unit: "visitors" },
    { id: "sales", name: "Live Sales", value: 1284, trend: 5.7, unit: "USD" },
    { id: "conversion", name: "Conversion Rate", value: 3.8, trend: -0.5, unit: "%" },
    { id: "aov", name: "Avg Order Value", value: 68, trend: 2.1, unit: "USD" }
  ]);
  const [selectedTab, setSelectedTab] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  // Simulate realtime data updates
  useEffect(() => {
    // Initial activities
    setActivities([
      {
        id: 1,
        type: "order",
        message: "New order #12548 received - $89.99",
        timestamp: new Date(Date.now() - 120000), // 2 minutes ago
        read: false,
        priority: "medium"
      },
      {
        id: 2,
        type: "customer",
        message: "New customer registration: john.doe@example.com",
        timestamp: new Date(Date.now() - 360000), // 6 minutes ago
        read: false,
        priority: "low"
      },
      {
        id: 3,
        type: "alert",
        message: "Inventory alert: Product SKU-1234 is running low (2 units left)",
        timestamp: new Date(Date.now() - 720000), // 12 minutes ago
        read: false,
        priority: "high"
      },
      {
        id: 4,
        type: "system",
        message: "System maintenance scheduled for tonight at 2:00 AM",
        timestamp: new Date(Date.now() - 5400000), // 90 minutes ago
        read: true,
        priority: "medium"
      }
    ]);

    // Simulate new realtime activities coming in
    const activityInterval = setInterval(() => {
      const newActivityTypes = [
        {
          type: "order",
          messages: [
            "New order #12549 received - $125.50",
            "Order #12545 status changed to shipped",
            "Order #12530 has been delivered"
          ],
          priority: "medium"
        },
        {
          type: "customer",
          messages: [
            "Customer michael.brown@example.com updated their profile",
            "New review received: 5 stars for product XYZ",
            "Customer support ticket opened: #T-4872"
          ],
          priority: "low"
        },
        {
          type: "alert",
          messages: [
            "Payment processing system experiencing delays",
            "Unusual traffic spike detected on website",
            "Server load at 85% capacity"
          ],
          priority: "high"
        },
        {
          type: "system",
          messages: [
            "Database backup completed successfully",
            "New system update available v2.4.1",
            "API rate limit reached for analytics service"
          ],
          priority: "medium"
        }
      ];

      const randomType = Math.floor(Math.random() * newActivityTypes.length);
      const selectedType = newActivityTypes[randomType];
      const randomMessage = Math.floor(Math.random() * selectedType.messages.length);
      
      setActivities(prev => [{
        id: Date.now(),
        type: selectedType.type as "order" | "customer" | "alert" | "system",
        message: selectedType.messages[randomMessage],
        timestamp: new Date(),
        read: false,
        priority: selectedType.priority as "high" | "medium" | "low"
      }, ...prev.slice(0, 19)]); // Keep only the 20 most recent
    }, 15000); // New activity every 15 seconds

    // Simulate live metric changes
    const metricsInterval = setInterval(() => {
      setLiveMetrics(prev => 
        prev.map(metric => {
          // Random fluctuation
          const change = (Math.random() * 2 - 1) * (metric.id === "traffic" ? 2 : 
                                                    metric.id === "sales" ? 20 :
                                                    metric.id === "conversion" ? 0.2 : 1.5);
          const trendChange = (Math.random() * 2 - 1) * 0.3;
          
          return {
            ...metric,
            value: parseFloat((metric.value + change).toFixed(metric.id === "conversion" ? 1 : 0)),
            trend: parseFloat((metric.trend + trendChange).toFixed(1))
          };
        })
      );
    }, 5000); // Update metrics every 5 seconds

    return () => {
      clearInterval(activityInterval);
      clearInterval(metricsInterval);
    };
  }, []);

  const filteredActivities = selectedTab === "all" 
    ? activities 
    : activities.filter(activity => activity.type === selectedTab);

  const markAllAsRead = () => {
    setActivities(prev => prev.map(activity => ({ ...activity, read: true })));
  };

  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Realtime Updates</h1>
          <div className="flex gap-2">
            <Button 
              size="sm"
              variant="outline"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
            <Button 
              size="sm"
              variant="outline"
              onClick={refreshData}
              disabled={isLoading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {liveMetrics.map((metric) => (
            <Card key={metric.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-baseline">
                  <div className="text-2xl font-bold">
                    {metric.unit === "USD" ? `$${metric.value}` : `${metric.value}${metric.unit === "%" ? "%" : ""}`}
                  </div>
                  <div className={`flex items-center ${metric.trend > 0 ? "text-green-500" : "text-red-500"}`}>
                    {metric.trend > 0 ? (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingUp className="h-4 w-4 mr-1 transform rotate-180" />
                    )}
                    <span>{Math.abs(metric.trend)}%</span>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="h-1 bg-secondary rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${metric.trend > 0 ? "bg-green-500" : "bg-red-500"}`} style={{ width: `${50 + metric.trend * 5}%` }}></div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Live updating</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="overflow-hidden">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Activity Feed</CardTitle>
              <Badge variant="outline" className="bg-primary/10">Live</Badge>
            </div>
            <CardDescription>Real-time updates from your business</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList>
                <TabsTrigger value="all">
                  All
                  <Badge className="ml-2 bg-primary/20">{activities.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="order">
                  Orders
                  <Badge className="ml-2 bg-primary/20">{activities.filter(a => a.type === "order").length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="customer">
                  Customers
                  <Badge className="ml-2 bg-primary/20">{activities.filter(a => a.type === "customer").length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="alert">
                  Alerts
                  <Badge className="ml-2 bg-primary/20">{activities.filter(a => a.type === "alert").length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="system">
                  System
                  <Badge className="ml-2 bg-primary/20">{activities.filter(a => a.type === "system").length}</Badge>
                </TabsTrigger>
              </TabsList>
              
              <div className="mt-4 space-y-4">
                {filteredActivities.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    No activities to display
                  </div>
                ) : (
                  filteredActivities.map(activity => (
                    <div 
                      key={activity.id} 
                      className={`p-3 border rounded-md ${!activity.read ? "bg-secondary/30" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`
                          p-2 rounded-full 
                          ${activity.type === "order" ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300" : ""}
                          ${activity.type === "customer" ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300" : ""}
                          ${activity.type === "alert" ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300" : ""}
                          ${activity.type === "system" ? "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300" : ""}
                        `}>
                          {activity.type === "order" && <ShoppingCart className="h-4 w-4" />}
                          {activity.type === "customer" && <Users className="h-4 w-4" />}
                          {activity.type === "alert" && <AlertCircle className="h-4 w-4" />}
                          {activity.type === "system" && <Bell className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{activity.message}</div>
                              <div className="text-xs text-muted-foreground flex items-center mt-1">
                                <Clock className="h-3 w-3 mr-1" />
                                {format(activity.timestamp, "MMM d, h:mm a")}
                              </div>
                            </div>
                            {!activity.read && (
                              <Badge 
                                className={`
                                  ${activity.priority === "high" ? "bg-red-500" : ""}
                                  ${activity.priority === "medium" ? "bg-amber-500" : ""}
                                  ${activity.priority === "low" ? "bg-green-500" : ""}
                                `}
                              >
                                {activity.priority}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Tabs>
          </CardContent>
        </Card>

        <Alert variant="default" className="bg-primary/5 border-primary/20">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Realtime Updates Active</AlertTitle>
          <AlertDescription>
            You're receiving real-time updates from your business operations. New notifications will appear automatically.
          </AlertDescription>
        </Alert>
      </div>
    </DashboardLayout>
  );
};

export default RealtimeUpdates;
