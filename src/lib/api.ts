// API Configuration and Services
const API_BASE_URL = '/api'; // نستخدم نفس النطاق مع Laravel

// Types
export interface LoginRequest {
  identity_number: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user_type: string;
    user_id: number;
    name: string;
    identity_number: string;
    must_change_password: boolean;
    last_login_at: string;
  };
}

export interface TeacherData {
  user_id: number;
  name: string;
  identity_number: string;
  must_change_password: boolean;
  last_login_at: string;
  user_type: 'teacher';
}

// API Error Class
export class ApiError extends Error {
  public status?: number;
  
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// Generic API Request Function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // الحصول على CSRF token من meta tag
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-CSRF-TOKEN': csrfToken || '',
      'X-Requested-With': 'XMLHttpRequest',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.message || 'حدث خطأ في الاتصال',
        response.status
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or parsing errors
    throw new ApiError('فشل في الاتصال بالخادم');
  }
}

// Auth API Services
export const authApi = {
  // تسجيل دخول المعلم
  async teacherLogin(credentials: LoginRequest): Promise<TeacherData> {
    const response = await apiRequest<LoginResponse>('/teacher/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (!response.success || !response.data) {
      throw new ApiError(response.message || 'فشل في تسجيل الدخول');
    }

    return {
      user_id: response.data.user_id,
      name: response.data.name,
      identity_number: response.data.identity_number,
      must_change_password: response.data.must_change_password,
      last_login_at: response.data.last_login_at,
      user_type: 'teacher',
    };
  },

  // تسجيل الخروج
  async logout(): Promise<void> {
    try {
      await apiRequest('/logout', { method: 'POST' });
    } catch (error) {
      // حتى لو فشل API call، سنقوم بتسجيل الخروج محلياً
      console.warn('فشل في تسجيل الخروج من الخادم:', error);
    }
  },
};

// Helper Functions
export const apiHelpers = {
  // تحقق من حالة الخادم
  async checkServerStatus(): Promise<boolean> {
    try {
      await apiRequest('/test-api');
      return true;
    } catch {
      return false;
    }
  },
};
