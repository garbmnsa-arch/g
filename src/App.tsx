import { useState } from 'react';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import TeacherClassesPage from './pages/TeacherClassesPage';
import { Toaster } from "@/components/ui/toaster";

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
