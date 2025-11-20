'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Target, Star, TrendingUp, Lightbulb, CheckCircle } from 'lucide-react';

interface PillarScore {
  pillarId: string;
  pillarName: string;
  percentage: number;
}

interface FinalRecommendationsProps {
  weakestPillar: PillarScore | null;
  strongestPillar: PillarScore | null;
  overallScore: number;
  className?: string;
}

export function FinalRecommendations({ 
  weakestPillar, 
  strongestPillar, 
  overallScore, 
  className = '' 
}: FinalRecommendationsProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {weakestPillar && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="shadow-lg border-0 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-xl">
                  <Target className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-red-900 dark:text-red-100">
                    نقطة التركيز الرئيسية
                  </h4>
                  <p className="text-red-700 dark:text-red-300">
                    ركز على هذا العمود لتحقيق أكبر تحسن
                  </p>
                </div>
              </div>
              <p className="text-red-800 dark:text-red-200 leading-relaxed text-lg">
                <strong>{weakestPillar.pillarName}</strong> يحتاج إلى اهتمام خاص وتطوير منهجي. 
                ركز على تطوير مهاراتك في هذا العمود لتحقيق أكبر تحسن في درجتك الإجمالية.
              </p>
              <div className="mt-4 p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-white/20 dark:border-slate-700/20">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <div className="text-sm font-medium text-red-800 dark:text-red-200">
                      خطة العمل المقترحة:
                    </div>
                    <div className="text-sm text-red-700 dark:text-red-300">
                      ابدأ بقراءة الكتب والدورات التدريبية في هذا المجال، ثم مارس المهارات عملياً
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {strongestPillar && strongestPillar.percentage >= 85 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card className="shadow-lg border-0 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-xl">
                  <Star className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-green-900 dark:text-green-100">
                    نقطة القوة الرئيسية
                  </h4>
                  <p className="text-green-700 dark:text-green-300">
                    استثمر في قوتك لتطوير مهارات أخرى
                  </p>
                </div>
              </div>
              <p className="text-green-800 dark:text-green-200 leading-relaxed text-lg">
                <strong>{strongestPillar.pillarName}</strong> هو عمود قوتك الرئيسي. 
                يمكنك الاستفادة من هذه القوة لتطوير مهارات أخرى أو مساعدة الآخرين في تطوير مهاراتهم.
              </p>
              <div className="mt-4 p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-white/20 dark:border-slate-700/20">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💪</span>
                  <div>
                    <div className="text-sm font-medium text-green-800 dark:text-green-200">
                      كيف تستثمر في قوتك:
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-300">
                      فكر في تدريب الآخرين أو التخصص أكثر في هذا المجال
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {overallScore < 70 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-xl">
                  <Lightbulb className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
                    تطوير شامل
                  </h4>
                  <p className="text-blue-700 dark:text-blue-300">
                    ركز على جميع جوانب مهاراتك
                  </p>
                </div>
              </div>
              <p className="text-blue-800 dark:text-blue-200 leading-relaxed text-lg">
                درجتك الإجمالية تشير إلى أنك تحتاج إلى تطوير شامل. 
                ركز على تطوير جميع جوانب مهاراتك لتحقيق النمو المتوازن.
              </p>
              <div className="mt-4 p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-white/20 dark:border-slate-700/20">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📚</span>
                  <div>
                    <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      خطة التطوير الشامل:
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      ابدأ بخطة تطوير شاملة تغطي جميع الأعمدة
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {overallScore >= 85 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <Card className="shadow-lg border-0 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border border-purple-200 dark:border-purple-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/40 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-purple-900 dark:text-purple-100">
                    الحفاظ على التميز
                  </h4>
                  <p className="text-purple-700 dark:text-purple-300">
                    أداؤك ممتاز! استمر في التطوير
                  </p>
                </div>
              </div>
              <p className="text-purple-800 dark:text-purple-200 leading-relaxed text-lg">
                أداؤك ممتاز! ركز على الحفاظ على هذا المستوى وتطوير مهارات متقدمة 
                لتحقيق التميز المستمر في مجال عملك.
              </p>
              <div className="mt-4 p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-white/20 dark:border-slate-700/20">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🚀</span>
                  <div>
                    <div className="text-sm font-medium text-purple-800 dark:text-purple-200">
                      الخطوة التالية:
                    </div>
                    <div className="text-sm text-purple-700 dark:text-purple-300">
                      طور مهارات متقدمة وتخصص في مجالات محددة
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
