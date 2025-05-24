import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Download, RefreshCw, Table, BarChart3, TrendingUp, Users, ShoppingCart, DollarSign } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const DataExplorer = () => {
  const [isLoading, setIsLoading] = useState(false);

  const datasets = [
    {
      name: "Store Performance",
      records: "1,247",
      lastUpdated: "2 hours ago",
      status: "Active",
      description: "Revenue, traffic, and conversion data for all store locations",
      value: 85000,
      change: "+12.5%",
      color: "#3b82f6"
    },
    {
      name: "Customer Analytics",
      records: "45,892",
      lastUpdated: "30 minutes ago", 
      status: "Active",
      description: "Customer behavior, demographics, and purchase history",
      value: 45892,
      change: "+8.2%",
      color: "#10b981"
    },
    {
      name: "Delivery Logistics",
      records: "8,934",
      lastUpdated: "1 hour ago",
      status: "Active", 
      description: "Delivery routes, times, and optimization metrics",
      value: 8934,
      change: "+3.1%",
      color: "#f59e0b"
    },
    {
      name: "Marketing Campaigns",
      records: "156",
      lastUpdated: "6 hours ago",
      status: "Syncing",
      description: "Campaign performance and ROI analytics",
      value: 156,
      change: "-2.1%",
      color: "#ef4444"
    }
  ];

  const salesData = [
    { name: 'Jan', sales: 4000, customers: 2400, orders: 1200, profit: 1800 },
    { name: 'Feb', sales: 3000, customers: 1398, orders: 980, profit: 1400 },
    { name: 'Mar', sales: 5200, customers: 3800, orders: 1800, profit: 2100 },
    { name: 'Apr', sales: 2780, customers: 3908, orders: 1400, profit: 1600 },
    { name: 'May', sales: 6890, customers: 4800, orders: 2300, profit: 2800 },
    { name: 'Jun', sales: 7390, customers: 5200, orders: 2800, profit: 3100 },
  ];

  const storeData = [
    { store: "Downtown Store", revenue: 85000, visitors: 12847, conversion: 3.2, status: "Active" },
    { store: "Mission District", revenue: 62000, visitors: 9234, conversion: 2.8, status: "Active" },
    { store: "Castro Store", revenue: 47000, visitors: 6891, conversion: 2.1, status: "Maintenance" },
    { store: "Union Square", revenue: 92000, visitors: 15234, conversion: 3.8, status: "Active" },
    { store: "Chinatown", revenue: 38000, visitors: 5647, conversion: 2.3, status: "Active" }
  ];

  const categoryData = [
    { name: 'Electronics', value: 35, color: '#3b82f6' },
    { name: 'Clothing', value: 28, color: '#10b981' },
    { name: 'Home & Garden', value: 18, color: '#f59e0b' },
    { name: 'Books', value: 12, color: '#ef4444' },
    { name: 'Sports', value: 7, color: '#8b5cf6' }
  ];

  const performanceMetrics = [
    { title: "Total Revenue", value: "$324,000", change: "+12.5%", icon: DollarSign, color: "text-green-600" },
    { title: "Active Customers", value: "45,892", change: "+8.2%", icon: Users, color: "text-blue-600" },
    { title: "Total Orders", value: "12,847", change: "+15.3%", icon: ShoppingCart, color: "text-purple-600" },
    { title: "Growth Rate", value: "23.1%", change: "+2.1%", icon: TrendingUp, color: "text-orange-600" }
  ];

  const handleRefresh = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  return (
    <>
    <DashboardLayout>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Data Explorer</h1>
            <p className="text-gray-600 mt-1">Comprehensive analytics and data visualization dashboard</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {performanceMetrics.map((metric, index) => (
            <Card key={index} className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                    <p className={`text-sm ${metric.color} flex items-center mt-1`}>
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {metric.change}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full bg-gray-100`}>
                    <metric.icon className={`h-6 w-6 ${metric.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="datasets" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white border shadow-sm">
            <TabsTrigger value="datasets" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Datasets
            </TabsTrigger>
            <TabsTrigger value="tables" className="flex items-center gap-2">
              <Table className="h-4 w-4" />
              Tables
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="datasets" className="space-y-6">
            {/* Dataset Cards with Mini Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {datasets.map((dataset, index) => (
                <Card key={index} className="border-0 shadow-lg overflow-hidden">
                  <CardHeader className="pb-3 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-semibold text-gray-900">{dataset.name}</CardTitle>
                      <Badge variant={dataset.status === 'Active' ? 'default' : 'secondary'} className="ml-2">
                        {dataset.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm text-gray-600 mb-4">{dataset.description}</p>
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{dataset.records}</p>
                        <p className="text-xs text-gray-500">Records</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-lg font-semibold ${dataset.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                          {dataset.change}
                        </p>
                        <p className="text-xs text-gray-500">Change</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Updated</p>
                        <p className="text-xs text-gray-400">{dataset.lastUpdated}</p>
                      </div>
                    </div>
                    {/* Mini progress bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min((dataset.value / 50000) * 100, 100)}%`,
                          backgroundColor: dataset.color
                        }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Dataset Overview Chart */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">Dataset Growth Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: '8px' }} />
                    <Legend />
                    <Area type="monotone" dataKey="customers" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="orders" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tables" className="space-y-6">
            {/* Enhanced Table with Visual Elements */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="text-xl font-semibold text-gray-900">Store Performance Analysis</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-4 font-semibold text-gray-700">Store</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Revenue</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Visitors</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Conversion</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Performance</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {storeData.map((store, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="p-4 font-medium text-gray-900">{store.store}</td>
                          <td className="p-4">
                            <div>
                              <span className="font-semibold text-gray-900">${store.revenue.toLocaleString()}</span>
                              <div className="w-20 bg-gray-200 rounded-full h-1.5 mt-1">
                                <div 
                                  className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                                  style={{ width: `${(store.revenue / 92000) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              <span className="font-medium text-gray-700">{store.visitors.toLocaleString()}</span>
                              <div className="w-16 bg-gray-200 rounded-full h-1.5 mt-1">
                                <div 
                                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                                  style={{ width: `${(store.visitors / 15234) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`font-semibold ${store.conversion >= 3 ? 'text-green-600' : 'text-orange-600'}`}>
                              {store.conversion}%
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center">
                              <div className="w-12 bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    store.conversion >= 3.5 ? 'bg-green-500' : 
                                    store.conversion >= 2.5 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${(store.conversion / 4) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-500">{Math.round((store.conversion / 4) * 100)}%</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant={store.status === 'Active' ? 'default' : 'secondary'}>
                              {store.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="charts" className="space-y-6">
            {/* Multiple Chart Views */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sales Trend */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900">Sales & Revenue Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: '8px' }} />
                      <Legend />
                      <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }} />
                      <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Category Distribution */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900">Sales by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Store Performance Bar Chart */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">Store Revenue Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={storeData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="store" 
                      stroke="#666" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                      formatter={(value, name) => [
                        name === 'revenue' ? `$${value.toLocaleString()}` : value.toLocaleString(),
                        name === 'revenue' ? 'Revenue' : 'Visitors'
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="visitors" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Customer Analytics */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">Customer & Order Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: '8px' }} />
                    <Legend />
                    <Area type="monotone" dataKey="customers" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.7} />
                    <Area type="monotone" dataKey="orders" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.7} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </DashboardLayout>
    </>
  );
};

export default DataExplorer;