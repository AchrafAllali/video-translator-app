# backend_auth.py - VERSION AVEC SQLITE
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from functools import wraps
import sqlite3
import os

auth_bp = Blueprint('auth', __name__)
SECRET_KEY = 'votre_cle_secrete_changez_moi_en_production_123456'

# Chemin de la base de données
DB_PATH = 'users.db'

# ==================== INITIALISATION BASE DE DONNÉES ====================

def init_db():
    """Initialise la base de données SQLite"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Créer la table users
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP
        )
    ''')
    
    # Créer la table pour l'historique des traductions
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS translation_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            video_name TEXT NOT NULL,
            source_language TEXT,
            target_language TEXT,
            subtitles_languages TEXT,
            file_id TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'completed',
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')
    
    conn.commit()
    conn.close()
    print("✅ Base de données initialisée")

# Initialiser la BD au démarrage
init_db()

# ==================== FONCTIONS UTILITAIRES ====================

def get_db_connection():
    """Retourne une connexion à la base de données"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # Pour accéder aux colonnes par nom
    return conn

def get_user_by_email(email):
    """Récupère un utilisateur par son email"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
    user = cursor.fetchone()
    conn.close()
    return dict(user) if user else None

def get_user_by_id(user_id):
    """Récupère un utilisateur par son ID"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
    user = cursor.fetchone()
    conn.close()
    return dict(user) if user else None

def create_user(name, email, password):
    """Crée un nouvel utilisateur"""
    conn = get_db_connection()
    cursor = conn.cursor()
    hashed_password = generate_password_hash(password)
    
    try:
        cursor.execute(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            (name, email, hashed_password)
        )
        conn.commit()
        user_id = cursor.lastrowid
        conn.close()
        return user_id
    except sqlite3.IntegrityError:
        conn.close()
        return None

