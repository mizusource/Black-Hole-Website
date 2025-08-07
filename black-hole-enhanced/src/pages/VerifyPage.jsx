import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';

const VerifyPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { verify, resendVerification } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { userId, email } = location.state || {};

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm();

  // Redirect if no user data
  useEffect(() => {
    if (!userId || !email) {
      navigate('/register');
    }
  }, [userId, email, navigate]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      const result = await verify(userId, data.verificationCode);
      
      if (result.success) {
        navigate('/login', { 
          state: { 
            message: 'تم تفعيل حسابك بنجاح. يمكنك الآن تسجيل الدخول.' 
          } 
        });
      } else {
        setError('verificationCode', { message: result.error });
      }
    } catch (error) {
      setError('verificationCode', { message: 'حدث خطأ غير متوقع' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    
    try {
      const result = await resendVerification(email);
      
      if (result.success) {
        setCountdown(60); // 60 seconds countdown
      }
    } catch (error) {
      // Error is handled by the hook
    } finally {
      setIsResending(false);
    }
  };

  if (!userId || !email) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 hero-background">
      <div className="w-full max-w-md">
        <Card className="glass-effect">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-accent" />
            </div>
            <CardTitle className="text-2xl font-bold neon-text">تحقق من بريدك الإلكتروني</CardTitle>
            <CardDescription>
              لقد أرسلنا رمز التحقق إلى
              <br />
              <span className="font-medium text-accent">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Verification Code Field */}
              <div className="space-y-2">
                <label htmlFor="verificationCode" className="text-sm font-medium">
                  رمز التحقق
                </label>
                <Input
                  id="verificationCode"
                  type="text"
                  placeholder="أدخل رمز التحقق المكون من 6 أرقام"
                  className="text-center text-lg tracking-widest"
                  maxLength={6}
                  {...register('verificationCode', {
                    required: 'رمز التحقق مطلوب',
                    pattern: {
                      value: /^\d{6}$/,
                      message: 'رمز التحقق يجب أن يكون 6 أرقام'
                    }
                  })}
                />
                {errors.verificationCode && (
                  <p className="text-sm text-destructive">{errors.verificationCode.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full neon-glow"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="ml-2" />
                    جاري التحقق...
                  </>
                ) : (
                  'تحقق من الرمز'
                )}
              </Button>

              {/* Resend Code */}
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  لم تستلم الرمز؟
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResendCode}
                  disabled={isResending || countdown > 0}
                  className="text-accent hover:text-accent/80"
                >
                  {isResending ? (
                    <>
                      <LoadingSpinner size="sm" className="ml-2" />
                      جاري الإرسال...
                    </>
                  ) : countdown > 0 ? (
                    `إعادة الإرسال خلال ${countdown}s`
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 ml-2" />
                      إرسال رمز جديد
                    </>
                  )}
                </Button>
              </div>

              {/* Instructions */}
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <h4 className="font-medium text-sm mb-2">تعليمات:</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• تحقق من صندوق الوارد في بريدك الإلكتروني</li>
                  <li>• تحقق من مجلد الرسائل غير المرغوب فيها (Spam)</li>
                  <li>• الرمز صالح لمدة 15 دقيقة فقط</li>
                  <li>• يمكنك طلب رمز جديد إذا انتهت صلاحية الرمز</li>
                </ul>
              </div>

              {/* Back to Register */}
              <div className="text-center">
                <Link
                  to="/register"
                  className="text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  ← العودة إلى التسجيل
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerifyPage;

