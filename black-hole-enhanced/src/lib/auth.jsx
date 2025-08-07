// Authentication utility functions

export const getToken = () => {
  return localStorage.getItem('access_token');
};

export const setToken = (token) => {
  localStorage.setItem('access_token', token);
};

export const removeToken = () => {
  localStorage.removeItem('access_token');
};

export const getUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const setUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const removeUser = () => {
  localStorage.removeItem('user');
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const isAdmin = () => {
  const user = getUser();
  return user?.is_admin || false;
};

export const isModerator = () => {
  const user = getUser();
  return user?.is_moderator || user?.is_admin || false;
};

export const logout = () => {
  removeToken();
  removeUser();
  window.location.href = '/';
};

export const getUserDisplayName = (user) => {
  if (!user) return 'مجهول';
  return user.username || 'مستخدم';
};

export const getUserBadge = (user) => {
  if (!user) return null;
  
  if (user.is_admin) {
    return { type: 'admin', text: 'مسؤول', className: 'admin-badge' };
  }
  
  if (user.is_moderator) {
    return { type: 'moderator', text: 'مشرف', className: 'moderator-badge' };
  }
  
  return null;
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return 'الآن';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `منذ ${diffInMinutes} دقيقة`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `منذ ${diffInHours} ساعة`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `منذ ${diffInDays} يوم`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `منذ ${diffInWeeks} أسبوع`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `منذ ${diffInMonths} شهر`;
  }
  
  const diffInYears = Math.floor(diffInDays / 365);
  return `منذ ${diffInYears} سنة`;
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateUsername = (username) => {
  return username && username.length >= 3;
};

