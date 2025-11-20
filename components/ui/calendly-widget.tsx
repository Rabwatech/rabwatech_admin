/**
 * 🏛️ ROBWAH DEVELOPER - Calendly Widget Component
 * مكون Calendly مخصص لحجز الاستشارات
 * Built for web, mobile, and beyond
 */

'use client';

import { useEffect, useState } from 'react';
import { Calendar, X } from 'lucide-react';
import { Button } from './button';

// Add Calendly type definition
declare global {
  interface Window {
    Calendly?: any;
  }
}

interface CalendlyWidgetProps {
  isArabic?: boolean;
  className?: string;
}

export const CalendlyWidget = ({ isArabic = true, className = '' }: CalendlyWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // تحميل Calendly CSS
    const link = document.createElement('link');
    link.href = 'https://assets.calendly.com/assets/external/widget.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // تحميل Calendly Script
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    script.onload = () => setIsLoaded(true);
    document.head.appendChild(script);

    // إخفاء الأيقونة العائمة Calendly badge widget
    const hideBadgeWidget = () => {
      const badgeElements = document.querySelectorAll('.calendly-badge-widget, [data-calendly-badge]');
      badgeElements.forEach((element) => {
        (element as HTMLElement).style.display = 'none';
        (element as HTMLElement).style.visibility = 'hidden';
        (element as HTMLElement).style.opacity = '0';
        (element as HTMLElement).style.pointerEvents = 'none';
      });
    };

    // إخفاء فوري
    hideBadgeWidget();

    // إخفاء مستمر (للتأكد من عدم ظهورها)
    const interval = setInterval(hideBadgeWidget, 1000);

    return () => {
      // تنظيف عند إلغاء التحميل
      document.head.removeChild(link);
      document.head.removeChild(script);
      clearInterval(interval);
    };
  }, []);

  const openCalendly = () => {
    if (isLoaded && typeof window !== 'undefined' && (window as any).Calendly) {
      (window as any).Calendly.initPopupWidget({
        url: 'https://calendly.com/rabwtech/index'
      });
    } else {
      // فتح في نافذة جديدة كبديل
      window.open('https://calendly.com/rabwtech/index', '_blank');
    }
  };

  const openInlineWidget = () => {
    setIsOpen(true);
  };

  const closeWidget = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Hidden Calendly badge widget - completely hidden from all pages */}
      <style jsx global>{`
        .calendly-badge-widget,
        .calendly-badge-widget *,
        [data-calendly-badge],
        .calendly-badge-widget-container,
        .calendly-badge-widget iframe {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
          position: absolute !important;
          left: -9999px !important;
          top: -9999px !important;
          width: 0 !important;
          height: 0 !important;
          overflow: hidden !important;
        }
      `}</style>
      
      {/* زر فتح Calendly */}
      <Button
        onClick={openCalendly}
        variant="secondary"
        size="lg"
        className={`flex items-center gap-2 px-8 py-3 text-lg bg-[#1FB29A] hover:bg-[#1A9F8A] text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${className}`}
      >
        <Calendar className="w-5 h-5" />
        {isArabic ? 'احجز استشارة مجانية' : 'Book Free Consultation'}
      </Button>

      {/* Widget مضمن */}
      <Button
        onClick={openInlineWidget}
        variant="outline"
        size="sm"
        className="ml-2 text-green-600 border-green-600 hover:bg-green-50"
      >
        {isArabic ? 'عرض التقويم' : 'Show Calendar'}
      </Button>

      {/* Widget مضمن في الصفحة */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[80vh] m-4">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {isArabic ? 'احجز استشارة مجانية' : 'Book Free Consultation'}
              </h3>
              <Button
                onClick={closeWidget}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Calendly Widget */}
            <div className="flex-1 p-4">
              <div
                className="calendly-inline-widget w-full h-full"
                data-url="https://calendly.com/rabwtech/index"
                style={{ minHeight: '600px' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Badge Widget مخفي تماماً */}
      <div className="calendly-badge-widget" style={{ display: 'none' }} />
    </>
  );
};

// مكون مبسط للاستخدام السريع
export const SimpleCalendlyButton = ({ isArabic = true }: { isArabic?: boolean }) => {
  const openCalendly = () => {
    if (typeof window !== 'undefined' && (window as any).Calendly) {
      (window as any).Calendly.initPopupWidget({
        url: 'https://calendly.com/rabwtech/index'
      });
    } else {
      window.open('https://calendly.com/rabwtech/index', '_blank');
    }
  };

  return (
    <Button
      onClick={openCalendly}
      variant="secondary"
      size="lg"
      className="flex items-center gap-2 px-8 py-3 text-lg bg-[#1FB29A] hover:bg-[#1A9F8A] text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
    >
      <Calendar className="w-5 h-5" />
      {isArabic ? 'احجز استشارة مجانية' : 'Book Free Consultation'}
    </Button>
  );
};

export default CalendlyWidget;
