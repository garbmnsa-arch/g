import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // التحقق من إذا كان التطبيق مثبت بالفعل
    const checkIfStandalone = () => {
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        setIsStandalone(true);
        return true;
      }
      if ((window.navigator as any).standalone === true) {
        setIsStandalone(true);
        return true;
      }
      return false;
    };

    // التحقق من localStorage للمستخدمين الذين ثبتوا التطبيق
    const hasBeenInstalled = localStorage.getItem('pwa-install-accepted');
    
    if (checkIfStandalone() || hasBeenInstalled) {
      return;
    }

    // نظام الإشعارات المتكررة - كل 3 أيام
    const lastPromptTime = localStorage.getItem('pwa-last-prompt-time');
    const promptInterval = 3 * 24 * 60 * 60 * 1000; // 3 أيام بالميلي ثانية
    const currentTime = Date.now();
    
    const shouldShowPrompt = !lastPromptTime || (currentTime - parseInt(lastPromptTime)) > promptInterval;

    // الاستماع لحدث beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // إظهار التنبيه إذا حان الوقت
      if (shouldShowPrompt) {
        setTimeout(() => {
          setShowPrompt(true);
          localStorage.setItem('pwa-last-prompt-time', currentTime.toString());
        }, 2000); // انتظار ثانيتين لتحميل الصفحة
      }
    };

    // الاستماع لحدث التثبيت الناجح
    const handleAppInstalled = () => {
      localStorage.setItem('pwa-install-accepted', 'true');
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        localStorage.setItem('pwa-install-accepted', 'true');
        // إزالة وقت آخر إشعار لأن المستخدم ثبت التطبيق
        localStorage.removeItem('pwa-last-prompt-time');
      }
      // إذا رفض، سيظهر الإشعار مرة أخرى بعد 3 أيام
      
      setShowPrompt(false);
      setDeferredPrompt(null);
    } catch (error) {
      console.error('خطأ في التثبيت:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // سيظهر الإشعار مرة أخرى بعد 3 أيام تلقائياً
  };

  const handleLater = () => {
    setShowPrompt(false);
    // سيظهر الإشعار مرة أخرى بعد 3 أيام تلقائياً
  };

  if (!showPrompt || isStandalone) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:max-w-sm">
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-blue-900">تجربة أفضل!</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0 text-blue-700 hover:bg-blue-200"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-blue-800 leading-relaxed">
              🚀 <strong>اجعل تجربتك أسرع!</strong>
              <br />
              ثبت المنصة على جهازك للوصول الفوري
            </p>
            <div className="mt-2 text-xs text-blue-600 space-y-1">
              <div className="flex items-center gap-1">
                <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                <span>بدون تأخير في التحميل</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                <span>مثل التطبيقات الأصلية</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleInstallClick}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm"
              size="sm"
            >
              <Download className="w-4 h-4 ml-2" />
              ثبت الآن
            </Button>
            <Button
              onClick={handleLater}
              variant="outline"
              size="sm"
              className="text-blue-700 border-blue-300 hover:bg-blue-50"
            >
              لاحقاً
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAInstallPrompt;