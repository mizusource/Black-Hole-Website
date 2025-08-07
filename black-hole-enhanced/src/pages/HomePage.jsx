import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Star, Clock, Eye, ArrowLeft, BookOpen, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { mangaAPI } from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate } from '../lib/auth';

// Sample data for development
const sampleManga = [
  {
    id: 1,
    title: 'Attack on Titan',
    arabic_title: 'هجوم العمالقة',
    cover_image: '/src/assets/manga1.jpg',
    genre: 'أكشن، دراما',
    average_rating: 4.9,
    total_chapters: 139,
    updated_at: new Date().toISOString(),
    status: 'completed'
  },
  {
    id: 2,
    title: 'One Piece',
    arabic_title: 'ون بيس',
    cover_image: '/src/assets/manga2.jpg',
    genre: 'مغامرات، كوميديا',
    average_rating: 4.8,
    total_chapters: 1100,
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'ongoing'
  },
  {
    id: 3,
    title: 'Jujutsu Kaisen',
    arabic_title: 'جوجوتسو كايسن',
    cover_image: '/src/assets/manga3.jpg',
    genre: 'خارق للطبيعة، أكشن',
    average_rating: 4.7,
    total_chapters: 245,
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'ongoing'
  },
  {
    id: 4,
    title: 'Solo Leveling',
    arabic_title: 'الارتقاء المنفرد',
    cover_image: '/src/assets/manga4.jpg',
    genre: 'فانتازيا، أكشن',
    average_rating: 4.9,
    total_chapters: 200,
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed'
  }
];

const HomePage = () => {
  const [featuredManga, setFeaturedManga] = useState(sampleManga[0]);

  // Fetch latest manga
  const { data: latestManga, isLoading: latestLoading } = useQuery({
    queryKey: ['manga', 'latest'],
    queryFn: () => mangaAPI.getList({ sort_by: 'updated_at', per_page: 8 }),
    select: (data) => data.data.manga || sampleManga,
  });

  // Fetch popular manga
  const { data: popularManga, isLoading: popularLoading } = useQuery({
    queryKey: ['manga', 'popular'],
    queryFn: () => mangaAPI.getList({ sort_by: 'rating', per_page: 6 }),
    select: (data) => data.data.manga || sampleManga.slice(0, 6),
  });

  // Rotate featured manga every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setFeaturedManga(prev => {
        const currentIndex = sampleManga.findIndex(m => m.id === prev.id);
        const nextIndex = (currentIndex + 1) % sampleManga.length;
        return sampleManga[nextIndex];
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const MangaCard = ({ manga, showChapterInfo = true }) => (
    <Card className="manga-card overflow-hidden group">
      <div className="relative">
        <img
          src={manga.cover_image}
          alt={manga.arabic_title}
          className="w-full h-64 object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
          {manga.status === 'ongoing' ? 'مستمر' : 'مكتمل'}
        </div>
        <div className="absolute bottom-2 left-2 flex items-center space-x-1 space-x-reverse bg-black/70 text-white px-2 py-1 rounded text-xs">
          <Star className="h-3 w-3 star-rating" />
          <span>{manga.average_rating}</span>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{manga.arabic_title}</h3>
        <p className="text-sm text-muted-foreground mb-2 line-clamp-1">{manga.title}</p>
        <p className="text-xs text-accent mb-3">{manga.genre}</p>
        
        {showChapterInfo && (
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
            <span className="flex items-center space-x-1 space-x-reverse">
              <BookOpen className="h-3 w-3" />
              <span>{manga.total_chapters} فصل</span>
            </span>
            <span className="flex items-center space-x-1 space-x-reverse">
              <Clock className="h-3 w-3" />
              <span>{formatDate(manga.updated_at)}</span>
            </span>
          </div>
        )}
        
        <Button asChild size="sm" className="w-full">
          <Link to={`/manga/${manga.id}`}>
            قراءة الآن
          </Link>
        </Button>
      </CardContent>
    </Card>
  );

  const PopularMangaItem = ({ manga, rank }) => (
    <div className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg hover:bg-muted/50 transition-colors group">
      <div className="flex-shrink-0 w-8 h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center font-bold text-sm">
        {rank}
      </div>
      <img
        src={manga.cover_image}
        alt={manga.arabic_title}
        className="w-12 h-16 object-cover rounded"
      />
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm line-clamp-1 group-hover:text-accent transition-colors">
          {manga.arabic_title}
        </h4>
        <p className="text-xs text-muted-foreground line-clamp-1">{manga.title}</p>
        <div className="flex items-center space-x-2 space-x-reverse mt-1">
          <div className="flex items-center space-x-1 space-x-reverse">
            <Star className="h-3 w-3 star-rating" />
            <span className="text-xs">{manga.average_rating}</span>
          </div>
          <span className="text-xs text-muted-foreground">{manga.total_chapters}</span>
        </div>
      </div>
      <Button asChild size="sm" variant="ghost">
        <Link to={`/manga/${manga.id}`}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-background relative py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 neon-text fade-in">
              مرحباً بك في Black-Hole
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 fade-in">
              اكتشف عالماً لا نهائياً من المانجا والمانهوا المترجمة بأعلى جودة
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center fade-in">
              <Button size="lg" className="neon-glow" asChild>
                <Link to="/manga">
                  <BookOpen className="ml-2 h-5 w-5" />
                  ابدأ القراءة الآن
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/manga?sort=popular">
                  <TrendingUp className="ml-2 h-5 w-5" />
                  تصفح المجموعة
                </Link>
              </Button>
            </div>
          </div>

          {/* Featured Manga */}
          <div className="mt-16 max-w-md mx-auto">
            <Card className="manga-card overflow-hidden">
              <div className="relative">
                <img
                  src={featuredManga.cover_image}
                  alt={featuredManga.arabic_title}
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-xl font-bold mb-2">{featuredManga.arabic_title}</h3>
                  <p className="text-sm opacity-90 mb-3">{featuredManga.genre}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Star className="h-4 w-4 star-rating" />
                      <span>{featuredManga.average_rating}</span>
                    </div>
                    <span className="text-sm">{featuredManga.total_chapters} فصل</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Latest Updates */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">أحدث الإضافات</h2>
            <Button variant="outline" asChild>
              <Link to="/manga?sort=latest">
                عرض الكل
                <ArrowLeft className="mr-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {latestLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(latestManga || sampleManga).map((manga) => (
                <MangaCard key={manga.id} manga={manga} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Popular This Week */}
      <section className="py-16 px-4 bg-card/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">الأكثر شعبية هذا الأسبوع</h2>

          {popularLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <div className="space-y-2">
                {(popularManga || sampleManga.slice(0, 6)).map((manga, index) => (
                  <PopularMangaItem key={manga.id} manga={manga} rank={index + 1} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;

