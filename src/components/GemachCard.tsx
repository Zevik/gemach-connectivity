
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BadgeLabel } from '@/components/ui/badge-label';
import { Skeleton } from '@/components/ui/skeleton';

interface GemachCardProps {
  gemach: {
    id: string;
    name: string;
    category: string;
    neighborhood: string;
    hours: string;
    image_url?: string | null;
    description?: string;
  };
  isImageLoading: boolean;
}

export const GemachCard = ({ gemach, isImageLoading }: GemachCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/gemach/${gemach.id}`);
  };

  // Get badge variant based on category
  const getBadgeVariant = (category: string): "blue" | "green" | "orange" | "purple" | "default" => {
    const categoryMap: Record<string, "blue" | "green" | "orange" | "purple" | "default"> = {
      'השאלת ציוד': 'blue',
      'מזון': 'green',
      'בגדים': 'purple',
      'רהיטים': 'orange',
    };
    
    return categoryMap[category] || 'default';
  };
  
  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.01] cursor-pointer border-2 border-gray-100"
      onClick={handleCardClick}
    >
      <div className="relative h-48 overflow-hidden">
        {isImageLoading ? (
          <Skeleton className="h-full w-full" />
        ) : gemach.image_url ? (
          <img 
            src={gemach.image_url} 
            alt={gemach.name} 
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = '/placeholder.svg';
            }}
          />
        ) : (
          <div className="h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <p className="text-gray-500">אין תמונה זמינה</p>
          </div>
        )}
        
        <div className="absolute top-3 right-3">
          <BadgeLabel variant={getBadgeVariant(gemach.category)}>
            {gemach.category}
          </BadgeLabel>
        </div>
      </div>
      
      <CardContent className="p-5">
        <h3 className="text-xl font-bold mb-2 line-clamp-1">{gemach.name}</h3>
        
        {gemach.description && (
          <p className="text-gray-600 mb-3 text-sm line-clamp-2">{gemach.description}</p>
        )}
        
        <div className="space-y-2 text-gray-600">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">{gemach.neighborhood}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm line-clamp-1">{gemach.hours}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
