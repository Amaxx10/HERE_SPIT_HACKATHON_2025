
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import Index from "./pages/Index";
import MapAnalytics from "./pages/MapAnalytics";
import Search from "./pages/Search";
import DataExplorer from "./pages/DataExplorer";
import Performance from "./pages/Performance";
import Segments from "./pages/Segments";
import Layers from "./pages/Layers";
import NotFound from "./pages/NotFound";
import WeatherDashboard from "./pages/WeatherDashboard";
import CalendarView from "./pages/CalendarView";
import RealtimeUpdates from "./pages/RealtimeUpdates";
import LoginSignup from "./components/dashboard/LoginSignup";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index/>} />
            <Route path="/map" element={<MapAnalytics />} />
            <Route path="/search" element={<Search />} />
            <Route path="/data" element={<DataExplorer />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/segments" element={<Segments />} />
            <Route path="/layers" element={<Layers />} />
            <Route path="/weather" element={<WeatherDashboard />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/realtime" element={<RealtimeUpdates />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
