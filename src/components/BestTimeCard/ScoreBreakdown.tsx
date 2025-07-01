
import React from 'react';

interface ScoreBreakdownProps {
  scoreBreakdown: {
    windScore: number;
    uvScore: number;
    tempScore: number;
    cloudScore: number;
    currentTimeBonus: number;
    total: number;
  };
}

const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ scoreBreakdown }) => {
  return (
    <div className="bg-white/10 rounded-xl p-4 mt-4">
      <h4 className="text-white font-semibold mb-3">Scoring Breakdown (Total: {scoreBreakdown.total}/100)</h4>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="text-white/80">Wind (40%): {scoreBreakdown.windScore}/40</div>
        <div className="text-white/80">Temperature (30%): {scoreBreakdown.tempScore}/30</div>
        <div className="text-white/80">UV (20%): {scoreBreakdown.uvScore}/20</div>
        <div className="text-white/80">Clouds (10%): {scoreBreakdown.cloudScore}/10</div>
      </div>
      <div className="text-white/70 text-xs mt-2">
        Wind conditions have the highest impact on your running score, followed by temperature comfort.
      </div>
    </div>
  );
};

export default ScoreBreakdown;
