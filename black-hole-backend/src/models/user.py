from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import random
import string

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    profile_image = db.Column(db.String(255), default='default-avatar.png')
    bio = db.Column(db.Text, default='')
    is_admin = db.Column(db.Boolean, default=False)
    is_moderator = db.Column(db.Boolean, default=False)
    is_verified = db.Column(db.Boolean, default=False)
    verification_code = db.Column(db.String(6))
    is_banned = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    comments = db.relationship('Comment', backref='user', lazy=True, cascade='all, delete-orphan')
    ratings = db.relationship('Rating', backref='user', lazy=True, cascade='all, delete-orphan')
    reviews = db.relationship('Review', backref='user', lazy=True, cascade='all, delete-orphan')
    favorites = db.relationship('Favorite', backref='user', lazy=True, cascade='all, delete-orphan')
    reading_progress = db.relationship('ReadingProgress', backref='user', lazy=True, cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def generate_verification_code(self):
        self.verification_code = ''.join(random.choices(string.digits, k=6))
        return self.verification_code

    def __repr__(self):
        return f'<User {self.username}>'

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'profile_image': self.profile_image,
            'bio': self.bio,
            'is_admin': self.is_admin,
            'is_moderator': self.is_moderator,
            'is_verified': self.is_verified,
            'is_banned': self.is_banned,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Manga(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    arabic_title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    cover_image = db.Column(db.String(255))
    genre = db.Column(db.String(200))
    status = db.Column(db.String(50), default='ongoing')  # ongoing, completed, hiatus
    author = db.Column(db.String(100))
    artist = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    chapters = db.relationship('Chapter', backref='manga', lazy=True, cascade='all, delete-orphan')
    comments = db.relationship('Comment', backref='manga', lazy=True, cascade='all, delete-orphan')
    ratings = db.relationship('Rating', backref='manga', lazy=True, cascade='all, delete-orphan')
    reviews = db.relationship('Review', backref='manga', lazy=True, cascade='all, delete-orphan')
    favorites = db.relationship('Favorite', backref='manga', lazy=True, cascade='all, delete-orphan')
    reading_progress = db.relationship('ReadingProgress', backref='manga', lazy=True, cascade='all, delete-orphan')

    @property
    def average_rating(self):
        if self.ratings:
            return sum(r.rating for r in self.ratings) / len(self.ratings)
        return 0

    @property
    def total_chapters(self):
        return len(self.chapters)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'arabic_title': self.arabic_title,
            'description': self.description,
            'cover_image': self.cover_image,
            'genre': self.genre,
            'status': self.status,
            'author': self.author,
            'artist': self.artist,
            'average_rating': self.average_rating,
            'total_chapters': self.total_chapters,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Chapter(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    manga_id = db.Column(db.Integer, db.ForeignKey('manga.id'), nullable=False)
    chapter_number = db.Column(db.Float, nullable=False)
    title = db.Column(db.String(200))
    images = db.Column(db.Text)  # JSON string of image URLs
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    comments = db.relationship('Comment', backref='chapter', lazy=True, cascade='all, delete-orphan')
    ratings = db.relationship('Rating', backref='chapter', lazy=True, cascade='all, delete-orphan')

    @property
    def average_rating(self):
        if self.ratings:
            return sum(r.rating for r in self.ratings) / len(self.ratings)
        return 0

    def to_dict(self):
        return {
            'id': self.id,
            'manga_id': self.manga_id,
            'chapter_number': self.chapter_number,
            'title': self.title,
            'images': self.images,
            'average_rating': self.average_rating,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    manga_id = db.Column(db.Integer, db.ForeignKey('manga.id'))
    chapter_id = db.Column(db.Integer, db.ForeignKey('chapter.id'))
    content = db.Column(db.Text, nullable=False)
    images = db.Column(db.Text)  # JSON string of image URLs
    is_pinned = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user': self.user.to_dict() if self.user else None,
            'manga_id': self.manga_id,
            'chapter_id': self.chapter_id,
            'content': self.content,
            'images': self.images,
            'is_pinned': self.is_pinned,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Rating(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    manga_id = db.Column(db.Integer, db.ForeignKey('manga.id'))
    chapter_id = db.Column(db.Integer, db.ForeignKey('chapter.id'))
    rating = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('user_id', 'manga_id', name='unique_user_manga_rating'),
        db.UniqueConstraint('user_id', 'chapter_id', name='unique_user_chapter_rating'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'manga_id': self.manga_id,
            'chapter_id': self.chapter_id,
            'rating': self.rating,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    manga_id = db.Column(db.Integer, db.ForeignKey('manga.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    rating = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('user_id', 'manga_id', name='unique_user_manga_review'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user': self.user.to_dict() if self.user else None,
            'manga_id': self.manga_id,
            'content': self.content,
            'rating': self.rating,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Favorite(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    manga_id = db.Column(db.Integer, db.ForeignKey('manga.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('user_id', 'manga_id', name='unique_user_manga_favorite'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'manga_id': self.manga_id,
            'manga': self.manga.to_dict() if self.manga else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class ReadingProgress(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    manga_id = db.Column(db.Integer, db.ForeignKey('manga.id'), nullable=False)
    last_chapter_read = db.Column(db.Float, default=0)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('user_id', 'manga_id', name='unique_user_manga_progress'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'manga_id': self.manga_id,
            'manga': self.manga.to_dict() if self.manga else None,
            'last_chapter_read': self.last_chapter_read,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
