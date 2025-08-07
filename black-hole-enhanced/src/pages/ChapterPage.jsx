import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, MessageCircle, Star, Send, Image, Pin, Trash2, User, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mangaAPI } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, getUserBadge } from '../lib/auth';
import toast from 'react-hot-toast';

// Sample data for development
const sampleChapter = {
  id: 1,
  chapter_number: 1,
  title: 'إلى أنت، بعد 2000 عام',
  manga_id: 1,
  manga: {
    id: 1,
    arabic_title: 'هجوم العمالقة',
    total_chapters: 139
  },
  images: [
    '/src/assets/manga1.jpg',
    '/src/assets/manga2.jpg',
    '/src/assets/manga3.jpg',
    '/src/assets/manga4.jpg'
  ],
  comments: [
    {
      id: 1,
      user: { id: 1, username: 'أحمد_المانجا', is_verified: true },
      content: 'فصل رائع! بداية قوية للقصة',
      created_at: new Date().toISOString(),
      is_pinned: true,
      likes: 5
    },
    {
      id: 2,
      user: { id: 2, username: 'فاطمة_الأوتاكو', is_moderator: true },
      content: 'الرسم مذهل والقصة مشوقة من البداية',
      created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      is_pinned: false,
      likes: 3
    }
  ]
};

