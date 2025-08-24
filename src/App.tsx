import { useState } from 'react';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import TeacherClassesPage from './pages/TeacherClassesPage';
import { Toaster } from "@/components/ui/toaster";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Palette } from 'lucide-react';

type View = 'landing' | 'login' | 'register' | 'teacher-classes' | 'services';

function App() {
  const [currentView, setCurrentView] = useState<View>('landing');

  const handleGoToLogin = () => {
    setCurrentView('login');
  };

  const handleGoToRegister = () => {
    setCurrentView('register');
  };

  const handleGoToServices = () => {
    setCurrentView('services');
  };

  const handleLogin = () => {
    setCurrentView('teacher-classes');
  };

  const handleLogout = () => {
    setCurrentView('landing');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* إدارة الإشراف النسائي بالدمام - تصميم فلات بسيط محسن */}
      {currentView !== 'landing' && (
        <div className="fixed bottom-6 right-6 z-50">
          <Card className="bg-card/95 backdrop-blur-md border-2 border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
            <CardContent className="p-6">
              <div className="text-center space-y-3">
                {/* الأيقونة والعنوان الرئيسي */}
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center shadow-sm">
                    <Palette className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-foreground leading-tight">إدارة الإشراف</div>
                    <div className="text-sm text-primary font-medium">النسائي بالدمام</div>
                  </div>
                </div>
                
                {/* Badge الإطلاق التجريبي */}
                <div className="pt-2">
                  <Badge 
                    variant="secondary" 
                    className="bg-gradient-to-r from-accent/10 to-primary/10 text-accent border-accent/30 px-3 py-1 text-xs font-semibold rounded-full"
                  >
                    🚀 إطلاق تجريبي
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* المحتوى الرئيسي */}
      {currentView === 'landing' && (
        <LandingPage 
          onLogin={handleGoToLogin} 
          onRegister={handleGoToRegister}
          onServices={handleGoToServices}
        />
      )}
      
      {currentView === 'login' && (
        <LoginPage onLogin={handleLogin} />
      )}

      {currentView === 'register' && (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-foreground">صفحة التسجيل الجديد</h1>
            <p className="text-muted-foreground">قريباً...</p>
            <button 
              onClick={() => setCurrentView('landing')}
              className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-xl"
            >
              العودة للرئيسية
            </button>
          </div>
        </div>
      )}

      {currentView === 'services' && (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-foreground">صفحة الخدمات</h1>
            <p className="text-muted-foreground">قريباً...</p>
            <button 
              onClick={() => setCurrentView('landing')}
              className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-xl"
            >
              العودة للرئيسية
            </button>
          </div>
        </div>
      )}
      
      {currentView === 'teacher-classes' && (
        <TeacherClassesPage onLogout={handleLogout} />
      )}

      {/* Toaster للإشعارات */}
      <Toaster />
    </div>
  );
}

export default App;
