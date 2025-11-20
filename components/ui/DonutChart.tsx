'use client';

import { useMemo } from 'react';

interface DonutChartData {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutChartData[];
  size?: number;
  centerValue?: number;
  centerLabel?: string;
  centerValueColor?: string;
}

const DonutChart = ({ 
  data, 
  size = 300, 
  centerValue, 
  centerLabel, 
  centerValueColor = '#f97316' 
}: DonutChartProps) => {
  const radius = size / 2;
  const innerRadius = radius * 0.6;
  const strokeWidth = radius - innerRadius;

  const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);

  const createArc = (startAngle: number, endAngle: number, isInner: boolean = false) => {
    const r = isInner ? innerRadius : radius;
    const x1 = r * Math.cos(startAngle);
    const y1 = r * Math.sin(startAngle);
    const x2 = r * Math.cos(endAngle);
    const y2 = r * Math.sin(endAngle);

    const largeArcFlag = Math.abs(endAngle - startAngle) > Math.PI ? 1 : 0;

    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
  };

  const createLabelPosition = (angle: number, isInner: boolean = false) => {
    const r = isInner ? innerRadius * 0.8 : radius * 1.2;
    const x = r * Math.cos(angle);
    const y = r * Math.sin(angle);
    return { x, y };
  };

  const segments = useMemo(() => {
    let currentAngle = -Math.PI / 2; // Start from top
    return data.map((item, index) => {
      const angle = (item.value / total) * 2 * Math.PI;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      const midAngle = startAngle + angle / 2;
      
      currentAngle = endAngle;

      return {
        ...item,
        startAngle,
        endAngle,
        midAngle,
        path: createArc(startAngle, endAngle),
        labelPos: createLabelPosition(midAngle, false),
        innerLabelPos: createLabelPosition(midAngle, true)
      };
    });
  }, [data, total]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={radius}
          cy={radius}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          className="dark:stroke-slate-700"
        />
        
        {/* Data segments */}
        {segments.map((segment, index) => (
          <g key={index}>
            <path
              d={segment.path}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              transform={`translate(${radius}, ${radius})`}
            />
          </g>
        ))}
      </svg>

      {/* Center content */}
      {centerValue !== undefined && (
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            width: innerRadius * 2,
            height: innerRadius * 2
          }}
        >
          <div className="text-center">
            <div 
              className="text-4xl font-bold mb-1"
              style={{ color: centerValueColor }}
            >
              {centerValue}
            </div>
            {centerLabel && (
              <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                {centerLabel}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Labels around the chart */}
      <div className="absolute inset-0">
        {segments.map((segment, index) => (
          <div
            key={index}
            className="absolute text-xs font-medium text-slate-700 dark:text-slate-300"
            style={{
              left: `${radius + segment.labelPos.x}px`,
              top: `${radius + segment.labelPos.y}px`,
              transform: 'translate(-50%, -50%)',
              whiteSpace: 'nowrap'
            }}
          >
            {segment.name}
          </div>
        ))}
      </div>

      {/* Inner labels with values */}
      <div className="absolute inset-0">
        {segments.map((segment, index) => (
          <div
            key={index}
            className="absolute text-xs font-semibold"
            style={{
              left: `${radius + segment.innerLabelPos.x}px`,
              top: `${radius + segment.innerLabelPos.y}px`,
              transform: 'translate(-50%, -50%)',
              color: segment.color,
              whiteSpace: 'nowrap'
            }}
          >
            {segment.value}%
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonutChart;
