
import React from 'react';
import { Clock, MapPin } from 'lucide-react';
import { Button } from '../ui/button';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../ui/collapsible';

interface BestTimeHeaderProps {
  locationName: string;
  isLocationSectionOpen: boolean;
  onToggleLocationSection: () => void;
  children?: React.ReactNode;
}

const BestTimeHeader: React.FC<BestTimeHeaderProps> = ({ 
  locationName, 
  isLocationSectionOpen, 
  onToggleLocationSection,
  children 
}) => {
  return (
    <Collapsible open={isLocationSectionOpen} onOpenChange={onToggleLocationSection}>
      <div className="flex items-center space-x-3">
        <div className="p-2 md:p-3 bg-white/20 rounded-xl">
          <Clock className="w-6 h-6 md:w-8 md:h-8 text-yellow-300" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl md:text-2xl font-bold text-white">Best Time to Start Running</h2>
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
            <p className="text-white/80 text-sm md:text-base">{locationName}</p>
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-white/70 hover:text-white hover:bg-white/10 h-auto p-1 text-xs gap-2 self-start md:self-auto mt-1 md:mt-0"
              >
                <MapPin className="w-3 h-3" />
                Change Location
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>
      </div>
      
      <CollapsibleContent className="mt-4">
        {/* Pass onClose to LocationSelector */}
        {React.isValidElement(children) 
          ? React.cloneElement(children as React.ReactElement, { 
              onClose: () => onToggleLocationSection() 
            })
          : children
        }
      </CollapsibleContent>
    </Collapsible>
  );
};

export default BestTimeHeader;
