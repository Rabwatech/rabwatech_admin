'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Mic, MessageSquare, User, Mail, Phone, Send, Sparkles, Zap } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';

const FloatingCTA = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentView, setCurrentView] = useState<'menu' | 'form' | 'chat' | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [messages, setMessages] = useState<Array<{id: string, role: 'user' | 'ai', content: string, timestamp: Date}>>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceChat, setIsVoiceChat] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isArabic } = useLanguage();

  // 📜 Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'end',
      inline: 'nearest'
    });
  };

  // 🎨 Format Markdown text for AI messages
  const formatMarkdownText = (text: string): string => {
    let formatted = text;
    
    // Handle line breaks first
    formatted = formatted.replace(/\n/g, '<br>');
    
    // Bold text: **text** (but not if it's part of a larger pattern)
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-slate-800 dark:text-slate-200">$1</strong>');
    
    // Italic text: *text* (but not if it's part of **text**)
    formatted = formatted.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em class="italic text-slate-700 dark:text-slate-300">$1</em>');
    
    // Code: `text`
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-slate-200 dark:bg-slate-600 px-2 py-1 rounded text-xs font-mono text-slate-800 dark:text-slate-200">$1</code>');
    
    // Lists: - item or * item
    formatted = formatted.replace(/^[-*] (.+)$/gm, '<div class="ml-4 flex items-start"><span class="text-slate-500 mr-2">•</span><span>$1</span></div>');
    
    // Numbered lists: 1. item
    formatted = formatted.replace(/^\d+\. (.+)$/gm, '<div class="ml-4 flex items-start"><span class="text-slate-500 mr-2">$&</span><span>$1</span></div>');
    
    // Links: [text](url)
    formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Note: Emojis will display normally without special formatting
    
    // Questions and headings (lines ending with ? or :)
    formatted = formatted.replace(/^(.+[?:])\s*$/gm, '<div class="font-semibold text-slate-800 dark:text-slate-200 mb-2">$1</div>');
    
    // Clean up any double line breaks
    formatted = formatted.replace(/<br><br>/g, '<br>');
    
    // Wrap the entire content in a div for better styling
    return `<div class="prose prose-sm max-w-none">${formatted}</div>`;
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 300;
      setIsVisible(scrolled);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 📜 Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const openView = (view: 'menu' | 'form' | 'chat') => {
    setCurrentView(view);
  };

  const closeAll = () => {
    setCurrentView(null);
    setFormData({ name: '', email: '', phone: '' });
    setMessages([]);
    setCurrentMessage('');
    setIsTyping(false);
    setIsRecording(false);
    setIsVoiceChat(false);
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
  };

  // 🎤 Start voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        await sendVoiceMessage(audioBlob);
        setAudioChunks([]);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setAudioChunks(chunks);

    } catch (error) {
      console.error('Error starting recording:', error);
      if (isArabic) {
        alert('⚠️ لا يمكن الوصول للميكروفون. يرجى السماح بالوصول للميكروفون.');
      } else {
        alert('⚠️ Cannot access microphone. Please allow microphone access.');
      }
    }
  };

  // 🛑 Stop voice recording
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  // 📤 Send voice message to AI
  const sendVoiceMessage = async (audioBlob: Blob) => {
    try {
      // Convert audio to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const base64Audio = btoa(String.fromCharCode.apply(null, Array.from(uint8Array)));

      // Prepare conversation history
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch('/api/voice-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioData: base64Audio,
          mimeType: 'audio/wav',
          conversationHistory,
          userId: formData.email,
          sessionId
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Add AI response to chat
        const aiMessage = {
          id: crypto.randomUUID(),
          role: 'ai' as const,
          content: result.data.message,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);
        
        // Scroll to bottom after AI response
        setTimeout(() => scrollToBottom(), 200);
      } else {
        // Handle error
        const errorMessage = {
          id: crypto.randomUUID(),
          role: 'ai' as const,
          content: isArabic 
            ? '⚠️ عذراً، حدث خطأ في معالجة الرسالة الصوتية. يرجى المحاولة مرة أخرى.' 
            : '⚠️ Sorry, there was an error processing the voice message. Please try again.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Voice message error:', error);
      const errorMessage = {
        id: crypto.randomUUID(),
        role: 'ai' as const,
        content: isArabic 
          ? '⚠️ عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.' 
          : '⚠️ Sorry, there was a connection error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // 🤖 Send message to AI
  const sendMessage = async () => {
    if (!currentMessage.trim() || isTyping) return;

    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user' as const,
      content: currentMessage.trim(),
      timestamp: new Date()
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsTyping(true);
    
    // Scroll to bottom after adding user message
    setTimeout(() => scrollToBottom(), 100);

    try {
      // Prepare conversation history for AI
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory,
          userId: formData.email,
          sessionId
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Add AI response to chat
        const aiMessage = {
          id: crypto.randomUUID(),
          role: 'ai' as const,
          content: result.data.message,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);
        
        // Scroll to bottom after AI response
        setTimeout(() => scrollToBottom(), 200);
    } else {
        // Handle error
        const errorMessage = {
          id: crypto.randomUUID(),
          role: 'ai' as const,
          content: isArabic 
            ? '⚠️ عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.' 
            : '⚠️ Sorry, there was a connection error. Please try again.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
        
        // Scroll to bottom after error message
        setTimeout(() => scrollToBottom(), 200);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: crypto.randomUUID(),
        role: 'ai' as const,
        content: isArabic 
          ? '⚠️ عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.' 
          : '⚠️ Sorry, there was a connection error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      // Scroll to bottom after error message
      setTimeout(() => scrollToBottom(), 200);
    } finally {
      setIsTyping(false);
    }
  };

  // 🎯 Initialize chat with welcome message
  const initializeChat = () => {
    const welcomeMessage = {
      id: crypto.randomUUID(),
      role: 'ai' as const,
      content: isArabic 
        ? `مرحباً ${formData.name}! 👋\n\nأنا مساعدك الذكي من فريق ربوة التقنية. أنا هنا لمساعدتك في:\n\n🏢 تطوير التطبيقات\n🎨 الهوية التجارية\n📈 النمو الرقمي\n📱 إدارة وسائل التواصل\n🎯 تجربة المستخدم\n🌐 تطوير المواقع\n\nكيف يمكنني مساعدتك اليوم؟`
        : `Hello ${formData.name}! 👋\n\nI'm your intelligent assistant from Rabwa Tech team. I'm here to help you with:\n\n🏢 App Development\n🎨 Brand Identity\n📈 Digital Growth\n📱 Social Media Management\n🎯 UX Design\n🌐 Web Development\n\nHow can I assist you today?`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
    
    // Scroll to bottom after welcome message
    setTimeout(() => scrollToBottom(), 300);
  };

  // 🎤 Initialize voice chat with welcome message
  const initializeVoiceChat = () => {
    const welcomeMessage = {
      id: crypto.randomUUID(),
      role: 'ai' as const,
      content: isArabic 
        ? `مرحباً ${formData.name}! 🎤\n\nأنا مساعدك الصوتي الذكي من فريق ربوة التقنية. يمكنك التحدث معي مباشرة!\n\n🏢 تطوير التطبيقات\n🎨 الهوية التجارية\n📈 النمو الرقمي\n📱 إدارة وسائل التواصل\n🎯 تجربة المستخدم\n🌐 تطوير المواقع\n\nاضغط على زر الميكروفون وابدأ بالتحدث!`
        : `Hello ${formData.name}! 🎤\n\nI'm your intelligent voice assistant from Rabwa Tech team. You can talk to me directly!\n\n🏢 App Development\n🎨 Brand Identity\n📈 Digital Growth\n📱 Social Media Management\n🎯 UX Design\n🌐 Web Development\n\nPress the microphone button and start talking!`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
    setIsVoiceChat(true);
    
    // Scroll to bottom after welcome message
    setTimeout(() => scrollToBottom(), 300);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email) {
      try {
        // إرسال البيانات إلى قاعدة البيانات
        const requestData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || 'Not provided',
          country: 'Unknown',
          lead_source: 'live_chat'
        };
        
        console.log('📤 Sending data to API:', requestData);
        
        const response = await fetch('/api/leads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        });

        if (response.ok) {
          // نجح الإرسال، افتح الدردشة وتهيئتها
          if (isVoiceChat) {
            initializeVoiceChat();
          } else {
            initializeChat();
          }
          openView('chat');
        } else {
          // فشل الإرسال، اعرض رسالة خطأ
          if (isArabic) {
            alert('⚠️ حدث خطأ في حفظ البيانات. يرجى المحاولة مرة أخرى.');
          } else {
            alert('⚠️ Error saving data. Please try again.');
          }
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        if (isArabic) {
          alert('⚠️ حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.');
        } else {
          alert('⚠️ Connection error. Please try again.');
        }
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeAll();
    }
  };

  return (
    <>
      {/* تأثير البلور على باقي الموقع */}
      <AnimatePresence>
        {currentView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-lg z-[9990]"
            style={{
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)'
            }}
            onClick={handleBackdropClick}
          />
        )}
      </AnimatePresence>

    <AnimatePresence>
      {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0, y: 100, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, scale: 0, y: 100, rotate: 180 }}
            transition={{ duration: 0.8, ease: "easeOut", type: "spring" }}
            className="fixed bottom-8 right-8 z-[9999]"
          >
            {/* تأثير الإضاءة الخلفية */}
            <motion.div
              className="absolute inset-0 w-32 h-32 bg-gradient-to-r from-blue-400/20 via-cyan-400/20 to-purple-400/20 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />

            {/* القائمة الرئيسية */}
            <AnimatePresence mode="wait">
              {currentView === 'menu' && (
                <motion.div
                  key="menu"
                  initial={{ opacity: 0, scale: 0.8, y: 20, x: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 20, x: 20 }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className="absolute bottom-24 right-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl p-8 border border-white/20 dark:border-slate-600/50 min-w-[420px]"
                  style={{
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)'
                  }}
                >
                  {/* رأس القائمة */}
                  <div className="text-center mb-8">
                    <motion.div 
                      className="relative w-20 h-20 bg-gradient-to-br from-[#4a638d] via-[#1abc9c] to-[#cba79d] rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    >
                      <MessageCircle className="w-10 h-10 text-white" />
                      <motion.div
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/30 via-cyan-400/30 to-purple-400/30"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </motion.div>
                    
                    <motion.h3 
                      className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-600 to-slate-900 dark:from-white dark:via-cyan-300 dark:to-white bg-clip-text text-transparent mb-3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {isArabic ? '✨ اختر طريقة التواصل ✨' : '✨ Choose Contact Method ✨'}
                    </motion.h3>
                    
                    <motion.p 
                      className="text-slate-600 dark:text-slate-300"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      {isArabic ? 'كيف تفضل التواصل معنا؟' : 'How would you like to contact us?'}
                    </motion.p>
                  </div>

                  {/* خيارات التواصل */}
                  <div className="space-y-4">
                    {/* التحدث الصوتي */}
                    <motion.button
                      onClick={() => {
                        setIsVoiceChat(true);
                        openView('form');
                      }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl border-2 border-blue-200/50 dark:border-blue-600/50 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300 p-6"
                    >
                      <div className="flex items-center space-x-4">
                        <motion.div 
                          className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300"
                          whileHover={{ rotate: [0, 360] }}
                          transition={{ duration: 1 }}
                        >
                          <Mic className="w-7 h-7 text-white" />
                        </motion.div>
                        <div className="text-left flex-1">
                          <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-1">
                            {isArabic ? '🎤 التحدث الصوتي' : '🎤 Voice Chat'}
                          </h4>
                          <p className="text-sm text-blue-600 dark:text-blue-300">
                            {isArabic ? 'تواصل صوتي مباشر' : 'Direct voice communication'}
                          </p>
                        </div>
                        <Zap className="w-5 h-5 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </motion.button>

                    {/* الدردشة المباشرة */}
                    <motion.button
                      onClick={() => {
                        setIsVoiceChat(false);
                        openView('form');
                      }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full group relative overflow-hidden bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border-2 border-green-200/50 dark:border-green-600/50 hover:border-green-300 dark:hover:border-green-500 transition-all duration-300 p-6"
                    >
                      <div className="flex items-center space-x-4">
                        <motion.div 
                          className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300"
                          whileHover={{ rotate: [0, -360] }}
                          transition={{ duration: 1 }}
                        >
                          <MessageSquare className="w-7 h-7 text-white" />
                        </motion.div>
                        <div className="text-left flex-1">
                          <h4 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-1">
                            {isArabic ? '💬 دردشة مباشرة' : '💬 Live Chat'}
                          </h4>
                          <p className="text-sm text-green-600 dark:text-green-300">
                            {isArabic ? 'رسائل فورية ومباشرة' : 'Instant messaging'}
                          </p>
                        </div>
                        <Sparkles className="w-5 h-5 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </motion.button>
                  </div>
                  
                  {/* سهم يشير للزر */}
                  <div className="absolute top-full right-10 w-0 h-0 border-l-10 border-r-10 border-t-10 border-l-transparent border-r-transparent border-t-white dark:border-t-slate-800" />
                </motion.div>
              )}

              {/* نموذج البيانات */}
              {currentView === 'form' && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, scale: 0.8, y: 20, x: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 20, x: 20 }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className="absolute bottom-24 right-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl p-8 border border-white/20 dark:border-slate-600/50 min-w-[420px]"
                  style={{
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)'
                  }}
                >
                  {/* رأس النموذج */}
                  <div className="text-center mb-8">
                    <motion.div 
                      className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <User className="w-10 h-10 text-white" />
                    </motion.div>
                    
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                      {isArabic ? '👤 أدخل بياناتك' : '👤 Enter Your Details'}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      {isArabic ? 'لبدء الدردشة المباشرة' : 'To start live chat'}
                    </p>
                  </div>

                  {/* النموذج */}
                  <form onSubmit={handleFormSubmit} className="space-y-6">
                    {/* الاسم */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {isArabic ? 'الاسم *' : 'Name *'}
                      </label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-green-500 transition-colors" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 dark:border-slate-600 rounded-2xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:border-green-500 dark:focus:border-green-400 focus:outline-none transition-all duration-300 focus:ring-4 focus:ring-green-500/20"
                          placeholder={isArabic ? 'أدخل اسمك' : 'Enter your name'}
                        />
                      </div>
                    </div>

                    {/* الإيميل */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {isArabic ? 'البريد الإلكتروني *' : 'Email *'}
                      </label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-green-500 transition-colors" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 dark:border-slate-600 rounded-2xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:border-green-500 dark:focus:border-green-400 focus:outline-none transition-all duration-300 focus:ring-4 focus:ring-green-500/20"
                          placeholder={isArabic ? 'أدخل إيميلك' : 'Enter your email'}
                        />
                      </div>
                    </div>

                    {/* رقم التلفون */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {isArabic ? 'رقم التلفون (اختياري)' : 'Phone Number (Optional)'}
                      </label>
                      <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-green-500 transition-colors" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 dark:border-slate-600 rounded-2xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:border-green-500 dark:focus:border-green-400 focus:outline-none transition-all duration-300 focus:ring-4 focus:ring-green-500/20"
                          placeholder={isArabic ? 'أدخل رقم تلفونك' : 'Enter your phone number'}
                        />
                      </div>
                    </div>

                    {/* أزرار */}
                    <div className="flex space-x-4 pt-4">
                      <button
                        type="button"
                        onClick={closeAll}
                        className="flex-1 px-6 py-4 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-2xl hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 font-medium"
                      >
                        {isArabic ? 'إلغاء' : 'Cancel'}
                      </button>
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 font-medium flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                      >
                        <Send className="w-5 h-5" />
                        <span>{isArabic ? 'ابدأ الدردشة' : 'Start Chat'}</span>
                      </motion.button>
                    </div>
                  </form>

                  {/* سهم يشير للزر */}
                  <div className="absolute top-full right-10 w-0 h-0 border-l-10 border-r-10 border-t-10 border-l-transparent border-r-transparent border-t-white dark:border-t-slate-800" />
                </motion.div>
              )}

              {/* الدردشة المباشرة */}
              {currentView === 'chat' && (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, scale: 0.8, y: 20, x: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 20, x: 20 }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className="absolute bottom-24 right-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/20 dark:border-slate-600/50 min-w-[420px] max-h-[500px] flex flex-col"
                  style={{
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)'
                  }}
                >
                  {/* رأس الدردشة الذكية */}
                  <div className="p-6 border-b border-slate-200 dark:border-slate-600 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-t-[2rem]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-semibold text-lg">
                            {isVoiceChat 
                              ? (isArabic ? 'مساعد ربوة الصوتي' : 'Rabwa Voice Assistant')
                              : (isArabic ? 'مساعد ربوة الذكي' : 'Rabwa AI Assistant')
                            }
                          </h4>
                          <p className="text-white/80 text-sm flex items-center">
                            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                            {isVoiceChat 
                              ? (isArabic ? 'مكالمة صوتية نشطة' : 'Voice Call Active')
                              : (isArabic ? 'متصل الآن' : 'Online')
                            }
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={closeAll}
                        className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                      >
                        <X className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* منطقة الرسائل الذكية */}
                  <div className="flex-1 p-6 space-y-4 max-h-[300px] overflow-y-auto scroll-smooth">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] ${
                          message.role === 'user' 
                            ? 'bg-green-500 text-white rounded-2xl rounded-br-md' 
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl rounded-bl-md'
                        } px-4 py-3`}>
                          <div className="text-sm whitespace-pre-wrap">
                            {message.role === 'ai' ? (
                              <div dangerouslySetInnerHTML={{ 
                                __html: formatMarkdownText(message.content) 
                              }} />
                            ) : (
                              <p>{message.content}</p>
                            )}
                          </div>
                          <p className={`text-xs mt-1 ${
                            message.role === 'user' ? 'text-green-100' : 'text-slate-500'
                          }`}>
                            {message.timestamp.toLocaleTimeString('ar-SA', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                    
                    {/* مؤشر الكتابة */}
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl rounded-bl-md px-4 py-3">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    
                    {/* Auto-scroll target */}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* منطقة إدخال الرسالة الذكية */}
                  <div className="p-6 border-t border-slate-200 dark:border-slate-600">
                    {isVoiceChat ? (
                      /* واجهة التحدث الصوتي */
                      <div className="flex flex-col items-center space-y-4">
                        <div className="text-center">
                          <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                            {isArabic 
                              ? 'اضغط على الميكروفون وابدأ بالتحدث'
                              : 'Press the microphone and start talking'
                            }
                          </p>
                        </div>
                        
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={isRecording ? stopRecording : startRecording}
                          className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                            isRecording 
                              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                              : 'bg-blue-500 hover:bg-blue-600'
                          }`}
                        >
                          <Mic className={`w-8 h-8 text-white ${isRecording ? 'animate-pulse' : ''}`} />
                        </motion.button>
                        
                        <p className="text-slate-500 dark:text-slate-400 text-xs">
                          {isRecording 
                            ? (isArabic ? 'جاري التسجيل... اضغط للتوقف' : 'Recording... Press to stop')
                            : (isArabic ? 'اضغط للتسجيل' : 'Press to record')
                          }
                        </p>
                      </div>
                    ) : (
                      /* واجهة الدردشة النصية */
                      <div className="flex space-x-3">
                        <input
                          type="text"
                          value={currentMessage}
                          onChange={(e) => setCurrentMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                          placeholder={isArabic ? 'اكتب رسالتك هنا...' : 'Type your message here...'}
                          disabled={isTyping}
                          className="flex-1 px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-2xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:border-green-500 dark:focus:border-green-400 focus:outline-none transition-all duration-300 focus:ring-4 focus:ring-green-500/20 disabled:opacity-50"
                        />
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={sendMessage}
                          disabled={!currentMessage.trim() || isTyping}
                          className="px-6 py-3 bg-green-500 text-white rounded-2xl hover:bg-green-600 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {isTyping ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Send className="w-5 h-5" />
                          )}
                        </motion.button>
                      </div>
                    )}
                  </div>

                  {/* سهم يشير للزر */}
                  <div className="absolute top-full right-10 w-0 h-0 border-l-10 border-r-10 border-t-10 border-l-transparent border-r-transparent border-t-white dark:border-t-slate-800" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* الزر الرئيسي */}
            <motion.button
              onClick={() => currentView ? closeAll() : openView('menu')}
              className="relative w-20 h-20 bg-gradient-to-br from-[#4a638d] via-[#1abc9c] to-[#cba79d] rounded-full shadow-2xl hover:shadow-3xl transition-all duration-500 flex items-center justify-center group border-2 border-white/30 overflow-hidden"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                boxShadow: [
                  '0 8px 32px rgba(74, 99, 141, 0.4)',
                  '0 8px 32px rgba(26, 188, 156, 0.4)',
                  '0 8px 32px rgba(203, 167, 157, 0.4)',
                  '0 8px 32px rgba(74, 99, 141, 0.4)'
                ]
              }}
              transition={{
                boxShadow: { duration: 3, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              {/* تأثير النبض */}
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-[#4a638d] via-[#1abc9c] to-[#cba79d]"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.6, 0, 0.6],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              <AnimatePresence mode="wait">
                {currentView ? (
                  <motion.div
                    key="close"
                    initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                    transition={{ duration: 0.3, type: "spring" }}
                    className="relative z-10"
                  >
                    <X className="w-8 h-8 text-white" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="message"
                    initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
                    transition={{ duration: 0.3, type: "spring" }}
                    className="relative z-10"
                  >
                    <MessageCircle className="w-8 h-8 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* تأثير الإضاءة */}
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                animate={{
                  background: [
                    "linear-gradient(45deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)",
                    "linear-gradient(45deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 100%)",
                    "linear-gradient(45deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.button>

            {/* شارة الإشعار */}
            <motion.div
              className="absolute -top-3 -right-3 w-7 h-7 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center border-2 border-white shadow-xl"
              animate={{
                scale: [1, 1.3, 1],
              }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="text-xs text-white font-bold">!</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
};

export default FloatingCTA;