def update_last_login(user_id):
    """Met à jour la date de dernière connexion"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'UPDATE users SET last_login = ? WHERE id = ?',
        (datetime.datetime.now(), user_id)
    )
    conn.commit()
    conn.close()

def add_translation_history(user_id, video_name, source_lang, target_lang, subtitles_langs, file_id):
    """Ajoute une entrée dans l'historique des traductions"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        '''INSERT INTO translation_history 
           (user_id, video_name, source_language, target_language, subtitles_languages, file_id)
           VALUES (?, ?, ?, ?, ?, ?)''',
        (user_id, video_name, source_lang, target_lang, ','.join(subtitles_langs), file_id)
    )
    conn.commit()
    conn.close()

def get_user_translations(user_id):
    """Récupère l'historique des traductions d'un utilisateur"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        '''SELECT * FROM translation_history 
           WHERE user_id = ? 
           ORDER BY created_at DESC 
           LIMIT 50''',
        (user_id,)
    )
    translations = cursor.fetchall()
    conn.close()
    return [dict(t) for t in translations]

# ==================== DÉCORATEUR D'AUTHENTIFICATION ====================

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'error': 'Token manquant'}), 401
        
        try:
            # Extraire le token (format: "Bearer <token>")
            if token.startswith('Bearer '):
                token = token.split(' ')[1]
            
            # Décoder le token
            data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            current_user = get_user_by_id(data['user_id'])
            
            if not current_user:
                return jsonify({'error': 'Utilisateur non trouvé'}), 401
                
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expiré'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token invalide'}), 401
        except Exception as e:
            return jsonify({'error': f'Erreur d\'authentification: {str(e)}'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

# ==================== ROUTES D'AUTHENTIFICATION ====================

@auth_bp.route('/register', methods=['POST'])
def register():
    """Inscription d'un nouvel utilisateur"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        name = data.get('name')
        
        # Validation des données
        if not email or not password or not name:
            return jsonify({'error': 'Tous les champs sont requis'}), 400
        
        if len(password) < 6:
            return jsonify({'error': 'Le mot de passe doit contenir au moins 6 caractères'}), 400
        
        # Vérifier si l'email existe déjà
        existing_user = get_user_by_email(email)
        if existing_user:
            return jsonify({'error': 'Cet email est déjà utilisé'}), 409
        
        # Créer l'utilisateur
        user_id = create_user(name, email, password)
        
        if not user_id:
            return jsonify({'error': 'Erreur lors de la création du compte'}), 500
        
        # Générer le token JWT
        token = jwt.encode({
            'user_id': user_id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
        }, SECRET_KEY, algorithm='HS256')
        
        print(f"✅ Nouvel utilisateur inscrit: {name} ({email}) - ID: {user_id}")
        
        return jsonify({
            'success': True,
            'token': token,
            'user': {
                'id': user_id,
                'email': email,
                'name': name
            }
        }), 201
        
    except Exception as e:
        print(f"❌ Erreur inscription: {e}")
        return jsonify({'error': 'Erreur serveur lors de l\'inscription'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Connexion d'un utilisateur"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        # Validation
        if not email or not password:
            return jsonify({'error': 'Email et mot de passe requis'}), 400
        
        # Récupérer l'utilisateur
        user = get_user_by_email(email)
        if not user:
            return jsonify({'error': 'Email ou mot de passe incorrect'}), 401
        
        # Vérifier le mot de passe
        if not check_password_hash(user['password'], password):
            return jsonify({'error': 'Email ou mot de passe incorrect'}), 401
        
        # Mettre à jour la dernière connexion
        update_last_login(user['id'])
        
        # Générer le token JWT
        token = jwt.encode({
            'user_id': user['id'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
        }, SECRET_KEY, algorithm='HS256')
        
        print(f"✅ Connexion réussie: {user['name']} ({email}) - ID: {user['id']}")
        
        return jsonify({
            'success': True,
            'token': token,
            'user': {
                'id': user['id'],
                'email': user['email'],
                'name': user['name']
            }
        }), 200
        
    except Exception as e:
        print(f"❌ Erreur connexion: {e}")
        return jsonify({'error': 'Erreur serveur lors de la connexion'}), 500

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    """Récupère les informations de l'utilisateur connecté"""
    return jsonify({
        'success': True,
        'user': {
            'id': current_user['id'],
            'email': current_user['email'],
            'name': current_user['name'],
            'created_at': current_user['created_at'],
            'last_login': current_user['last_login']
        }
    }), 200

@auth_bp.route('/history', methods=['GET'])
@token_required
def get_history(current_user):
    """Récupère l'historique des traductions de l'utilisateur"""
    try:
        translations = get_user_translations(current_user['id'])
        
        return jsonify({
            'success': True,
            'translations': translations,
            'total': len(translations)
        }), 200
        
    except Exception as e:
        print(f"❌ Erreur historique: {e}")
        return jsonify({'error': 'Erreur lors de la récupération de l\'historique'}), 500

@auth_bp.route('/stats', methods=['GET'])
@token_required
def get_user_stats(current_user):
    """Récupère les statistiques de l'utilisateur"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Nombre total de traductions
        cursor.execute(
            'SELECT COUNT(*) as total FROM translation_history WHERE user_id = ?',
            (current_user['id'],)
        )
        total_translations = cursor.fetchone()['total']
        
        # Langues les plus utilisées
        cursor.execute(
            '''SELECT target_language, COUNT(*) as count 
               FROM translation_history 
               WHERE user_id = ? 
               GROUP BY target_language 
               ORDER BY count DESC 
               LIMIT 5''',
            (current_user['id'],)
        )
        top_languages = [dict(row) for row in cursor.fetchall()]
        
        conn.close()
        
        return jsonify({
            'success': True,
            'stats': {
                'total_translations': total_translations,
                'top_languages': top_languages,
                'member_since': current_user['created_at']
            }
        }), 200
        
    except Exception as e:
        print(f"❌ Erreur statistiques: {e}")
        return jsonify({'error': 'Erreur lors de la récupération des statistiques'}), 500

@auth_bp.route('/update-profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    """Met à jour le profil de l'utilisateur"""
    try:
        data = request.get_json()
        name = data.get('name')
        
        if not name:
            return jsonify({'error': 'Le nom est requis'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'UPDATE users SET name = ? WHERE id = ?',
            (name, current_user['id'])
        )
        conn.commit()
        conn.close()
        
        print(f"✅ Profil mis à jour: {name} (ID: {current_user['id']})")
        
        return jsonify({
            'success': True,
            'message': 'Profil mis à jour avec succès',
            'user': {
                'id': current_user['id'],
                'email': current_user['email'],
                'name': name
            }
        }), 200
        
    except Exception as e:
        print(f"❌ Erreur mise à jour profil: {e}")
        return jsonify({'error': 'Erreur lors de la mise à jour du profil'}), 500

@auth_bp.route('/change-password', methods=['PUT'])
@token_required
def change_password(current_user):
    """Change le mot de passe de l'utilisateur"""
    try:
        data = request.get_json()
        old_password = data.get('old_password')
        new_password = data.get('new_password')
        
        if not old_password or not new_password:
            return jsonify({'error': 'Ancien et nouveau mot de passe requis'}), 400
        
        if len(new_password) < 6:
            return jsonify({'error': 'Le nouveau mot de passe doit contenir au moins 6 caractères'}), 400
        
        # Vérifier l'ancien mot de passe
        if not check_password_hash(current_user['password'], old_password):
            return jsonify({'error': 'Ancien mot de passe incorrect'}), 401
        
        # Mettre à jour le mot de passe
        new_hashed_password = generate_password_hash(new_password)
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'UPDATE users SET password = ? WHERE id = ?',
            (new_hashed_password, current_user['id'])
        )
        conn.commit()
        conn.close()
        
        print(f"✅ Mot de passe changé: {current_user['name']} (ID: {current_user['id']})")
        
        return jsonify({
            'success': True,
            'message': 'Mot de passe changé avec succès'
        }), 200
        
    except Exception as e:
        print(f"❌ Erreur changement mot de passe: {e}")
        return jsonify({'error': 'Erreur lors du changement de mot de passe'}), 500

# ==================== FONCTION D'EXPORT ====================

def save_translation_to_history(user_id, video_name, source_lang, target_lang, subtitles_langs, file_id):
    """Fonction helper pour sauvegarder une traduction dans l'historique"""
    try:
        add_translation_history(user_id, video_name, source_lang, target_lang, subtitles_langs, file_id)
        print(f"✅ Traduction sauvegardée dans l'historique pour l'utilisateur {user_id}")
        return True
    except Exception as e:
        print(f"❌ Erreur sauvegarde historique: {e}")
        return False