
import React from 'react';

interface ProgressBarProps {
  percentage: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ percentage }) => {
  const safePercentage = Math.max(0, Math.min(100, percentage));

  return (
    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
      <div
        className="bg-primary h-4 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${safePercentage}%` }}
      >
        <span className="text-xs font-medium text-white px-2 leading-4 flex items-center h-full justify-end">
            {safePercentage > 10 ? `${Math.round(safePercentage)}%` : ''}
        </span>
      </div>
    </div>
  );
};

export default ProgressBar;
   