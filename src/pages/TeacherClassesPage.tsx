'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  BookOpen, 
  Users, 
  Bell, 
  CheckCircle, 
  XCircle, 
  Clock, 
  UserCheck,
  Award,
  TrendingUp,
  Menu,
  X,
  Home,
  Calendar,
  FileText,
  Settings,
  Save,
  BarChart3,
  GraduationCap,
  Sun,
  Moon,
  BookMarked,
  Star,
  ChevronUp,
  ChevronRight,
  ChevronDown,
  LogOut,
  ClipboardCheck
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

// أنواع البيانات الجديدة - تتطابق مع API الباك إند

// نوع البيانات الفعلية من API (بالمفاتيح العربية)
interface LatestRecitationAPI {
  'حفظ': {
    id: number;
    from: string;
    to: string;
    grade: string; // من API كـ string مثل "10.00"
    date: string;
  } | null;
  'مراجعة صغرى': {
    id: number;
    from: string;
    to: string;
    grade: string;
    date: string;
  } | null;
  'مراجعة كبرى': {
    id: number;
    from: string;
    to: string;
    grade: string;
    date: string;
  } | null;
}

interface CircleGroup {
  id: number;
  name: string;
  created_at: string;
  quran_circle: {
    id: number;
    name: string;
    type: string;
    mosque?: {
      name: string;
      neighborhood: string;
    };
  } | null;
  students: StudentFromAPI[]; // تغيير النوع لمطابقة البيانات الفعلية من API
  students_count: number;
  attendance_today: {
    present: number;
    absent: number;
    no_record: number;
  };
}

interface StudentFromAPI {
  id: number;
  name: string;
  identity_number: string;
  phone: string;
  is_active: boolean;
  attendance_today: {
    status: string;
    recorded_at: string | null;
  };
  latest_recitations: LatestRecitationAPI; // استخدام النوع الجديد
  has_recent_recitation: boolean;
}

interface TeacherInfo {
  id: number;
  name: string;
  identity_number: string;
  phone: string;
  task_type: string;
  mosque: {
    id: number;
    name: string;
    neighborhood: string;
  } | null;
}

interface DashboardSummary {
  total_groups: number;
  total_students: number;
  present_today: number;
  absent_today: number;
  no_attendance_today: number;
  students_with_recent_recitation: number;
  attendance_rate_today: number;
}

interface TeacherDashboard {
  teacher_info: TeacherInfo;
  circle_groups: CircleGroup[];
  summary: DashboardSummary;
}

interface TeacherClassesPageProps {
  onLogout: () => void;
}

