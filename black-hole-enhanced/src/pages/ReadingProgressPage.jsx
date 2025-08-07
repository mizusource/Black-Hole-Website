import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Clock, Star, Search, Filter, Grid, List, Play, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { mangaAPI } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate } from '../lib/auth';

// Sample data for development
const sampleProgress = [
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
      description: 'قصة مثيرة عن البشر الذين يحاربون العمالقة للبقاء على قيد الحياة'
    },
    last_chapter_read: 45,
    last_chapter_id: 45,
    updated_at: new Date().toISOString(),
    started_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
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
      description: 'مغامرات لوفي وطاقمه في البحث عن الكنز الأسطوري ون بيس'
    },
    last_chapter_read: 1050,
    last_chapter_id: 1050,
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    started_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const ReadingProgressPage = () => {
  const { isAuthenticated } = useAuth();
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('updated_at');
  const [filterStatus, setFilterStatus] = useState('');

  // Fetch reading progress
  const { data: readingProgress, isLoading, error } = useQuery({
    queryKey: ['reading-progress', searchQuery, sortBy, filterStatus],
    queryFn: () => mangaAPI.getReadingProgress({
      search: searchQuery,
      sort_by: sortBy,
      status: filterStatus
    }),
    select: (data) => data.data.reading_progress || sampleProgress,
    enabled: isAuthenticated
  });

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled by the query key change
  };

  const filteredProgress = readingProgress?.filter(progress => {
    const matchesSearch = !searchQuery || 
      progress.manga.arabic_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      progress.manga.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !filterStatus || progress.manga.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const sortedProgress = [...filteredProgress].sort((a, b) => {
    switch (sortBy) {
      case 'updated_at':
        return new Date(b.updated_at) - new Date(a.updated_at);
      case 'title':
        return a.manga.arabic_title.localeCompare(b.manga.arabic_title);
      case 'progress':
        const progressA = (a.last_chapter_read / a.manga.total_chapters) * 100;
        const progressB = (b.last_chapter_read / b.manga.total_chapters) * 100;
        return progressB - progressA;
      case 'started_at':
        return new Date(b.started_at) - new Date(a.started_at);
      default:
        return 0;
    }
  });

  const getProgressPercentage = (progress) => {
    return Math.round((progress.last_chapter_read / progress.manga.total_chapters) * 100);
  };

  const getProgressStatus = (progress) => {
    const percentage = getProgressPercentage(progress);
    if (percentage === 100) return { text: 'مكتمل', color: 'text-green-500', icon: CheckCircle };
    if (percentage >= 75) return { text: 'قريب من الانتهاء', color: 'text-blue-500', icon: Play };
    if (percentage >= 25) return { text: 'في المنتصف', color: 'text-yellow-500', icon: Play };
    return { text: 'بداية القراءة', color: 'text-gray-500', icon: Play };
  };

  const MangaCard = ({ progress }) => {
    const percentage = getProgressPercentage(progress);
    const status = getProgressStatus(progress);
    const StatusIcon = status.icon;

    return (
      <Card className="manga-card overflow-hidden group h-full">
        <div className="relative">
          <img
            src={progress.manga.cover_image}
            alt={progress.manga.arabic_title}
            className="w-full h-64 object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
            {progress.manga.status === 'ongoing' ? 'مستمر' : 'مكتمل'}
          </div>
          <div className="absolute bottom-2 left-2 flex items-center space-x-1 space-x-reverse bg-black/70 text-white px-2 py-1 rounded text-xs">
            <Star className="h-3 w-3 star-rating" />
            <span>{progress.manga.average_rating}</span>
          </div>
          <div className="absolute top-2 left-2 bg-accent/90 text-accent-foreground p-1 rounded-full">
            <StatusIcon className="h-3 w-3" />
          </div>
        </div>
        <CardContent className="p-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-lg mb-1 line-clamp-2">{progress.manga.arabic_title}</h3>
          <p className="text-sm text-muted-foreground mb-2 line-clamp-1">{progress.manga.title}</p>
          <p className="text-xs text-accent mb-3">{progress.manga.genre}</p>
          
          <div className="space-y-3 flex-1">
            {/* Progress Info */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>التقدم</span>
                <span className={`font-medium ${status.color}`}>
                  {percentage}%
                </span>
              </div>
              <Progress value={percentage} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>الفصل {progress.last_chapter_read}</span>
                <span>من {progress.manga.total_chapters}</span>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              آخر قراءة: {formatDate(progress.updated_at)}
            </div>
          </div>
          
          <div className="space-y-2 mt-4">
            <Button asChild size="sm" className="w-full">
              <Link to={`/manga/${progress.manga.id}/chapter/${progress.last_chapter_id + 1}`}>
                <Play className="h-4 w-4 ml-2" />
                متابعة القراءة
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link to={`/manga/${progress.manga.id}`}>
                تفاصيل المانجا
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const MangaListItem = ({ progress }) => {
    const percentage = getProgressPercentage(progress);
    const status = getProgressStatus(progress);
    const StatusIcon = status.icon;

    return (
      <Card className="manga-card overflow-hidden group">
        <div className="flex">
          <div className="relative w-24 h-32 flex-shrink-0">
            <img
              src={progress.manga.cover_image}
              alt={progress.manga.arabic_title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-1 right-1 bg-black/70 text-white px-1 py-0.5 rounded text-xs">
              {progress.manga.status === 'ongoing' ? 'مستمر' : 'مكتمل'}
            </div>
            <div className="absolute top-1 left-1 bg-accent/90 text-accent-foreground p-1 rounded-full">
              <StatusIcon className="h-2 w-2" />
            </div>
          </div>
          <CardContent className="flex-1 p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1 line-clamp-1">{progress.manga.arabic_title}</h3>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-1">{progress.manga.title}</p>
                <div className="flex items-center space-x-2 space-x-reverse mb-2">
                  <Badge variant="secondary">{progress.manga.genre}</Badge>
                  <span className={`text-sm font-medium ${status.color}`}>
                    {status.text}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-1 space-x-reverse ml-4">
                <Star className="h-4 w-4 star-rating" />
                <span className="font-medium">{progress.manga.average_rating}</span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span>الفصل {progress.last_chapter_read} من {progress.manga.total_chapters}</span>
                <span className="font-medium">{percentage}%</span>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                آخر قراءة: {formatDate(progress.updated_at)}
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Button asChild size="sm">
                  <Link to={`/manga/${progress.manga.id}/chapter/${progress.last_chapter_id + 1}`}>
                    <Play className="h-4 w-4 ml-2" />
                    متابعة
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to={`/manga/${progress.manga.id}`}>
                    تفاصيل
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h1 className="text-2xl font-bold mb-4">تقدم القراءة</h1>
          <p className="text-muted-foreground mb-6">
            يجب تسجيل الدخول لعرض تقدم القراءة
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
          <BookOpen className="h-8 w-8 text-accent" />
          <h1 className="text-3xl font-bold neon-text">تقدم القراءة</h1>
        </div>
        <p className="text-muted-foreground">
          تتبع تقدمك في قراءة المانجا والمانهوا
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="h-8 w-8 mx-auto mb-2 text-accent" />
            <p className="text-2xl font-bold">{readingProgress?.length || 0}</p>
            <p className="text-sm text-muted-foreground">قيد القراءة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">
              {readingProgress?.filter(p => getProgressPercentage(p) === 100).length || 0}
            </p>
            <p className="text-sm text-muted-foreground">مكتملة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Play className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">
              {readingProgress?.filter(p => getProgressPercentage(p) < 100).length || 0}
            </p>
            <p className="text-sm text-muted-foreground">في التقدم</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <p className="text-2xl font-bold">
              {readingProgress?.reduce((total, p) => total + p.last_chapter_read, 0) || 0}
            </p>
            <p className="text-sm text-muted-foreground">فصول مقروءة</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="ابحث في قائمة القراءة..."
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
                  <SelectItem value="updated_at">آخر قراءة</SelectItem>
                  <SelectItem value="title">الاسم</SelectItem>
                  <SelectItem value="progress">التقدم</SelectItem>
                  <SelectItem value="started_at">تاريخ البداية</SelectItem>
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
            عرض {sortedProgress.length} من أصل {readingProgress?.length || 0} مانجا
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
      ) : sortedProgress.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h2 className="text-xl font-semibold mb-2">
            {searchQuery || filterStatus ? 'لا توجد نتائج مطابقة' : 'لا توجد مانجا قيد القراءة'}
          </h2>
          <p className="text-muted-foreground mb-6">
            {searchQuery || filterStatus 
              ? 'جرب تغيير معايير البحث أو الفلترة'
              : 'ابدأ بقراءة مانجا جديدة لتتبع تقدمك'
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
              {sortedProgress.map((progress) => (
                <MangaCard key={progress.id} progress={progress} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedProgress.map((progress) => (
                <MangaListItem key={progress.id} progress={progress} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReadingProgressPage;

