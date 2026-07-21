import React, { useState } from 'react';
import { formatCurrency } from '@/lib/transaction-aggregates';

export interface DonutSegment {
  id: string;
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSegment[];
  total: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({ data, total }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // SVG parameters
  const radius = 70;
  const strokeWidth = 16;
  const circumference = 2 * Math.PI * radius;

  // Filter segments with values > 0 to avoid rendering invisible segments
  const activeSegments = data.filter((segment) => segment.value > 0);

  const segments = activeSegments.map((segment, index) => {
    const percentage = (segment.value / total) * 100;
    const strokeDasharray = `${(segment.value / total) * circumference} ${circumference}`;
    
    // Sum up the value of all segments up to the current one to calculate offset
    const previousSum = activeSegments
      .slice(0, index)
      .reduce((sum, s) => sum + s.value, 0);
    
    const strokeDashoffset = circumference - (previousSum / total) * circumference;

    return {
      ...segment,
      percentage,
      strokeDasharray,
      strokeDashoffset,
      index,
    };
  });

  const activeSegment = hoveredIndex !== null ? segments[hoveredIndex] : null;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-48 h-48 sm:w-56 sm:h-56">
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full transform -rotate-90 filter drop-shadow-sm"
        >
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="transparent"
            stroke="#f3f4f6"
            strokeWidth={strokeWidth}
          />

          {/* Data segments */}
          {segments.map((segment) => {
            const isHovered = hoveredIndex === segment.index;
            return (
              <circle
                key={segment.id}
                cx="100"
                cy="100"
                r={radius}
                fill="transparent"
                stroke={segment.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={segment.strokeDasharray}
                strokeDashoffset={segment.strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredIndex(segment.index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  transformOrigin: '50% 50%',
                }}
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 pointer-events-none">
          {activeSegment ? (
            <>
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500 max-w-[120px] truncate">
                {activeSegment.name}
              </span>
              <span className="text-sm sm:text-lg font-bold text-gray-900 mt-0.5">
                {formatCurrency(activeSegment.value)}
              </span>
              <span className="text-[10px] sm:text-xs font-medium text-gray-500 bg-gray-100 rounded-full px-2 py-0.5 mt-1">
                {activeSegment.percentage.toFixed(1)}%
              </span>
            </>
          ) : (
            <>
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500">
                Total Expenses
              </span>
              <span className="text-base sm:text-xl font-bold text-gray-900 mt-0.5">
                {formatCurrency(total)}
              </span>
              <span className="text-[9px] sm:text-[10px] text-gray-400 mt-1">
                Hover segments
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
