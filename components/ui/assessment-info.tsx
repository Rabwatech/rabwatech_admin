'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from './card';
import { Target, Calendar, Clock, Award } from 'lucide-react';

interface AssessmentInfoProps {
  assessment: {
    name: string;
    description?: string;
  };
  profile?: {
    name: string;
    description: string;
  };
  className?: string;
}

export function AssessmentInfo({ assessment, profile, className = '' }: AssessmentInfoProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Assessment Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-xl">
                <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
                  معلومات التقييم
                </h3>
                <p className="text-blue-700 dark:text-blue-300">
                  تفاصيل التقييم والمسار المختار
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-white/20 dark:border-slate-700/20">
                <span className="font-medium text-blue-800 dark:text-blue-200">اسم التقييم:</span>
                <span className="font-semibold text-blue-900 dark:text-blue-100">{assessment.name}</span>
              </div>
              
              {assessment.description && (
                <div className="p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-white/20 dark:border-slate-700/20">
                  <div className="font-medium text-blue-800 dark:text-blue-200 mb-2">الوصف:</div>
                  <p className="text-blue-700 dark:text-blue-300 leading-relaxed">
                    {assessment.description}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Result Profile */}
      {profile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="shadow-lg border-0 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/40 rounded-xl">
                  <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-purple-900 dark:text-purple-100">
                    الملف التعريفي للنتيجة
                  </h3>
                  <p className="text-purple-700 dark:text-purple-300">
                    تحليل شخصيتك ومستوى مهاراتك
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-white/20 dark:border-slate-700/20">
                  <span className="font-medium text-purple-800 dark:text-purple-200">الاسم:</span>
                  <span className="font-semibold text-purple-900 dark:text-purple-100">{profile.name}</span>
                </div>
                
                <div className="p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-white/20 dark:border-slate-700/20">
                  <div className="font-medium text-purple-800 dark:text-purple-200 mb-2">الوصف:</div>
                  <p className="text-purple-700 dark:text-purple-300 leading-relaxed">
                    {profile.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
