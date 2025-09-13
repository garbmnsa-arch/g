import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { TeacherData } from '@/lib/api';

interface AuthContextType {
  user: TeacherData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: TeacherData) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'nsaei_auth_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<TeacherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // تحميل بيانات المستخدم من localStorage عند بدء التطبيق
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          // التحقق من صحة البيانات
          if (userData.user_id && userData.name && userData.identity_number) {
            setUser(userData);
          } else {
            // بيانات غير صحيحة - مسح التخزين
            localStorage.removeItem(AUTH_STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error('خطأ في تحميل بيانات المستخدم:', error);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  const login = (userData: TeacherData) => {
    try {
      // حفظ في الذاكرة
      setUser(userData);
      
      // حفظ في localStorage للبقاء مسجل الدخول
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      
      console.log('تم تسجيل الدخول بنجاح:', userData.name);
    } catch (error) {
      console.error('خطأ في حفظ بيانات المستخدم:', error);
    }
  };

  const logout = () => {
    try {
      // مسح من الذاكرة
      setUser(null);
      
      // مسح من localStorage
      localStorage.removeItem(AUTH_STORAGE_KEY);
      
      console.log('تم تسجيل الخروج');
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
