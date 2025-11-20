'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import { LucideIcon } from 'lucide-react';

interface Recommendation {
  type: string;
  title: string;
  description: string;
  icon: LucideIcon;
  priority: 'high' | 'medium' | 'low';
  action: string;
}

interface RecommendationCardProps {
  recommendation: Recommendation;
  index: number;
  className?: string;
}

export function RecommendationCard({ recommendation, index, className = '' }: RecommendationCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          border: 'border-red-200 dark:border-red-800',
          bg: 'bg-red-50 dark:bg-red-900/20',
          iconBg: 'bg-red-100 dark:bg-red-900/40',
          iconColor: 'text-red-600 dark:text-red-400',
          badgeBg: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
        };
      case 'medium':
        return {
          border: 'border-blue-200 dark:border-blue-800',
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          iconBg: 'bg-blue-100 dark:bg-blue-900/40',
          iconColor: 'text-blue-600 dark:text-blue-400',
          badgeBg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
        };
      case 'low':
        return {
          border: 'border-green-200 dark:border-green-800',
          bg: 'bg-green-50 dark:bg-green-900/20',
          iconBg: 'bg-green-100 dark:bg-green-900/40',
          iconColor: 'text-green-600 dark:text-green-400',
          badgeBg: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
        };
      default:
        return {
          border: 'border-gray-200 dark:border-gray-800',
          bg: 'bg-gray-50 dark:bg-gray-900/20',
          iconBg: 'bg-gray-100 dark:bg-gray-900/40',
          iconColor: 'text-gray-600 dark:text-gray-400',
          badgeBg: 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300'
        };
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'عالية';
      case 'medium':
        return 'متوسطة';
      case 'low':
        return 'منخفضة';
      default:
        return 'غير محدد';
    }
  };

  const colors = getPriorityColor(recommendation.priority);
  const IconComponent = recommendation.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
      className={`${className}`}
    >
      <Card className={`shadow-lg border-0 ${colors.bg} ${colors.border}`}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className={`p-3 rounded-xl ${colors.iconBg}`}>
              <IconComponent className={`w-6 h-6 ${colors.iconColor}`} />
            </div>
            
            {/* Content */}
            <div className="flex-1 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <h4 className="font-semibold text-slate-900 dark:text-white text-lg leading-tight">
                  {recommendation.title}
                </h4>
                <Badge variant="secondary" className={colors.badgeBg}>
                  {getPriorityText(recommendation.priority)}
                </Badge>
              </div>
              
              {/* Description */}
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {recommendation.description}
              </p>
              
              {/* Action */}
              <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-3 border border-white/20 dark:border-slate-700/20">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💡</span>
                  <div>
                    <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      الخطوة التالية:
                    </div>
                    <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {recommendation.action}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
