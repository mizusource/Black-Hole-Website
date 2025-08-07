from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import db, User, Manga, Chapter, Comment, Rating, Review
import json
import os
from werkzeug.utils import secure_filename
from datetime import datetime

admin_bp = Blueprint('admin', __name__)

ADMIN_PASSWORD = "@Mustafa7"

def check_admin_access():
    """Check if user has admin access"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        return user and (user.is_admin or user.is_moderator)
    except:
        return False

def check_admin_password(password):
    """Check admin password for sensitive operations"""
    return password == ADMIN_PASSWORD

@admin_bp.route('/login', methods=['POST'])
def admin_login():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'لا توجد بيانات'}), 400
        
        password = data.get('password', '')
        
        if not check_admin_password(password):
            return jsonify({'error': 'كلمة مرور المسؤول غير صحيحة'}), 401
        
        return jsonify({'message': 'تم تسجيل دخول المسؤول بنجاح'}), 200
        
    except Exception as e:
        return jsonify({'error': 'حدث خطأ في الخادم'}), 500

@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_admin_stats():
    try:
        if not check_admin_access():
            return jsonify({'error': 'غير مصرح لك بالوصول'}), 403
        
        # Get statistics
        total_users = User.query.count()
        verified_users = User.query.filter_by(is_verified=True).count()
        banned_users = User.query.filter_by(is_banned=True).count()
        total_manga = Manga.query.count()
        total_chapters = Chapter.query.count()
        total_comments = Comment.query.count()
        total_ratings = Rating.query.count()
        total_reviews = Review.query.count()
        
        # Recent activity
        recent_users = User.query.order_by(User.created_at.desc()).limit(5).all()
        recent_comments = Comment.query.order_by(Comment.created_at.desc()).limit(10).all()
        
        stats = {
            'totals': {
                'users': total_users,
                'verified_users': verified_users,
                'banned_users': banned_users,
                'manga': total_manga,
                'chapters': total_chapters,
                'comments': total_comments,
                'ratings': total_ratings,
                'reviews': total_reviews
            },
            'recent_activity': {
                'users': [user.to_dict() for user in recent_users],
                'comments': [comment.to_dict() for comment in recent_comments]
            }
        }
        
        return jsonify({'stats': stats}), 200
        
    except Exception as e:
        return jsonify({'error': 'حدث خطأ في الخادم'}), 500

@admin_bp.route('/manga', methods=['POST'])
@jwt_required()
def create_manga():
    try:
        if not check_admin_access():
            return jsonify({'error': 'غير مصرح لك بالوصول'}), 403
        
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'لا توجد بيانات'}), 400
        
        title = data.get('title', '').strip()
        arabic_title = data.get('arabic_title', '').strip()
        description = data.get('description', '').strip()
        genre = data.get('genre', '').strip()
        status = data.get('status', 'ongoing')
        author = data.get('author', '').strip()
        artist = data.get('artist', '').strip()
        cover_image = data.get('cover_image', '')
        
        if not title or not arabic_title:
            return jsonify({'error': 'العنوان والعنوان العربي مطلوبان'}), 400
        
        # Check if manga already exists
        existing_manga = Manga.query.filter(
            db.or_(Manga.title == title, Manga.arabic_title == arabic_title)
        ).first()
        
        if existing_manga:
            return jsonify({'error': 'المانجا موجودة بالفعل'}), 400
        
        new_manga = Manga(
            title=title,
            arabic_title=arabic_title,
            description=description,
            genre=genre,
            status=status,
            author=author,
            artist=artist,
            cover_image=cover_image
        )
        
        db.session.add(new_manga)
        db.session.commit()
        
        return jsonify({
            'message': 'تم إنشاء المانجا بنجاح',
            'manga': new_manga.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ في الخادم'}), 500

@admin_bp.route('/manga/<int:manga_id>', methods=['PUT'])
@jwt_required()
def update_manga(manga_id):
    try:
        if not check_admin_access():
            return jsonify({'error': 'غير مصرح لك بالوصول'}), 403
        
        manga = Manga.query.get(manga_id)
        if not manga:
            return jsonify({'error': 'المانجا غير موجودة'}), 404
        
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'لا توجد بيانات'}), 400
        
        # Update fields
        if 'title' in data:
            manga.title = data['title'].strip()
        if 'arabic_title' in data:
            manga.arabic_title = data['arabic_title'].strip()
        if 'description' in data:
            manga.description = data['description'].strip()
        if 'genre' in data:
            manga.genre = data['genre'].strip()
        if 'status' in data:
            manga.status = data['status']
        if 'author' in data:
            manga.author = data['author'].strip()
        if 'artist' in data:
            manga.artist = data['artist'].strip()
        if 'cover_image' in data:
            manga.cover_image = data['cover_image']
        
        db.session.commit()
        
        return jsonify({
            'message': 'تم تحديث المانجا بنجاح',
            'manga': manga.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ في الخادم'}), 500

@admin_bp.route('/manga/<int:manga_id>', methods=['DELETE'])
@jwt_required()
def delete_manga(manga_id):
    try:
        if not check_admin_access():
            return jsonify({'error': 'غير مصرح لك بالوصول'}), 403
        
        manga = Manga.query.get(manga_id)
        if not manga:
            return jsonify({'error': 'المانجا غير موجودة'}), 404
        
        db.session.delete(manga)
        db.session.commit()
        
        return jsonify({'message': 'تم حذف المانجا بنجاح'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ في الخادم'}), 500

@admin_bp.route('/manga/<int:manga_id>/chapters', methods=['POST'])
@jwt_required()
def create_chapter(manga_id):
    try:
        if not check_admin_access():
            return jsonify({'error': 'غير مصرح لك بالوصول'}), 403
        
        manga = Manga.query.get(manga_id)
        if not manga:
            return jsonify({'error': 'المانجا غير موجودة'}), 404
        
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'لا توجد بيانات'}), 400
        
        chapter_number = data.get('chapter_number')
        title = data.get('title', '').strip()
        images = data.get('images', [])
        
        if not chapter_number:
            return jsonify({'error': 'رقم الفصل مطلوب'}), 400
        
        # Check if chapter already exists
        existing_chapter = Chapter.query.filter_by(
            manga_id=manga_id, chapter_number=chapter_number
        ).first()
        
        if existing_chapter:
            return jsonify({'error': 'الفصل موجود بالفعل'}), 400
        
        new_chapter = Chapter(
            manga_id=manga_id,
            chapter_number=chapter_number,
            title=title,
            images=json.dumps(images) if images else None
        )
        
        db.session.add(new_chapter)
        db.session.commit()
        
        return jsonify({
            'message': 'تم إنشاء الفصل بنجاح',
            'chapter': new_chapter.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ في الخادم'}), 500

@admin_bp.route('/chapters/<int:chapter_id>', methods=['PUT'])
@jwt_required()
def update_chapter(chapter_id):
    try:
        if not check_admin_access():
            return jsonify({'error': 'غير مصرح لك بالوصول'}), 403
        
        chapter = Chapter.query.get(chapter_id)
        if not chapter:
            return jsonify({'error': 'الفصل غير موجود'}), 404
        
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'لا توجد بيانات'}), 400
        
        # Update fields
        if 'chapter_number' in data:
            chapter.chapter_number = data['chapter_number']
        if 'title' in data:
            chapter.title = data['title'].strip()
        if 'images' in data:
            chapter.images = json.dumps(data['images'])
        
        db.session.commit()
        
        return jsonify({
            'message': 'تم تحديث الفصل بنجاح',
            'chapter': chapter.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ في الخادم'}), 500

@admin_bp.route('/chapters/<int:chapter_id>', methods=['DELETE'])
@jwt_required()
def delete_chapter(chapter_id):
    try:
        if not check_admin_access():
            return jsonify({'error': 'غير مصرح لك بالوصول'}), 403
        
        chapter = Chapter.query.get(chapter_id)
        if not chapter:
            return jsonify({'error': 'الفصل غير موجود'}), 404
        
        db.session.delete(chapter)
        db.session.commit()
        
        return jsonify({'message': 'تم حذف الفصل بنجاح'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ في الخادم'}), 500

@admin_bp.route('/comments', methods=['GET'])
@jwt_required()
def get_all_comments():
    try:
        if not check_admin_access():
            return jsonify({'error': 'غير مصرح لك بالوصول'}), 403
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        pagination = Comment.query.order_by(Comment.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        comments = [comment.to_dict() for comment in pagination.items]
        
        return jsonify({
            'comments': comments,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'حدث خطأ في الخادم'}), 500

@admin_bp.route('/comments/<int:comment_id>/pin', methods=['POST'])
@jwt_required()
def pin_comment(comment_id):
    try:
        if not check_admin_access():
            return jsonify({'error': 'غير مصرح لك بالوصول'}), 403
        
        comment = Comment.query.get(comment_id)
        if not comment:
            return jsonify({'error': 'التعليق غير موجود'}), 404
        
        comment.is_pinned = not comment.is_pinned
        db.session.commit()
        
        action = 'تثبيت' if comment.is_pinned else 'إلغاء تثبيت'
        
        return jsonify({
            'message': f'تم {action} التعليق بنجاح',
            'comment': comment.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ في الخادم'}), 500

@admin_bp.route('/comments/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    try:
        if not check_admin_access():
            return jsonify({'error': 'غير مصرح لك بالوصول'}), 403
        
        comment = Comment.query.get(comment_id)
        if not comment:
            return jsonify({'error': 'التعليق غير موجود'}), 404
        
        db.session.delete(comment)
        db.session.commit()
        
        return jsonify({'message': 'تم حذف التعليق بنجاح'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ في الخادم'}), 500

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def get_all_users():
    try:
        if not check_admin_access():
            return jsonify({'error': 'غير مصرح لك بالوصول'}), 403
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        pagination = User.query.order_by(User.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        users = [user.to_dict() for user in pagination.items]
        
        return jsonify({
            'users': users,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'حدث خطأ في الخادم'}), 500

@admin_bp.route('/users/<int:user_id>/ban', methods=['POST'])
@jwt_required()
def ban_user(user_id):
    try:
        if not check_admin_access():
            return jsonify({'error': 'غير مصرح لك بالوصول'}), 403
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'المستخدم غير موجود'}), 404
        
        if user.is_admin:
            return jsonify({'error': 'لا يمكن حظر المسؤول'}), 400
        
        user.is_banned = not user.is_banned
        db.session.commit()
        
        action = 'حظر' if user.is_banned else 'إلغاء حظر'
        
        return jsonify({
            'message': f'تم {action} المستخدم بنجاح',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ في الخادم'}), 500

@admin_bp.route('/users/<int:user_id>/promote', methods=['POST'])
@jwt_required()
def promote_user(user_id):
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if not current_user or not current_user.is_admin:
            return jsonify({'error': 'فقط المسؤول يمكنه ترقية المستخدمين'}), 403
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'المستخدم غير موجود'}), 404
        
        user.is_moderator = not user.is_moderator
        db.session.commit()
        
        action = 'ترقية' if user.is_moderator else 'تنزيل'
        
        return jsonify({
            'message': f'تم {action} المستخدم بنجاح',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ في الخادم'}), 500

