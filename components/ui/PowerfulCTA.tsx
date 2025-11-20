"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  Rocket,
  Star,
  ArrowRight,
  CheckCircle,
  Phone,
  Mail,
  MessageCircle,
  Crown,
  Trophy,
} from "lucide-react";

interface PowerfulCTAProps {
  className?: string;
  variant?: "primary" | "secondary" | "gradient";
  showStats?: boolean;
  showContactForm?: boolean;
}

const PowerfulCTA: React.FC<PowerfulCTAProps> = ({
  className = "",
  variant = "gradient",
  showStats = true,
  showContactForm = true,
}) => {
  const { isArabic, content } = useLanguage();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    projectType: "",
    message: "",
  });

  const stats = [
    {
      number: "500+",
      labelAr: "مشروع منجز",
      labelEn: "Projects Completed",
      icon: Trophy,
    },
    {
      number: "98%",
      labelAr: "رضا العملاء",
      labelEn: "Client Satisfaction",
      icon: Star,
    },
    {
      number: "24/7",
      labelAr: "دعم متواصل",
      labelEn: "24/7 Support",
      icon: CheckCircle,
    },
    {
      number: "50+",
      labelAr: "عميل سعيد",
      labelEn: "Happy Clients",
      icon: Crown,
    },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
  };

  const getVariantClasses = () => {
    switch (variant) {
      case "primary":
        return "bg-gradient-to-br from-[#4a638d] to-[#2c3e50]";
      case "secondary":
        return "bg-gradient-to-br from-[#1abc9c] to-[#16a085]";
      case "gradient":
      default:
        return "bg-gradient-to-br from-[#4a638d] via-[#1abc9c] to-[#d691a4]";
    }
  };

  return (
    <section
      className={`relative py-16 overflow-hidden ${getVariantClasses()} ${className}`}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.7, 0.4],
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Main CTA Content */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 text-white text-sm font-medium mb-6"
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Rocket className="w-5 h-5 text-[#d691a4]" />
            <span>{isArabic ? "🚀 ابدأ الآن" : "🚀 Start Now"}</span>
          </motion.div>

          {/* Main Title */}
          <motion.h2
            className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {isArabic
              ? "جاهز لتحويل فكرتك إلى تطبيق؟"
              : "Ready to Turn Your Idea Into an App?"}
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            className="text-base md:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {isArabic
              ? "لا تنتظر أكثر! دعنا نبدأ في بناء تطبيقك اليوم ونحول أحلامك إلى واقع رقمي مذهل"
              : "Don't wait any longer! Let's start building your app today and turn your dreams into an amazing digital reality"}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <motion.button
              className="group bg-white text-gray-900 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 flex items-center gap-3 shadow-2xl hover:shadow-white/20"
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>
                {isArabic ? "ابدأ مشروعك الآن" : "Start Your Project Now"}
              </span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
            </motion.button>

            <motion.button
              className="group border-2 border-white text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-gray-900 transition-all duration-300 flex items-center gap-3"
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsFormVisible(!isFormVisible)}
            >
              <Phone className="w-6 h-6" />
              <span>{isArabic ? "اتصل بنا الآن" : "Call Us Now"}</span>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Stats Section */}
        {showStats && (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <motion.div
                  key={index}
                  className="text-center group"
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                >
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-white/30 transition-colors duration-300">
                    <IconComponent className="w-8 h-8 text-[#cba79d]" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">
                    {stat.number}
                  </div>
                  <div className="text-white/80 text-xs">
                    {isArabic ? stat.labelAr : stat.labelEn}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Contact Form Section */}
        {showContactForm && (
          <AnimatePresence>
            {isFormVisible && (
              <motion.div
                className="max-w-2xl mx-auto"
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 50 }}
                transition={{ duration: 0.5 }}
              >
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                  <h3 className="text-2xl font-bold text-white text-center mb-6">
                    {isArabic
                      ? "احصل على استشارة مجانية"
                      : "Get Free Consultation"}
                  </h3>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        name="name"
                        placeholder={isArabic ? "الاسم الكامل" : "Full Name"}
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300"
                        required
                      />
                      <input
                        type="email"
                        name="email"
                        placeholder={
                          isArabic ? "البريد الإلكتروني" : "Email Address"
                        }
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="tel"
                        name="phone"
                        placeholder={isArabic ? "رقم الهاتف" : "Phone Number"}
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300"
                      />
                      <select
                        name="projectType"
                        value={formData.projectType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300"
                      >
                        <option value="" className="text-gray-800">
                          {isArabic ? "نوع المشروع" : "Project Type"}
                        </option>
                        <option value="mobile" className="text-gray-800">
                          {isArabic ? "تطبيق جوال" : "Mobile App"}
                        </option>
                        <option value="web" className="text-gray-800">
                          {isArabic ? "موقع ويب" : "Web App"}
                        </option>
                        <option value="both" className="text-gray-800">
                          {isArabic ? "كلاهما" : "Both"}
                        </option>
                      </select>
                    </div>

                    <textarea
                      name="message"
                      placeholder={
                        isArabic ? "وصف المشروع" : "Project Description"
                      }
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300 resize-none"
                    />

                    <motion.button
                      type="submit"
                      className="w-full bg-gradient-to-r from-[#1abc9c] to-[#4a638d] text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-[#16a085] hover:to-[#3a5178] transition-all duration-300 flex items-center justify-center gap-3"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>{isArabic ? "أرسل الرسالة" : "Send Message"}</span>
                    </motion.button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Contact Info */}
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center text-white/80">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-[#d691a4]" />
              <span>+44 7466408496</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-[#cba79d]" />
              <span>info@rabwatech.com</span>
            </div>
            <div className="flex items-center gap-3">
              <MessageCircle className="w-5 h-5 text-[#4a638d]" />
              <span>WhatsApp</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom decorative element */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#4a638d] via-[#1abc9c] to-[#cba79d]"></div>
    </section>
  );
};

export default PowerfulCTA;
