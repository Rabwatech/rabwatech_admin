'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Progress } from './progress';
import { Badge } from './badge';
import { Separator } from './separator';

interface PillarScore {
  pillarId: string;
  pillarName: string;
  pillarDescription?: string;
  percentage: number;
  weight: number;
  questionsCount: number;
}

interface PillarAnalysisProps {
  pillars: PillarScore[];
  className?: string;
}

export function PillarAnalysis({ pillars, className = '' }: PillarAnalysisProps) {
  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/20';
    if (score >= 60) return 'bg-orange-100 dark:bg-orange-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  const getScoreLevel = (score: number): string => {
    if (score >= 90) return 'ممتاز';
    if (score >= 80) return 'جيد جداً';
    if (score >= 70) return 'جيد';
    if (score >= 60) return 'مقبول';
    return 'يحتاج تحسين';
  };

  const getScoreEmoji = (score: number): string => {
    if (score >= 80) return '🟢';
    if (score >= 60) return '🟡';
    return '🔴';
  };

  return (
    <Card className={`shadow-lg border-0 ${className}`}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          تحليل مفصل للأعمدة
        </CardTitle>
        <p className="text-slate-600 dark:text-slate-400">
          تحليل شامل لأدائك في كل عمود من أعمدة التقييم مع التوصيات المخصصة
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {pillars.map((pillar, index) => (
          <motion.div
            key={pillar.pillarId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${getScoreBgColor(pillar.percentage)}`} />
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
                    {pillar.pillarName}
                  </h3>
                  {pillar.pillarDescription && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {pillar.pillarDescription}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${getScoreColor(pillar.percentage)}`}>
                  {pillar.percentage}%
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {getScoreLevel(pillar.percentage)}
                </div>
              </div>
            </div>
            
            <Progress 
              value={pillar.percentage} 
              className="h-3"
            />
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="font-semibold text-slate-700 dark:text-slate-300 text-lg">
                  {pillar.questionsCount}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">أسئلة</div>
              </div>
              <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="font-semibold text-slate-700 dark:text-slate-300 text-lg">
                  {pillar.weight}x
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">الوزن</div>
              </div>
              <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="font-semibold text-slate-700 dark:text-slate-300 text-lg">
                  {getScoreEmoji(pillar.percentage)}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">الحالة</div>
              </div>
            </div>

            {/* Performance Insights */}
            <div className={`p-3 rounded-lg ${
              pillar.percentage >= 80 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                : pillar.percentage >= 60
                ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">
                  {pillar.percentage >= 80 ? '🎯' : pillar.percentage >= 60 ? '⚠️' : '🚨'}
                </span>
                <span className={`font-medium text-sm ${
                  pillar.percentage >= 80 
                    ? 'text-green-800 dark:text-green-200'
                    : pillar.percentage >= 60
                    ? 'text-orange-800 dark:text-orange-200'
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  {pillar.percentage >= 80 
                    ? 'أداء ممتاز'
                    : pillar.percentage >= 60
                    ? 'أداء جيد'
                    : 'يحتاج تحسين'
                  }
                </span>
              </div>
              <p className={`text-xs ${
                pillar.percentage >= 80 
                  ? 'text-green-700 dark:text-green-300'
                  : pillar.percentage >= 60
                  ? 'text-orange-700 dark:text-orange-300'
                  : 'text-red-700 dark:text-red-300'
              }`}>
                {pillar.percentage >= 80 
                  ? `أداؤك في ${pillar.pillarName} ممتاز! استمر في الحفاظ على هذا المستوى.`
                  : pillar.percentage >= 60
                  ? `أداؤك في ${pillar.pillarName} جيد، لكن هناك مجال للتحسين.`
                  : `${pillar.pillarName} يحتاج إلى اهتمام خاص وتطوير منهجي.`
                }
              </p>
            </div>

            {index < pillars.length - 1 && <Separator />}
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
