'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff, LogIn, Moon, Sun, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

// Schema التحقق
const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

type LoginForm = z.infer<typeof loginSchema>;

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    console.log('Login data:', data);
    setIsLoading(true);
    
    try {
      // محاكاة API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "تم تسجيل الدخول بنجاح! 🎉",
        description: "مرحباً بك في إدارة الإشراف النسائي",
      });
      
      setTimeout(() => {
        onLogin();
      }, 1000);
    } catch (error) {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: "يرجى التحقق من البيانات والمحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      {/* زر تبديل الوضع الداكن - تصميم بسيط */}
      <div className="absolute top-6 left-6 flex items-center gap-3 bg-card border-2 border-border/50 rounded-xl p-3 shadow-sm" dir="ltr">
        <Sun className="h-4 w-4 text-foreground" />
        <Switch 
          checked={darkMode} 
          onCheckedChange={setDarkMode}
        />
        <Moon className="h-4 w-4 text-foreground" />
      </div>

      {/* نص إطلاق تجريبي في الأعلى اليمين */}
      <div className="absolute top-4 right-6">
        <div className="p-3 bg-secondary/30 rounded-lg border border-border/30" dir="rtl">
          <div className="text-right">
            <div className="flex items-center justify-start gap-2 text-xs font-medium text-accent">
              <span>🚀</span>
              <span>إطلاق تجريبي</span>
            </div>
          </div>
        </div>
      </div>

      <Card className="w-full max-w-md mx-4 sm:mx-0 bg-card border-2 border-border/50 shadow-sm overflow-hidden">
        {/* الشريط اللوني العلوي */}
        <div className="h-2 bg-secondary/30"></div>
        
        <CardHeader className="text-center pb-4 sm:pb-6 px-4 sm:px-6">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary rounded-2xl flex items-center justify-center shadow-sm">
              <Users className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 text-foreground">
            تسجيل الدخول
          </CardTitle>
          <CardDescription className="text-sm sm:text-base text-muted-foreground">
            مرحباً بك في منصة غرب لإدارة حلقات القرآن الكريم
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label 
                htmlFor="email" 
                className="text-right block font-medium text-foreground"
              >
                البريد الإلكتروني
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="أدخل بريدك الإلكتروني"
                {...form.register('email')}
                className="text-right h-12 border-2 border-border/50 rounded-xl focus:border-primary"
                dir="rtl"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive text-right">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label 
                htmlFor="password" 
                className="text-right block font-medium text-foreground"
              >
                كلمة المرور
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="أدخل كلمة المرور"
                  {...form.register('password')}
                  className="text-right h-12 border-2 border-border/50 rounded-xl focus:border-primary pl-12"
                  dir="rtl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="text-sm text-destructive text-right">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-medium rounded-xl"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                  جاري التحقق...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn className="w-5 h-5" />
                  تسجيل الدخول
                </div>
              )}
            </Button>
          </form>

          {/* معلومات الإدارة */}
          <div className="mt-6 p-4 bg-secondary/30 rounded-xl border border-border/30">
            <p className="text-sm text-foreground text-center font-semibold">
              إدارة الإشراف النسائي بالدمام
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col items-center space-y-4 text-center">
        </CardFooter>
      </Card>
    </div>
  );
}
