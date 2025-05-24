
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search as SearchIcon, Filter, MapPin, Calendar } from "lucide-react";

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const searchResults = [
    {
      id: 1,
      title: "Downtown Store Performance",
      type: "Analytics",
      location: "San Francisco, CA",
      date: "2025-01-15",
      revenue: "$85,000",
      description: "Monthly performance metrics for downtown location"
    },
    {
      id: 2,
      title: "Mission District Traffic",
      type: "Traffic Data",
      location: "San Francisco, CA", 
      date: "2025-01-14",
      visitors: "12,847",
      description: "Foot traffic analysis for Mission District store"
    },
    {
      id: 3,
      title: "Delivery Route Optimization",
      type: "Logistics",
      location: "Bay Area",
      date: "2025-01-13",
      savings: "12 min/delivery",
      description: "Route optimization recommendations for delivery fleet"
    },
    {
      id: 4,
      title: "Customer Segmentation Analysis",
      type: "Customer Data",
      location: "All Locations",
      date: "2025-01-12",
      segments: "5 groups",
      description: "Customer behavior patterns and segmentation insights"
    }
  ];

  const filteredResults = searchResults.filter(result =>
    result.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Search</h1>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search analytics, reports, locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {filteredResults.map((result) => (
            <Card key={result.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{result.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{result.description}</p>
                  </div>
                  <Badge variant="secondary">{result.type}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {result.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {result.date}
                  </div>
                  {result.revenue && (
                    <div className="font-medium text-green-600">
                      Revenue: {result.revenue}
                    </div>
                  )}
                  {result.visitors && (
                    <div className="font-medium text-blue-600">
                      Visitors: {result.visitors}
                    </div>
                  )}
                  {result.savings && (
                    <div className="font-medium text-orange-600">
                      Savings: {result.savings}
                    </div>
                  )}
                  {result.segments && (
                    <div className="font-medium text-purple-600">
                      Segments: {result.segments}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredResults.length === 0 && searchTerm && (
          <Card>
            <CardContent className="text-center py-8">
              <SearchIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No results found for "{searchTerm}"</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Search;
