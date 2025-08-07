import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, User, LogOut, Settings, Heart, BookOpen, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '../hooks/useAuth';
import { getUserBadge } from '../lib/auth';
import blackHoleLogo from '../assets/black_hole_logo.png';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout, isAuthenticated, isAdmin, isModerator } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/manga?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'الرئيسية' },
    { to: '/manga', label: 'المانجا' },
    { to: '/manga?type=manhwa', label: 'المانهوا' },
    { to: '/manga?sort=latest', label: 'الأحدث' },
    { to: '/manga?sort=popular', label: 'الأكثر شعبية' },
    { to: '/manga?genres=all', label: 'الفئات' },
  ];

  const userBadge = getUserBadge(user);

  return (
    <nav className="glass-effect sticky top-0 z-50 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 space-x-reverse">
            <img src={blackHoleLogo} alt="Black-Hole" className="w-8 h-8" />
            <span className="text-xl font-bold neon-text">Black-Hole</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 space-x-reverse">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors hover:text-accent ${
                  location.pathname === link.to ? 'text-accent' : 'text-muted-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center space-x-2 space-x-reverse">
            <div className="relative">
              <Input
                type="text"
                placeholder="ابحث عن المانجا..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pr-10"
              />
              <Button
                type="submit"
                size="sm"
                variant="ghost"
                className="absolute left-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4 space-x-reverse">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4 space-x-reverse">
                {/* User Profile */}
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 space-x-reverse hover:text-accent transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">{user?.username}</span>
                    {userBadge && (
                      <span className={userBadge.className}>{userBadge.text}</span>
                    )}
                  </Link>
                </div>

                {/* Quick Links */}
                <Link to="/favorites" className="text-muted-foreground hover:text-accent transition-colors">
                  <Heart className="h-5 w-5" />
                </Link>
                <Link to="/reading-progress" className="text-muted-foreground hover:text-accent transition-colors">
                  <BookOpen className="h-5 w-5" />
                </Link>
                {(isAdmin || isModerator) && (
                  <Link to="/admin" className="text-muted-foreground hover:text-accent transition-colors">
                    <Shield className="h-5 w-5" />
                  </Link>
                )}

                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 ml-2" />
                  خروج
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 space-x-reverse">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">دخول</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register">تسجيل</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border slide-in-right">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="ابحث عن المانجا..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-10"
                />
                <Button
                  type="submit"
                  size="sm"
                  variant="ghost"
                  className="absolute left-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>

            {/* Mobile Navigation Links */}
            <div className="space-y-2 mb-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block py-2 px-4 rounded-md transition-colors ${
                    location.pathname === link.to
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Mobile User Menu */}
            {isAuthenticated ? (
              <div className="space-y-2 pt-4 border-t border-border">
                <Link
                  to="/profile"
                  className="flex items-center space-x-3 space-x-reverse py-2 px-4 rounded-md hover:bg-muted transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-5 w-5" />
                  <span>{user?.username}</span>
                  {userBadge && (
                    <span className={userBadge.className}>{userBadge.text}</span>
                  )}
                </Link>
                <Link
                  to="/favorites"
                  className="flex items-center space-x-3 space-x-reverse py-2 px-4 rounded-md hover:bg-muted transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Heart className="h-5 w-5" />
                  <span>المفضلة</span>
                </Link>
                <Link
                  to="/reading-progress"
                  className="flex items-center space-x-3 space-x-reverse py-2 px-4 rounded-md hover:bg-muted transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <BookOpen className="h-5 w-5" />
                  <span>تقدم القراءة</span>
                </Link>
                {(isAdmin || isModerator) && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-3 space-x-reverse py-2 px-4 rounded-md hover:bg-muted transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Shield className="h-5 w-5" />
                    <span>لوحة الإدارة</span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 space-x-reverse py-2 px-4 rounded-md hover:bg-muted transition-colors w-full text-right"
                >
                  <LogOut className="h-5 w-5" />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2 pt-4 border-t border-border">
                <Link
                  to="/login"
                  className="block py-2 px-4 rounded-md hover:bg-muted transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  تسجيل الدخول
                </Link>
                <Link
                  to="/register"
                  className="block py-2 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  إنشاء حساب
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

