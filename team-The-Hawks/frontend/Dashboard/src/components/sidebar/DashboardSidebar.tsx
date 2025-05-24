
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem 
} from "@/components/ui/sidebar";
import { 
  ChartBar, 
  Database, 
  Map, 
  Search, 
  Layers, 
  PieChart, 
  ChartLine, 
  Calendar,
  CloudRain,
  Bell
} from "lucide-react";

export function DashboardSidebar() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation menu items
  const navigationItems = [
    { title: "Dashboard", icon: ChartBar, href: "/" },
    { title: "Map Analytics", icon: Map, href: "/map" },
    { title: "Search", icon: Search, href: "/search" },
    { title: "Data Explorer", icon: Database, href: "/data" },
  ];

  // Analytics menu items
  const analyticsItems = [
    { title: "Performance", icon: ChartLine, href: "/performance" },
    { title: "Segments", icon: PieChart, href: "/segments" },
    { title: "Layers", icon: Layers, href: "/layers" },
  ];

  // New features menu items
  const featuresItems = [
    { title: "Weather", icon: CloudRain, href: "/weather" },
    { title: "Calendar", icon: Calendar, href: "/calendar" },
    { title: "Realtime Updates", icon: Bell, href: "/realtime" },
  ];

  const handleItemClick = (href: string) => {
    navigate(href);
  };

  const isActiveItem = (href: string) => {
    return location.pathname === href;
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center px-2 py-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-meta-teal flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div className="font-semibold text-sidebar-foreground">
              MetaCommerce<span className="text-meta-mint">AI</span>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    isActive={isActiveItem(item.href)}
                    onClick={() => handleItemClick(item.href)}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Analytics</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {analyticsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    isActive={isActiveItem(item.href)}
                    onClick={() => handleItemClick(item.href)}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Features</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {featuresItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    isActive={isActiveItem(item.href)}
                    onClick={() => handleItemClick(item.href)}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="px-3 py-2">
          <p className="text-xs text-sidebar-foreground/70">MetaCommerce AI © 2025</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
