"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
// @ts-ignore - react-icons may not be installed
import { 
  SiReact, 
  SiTailwindcss,
  SiTypescript,
  SiSupabase,
  SiVercel,
  SiNextdotjs,
  SiNodedotjs,
  SiFigma,
  SiAdobexd,
  SiSketch,
  SiFlutter,
  SiSwift,
  SiKotlin,
  SiFirebase,
  SiExpo,
  SiAdobeillustrator,
  SiAdobephotoshop,
  SiCanva,
  SiGoogleads,
  SiMeta,
  SiGoogleanalytics,
  SiMailchimp,
  SiHotjar,
  SiSemrush,
  SiHootsuite,
  SiBuffer,
  SiNotion,
  SiGooglesheets
// @ts-ignore
} from "react-icons/si";
import { 
  Palette, 
  Zap, 
  Layers,
  Play,
  GitBranch,
  Share2
} from "lucide-react";

interface TechStackSectionProps {
  serviceKey?: string;
}

const TechStackSection = ({
  serviceKey = "web_development",
}: TechStackSectionProps) => {
  const { isArabic, content } = useLanguage();
  const { theme } = useTheme();

  // Define technology stacks for different services
  const technologyStacks = {
    // Web Development Technologies
    web_development: [
      {
        key: "react",
        nameAr: "React",
        nameEn: "React",
        descriptionAr: "مكتبة JavaScript لواجهات المستخدم",
        descriptionEn: "JavaScript library for UI",
        icon: SiReact,
        bgColor: "hover:bg-blue-50 dark:hover:bg-blue-950/30",
        color: "group-hover:text-blue-600 dark:group-hover:text-blue-400"
      },
      {
        key: "tailwind_css",
        nameAr: "Tailwind CSS",
        nameEn: "Tailwind CSS",
        descriptionAr: "إطار عمل CSS يعتمد على المرافق",
        descriptionEn: "Utility-first CSS framework",
        icon: SiTailwindcss,
        bgColor: "hover:bg-cyan-50 dark:hover:bg-cyan-950/30",
        color: "group-hover:text-cyan-600 dark:group-hover:text-cyan-400"
      },
      {
        key: "typescript",
        nameAr: "TypeScript",
        nameEn: "TypeScript",
        descriptionAr: "JavaScript مع أنواع البيانات",
        descriptionEn: "Typed JavaScript",
        icon: SiTypescript,
        bgColor: "hover:bg-blue-50 dark:hover:bg-blue-950/30",
        color: "group-hover:text-blue-600 dark:group-hover:text-blue-400"
      },
      {
        key: "supabase",
        nameAr: "Supabase",
        nameEn: "Supabase",
        descriptionAr: "بديل Firebase مفتوح المصدر",
        descriptionEn: "Open source Firebase alternative",
        icon: SiSupabase,
        bgColor: "hover:bg-green-50 dark:hover:bg-green-950/30",
        color: "group-hover:text-green-600 dark:group-hover:text-green-400"
      },
      {
        key: "vercel",
        nameAr: "Vercel",
        nameEn: "Vercel",
        descriptionAr: "منصة سحابية للمواقع الثابتة",
        descriptionEn: "Cloud platform for static sites",
        icon: SiVercel,
        bgColor: "hover:bg-black/5 dark:hover:bg-white/10",
        color: "group-hover:text-black dark:group-hover:text-white"
      },
      {
        key: "nextjs",
        nameAr: "Next.js",
        nameEn: "Next.js",
        descriptionAr: "إطار عمل React للإنتاج",
        descriptionEn: "React framework for production",
        icon: SiNextdotjs,
        bgColor: "hover:bg-gray-50 dark:hover:bg-gray-800/50",
        color: "group-hover:text-gray-600 dark:group-hover:text-gray-300"
      }
    ],

    // UX/UI Design Technologies
    ux_design: [
      {
        key: "figma",
        nameAr: "Figma",
        nameEn: "Figma",
        descriptionAr: "منصة تصميم تعاونية",
        descriptionEn: "Collaborative design platform",
        icon: SiFigma,
        bgColor: "hover:bg-purple-50 dark:hover:bg-purple-950/30",
        color: "group-hover:text-purple-600 dark:group-hover:text-purple-400"
      },
      {
        key: "adobe_xd",
        nameAr: "Adobe XD",
        nameEn: "Adobe XD",
        descriptionAr: "تصميم واجهات المستخدم والنماذج الأولية",
        descriptionEn: "UI/UX design and prototyping",
        icon: SiAdobexd,
        bgColor: "hover:bg-pink-50 dark:hover:bg-pink-950/30",
        color: "group-hover:text-pink-600 dark:group-hover:text-pink-400"
      },
      {
        key: "sketch",
        nameAr: "Sketch",
        nameEn: "Sketch",
        descriptionAr: "تصميم رقمي لـ Mac",
        descriptionEn: "Digital design for Mac",
        icon: SiSketch,
        bgColor: "hover:bg-yellow-50 dark:hover:bg-yellow-950/30",
        color: "group-hover:text-yellow-600 dark:group-hover:text-yellow-400"
      },
      {
        key: "zeplin",
        nameAr: "Zeplin",
        nameEn: "Zeplin",
        descriptionAr: "تسليم التصميم والتعاون",
        descriptionEn: "Design handoff and collaboration",
        icon: Share2,
        bgColor: "hover:bg-blue-50 dark:hover:bg-blue-950/30",
        color: "group-hover:text-blue-600 dark:group-hover:text-blue-400"
      },
      {
        key: "lottie",
        nameAr: "Lottie",
        nameEn: "Lottie",
        descriptionAr: "رسوم متحركة خفيفة الوزن",
        descriptionEn: "Lightweight animations",
        icon: Play,
        bgColor: "hover:bg-green-50 dark:hover:bg-green-950/30",
        color: "group-hover:text-green-600 dark:group-hover:text-green-400"
      },
      {
        key: "overflow",
        nameAr: "Overflow",
        nameEn: "Overflow",
        descriptionAr: "تدفق المستخدم والنماذج الأولية",
        descriptionEn: "User flow and prototyping",
        icon: GitBranch,
        bgColor: "hover:bg-orange-50 dark:hover:bg-orange-950/30",
        color: "group-hover:text-orange-600 dark:group-hover:text-orange-400"
      }
    ],

    // Mobile App Development Technologies
    mobile_app_development: [
      {
        key: "react_native",
        nameAr: "React Native",
        nameEn: "React Native",
        descriptionAr: "تطوير تطبيقات متقاطعة المنصات",
        descriptionEn: "Cross-platform app development",
        icon: SiReact,
        bgColor: "hover:bg-blue-50 dark:hover:bg-blue-950/30",
        color: "group-hover:text-blue-600 dark:group-hover:text-blue-400"
      },
      {
        key: "flutter",
        nameAr: "Flutter",
        nameEn: "Flutter",
        descriptionAr: "إطار عمل Google للتطبيقات",
        descriptionEn: "Google's app framework",
        icon: SiFlutter,
        bgColor: "hover:bg-blue-50 dark:hover:bg-blue-950/30",
        color: "group-hover:text-blue-600 dark:group-hover:text-blue-400"
      },
      {
        key: "swift",
        nameAr: "Swift",
        nameEn: "Swift",
        descriptionAr: "تطوير تطبيقات iOS أصلية",
        descriptionEn: "Native iOS development",
        icon: SiSwift,
        bgColor: "hover:bg-orange-50 dark:hover:bg-orange-950/30",
        color: "group-hover:text-orange-600 dark:group-hover:text-orange-400"
      },
      {
        key: "kotlin",
        nameAr: "Kotlin",
        nameEn: "Kotlin",
        descriptionAr: "تطوير تطبيقات Android أصلية",
        descriptionEn: "Native Android development",
        icon: SiKotlin,
        bgColor: "hover:bg-green-50 dark:hover:bg-green-950/30",
        color: "group-hover:text-green-600 dark:group-hover:text-green-400"
      },
      {
        key: "firebase",
        nameAr: "Firebase",
        nameEn: "Firebase",
        descriptionAr: "خدمات سحابية للتطبيقات",
        descriptionEn: "Cloud services for apps",
        icon: SiFirebase,
        bgColor: "hover:bg-yellow-50 dark:hover:bg-yellow-950/30",
        color: "group-hover:text-yellow-600 dark:group-hover:text-yellow-400"
      },
      {
        key: "expo",
        nameAr: "Expo",
        nameEn: "Expo",
        descriptionAr: "منصة تطوير React Native",
        descriptionEn: "React Native development platform",
        icon: SiExpo,
        bgColor: "hover:bg-black/5 dark:hover:bg-white/10",
        color: "group-hover:text-black dark:group-hover:text-white"
      }
    ],

    // Digital Marketing Technologies
    digital_marketing: [
      {
        key: "google_ads",
        nameAr: "Google Ads",
        nameEn: "Google Ads",
        descriptionAr: "إعلانات البحث والعرض",
        descriptionEn: "Search and display advertising",
        icon: SiGoogleads,
        bgColor: "hover:bg-blue-50 dark:hover:bg-blue-950/30",
        color: "group-hover:text-blue-600 dark:group-hover:text-blue-400"
      },
      {
        key: "meta_ads",
        nameAr: "Meta Ads",
        nameEn: "Meta Ads",
        descriptionAr: "إعلانات وسائل التواصل الاجتماعي",
        descriptionEn: "Social media advertising",
        icon: SiMeta,
        bgColor: "hover:bg-blue-50 dark:hover:bg-blue-950/30",
        color: "group-hover:text-blue-600 dark:group-hover:text-blue-400"
      },
      {
        key: "google_analytics",
        nameAr: "Google Analytics",
        nameEn: "Google Analytics",
        descriptionAr: "تحليلات الموقع والرؤى",
        descriptionEn: "Website analytics and insights",
        icon: SiGoogleanalytics,
        bgColor: "hover:bg-orange-50 dark:hover:bg-orange-950/30",
        color: "group-hover:text-orange-600 dark:group-hover:text-orange-400"
      },
      {
        key: "mailchimp",
        nameAr: "Mailchimp",
        nameEn: "Mailchimp",
        descriptionAr: "أتمتة التسويق عبر البريد الإلكتروني",
        descriptionEn: "Email marketing automation",
        icon: SiMailchimp,
        bgColor: "hover:bg-yellow-50 dark:hover:bg-yellow-950/30",
        color: "group-hover:text-yellow-600 dark:group-hover:text-yellow-400"
      },
      {
        key: "hotjar",
        nameAr: "Hotjar",
        nameEn: "Hotjar",
        descriptionAr: "تحليل سلوك المستخدم",
        descriptionEn: "User behavior analytics",
        icon: SiHotjar,
        bgColor: "hover:bg-red-50 dark:hover:bg-red-950/30",
        color: "group-hover:text-red-600 dark:group-hover:text-red-400"
      },
      {
        key: "semrush",
        nameAr: "SEMrush",
        nameEn: "SEMrush",
        descriptionAr: "تحليل SEO والمنافسين",
        descriptionEn: "SEO and competitive analysis",
        icon: SiSemrush,
        bgColor: "hover:bg-green-50 dark:hover:bg-green-950/30",
        color: "group-hover:text-green-600 dark:group-hover:text-green-400"
      }
    ],

    // Brand Identity Technologies
    brand_identity: [
      {
        key: "adobe_illustrator",
        nameAr: "Adobe Illustrator",
        nameEn: "Adobe Illustrator",
        descriptionAr: "تصميم الرسوم المتجهية",
        descriptionEn: "Vector graphics design",
        icon: SiAdobeillustrator,
        bgColor: "hover:bg-orange-50 dark:hover:bg-orange-950/30",
        color: "group-hover:text-orange-600 dark:group-hover:text-orange-400"
      },
      {
        key: "adobe_photoshop",
        nameAr: "Adobe Photoshop",
        nameEn: "Adobe Photoshop",
        descriptionAr: "تحرير الصور والتصميم",
        descriptionEn: "Image editing and design",
        icon: SiAdobephotoshop,
        bgColor: "hover:bg-blue-50 dark:hover:bg-blue-950/30",
        color: "group-hover:text-blue-600 dark:group-hover:text-blue-400"
      },
      {
        key: "canva",
        nameAr: "Canva",
        nameEn: "Canva",
        descriptionAr: "تصميم سهل للمبتدئين",
        descriptionEn: "Easy design for beginners",
        icon: SiCanva,
        bgColor: "hover:bg-blue-50 dark:hover:bg-blue-950/30",
        color: "group-hover:text-blue-600 dark:group-hover:text-blue-400"
      },
      {
        key: "figma",
        nameAr: "Figma",
        nameEn: "Figma",
        descriptionAr: "تصميم تعاوني للعلامات التجارية",
        descriptionEn: "Collaborative brand design",
        icon: SiFigma,
        bgColor: "hover:bg-purple-50 dark:hover:bg-purple-950/30",
        color: "group-hover:text-purple-600 dark:group-hover:text-purple-400"
      },
      {
        key: "sketch",
        nameAr: "Sketch",
        nameEn: "Sketch",
        descriptionAr: "تصميم الهوية البصرية",
        descriptionEn: "Visual identity design",
        icon: SiSketch,
        bgColor: "hover:bg-yellow-50 dark:hover:bg-yellow-950/30",
        color: "group-hover:text-yellow-600 dark:group-hover:text-yellow-400"
      },
      {
        key: "notion",
        nameAr: "Notion",
        nameEn: "Notion",
        descriptionAr: "إدارة المشاريع والوثائق",
        descriptionEn: "Project and document management",
        icon: SiNotion,
        bgColor: "hover:bg-gray-50 dark:hover:bg-gray-800/50",
        color: "group-hover:text-gray-600 dark:group-hover:text-gray-300"
      }
    ],

    // Social Media Management Technologies
    social_media_management: [
      {
        key: "hootsuite",
        nameAr: "Hootsuite",
        nameEn: "Hootsuite",
        descriptionAr: "منصة إدارة وسائل التواصل الاجتماعي",
        descriptionEn: "Social media management platform",
        icon: SiHootsuite,
        bgColor: "hover:bg-orange-50 dark:hover:bg-orange-950/30",
        color: "group-hover:text-orange-600 dark:group-hover:text-orange-400"
      },
      {
        key: "buffer",
        nameAr: "Buffer",
        nameEn: "Buffer",
        descriptionAr: "جدولة المحتوى والتحليلات",
        descriptionEn: "Content scheduling and analytics",
        icon: SiBuffer,
        bgColor: "hover:bg-blue-50 dark:hover:bg-blue-950/30",
        color: "group-hover:text-blue-600 dark:group-hover:text-blue-400"
      },
      {
        key: "canva",
        nameAr: "Canva",
        nameEn: "Canva",
        descriptionAr: "إنشاء المحتوى المرئي",
        descriptionEn: "Visual content creation",
        icon: SiCanva,
        bgColor: "hover:bg-blue-50 dark:hover:bg-blue-950/30",
        color: "group-hover:text-blue-600 dark:group-hover:text-blue-400"
      },
      {
        key: "meta_business_suite",
        nameAr: "Meta Business Suite",
        nameEn: "Meta Business Suite",
        descriptionAr: "إدارة Facebook و Instagram",
        descriptionEn: "Facebook and Instagram management",
        icon: SiMeta,
        bgColor: "hover:bg-blue-50 dark:hover:bg-blue-950/30",
        color: "group-hover:text-blue-600 dark:group-hover:text-blue-400"
      },
      {
        key: "notion",
        nameAr: "Notion",
        nameEn: "Notion",
        descriptionAr: "تخطيط المحتوى والتعاون",
        descriptionEn: "Content planning and collaboration",
        icon: SiNotion,
        bgColor: "hover:bg-gray-50 dark:hover:bg-gray-800/50",
        color: "group-hover:text-gray-600 dark:group-hover:text-gray-300"
      },
      {
        key: "google_sheets",
        nameAr: "Google Sheets",
        nameEn: "Google Sheets",
        descriptionAr: "تتبع البيانات والتقارير",
        descriptionEn: "Data tracking and reporting",
        icon: SiGooglesheets,
        bgColor: "hover:bg-green-50 dark:hover:bg-green-950/30",
        color: "group-hover:text-green-600 dark:group-hover:text-green-400"
      }
    ]
  };

  // Get the appropriate technology stack based on service key
  const technologies = technologyStacks[serviceKey as keyof typeof technologyStacks] || technologyStacks.web_development;

  // Get service-specific descriptions
  const getServiceDescription = () => {
    const descriptions = {
      web_development: {
        ar: 'نستخدم أحدث التقنيات لبناء مواقع ويب حديثة وقابلة للتوسع وعالية الأداء',
        en: 'We use the latest technologies to build modern, scalable, and high-performance websites'
      },
      ux_design: {
        ar: 'نستخدم أحدث أدوات التصميم لإنشاء تجارب مستخدم استثنائية وواجهات جذابة',
        en: 'We use the latest design tools to create exceptional user experiences and engaging interfaces'
      },
      mobile_app_development: {
        ar: 'نستخدم أحدث التقنيات لبناء تطبيقات جوال حديثة وقابلة للتوسع وعالية الأداء',
        en: 'We use the latest technologies to build modern, scalable, and high-performance mobile applications'
      },
      digital_marketing: {
        ar: 'نستخدم أحدث أدوات التسويق الرقمي لزيادة المبيعات وتحسين العائد على الاستثمار',
        en: 'We use the latest digital marketing tools to increase sales and improve ROI'
      },
      brand_identity: {
        ar: 'نستخدم أحدث أدوات التصميم لإنشاء هويات بصرية قوية ومميزة',
        en: 'We use the latest design tools to create strong and distinctive visual identities'
      },
      social_media_management: {
        ar: 'نستخدم أحدث أدوات إدارة وسائل التواصل الاجتماعي لإنشاء محتوى جذاب وإدارة فعالة',
        en: 'We use the latest social media management tools to create engaging content and effective management'
      }
    };
    
    return descriptions[serviceKey as keyof typeof descriptions] || descriptions.web_development;
  };

  const serviceDescription = getServiceDescription();

  // Enhanced animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.6,
      },
    },
  };

  const headerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.8,
      },
    },
  };

  return (
    <section
      className="py-24 bg-gradient-to-br from-white via-slate-50 to-[#f7f9fc] dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden"
      id="stack"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1abc9c]/3 to-[#d691a4]/3 dark:from-[#1abc9c]/10 dark:to-[#d691a4]/10"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full border border-[#4a638d]/20 dark:border-[#4a638d]/40 text-[#4a638d] dark:text-[#4a638d]/80 text-sm font-medium mb-6">
            <span className="text-[#1abc9c]">🛠️</span>
            <span>{isArabic ? 'تقنياتنا' : 'Our Technologies'}</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#4a638d] via-[#1abc9c] to-[#4a638d] dark:from-[#4a638d]/90 dark:via-[#1abc9c]/90 dark:to-[#4a638d]/90 bg-clip-text text-transparent">
            {isArabic ? 'مجموعة التقنيات لدينا' : 'Our Technology Stack'}
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            {isArabic 
              ? serviceDescription.ar
              : serviceDescription.en
            }
          </p>
        </motion.div>

        <motion.div
          className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {technologies.map((tech, index) => {
            const IconComponent = tech.icon;
            return (
              <motion.div
                key={tech.key}
                className="group relative"
                variants={itemVariants}
                whileHover={{
                  scale: 1.05,
                  y: -8,
                  transition: { type: "spring", stiffness: 300, damping: 20 },
                }}
                whileTap={{ scale: 0.95 }}
              >
                <div
                  className={`bg-white dark:bg-slate-800 rounded-3xl shadow-sm dark:shadow-slate-900/20 p-8 flex flex-col items-center justify-center h-full transition-all duration-300 hover:shadow-xl dark:hover:shadow-slate-900/40 border border-gray-100 dark:border-slate-700/50 ${tech.bgColor}`}
                >
                  <div
                    className={`text-gray-500 dark:text-slate-400 mb-6 transition-all duration-300 ${tech.color} group-hover:scale-110`}
                  >
                    <IconComponent className="w-12 h-12" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2 text-center">
                    {isArabic ? tech.nameAr : tech.nameEn}
                  </h3>
                  <p className="text-gray-500 dark:text-slate-400 text-sm text-center leading-relaxed">
                    {isArabic ? tech.descriptionAr : tech.descriptionEn}
                  </p>

                  {/* Enhanced tooltip */}
                  <div className="absolute opacity-0 group-hover:opacity-100 -bottom-16 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-slate-800 text-white dark:text-slate-200 text-xs rounded-lg py-2 px-4 pointer-events-none transition-all duration-300 whitespace-nowrap shadow-lg z-10 border border-slate-700/50">
                    {isArabic ? tech.descriptionAr : tech.descriptionEn}
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-slate-800 rotate-45 border-l border-t border-slate-700/50"></div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Additional info section */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <p className="text-gray-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            {isArabic 
              ? 'خياراتنا التقنية مدفوعة بالأداء والقابلية للتوسع وتجربة المطور. نحن نواكب أحدث الاتجاهات لتقديم أفضل الحلول.'
              : 'Our technology choices are driven by performance, scalability, and developer experience. We stay updated with the latest trends to deliver the best solutions.'
            }
          </p>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-[#1abc9c]/10 dark:bg-[#1abc9c]/20 rounded-full blur-2xl"></div>
      <div className="absolute bottom-20 left-20 w-24 h-24 bg-[#d691a4]/10 dark:bg-[#d691a4]/20 rounded-full blur-xl"></div>
    </section>
  );
};

export default TechStackSection;
