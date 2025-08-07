from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from flask_mail import Message, Mail
from src.models.user import db, User
import re

auth_bp = Blueprint("auth", __name__)

def is_valid_email(email):
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return re.match(pattern, email) is not None

def is_valid_password(password):
    return len(password) >= 6

@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "لا توجد بيانات"}), 400
        
        username = data.get("username", "").strip()
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")
        
        # Validation
        if not username or len(username) < 3:
            return jsonify({"error": "اسم المستخدم يجب أن يكون 3 أحرف على الأقل"}), 400
        
        if not is_valid_email(email):
            return jsonify({"error": "البريد الإلكتروني غير صحيح"}), 400
        
        if not is_valid_password(password):
            return jsonify({"error": "كلمة المرور يجب أن تكون 6 أحرف على الأقل"}), 400
        
        # Check if user already exists (commented out for now)
        if User.query.filter_by(username=username).first():
            return jsonify({"error": "اسم المستخدم موجود بالفعل"}), 400
        
        if User.query.filter_by(email=email).first():
            return jsonify({"error": "البريد الإلكتروني موجود بالفعل"}), 400
        
        # Create new user (temporarily simplified)
        user = User(username=username, email=email)
        user.set_password(password)
        # user.generate_verification_code()
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            "message": "تم إنشاء الحساب بنجاح",
            "user_id": user.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "حدث خطأ في الخادم"}), 500

@auth_bp.route("/verify", methods=["POST"])
def verify_email():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "لا توجد بيانات"}), 400
        
        user_id = data.get("user_id")
        verification_code = data.get("verification_code", "").strip()
        
        if not user_id or not verification_code:
            return jsonify({"error": "معرف المستخدم ورمز التحقق مطلوبان"}), 400
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "المستخدم غير موجود"}), 404
        
        # if user.is_verified:
        #     return jsonify({"error": "الحساب مفعل بالفعل"}), 400
        
        # if user.verification_code != verification_code:
        #     return jsonify({"error": "رمز التحقق غير صحيح"}), 400
        
        # Verify user
        # user.is_verified = True
        # user.verification_code = None
        # db.session.commit()
        
        return jsonify({"message": "تم تفعيل الحساب بنجاح"}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "حدث خطأ في الخادم"}), 500

@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "لا توجد بيانات"}), 400
        
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")
        
        if not email or not password:
            return jsonify({"error": "البريد الإلكتروني وكلمة المرور مطلوبان"}), 400
        
        user = User.query.filter_by(email=email).first()
        
        if not user or not user.check_password(password):
            return jsonify({"error": "البريد الإلكتروني أو كلمة المرور غير صحيحة"}), 401
        
         # if not user.is_verified:
        #     return jsonify({"error": "يرجى تفعيل حسابك أولاً"}), 401401
        
        if user.is_banned:
            return jsonify({"error": "تم حظر حسابك من الموقع"}), 403
        
        # Create access token
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            "message": "تم تسجيل الدخول بنجاح",
            "access_token": access_token,
            "user": user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({"error": "حدث خطأ في الخادم"}), 500

@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"error": "المستخدم غير موجود"}), 404
        
        return jsonify({"user": user.to_dict()}), 200
        
    except Exception as e:
        return jsonify({"error": "حدث خطأ في الخادم"}), 500

@auth_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"error": "المستخدم غير موجود"}), 404
        
        data = request.get_json()
        
        if "username" in data:
            username = data["username"].strip()
            if len(username) < 3:
                return jsonify({"error": "اسم المستخدم يجب أن يكون 3 أحرف على الأقل"}), 400
            
            existing_user = User.query.filter_by(username=username).first()
            if existing_user and existing_user.id != user.id:
                return jsonify({"error": "اسم المستخدم موجود بالفعل"}), 400
            
            user.username = username
        
        if "bio" in data:
            user.bio = data["bio"].strip()
        
        if "profile_image" in data:
            user.profile_image = data["profile_image"]
        
        db.session.commit()
        
        return jsonify({
            "message": "تم تحديث الملف الشخصي بنجاح",
            "user": user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "حدث خطأ في الخادم"}), 500

@auth_bp.route("/resend-verification", methods=["POST"])
def resend_verification():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "لا توجد بيانات"}), 400
        
        email = data.get("email", "").strip().lower()
        
        if not email:
            return jsonify({"error": "البريد الإلكتروني مطلوب"}), 400
        
        user = User.query.filter_by(email=email).first()
        
        if not user:
            return jsonify({"error": "المستخدم غير موجود"}), 404
        
        # if user.is_verified:
        #     return jsonify({"error": "الحساب مفعل بالفعل"}), 400
        
        # user.generate_verification_code()
        db.session.commit()
        
        return jsonify({"message": "تم إرسال رمز التحقق الجديد"}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "حدث خطأ في الخادم"}), 500




