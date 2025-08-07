import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Shield, Users, BookOpen, MessageCircle, Settings, Plus, Edit, Trash2, 
  Pin, Ban, UserCheck, Eye, EyeOff, Upload, Save, X, Search, Filter 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { adminAPI } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, getUserBadge } from '../lib/auth';
import toast from 'react-hot-toast';

// Sample data for development
const sampleStats = {
  total_users: 1250,
  total_manga: 45,
  total_chapters: 2340,
  total_comments: 8920,
  pending_reports: 12
};

const sampleUsers = [
  {
    id: 1,
    username: 'أحمد_المانجا',
    email: 'ahmed@example.com',
    is_verified: true,
    is_moderator: false,
    is_banned: false,
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString()
  },
  {
    id: 2,
    username: 'فاطمة_الأوتاكو',
    email: 'fatima@example.com',
    is_verified: false,
    is_moderator: true,
    is_banned: false,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    last_login: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const sampleManga = [
  {
    id: 1,
    title: 'Attack on Titan',
    arabic_title: 'هجوم العمالقة',
    status: 'completed',
    total_chapters: 139,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const sampleComments = [
  {
    id: 1,
    content: 'فصل رائع! أحببت الأحداث',
    user: { id: 1, username: 'أحمد_المانجا' },
    manga: { id: 1, arabic_title: 'هجوم العمالقة' },
    chapter_number: 1,
    is_pinned: false,
    created_at: new Date().toISOString()
  }
];

const AdminPage = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Forms state
  const [mangaForm, setMangaForm] = useState({
    title: '',
    arabic_title: '',
    author: '',
    artist: '',
    genre: '',
    description: '',
    cover_image: null,
    status: 'ongoing'
  });

  const [chapterForm, setChapterForm] = useState({
    manga_id: '',
    chapter_number: '',
    title: '',
    images: []
  });

  // Check admin authentication
  useEffect(() => {
    if (!user || !isAdmin) {
      navigate('/');
      return;
    }
  }, [user, isAdmin, navigate]);

  // Admin login
  const handleAdminLogin = () => {
    if (adminPassword === '@Mustafa7') {
      setIsAuthenticated(true);
      toast.success('تم تسجيل الدخول لوحة الإدارة');
    } else {
      toast.error('كلمة مرور خاطئة');
    }
  };

  // Fetch admin data
  const { data: stats } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminAPI.getStats(),
    select: (data) => data.data.stats || sampleStats,
    enabled: isAuthenticated
  });

  const { data: users } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminAPI.getUsers(),
    select: (data) => data.data.users || sampleUsers,
    enabled: isAuthenticated
  });

  const { data: manga } = useQuery({
    queryKey: ['admin', 'manga'],
    queryFn: () => adminAPI.getManga(),
    select: (data) => data.data.manga || sampleManga,
    enabled: isAuthenticated
  });

  const { data: comments } = useQuery({
    queryKey: ['admin', 'comments'],
    queryFn: () => adminAPI.getComments(),
    select: (data) => data.data.comments || sampleComments,
    enabled: isAuthenticated
  });

  // Mutations
  const addMangaMutation = useMutation({
    mutationFn: (mangaData) => adminAPI.addManga(mangaData),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'manga']);
      setMangaForm({
        title: '',
        arabic_title: '',
        author: '',
        artist: '',
        genre: '',
        description: '',
        cover_image: null,
        status: 'ongoing'
      });
      toast.success('تم إضافة المانجا بنجاح');
    },
    onError: () => {
      toast.error('حدث خطأ في إضافة المانجا');
    }
  });

  const addChapterMutation = useMutation({
    mutationFn: (chapterData) => adminAPI.addChapter(chapterData),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'manga']);
      setChapterForm({
        manga_id: '',
        chapter_number: '',
        title: '',
        images: []
      });
      toast.success('تم إضافة الفصل بنجاح');
    },
    onError: () => {
      toast.error('حدث خطأ في إضافة الفصل');
    }
  });

  const toggleUserStatusMutation = useMutation({
    mutationFn: ({ userId, action }) => adminAPI.toggleUserStatus(userId, action),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'users']);
      toast.success('تم تحديث حالة المستخدم');
    },
    onError: () => {
      toast.error('حدث خطأ في تحديث حالة المستخدم');
    }
  });

  const toggleCommentMutation = useMutation({
    mutationFn: ({ commentId, action }) => adminAPI.toggleComment(commentId, action),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'comments']);
      toast.success('تم تحديث التعليق');
    },
    onError: () => {
      toast.error('حدث خطأ في تحديث التعليق');
    }
  });

  // Handlers
  const handleAddManga = () => {
    if (!mangaForm.title || !mangaForm.arabic_title) {
      toast.error('يرجى ملء الحقول المطلوبة');
      return;
    }
    addMangaMutation.mutate(mangaForm);
  };

  const handleAddChapter = () => {
    if (!chapterForm.manga_id || !chapterForm.chapter_number) {
      toast.error('يرجى ملء الحقول المطلوبة');
      return;
    }
    addChapterMutation.mutate(chapterForm);
  };

  const handleUserAction = (userId, action) => {
    toggleUserStatusMutation.mutate({ userId, action });
  };

  const handleCommentAction = (commentId, action) => {
    toggleCommentMutation.mutate({ commentId, action });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 hero-background">
        <Card className="w-full max-w-md glass-effect">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-accent" />
            </div>
            <CardTitle className="text-2xl font-bold neon-text">لوحة تحكم المسؤول</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">كلمة مرور المسؤول</label>
              <Input
                type="password"
                placeholder="أدخل كلمة مرور المسؤول"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
              />
            </div>
            <Button onClick={handleAdminLogin} className="w-full neon-glow">
              <Shield className="ml-2 h-4 w-4" />
              دخول لوحة الإدارة
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 space-x-reverse mb-4">
          <Shield className="h-8 w-8 text-accent" />
          <h1 className="text-3xl font-bold neon-text">لوحة تحكم المسؤول</h1>
        </div>
        <p className="text-muted-foreground">
          إدارة شاملة لموقع Black-Hole
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">لوحة المعلومات</TabsTrigger>
          <TabsTrigger value="manga">إدارة المانجا</TabsTrigger>
          <TabsTrigger value="users">إدارة المستخدمين</TabsTrigger>
          <TabsTrigger value="comments">إدارة التعليقات</TabsTrigger>
          <TabsTrigger value="settings">الإعدادات</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                <p className="text-3xl font-bold">{stats?.total_users || 0}</p>
                <p className="text-muted-foreground">المستخدمين</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p className="text-3xl font-bold">{stats?.total_manga || 0}</p>
                <p className="text-muted-foreground">المانجا</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                <p className="text-3xl font-bold">{stats?.total_chapters || 0}</p>
                <p className="text-muted-foreground">الفصول</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                <p className="text-3xl font-bold">{stats?.total_comments || 0}</p>
                <p className="text-muted-foreground">التعليقات</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>النشاط الأخير</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg bg-muted/50">
                  <Users className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">مستخدم جديد انضم</p>
                    <p className="text-sm text-muted-foreground">منذ 5 دقائق</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg bg-muted/50">
                  <BookOpen className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">تم إضافة فصل جديد</p>
                    <p className="text-sm text-muted-foreground">منذ 15 دقيقة</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg bg-muted/50">
                  <MessageCircle className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="font-medium">تعليق جديد</p>
                    <p className="text-sm text-muted-foreground">منذ 30 دقيقة</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manga Management Tab */}
        <TabsContent value="manga">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Add Manga Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 space-x-reverse">
                  <Plus className="h-5 w-5" />
                  <span>إضافة مانجا جديدة</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">العنوان الإنجليزي</label>
                    <Input
                      value={mangaForm.title}
                      onChange={(e) => setMangaForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Attack on Titan"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">العنوان العربي</label>
                    <Input
                      value={mangaForm.arabic_title}
                      onChange={(e) => setMangaForm(prev => ({ ...prev, arabic_title: e.target.value }))}
                      placeholder="هجوم العمالقة"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">المؤلف</label>
                    <Input
                      value={mangaForm.author}
                      onChange={(e) => setMangaForm(prev => ({ ...prev, author: e.target.value }))}
                      placeholder="Hajime Isayama"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">الرسام</label>
                    <Input
                      value={mangaForm.artist}
                      onChange={(e) => setMangaForm(prev => ({ ...prev, artist: e.target.value }))}
                      placeholder="Hajime Isayama"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">النوع</label>
                    <Input
                      value={mangaForm.genre}
                      onChange={(e) => setMangaForm(prev => ({ ...prev, genre: e.target.value }))}
                      placeholder="أكشن، دراما، فانتازيا"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">الحالة</label>
                    <Select value={mangaForm.status} onValueChange={(value) => setMangaForm(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ongoing">مستمر</SelectItem>
                        <SelectItem value="completed">مكتمل</SelectItem>
                        <SelectItem value="hiatus">متوقف مؤقتاً</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">الوصف</label>
                  <Textarea
                    value={mangaForm.description}
                    onChange={(e) => setMangaForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="وصف المانجا..."
                    rows={4}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">صورة الغلاف</label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setMangaForm(prev => ({ ...prev, cover_image: e.target.files[0] }))}
                  />
                </div>

                <Button
                  onClick={handleAddManga}
                  disabled={addMangaMutation.isLoading}
                  className="w-full"
                >
                  {addMangaMutation.isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="ml-2" />
                      جاري الإضافة...
                    </>
                  ) : (
                    <>
                      <Plus className="ml-2 h-4 w-4" />
                      إضافة المانجا
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Add Chapter Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 space-x-reverse">
                  <Plus className="h-5 w-5" />
                  <span>إضافة فصل جديد</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">المانجا</label>
                  <Select value={chapterForm.manga_id} onValueChange={(value) => setChapterForm(prev => ({ ...prev, manga_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المانجا" />
                    </SelectTrigger>
                    <SelectContent>
                      {manga?.map((m) => (
                        <SelectItem key={m.id} value={m.id.toString()}>
                          {m.arabic_title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">رقم الفصل</label>
                    <Input
                      type="number"
                      value={chapterForm.chapter_number}
                      onChange={(e) => setChapterForm(prev => ({ ...prev, chapter_number: e.target.value }))}
                      placeholder="1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">عنوان الفصل (اختياري)</label>
                    <Input
                      value={chapterForm.title}
                      onChange={(e) => setChapterForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="عنوان الفصل"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">صور الفصل</label>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setChapterForm(prev => ({ ...prev, images: Array.from(e.target.files) }))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    يمكنك اختيار عدة صور مرة واحدة
                  </p>
                </div>

                <Button
                  onClick={handleAddChapter}
                  disabled={addChapterMutation.isLoading}
                  className="w-full"
                >
                  {addChapterMutation.isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="ml-2" />
                      جاري الإضافة...
                    </>
                  ) : (
                    <>
                      <Plus className="ml-2 h-4 w-4" />
                      إضافة الفصل
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Manga List */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>قائمة المانجا</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {manga?.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div>
                      <h3 className="font-semibold">{m.arabic_title}</h3>
                      <p className="text-sm text-muted-foreground">{m.title}</p>
                      <div className="flex items-center space-x-2 space-x-reverse mt-2">
                        <Badge variant={m.status === 'ongoing' ? 'default' : 'secondary'}>
                          {m.status === 'ongoing' ? 'مستمر' : 'مكتمل'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {m.total_chapters} فصل
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Management Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>إدارة المستخدمين</span>
                <Badge>{users?.length || 0} مستخدم</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users?.map((u) => {
                  const userBadge = getUserBadge(u);
                  return (
                    <div key={u.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <h3 className="font-semibold">{u.username}</h3>
                            {userBadge && (
                              <span className={userBadge.className}>{userBadge.text}</span>
                            )}
                            {u.is_banned && (
                              <Badge variant="destructive">محظور</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{u.email}</p>
                          <p className="text-xs text-muted-foreground">
                            انضم: {formatDate(u.created_at)} | آخر دخول: {formatDate(u.last_login)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUserAction(u.id, u.is_verified ? 'unverify' : 'verify')}
                        >
                          {u.is_verified ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUserAction(u.id, u.is_moderator ? 'remove_moderator' : 'make_moderator')}
                        >
                          <UserCheck className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUserAction(u.id, u.is_banned ? 'unban' : 'ban')}
                          className={u.is_banned ? 'text-green-500' : 'text-destructive'}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comments Management Tab */}
        <TabsContent value="comments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>إدارة التعليقات</span>
                <Badge>{comments?.length || 0} تعليق</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {comments?.map((comment) => (
                  <div key={comment.id} className="p-4 rounded-lg bg-muted/50 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 space-x-reverse mb-2">
                          <span className="font-medium">{comment.user.username}</span>
                          <span className="text-sm text-muted-foreground">
                            في {comment.manga.arabic_title} - الفصل {comment.chapter_number}
                          </span>
                          {comment.is_pinned && (
                            <Badge variant="outline">مثبت</Badge>
                          )}
                        </div>
                        <p className="text-sm leading-relaxed">{comment.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDate(comment.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCommentAction(comment.id, comment.is_pinned ? 'unpin' : 'pin')}
                        >
                          <Pin className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCommentAction(comment.id, 'delete')}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 space-x-reverse">
                <Settings className="h-5 w-5" />
                <span>إعدادات الموقع</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4">معلومات الاتصال</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">البريد الإلكتروني للتواصل</label>
                    <Input value="mstfybdwy633@gmail.com" readOnly />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">كلمة مرور المسؤول</label>
                    <Input value="@Mustafa7" type="password" readOnly />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">إعدادات الموقع</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>السماح بالتسجيل الجديد</span>
                    <Button variant="outline" size="sm">تفعيل</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>مراجعة التعليقات قبل النشر</span>
                    <Button variant="outline" size="sm">إيقاف</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>إرسال إشعارات البريد الإلكتروني</span>
                    <Button variant="outline" size="sm">تفعيل</Button>
                  </div>
                </div>
              </div>

              <Button className="w-full">
                <Save className="ml-2 h-4 w-4" />
                حفظ الإعدادات
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;