const ChapterPage = () => {
  const { mangaId, chapterId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isModerator } = useAuth();
  const queryClient = useQueryClient();
  
  const [commentText, setCommentText] = useState('');
  const [chapterRating, setChapterRating] = useState(5);
  const [showComments, setShowComments] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch chapter details
  const { data: chapter, isLoading } = useQuery({
    queryKey: ['chapter', mangaId, chapterId],
    queryFn: () => mangaAPI.getChapter(mangaId, chapterId),
    select: (data) => data.data.chapter || sampleChapter,
  });

  // Rate chapter mutation
  const rateChapterMutation = useMutation({
    mutationFn: (rating) => mangaAPI.rateChapter(mangaId, chapterId, rating),
    onSuccess: () => {
      queryClient.invalidateQueries(['chapter', mangaId, chapterId]);
      toast.success('تم تقييم الفصل بنجاح');
    },
    onError: () => {
      toast.error('حدث خطأ في التقييم');
    }
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: (commentData) => mangaAPI.addComment(mangaId, chapterId, commentData),
    onSuccess: () => {
      queryClient.invalidateQueries(['chapter', mangaId, chapterId]);
      setCommentText('');
      toast.success('تم إضافة التعليق بنجاح');
    },
    onError: () => {
      toast.error('حدث خطأ في إضافة التعليق');
    }
  });

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') {
        handlePrevChapter();
      } else if (e.key === 'ArrowRight') {
        handleNextChapter();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setCurrentImageIndex(prev => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setCurrentImageIndex(prev => Math.min((chapter?.images?.length || 1) - 1, prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [chapter]);

  // Auto-scroll to current image
  useEffect(() => {
    const imageElement = document.getElementById(`image-${currentImageIndex}`);
    if (imageElement) {
      imageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentImageIndex]);

  const handlePrevChapter = () => {
    if (chapter?.chapter_number > 1) {
      navigate(`/manga/${mangaId}/chapter/${parseInt(chapterId) - 1}`);
    }
  };

  const handleNextChapter = () => {
    if (chapter?.chapter_number < chapter?.manga?.total_chapters) {
      navigate(`/manga/${mangaId}/chapter/${parseInt(chapterId) + 1}`);
    }
  };

  const handleRateChapter = (rating) => {
    if (!isAuthenticated) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }
    rateChapterMutation.mutate(rating);
  };

  const handleSubmitComment = () => {
    if (!isAuthenticated) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }
    if (!commentText.trim()) {
      toast.error('يرجى كتابة تعليق');
      return;
    }
    addCommentMutation.mutate({ content: commentText });
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
            <Star className="h-4 w-4 fill-current" />
          </button>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive text-lg mb-4">الفصل غير موجود</p>
          <Button asChild variant="outline">
            <Link to={`/manga/${mangaId}`}>العودة للمانجا</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Button asChild variant="ghost" size="sm">
                <Link to={`/manga/${mangaId}`}>
                  <ArrowLeft className="h-4 w-4 ml-2" />
                  العودة للمانجا
                </Link>
              </Button>
              <div>
                <h1 className="font-semibold">{chapter.manga?.arabic_title}</h1>
                <p className="text-sm text-muted-foreground">
                  الفصل {chapter.chapter_number}
                  {chapter.title && `: ${chapter.title}`}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowComments(!showComments)}
              >
                <MessageCircle className="h-4 w-4 ml-2" />
                التعليقات ({chapter.comments?.length || 0})
              </Button>
              
              {/* Navigation Buttons */}
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevChapter}
                disabled={chapter.chapter_number <= 1}
              >
                <ArrowRight className="h-4 w-4" />
                السابق
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextChapter}
                disabled={chapter.chapter_number >= chapter.manga?.total_chapters}
              >
                التالي
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Main Content */}
        <div className={`flex-1 ${showComments ? 'lg:pr-96' : ''} transition-all duration-300`}>
          {/* Chapter Images */}
          <div className="space-y-1">
            {chapter.images?.map((image, index) => (
              <div
                key={index}
                id={`image-${index}`}
                className={`relative ${currentImageIndex === index ? 'ring-2 ring-accent' : ''}`}
              >
                <img
                  src={image}
                  alt={`صفحة ${index + 1}`}
                  className="w-full max-w-4xl mx-auto block"
                  onClick={() => setCurrentImageIndex(index)}
                />
                <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                  {index + 1} / {chapter.images.length}
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Footer */}
          <div className="p-8 text-center space-y-4">
            <div className="flex justify-center space-x-4 space-x-reverse">
              <Button
                onClick={handlePrevChapter}
                disabled={chapter.chapter_number <= 1}
                size="lg"
              >
                <ArrowRight className="h-5 w-5 ml-2" />
                الفصل السابق
              </Button>
              <Button
                onClick={handleNextChapter}
                disabled={chapter.chapter_number >= chapter.manga?.total_chapters}
                size="lg"
              >
                الفصل التالي
                <ArrowLeft className="h-5 w-5 mr-2" />
              </Button>
            </div>

            {/* Chapter Rating */}
            {isAuthenticated && (
              <Card className="max-w-md mx-auto">
                <CardContent className="p-4">
                  <div className="text-center space-y-3">
                    <p className="font-medium">قيم هذا الفصل</p>
                    <div className="flex items-center justify-center space-x-4 space-x-reverse">
                      <span>التقييم:</span>
                      <Select value={chapterRating.toString()} onValueChange={(value) => setChapterRating(parseInt(value))}>
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
                      <Button
                        onClick={() => handleRateChapter(chapterRating)}
                        disabled={rateChapterMutation.isLoading}
                        size="sm"
                      >
                        تقييم
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Comments Sidebar */}
        {showComments && (
          <div className="fixed right-0 top-16 bottom-0 w-96 bg-card border-l border-border overflow-hidden flex flex-col slide-in-right">
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center justify-between">
                <span>التعليقات</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowComments(false)}
                >
                  ×
                </Button>
              </CardTitle>
            </CardHeader>

            {/* Add Comment Form */}
            {isAuthenticated && (
              <div className="p-4 border-b border-border">
                <div className="space-y-3">
                  <Textarea
                    placeholder="اكتب تعليقك هنا..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows={3}
                  />
                  <div className="flex justify-between items-center">
                    <Button
                      onClick={handleSubmitComment}
                      disabled={addCommentMutation.isLoading || !commentText.trim()}
                      size="sm"
                    >
                      {addCommentMutation.isLoading ? (
                        <LoadingSpinner size="sm" className="ml-2" />
                      ) : (
                        <Send className="h-4 w-4 ml-2" />
                      )}
                      إرسال
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Image className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Comments List */}
            <CardContent className="flex-1 overflow-y-auto p-0">
              <div className="space-y-4 p-4">
                {chapter.comments?.map((comment) => {
                  const userBadge = getUserBadge(comment.user);
                  return (
                    <div
                      key={comment.id}
                      className={`comment-bubble p-3 rounded-lg ${
                        comment.is_pinned ? 'bg-accent/10 border-accent' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <div className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center">
                            <User className="h-3 w-3" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <span className="font-medium text-sm">{comment.user.username}</span>
                              {userBadge && (
                                <span className={userBadge.className}>{userBadge.text}</span>
                              )}
                              {comment.is_pinned && (
                                <Pin className="h-3 w-3 text-accent" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(comment.created_at)}
                            </p>
                          </div>
                        </div>
                        
                        {isModerator && (
                          <div className="flex items-center space-x-1 space-x-reverse">
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <Pin className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-sm leading-relaxed mb-2">{comment.content}</p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Button variant="ghost" size="sm" className="h-6 px-2">
                            <ChevronUp className="h-3 w-3 ml-1" />
                            {comment.likes}
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 px-2">
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button variant="ghost" size="sm" className="h-6 px-2">
                          رد
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {(!chapter.comments || chapter.comments.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>لا توجد تعليقات بعد</p>
                    {isAuthenticated && (
                      <p className="text-sm">كن أول من يعلق!</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </div>
        )}
      </div>

      {/* Image Navigation Overlay */}
      <div className="fixed left-4 top-1/2 transform -translate-y-1/2 space-y-2 z-40">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentImageIndex(prev => Math.max(0, prev - 1))}
          disabled={currentImageIndex === 0}
          className="bg-black/70 border-white/20 text-white hover:bg-black/90"
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
        <div className="bg-black/70 text-white px-2 py-1 rounded text-sm text-center min-w-[60px]">
          {currentImageIndex + 1} / {chapter.images?.length || 0}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentImageIndex(prev => Math.min((chapter.images?.length || 1) - 1, prev + 1))}
          disabled={currentImageIndex === (chapter.images?.length || 1) - 1}
          className="bg-black/70 border-white/20 text-white hover:bg-black/90"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChapterPage;

