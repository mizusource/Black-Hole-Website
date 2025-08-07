import { Link } from 'react-router-dom';
import { Mail, Shield, FileText, Users } from 'lucide-react';
import blackHoleLogo from '../assets/black_hole_logo.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { to: '/', label: 'الرئيسية', icon: null },
    { to: '/manga', label: 'المانجا', icon: null },
    { to: '/manga?type=manhwa', label: 'المانهوا', icon: null },
    { to: '/manga?genres=all', label: 'الفئات', icon: null },
  ];

  const categories = [
    { to: '/manga?genre=action', label: 'أكشن', color: 'text-red-400' },
    { to: '/manga?genre=romance', label: 'رومانسية', color: 'text-pink-400' },
    { to: '/manga?genre=fantasy', label: 'فانتازيا', color: 'text-purple-400' },
    { to: '/manga?genre=comedy', label: 'كوميديا', color: 'text-yellow-400' },
  ];

  const contactInfo = [
    { label: 'من نحن', to: '/about', icon: Users },
    { label: 'اتصل بنا', href: 'mailto:mstfybdwy633@gmail.com', icon: Mail },
    { label: 'سياسة الخصوصية', to: '/privacy', icon: Shield },
    { label: 'شروط الاستخدام', to: '/terms', icon: FileText },
  ];

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 space-x-reverse">
              <img src={blackHoleLogo} alt="Black-Hole" className="w-10 h-10" />
              <span className="text-2xl font-bold neon-text">Black-Hole</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              هو موقعك الأول Black-Hole موقع
              <br />
              لقراءة المانجا والمانهوا المترجمة
              <br />
              بأعلى جودة
            </p>
            <div className="flex space-x-2 space-x-reverse">
              <div className="w-3 h-3 bg-accent rounded-full pulse-glow"></div>
              <div className="w-3 h-3 bg-primary rounded-full pulse-glow" style={{ animationDelay: '0.5s' }}></div>
              <div className="w-3 h-3 bg-secondary rounded-full pulse-glow" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-accent">روابط سريعة</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-muted-foreground hover:text-accent transition-colors text-sm flex items-center space-x-2 space-x-reverse"
                  >
                    <span className="w-1 h-1 bg-accent rounded-full"></span>
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-accent">الفئات الشائعة</h3>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.to}>
                  <Link
                    to={category.to}
                    className={`${category.color} hover:text-accent transition-colors text-sm flex items-center space-x-2 space-x-reverse`}
                  >
                    <span className={`w-1 h-1 ${category.color.replace('text-', 'bg-')} rounded-full`}></span>
                    <span>{category.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-accent">تواصل معنا</h3>
            <ul className="space-y-3">
              {contactInfo.map((item) => {
                const Icon = item.icon;
                const Component = item.to ? Link : 'a';
                const props = item.to ? { to: item.to } : { href: item.href };

                return (
                  <li key={item.label}>
                    <Component
                      {...props}
                      className="text-muted-foreground hover:text-accent transition-colors text-sm flex items-center space-x-2 space-x-reverse"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Component>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-muted-foreground text-sm">
              © {currentYear} Black-Hole. جميع الحقوق محفوظة.
            </p>
            <div className="flex items-center space-x-4 space-x-reverse text-sm text-muted-foreground">
              <span>صُنع بـ</span>
              <span className="text-accent">❤️</span>
              <span>للمانجا والمانهوا</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

