'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  Sun, 
  Moon,
  BookOpen,
  Users,
  Settings
} from "lucide-react";

// استيراد الصور
import logoWhite from '../assets/شعار_إشراف الدمام بالطول أبيض.png';
import logoBlack from '../assets/شعار_إشراف الدمام بالطول.png';
import decorationImg from '../assets/تصميم بدون عنوان (25).png';

interface LandingPageProps {
  onLogin: () => void;
  onRegister: () => void;
  onServices: () => void;
}

export default function LandingPage({ onLogin, onRegister, onServices }: LandingPageProps) {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });

  // تطبيق الثيم
  useEffect(() => {
    console.log('Dark mode changed to:', darkMode);
    const html = document.documentElement;
    
    if (darkMode) {
      html.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  const handleThemeToggle = (checked: boolean) => {
    console.log('Theme toggle clicked, new value:', checked);
    setDarkMode(checked);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      {/* نص إدارة الإشراف في الأعلى اليمين */}
      <div className="absolute top-4 right-6 z-10">
        <div className="p-3 bg-secondary/30 rounded-lg border border-border/30" dir="rtl">
          <div className="text-right">
            <h1 className="text-base font-bold text-primary mb-1">فرع غرب الدمام</h1>
            <div className="flex items-center justify-start gap-2 text-xs font-medium text-accent">
              <span>🚀</span>
              <span>إطلاق تجريبي</span>
            </div>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 -mt-16">
        {/* الشعار */}
        <div className="text-center mb-12">
          <div className="mb-8">
            {/* الشعار الحقيقي */}
            <div className="flex justify-center mb-8">
              {darkMode ? (
                <img 
                  src={logoWhite} 
                  alt="شعار إشراف الدمام" 
                  className="h-48 md:h-56 lg:h-64 w-auto max-w-full object-contain"
                />
              ) : (
                <img 
                  src={logoBlack} 
                  alt="شعار إشراف الدمام" 
                  className="h-48 md:h-56 lg:h-64 w-auto max-w-full object-contain"
                />
              )}
            </div>
          </div>
        </div>

        {/* الأزرار المحسنة */}
        <div className="w-full max-w-xs mx-auto space-y-3">
          {/* زر تسجيل الدخول - الأولوية */}
          <Button
            onClick={onLogin}
            size="sm"
            className="w-full h-10 sm:h-11 px-6 text-sm sm:text-base font-semibold bg-primary hover:bg-primary/90 text-secondary shadow-md hover:shadow-lg transition-all duration-300 rounded-xl border-0"
          >
            <BookOpen className="w-4 h-4 ml-1" />
            تسجيل الدخول
          </Button>

          {/* زر التسجيل الجديد */}
          <Button
            onClick={onRegister}
            variant="outline"
            size="sm"
            className="w-full h-10 sm:h-11 px-6 text-sm sm:text-base font-semibold border-2 border-accent text-accent hover:bg-accent hover:text-white shadow-md hover:shadow-lg transition-all duration-300 rounded-xl"
          >
            <Users className="w-4 h-4 ml-1" />
            تسجيل جديد
          </Button>

          {/* زر الخدمات */}
          <Button
            onClick={onServices}
            variant="ghost"
            size="sm"
            className="w-full h-9 px-6 text-sm font-medium text-muted-foreground hover:text-accent hover:bg-accent/10 transition-all duration-300 rounded-xl"
          >
            <Settings className="w-4 h-4 ml-1" />
            استكشف الخدمات
          </Button>
        </div>

        {/* زر تبديل الثيم في اليسار للـ RTL */}
        <div className="absolute top-4 left-4" dir="ltr">
          <div className="flex items-center gap-2 bg-background/60 backdrop-blur-sm px-3 py-2 rounded-full border border-border/50">
            <Sun className="w-4 h-4 text-muted-foreground" />
            <Switch
              checked={darkMode}
              onCheckedChange={handleThemeToggle}
              className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted"
            />
            <Moon className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </div>
      
      {/* الزخرفة الدوارة في الأسفل */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 pointer-events-none z-0">
        <div className="animate-spin" style={{ animation: 'spin 20s linear infinite' }}>
          <img 
            src={decorationImg} 
            alt="زخرفة" 
            className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 opacity-20 dark:opacity-10"
          />
        </div>
      </div>
    </div>
  );
}
