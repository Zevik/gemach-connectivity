
import { GemachCard } from '@/components/GemachCard';
import { Loader2 } from 'lucide-react';

interface GemachGridProps {
  isLoading: boolean;
  filteredGemachs: any[];
  imageLoadingStates: Record<string, boolean>;
}

export const GemachGrid = ({ 
  isLoading, 
  filteredGemachs, 
  imageLoadingStates 
}: GemachGridProps) => {
  return (
    <section className="py-12 md:py-16 px-4 bg-gray-50">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold">
            גמ״חים מובילים
          </h2>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-sky-600" />
            <span className="text-lg mr-4">טוען גמ״חים...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredGemachs.length > 0 ? (
              filteredGemachs.map((gemach) => (
                <GemachCard 
                  key={gemach.id} 
                  gemach={gemach} 
                  isImageLoading={imageLoadingStates[gemach.id]} 
                />
              ))
            ) : (
              <div className="col-span-full py-10 text-center text-gray-500">
                <p className="text-xl mb-2">לא נמצאו גמ״חים התואמים את החיפוש</p>
                <p className="text-gray-400">נסה לשנות את מונחי החיפוש או הסרת הסינון</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
