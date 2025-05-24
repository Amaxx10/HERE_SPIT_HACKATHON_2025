import { useState, useEffect } from "react";
import { 
  CloudRain, 
  Sun, 
  Umbrella, 
  Wind, 
  Thermometer, 
  CalendarDays,
  Store,
  Users,
  ShoppingCart,
  MapPin,
  RefreshCw,
  AlertTriangle,
  Settings
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const WeatherDashboard = () => {
  const [currentWeather, setCurrentWeather] = useState({
    temperature: 0,
    condition: "Loading...",
    precipitation: 0,
    windSpeed: 8,
    humidity: 65,
    location: "San Francisco"
  });

  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [apiUrl, setApiUrl] = useState('http://192.168.83.1:8000');
  const [showSettings, setShowSettings] = useState(false);

  // San Francisco coordinates as default
  const [coordinates, setCoordinates] = useState({
    lat: 37.7749,
    lng: -122.4194
  });

  // Demo data for fallback
  const demoData = [
    { day: "Today", temp: 27, condition: "Partly Cloudy", precipitation: 20 },
    { day: "Tomorrow", temp: 30, condition: "Sunny", precipitation: 0 },
    { day: "Wednesday", temp: 22, condition: "Cloudy", precipitation: 40 },
    { day: "Thursday", temp: 28, condition: "Rainy", precipitation: 80 },
    { day: "Friday", temp: 30, condition: "Partly Cloudy", precipitation: 30 }
  ];

  const loadDemoData = () => {
    setForecast(demoData);
    setCurrentWeather({
      temperature: 28,
      condition: "Partly Cloudy", 
      precipitation: 20,
      windSpeed: 8,
      humidity: 65,
      location: "Demo Mode - Mumbai"
    });
    generateRecommendations(demoData);
    setLoading(false);
    setError(null);
  };

 const fetchWeatherData = async (lat = coordinates.lat, lng = coordinates.lng) => {
  setLoading(true);
  setError(null);
  
  try {
    // Simplified API URLs - prioritize localhost for development
    const apiEndpoints = [
      `http://192.168.83.1:8000/get_weather?lat=${lat}&lng=${lng}`,
      `${apiUrl}/get_weather?lat=${lat}&lng=${lng}`,
    ];
    
    let lastError = null;
    
    for (const endpoint of apiEndpoints) {
      try {
        console.log(`Fetching weather data from: ${endpoint}`);
        
        // Simplified fetch - avoid custom headers that trigger preflight
        const response = await fetch(endpoint, {
          method: 'GET',
          // Remove custom headers to avoid CORS preflight
          // The browser will automatically add necessary headers
        });
        
        console.log(`Response status: ${response.status}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Weather data received:', data);
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        if (!data.daily_forecast || data.daily_forecast.length === 0) {
          throw new Error('No forecast data received');
        }
        
        // Process forecast data
        const processedForecast = data.daily_forecast.map(day => ({
          ...day,
          temp: Math.round(day.temp || 0),
          precipitation: day.precipitation > 100 
            ? Math.min(100, Math.round(day.precipitation / 10)) 
            : (day.precipitation || 0)
        }));
        
        setForecast(processedForecast);
        
        // Update current weather
        const today = processedForecast[0];
        setCurrentWeather(prev => ({
          ...prev,
          temperature: today.temp,
          condition: today.condition || 'Unknown',
          precipitation: today.precipitation,
          location: data.location || prev.location
        }));
        
        generateRecommendations(processedForecast);
        
        console.log('✅ Weather data successfully loaded');
        setLoading(false);
        return; // Success!
        
      } catch (fetchError) {
        lastError = fetchError;
        console.warn(`❌ Failed to fetch from ${endpoint}:`, fetchError.message);
      }
    }
    
    // All endpoints failed
    throw lastError || new Error('All API endpoints failed');
    
  } catch (error) {
    console.error('🚨 Weather API Error:', error);
    
    let errorMessage = 'Failed to fetch weather data';
    
    if (error.message.includes('Failed to fetch')) {
      errorMessage = 'Cannot connect to server. Is your backend running on port 8000?';
    } else if (error.message.includes('CORS')) {
      errorMessage = 'CORS error. Check your backend CORS configuration.';
    } else {
      errorMessage = error.message;
    }
    
    setError(errorMessage);
    
    // Auto-load demo data after 3 seconds
    setTimeout(() => {
      console.log('⏰ Loading demo data due to API error...');
      loadDemoData();
    }, 3000);
    
  } finally {
    setLoading(false);
  }
};

  const generateRecommendations = (forecastData) => {
    const recommendations = [];
    
    forecastData.forEach((day, index) => {
      const precipChance = day.precipitation > 100 ? Math.min(100, Math.round(day.precipitation / 10)) : day.precipitation;
      
      if (precipChance > 70) {
        recommendations.push({
          title: `${day.day} Rain Alert`,
          description: `High chance of rain on ${day.day} (${precipChance}% chance). Consider increasing online promotions and indoor activities.`,
          priority: "high",
          icon: <CloudRain className="h-4 w-4 text-red-500" />,
        });
      }
      
      if (day.condition.toLowerCase().includes('sunny') || day.condition.toLowerCase().includes('clear')) {
        recommendations.push({
          title: `${day.day} Sunny Opportunity`,
          description: `${day.day}'s clear weather suggests higher foot traffic. Prepare outdoor displays and extra staff.`,
          priority: "medium",
          icon: <Sun className="h-4 w-4 text-yellow-500" />,
        });
      }
      
      if (day.condition.toLowerCase().includes('overcast')) {
        recommendations.push({
          title: `${day.day} Overcast Strategy`,
          description: `Overcast conditions on ${day.day} may reduce outdoor activities. Focus on indoor promotions and comfort items.`,
          priority: "medium",
          icon: <CloudRain className="h-4 w-4 text-gray-500" />,
        });
      }
      
      if (day.condition.toLowerCase().includes('thunderstorm')) {
        recommendations.push({
          title: `${day.day} Storm Warning`,
          description: `Thunderstorms expected on ${day.day}. Prepare for reduced foot traffic and promote delivery services.`,
          priority: "high",
          icon: <CloudRain className="h-4 w-4 text-purple-500" />,
        });
      }
      
      if (day.temp < 60) {
        recommendations.push({
          title: `${day.day} Cold Weather Strategy`,
          description: `Temperature dropping to ${Math.round(day.temp)}°C on ${day.day}. Feature warm beverages and cold-weather items.`,
          priority: "medium",
          icon: <Thermometer className="h-4 w-4 text-blue-500" />,
        });
      }
      
      if (day.temp > 80) {
        recommendations.push({
          title: `${day.day} Hot Weather Opportunity`,
          description: `High temperature of ${Math.round(day.temp)}°C on ${day.day}. Promote cooling products and refreshments.`,
          priority: "medium",
          icon: <Thermometer className="h-4 w-4 text-orange-500" />,
        });
      }
    });

    setNotifications(recommendations.slice(0, 3));
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoordinates({ lat: latitude, lng: longitude });
          fetchWeatherData(latitude, longitude);
        },
        (error) => {
          console.error('Geolocation error:', error);
          fetchWeatherData();
        }
      );
    } else {
      fetchWeatherData();
    }
  };

  const handleApplyRecommendation = (title) => {
    alert(`${title} strategy has been implemented.`);
  };

  const handleDismissRecommendation = (title, index) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };

  const getWeatherIcon = (condition) => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('rain') || conditionLower.includes('shower')) {
      return <Umbrella className="h-14 w-14 text-blue-500 mr-4" />;
    } else if (conditionLower.includes('thunderstorm')) {
      return <CloudRain className="h-14 w-14 text-purple-600 mr-4" />;
    } else if (conditionLower.includes('sunny') || conditionLower.includes('clear')) {
      return <Sun className="h-14 w-14 text-yellow-500 mr-4" />;
    } else if (conditionLower.includes('overcast')) {
      return <CloudRain className="h-14 w-14 text-gray-600 mr-4" />;
    } else if (conditionLower.includes('cloud')) {
      return <CloudRain className="h-14 w-14 text-gray-500 mr-4" />;
    }
    return <CloudRain className="h-14 w-14 text-gray-500 mr-4" />;
  };

  const getSmallWeatherIcon = (condition) => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('rain') || conditionLower.includes('shower')) {
      return <Umbrella className="h-5 w-5 text-blue-500 mr-2" />;
    } else if (conditionLower.includes('thunderstorm')) {
      return <CloudRain className="h-5 w-5 text-purple-600 mr-2" />;
    } else if (conditionLower.includes('sunny') || conditionLower.includes('clear')) {
      return <Sun className="h-5 w-5 text-yellow-500 mr-2" />;
    } else if (conditionLower.includes('overcast')) {
      return <CloudRain className="h-5 w-5 text-gray-600 mr-2" />;
    } else if (conditionLower.includes('cloud')) {
      return <CloudRain className="h-5 w-5 text-gray-500 mr-2" />;
    }
    return <CloudRain className="h-5 w-5 text-gray-500 mr-2" />;
  };

  const calculateTrafficImpact = () => {
    if (forecast.length === 0) return 0;
    const today = forecast[0];
    let impact = 0;
    
    const precipChance = today.precipitation > 100 ? Math.min(100, Math.round(today.precipitation / 10)) : today.precipitation;
    
    if (today.condition.toLowerCase().includes('sunny')) impact += 25;
    if (today.condition.toLowerCase().includes('clear')) impact += 20;
    if (precipChance < 20) impact += 15;
    if (today.temp > 65 && today.temp < 80) impact += 10;
    
    if (today.condition.toLowerCase().includes('rain')) impact -= 30;
    if (today.condition.toLowerCase().includes('thunderstorm')) impact -= 40;
    if (today.condition.toLowerCase().includes('overcast')) impact -= 15;
    if (precipChance > 70) impact -= 25;
    if (today.temp < 50 || today.temp > 85) impact -= 15;
    
    return Math.max(-50, Math.min(50, impact));
  };

  const calculatePredictedSales = () => {
    const baselineSales = 10000;
    const trafficImpact = calculateTrafficImpact();
    return Math.round(baselineSales * (1 + trafficImpact / 100));
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  if (error && !forecast.length) {
    return (
      <>
      <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">Weather Data Connection Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            
            <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4 text-left">
              <h3 className="font-semibold text-blue-800 mb-2">CORS Issue Solutions:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>1. <strong>Backend Fix:</strong> Add CORS headers to your Flask/FastAPI backend</li>
                <li>2. <strong>Flask:</strong> Install flask-cors: <code className="bg-blue-100 px-1 rounded">pip install flask-cors</code></li>
                <li>3. <strong>FastAPI:</strong> Add middleware: <code className="bg-blue-100 px-1 rounded">app.add_middleware(CORSMiddleware, allow_origins=["*"])</code></li>
                <li>4. <strong>Alternative:</strong> Run Chrome with --disable-web-security flag (development only)</li>
              </ul>
            </div>

            {showSettings && (
              <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-4 text-left">
                <h3 className="font-semibold text-gray-800 mb-2">API Configuration:</h3>
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="Backend API URL"
                  className="w-full p-2 border border-gray-300 rounded mb-2"
                />
                <p className="text-xs text-gray-600">Change this to match your backend server URL</p>
              </div>
            )}
            
            <div className="flex gap-2 justify-center flex-wrap">
              <button 
                onClick={() => fetchWeatherData()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                disabled={loading}
              >
                {loading ? 'Retrying...' : 'Try Again'}
              </button>
              <button 
                onClick={loadDemoData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Load Demo Data
              </button>
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Settings className="h-4 w-4 inline mr-1" />
                Settings
              </button>
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
              <p>Demo data will load automatically in a few seconds...</p>
            </div>
          </div>
        </div>
      </div>
      </DashboardLayout>
      </>
    );
  }

  return (
    <>
    <DashboardLayout>
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Weather Intelligence</h1>
            <div className="flex gap-3">
              <button 
                onClick={getUserLocation}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                <MapPin className="mr-2 h-4 w-4" />
                Use My Location
              </button>
              <button 
                onClick={() => fetchWeatherData()}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button 
                onClick={loadDemoData}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Demo Mode
              </button>
            </div>
          </div>

          {currentWeather.location.includes('Demo') && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-blue-500 mr-2" />
                <p className="text-blue-800">
                  <strong>Demo Mode Active:</strong> Showing sample weather data. Connect your backend API to see live weather information.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Current Weather Card */}
            <div className="col-span-1 md:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="pb-2">
                <h2 className="text-2xl font-semibold">Current Location</h2>
                <p className="text-gray-600">Current Weather Conditions</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {loading ? (
                    <div className="w-14 h-14 bg-gray-200 rounded-full animate-pulse mr-4"></div>
                  ) : (
                    getWeatherIcon(currentWeather.condition)
                  )}
                  <div>
                    <p className="text-4xl font-bold">
                      {loading ? '--' : `${currentWeather.temperature}°C`}
                    </p>
                    <p className="text-gray-600">
                      {loading ? 'Loading...' : currentWeather.condition}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center">
                    <Umbrella className="h-5 w-5 text-gray-500 mb-1" />
                    <p className="text-sm font-medium">
                      {loading ? '-' : `${currentWeather.precipitation}%`}
                    </p>
                    <p className="text-xs text-gray-500">Precip</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <Wind className="h-5 w-5 text-gray-500 mb-1" />
                    <p className="text-sm font-medium">{currentWeather.windSpeed} mph</p>
                    <p className="text-xs text-gray-500">Wind</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Store Traffic Impact Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="pb-2">
                <h3 className="text-lg font-semibold flex items-center">
                  <Store className="mr-2 h-4 w-4" />
                  Store Traffic Impact
                </h3>
              </div>
              <div className="text-2xl font-bold text-green-500">
                {loading ? '--' : `${calculateTrafficImpact() > 0 ? '+' : ''}${calculateTrafficImpact()}%`}
              </div>
              <p className="text-sm text-gray-600">Expected change in foot traffic due to weather</p>
              <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${calculateTrafficImpact() >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.abs(calculateTrafficImpact()) * 2}%` }}
                ></div>
              </div>
            </div>

            {/* Weather-Based Sales Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="pb-2">
                <h3 className="text-lg font-semibold flex items-center">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Weather-Based Sales
                </h3>
              </div>
              <div className="text-2xl font-bold text-blue-500">
                {loading ? '--' : `$${calculatePredictedSales().toLocaleString()}`}
              </div>
              <p className="text-sm text-gray-600">Predicted sales based on current weather patterns</p>
              <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 5-Day Forecast */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="pb-4">
                  <h3 className="text-xl font-semibold">5-Day Weather Forecast</h3>
                  <p className="text-gray-600">Weather forecast and business impact predictions</p>
                </div>
                <div className="space-y-4">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="flex items-center justify-between border-b border-gray-200 pb-3">
                        <div className="flex items-center">
                          <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                          <div className="w-5 h-5 bg-gray-200 rounded animate-pulse ml-4 mr-2"></div>
                          <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-4 bg-gray-200 rounded animate-pulse"></div>
                          <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    forecast.map((day, index) => (
                      <div key={index} className="flex items-center justify-between border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                        <div className="flex items-center">
                          <div className="w-24 font-medium">{day.day}</div>
                          <div className="flex items-center">
                            {getSmallWeatherIcon(day.condition)}
                            <span>{day.condition}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center">
                            <Umbrella className="h-4 w-4 text-gray-500 mr-1" />
                            <span className="text-sm">
                              {day.precipitation > 100 ? Math.min(100, Math.round(day.precipitation / 10)) : day.precipitation}%
                            </span>
                          </div>
                          <div className="w-12 text-right font-medium">{Math.round(day.temp)}°F</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Weather-Based Recommendations */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Weather-Based Recommendations</h2>
              <div className="space-y-4">
                {loading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                      <div className="w-full h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="w-3/4 h-3 bg-gray-200 rounded animate-pulse mb-4"></div>
                      <div className="flex justify-end gap-2">
                        <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
                        <div className="w-12 h-8 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))
                ) : (
                  notifications.map((item, index) => (
                    <div key={index} className={`bg-white rounded-lg shadow-sm border-l-4 p-4 ${
                      item.priority === 'high' ? 'border-red-500' : 
                      item.priority === 'medium' ? 'border-yellow-500' : 'border-green-500'
                    }`}>
                      <div className="flex items-start gap-3">
                        {item.icon}
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">{item.title}</h4>
                          <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleDismissRecommendation(item.title, index)}
                              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                            >
                              Dismiss
                            </button>
                            <button 
                              onClick={() => handleApplyRecommendation(item.title)}
                              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              Apply
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </DashboardLayout>
    </>
  );
};

export default WeatherDashboard;