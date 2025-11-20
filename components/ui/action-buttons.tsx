'use client';

import { motion } from 'framer-motion';
import { Button } from './button';
import { useRouter } from 'next/navigation';
import { PDFDownloadButton } from './pdf-generator';

interface ActionButtonsProps {
  pdfData: any;
  className?: string;
}

export function ActionButtons({ pdfData, className = '' }: ActionButtonsProps) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
      className={`text-center ${className}`}
    >
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={() => router.push('/growth-index')}
          className="bg-gradient-to-r from-[#4a638d] to-[#1abc9c] hover:from-[#4a638d]/90 hover:to-[#1abc9c]/90 text-white px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          تقييم جديد
        </Button>
        
        <Button
          variant="outline"
          onClick={() => router.push('/contact')}
          className="px-8 py-3 text-lg border-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 transform hover:scale-105"
        >
          تواصل معنا
        </Button>

                {pdfData && (
          <PDFDownloadButton 
            assessmentData={pdfData.assessmentData || {}}
            performance={pdfData.performance || {}}
            message={pdfData.message || ''}
            recommendations={pdfData.recommendations || []}
            isArabic={pdfData.isArabic || false}
          />
        )}
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          شارك نتائجك مع فريقك أو احفظها كمرجع للمستقبل
        </p>
      </div>
    </motion.div>
  );
}
