
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface BusinessMetrics {
  totalRevenue: number;
  storeTraffic: number;
  conversionRate: number;
  deliveryTime: number;
  revenueGrowth: number;
  trafficGrowth: number;
  conversionGrowth: number;
  deliveryGrowth: number;
}

export const useBusinessData = () => {
  const [metrics, setMetrics] = useState<BusinessMetrics>({
    totalRevenue: 86245.78,
    storeTraffic: 12847,
    conversionRate: 3.2,
    deliveryTime: 32,
    revenueGrowth: 12.5,
    trafficGrowth: 5.2,
    conversionGrowth: -0.8,
    deliveryGrowth: -15
  });

  const [isLoading, setIsLoading] = useState(false);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call - in real app this would fetch from Supabase or HERE APIs
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate realistic variations
      setMetrics(prev => ({
        ...prev,
        totalRevenue: prev.totalRevenue + (Math.random() - 0.5) * 1000,
        storeTraffic: Math.floor(prev.storeTraffic + (Math.random() - 0.5) * 200),
        conversionRate: Math.max(0, prev.conversionRate + (Math.random() - 0.5) * 0.2),
        deliveryTime: Math.max(15, prev.deliveryTime + (Math.random() - 0.5) * 5)
      }));
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    metrics,
    isLoading,
    refreshData
  };
};
