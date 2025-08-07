import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 hero-background">
      <div className="text-center max-w-md mx-auto">
        {/* 404 Animation */}
        <div className="mb-8">
          <div className="text-8xl font-bold neon-text mb-4 fade-in">404</div>
          <div className="w-32 h-32 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full opacity-20 pulse-glow"></div>
            <div className="absolute inset-4 bg-gradient-to-r from-accent to-primary rounded-full opacity-40 pulse-glow" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute inset-8 bg-gradient-to-r from-primary to-accent rounded-full opacity-60 pulse-glow" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-4 mb-8 fade-in">
          <h1 className="text-3xl font-bold text-foreground">
            الصفحة غير موجودة
          </h1>
          <p className="text-muted-foreground text-lg">
            عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى مكان آخر.
          </p>
          <p className="text-sm text-muted-foreground">
            ربما تم حذف الرابط أو كتابته بشكل خاطئ.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 fade-in">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="neon-glow">
              <Link to="/">
                <Home className="ml-2 h-5 w-5" />
                العودة للرئيسية
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/manga">
                <Search className="ml-2 h-5 w-5" />
                تصفح المانجا
              </Link>
            </Button>
          </div>

          {/* Go Back Button */}
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="text-muted-foreground hover:text-accent"
          >
            <ArrowLeft className="ml-2 h-4 w-4" />
            العودة للصفحة السابقة
          </Button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 p-6 rounded-lg glass-effect fade-in">
          <h3 className="font-semibold mb-4 text-accent">روابط مفيدة</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Link
              to="/manga?sort=latest"
              className="text-muted-foreground hover:text-accent transition-colors"
            >
              أحدث المانجا
            </Link>
            <Link
              to="/manga?sort=popular"
              className="text-muted-foreground hover:text-accent transition-colors"
            >
              الأكثر شعبية
            </Link>
            <Link
              to="/manga?genre=action"
              className="text-muted-foreground hover:text-accent transition-colors"
            >
              مانجا الأكشن
            </Link>
            <Link
              to="/manga?genre=romance"
              className="text-muted-foreground hover:text-accent transition-colors"
            >
              مانجا الرومانسية
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;

