import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Edit, Camera, Save, X, Calendar, BookOpen, Heart, MessageCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { authAPI, userAPI, mangaAPI } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, getUserBadge } from '../lib/auth';
import toast from 'react-hot-toast';

// Sample data for development
const sampleProfile = {
  id: 1,
  username: 'أحمد_المانجا',
  email: 'ahmed@example.com',
  bio: 'محب للمانجا والأنمي، أقرأ المانجا منذ 5 سنوات وأحب مشاركة آرائي مع المجتمع.',
  avatar: null,
  is_verified: true,
  is_moderator: false,
  is_admin: false,
  created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  stats: {
    total_comments: 45,
    total_reviews: 12,
    total_favorites: 23,
    reading_progress: 8
  }
};

const sampleFavorites = [
  {
    id: 1,
    manga: {
      id: 1,
      arabic_title: 'هجوم العمالقة',
      cover_image: '/src/assets/manga1.jpg',
      average_rating: 4.9,
      status: 'completed'
    }
  },
  {
    id: 2,
    manga: {
      id: 2,
      arabic_title: 'ون بيس',
      cover_image: '/src/assets/manga2.jpg',
      average_rating: 4.8,
      status: 'ongoing'
    }
  }
];

const sampleReadingProgress = [
  {
    id: 1,
    manga: {
      id: 1,
      arabic_title: 'هجوم العمالقة',
      cover_image: '/src/assets/manga1.jpg',
      total_chapters: 139
    },
    last_chapter_read: 45,
    updated_at: new Date().toISOString()
  }
];

