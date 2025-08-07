import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import { validateEmail, validatePassword, validateUsername } from '../lib/auth';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      const result = await registerUser(data.username, data.email, data.password);
      
      if (result.success) {
        navigate('/verify', { 
          state: { 
            userId: result.userId, 
            email: data.email 
          } 
        });
      } else {
        setError('root', { message: result.error });
      }
    } catch (error) {
      setError('root', { message: 'حدث خطأ غير متوقع' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 hero-background">
      <div className="w-full max-w-md">
        <Card className="glass-effect">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold neon-text">إنشاء حساب جديد</CardTitle>
            <CardDescription>
              انضم إلى مجتمع Black-Hole واستمتع بقراءة المانجا
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Username Field */}
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  اسم المستخدم
                </label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="اسم المستخدم"
                    className="pr-10"
                    {...register('username', {
                      required: 'اسم المستخدم مطلوب',
                      validate: (value) => validateUsername(value) || 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل',
                      pattern: {
                        value: /^[a-zA-Z0-9_]+$/,
                        message: 'اسم المستخدم يجب أن يحتوي على أحرف وأرقام فقط'
                      }
                    })}
                  />
                </div>
                {errors.username && (
                  <p className="text-sm text-destructive">{errors.username.message}</p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    className="pr-10"
                    {...register('email', {
                      required: 'البريد الإلكتروني مطلوب',
                      validate: (value) => validateEmail(value) || 'البريد الإلكتروني غير صحيح'
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  كلمة المرور
                </label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="كلمة المرور"
                    className="pr-10 pl-10"
                    {...register('password', {
                      required: 'كلمة المرور مطلوبة',
                      validate: (value) => validatePassword(value) || 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  تأكيد كلمة المرور
                </label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="تأكيد كلمة المرور"
                    className="pr-10 pl-10"
                    {...register('confirmPassword', {
                      required: 'تأكيد كلمة المرور مطلوب',
                      validate: (value) => value === password || 'كلمات المرور غير متطابقة'
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="space-y-2">
                <label className="flex items-start space-x-2 space-x-reverse text-sm">
                  <input
                    type="checkbox"
                    className="mt-1"
                    {...register('terms', {
                      required: 'يجب الموافقة على الشروط والأحكام'
                    })}
                  />
                  <span>
                    أوافق على{' '}
                    <Link to="/terms" className="text-accent hover:underline">
                      الشروط والأحكام
                    </Link>
                    {' '}و{' '}
                    <Link to="/privacy" className="text-accent hover:underline">
                      سياسة الخصوصية
                    </Link>
                  </span>
                </label>
                {errors.terms && (
                  <p className="text-sm text-destructive">{errors.terms.message}</p>
                )}
              </div>

              {/* Error Message */}
              {errors.root && (
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{errors.root.message}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full neon-glow"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="ml-2" />
                    جاري إنشاء الحساب...
                  </>
                ) : (
                  'إنشاء الحساب'
                )}
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">أو</span>
                </div>
              </div>

              {/* Login Link */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  لديك حساب بالفعل؟{' '}
                  <Link
                    to="/login"
                    className="text-accent hover:underline font-medium"
                  >
                    تسجيل الدخول
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-accent transition-colors"
          >
            ← العودة إلى الصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

