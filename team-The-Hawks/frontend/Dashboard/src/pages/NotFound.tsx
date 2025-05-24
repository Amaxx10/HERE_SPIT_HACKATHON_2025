
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChartBar } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center max-w-md px-4">
        <div className="h-20 w-20 rounded-full bg-meta-teal/10 mx-auto mb-6 flex items-center justify-center">
          <ChartBar className="h-10 w-10 text-meta-teal" />
        </div>
        <h1 className="text-4xl font-bold mb-2 text-meta-blue">404</h1>
        <p className="text-xl text-foreground mb-6">This page doesn't exist in our analytics universe.</p>
        <Button asChild>
          <a href="/">Return to Dashboard</a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