const ProfilePage = () => {
  const { userId } = useParams();
  const { user: currentUser, updateProfile } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    bio: '',
    avatar: null
  });

  const isOwnProfile = !userId || (currentUser && currentUser.id.toString() === userId);
  const profileUserId = userId || currentUser?.id;

  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['user', profileUserId],
    queryFn: () => isOwnProfile ? authAPI.getProfile() : userAPI.getProfile(profileUserId),
    select: (data) => data.data.user || sampleProfile,
    enabled: !!profileUserId
  });

  // Fetch user favorites
  const { data: favorites, isLoading: favoritesLoading } = useQuery({
    queryKey: ['favorites', profileUserId],
    queryFn: () => mangaAPI.getFavorites({ user_id: profileUserId }),
    select: (data) => data.data.favorites || sampleFavorites,
    enabled: !!profileUserId
  });

  // Fetch reading progress
  const { data: readingProgress, isLoading: progressLoading } = useQuery({
    queryKey: ['reading-progress', profileUserId],
    queryFn: () => mangaAPI.getReadingProgress({ user_id: profileUserId }),
    select: (data) => data.data.reading_progress || sampleReadingProgress,
    enabled: !!profileUserId
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (profileData) => updateProfile(profileData),
    onSuccess: () => {
      queryClient.invalidateQueries(['user', profileUserId]);
      setIsEditing(false);
      toast.success('تم تحديث الملف الشخصي بنجاح');
    },
    onError: () => {
      toast.error('حدث خطأ في تحديث الملف الشخصي');
    }
  });

  const handleEditStart = () => {
    setEditForm({
      username: profile?.username || '',
      bio: profile?.bio || '',
      avatar: null
    });
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditForm({ username: '', bio: '', avatar: null });
  };

  const handleEditSave = () => {
    updateProfileMutation.mutate(editForm);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditForm(prev => ({ ...prev, avatar: file }));
    }
  };

  const userBadge = getUserBadge(profile);

  if (profileLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-destructive text-lg">المستخدم غير موجود</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8 md:space-x-reverse">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-4xl font-bold text-white">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  profile.username?.charAt(0)?.toUpperCase() || 'U'
                )}
              </div>
              
              {isOwnProfile && isEditing && (
                <label className="absolute bottom-0 right-0 bg-accent text-accent-foreground rounded-full p-2 cursor-pointer hover:bg-accent/90 transition-colors">
                  <Camera className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  {isEditing ? (
                    <Input
                      value={editForm.username}
                      onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                      className="text-2xl font-bold mb-2"
                      placeholder="اسم المستخدم"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <h1 className="text-3xl font-bold">{profile.username}</h1>
                      {userBadge && (
                        <span className={userBadge.className}>{userBadge.text}</span>
                      )}
                      {profile.is_verified && (
                        <Badge variant="outline" className="verified-badge">
                          ✓ موثق
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {isOwnProfile && (
                  <div className="flex items-center space-x-2 space-x-reverse">
                    {isEditing ? (
                      <>
                        <Button
                          onClick={handleEditSave}
                          disabled={updateProfileMutation.isLoading}
                          size="sm"
                        >
                          {updateProfileMutation.isLoading ? (
                            <LoadingSpinner size="sm" className="ml-2" />
                          ) : (
                            <Save className="h-4 w-4 ml-2" />
                          )}
                          حفظ
                        </Button>
                        <Button
                          onClick={handleEditCancel}
                          variant="outline"
                          size="sm"
                        >
                          <X className="h-4 w-4 ml-2" />
                          إلغاء
                        </Button>
                      </>
                    ) : (
                      <Button onClick={handleEditStart} variant="outline" size="sm">
                        <Edit className="h-4 w-4 ml-2" />
                        تعديل الملف الشخصي
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Bio */}
              <div>
                {isEditing ? (
                  <Textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="اكتب نبذة عنك..."
                    rows={3}
                  />
                ) : (
                  <p className="text-muted-foreground leading-relaxed">
                    {profile.bio || 'لم يتم إضافة نبذة شخصية بعد.'}
                  </p>
                )}
              </div>

              {/* Join Date */}
              <div className="flex items-center space-x-2 space-x-reverse text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>انضم في {formatDate(profile.created_at)}</span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <MessageCircle className="h-5 w-5 mx-auto mb-1 text-accent" />
                  <p className="text-sm text-muted-foreground">التعليقات</p>
                  <p className="font-semibold">{profile.stats?.total_comments || 0}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <Star className="h-5 w-5 mx-auto mb-1 text-accent" />
                  <p className="text-sm text-muted-foreground">المراجعات</p>
                  <p className="font-semibold">{profile.stats?.total_reviews || 0}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <Heart className="h-5 w-5 mx-auto mb-1 text-accent" />
                  <p className="text-sm text-muted-foreground">المفضلة</p>
                  <p className="font-semibold">{profile.stats?.total_favorites || 0}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <BookOpen className="h-5 w-5 mx-auto mb-1 text-accent" />
                  <p className="text-sm text-muted-foreground">قيد القراءة</p>
                  <p className="font-semibold">{profile.stats?.reading_progress || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Content */}
      <Tabs defaultValue="favorites" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="favorites">المفضلة</TabsTrigger>
          <TabsTrigger value="reading">قيد القراءة</TabsTrigger>
        </TabsList>

        {/* Favorites Tab */}
        <TabsContent value="favorites">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 space-x-reverse">
                <Heart className="h-5 w-5 text-accent" />
                <span>المانجا المفضلة</span>
                <Badge>{favorites?.length || 0}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {favoritesLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="md" />
                </div>
              ) : favorites && favorites.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {favorites.map((favorite) => (
                    <Card key={favorite.id} className="manga-card overflow-hidden group">
                      <div className="relative">
                        <img
                          src={favorite.manga.cover_image}
                          alt={favorite.manga.arabic_title}
                          className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                          {favorite.manga.status === 'ongoing' ? 'مستمر' : 'مكتمل'}
                        </div>
                        <div className="absolute bottom-2 left-2 flex items-center space-x-1 space-x-reverse bg-black/70 text-white px-2 py-1 rounded text-xs">
                          <Star className="h-3 w-3 star-rating" />
                          <span>{favorite.manga.average_rating}</span>
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                          {favorite.manga.arabic_title}
                        </h3>
                        <Button asChild size="sm" className="w-full">
                          <a href={`/manga/${favorite.manga.id}`}>
                            قراءة الآن
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>لا توجد مانجا مفضلة بعد</p>
                  {isOwnProfile && (
                    <p className="text-sm">ابدأ بإضافة المانجا التي تحبها إلى المفضلة!</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reading Progress Tab */}
        <TabsContent value="reading">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 space-x-reverse">
                <BookOpen className="h-5 w-5 text-accent" />
                <span>قيد القراءة</span>
                <Badge>{readingProgress?.length || 0}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {progressLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="md" />
                </div>
              ) : readingProgress && readingProgress.length > 0 ? (
                <div className="space-y-4">
                  {readingProgress.map((progress) => (
                    <Card key={progress.id} className="manga-card">
                      <div className="flex">
                        <div className="w-20 h-28 flex-shrink-0">
                          <img
                            src={progress.manga.cover_image}
                            alt={progress.manga.arabic_title}
                            className="w-full h-full object-cover rounded-l-lg"
                          />
                        </div>
                        <CardContent className="flex-1 p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold mb-1 line-clamp-1">
                                {progress.manga.arabic_title}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                الفصل {progress.last_chapter_read} من {progress.manga.total_chapters}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(progress.updated_at)}
                            </p>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="mb-3">
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className="bg-accent h-2 rounded-full transition-all"
                                style={{
                                  width: `${(progress.last_chapter_read / progress.manga.total_chapters) * 100}%`
                                }}
                              ></div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {Math.round((progress.last_chapter_read / progress.manga.total_chapters) * 100)}% مكتمل
                            </p>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button asChild size="sm">
                              <a href={`/manga/${progress.manga.id}/chapter/${progress.last_chapter_read + 1}`}>
                                متابعة القراءة
                              </a>
                            </Button>
                            <Button asChild variant="outline" size="sm">
                              <a href={`/manga/${progress.manga.id}`}>
                                تفاصيل المانجا
                              </a>
                            </Button>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>لا توجد مانجا قيد القراءة</p>
                  {isOwnProfile && (
                    <p className="text-sm">ابدأ بقراءة مانجا جديدة لتظهر هنا!</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;

