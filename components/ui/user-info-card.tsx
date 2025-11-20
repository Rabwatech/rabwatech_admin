'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Calendar, Users, Mail, Phone, MapPin } from 'lucide-react';

interface UserInfo {
  name: string;
  email: string;
  phone?: string;
  country?: string;
}

interface SessionInfo {
  startedAt: string;
  completedAt: string;
  timeSpentSeconds: number;
}

interface UserInfoCardProps {
  user: UserInfo;
  session: SessionInfo;
  className?: string;
}

export function UserInfoCard({ user, session, className = '' }: UserInfoCardProps) {
  return (
    <div className={`grid md:grid-cols-2 gap-6 ${className}`}>
      {/* Session Details */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="shadow-lg border-0 h-full">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              تفاصيل الجلسة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <span className="text-slate-600 dark:text-slate-400">تاريخ البدء:</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {new Date(session.startedAt).toLocaleDateString('ar-SA')}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <span className="text-slate-600 dark:text-slate-400">تاريخ الإكمال:</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {new Date(session.completedAt).toLocaleDateString('ar-SA')}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <span className="text-slate-600 dark:text-slate-400">مدة الجلسة:</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {Math.round(session.timeSpentSeconds / 60)} دقيقة
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* User Information */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="shadow-lg border-0 h-full">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5" />
              معلومات المستخدم
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <span className="font-medium text-slate-600 dark:text-slate-400">الاسم:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{user.name}</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <Mail className="w-4 h-4 text-slate-500" />
              <span className="font-medium text-slate-600 dark:text-slate-400">البريد:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <Phone className="w-4 h-4 text-slate-500" />
                <span className="font-medium text-slate-600 dark:text-slate-400">الهاتف:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{user.phone}</span>
              </div>
            )}
            {user.country && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <MapPin className="w-4 h-4 text-slate-500" />
                <span className="font-medium text-slate-600 dark:text-slate-400">البلد:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{user.country}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
