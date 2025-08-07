import { useState, useEffect, createContext, useContext } from 'react';
import { getUser, setUser, removeUser, getToken, setToken, removeToken } from '../lib/auth';
import { authAPI } from '../lib/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      const savedUser = getUser();
      
      if (token && savedUser) {
        try {
          // Verify token is still valid
          const response = await authAPI.getProfile();
          setUserState(response.data.user);
          setUser(response.data.user);
        } catch (error) {
          // Token is invalid, clear auth data
          removeToken();
          removeUser();
          setUserState(null);
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { access_token, user: userData } = response.data;
      
      setToken(access_token);
      setUser(userData);
      setUserState(userData);
      
      toast.success('تم تسجيل الدخول بنجاح');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'حدث خطأ في تسجيل الدخول';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await authAPI.register({ username, email, password });
      toast.success('تم إنشاء الحساب بنجاح. يرجى التحقق من بريدك الإلكتروني');
      return { success: true, userId: response.data.user_id };
    } catch (error) {
      const message = error.response?.data?.error || 'حدث خطأ في إنشاء الحساب';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const verify = async (userId, verificationCode) => {
    try {
      await authAPI.verify({ user_id: userId, verification_code: verificationCode });
      toast.success('تم تفعيل الحساب بنجاح');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'حدث خطأ في تفعيل الحساب';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      const updatedUser = response.data.user;
      
      setUser(updatedUser);
      setUserState(updatedUser);
      
      toast.success('تم تحديث الملف الشخصي بنجاح');
      return { success: true, user: updatedUser };
    } catch (error) {
      const message = error.response?.data?.error || 'حدث خطأ في تحديث الملف الشخصي';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    removeToken();
    removeUser();
    setUserState(null);
    toast.success('تم تسجيل الخروج بنجاح');
  };

  const resendVerification = async (email) => {
    try {
      await authAPI.resendVerification({ email });
      toast.success('تم إرسال رمز التحقق الجديد');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'حدث خطأ في إرسال رمز التحقق';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    verify,
    updateProfile,
    logout,
    resendVerification,
    isAuthenticated: !!user,
    isAdmin: user?.is_admin || false,
    isModerator: user?.is_moderator || user?.is_admin || false,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

