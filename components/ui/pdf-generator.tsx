import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { Download } from 'lucide-react';

// Enhanced PDF Generator Component with Error Handling
export const PDFDownloadButton = ({
  assessmentData,
  performance,
  message,
  recommendations,
  isArabic
}: {
  assessmentData: any;
  performance: any;
  message: string;
  recommendations: any[];
  isArabic: boolean;
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [PDFDocument, setPDFDocument] = useState<any>(null);
  const [PDFDownloadLink, setPDFDownloadLink] = useState<any>(null);

  // Ensure component is mounted on client side and load PDF components
  useEffect(() => {
    setIsClient(true);
    
    // Dynamically import PDF components
    const loadPDFComponents = async () => {
      try {
        console.log('🔄 Loading PDF components...');
        
        // Try to import PDF components
        let pdfModule: any;
        try {
          // Dynamic import with error handling for missing dependency
          // @ts-ignore - @react-pdf/renderer may not be installed
          pdfModule = await import('@react-pdf/renderer').catch(() => null);
          if (!pdfModule) {
            throw new Error('@react-pdf/renderer is not installed');
          }
          console.log('📦 PDF module loaded successfully:', Object.keys(pdfModule));
        } catch (importError) {
          console.error('❌ Failed to import PDF module:', importError);
          throw new Error('PDF module import failed');
        }
        
        // Check if all required components are available
        const requiredComponents = ['Document', 'Page', 'Text', 'View', 'StyleSheet', 'PDFDownloadLink', 'Font'];
        const missingComponents = requiredComponents.filter(comp => !(pdfModule as any)[comp]);
        
        console.log('🔍 Checking required components:', requiredComponents);
        console.log('🔍 Available components:', Object.keys(pdfModule));
        console.log('❌ Missing components:', missingComponents);
        
        if (missingComponents.length > 0) {
          throw new Error(`Missing PDF components: ${missingComponents.join(', ')}`);
        }
        
        // Extract components safely
        const Document = (pdfModule as any).Document;
        const Page = (pdfModule as any).Page;
        const Text = (pdfModule as any).Text;
        const View = (pdfModule as any).View;
        const StyleSheet = (pdfModule as any).StyleSheet;
        const PDFDownloadLink = (pdfModule as any).PDFDownloadLink;
        const Font = (pdfModule as any).Font;
        
        console.log('🔍 Extracted components:', {
          Document: typeof Document,
          Page: typeof Page,
          Text: typeof Text,
          View: typeof View,
          StyleSheet: typeof StyleSheet,
          PDFDownloadLink: typeof PDFDownloadLink,
          Font: typeof Font
        });
        
        // Verify components are functions
        if (typeof Document !== 'function' || typeof Page !== 'function' || typeof Text !== 'function' || typeof View !== 'function' || typeof StyleSheet !== 'function' || typeof PDFDownloadLink !== 'function' || typeof Font !== 'function') {
          throw new Error('PDF components are not functions');
        }
        
        // Register fonts
        try {
          Font.register({
            family: 'Arabic',
            src: 'https://fonts.gstatic.com/s/amiri/v16/J7aRnpd8CGxBHpUrtLMA7w.ttf'
          });

          Font.register({
            family: 'English',
            src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.ttf'
          });
          
          console.log('✅ Fonts registered successfully');
        } catch (fontError) {
          console.warn('⚠️ Font registration failed, using fallback fonts:', fontError);
        }

        setPDFDocument({ Document, Page, Text, View, StyleSheet });
        setPDFDownloadLink(PDFDownloadLink);
        
        console.log('✅ PDF components loaded successfully and set to state');
        console.log('✅ PDFDocument state:', { Document, Page, Text, View, StyleSheet });
        console.log('✅ PDFDownloadLink state:', PDFDownloadLink);
      } catch (error) {
        console.error('❌ Failed to load PDF components:', error);
        setHasError(true);
      }
    };

    // Add a small delay to ensure component is fully mounted
    const timer = setTimeout(loadPDFComponents, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const handleGeneratePDF = () => {
    console.log('🚀 Starting PDF generation...', { assessmentData, performance, isArabic });
    setIsGenerating(true);
    setHasError(false);
    // Reset after a short delay
    setTimeout(() => setIsGenerating(false), 2000);
  };

  // Generate filename based on language and data
  const generateFileName = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const sessionId = assessmentData?.sessionId || 'report';
    
    if (isArabic) {
      return `نتائج-التقييم-${sessionId}-${timestamp}.pdf`;
    } else {
      return `assessment-results-${sessionId}-${timestamp}.pdf`;
    }
  };

  // Fallback function for when PDF generation fails
  const handleFallbackDownload = () => {
    try {
      console.log('📄 Using fallback text download...');
      // Create a simple text file as fallback
      const content = `
${isArabic ? 'تقرير نتائج التقييم' : 'Assessment Results Report'}
${isArabic ? 'المسار:' : 'Track:'} ${isArabic ? assessmentData?.name : assessmentData?.nameEn}
${isArabic ? 'النتيجة:' : 'Score:'} ${assessmentData?.score}%
${isArabic ? 'مستوى الأداء:' : 'Performance Level:'} ${performance?.label}
${isArabic ? 'التاريخ:' : 'Date:'} ${new Date().toLocaleDateString()}
${isArabic ? 'معرف الجلسة:' : 'Session ID:'} ${assessmentData?.sessionId || 'N/A'}

${isArabic ? 'ملخص الأداء:' : 'Performance Summary:'}
${message}

${isArabic ? 'التوصيات:' : 'Recommendations:'}
${recommendations?.map((rec, index) => `${index + 1}. ${rec.category}: ${rec.text}`).join('\n')}

${isArabic ? 'رواد التحول الرقمي - Rabwatech' : 'Digital Transformation Pioneers - Rabwatech'}
www.rabwatech.com
      `;

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = generateFileName().replace('.pdf', '.txt');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log('✅ Fallback download successful');
    } catch (error) {
      console.error('❌ Fallback download failed:', error);
      alert(isArabic ? 'فشل في التحميل. يرجى المحاولة مرة أخرى.' : 'Download failed. Please try again.');
    }
  };

  // Log component props for debugging
  useEffect(() => {
    console.log('🔧 PDFDownloadButton props:', {
      assessmentData,
      performance,
      message: message?.substring(0, 100) + '...',
      recommendationsCount: recommendations?.length,
      isArabic,
      isClient,
      PDFComponentsLoaded: !!PDFDocument && !!PDFDownloadLink
    });
  }, [assessmentData, performance, message, recommendations, isArabic, isClient, PDFDocument, PDFDownloadLink]);

  // Don't render PDFDownloadLink on server side
  if (!isClient) {
    return (
      <Button
        onClick={handleFallbackDownload}
        size="lg"
        className="relative overflow-hidden group bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 border-0 px-10 py-4 text-xl font-bold tracking-wide shimmer pulse-ring"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <Download className="w-6 h-6 mr-3 animate-pulse group-hover:animate-bounce" />
        <span className="relative z-10">
          {isArabic ? 'تحميل التقرير' : 'Download Report'}
        </span>
      </Button>
    );
  }

  // If PDF components failed to load, show fallback button
  if (hasError || !PDFDocument || !PDFDownloadLink) {
    return (
      <Button
        onClick={handleFallbackDownload}
        size="lg"
        className="relative overflow-hidden group bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 border-0 px-10 py-4 text-xl font-bold tracking-wide"
      >
        <Download className="w-6 h-6 mr-3" />
        <span>
          {isArabic ? 'تحميل نصي (بديل)' : 'Text Download (Fallback)'}
        </span>
      </Button>
    );
  }

  // Create PDF Document component
  const PDFReport = () => {
    const { Document, Page, Text, View, StyleSheet } = PDFDocument;
    
    // Create styles
    const styles = StyleSheet.create({
      page: {
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        padding: 30,
        fontFamily: isArabic ? 'Arabic' : 'English'
      },
      header: {
        fontSize: 24,
        textAlign: 'center',
        marginBottom: 20,
        color: '#1e293b',
        fontWeight: 'bold'
      },
      section: {
        marginBottom: 20
      },
      sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#334155',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: 5
      },
      row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        paddingVertical: 4
      },
      label: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: 'bold'
      },
      value: {
        fontSize: 12,
        color: '#1e293b'
      },
      score: {
        fontSize: 48,
        textAlign: 'center',
        marginVertical: 20,
        color: '#3b82f6',
        fontWeight: 'bold'
      },
      performance: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        color: '#059669',
        fontWeight: 'bold'
      },
      message: {
        fontSize: 12,
        lineHeight: 1.6,
        marginBottom: 20,
        color: '#374151',
        textAlign: 'justify'
      },
      recommendation: {
        marginBottom: 15,
        padding: 10,
        backgroundColor: '#f8fafc',
        borderRadius: 5
      },
      recTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#1e293b'
      },
      recText: {
        fontSize: 10,
        color: '#475569',
        lineHeight: 1.4
      },
      footer: {
        marginTop: 30,
        textAlign: 'center',
        fontSize: 10,
        color: '#64748b',
        borderTop: '1px solid #e2e8f0',
        paddingTop: 10
      }
    });

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.header}>
              {isArabic ? 'تقرير نتائج التقييم' : 'Assessment Results Report'}
            </Text>
          </View>

          {/* Score Section */}
          <View style={styles.section}>
            <Text style={styles.score}>{assessmentData?.score}%</Text>
            <Text style={styles.performance}>{performance?.label}</Text>
          </View>

          {/* Assessment Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {isArabic ? 'معلومات التقييم' : 'Assessment Information'}
            </Text>
            <View style={styles.row}>
              <Text style={styles.label}>{isArabic ? 'المسار:' : 'Track:'}</Text>
              <Text style={styles.value}>{isArabic ? assessmentData?.name : assessmentData?.nameEn}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>{isArabic ? 'التاريخ:' : 'Date:'}</Text>
              <Text style={styles.value}>{new Date().toLocaleDateString()}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>{isArabic ? 'معرف الجلسة:' : 'Session ID:'}</Text>
              <Text style={styles.value}>{assessmentData?.sessionId || 'N/A'}</Text>
            </View>
          </View>

          {/* Performance Message */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {isArabic ? 'ملخص الأداء' : 'Performance Summary'}
            </Text>
            <Text style={styles.message}>{message}</Text>
          </View>

          {/* Recommendations */}
          {recommendations && recommendations.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {isArabic ? 'التوصيات والتطوير' : 'Recommendations & Development'}
              </Text>
              {recommendations.map((rec, index) => (
                <View key={index} style={styles.recommendation}>
                  <Text style={styles.recTitle}>
                    {index + 1}. {rec.category}
                  </Text>
                  <Text style={styles.recText}>{rec.text}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footer}>
              {isArabic ? 'رواد التحول الرقمي - Rabwatech' : 'Digital Transformation Pioneers - Rabwatech'}
            </Text>
            <Text style={styles.footer}>www.rabwatech.com</Text>
          </View>
        </Page>
      </Document>
    );
  };

  return (
    <PDFDownloadLink
      document={<PDFReport />}
      fileName={generateFileName()}
      onClick={handleGeneratePDF}
    >
      {({ loading, error }: { loading: boolean; error: any }) => (
        <Button
          size="lg"
          disabled={loading}
          className="relative overflow-hidden group bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 border-0 px-10 py-4 text-xl font-bold tracking-wide shimmer pulse-ring"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <Download className="w-6 h-6 mr-3 animate-pulse group-hover:animate-bounce" />
          <span className="relative z-10">
            {loading 
              ? (isArabic ? 'جاري التحميل...' : 'Generating...')
              : (isArabic ? 'تحميل التقرير' : 'Download Report')
            }
          </span>
        </Button>
      )}
    </PDFDownloadLink>
  );
};