export default function TeacherClassesPage({ onLogout }: TeacherClassesPageProps) {
  // نظام المصادقة
  const { user } = useAuth();
  
  // البيانات الحقيقية من API
  const [teacherDashboard, setTeacherDashboard] = useState<TeacherDashboard | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // States الموجودة
  const [selectedClass, setSelectedClass] = useState<number>(1);
  const [showAttendanceModal, setShowAttendanceModal] = useState<boolean>(false);
  const [teacherAttended, setTeacherAttended] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentFromAPI | null>(null);
  const [showStudentSheet, setShowStudentSheet] = useState<boolean>(false);
  const [selectedAction, setSelectedAction] = useState<'save' | 'minor' | 'major' | null>(null);
  const [showSectionSelection, setShowSectionSelection] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'memorization' | 'minor_review' | 'major_review'>('memorization'); // نوع التسميع للعرض
  const [fromSurah, setFromSurah] = useState<string>('');
  const [toSurah, setToSurah] = useState<string>('');
  const [fromVerse, setFromVerse] = useState<string>('');
  const [toVerse, setToVerse] = useState<string>('');
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });

  // حالات التحضير
  const [isAttendanceMode, setIsAttendanceMode] = useState(false);
  const [attendanceData, setAttendanceData] = useState<Record<number, 'حاضر' | 'غائب' | 'متأخر' | 'مأذون'>>({});
  const [isSavingAttendance, setIsSavingAttendance] = useState(false);

  // حالات تنبيه التحضير
  const [showAttendanceAlert, setShowAttendanceAlert] = useState(false);
  const [attendanceAlertType, setAttendanceAlertType] = useState<'no_attendance' | 'student_absent'>('no_attendance');
  const [alertStudentName, setAlertStudentName] = useState('');

  // حالات تنبيه إلغاء التسميع
  const [showCancelRecitationAlert, setShowCancelRecitationAlert] = useState(false);

  // حالات التسميع النشط
  const [isRecitationActive, setIsRecitationActive] = useState(false);
  const [recitationTimer, setRecitationTimer] = useState(0); // بالثواني
  const [errorCount, setErrorCount] = useState(0);
  const [finalGrade, setFinalGrade] = useState(10);
  const [isSavingRecitation, setIsSavingRecitation] = useState(false);

  // دالة لتحويل التاريخ إلى نص بالعربية
  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return 'اليوم';
    } else if (diffInDays === 1) {
      return 'أمس';
    } else if (diffInDays <= 7) {
      return `قبل ${diffInDays} أيام`;
    } else if (diffInDays <= 30) {
      const weeks = Math.floor(diffInDays / 7);
      return weeks === 1 ? 'قبل أسبوع' : `قبل ${weeks} أسابيع`;
    } else {
      const months = Math.floor(diffInDays / 30);
      return months === 1 ? 'قبل شهر' : `قبل ${months} أشهر`;
    }
  };

  // دالة لتحويل API response إلى نص جميل للتسميع
  const formatLastMemorization = (student: StudentFromAPI): string => {
    if (!student.latest_recitations['حفظ']) {
      return 'لا يوجد تسميع حفظ سابق';
    }

    const mem = student.latest_recitations['حفظ'];
    const timeAgo = getTimeAgo(mem.date);
    
    // استخراج السورة من النص (مثلاً "1:5" يعني سورة الفاتحة آية 5)
    const fromParts = mem.from.split(':');
    const toParts = mem.to.split(':');
    
    if (fromParts.length === 2 && toParts.length === 2) {
      const fromSurah = getSurahName(parseInt(fromParts[0]));
      const toSurah = getSurahName(parseInt(toParts[0]));
      const fromVerse = fromParts[1];
      const toVerse = toParts[1];
      
      if (fromSurah === toSurah) {
        return `آخر تسميع ${timeAgo} سورة ${fromSurah} آية ${fromVerse}-${toVerse}`;
      } else {
        return `آخر تسميع ${timeAgo} من ${fromSurah} ${fromVerse} إلى ${toSurah} ${toVerse}`;
      }
    }
    
    return `آخر تسميع ${timeAgo}`;
  };

  // دالة للحصول على اسم السورة من رقمها
  const getSurahName = (surahNumber: number): string => {
    const surahs = [
      'الفاتحة', 'البقرة', 'آل عمران', 'النساء', 'المائدة', 'الأنعام', 'الأعراف', 'الأنفال', 
      'التوبة', 'يونس', 'هود', 'يوسف', 'الرعد', 'إبراهيم', 'الحجر', 'النحل', 'الإسراء', 
      'الكهف', 'مريم', 'طه', 'الأنبياء', 'الحج', 'المؤمنون', 'النور', 'الفرقان', 'الشعراء',
      'النمل', 'القصص', 'العنكبوت', 'الروم', 'لقمان', 'السجدة', 'الأحزاب', 'سبأ', 'فاطر',
      'يس', 'الصافات', 'ص', 'الزمر', 'غافر', 'فصلت', 'الشورى', 'الزخرف', 'الدخان', 'الجاثية',
      'الأحقاف', 'محمد', 'الفتح', 'الحجرات', 'ق', 'الذاريات', 'الطور', 'النجم', 'القمر',
      'الرحمن', 'الواقعة', 'الحديد', 'المجادلة', 'الحشر', 'الممتحنة', 'الصف', 'الجمعة',
      'المنافقون', 'التغابن', 'الطلاق', 'التحريم', 'الملك', 'القلم', 'الحاقة', 'المعارج',
      'نوح', 'الجن', 'المزمل', 'المدثر', 'القيامة', 'الإنسان', 'المرسلات', 'النبأ', 'النازعات',
      'عبس', 'التكوير', 'الانفطار', 'المطففين', 'الانشقاق', 'البروج', 'الطارق', 'الأعلى',
      'الغاشية', 'الفجر', 'البلد', 'الشمس', 'الليل', 'الضحى', 'الشرح', 'التين', 'العلق',
      'القدر', 'البينة', 'الزلزلة', 'العاديات', 'القارعة', 'التكاثر', 'العصر', 'الهمزة',
      'الفيل', 'قريش', 'الماعون', 'الكوثر', 'الكافرون', 'النصر', 'المسد', 'الإخلاص', 'الفلق', 'الناس'
    ];
    
    return surahs[surahNumber - 1] || `السورة ${surahNumber}`;
  };

  // مصفوفة عدد آيات كل سورة
  const getSurahVerseCount = (surahNumber: number): number => {
    const verseCounts = [
      7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99,
      128, 111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60,
      34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38,
      29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18,
      12, 12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29,
      19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8,
      11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6
    ];
    
    return verseCounts[surahNumber - 1] || 0;
  };

  // دالة للتحقق من صحة نطاق الآيات
  const validateVerseRange = (fromSurah: string, fromVerse: string, toSurah: string, toVerse: string): { isValid: boolean, message: string } => {
    if (!fromSurah || !toSurah || !fromVerse || !toVerse) {
      return { isValid: false, message: "يرجى تحديد السورة والآيات" };
    }

    const fromSurahNumber = getSurahNumber(fromSurah);
    const toSurahNumber = getSurahNumber(toSurah);
    const fromVerseNum = parseInt(fromVerse);
    const toVerseNum = parseInt(toVerse);

    // التحقق من صحة أرقام الآيات
    if (isNaN(fromVerseNum) || isNaN(toVerseNum) || fromVerseNum < 1 || toVerseNum < 1) {
      return { isValid: false, message: "يرجى إدخال أرقام آيات صحيحة" };
    }

    // التحقق من عدد آيات السورة الأولى
    const fromSurahVerseCount = getSurahVerseCount(fromSurahNumber);
    if (fromVerseNum > fromSurahVerseCount) {
      return { isValid: false, message: `سورة ${fromSurah} تحتوي على ${fromSurahVerseCount} آية فقط` };
    }

    // التحقق من عدد آيات السورة الثانية
    const toSurahVerseCount = getSurahVerseCount(toSurahNumber);
    if (toVerseNum > toSurahVerseCount) {
      return { isValid: false, message: `سورة ${toSurah} تحتوي على ${toSurahVerseCount} آية فقط` };
    }

    // إذا كانت نفس السورة، تحقق من التسلسل
    if (fromSurahNumber === toSurahNumber && fromVerseNum > toVerseNum) {
      return { isValid: false, message: "آية البداية يجب أن تكون قبل آية النهاية" };
    }

    // إذا كانت سور مختلفة، تحقق من التسلسل
    if (fromSurahNumber > toSurahNumber) {
      return { isValid: false, message: "سورة البداية يجب أن تكون قبل سورة النهاية في ترتيب المصحف" };
    }

    return { isValid: true, message: "" };
  };

  // دالة مساعدة للحصول على رقم السورة
  const getSurahNumber = (surahName: string): number => {
    const surahs = [
      'الفاتحة', 'البقرة', 'آل عمران', 'النساء', 'المائدة', 'الأنعام', 'الأعراف', 'الأنفال', 
      'التوبة', 'يونس', 'هود', 'يوسف', 'الرعد', 'إبراهيم', 'الحجر', 'النحل', 'الإسراء', 
      'الكهف', 'مريم', 'طه', 'الأنبياء', 'الحج', 'المؤمنون', 'النور', 'الفرقان', 'الشعراء',
      'النمل', 'القصص', 'العنكبوت', 'الروم', 'لقمان', 'السجدة', 'الأحزاب', 'سبأ', 'فاطر',
      'يس', 'الصافات', 'ص', 'الزمر', 'غافر', 'فصلت', 'الشورى', 'الزخرف', 'الدخان', 'الجاثية',
      'الأحقاف', 'محمد', 'الفتح', 'الحجرات', 'ق', 'الذاريات', 'الطور', 'النجم', 'القمر',
      'الرحمن', 'الواقعة', 'الحديد', 'المجادلة', 'الحشر', 'الممتحنة', 'الصف', 'الجمعة',
      'المنافقون', 'التغابن', 'الطلاق', 'التحريم', 'الملك', 'القلم', 'الحاقة', 'المعارج',
      'نوح', 'الجن', 'المزمل', 'المدثر', 'القيامة', 'الإنسان', 'المرسلات', 'النبأ', 'النازعات',
      'عبس', 'التكوير', 'الانفطار', 'المطففين', 'الانشقاق', 'البروج', 'الطارق', 'الأعلى',
      'الغاشية', 'الفجر', 'البلد', 'الشمس', 'الليل', 'الضحى', 'الشرح', 'التين', 'العلق',
      'القدر', 'البينة', 'الزلزلة', 'العاديات', 'القارعة', 'التكاثر', 'العصر', 'الهمزة',
      'الفيل', 'قريش', 'الماعون', 'الكوثر', 'الكافرون', 'النصر', 'المسد', 'الإخلاص', 'الفلق', 'الناس'
    ];
    
    return surahs.indexOf(surahName) + 1 || 1;
  };

  // دوال مساعدة للتسميع النشط
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const calculateGradeFromErrors = (errors: number): number => {
    const calculatedGrade = Math.max(0, 10 - (errors * 0.5));
    return Math.round(calculatedGrade * 2) / 2; // تقريب لأقرب نصف درجة
  };

  const getEvaluationText = (grade: number): string => {
    if (grade >= 9) return 'ممتاز';
    if (grade >= 8) return 'جيد جداً';
    if (grade >= 6) return 'جيد';
    if (grade >= 4) return 'مقبول';
    return 'ضعيف';
  };

  // دالة شاملة لتنسيق جميع أنواع التسميع بناءً على النوع المختار
  const formatRecitationByType = (student: StudentFromAPI, type: 'memorization' | 'minor_review' | 'major_review'): string => {
    let recitation: any = null;
    let typeName = '';
    let noRecitationText = '';
    
    // تحويل النوع إلى المفاتيح العربية المستخدمة في API
    switch (type) {
      case 'memorization':
        recitation = student.latest_recitations['حفظ'];
        typeName = 'حفظ';
        noRecitationText = 'لا يوجد تسميع حفظ سابق';
        break;
      case 'minor_review':
        recitation = student.latest_recitations['مراجعة صغرى'];
        typeName = 'مراجعة صغرى';
        noRecitationText = 'لا يوجد مراجعة صغرى سابقة';
        break;
      case 'major_review':
        recitation = student.latest_recitations['مراجعة كبرى'];
        typeName = 'مراجعة كبرى';
        noRecitationText = 'لا يوجد مراجعة كبرى سابقة';
        break;
    }
    
    if (!recitation) {
      return noRecitationText;
    }

    const timeAgo = getTimeAgo(recitation.date);
    
    // استخراج السورة من النص (مثلاً "1:5" يعني سورة الفاتحة آية 5)
    const fromParts = recitation.from.split(':');
    const toParts = recitation.to.split(':');
    
    if (fromParts.length === 2 && toParts.length === 2) {
      const fromSurah = getSurahName(parseInt(fromParts[0]));
      const toSurah = getSurahName(parseInt(toParts[0]));
      const fromVerse = fromParts[1];
      const toVerse = toParts[1];
      
      if (fromSurah === toSurah) {
        return `آخر ${typeName} ${timeAgo} سورة ${fromSurah} آية ${fromVerse}-${toVerse}`;
      } else {
        return `آخر ${typeName} ${timeAgo} من ${fromSurah} ${fromVerse} إلى ${toSurah} ${toVerse}`;
      }
    }
    
    return `آخر ${typeName} ${timeAgo}`;
  };

  // API function لجلب بيانات المعلم
  const fetchTeacherDashboard = async (refresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // استخدام معرف المعلم من نظام المصادقة أو رقم افتراضي
      const teacherId = user?.user_id || 1;
      const timestamp = refresh ? `&_t=${Date.now()}` : '';
      const url = `https://7alaqat.com/api/teachers/${teacherId}/info?refresh=1${timestamp}`;
      
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setTeacherDashboard(result.data);
        
        // تحديث الحلقة المختارة إذا لم تكن موجودة
        if (result.data.circle_groups.length > 0) {
          const firstGroupId = result.data.circle_groups[0].id;
          if (!result.data.circle_groups.find((g: CircleGroup) => g.id === selectedClass)) {
            setSelectedClass(firstGroupId);
          }
        }
      } else {
        throw new Error(result.message || 'خطأ في جلب البيانات');
      }
    } catch (error) {
      console.error('Error fetching teacher dashboard:', error);
      setError(error instanceof Error ? error.message : 'خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };
  
  // قائمة الصفحات الوهمية
  const sidebarItems = [
    { id: 'home', name: 'الرئيسية', icon: Home, active: false },
    { id: 'classes', name: 'حلقات المعلم', icon: BookOpen, active: true },
    { id: 'students', name: 'إدارة الطلاب', icon: Users, active: false },
    { id: 'schedule', name: 'الجدول الزمني', icon: Calendar, active: false },
    { id: 'reports', name: 'التقارير', icon: BarChart3, active: false },
    { id: 'certificates', name: 'الشهادات', icon: GraduationCap, active: false },
    { id: 'documents', name: 'المستندات', icon: FileText, active: false },
    { id: 'settings', name: 'الإعدادات', icon: Settings, active: false }
  ];

  // useEffect لجلب بيانات المعلم عند تحميل الصفحة
  useEffect(() => {
    fetchTeacherDashboard();
  }, []);

  // useEffect لتعيين الحلقة الأولى كمختارة عند تحميل البيانات
  useEffect(() => {
    if (teacherDashboard && teacherDashboard.circle_groups.length > 0 && selectedClass === 1) {
      setSelectedClass(teacherDashboard.circle_groups[0].id);
    }
  }, [teacherDashboard]);

  // useEffect لإعادة تعيين viewMode إلى الحفظ عند فتح نافذة جديدة
  useEffect(() => {
    if (showStudentSheet) {
      setViewMode('memorization');
    }
  }, [showStudentSheet]);

  const { toast } = useToast();

  // دالة للحصول على معلومات الحلقة الحالية
  const getCurrentClassInfo = () => {
    if (!teacherDashboard) {
      return { 
        totalStudents: 0, 
        presentToday: 0, 
        absentToday: 0, 
        withRecitation: 0,
        selectedClassName: "لا توجد بيانات"
      };
    }

    // إذا لم يتم اختيار حلقة محددة، اعرض إجمالي جميع الحلقات
    if (!selectedClass) {
      return {
        totalStudents: teacherDashboard.summary.total_students,
        presentToday: teacherDashboard.summary.present_today,
        absentToday: teacherDashboard.summary.absent_today,
        withRecitation: teacherDashboard.summary.students_with_recent_recitation,
        selectedClassName: "جميع الحلقات"
      };
    }

    // البحث عن الحلقة المختارة
    const currentClass = teacherDashboard.circle_groups.find(
      classItem => classItem.id === selectedClass
    );

    if (!currentClass) {
      return {
        totalStudents: teacherDashboard.summary.total_students,
        presentToday: teacherDashboard.summary.present_today,
        absentToday: teacherDashboard.summary.absent_today,
        withRecitation: teacherDashboard.summary.students_with_recent_recitation,
        selectedClassName: "جميع الحلقات"
      };
    }

    // حساب الإحصائيات للحلقة المحددة
    const classStudents = currentClass.students;
    const presentToday = classStudents.filter(s => 
      s.attendance_today.status === 'present' || s.attendance_today.status === 'حاضر'
    ).length;
    const absentToday = classStudents.filter(s => 
      s.attendance_today.status === 'absent' || s.attendance_today.status === 'غائب'
    ).length;
    const withRecitation = classStudents.filter(s => s.has_recent_recitation).length;

    return {
      totalStudents: currentClass.students_count,
      presentToday,
      absentToday,
      withRecitation,
      selectedClassName: currentClass.name
    };
  };

  const currentClassInfo = getCurrentClassInfo();

  // دالة لاستخراج آخر تسميع وتعبئة المقطع الجديد تلقائياً
  const autoFillFromLastRecitation = (student: StudentFromAPI, type: 'memorization' | 'minor_review' | 'major_review') => {
    let lastRecitation: any = null;
    
    // الحصول على آخر تسميع حسب النوع
    switch (type) {
      case 'memorization':
        lastRecitation = student.latest_recitations['حفظ'];
        break;
      case 'minor_review':
        lastRecitation = student.latest_recitations['مراجعة صغرى'];
        break;
      case 'major_review':
        lastRecitation = student.latest_recitations['مراجعة كبرى'];
        break;
    }
    
    if (lastRecitation && lastRecitation.to) {
      // تحليل آخر نقطة توقف
      const toParts = lastRecitation.to.split(':');
      if (toParts.length === 2) {
        const surahNumber = parseInt(toParts[0]);
        const lastVerse = toParts[1];
        const surahName = getSurahName(surahNumber);
        
        // تعبئة المقطع الجديد بدءاً من حيث توقف
        setFromSurah(surahName);
        setFromVerse(lastVerse);
        setToSurah(surahName); // نفس السورة افتراضياً
        setToVerse(''); // يتركها فارغة للمعلم
        
        console.log(`تعبئة تلقائية: من ${surahName} آية ${lastVerse}`);
      }
    } else {
      // لا يوجد تسميع سابق - تعبئة افتراضية
      setFromSurah('الفاتحة');
      setFromVerse('1');
      setToSurah('الفاتحة');
      setToVerse('');
    }
  };

  // Helper function: الحصول على البيانات الحالية للعرض
  const getCurrentStudents = (): StudentFromAPI[] => {
    if (!teacherDashboard || selectedClass === 0) return [];
    const currentGroup = teacherDashboard.circle_groups.find(g => g.id === selectedClass);
    return currentGroup ? currentGroup.students : [];
  };

  const getCurrentClass = () => {
    if (!teacherDashboard) return null;
    return teacherDashboard.circle_groups.find(g => g.id === selectedClass);
  };

  // تطبيق الثيم
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  // إدارة توقيت التسميع
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRecitationActive) {
      interval = setInterval(() => {
        setRecitationTimer(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRecitationActive]);

  // تحديث الدرجة تلقائياً عند تغيير عدد الأخطاء
  useEffect(() => {
    if (isRecitationActive) {
      const newGrade = calculateGradeFromErrors(errorCount);
      setFinalGrade(newGrade);
    }
  }, [errorCount, isRecitationActive]);

  // دوال التحكم في التسميع النشط
  const startRecitation = () => {
    setIsRecitationActive(true);
    setRecitationTimer(0);
    setErrorCount(0);
    setFinalGrade(10);
  };

  const stopRecitation = () => {
    setIsRecitationActive(false);
  };

  const resetRecitation = () => {
    setRecitationTimer(0);
    setErrorCount(0);
    setFinalGrade(10);
  };

  const incrementError = () => {
    setErrorCount(prev => prev + 1);
  };

  const decrementError = () => {
    setErrorCount(prev => Math.max(0, prev - 1));
  };

  // دالة لتعديل الدرجة يدوياً (ستُستخدم في واجهة التسميع)
  const handleGradeChange = (newGrade: number) => {
    if (newGrade >= 0 && newGrade <= 10) {
      setFinalGrade(newGrade);
    }
  };

  const saveRecitationSession = async () => {
    if (!selectedStudent) return;
    
    // التحقق من صحة نطاق الآيات أولاً
    const validation = validateVerseRange(fromSurah, fromVerse, toSurah, toVerse);
    if (!validation.isValid) {
      toast({
        title: "خطأ في نطاق الآيات ❌",
        description: validation.message,
        variant: "destructive",
      });
      return;
    }
    
    setIsSavingRecitation(true);
    try {
      // تحويل أسماء السور إلى أرقام
      const getSubrahNumber = (surahName: string): number => {
        const surahs = [
          'الفاتحة', 'البقرة', 'آل عمران', 'النساء', 'المائدة', 'الأنعام', 'الأعراف', 'الأنفال', 
          'التوبة', 'يونس', 'هود', 'يوسف', 'الرعد', 'إبراهيم', 'الحجر', 'النحل', 'الإسراء', 
          'الكهف', 'مريم', 'طه', 'الأنبياء', 'الحج', 'المؤمنون', 'النور', 'الفرقان', 'الشعراء',
          'النمل', 'القصص', 'العنكبوت', 'الروم', 'لقمان', 'السجدة', 'الأحزاب', 'سبأ', 'فاطر',
          'يس', 'الصافات', 'ص', 'الزمر', 'غافر', 'فصلت', 'الشورى', 'الزخرف', 'الدخان', 'الجاثية',
          'الأحقاف', 'محمد', 'الفتح', 'الحجرات', 'ق', 'الذاريات', 'الطور', 'النجم', 'القمر',
          'الرحمن', 'الواقعة', 'الحديد', 'المجادلة', 'الحشر', 'الممتحنة', 'الصف', 'الجمعة',
          'المنافقون', 'التغابن', 'الطلاق', 'التحريم', 'الملك', 'القلم', 'الحاقة', 'المعارج',
          'نوح', 'الجن', 'المزمل', 'المدثر', 'القيامة', 'الإنسان', 'المرسلات', 'النبأ', 'النازعات',
          'عبس', 'التكوير', 'الانفطار', 'المطففين', 'الانشقاق', 'البروج', 'الطارق', 'الأعلى',
          'الغاشية', 'الفجر', 'البلد', 'الشمس', 'الليل', 'الضحى', 'الشرح', 'التين', 'العلق',
          'القدر', 'البينة', 'الزلزلة', 'العاديات', 'القارعة', 'التكاثر', 'العصر', 'الهمزة',
          'الفيل', 'قريش', 'الماعون', 'الكوثر', 'الكافرون', 'النصر', 'المسد', 'الإخلاص', 'الفلق', 'الناس'
        ];
        return surahs.indexOf(surahName) + 1 || 1;
      };

      // تحويل نوع التسميع إلى الصيغة المطلوبة
      const getRecitationType = (mode: string): string => {
        switch (mode) {
          case 'memorization': return 'حفظ';
          case 'minor_review': return 'مراجعة صغرى';
          case 'major_review': return 'مراجعة كبرى';
          default: return 'حفظ';
        }
      };

      // البحث عن الحلقة المختارة للحصول على quran_circle_id الصحيح
      const selectedCircleGroup = teacherDashboard?.circle_groups.find(
        group => group.id === selectedClass
      );
      
      const quranCircleId = selectedCircleGroup?.quran_circle?.id;
      
      if (!quranCircleId) {
        throw new Error('لم يتم العثور على معرف الحلقة');
      }

      console.log('Debug recitation data:');
      console.log('selectedStudent:', selectedStudent);
      console.log('selectedClass (circle_group_id):', selectedClass);
      console.log('quranCircleId (quran_circle_id):', quranCircleId);
      console.log('selectedCircleGroup:', selectedCircleGroup);
      console.log('user:', user);
      console.log('teacherDashboard.teacher_info:', teacherDashboard?.teacher_info);
      console.log('fromSurah:', fromSurah);
      console.log('toSurah:', toSurah);
      console.log('fromVerse:', fromVerse);
      console.log('toVerse:', toVerse);

      const sessionData = {
        student_id: selectedStudent.id,
        teacher_id: user?.user_id || teacherDashboard?.teacher_info.id || 1, // استخدام معرف المعلم من المصادقة أو البيانات أو رقم افتراضي
        quran_circle_id: quranCircleId, // استخدام معرف الحلقة الصحيح
        start_surah_number: getSubrahNumber(fromSurah || 'الفاتحة'),
        start_verse: parseInt(fromVerse || '1'),
        end_surah_number: getSubrahNumber(toSurah || 'الفاتحة'),
        end_verse: parseInt(toVerse || '7'),
        recitation_type: getRecitationType(viewMode),
        duration_minutes: Math.ceil(recitationTimer / 60), // تحويل الثواني إلى دقائق
        grade: finalGrade,
        evaluation: getEvaluationText(finalGrade),
        teacher_notes: `عدد الأخطاء: ${errorCount} - مدة التسميع: ${formatTime(recitationTimer)}`
      };

      console.log('Sending recitation data:', sessionData); // للتحقق من البيانات المرسلة

      const response = await fetch(`https://7alaqat.com/api/recitation/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // سيتم إضافة التوكن لاحقاً عند تنفيذ نظام المصادقة
        },
        body: JSON.stringify(sessionData)
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "تم حفظ التسميع بنجاح! ✅",
          description: `الدرجة: ${finalGrade} - ${getEvaluationText(finalGrade)}`,
        });
        
        // إعادة تعيين حالة التسميع
        stopRecitation();
        resetRecitation();
        
        // إغلاق النافذة
        setShowSectionSelection(false);
        setSelectedAction(null);
        setShowStudentSheet(false);
        
        // تحديث بيانات المعلم لإظهار التسميع الجديد
        await fetchTeacherDashboard(true);
        
      } else {
        console.error('API Error:', result);
        console.error('Response status:', response.status);
        console.error('Response headers:', response.headers);
        
        // إظهار تفاصيل الأخطاء من الـ API
        if (result.errors) {
          console.error('Validation errors:', result.errors);
          const errorMessages = Object.values(result.errors).flat();
          console.error('Error messages:', errorMessages);
        }
        
        throw new Error(result.message || 'فشل في حفظ التسميع');
      }
    } catch (error) {
      console.error('Save recitation error:', error);
      toast({
        title: "خطأ في حفظ التسميع ❌",
        description: "حدث خطأ أثناء حفظ جلسة التسميع",
        variant: "destructive",
      });
    } finally {
      setIsSavingRecitation(false);
    }
  };

  const getStatusIcon = (student: StudentFromAPI) => {
    // استخدام البيانات المحدثة محلياً إذا كانت متوفرة، وإلا API
    const localStatus = teacherDashboard?.circle_groups
      .find(group => group.students.some(s => s.id === student.id))
      ?.students.find(s => s.id === student.id)?.attendance_today.status;
    
    const status = localStatus || student.attendance_today.status;
    
    switch (status) {
      case 'حاضر': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'غائب': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'متأخر': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'مأذون': return <UserCheck className="w-4 h-4 text-blue-600" />;
      case 'no_record': return <Clock className="w-4 h-4 text-gray-400" />;
      default: return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (student: StudentFromAPI) => {
    // استخدام البيانات المحدثة محلياً إذا كانت متوفرة، وإلا API
    const localStatus = teacherDashboard?.circle_groups
      .find(group => group.students.some(s => s.id === student.id))
      ?.students.find(s => s.id === student.id)?.attendance_today.status;
    
    const status = localStatus || student.attendance_today.status;
    
    switch (status) {
      case 'حاضر': return 'حاضر';
      case 'غائب': return 'غائب';
      case 'متأخر': return 'متأخر';
      case 'مأذون': return 'مأذون';
      case 'no_record': return 'لم يسجل';
      default: return 'غير محدد';
    }
  };

  const getStatusColor = (student: StudentFromAPI) => {
    // استخدام البيانات المحدثة محلياً إذا كانت متوفرة، وإلا API
    const localStatus = teacherDashboard?.circle_groups
      .find(group => group.students.some(s => s.id === student.id))
      ?.students.find(s => s.id === student.id)?.attendance_today.status;
    
    const status = localStatus || student.attendance_today.status;
    
    switch (status) {
      case 'حاضر': return 'bg-green-100 text-green-800 border-green-300';
      case 'غائب': return 'bg-red-100 text-red-800 border-red-300';
      case 'متأخر': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'مأذون': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'no_record': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // دوال التحضير
  const toggleAttendanceMode = () => {
    if (!isAttendanceMode) {
      // بدء التحضير - تهيئة البيانات من الحالة الحالية
      const initialData: Record<number, 'حاضر' | 'غائب' | 'متأخر' | 'مأذون'> = {};
      const students = getCurrentStudents();
      students.forEach(student => {
        // استخدام الحالة الحالية من البيانات المجلبة
        const currentStatus = student.attendance_today.status;
        if (currentStatus === 'no_record') {
          initialData[student.id] = 'حاضر'; // افتراضياً حاضر للطلاب الجدد
        } else {
          initialData[student.id] = currentStatus as 'حاضر' | 'غائب' | 'متأخر' | 'مأذون';
        }
      });
      setAttendanceData(initialData);
    }
    setIsAttendanceMode(!isAttendanceMode);
  };

  const handleAttendanceClick = (studentId: number) => {
    if (!isAttendanceMode) return;
    
    const currentStatus = attendanceData[studentId] || 'حاضر';
    let newStatus: 'حاضر' | 'غائب' | 'متأخر' | 'مأذون';
    
    // تدوير الحالات: حاضر -> غائب -> متأخر -> مأذون -> حاضر
    switch (currentStatus) {
      case 'حاضر':
        newStatus = 'غائب';
        break;
      case 'غائب':
        newStatus = 'متأخر';
        break;
      case 'متأخر':
        newStatus = 'مأذون';
        break;
      case 'مأذون':
        newStatus = 'حاضر';
        break;
      default:
        newStatus = 'حاضر';
    }
    
    // تحديث محلي فقط (لا إرسال)
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: newStatus
    }));
  };

  const saveAttendance = async () => {
    try {
      setIsSavingAttendance(true); // بدء التحميل
      
      // تحضير بيانات الطلاب المُعدلة فقط
      const studentsToUpdate = Object.entries(attendanceData).map(([studentId, status]) => ({
        studentId: parseInt(studentId),
        status: status
      }));

      if (studentsToUpdate.length === 0) {
        toast({
          title: "لا توجد تغييرات ⚠️",
          description: "لم يتم تعديل أي حالة حضور",
        });
        return;
      }

      // إرسال جماعي للخادم
      const response = await fetch('/api/attendance/record-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacherId: 1, // TODO: الحصول على معرف المعلم الحقيقي من البيانات
          date: new Date().toISOString().split('T')[0],
          students: studentsToUpdate
        })
      });

      const result = await response.json();

      if (result.success) {
        // تحديث البيانات المحلية بناءً على رد الخادم
        if (teacherDashboard) {
          const updatedDashboard = { ...teacherDashboard };
          updatedDashboard.circle_groups = updatedDashboard.circle_groups.map(group => ({
            ...group,
            students: group.students.map(student => {
              // تحديث فقط الطلاب الذين تم تعديل حالتهم
              const updatedStatus = attendanceData[student.id];
              if (updatedStatus) {
                return { 
                  ...student, 
                  attendance_today: { 
                    status: updatedStatus, 
                    recorded_at: new Date().toISOString() 
                  } 
                };
              }
              return student; // إبقاء الطلاب الآخرين كما هم
            })
          }));
          setTeacherDashboard(updatedDashboard);
        }

        // إنهاء وضع التحضير
        setIsAttendanceMode(false);
        setAttendanceData({});
        setShowAttendanceModal(false);
        
        toast({
          title: "تم حفظ التحضير بنجاح! ✅",
          description: `تم تحديث حضور ${studentsToUpdate.length} طالب`,
        });
      } else {
        toast({
          title: "خطأ في حفظ التحضير ❌",
          description: result.message || "حدث خطأ أثناء الحفظ",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في الاتصال ❌",
        description: "تحقق من اتصال الإنترنت",
      });
    } finally {
      setIsSavingAttendance(false); // إنهاء التحميل
    }
  };

  // دالة للتعامل مع النقر على اسم الطالب
  const handleStudentClick = (student: StudentFromAPI) => {
    // التحقق من وجود تحضير لليوم أولاً
    const hasAnyAttendanceToday = getCurrentStudents().some(s => 
      s.attendance_today?.status !== 'no_record' || attendanceData[s.id]
    );
    
    // إذا لم يكن هناك أي تحضير لليوم، منع التسميع
    if (!hasAnyAttendanceToday) {
      setAttendanceAlertType('no_attendance');
      setShowAttendanceAlert(true);
      return; // منع فتح النافذة
    }
    
    // التحقق من حالة الحضور أولاً
    const currentAttendanceStatus = attendanceData[student.id] || student.attendance_today?.status || 'حاضر';
    
    // إذا كان الطالب غائب، منع فتح نافذة التسميع وإظهار تنبيه
    if (currentAttendanceStatus === 'غائب') {
      setAttendanceAlertType('student_absent');
      setAlertStudentName(student.name);
      setShowAttendanceAlert(true);
      return; // منع فتح النافذة
    }
    
    // إذا كان حاضر أو متأخر أو مأذون، فتح نافذة التسميع
    setSelectedStudent(student);
    setShowStudentSheet(true);
  };

  // دالة لإغلاق Bottom Sheet مع حركة
  const closeStudentSheet = () => {
    const bottomSheet = document.querySelector('.bottomsheet-container');
    if (bottomSheet) {
      bottomSheet.classList.remove('bottomsheet-enter');
      bottomSheet.classList.add('bottomsheet-exit');
      setTimeout(() => {
        setShowStudentSheet(false);
      }, 250); // نفس مدة الحركة
    } else {
      setShowStudentSheet(false);
    }
  };

  // دالة إعادة تعيين حالة التسميع
  const resetRecitationState = () => {
    setSelectedAction(null);
    setShowSectionSelection(false);
    setFromSurah('');
    setToSurah('');
    setFromVerse('');
    setToVerse('');
    setRecitationTimer(0);
    setErrorCount(0);
    setFinalGrade(10);
    setIsRecitationActive(false);
  };

  // دالة معالجة إغلاق نافذة الطالب
  const handleStudentSheetClose = () => {
    // إذا كان التسميع نشطاً، اسأل المستخدم
    if (isRecitationActive) {
      setShowCancelRecitationAlert(true);
      return;
    }
    
    // إذا لم يكن التسميع نشطاً، أغلق مباشرة وأعد التعيين
    resetRecitationState();
    closeStudentSheet();
  };

  // دالة تأكيد إلغاء التسميع النشط
  const confirmCancelRecitation = () => {
    resetRecitationState();
    setShowCancelRecitationAlert(false);
    closeStudentSheet();
  };

  // دالة لحفظ المراجعة
  const handleSaveReview = (type: 'save' | 'minor' | 'major') => {
    if (!selectedStudent) return;
    
    // تحديد نوع التسميع
    let viewModeType: 'memorization' | 'minor_review' | 'major_review';
    switch (type) {
      case 'save':
        viewModeType = 'memorization';
        setViewMode('memorization');
        break;
      case 'minor':
        viewModeType = 'minor_review';
        setViewMode('minor_review');
        break;
      case 'major':
        viewModeType = 'major_review';
        setViewMode('major_review');
        break;
    }
    
    // تعبئة المقطع تلقائياً بناءً على آخر تسميع
    autoFillFromLastRecitation(selectedStudent, viewModeType);
    
    setSelectedAction(type);
    setShowSectionSelection(true);
  };

  // دالة لحفظ المقطع النهائي
  const handleSaveSection = () => {
    if (!selectedStudent || !selectedAction) return;
    
    // إذا كان التسميع نشطاً، أنهه واحفظ النتائج
    if (isRecitationActive) {
      saveRecitationSession();
      return;
    }
    
    // إذا لم يكن نشطاً، ابدأ التسميع
    startRecitation();
    
    // لا نغلق النافذة، نبقيها مفتوحة لعرض واجهة التسميع
    toast({
      title: "بدء التسميع ⏱️",
      description: `تم بدء توقيت التسميع للطالب ${selectedStudent.name}`,
    });
  };

  // دالة للإلغاء والعودة للأزرار الثلاثة
  const handleCancelSelection = () => {
    setSelectedAction(null);
    setShowSectionSelection(false);
    setFromSurah('');
    setToSurah('');
    setFromVerse('');
    setToVerse('');
  };

  const getAttendanceColor = (studentId: number) => {
    if (!isAttendanceMode) return 'bg-card';
    
    const status = attendanceData[studentId] || 'حاضر';
    switch (status) {
      case 'حاضر': return 'bg-green-100 border-green-300 text-green-800';
      case 'متأخر': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'غائب': return 'bg-red-100 border-red-300 text-red-800';
      case 'مأذون': return 'bg-blue-100 border-blue-300 text-blue-800';
      default: return 'bg-card';
    }
  };

  const getAttendanceText = (studentId: number) => {
    if (!isAttendanceMode) return '';
    
    const status = attendanceData[studentId] || 'حاضر';
    switch (status) {
      case 'حاضر': return 'حاضر';
      case 'متأخر': return 'متأخر';
      case 'غائب': return 'غائب';
      case 'مأذون': return 'مأذون';
      default: return '';
    }
  };

  const handleTeacherAttendance = () => {
    setTeacherAttended(true);
    toast({
      title: "تم تسجيل الحضور بنجاح! ✅",
      description: "تم تسجيل حضورك في الحلقة",
    });
  };

  const currentClass = getCurrentClass();

  // قائمة السور
  const surahs = [
    'الفاتحة', 'البقرة', 'آل عمران', 'النساء', 'المائدة', 'الأنعام', 'الأعراف', 'الأنفال', 
    'التوبة', 'يونس', 'هود', 'يوسف', 'الرعد', 'إبراهيم', 'الحجر', 'النحل', 'الإسراء', 
    'الكهف', 'مريم', 'طه', 'الأنبياء', 'الحج', 'المؤمنون', 'النور', 'الفرقان', 'الشعراء',
    'النمل', 'القصص', 'العنكبوت', 'الروم', 'لقمان', 'السجدة', 'الأحزاب', 'سبأ', 'فاطر',
    'يس', 'الصافات', 'ص', 'الزمر', 'غافر', 'فصلت', 'الشورى', 'الزخرف', 'الدخان', 'الجاثية',
    'الأحقاف', 'محمد', 'الفتح', 'الحجرات', 'ق', 'الذاريات', 'الطور', 'النجم', 'القمر',
    'الرحمن', 'الواقعة', 'الحديد', 'المجادلة', 'الحشر', 'الممتحنة', 'الصف', 'الجمعة',
    'المنافقون', 'التغابن', 'الطلاق', 'التحريم', 'الملك', 'القلم', 'الحاقة', 'المعارج',
    'نوح', 'الجن', 'المزمل', 'المدثر', 'القيامة', 'الإنسان', 'المرسلات', 'النبأ', 'النازعات',
    'عبس', 'التكوير', 'الانفطار', 'المطففين', 'الانشقاق', 'البروج', 'الطارق', 'الأعلى',
    'الغاشية', 'الفجر', 'البلد', 'الشمس', 'الليل', 'الضحى', 'الشرح', 'التين', 'العلق',
    'القدر', 'البينة', 'الزلزلة', 'العاديات', 'القارعة', 'التكاثر', 'العصر', 'الهمزة',
    'الفيل', 'قريش', 'الماعون', 'الكوثر', 'الكافرون', 'النصر', 'المسد', 'الإخلاص', 'الفلق', 'الناس'
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* الشريط الجانبي */}
      <div className={`fixed inset-y-0 right-0 z-50 w-64 bg-card border-l-2 border-border/50 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0`}>
        <div className="flex flex-col w-64 bg-gradient-to-b from-card to-muted/20 custom-scrollbar h-full overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-[18px] border-b border-border/50 bg-primary/5 flex-shrink-0">
            <h2 className="text-lg font-semibold text-primary">القائمة الرئيسية</h2>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden rounded-xl hover:bg-primary/10"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <nav className="flex-1 mt-4 px-2">
            {sidebarItems.map((item) => (
              <Button
                key={item.id}
                variant={item.active ? "default" : "ghost"}
                className={`w-full justify-start mb-2 rounded-xl transition-all duration-200 ${
                  item.active 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "hover:bg-accent/10 hover:text-accent-foreground"
                }`}
                onClick={() => {
                  setSidebarOpen(false);
                }}
              >
                <item.icon className="w-5 h-5 ml-3" />
                {item.name}
              </Button>
            ))}
          </nav>
        </div>
      </div>

      {/* Overlay للشريط الجانبي في الجوال */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* المحتوى الرئيسي */}
      <div className="flex-1 flex flex-col lg:mr-64">
        {/* الشريط العلوي الثابت */}
        <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b-2 border-border/50 px-4 py-4 lg:px-8 shadow-sm">
          <div className="flex items-center justify-between">
          {/* الشعار وزر القائمة */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden rounded-xl"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg text-foreground">منصة غرب</h1>
              <p className="text-sm text-muted-foreground">لإدارة حلقات القرآن الكريم</p>
            </div>
          </div>

          {/* الأيقونات */}
          <div className="flex items-center gap-2">
            {/* زر تبديل الثيم */}
            <div className="flex items-center gap-2 bg-muted/50 rounded-xl p-2" dir="ltr">
              <Sun className="h-4 w-4 text-foreground" />
              <Switch 
                checked={darkMode} 
                onCheckedChange={setDarkMode}
              />
              <Moon className="h-4 w-4 text-foreground" />
            </div>
            
            <Button variant="ghost" size="sm" className="relative rounded-xl">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
            </Button>
            <Button variant="ghost" size="sm" className="rounded-xl" onClick={onLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي - مع مساحة للشريط العلوي */}
      <div className="pt-6 pb-6 px-4 lg:px-8 space-y-6">
        {/* Container للشاشات الكبيرة - يجعل المحتوى في الوسط */}
        <div className="max-w-7xl mx-auto">
          {/* إحصائيات سريعة - تظهر أكثر على الشاشة الكبيرة */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-card border-2 border-border/50 hover:border-primary/30 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{currentClassInfo.totalStudents}</p>
                  <p className="text-sm text-muted-foreground">إجمالي الطلاب</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-2 border-border/50 hover:border-accent/30 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center border border-accent/20">
                  <CheckCircle className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{currentClassInfo.presentToday}</p>
                  <p className="text-sm text-muted-foreground">حاضرون</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* إحصائيات إضافية للشاشة الكبيرة */}
          <Card className="hidden lg:block bg-card border-2 border-border/50 hover:border-secondary/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-secondary/30 rounded-xl flex items-center justify-center border border-secondary/40">
                  <Award className="w-6 h-6 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{currentClassInfo.withRecitation}</p>
                  <p className="text-sm text-muted-foreground">لديهم تسميع حديث</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hidden lg:block bg-card border-2 border-border/50 hover:border-primary/30 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/15 rounded-xl flex items-center justify-center border border-primary/25">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{teacherDashboard?.summary?.attendance_rate_today || 0}%</p>
                  <p className="text-sm text-muted-foreground">معدل الحضور</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* الحلقات والطلاب */}
        {loading ? (
          <Card className="bg-card border-2 border-border/50 hover:border-primary/30 transition-colors">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-xl">
              <CardTitle className="text-primary flex items-center gap-2">
                <div className="w-5 h-5 bg-primary/20 rounded animate-pulse"></div>
                <div className="h-6 bg-primary/20 rounded w-16 animate-pulse"></div>
              </CardTitle>
              <CardDescription>
                <div className="h-4 bg-muted-foreground/20 rounded w-40 animate-pulse"></div>
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Skeleton للحلقات - محسن للجوال */}
              <div className="flex gap-2 md:gap-3 flex-wrap">
                {[1, 2].map(i => (
                  <div key={i} className="flex items-center gap-2 px-3 md:px-4 py-2 bg-muted/30 rounded-xl border border-border/30 animate-pulse">
                    <div className="h-4 md:h-5 bg-muted-foreground/20 rounded w-16 md:w-20"></div>
                    <div className="h-4 md:h-5 bg-muted-foreground/20 rounded-full w-6 md:w-8"></div>
                  </div>
                ))}
              </div>

              {/* خط فاصل */}
              <div className="border-t border-border/50"></div>

              {/* Skeleton لقائمة الطلاب - محسن للجوال */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-4 md:w-5 h-4 md:h-5 bg-accent/20 rounded animate-pulse"></div>
                  <div className="h-5 md:h-6 bg-accent/20 rounded w-24 md:w-32 animate-pulse"></div>
                  <div className="h-3 md:h-4 bg-muted-foreground/20 rounded w-32 md:w-48 animate-pulse hidden sm:block"></div>
                </div>
                
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center justify-between p-3 md:p-4 bg-muted/30 rounded-xl border border-border/30 animate-pulse">
                      <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                        <div className="w-3 md:w-4 h-3 md:h-4 bg-muted-foreground/20 rounded-full flex-shrink-0"></div>
                        <div className="flex-1 space-y-1 md:space-y-2 min-w-0">
                          <div className="h-4 md:h-5 bg-muted-foreground/20 rounded w-24 md:w-32"></div>
                          <div className="h-3 md:h-4 bg-muted-foreground/20 rounded w-32 md:w-48"></div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                        {/* شريط التقدم Skeleton - مخفي في الجوال */}
                        <div className="hidden lg:flex items-center gap-2">
                          <div className="w-20 md:w-24 h-2 bg-muted-foreground/20 rounded-full"></div>
                          <div className="h-3 md:h-4 bg-muted-foreground/20 rounded w-10 md:w-12"></div>
                        </div>
                        
                        <div className="h-5 md:h-6 bg-muted-foreground/20 rounded-full w-12 md:w-16"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="bg-card border-2 border-red-300">
            <CardContent className="p-6 text-center">
              <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-600">{error}</p>
              <Button 
                onClick={() => fetchTeacherDashboard()} 
                className="mt-4"
                variant="outline"
              >
                إعادة المحاولة
              </Button>
            </CardContent>
          </Card>
        ) : !teacherDashboard ? (
          <Card className="bg-card border-2 border-border/50">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">لا توجد بيانات متاحة</p>
            </CardContent>
          </Card>
        ) : (
        <Card className="bg-card border-2 border-border/50 hover:border-primary/30 transition-colors">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-xl">
            <CardTitle className="text-primary flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              الحلقات
            </CardTitle>
            <CardDescription>اختر الحلقة لعرض طلابها</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* اختيار الحلقة - محسن للجوال */}
            <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 md:gap-3">
              {teacherDashboard?.circle_groups.map(classItem => (
                <Button
                  key={classItem.id}
                  variant={selectedClass === classItem.id ? "default" : "outline"}
                  onClick={() => setSelectedClass(classItem.id)}
                  className={`relative overflow-hidden rounded-xl transition-all duration-200 h-12 md:h-auto px-3 ${
                    selectedClass === classItem.id 
                      ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90" 
                      : "border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                  }`}
                >
                  {/* اسم الحلقة */}
                  <div className="text-center w-full">
                    <span className="text-sm md:text-base font-medium truncate">
                      {classItem.name}
                    </span>
                  </div>
                </Button>
              ))}
            </div>

            {/* خط فاصل */}
            <div className="border-t border-border/50"></div>

            {/* قائمة الطلاب */}
            <div className="space-y-4">
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-accent" />
                  <h3 className="text-lg font-semibold text-accent">طلاب {currentClass?.name}</h3>
                </div>
                
                {/* اسم المسجد تحت العنوان مباشرة في الجوال */}
                {currentClass?.quran_circle?.mosque?.name && (
                  <div className="md:hidden mt-1 mr-7">
                    <span className="text-sm text-muted-foreground font-medium">
                      {currentClass.quran_circle.mosque.name}
                    </span>
                  </div>
                )}
                
                {/* النص التوضيحي للشاشات الكبيرة */}
                <div className="hidden md:block mt-1 mr-7">
                  <span className="text-sm text-muted-foreground">
                    قائمة بجميع طلاب الحلقة وحالة حضورهم
                  </span>
                </div>
              </div>
              
              <div className="space-y-3 custom-scrollbar">
                {getCurrentStudents().map(student => (
                  <div 
                    key={student.id} 
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/30 hover:bg-accent/5 hover:border-accent/30 transition-colors cursor-pointer hover:shadow-md"
                    onClick={() => handleStudentClick(student)}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {getStatusIcon(student)}
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">
                          {student.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{formatLastMemorization(student)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {/* شريط التقدم - مخفي مؤقتاً لأنه غير متوفر في API */}
                      <div className="hidden lg:flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${student.has_recent_recitation ? 80 : 20}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground min-w-[3rem]">{student.has_recent_recitation ? 80 : 20}%</span>
                      </div>
                      
                      <Badge className={`${getStatusColor(student)} border`}>
                        {getStatusText(student)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        )}
        </div> {/* إغلاق container */}
      </div> {/* إغلاق المحتوى الرئيسي */}

      {/* الأزرار العائمة */}
      <div className="fixed bottom-6 left-6 flex flex-col gap-4">
        {/* زر تسجيل حضور المعلم - معطل مؤقتاً */}
        {false && !teacherAttended && (
          <Button
            onClick={handleTeacherAttendance}
            className="w-14 h-14 rounded-full shadow-lg bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <UserCheck className="w-6 h-6" />
          </Button>
        )}

        {/* زر تسجيل الحضور للطلاب */}
        <Button
          onClick={() => {
            toggleAttendanceMode();
            setShowAttendanceModal(true);
          }}
          className="w-14 h-14 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-xl transition-all duration-200"
        >
          <ClipboardCheck className="w-6 h-6" />
        </Button>
      </div>

      {/* نافذة تحضير الطلاب */}
      {showAttendanceModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-end lg:items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-card/95 backdrop-blur-md border-2 border-border/50">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-xl">
              <CardTitle className="flex items-center gap-2 text-primary">
                <UserCheck className="w-5 h-5" />
                تحضير الطلاب
              </CardTitle>
              <CardDescription>اضغط على أسماء الطلاب لتغيير حالة الحضور</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar p-4">
              {getCurrentStudents().map(student => (
                <div
                  key={student.id}
                  onClick={() => handleAttendanceClick(student.id)}
                  className={`
                    p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md
                    ${getAttendanceColor(student.id)}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{student.name}</span>
                    <span className="text-sm font-semibold">
                      {getAttendanceText(student.id)}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
            <div className="p-4 border-t border-border/30 bg-muted/20">
              <div className="flex gap-2">
                <Button 
                  onClick={saveAttendance}
                  className="flex-1 bg-primary hover:bg-primary/90 rounded-xl"
                  disabled={!isAttendanceMode || isSavingAttendance}
                >
                  {isSavingAttendance ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      حفظ التحضير
                    </>
                  )}
                </Button>
                <Button 
                  onClick={() => {
                    setIsAttendanceMode(false);
                    setAttendanceData({});
                    setShowAttendanceModal(false);
                  }}
                  variant="outline"
                  className="px-6 rounded-xl"
                  disabled={isSavingAttendance}
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
      
      {/* Bottom Sheet للطالب */}
      {showStudentSheet && selectedStudent && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end lg:items-center justify-center z-50"
          onClick={handleStudentSheetClose}
        >
          <div 
            className="bottomsheet-container bottomsheet-enter w-full max-w-md bg-card/95 backdrop-blur-md rounded-t-3xl lg:rounded-3xl border-t-2 border-l-2 border-r-2 lg:border-2 border-border/50 shadow-2xl lg:fixed lg:top-1/2 lg:left-1/2 lg:transform lg:-translate-x-1/2 lg:-translate-y-1/2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* مقبض السحب - يظهر فقط على الجوال */}
            <div className="flex justify-center pt-3 pb-2 lg:hidden">
              <div className="w-12 h-1 bg-muted-foreground/30 rounded-full"></div>
            </div>
            
            {/* Header */}
            <div className="px-6 py-4 lg:pt-6 border-b border-border/30">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{selectedStudent.name}</h3>
                  {/* النص الديناميكي بناءً على النوع المختار */}
                  <p className="text-sm text-muted-foreground">{formatRecitationByType(selectedStudent, viewMode)}</p>
                </div>
                {/* السهم يظهر فقط على الشاشات الكبيرة */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden lg:flex rounded-full"
                  onClick={handleStudentSheetClose}
                >
                  <ChevronUp className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            {/* المحتوى المشروط */}
            {!showSectionSelection ? (
              /* الأزرار الثلاثة - بجانب بعض */
              <div className="p-6">
                <div className="grid grid-cols-3 gap-3">
                  {/* زر الحفظ */}
                  <Button
                    onClick={() => handleSaveReview('save')}
                    className="h-20 bg-primary hover:bg-primary/90 rounded-2xl text-primary-foreground font-medium transition-all duration-200 hover:shadow-lg flex flex-col items-center justify-center gap-2"
                  >
                    <Save className="w-6 h-6" />
                    <span className="text-sm">حفظ</span>
                  </Button>
                  
                  {/* زر المراجعة الصغرى */}
                  <Button
                    onClick={() => handleSaveReview('minor')}
                    className="h-20 bg-primary hover:bg-primary/90 rounded-2xl text-primary-foreground font-medium transition-all duration-200 hover:shadow-lg flex flex-col items-center justify-center gap-2"
                  >
                    <BookMarked className="w-6 h-6" />
                    <span className="text-sm">مراجعة صغرى</span>
                  </Button>
                  
                  {/* زر المراجعة الكبرى */}
                  <Button
                    onClick={() => handleSaveReview('major')}
                    className="h-20 bg-primary hover:bg-primary/90 rounded-2xl text-primary-foreground font-medium transition-all duration-200 hover:shadow-lg flex flex-col items-center justify-center gap-2"
                  >
                    <Star className="w-6 h-6" />
                    <span className="text-sm">مراجعة كبرى</span>
                  </Button>
                </div>
              </div>
            ) : (
              /* اختيار المقطع */
              <div className="p-6 space-y-6">
                {/* الأزرار الثلاثة - مع تمييز المحدد */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <Button
                    className={`h-16 rounded-2xl font-medium transition-all duration-200 flex flex-col items-center justify-center gap-1 ${
                      selectedAction === 'save' 
                        ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg' 
                        : 'bg-muted/50 hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    <Save className="w-5 h-5" />
                    <span className="text-xs">حفظ</span>
                  </Button>
                  
                  <Button
                    className={`h-16 rounded-2xl font-medium transition-all duration-200 flex flex-col items-center justify-center gap-1 ${
                      selectedAction === 'minor' 
                        ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg' 
                        : 'bg-muted/50 hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    <BookMarked className="w-5 h-5" />
                    <span className="text-xs">مراجعة صغرى</span>
                  </Button>
                  
                  <Button
                    className={`h-16 rounded-2xl font-medium transition-all duration-200 flex flex-col items-center justify-center gap-1 ${
                      selectedAction === 'major' 
                        ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg' 
                        : 'bg-muted/50 hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    <Star className="w-5 h-5" />
                    <span className="text-xs">مراجعة كبرى</span>
                  </Button>
                </div>

                {/* اختر المقطع - يختفي عندما يبدأ التسميع النشط */}
                {!isRecitationActive && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-foreground text-center">اختر المقطع</h4>
                  
                  {/* الصف الأول - من السورة ومن آية */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="from-surah-select" className="text-sm font-medium text-foreground">
                        من السورة
                      </Label>
                      <select
                        id="from-surah-select"
                        value={fromSurah}
                        onChange={(e) => setFromSurah(e.target.value)}
                        className="custom-select w-full p-3 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none text-sm"
                        style={{ backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 16 16\"><path d=\"M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z\"/></svg>')", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", backgroundSize: "16px" }}
                      >
                        <option value="">اختر السورة</option>
                        {surahs.map((surah, index) => (
                          <option key={index} value={surah}>{surah}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="from-verse" className="text-sm font-medium text-foreground">
                        من آية رقم
                      </Label>
                      <div className="relative">
                        <Input
                          id="from-verse"
                          type="number"
                          placeholder="1"
                          value={fromVerse}
                          onChange={(e) => setFromVerse(e.target.value)}
                          className="text-center pr-10 pl-3 h-12 rounded-xl border-border focus:ring-primary/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          min="1"
                        />
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col">
                          <button
                            type="button"
                            onClick={() => setFromVerse(String(Math.max(1, parseInt(fromVerse || '0') + 1)))}
                            className="w-6 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setFromVerse(String(Math.max(1, parseInt(fromVerse || '2') - 1)))}
                            className="w-6 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* الصف الثاني - إلى السورة وإلى آية */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="to-surah-select" className="text-sm font-medium text-foreground">
                        إلى السورة
                      </Label>
                      <select
                        id="to-surah-select"
                        value={toSurah}
                        onChange={(e) => setToSurah(e.target.value)}
                        className="custom-select w-full p-3 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none text-sm"
                        style={{ backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 16 16\"><path d=\"M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z\"/></svg>')", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", backgroundSize: "16px" }}
                      >
                        <option value="">اختر السورة</option>
                        {surahs.map((surah, index) => (
                          <option key={index} value={surah}>{surah}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="to-verse" className="text-sm font-medium text-foreground">
                        إلى آية رقم
                      </Label>
                      <div className="relative">
                        <Input
                          id="to-verse"
                          type="number"
                          placeholder="10"
                          value={toVerse}
                          onChange={(e) => setToVerse(e.target.value)}
                          className="text-center pr-10 pl-3 h-12 rounded-xl border-border focus:ring-primary/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          min="1"
                        />
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col">
                          <button
                            type="button"
                            onClick={() => setToVerse(String(Math.max(1, parseInt(toVerse || '0') + 1)))}
                            className="w-6 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setToVerse(String(Math.max(1, parseInt(toVerse || '2') - 1)))}
                            className="w-6 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                )}

                {/* واجهة التسميع النشط - في قسم اختيار المقطع */}
                {isRecitationActive && (
                  <div className="mt-6 p-4 bg-muted/20 rounded-2xl border border-border/30">
                    <div className="text-center mb-4">
                      <h4 className="text-lg font-bold text-primary mb-2">جلسة التسميع النشطة</h4>
                      
                      {/* معلومات المقطع المختار */}
                      {fromSurah && toSurah && fromVerse && toVerse && (
                        <div className="mb-4 p-3 bg-background/40 rounded-xl">
                          <div className="text-sm text-muted-foreground mb-1">المقطع المختار</div>
                          <div className="font-medium text-foreground">
                            {fromSurah === toSurah 
                              ? `سورة ${fromSurah}: من آية ${fromVerse} إلى آية ${toVerse}`
                              : `من سورة ${fromSurah} آية ${fromVerse} إلى سورة ${toSurah} آية ${toVerse}`
                            }
                          </div>
                          {/* عدد الآيات تقريبي */}
                          <div className="text-xs text-muted-foreground mt-1">
                            {fromSurah === toSurah 
                              ? `عدد الآيات: ${parseInt(toVerse) - parseInt(fromVerse) + 1}`
                              : 'متعدد السور'
                            }
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-center gap-4 mb-4">
                        {/* التوقيت */}
                        <div className="bg-background/60 px-4 py-2 rounded-xl">
                          <span className="text-sm text-muted-foreground">الوقت</span>
                          <div className="text-2xl font-bold text-foreground">{formatTime(recitationTimer)}</div>
                        </div>
                        
                        {/* عدد الأخطاء */}
                        <div className="bg-background/60 px-4 py-2 rounded-xl">
                          <span className="text-sm text-muted-foreground">الأخطاء</span>
                          <div className="text-2xl font-bold text-destructive">{errorCount}</div>
                        </div>
                        
                        {/* الدرجة المتوقعة */}
                        <div className="bg-background/60 px-4 py-2 rounded-xl">
                          <span className="text-sm text-muted-foreground">الدرجة</span>
                          <div className="text-2xl font-bold text-primary">{finalGrade}</div>
                        </div>
                      </div>
                    </div>

                    {/* أزرار التحكم في الأخطاء */}
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <Button
                        onClick={decrementError}
                        variant="outline"
                        size="sm"
                        className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900"
                        disabled={errorCount === 0}
                      >
                        <span className="text-green-600 dark:text-green-400 text-xl font-bold">-</span>
                      </Button>
                      
                      <span className="mx-4 text-sm text-muted-foreground font-medium">تسجيل الأخطاء</span>
                      
                      <Button
                        onClick={incrementError}
                        variant="outline"
                        size="sm"
                        className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900"
                      >
                        <span className="text-red-600 dark:text-red-400 text-xl font-bold">+</span>
                      </Button>
                    </div>

                    {/* تحرير الدرجة يدوياً */}
                    <div className="flex items-center justify-center gap-3 mb-4 p-3 bg-background/50 rounded-xl">
                      <span className="text-sm text-muted-foreground">تعديل الدرجة:</span>
                      <Input
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        value={finalGrade}
                        onChange={(e) => handleGradeChange(parseFloat(e.target.value) || 0)}
                        className="w-20 h-8 text-center"
                      />
                      <span className="text-sm text-muted-foreground">من 10</span>
                    </div>

                    {/* أزرار الأكشن */}
                    <div className="flex gap-3">
                      <Button
                        onClick={stopRecitation}
                        variant="outline"
                        className="flex-1 h-12 rounded-xl"
                      >
                        إيقاف التسميع
                      </Button>
                      
                      <Button
                        onClick={saveRecitationSession}
                        disabled={isSavingRecitation}
                        className="flex-1 h-12 bg-primary hover:bg-primary/90 rounded-xl text-primary-foreground"
                      >
                        {isSavingRecitation ? "جاري الحفظ..." : "حفظ النتيجة"}
                      </Button>
                    </div>

                    {/* التقييم النهائي */}
                    <div className="mt-4 text-center">
                      <span className="text-sm text-muted-foreground">التقييم: </span>
                      <span className="font-bold text-primary">{getEvaluationText(finalGrade)}</span>
                    </div>
                  </div>
                )}

                {/* أزرار بدء التسميع والإلغاء - تظهر فقط عندما لا يكون التسميع نشطاً */}
                {!isRecitationActive && (
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleSaveSection}
                      className="flex-1 h-12 bg-primary hover:bg-primary/90 rounded-xl text-primary-foreground font-medium"
                    >
                      <ChevronRight className="w-4 h-4 mr-2" />
                      بدء التسميع
                    </Button>
                    <Button
                      onClick={handleCancelSelection}
                      variant="outline"
                      className="px-6 h-12 rounded-xl"
                    >
                      إلغاء
                    </Button>
                  </div>
                )}
              </div>
            )}
            
            {/* مساحة إضافية لضمان عدم اختفاء المحتوى */}
            <div className="h-8"></div>
          </div>
        </div>
      )}
      
      {/* نافذة تنبيه التحضير */}
      <Dialog open={showAttendanceAlert} onOpenChange={setShowAttendanceAlert}>
        <DialogContent className="w-[90vw] max-w-sm mx-auto rounded-xl border shadow-lg p-4">
          <DialogHeader className="text-center pb-2">
            <div className="flex flex-col items-center gap-3">
              {attendanceAlertType === 'no_attendance' ? (
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center border border-orange-300">
                  <span className="text-xl">📋</span>
                </div>
              ) : (
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center border border-red-300">
                  <span className="text-xl">⚠️</span>
                </div>
              )}
              
              <DialogTitle className="text-lg font-bold text-center">
                {attendanceAlertType === 'no_attendance' ? 
                  "يجب التحضير أولاً" : 
                  "الطالب غائب"
                }
              </DialogTitle>
            </div>
            
            <DialogDescription className="text-center text-sm text-muted-foreground mt-1">
              {attendanceAlertType === 'no_attendance' ? (
                "يرجى تسجيل حضور الطلاب قبل البدء في التسميع"
              ) : (
                `لا يمكن تسجيل التسميع للطالب ${alertStudentName} لأنه غائب`
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex gap-2 pt-2">
            <Button 
              onClick={() => {
                setShowAttendanceAlert(false);
                setTimeout(() => {
                  toggleAttendanceMode();
                  setShowAttendanceModal(true);
                }, 100);
              }}
              className="flex-1 py-2 text-sm rounded-lg bg-primary hover:bg-primary/90"
            >
              <UserCheck className="w-4 h-4 ml-1" />
              التحضير
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowAttendanceAlert(false)}
              className="flex-1 py-2 text-sm rounded-lg border hover:bg-muted/50"
            >
              موافق
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* نافذة تأكيد إلغاء التسميع النشط */}
      <Dialog open={showCancelRecitationAlert} onOpenChange={setShowCancelRecitationAlert}>
        <DialogContent className="w-[90vw] max-w-sm mx-auto rounded-xl border shadow-lg p-4">
          <DialogHeader className="text-center pb-2">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center border border-red-300">
                <span className="text-xl">⚠️</span>
              </div>
              
              <DialogTitle className="text-lg font-bold text-center">
                إلغاء التسميع النشط
              </DialogTitle>
            </div>
            
            <DialogDescription className="text-center text-sm text-muted-foreground mt-1">
              سيتم إلغاء التسميع الحالي وعدم احتسابه. هل أنت متأكد؟
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex gap-2 pt-2">
            <Button 
              onClick={confirmCancelRecitation}
              variant="destructive"
              className="flex-1 py-2 text-sm rounded-lg"
            >
              موافق، إلغاء التسميع
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowCancelRecitationAlert(false)}
              className="flex-1 py-2 text-sm rounded-lg border hover:bg-muted/50"
            >
              العودة للتسميع
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
