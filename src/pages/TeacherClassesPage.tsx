'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  BookOpen, 
  Users, 
  Bell, 
  User, 
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
  UserPlus,
  BarChart3,
  GraduationCap,
  Sun,
  Moon,
  BookMarked,
  Star,
  ChevronUp,
  ChevronRight,
  ChevronDown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// أنواع البيانات
interface Student {
  id: number;
  name: string;
  status: 'present' | 'absent' | 'excused' | 'late';
  curriculum: string;
  progress: number;
}

interface ClassCircle {
  id: number;
  name: string;
  studentCount: number;
  presentCount: number;
  absentCount: number;
}

interface TeacherClassesPageProps {
  onLogout: () => void;
}

export default function TeacherClassesPage({ onLogout }: TeacherClassesPageProps) {
  const [selectedClass, setSelectedClass] = useState<number>(1);
  const [showAttendanceModal, setShowAttendanceModal] = useState<boolean>(false);
  const [teacherAttended, setTeacherAttended] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showStudentSheet, setShowStudentSheet] = useState<boolean>(false);
  const [selectedAction, setSelectedAction] = useState<'save' | 'minor' | 'major' | null>(null);
  const [showSectionSelection, setShowSectionSelection] = useState<boolean>(false);
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
  
  // قائمة الصفحات الوهمية
  const sidebarItems = [
    { id: 'home', name: 'الرئيسية', icon: Home, active: false },
    { id: 'classes', name: 'حلقات المعلمة', icon: BookOpen, active: true },
    { id: 'students', name: 'إدارة الطالبات', icon: Users, active: false },
    { id: 'schedule', name: 'الجدول الزمني', icon: Calendar, active: false },
    { id: 'reports', name: 'التقارير', icon: BarChart3, active: false },
    { id: 'certificates', name: 'الشهادات', icon: GraduationCap, active: false },
    { id: 'documents', name: 'المستندات', icon: FileText, active: false },
    { id: 'settings', name: 'الإعدادات', icon: Settings, active: false }
  ];

  const [students, setStudents] = useState<Student[]>([
    { id: 1, name: "فاطمة أحمد السالم", status: 'present', curriculum: "جزء عم", progress: 85 },
    { id: 2, name: "عائشة محمد الأحمد", status: 'absent', curriculum: "جزء تبارك", progress: 92 },
    { id: 3, name: "خديجة علي الزهراني", status: 'present', curriculum: "جزء عم", progress: 78 },
    { id: 4, name: "مريم سعد القحطاني", status: 'late', curriculum: "جزء قد سمع", progress: 88 },
    { id: 5, name: "زينب عبدالله النجار", status: 'excused', curriculum: "جزء عم", progress: 95 },
    { id: 6, name: "أم كلثوم حسن العمري", status: 'present', curriculum: "جزء تبارك", progress: 82 },
    { id: 7, name: "صفية إبراهيم الشهري", status: 'present', curriculum: "جزء عم", progress: 90 }
  ]);

  // حالات التحضير
  const [isAttendanceMode, setIsAttendanceMode] = useState(false);
  const [attendanceData, setAttendanceData] = useState<Record<number, 'present' | 'absent' | 'late'>>({});

  const classes: ClassCircle[] = [
    { id: 1, name: "حلقة النور", studentCount: 7, presentCount: 5, absentCount: 2 },
    { id: 2, name: "حلقة الهدى", studentCount: 8, presentCount: 6, absentCount: 2 }
  ];

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

  const { toast } = useToast();

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'absent': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'late': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'excused': return <UserCheck className="w-4 h-4 text-blue-600" />;
      default: return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'present': return 'حاضرة';
      case 'absent': return 'غائبة';
      case 'late': return 'متأخرة';
      case 'excused': return 'مستأذنة';
      default: return 'غير محدد';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800 border-green-300';
      case 'absent': return 'bg-red-100 text-red-800 border-red-300';
      case 'late': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'excused': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // دوال التحضير
  const toggleAttendanceMode = () => {
    if (!isAttendanceMode) {
      // بدء التحضير - تهيئة البيانات
      const initialData: Record<number, 'present' | 'absent' | 'late'> = {};
      students.forEach(student => {
        initialData[student.id] = 'present'; // افتراضياً جميع الطالبات حاضرات
      });
      setAttendanceData(initialData);
    }
    setIsAttendanceMode(!isAttendanceMode);
  };

  const handleAttendanceClick = (studentId: number) => {
    if (!isAttendanceMode) return;
    
    const currentStatus = attendanceData[studentId] || 'present';
    let newStatus: 'present' | 'absent' | 'late';
    
    // تدوير الحالات: حاضرة -> متأخرة -> غائبة -> حاضرة
    switch (currentStatus) {
      case 'present':
        newStatus = 'late';
        break;
      case 'late':
        newStatus = 'absent';
        break;
      case 'absent':
        newStatus = 'present';
        break;
      default:
        newStatus = 'present';
    }
    
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: newStatus
    }));
  };

  const saveAttendance = () => {
    // تحديث حالة الطالبات
    setStudents(prev => 
      prev.map(student => ({
        ...student,
        status: attendanceData[student.id] || student.status
      }))
    );
    
    // إنهاء وضع التحضير وإغلاق النافذة
    setIsAttendanceMode(false);
    setAttendanceData({});
    setShowAttendanceModal(false);
    
    // إشعار النجاح
    toast({
      title: "تم حفظ التحضير بنجاح! ✅",
      description: "تم تحديث حالة حضور جميع الطالبات",
    });
  };

  // دالة للتعامل مع النقر على اسم الطالبة
  const handleStudentClick = (student: Student) => {
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

  // دالة لحفظ المراجعة
  const handleSaveReview = (type: 'save' | 'minor' | 'major') => {
    setSelectedAction(type);
    setShowSectionSelection(true);
  };

  // دالة لحفظ المقطع النهائي
  const handleSaveSection = () => {
    if (!selectedStudent || !selectedAction) return;
    
    let message = '';
    const sectionInfo = fromSurah && toSurah && fromVerse && toVerse 
      ? ` - من ${fromSurah} آية ${fromVerse} إلى ${toSurah} آية ${toVerse}`
      : '';
    
    switch(selectedAction) {
      case 'save':
        message = `تم حفظ تقدم الطالبة ${selectedStudent.name}${sectionInfo}`;
        break;
      case 'minor':
        message = `تم تسجيل مراجعة صغرى للطالبة ${selectedStudent.name}${sectionInfo}`;
        break;
      case 'major':
        message = `تم تسجيل مراجعة كبرى للطالبة ${selectedStudent.name}${sectionInfo}`;
        break;
    }
    
    toast({
      title: "تم التسجيل بنجاح! ✅",
      description: message,
    });
    
    // إعادة تعيين جميع القيم
    setSelectedAction(null);
    setShowSectionSelection(false);
    setFromSurah('');
    setToSurah('');
    setFromVerse('');
    setToVerse('');
    closeStudentSheet();
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
    
    const status = attendanceData[studentId] || 'present';
    switch (status) {
      case 'present': return 'bg-green-100 border-green-300 text-green-800';
      case 'late': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'absent': return 'bg-red-100 border-red-300 text-red-800';
      default: return 'bg-card';
    }
  };

  const getAttendanceText = (studentId: number) => {
    if (!isAttendanceMode) return '';
    
    const status = attendanceData[studentId] || 'present';
    switch (status) {
      case 'present': return 'حاضرة';
      case 'late': return 'متأخرة';
      case 'absent': return 'غائبة';
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

  const currentClass = classes.find(c => c.id === selectedClass);

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
              <User className="w-5 h-5" />
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
                  <p className="text-2xl font-bold text-foreground">{currentClass?.studentCount || 0}</p>
                  <p className="text-sm text-muted-foreground">إجمالي الطالبات</p>
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
                  <p className="text-2xl font-bold text-foreground">{currentClass?.presentCount || 0}</p>
                  <p className="text-sm text-muted-foreground">حاضرات</p>
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
                  <p className="text-2xl font-bold text-foreground">87%</p>
                  <p className="text-sm text-muted-foreground">متوسط الأداء</p>
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
                  <p className="text-2xl font-bold text-foreground">95%</p>
                  <p className="text-sm text-muted-foreground">معدل الحضور</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* الحلقات والطالبات */}
        <Card className="bg-card border-2 border-border/50 hover:border-primary/30 transition-colors">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-xl">
            <CardTitle className="text-primary flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              الحلقات
            </CardTitle>
            <CardDescription>اختر الحلقة لعرض طالباتها</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* اختيار الحلقة */}
            <div className="flex gap-3 flex-wrap">
              {classes.map(classItem => (
                <Button
                  key={classItem.id}
                  variant={selectedClass === classItem.id ? "default" : "outline"}
                  onClick={() => setSelectedClass(classItem.id)}
                  className={`rounded-xl transition-all duration-200 ${
                    selectedClass === classItem.id 
                      ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90" 
                      : "border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                  }`}
                >
                  {classItem.name}
                  <Badge 
                    variant="secondary" 
                    className={`mr-2 ${
                      selectedClass === classItem.id 
                        ? "bg-primary-foreground/20 text-primary-foreground" 
                        : "bg-accent/20 text-accent-foreground"
                    }`}
                  >
                    {classItem.studentCount}
                  </Badge>
                </Button>
              ))}
            </div>

            {/* خط فاصل */}
            <div className="border-t border-border/50"></div>

            {/* قائمة الطالبات */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-accent" />
                <h3 className="text-lg font-semibold text-accent">طالبات {currentClass?.name}</h3>
                <span className="text-sm text-muted-foreground">- قائمة بجميع طالبات الحلقة وحالة حضورهن</span>
              </div>
              
              <div className="space-y-3 custom-scrollbar">
                {students.map(student => (
                  <div 
                    key={student.id} 
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/30 hover:bg-accent/5 hover:border-accent/30 transition-colors cursor-pointer hover:shadow-md"
                    onClick={() => handleStudentClick(student)}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {getStatusIcon(student.status)}
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">
                          {student.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{student.curriculum}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {/* شريط التقدم - يظهر على الشاشة الكبيرة */}
                      <div className="hidden lg:flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${student.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground min-w-[3rem]">{student.progress}%</span>
                      </div>
                      
                      <Badge className={`${getStatusColor(student.status)} border`}>
                        {getStatusText(student.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        </div> {/* إغلاق container */}
      </div> {/* إغلاق المحتوى الرئيسي */}

      {/* الأزرار العائمة */}
      <div className="fixed bottom-6 left-6 flex flex-col gap-4">
        {/* زر تسجيل حضور المعلمة */}
        {!teacherAttended && (
          <Button
            onClick={handleTeacherAttendance}
            className="w-14 h-14 rounded-full shadow-lg bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <UserCheck className="w-6 h-6" />
          </Button>
        )}

        {/* زر تسجيل الحضور للطالبات */}
        <Button
          onClick={() => {
            toggleAttendanceMode();
            setShowAttendanceModal(true);
          }}
          className="w-14 h-14 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-xl transition-all duration-200"
        >
          <UserPlus className="w-6 h-6" />
        </Button>
      </div>

      {/* نافذة تحضير الطالبات */}
      {showAttendanceModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-end lg:items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-card/95 backdrop-blur-md border-2 border-border/50">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-xl">
              <CardTitle className="flex items-center gap-2 text-primary">
                <UserCheck className="w-5 h-5" />
                تحضير الطالبات
              </CardTitle>
              <CardDescription>اضغط على أسماء الطالبات لتغيير حالة الحضور</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar p-4">
              {students.map(student => (
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
                  disabled={!isAttendanceMode}
                >
                  <Save className="w-4 h-4 mr-2" />
                  حفظ التحضير
                </Button>
                <Button 
                  onClick={() => {
                    setIsAttendanceMode(false);
                    setAttendanceData({});
                    setShowAttendanceModal(false);
                  }}
                  variant="outline"
                  className="px-6 rounded-xl"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
      
      {/* Bottom Sheet للطالبة */}
      {showStudentSheet && selectedStudent && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end lg:items-center justify-center z-50"
          onClick={closeStudentSheet}
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
                  <p className="text-sm text-muted-foreground">{selectedStudent.curriculum}</p>
                </div>
                {/* السهم يظهر فقط على الشاشات الكبيرة */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden lg:flex rounded-full"
                  onClick={closeStudentSheet}
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

                {/* اختر المقطع */}
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

                {/* أزرار التالي والإلغاء */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSaveSection}
                    className="flex-1 h-12 bg-primary hover:bg-primary/90 rounded-xl text-primary-foreground font-medium"
                  >
                    <ChevronRight className="w-4 h-4 mr-2" />
                    التالي
                  </Button>
                  <Button
                    onClick={handleCancelSelection}
                    variant="outline"
                    className="px-6 h-12 rounded-xl"
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            )}
            
            {/* مساحة إضافية لضمان عدم اختفاء المحتوى */}
            <div className="h-8"></div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
