import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Grid, List, Star, Clock, BookOpen, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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
    status: 'completed',
    description: 'قصة مثيرة عن البشر الذين يحاربون العمالقة للبقاء على قيد الحياة'
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
    status: 'ongoing',
    description: 'مغامرات لوفي وطاقمه في البحث عن الكنز الأسطوري ون بيس'
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
    status: 'ongoing',
    description: 'عالم السحرة ومحاربة اللعنات في مدرسة طوكيو للسحر'
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
    status: 'completed',
    description: 'رحلة صياد ضعيف ليصبح أقوى صياد في العالم'
  }
];

const genres = [
  'أكشن', 'مغامرات', 'كوميديا', 'دراما', 'فانتازيا', 'رومانسية', 
  'خارق للطبيعة', 'رياضة', 'مدرسي', 'تاريخي', 'رعب', 'غموض'
];

const MangaListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // Get current filters from URL
  const currentSearch = searchParams.get('search') || '';
  const currentGenre = searchParams.get('genre') || '';
  const currentStatus = searchParams.get('status') || '';
  const currentSort = searchParams.get('sort') || 'updated_at';
  const currentPage = parseInt(searchParams.get('page') || '1');

  // Local state for form inputs
  const [searchInput, setSearchInput] = useState(currentSearch);

  // Fetch manga list
  const { data, isLoading, error } = useQuery({
    queryKey: ['manga', 'list', currentSearch, currentGenre, currentStatus, currentSort, currentPage],
    queryFn: () => mangaAPI.getList({
      search: currentSearch,
      genre: currentGenre,
      status: currentStatus,
      sort_by: currentSort,
      page: currentPage,
      per_page: 20
    }),
    select: (data) => data.data || { manga: sampleManga, pagination: { total: 4, pages: 1 } },
  });

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.delete('page'); // Reset to first page when filtering
    setSearchParams(newParams);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateFilter('search', searchInput);
  };

  const clearFilters = () => {
    setSearchParams({});
    setSearchInput('');
  };

  const MangaCard = ({ manga }) => (
    <Card className="manga-card overflow-hidden group h-full">
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
      <CardContent className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-lg mb-1 line-clamp-2">{manga.arabic_title}</h3>
        <p className="text-sm text-muted-foreground mb-2 line-clamp-1">{manga.title}</p>
        <p className="text-xs text-accent mb-3">{manga.genre}</p>
        
        {viewMode === 'grid' && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">
            {manga.description}
          </p>
        )}
        
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
        
        <Button asChild size="sm" className="w-full mt-auto">
          <Link to={`/manga/${manga.id}`}>
            قراءة الآن
          </Link>
        </Button>
      </CardContent>
    </Card>
  );

  const MangaListItem = ({ manga }) => (
    <Card className="manga-card overflow-hidden group">
      <div className="flex">
        <div className="relative w-24 h-32 flex-shrink-0">
          <img
            src={manga.cover_image}
            alt={manga.arabic_title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-1 right-1 bg-black/70 text-white px-1 py-0.5 rounded text-xs">
            {manga.status === 'ongoing' ? 'مستمر' : 'مكتمل'}
          </div>
        </div>
        <CardContent className="flex-1 p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1 line-clamp-1">{manga.arabic_title}</h3>
              <p className="text-sm text-muted-foreground mb-2 line-clamp-1">{manga.title}</p>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{manga.description}</p>
            </div>
            <div className="flex items-center space-x-1 space-x-reverse ml-4">
              <Star className="h-4 w-4 star-rating" />
              <span className="font-medium">{manga.average_rating}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse text-sm text-muted-foreground">
              <span className="flex items-center space-x-1 space-x-reverse">
                <BookOpen className="h-4 w-4" />
                <span>{manga.total_chapters} فصل</span>
              </span>
              <span className="flex items-center space-x-1 space-x-reverse">
                <Clock className="h-4 w-4" />
                <span>{formatDate(manga.updated_at)}</span>
              </span>
              <Badge variant="secondary">{manga.genre}</Badge>
            </div>
            <Button asChild size="sm">
              <Link to={`/manga/${manga.id}`}>
                قراءة
              </Link>
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 neon-text">مكتبة المانجا والمانهوا</h1>
        <p className="text-muted-foreground">
          اكتشف مجموعة واسعة من المانجا والمانهوا المترجمة بأعلى جودة
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
              placeholder="ابحث عن المانجا أو المانهوا..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pr-10"
            />
          </div>
          <Button type="submit">بحث</Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 ml-2" />
            فلترة
            <ChevronDown className={`h-4 w-4 mr-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
        </form>

        {/* Filters */}
        {showFilters && (
          <div className="p-4 rounded-lg glass-effect space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">النوع</label>
                <Select value={currentGenre} onValueChange={(value) => updateFilter('genre', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر النوع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">جميع الأنواع</SelectItem>
                    {genres.map((genre) => (
                      <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">الحالة</label>
                <Select value={currentStatus} onValueChange={(value) => updateFilter('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">جميع الحالات</SelectItem>
                    <SelectItem value="ongoing">مستمر</SelectItem>
                    <SelectItem value="completed">مكتمل</SelectItem>
                    <SelectItem value="hiatus">متوقف مؤقتاً</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">ترتيب حسب</label>
                <Select value={currentSort} onValueChange={(value) => updateFilter('sort', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الترتيب" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="updated_at">آخر تحديث</SelectItem>
                    <SelectItem value="rating">التقييم</SelectItem>
                    <SelectItem value="title">الاسم</SelectItem>
                    <SelectItem value="created_at">تاريخ الإضافة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                مسح الفلاتر
              </Button>
            </div>
          </div>
        )}

        {/* View Mode and Results Info */}
        <div className="flex items-center justify-between">
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

          {data && (
            <p className="text-sm text-muted-foreground">
              عرض {data.manga?.length || 0} من أصل {data.pagination?.total || 0} نتيجة
            </p>
          )}
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
      ) : data?.manga?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg mb-4">لا توجد نتائج مطابقة للبحث</p>
          <Button variant="outline" onClick={clearFilters}>
            مسح الفلاتر
          </Button>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {(data?.manga || sampleManga).map((manga) => (
                <MangaCard key={manga.id} manga={manga} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {(data?.manga || sampleManga).map((manga) => (
                <MangaListItem key={manga.id} manga={manga} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {data?.pagination && data.pagination.pages > 1 && (
            <div className="flex justify-center mt-12">
              <div className="flex items-center space-x-2 space-x-reverse">
                {Array.from({ length: Math.min(data.pagination.pages, 5) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateFilter('page', page.toString())}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MangaListPage;

