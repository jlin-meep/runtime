
import React from 'react';
import { Timer } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatTime } from '../../utils/timeUtils';

interface TimeWindowControlsProps {
  timeWindow: number[];
  setTimeWindow: (value: number[]) => void;
  runDuration: number;
  setRunDuration: (value: number) => void;
}

const TimeWindowControls: React.FC<TimeWindowControlsProps> = ({
  timeWindow,
  setTimeWindow,
  runDuration,
  setRunDuration
}) => {
  return (
    <div className="flex flex-row gap-4">
      {/* Run Duration Selector */}
      <div className="flex-1 p-3 bg-white/10 rounded-xl border border-white/20">
        <div className="flex items-center space-x-2 mb-2">
          <Timer className="w-4 h-4 text-white" />
          <h3 className="text-white font-semibold text-sm">Run Duration</h3>
        </div>
        <Select value={runDuration.toString()} onValueChange={(value) => setRunDuration(parseFloat(value))}>
          <SelectTrigger className="w-full bg-white/10 border-white/20 text-white text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0.5">30 min</SelectItem>
            <SelectItem value="1">1 hr</SelectItem>
            <SelectItem value="1.5">1.5 hr</SelectItem>
            <SelectItem value="2">2 hr</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Time Window Slider */}
      <div className="flex-1 p-3 bg-white/10 rounded-xl border border-white/20">
        <h3 className="text-white font-semibold text-sm mb-3">Available Window</h3>
        <div className="relative mb-4">
          <Slider
            value={timeWindow}
            onValueChange={setTimeWindow}
            max={23}
            min={0}
            step={1}
            className="w-full"
          />
          {/* Time labels positioned under each handle */}
          <div className="absolute -bottom-2 left-0 right-0">
            <div 
              className="absolute text-white text-xs whitespace-nowrap"
              style={{ 
                left: `${(timeWindow[0] / 23) * 100}%`, 
                transform: 'translateX(-50%)' 
              }}
            >
              {formatTime(timeWindow[0])}
            </div>
            <div 
              className="absolute text-white text-xs whitespace-nowrap"
              style={{ 
                left: `${(timeWindow[1] / 23) * 100}%`, 
                transform: 'translateX(-50%)' 
              }}
            >
              {formatTime(timeWindow[1])}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeWindowControls;
