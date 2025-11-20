'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface PillarData {
  id: string;
  name: string;
  score: number;
  color: string;
}

interface DonutChartProps {
  data: PillarData[];
  overallScore: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function DonutChart({ 
  data, 
  overallScore, 
  size = 200, 
  strokeWidth = 20, 
  className = '' 
}: DonutChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const chartData = useMemo(() => {
    let currentAngle = -90; // Start from top
    const totalScore = data.reduce((sum, item) => sum + item.score, 0);
    
    return data.map((item, index) => {
      const percentage = totalScore > 0 ? (item.score / totalScore) : 0;
      const angle = (percentage * 360);
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      
      // Calculate SVG arc parameters
      const x1 = radius + radius * Math.cos((startAngle * Math.PI) / 180);
      const y1 = radius + radius * Math.sin((startAngle * Math.PI) / 180);
      const x2 = radius + radius * Math.cos((endAngle * Math.PI) / 180);
      const y2 = radius + radius * Math.sin((endAngle * Math.PI) / 180);
      
      const largeArcFlag = angle > 180 ? 1 : 0;
      
      const pathData = [
        `M ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`
      ].join(' ');
      
      currentAngle += angle;
      
      return {
        ...item,
        pathData,
        percentage,
        startAngle,
        endAngle
      };
    });
  }, [data, radius]);

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#22c55e'; // green
    if (score >= 60) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  const getScoreLevel = (score: number): string => {
    if (score >= 90) return 'ممتاز';
    if (score >= 80) return 'جيد جداً';
    if (score >= 70) return 'جيد';
    if (score >= 60) return 'مقبول';
    return 'يحتاج تحسين';
  };

  return (
    <div className={`relative ${className}`}>
      {/* SVG Chart */}
      <svg width={size} height={size} className="mx-auto">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          className="dark:stroke-slate-700"
        />
        
        {/* Data arcs */}
        {chartData.map((item, index) => (
          <motion.path
            key={item.id}
            d={item.pathData}
            fill="none"
            stroke={item.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ 
              duration: 1.5, 
              delay: index * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-center"
        >
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
            {overallScore}%
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            الدرجة الإجمالية
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
            {getScoreLevel(overallScore)}
          </div>
        </motion.div>
      </div>

      {/* Legend */}
      <div className="mt-6 space-y-2">
        {chartData.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
            className="flex items-center gap-3 text-sm"
          >
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {item.name}
            </span>
            <span className="text-slate-500 dark:text-slate-500">
              {item.score}%
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
