import { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import TeacherClassesPage from './pages/TeacherClassesPage';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

type View = 'landing' | 'login' | 'register' | 'teacher-classes' | 'services';

// مكون داخلي لاستخدام useAuth
function AppContent() {
  const [currentView, setCurrentView] = useState<View>('landing');
  const { isAuthenticated, isLoading, logout } = useAuth();

  // التحقق من حالة المصادقة عند تحميل التطبيق
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        setCurrentView('teacher-classes');
      } else {
        setCurrentView('landing');
      }
    }
  }, [isAuthenticated, isLoading]);

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

  const handleLogout = async () => {
    await logout();
    setCurrentView('landing');
  };

  // شاشة التحميل
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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
      
      {/* مكون تنبيه تثبيت PWA */}
      <PWAInstallPrompt />
    </div>
  );
}

// المكون الرئيسي مع AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
