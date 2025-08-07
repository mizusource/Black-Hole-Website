import React, { useState } from 'react';
import { Search, Star, Clock, BookOpen, Menu, X } from 'lucide-react';
import './App.css';

// Import assets
import logoImage from './assets/black_hole_logo.png';
import heroBackground from './assets/hero_background.jpg';
import manga1 from './assets/manga1.jpg';
import manga2 from './assets/manga2.jpg';
import manga3 from './assets/manga3.jpg';
import manga4 from './assets/manga4.jpg';

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Sample manga data
  const mangaList = [
    {
      id: 1,
      title: "Attack on Titan",
      arabicTitle: "هجوم العمالقة",
      image: manga1,
      latestChapter: 139,
      rating: 4.9,
      lastUpdate: "منذ يوم واحد",
      genre: "أكشن، دراما"
    },
    {
      id: 2,
      title: "One Piece",
      arabicTitle: "ون بيس",
      image: manga2,
      latestChapter: 1100,
      rating: 4.8,
      lastUpdate: "منذ 3 أيام",
      genre: "مغامرات، كوميديا"
    },
    {
      id: 3,
      title: "Jujutsu Kaisen",
      arabicTitle: "جوجوتسو كايسن",
      image: manga3,
      latestChapter: 245,
      rating: 4.7,
      lastUpdate: "منذ أسبوع",
      genre: "خارق للطبيعة، أكشن"
    },
    {
      id: 4,
      title: "Solo Leveling",
      arabicTitle: "الارتقاء المنفرد",
      image: manga4,
      latestChapter: 200,
      rating: 4.9,
      lastUpdate: "منذ يومين",
      genre: "فانتازيا، أكشن"
    },
    {
      id: 5,
      title: "Demon Slayer",
      arabicTitle: "قاتل الشياطين",
      image: manga1,
      latestChapter: 205,
      rating: 4.6,
      lastUpdate: "منذ 5 أيام",
      genre: "أكشن، خارق للطبيعة"
    },
    {
      id: 6,
      title: "My Hero Academia",
      arabicTitle: "أكاديمية الأبطال",
      image: manga2,
      latestChapter: 410,
      rating: 4.5,
      lastUpdate: "منذ أسبوع",
      genre: "أبطال خارقون، مدرسة"
    },
    {
      id: 7,
      title: "Tower of God",
      arabicTitle: "برج الإله",
      image: manga3,
      latestChapter: 600,
      rating: 4.4,
      lastUpdate: "منذ 3 أيام",
      genre: "مغامرات، غموض"
    },
    {
      id: 8,
      title: "The Beginning After The End",
      arabicTitle: "البداية بعد النهاية",
      image: manga4,
      latestChapter: 180,
      rating: 4.8,
      lastUpdate: "منذ يوم واحد",
      genre: "فانتازيا، إعادة ميلاد"
    }
  ];

  const filteredManga = mangaList.filter(manga =>
    manga.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    manga.arabicTitle.includes(searchQuery)
  );

  const MangaCard = ({ manga }) => (
    <div className="manga-card rounded-lg overflow-hidden cursor-pointer group">
      <div className="relative">
        <img
          src={manga.image}
          alt={manga.title}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 chapter-badge px-2 py-1 rounded-full text-xs">
          الفصل {manga.latestChapter}
        </div>
        <div className="absolute top-2 left-2 flex items-center bg-black/70 px-2 py-1 rounded-full text-xs">
          <Star className="w-3 h-3 text-yellow-400 mr-1" fill="currentColor" />
          {manga.rating}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1 text-white group-hover:text-accent transition-colors">
          {manga.arabicTitle}
        </h3>
        <p className="text-sm text-muted-foreground mb-2">{manga.title}</p>
        <p className="text-xs text-muted-foreground mb-2">{manga.genre}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {manga.lastUpdate}
          </div>
          <div className="flex items-center">
            <BookOpen className="w-3 h-3 mr-1" />
            {manga.latestChapter} فصل
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <img src={logoImage} alt="Black-Hole" className="h-12 w-auto" />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-foreground hover:text-accent transition-colors">الرئيسية</a>
              <a href="#" className="text-foreground hover:text-accent transition-colors">المانجا</a>
              <a href="#" className="text-foreground hover:text-accent transition-colors">المانهوا</a>
              <a href="#" className="text-foreground hover:text-accent transition-colors">الأحدث</a>
              <a href="#" className="text-foreground hover:text-accent transition-colors">الأكثر شعبية</a>
              <a href="#" className="text-foreground hover:text-accent transition-colors">الفئات</a>
            </nav>

            {/* Search Bar */}
            <div className="hidden md:flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="ابحث عن المانجا..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-glow bg-input border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                />
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-foreground"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-border pt-4">
              <div className="flex flex-col space-y-4">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type="text"
                    placeholder="ابحث عن المانجا..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-glow bg-input border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all w-full"
                  />
                </div>
                <a href="#" className="text-foreground hover:text-accent transition-colors">الرئيسية</a>
                <a href="#" className="text-foreground hover:text-accent transition-colors">المانجا</a>
                <a href="#" className="text-foreground hover:text-accent transition-colors">المانهوا</a>
                <a href="#" className="text-foreground hover:text-accent transition-colors">الأحدث</a>
                <a href="#" className="text-foreground hover:text-accent transition-colors">الأكثر شعبية</a>
                <a href="#" className="text-foreground hover:text-accent transition-colors">الفئات</a>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-bg min-h-[60vh] flex items-center justify-center text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 glow-text">
            مرحباً بك في Black-Hole
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            اكتشف عالماً لا نهائياً من المانجا والمانهوا المترجمة بأعلى جودة
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="neon-border px-8 py-3 rounded-lg font-semibold hover:bg-primary/20 transition-all">
              ابدأ القراءة الآن
            </button>
            <button className="bg-accent text-accent-foreground px-8 py-3 rounded-lg font-semibold hover:bg-accent/90 transition-all">
              تصفح المجموعة
            </button>
          </div>
        </div>
      </section>

      {/* Featured Manga Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold glow-text">أحدث الإضافات</h2>
            <a href="#" className="text-accent hover:text-accent/80 transition-colors">
              عرض الكل ←
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredManga.slice(0, 8).map((manga) => (
              <MangaCard key={manga.id} manga={manga} />
            ))}
          </div>
        </div>
      </section>

      {/* Popular Section */}
      <section className="py-16 black-hole-gradient">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 glow-text">الأكثر شعبية هذا الأسبوع</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredManga.slice(0, 6).map((manga, index) => (
              <div key={manga.id} className="flex items-center space-x-4 bg-card/50 rounded-lg p-4 hover:bg-card/70 transition-all cursor-pointer">
                <div className="text-2xl font-bold text-accent min-w-[2rem]">
                  {index + 1}
                </div>
                <img
                  src={manga.image}
                  alt={manga.title}
                  className="w-16 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{manga.arabicTitle}</h3>
                  <p className="text-sm text-muted-foreground">{manga.title}</p>
                  <div className="flex items-center mt-1">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" />
                    <span className="text-sm">{manga.rating}</span>
                  </div>
                </div>
                <div className="chapter-badge px-3 py-1 rounded-full text-sm">
                  {manga.latestChapter}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <img src={logoImage} alt="Black-Hole" className="h-12 w-auto mb-4" />
              <p className="text-muted-foreground text-sm">
                موقع Black-Hole هو وجهتك الأولى لقراءة المانجا والمانهوا المترجمة بأعلى جودة.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">روابط سريعة</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-accent transition-colors">الرئيسية</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">المانجا</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">المانهوا</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">الفئات</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">الفئات الشائعة</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-accent transition-colors">أكشن</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">رومانسية</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">فانتازيا</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">كوميديا</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">تواصل معنا</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-accent transition-colors">من نحن</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">اتصل بنا</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">سياسة الخصوصية</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">شروط الاستخدام</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Black-Hole. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
