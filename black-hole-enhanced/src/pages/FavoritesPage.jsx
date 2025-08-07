import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Heart, Star, BookOpen, Clock, Grid, List, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { mangaAPI } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate } from '../lib/auth';

// Sample data for development
const sampleFavorites = [
  {
    id: 1,
    manga: {
      id: 1,
      title: 'Attack on Titan',
      arabic_title: 'هجوم العمالقة',
      cover_image: '/src/assets/manga1.jpg',
      genre: 'أكشن، دراما',
      average_rating: 4.9,
      total_chapters: 139,
      status: 'completed',
      updated_at: new Date().toISOString(),
      description: 'قصة مثيرة عن البشر الذين يحاربون العمالقة للبقاء على قيد الحياة'
    },
    added_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    manga: {
      id: 2,
      title: 'One Piece',
      arabic_title: 'ون بيس',
      cover_image: '/src/assets/manga2.jpg',
      genre: 'مغامرات، كوميديا',
      average_rating: 4.8,
      total_chapters: 1100,
      status: 'ongoing',
      updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'مغامرات لوفي وطاقمه في البحث عن الكنز الأسطوري ون بيس'
    },
    added_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const FavoritesPage = () => {
  const { isAuthenticated } = useAuth();
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('added_at');
  const [filterStatus, setFilterStatus] = useState('');

  // Fetch favorites
  const { data: favorites, isLoading, error } = useQuery({
    queryKey: ['favorites', searchQuery, sortBy, filterStatus],
    queryFn: () => mangaAPI.getFavorites({
      search: searchQuery,
      sort_by: sortBy,
      status: filterStatus
    }),
    select: (data) => data.data.favorites || sampleFavorites,
    enabled: isAuthenticated
  });

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled by the query key change
  };

  const filteredFavorites = favorites?.filter(favorite => {
    const matchesSearch = !searchQuery || 
      favorite.manga.arabic_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      favorite.manga.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !filterStatus || favorite.manga.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const sortedFavorites = [...filteredFavorites].sort((a, b) => {
    switch (sortBy) {
      case 'added_at':
        return new Date(b.added_at) - new Date(a.added_at);
      case 'title':
        return a.manga.arabic_title.localeCompare(b.manga.arabic_title);
      case 'rating':
        return b.manga.average_rating - a.manga.average_rating;
      case 'updated_at':
        return new Date(b.manga.updated_at) - new Date(a.manga.updated_at);
      default:
        return 0;
    }
  });

  const MangaCard = ({ favorite }) => (
    <Card className="manga-card overflow-hidden group h-full">
      <div className="relative">
        <img
          src={favorite.manga.cover_image}
          alt={favorite.manga.arabic_title}
          className="w-full h-64 object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
          {favorite.manga.status === 'ongoing' ? 'مستمر' : 'مكتمل'}
        </div>
        <div className="absolute bottom-2 left-2 flex items-center space-x-1 space-x-reverse bg-black/70 text-white px-2 py-1 rounded text-xs">
          <Star className="h-3 w-3 star-rating" />
          <span>{favorite.manga.average_rating}</span>
        </div>
        <div className="absolute top-2 left-2 bg-red-500/90 text-white p-1 rounded-full">
          <Heart className="h-3 w-3 fill-current" />
        </div>
      </div>
      <CardContent className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-lg mb-1 line-clamp-2">{favorite.manga.arabic_title}</h3>
        <p className="text-sm text-muted-foreground mb-2 line-clamp-1">{favorite.manga.title}</p>
        <p className="text-xs text-accent mb-3">{favorite.manga.genre}</p>
        
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">
          {favorite.manga.description}
        </p>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center space-x-1 space-x-reverse">
              <BookOpen className="h-3 w-3" />
              <span>{favorite.manga.total_chapters} فصل</span>
            </span>
            <span className="flex items-center space-x-1 space-x-reverse">
              <Clock className="h-3 w-3" />
              <span>{formatDate(favorite.manga.updated_at)}</span>
            </span>
          </div>
          
          <div className="text-xs text-muted-foreground">
            أُضيف للمفضلة: {formatDate(favorite.added_at)}
          </div>
          
          <Button asChild size="sm" className="w-full">
            <Link to={`/manga/${favorite.manga.id}`}>
              قراءة الآن
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const MangaListItem = ({ favorite }) => (
    <Card className="manga-card overflow-hidden group">
      <div className="flex">
        <div className="relative w-24 h-32 flex-shrink-0">
          <img
            src={favorite.manga.cover_image}
            alt={favorite.manga.arabic_title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-1 right-1 bg-black/70 text-white px-1 py-0.5 rounded text-xs">
            {favorite.manga.status === 'ongoing' ? 'مستمر' : 'مكتمل'}
          </div>
          <div className="absolute top-1 left-1 bg-red-500/90 text-white p-1 rounded-full">
            <Heart className="h-2 w-2 fill-current" />
          </div>
        </div>
        <CardContent className="flex-1 p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1 line-clamp-1">{favorite.manga.arabic_title}</h3>
              <p className="text-sm text-muted-foreground mb-2 line-clamp-1">{favorite.manga.title}</p>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{favorite.manga.description}</p>
            </div>
            <div className="flex items-center space-x-1 space-x-reverse ml-4">
              <Star className="h-4 w-4 star-rating" />
              <span className="font-medium">{favorite.manga.average_rating}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse text-sm text-muted-foreground">
              <span className="flex items-center space-x-1 space-x-reverse">
                <BookOpen className="h-4 w-4" />
                <span>{favorite.manga.total_chapters} فصل</span>
              </span>
              <span className="flex items-center space-x-1 space-x-reverse">
                <Clock className="h-4 w-4" />
                <span>{formatDate(favorite.manga.updated_at)}</span>
              </span>
              <Badge variant="secondary">{favorite.manga.genre}</Badge>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <span className="text-xs text-muted-foreground">
                أُضيف: {formatDate(favorite.added_at)}
              </span>
              <Button asChild size="sm">
                <Link to={`/manga/${favorite.manga.id}`}>
                  قراءة
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h1 className="text-2xl font-bold mb-4">المفضلة</h1>
          <p className="text-muted-foreground mb-6">
            يجب تسجيل الدخول لعرض المانجا المفضلة
          </p>
          <Button asChild>
            <Link to="/login">تسجيل الدخول</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 space-x-reverse mb-4">
          <Heart className="h-8 w-8 text-accent" />
          <h1 className="text-3xl font-bold neon-text">المانجا المفضلة</h1>
        </div>
        <p className="text-muted-foreground">
          جميع المانجا التي أضفتها إلى قائمة المفضلة
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="ابحث في المفضلة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
        </form>

        {/* Filters and View Mode */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="ترتيب حسب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="added_at">تاريخ الإضافة</SelectItem>
                  <SelectItem value="title">الاسم</SelectItem>
                  <SelectItem value="rating">التقييم</SelectItem>
                  <SelectItem value="updated_at">آخر تحديث</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">جميع الحالات</SelectItem>
                <SelectItem value="ongoing">مستمر</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            عرض {sortedFavorites.length} من أصل {favorites?.length || 0} مانجا مفضلة
          </p>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-destructive">حدث خطأ في تحميل البيانات</p>
          <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
            إعادة المحاولة
          </Button>
        </div>
      ) : sortedFavorites.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h2 className="text-xl font-semibold mb-2">
            {searchQuery || filterStatus ? 'لا توجد نتائج مطابقة' : 'لا توجد مانجا مفضلة'}
          </h2>
          <p className="text-muted-foreground mb-6">
            {searchQuery || filterStatus 
              ? 'جرب تغيير معايير البحث أو الفلترة'
              : 'ابدأ بإضافة المانجا التي تحبها إلى المفضلة'
            }
          </p>
          {!searchQuery && !filterStatus && (
            <Button asChild>
              <Link to="/manga">تصفح المانجا</Link>
            </Button>
          )}
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedFavorites.map((favorite) => (
                <MangaCard key={favorite.id} favorite={favorite} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedFavorites.map((favorite) => (
                <MangaListItem key={favorite.id} favorite={favorite} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FavoritesPage;

