
import React from 'react';
import { Clock, Info, MapPin } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
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
          <div className="flex items-center space-x-4">
            <p className="text-white/80 text-sm md:text-base">{locationName}</p>
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-white/70 hover:text-white hover:bg-white/10 h-auto p-1 text-xs gap-2"
              >
                <MapPin className="w-3 h-3" />
                Change Location
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
              <Info className="w-4 h-4 text-white" />
            </button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-80 p-4 bg-white/95 backdrop-blur-sm border border-white/30"
            align="end"
            side="top"
            sideOffset={8}
          >
            <div className="space-y-3">
              <p className="text-sm text-gray-800 font-medium">
                Wind conditions have the highest impact on your running score, followed by temperature comfort.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
                <div>Wind (40%)</div>
                <div>Temperature (30%)</div>
                <div>UV (20%)</div>
                <div>Clouds (10%)</div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
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
