import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Heart, BookOpen, Clock, User, MessageCircle, ThumbsUp, Share2, Eye, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mangaAPI } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, getUserBadge } from '../lib/auth';
import toast from 'react-hot-toast';

// Sample data for development
const sampleManga = {
  id: 1,
  title: 'Attack on Titan',
  arabic_title: 'هجوم العمالقة',
  cover_image: '/src/assets/manga1.jpg',
  genre: 'أكشن، دراما، فانتازيا',
  average_rating: 4.9,
  total_chapters: 139,
  updated_at: new Date().toISOString(),
  status: 'completed',
  author: 'Hajime Isayama',
  artist: 'Hajime Isayama',
  description: 'في عالم حيث تهدد العمالقة الآكلة للبشر بقاء البشرية، يعيش الناس خلف أسوار عملاقة. عندما يظهر عملاق ضخم ويدمر الجدار الخارجي، يبدأ إيرين ييغر رحلة انتقامه ضد العمالقة. قصة مليئة بالإثارة والغموض والصراع من أجل البقاء.',
  chapters: [
    { id: 1, chapter_number: 1, title: 'إلى أنت، بعد 2000 عام', updated_at: new Date().toISOString() },
    { id: 2, chapter_number: 2, title: 'في ذلك اليوم', updated_at: new Date().toISOString() },
    { id: 3, chapter_number: 3, title: 'ليلة التخرج', updated_at: new Date().toISOString() }
  ],
  reviews: [
    {
      id: 1,
      user: { id: 1, username: 'أحمد_المانجا', is_verified: true },
      rating: 5,
      content: 'واحدة من أفضل المانجا على الإطلاق! القصة مذهلة والرسم رائع. أنصح الجميع بقراءتها.',
      created_at: new Date().toISOString(),
      likes: 15
    },
    {
      id: 2,
      user: { id: 2, username: 'فاطمة_الأوتاكو', is_moderator: true },
      rating: 4,
      content: 'قصة معقدة ومثيرة، لكن النهاية كانت مثيرة للجدل. بشكل عام تجربة رائعة.',
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      likes: 8
    }
  ],
  is_favorite: false,
  user_rating: null,
  reading_progress: null
};

const MangaDetailsPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Fetch manga details
  const { data: manga, isLoading } = useQuery({
    queryKey: ['manga', id],
    queryFn: () => mangaAPI.getDetails(id),
    select: (data) => data.data.manga || sampleManga,
  });

  // Rate manga mutation
  const rateMutation = useMutation({
    mutationFn: (rating) => mangaAPI.rateManga(id, rating),
    onSuccess: () => {
      queryClient.invalidateQueries(['manga', id]);
      toast.success('تم تقييم المانجا بنجاح');
    },
    onError: () => {
      toast.error('حدث خطأ في التقييم');
    }
  });

  // Add to favorites mutation
  const favoriteMutation = useMutation({
    mutationFn: () => mangaAPI.toggleFavorite(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['manga', id]);
      toast.success(manga?.is_favorite ? 'تم إزالة المانجا من المفضلة' : 'تم إضافة المانجا للمفضلة');
    },
    onError: () => {
      toast.error('حدث خطأ في إضافة المفضلة');
    }
  });

  // Add review mutation
  const reviewMutation = useMutation({
    mutationFn: (reviewData) => mangaAPI.addReview(id, reviewData),
    onSuccess: () => {
      queryClient.invalidateQueries(['manga', id]);
      setReviewText('');
      setReviewRating(5);
      setShowReviewForm(false);
      toast.success('تم إضافة المراجعة بنجاح');
    },
    onError: () => {
      toast.error('حدث خطأ في إضافة المراجعة');
    }
  });

  const handleRate = (rating) => {
    if (!isAuthenticated) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }
    rateMutation.mutate(rating);
  };

  const handleFavorite = () => {
    if (!isAuthenticated) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }
    favoriteMutation.mutate();
  };

  const handleSubmitReview = () => {
    if (!reviewText.trim()) {
      toast.error('يرجى كتابة مراجعة');
      return;
    }
    reviewMutation.mutate({
      content: reviewText,
      rating: reviewRating
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: manga?.arabic_title,
        text: manga?.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('تم نسخ الرابط');
    }
  };

  const StarRating = ({ rating, onRate, readonly = false }) => {
    return (
      <div className="flex items-center space-x-1 space-x-reverse">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => !readonly && onRate && onRate(star)}
            disabled={readonly}
            className={`${
              star <= rating ? 'text-yellow-400' : 'text-gray-400'
            } ${readonly ? 'cursor-default' : 'cursor-pointer hover:text-yellow-300'} transition-colors`}
          >
            <Star className="h-5 w-5 fill-current" />
          </button>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!manga) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-destructive text-lg">المانجا غير موجودة</p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/manga">العودة للمكتبة</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Manga Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Cover Image */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <img
              src={manga.cover_image}
              alt={manga.arabic_title}
              className="w-full max-w-sm mx-auto rounded-lg shadow-lg neon-glow"
            />
          </div>
        </div>

        {/* Manga Info */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-2 neon-text">{manga.arabic_title}</h1>
            <h2 className="text-xl text-muted-foreground mb-4">{manga.title}</h2>
            
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center space-x-2 space-x-reverse">
                <StarRating rating={Math.round(manga.average_rating)} readonly />
                <span className="font-semibold">{manga.average_rating}</span>
                <span className="text-muted-foreground">({manga.total_ratings || 0} تقييم)</span>
              </div>
              <Badge variant={manga.status === 'ongoing' ? 'default' : 'secondary'}>
                {manga.status === 'ongoing' ? 'مستمر' : 'مكتمل'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <BookOpen className="h-6 w-6 mx-auto mb-2 text-accent" />
                <p className="text-sm text-muted-foreground">الفصول</p>
                <p className="font-semibold">{manga.total_chapters}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <Eye className="h-6 w-6 mx-auto mb-2 text-accent" />
                <p className="text-sm text-muted-foreground">المشاهدات</p>
                <p className="font-semibold">{manga.views || '12.5K'}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <Heart className="h-6 w-6 mx-auto mb-2 text-accent" />
                <p className="text-sm text-muted-foreground">المفضلة</p>
                <p className="font-semibold">{manga.favorites || '2.1K'}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <Calendar className="h-6 w-6 mx-auto mb-2 text-accent" />
                <p className="text-sm text-muted-foreground">آخر تحديث</p>
                <p className="font-semibold text-xs">{formatDate(manga.updated_at)}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="neon-glow">
              <Link to={`/manga/${manga.id}/chapter/${manga.chapters?.[0]?.id || 1}`}>
                <BookOpen className="ml-2 h-5 w-5" />
                بدء القراءة
              </Link>
            </Button>
            
            {manga.reading_progress && (
              <Button asChild variant="outline" size="lg">
                <Link to={`/manga/${manga.id}/chapter/${manga.reading_progress.last_chapter_id}`}>
                  <Clock className="ml-2 h-5 w-5" />
                  متابعة القراءة
                </Link>
              </Button>
            )}

            <Button
              variant="outline"
              size="lg"
              onClick={handleFavorite}
              disabled={favoriteMutation.isLoading}
              className={manga.is_favorite ? 'text-red-500 border-red-500' : ''}
            >
              <Heart className={`ml-2 h-5 w-5 ${manga.is_favorite ? 'fill-current' : ''}`} />
              {manga.is_favorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
            </Button>

            <Button variant="outline" size="lg" onClick={handleShare}>
              <Share2 className="ml-2 h-5 w-5" />
              مشاركة
            </Button>
          </div>

          {/* User Rating */}
          {isAuthenticated && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">تقييمك</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 space-x-reverse">
                  <span>قيم هذه المانجا:</span>
                  <StarRating
                    rating={manga.user_rating || 0}
                    onRate={handleRate}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Manga Details */}
          <Card>
            <CardHeader>
              <CardTitle>تفاصيل المانجا</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">الوصف</h4>
                <p className="text-muted-foreground leading-relaxed">{manga.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">المؤلف</h4>
                  <p className="text-muted-foreground">{manga.author}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">الرسام</h4>
                  <p className="text-muted-foreground">{manga.artist}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">النوع</h4>
                  <div className="flex flex-wrap gap-2">
                    {manga.genre.split('، ').map((genre, index) => (
                      <Badge key={index} variant="outline">{genre}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">الحالة</h4>
                  <Badge variant={manga.status === 'ongoing' ? 'default' : 'secondary'}>
                    {manga.status === 'ongoing' ? 'مستمر' : 'مكتمل'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chapters List */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>قائمة الفصول</span>
            <Badge>{manga.chapters?.length || 0} فصل</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {manga.chapters?.map((chapter) => (
              <Link
                key={chapter.id}
                to={`/manga/${manga.id}/chapter/${chapter.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center text-sm font-medium">
                    {chapter.chapter_number}
                  </div>
                  <div>
                    <p className="font-medium group-hover:text-accent transition-colors">
                      الفصل {chapter.chapter_number}
                      {chapter.title && `: ${chapter.title}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(chapter.updated_at)}
                    </p>
                  </div>
                </div>
                <div className="text-muted-foreground group-hover:text-accent transition-colors">
                  <BookOpen className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reviews Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>المراجعات</span>
            <div className="flex items-center space-x-2 space-x-reverse">
              {isAuthenticated && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReviewForm(!showReviewForm)}
                >
                  <MessageCircle className="ml-2 h-4 w-4" />
                  إضافة مراجعة
                </Button>
              )}
              <Badge>{manga.reviews?.length || 0} مراجعة</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Review Form */}
          {showReviewForm && (
            <div className="p-4 rounded-lg bg-muted/50 space-y-4">
              <div className="flex items-center space-x-4 space-x-reverse">
                <span>التقييم:</span>
                <Select value={reviewRating.toString()} onValueChange={(value) => setReviewRating(parseInt(value))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <SelectItem key={rating} value={rating.toString()}>
                        {rating} نجوم
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Textarea
                placeholder="اكتب مراجعتك هنا..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={4}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSubmitReview}
                  disabled={reviewMutation.isLoading}
                >
                  {reviewMutation.isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="ml-2" />
                      جاري النشر...
                    </>
                  ) : (
                    'نشر المراجعة'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowReviewForm(false)}
                >
                  إلغاء
                </Button>
              </div>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-4">
            {manga.reviews?.map((review) => {
              const userBadge = getUserBadge(review.user);
              return (
                <div key={review.id} className="p-4 rounded-lg bg-muted/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <span className="font-medium">{review.user.username}</span>
                          {userBadge && (
                            <span className={userBadge.className}>{userBadge.text}</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse text-sm text-muted-foreground">
                          <StarRating rating={review.rating} readonly />
                          <span>{formatDate(review.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse text-sm text-muted-foreground">
                      <ThumbsUp className="h-4 w-4" />
                      <span>{review.likes}</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{review.content}</p>
                </div>
              );
            })}
          </div>

          {(!manga.reviews || manga.reviews.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد مراجعات بعد</p>
              {isAuthenticated && (
                <p className="text-sm">كن أول من يكتب مراجعة!</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MangaDetailsPage;

