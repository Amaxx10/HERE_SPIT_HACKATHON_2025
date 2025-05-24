
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from '@/lib/utils';

interface RecommendationCardProps {
  title: string;
  description: string;
  actions?: React.ReactNode;
  priority?: 'high' | 'medium' | 'low';
  icon?: React.ReactNode;
  className?: string;
}

export function RecommendationCard({ 
  title, 
  description, 
  actions, 
  priority = 'medium', 
  icon, 
  className 
}: RecommendationCardProps) {
  const priorityColor = {
    high: "bg-meta-coral/10 border-meta-coral/30",
    medium: "bg-meta-amber/10 border-meta-amber/30",
    low: "bg-meta-mint/10 border-meta-mint/30"
  };
  
  return (
    <Card className={cn(
      priorityColor[priority],
      "overflow-hidden",
      className
    )}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
          </div>
          <div className={cn(
            "text-xs px-1.5 py-0.5 rounded-sm",
            priority === 'high' && "bg-meta-coral/20 text-meta-coral",
            priority === 'medium' && "bg-meta-amber/20 text-meta-amber",
            priority === 'low' && "bg-meta-mint/20 text-meta-mint",
          )}>
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{description}</p>
        {actions && (
          <div className="mt-3">
            {actions}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
