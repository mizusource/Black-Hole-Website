from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from src.models.user import db, User, Manga, Chapter, Comment, Rating, Review, Favorite, ReadingProgress
import json
import os
from werkzeug.utils import secure_filename

manga_bp = Blueprint('manga', __name__)

def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@manga_bp.route('/', methods=['GET'])
def get_manga_list():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', '').strip()
        genre = request.args.get('genre', '').strip()
        status = request.args.get('status', '').strip()
        sort_by = request.args.get('sort_by', 'updated_at')  # updated_at, rating, title
        
        query = Manga.query
        
        # Apply filters
        if search:
            query = query.filter(
                db.or_(
                    Manga.title.contains(search),
                    Manga.arabic_title.contains(search),
                    Manga.description.contains(search)
                )
            )
        
        if genre:
            query = query.filter(Manga.genre.contains(genre))
        
        if status:
            query = query.filter(Manga.status == status)
        
        # Apply sorting
        if sort_by == 'rating':
            # This is a simplified sorting, in production you'd want to calculate average ratings
            query = query.order_by(Manga.id.desc())
        elif sort_by == 'title':
            query = query.order_by(Manga.arabic_title)
        else:  # updated_at
            query = query.order_by(Manga.updated_at.desc())
        
        # Paginate
        pagination = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        manga_list = [manga.to_dict() for manga in pagination.items]
        
        return jsonify({
            'manga': manga_list,
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

@manga_bp.route('/<int:manga_id>', methods=['GET'])
def get_manga_details(manga_id):
    try:
        manga = Manga.query.get(manga_id)
        
        if not manga:
            return jsonify({'error': 'المانجا غير موجودة'}), 404
        
        # Get user's reading progress if authenticated
        reading_progress = None
        is_favorite = False
        user_rating = None
        
        try:
            verify_jwt_in_request(optional=True)
            user_id = get_jwt_identity()
            if user_id:
                progress = ReadingProgress.query.filter_by(
                    user_id=user_id, manga_id=manga_id
                ).first()
                if progress:
                    reading_progress = progress.last_chapter_read
                
                favorite = Favorite.query.filter_by(
                    user_id=user_id, manga_id=manga_id
                ).first()
                is_favorite = favorite is not None
                
                rating = Rating.query.filter_by(
                    user_id=user_id, manga_id=manga_id
                ).first()
                if rating:
                    user_rating = rating.rating
        except:
            pass
        
        # Get chapters
        chapters = Chapter.query.filter_by(manga_id=manga_id).order_by(Chapter.chapter_number).all()
        
        # Get recent reviews
        reviews = Review.query.filter_by(manga_id=manga_id).order_by(Review.created_at.desc()).limit(10).all()
        
        manga_data = manga.to_dict()
        manga_data.update({
            'chapters': [chapter.to_dict() for chapter in chapters],
            'reviews': [review.to_dict() for review in reviews],
            'reading_progress': reading_progress,
            'is_favorite': is_favorite,
            'user_rating': user_rating
        })
        
        return jsonify({'manga': manga_data}), 200
        
    except Exception as e:
        return jsonify({'error': 'حدث خطأ في الخادم'}), 500

@manga_bp.route('/<int:manga_id>/chapters/<int:chapter_id>', methods=['GET'])
def get_chapter_details(manga_id, chapter_id):
    try:
        chapter = Chapter.query.filter_by(id=chapter_id, manga_id=manga_id).first()
        
        if not chapter:
            return jsonify({'error': 'الفصل غير موجود'}), 404
        
        # Update reading progress if user is authenticated
        try:
            verify_jwt_in_request(optional=True)
            user_id = get_jwt_identity()
            if user_id:
                progress = ReadingProgress.query.filter_by(
                    user_id=user_id, manga_id=manga_id
                ).first()
                
                if not progress:
                    progress = ReadingProgress(
                        user_id=user_id,
                        manga_id=manga_id,
                        last_chapter_read=chapter.chapter_number
                    )
                    db.session.add(progress)
                else:
                    if chapter.chapter_number > progress.last_chapter_read:
                        progress.last_chapter_read = chapter.chapter_number
                
                db.session.commit()
        except:
            pass
        
        # Get comments
        comments = Comment.query.filter_by(chapter_id=chapter_id).order_by(
            Comment.is_pinned.desc(), Comment.created_at.desc()
        ).all()
        
        chapter_data = chapter.to_dict()
        chapter_data['comments'] = [comment.to_dict() for comment in comments]
        
        return jsonify({'chapter': chapter_data}), 200
        
    except Exception as e:
        return jsonify({'error': 'حدث خطأ في الخادم'}), 500

@manga_bp.route('/<int:manga_id>/rate', methods=['POST'])
@jwt_required()
def rate_manga(manga_id):
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'لا توجد بيانات'}), 400
        
        rating_value = data.get('rating')
        
        if not rating_value or not (1 <= rating_value <= 5):
            return jsonify({'error': 'التقييم يجب أن يكون بين 1 و 5'}), 400
        
        manga = Manga.query.get(manga_id)
        if not manga:
            return jsonify({'error': 'المانجا غير موجودة'}), 404
        
        # Check if user already rated this manga
        existing_rating = Rating.query.filter_by(
            user_id=user_id, manga_id=manga_id
        ).first()
        
        if existing_rating:
            existing_rating.rating = rating_value
        else:
            new_rating = Rating(
                user_id=user_id,
                manga_id=manga_id,
                rating=rating_value
            )
            db.session.add(new_rating)
        
        db.session.commit()
        
        return jsonify({'message': 'تم تقييم المانجا بنجاح'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ في الخادم'}), 500

@manga_bp.route('/<int:manga_id>/chapters/<int:chapter_id>/rate', methods=['POST'])
@jwt_required()
def rate_chapter(manga_id, chapter_id):
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'لا توجد بيانات'}), 400
        
        rating_value = data.get('rating')
        
        if not rating_value or not (1 <= rating_value <= 5):
            return jsonify({'error': 'التقييم يجب أن يكون بين 1 و 5'}), 400
        
        chapter = Chapter.query.filter_by(id=chapter_id, manga_id=manga_id).first()
        if not chapter:
            return jsonify({'error': 'الفصل غير موجود'}), 404
        
        # Check if user already rated this chapter
        existing_rating = Rating.query.filter_by(
            user_id=user_id, chapter_id=chapter_id
        ).first()
        
        if existing_rating:
            existing_rating.rating = rating_value
        else:
            new_rating = Rating(
                user_id=user_id,
                chapter_id=chapter_id,
                rating=rating_value
            )
            db.session.add(new_rating)
        
        db.session.commit()
        
        return jsonify({'message': 'تم تقييم الفصل بنجاح'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ في الخادم'}), 500

@manga_bp.route('/<int:manga_id>/review', methods=['POST'])
@jwt_required()
def add_review(manga_id):
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'لا توجد بيانات'}), 400
        
        content = data.get('content', '').strip()
        rating_value = data.get('rating')
        
        if not content:
            return jsonify({'error': 'محتوى المراجعة مطلوب'}), 400
        
        if not rating_value or not (1 <= rating_value <= 5):
            return jsonify({'error': 'التقييم يجب أن يكون بين 1 و 5'}), 400
        
        manga = Manga.query.get(manga_id)
        if not manga:
            return jsonify({'error': 'المانجا غير موجودة'}), 404
        
        # Check if user already reviewed this manga
        existing_review = Review.query.filter_by(
            user_id=user_id, manga_id=manga_id
        ).first()
        
        if existing_review:
            existing_review.content = content
            existing_review.rating = rating_value
        else:
            new_review = Review(
                user_id=user_id,
                manga_id=manga_id,
                content=content,
                rating=rating_value
            )
            db.session.add(new_review)
        
        db.session.commit()
        
        return jsonify({'message': 'تم إضافة المراجعة بنجاح'}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ في الخادم'}), 500

@manga_bp.route('/<int:manga_id>/chapters/<int:chapter_id>/comments', methods=['POST'])
@jwt_required()
def add_comment(manga_id, chapter_id):
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if user.is_banned:
            return jsonify({'error': 'تم حظرك من التعليق'}), 403
        
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'لا توجد بيانات'}), 400
        
        content = data.get('content', '').strip()
        
        if not content:
            return jsonify({'error': 'محتوى التعليق مطلوب'}), 400
        
        chapter = Chapter.query.filter_by(id=chapter_id, manga_id=manga_id).first()
        if not chapter:
            return jsonify({'error': 'الفصل غير موجود'}), 404
        
        new_comment = Comment(
            user_id=user_id,
            manga_id=manga_id,
            chapter_id=chapter_id,
            content=content
        )
        
        db.session.add(new_comment)
        db.session.commit()
        
        return jsonify({
            'message': 'تم إضافة التعليق بنجاح',
            'comment': new_comment.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ في الخادم'}), 500

@manga_bp.route('/<int:manga_id>/favorite', methods=['POST'])
@jwt_required()
def toggle_favorite(manga_id):
    try:
        user_id = get_jwt_identity()
        
        manga = Manga.query.get(manga_id)
        if not manga:
            return jsonify({'error': 'المانجا غير موجودة'}), 404
        
        existing_favorite = Favorite.query.filter_by(
            user_id=user_id, manga_id=manga_id
        ).first()
        
        if existing_favorite:
            db.session.delete(existing_favorite)
            message = 'تم إزالة المانجا من المفضلة'
            is_favorite = False
        else:
            new_favorite = Favorite(user_id=user_id, manga_id=manga_id)
            db.session.add(new_favorite)
            message = 'تم إضافة المانجا للمفضلة'
            is_favorite = True
        
        db.session.commit()
        
        return jsonify({
            'message': message,
            'is_favorite': is_favorite
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ في الخادم'}), 500

@manga_bp.route('/favorites', methods=['GET'])
@jwt_required()
def get_user_favorites():
    try:
        user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        pagination = Favorite.query.filter_by(user_id=user_id).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        favorites = [favorite.to_dict() for favorite in pagination.items]
        
        return jsonify({
            'favorites': favorites,
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

@manga_bp.route('/reading-progress', methods=['GET'])
@jwt_required()
def get_reading_progress():
    try:
        user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        pagination = ReadingProgress.query.filter_by(user_id=user_id).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        progress_list = [progress.to_dict() for progress in pagination.items]
        
        return jsonify({
            'reading_progress': progress_list,
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

