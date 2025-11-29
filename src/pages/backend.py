# backend.py - VERSION AVEC AUTHENTIFICATION SQLITE
from flask import Flask, request, jsonify, send_file, Response
import os
import subprocess
import uuid
import time
import gc
from pathlib import Path
import sys
import io

# ==================== CONFIGURATION ENCODAGE ====================
if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
if sys.stderr.encoding != 'utf-8':
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Gestion CORS
try:
    from flask_cors import CORS
    cors_available = True
except ImportError:
    cors_available = False

# ⭐ IMPORT DU MODULE D'AUTHENTIFICATION
from backend_auth import auth_bp, save_translation_to_history
import jwt

app = Flask(__name__)

# ⭐ ENREGISTREMENT DU BLUEPRINT AUTH
app.register_blueprint(auth_bp, url_prefix='/api/auth')

# SECRET KEY pour JWT (doit être la même que dans backend_auth.py)
SECRET_KEY = 'votre_cle_secrete_changez_moi_en_production_123456'

if cors_available:
    CORS(app)
else:
    @app.after_request
    def after_request(response):
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        return response

# ==================== CONFIGURATION ====================
if getattr(sys, 'frozen', False):
    BASE_DIR = Path(sys.executable).parent
else:
    BASE_DIR = Path(__file__).parent

UPLOAD_FOLDER = BASE_DIR / 'uploads'
UPLOAD_FOLDER.mkdir(exist_ok=True)

print(f"=== CONFIGURATION ===")
print(f"Dossier base: {BASE_DIR}")
print(f"Dossier uploads: {UPLOAD_FOLDER}")
print(f"====================")

# ==================== FONCTIONS UTILITAIRES ====================

def get_user_id_from_token():
    """Extrait l'ID utilisateur du token JWT"""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None
        
        token = auth_header.split(' ')[1] if auth_header.startswith('Bearer ') else auth_header
        data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return data.get('user_id')
    except Exception as e:
        print(f"⚠️ Erreur extraction user_id: {e}")
        return None

def verifier_ffmpeg():
    """Vérifie si FFmpeg est installé"""
    try:
        result = subprocess.run(['ffmpeg', '-version'], capture_output=True, check=True, timeout=10)
        return True
    except:
        return False

def get_audio_duration(audio_path):
    """Obtenir la durée réelle de l'audio"""
    try:
        cmd = ['ffprobe', '-v', 'error', '-show_entries', 'format=duration', 
               '-of', 'default=noprint_wrappers=1:nokey=1', str(audio_path)]
        result = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', timeout=30)
        if result.returncode == 0:
            return float(result.stdout.strip())
    except Exception as e:
        print(f"Erreur durée audio: {e}")
    return 10.0

def extraire_audio_ffmpeg(chemin_video, chemin_sortie):
    """Extrait l'audio avec FFmpeg"""
    try:
        cmd = [
            'ffmpeg', '-i', str(chemin_video), '-vn', '-acodec', 'libmp3lame',
            '-b:a', '192k', '-ar', '44100', '-y', str(chemin_sortie)
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', timeout=60)
        if result.returncode == 0 and chemin_sortie.exists():
            print(f"✅ Audio extrait: {chemin_sortie.name}")
            return chemin_sortie
        return None
    except Exception as e:
        print(f"❌ Erreur extraction audio: {e}")
        return None

def transcrire_audio_demo(chemin_audio, langue=None):
    """Transcription de démonstration"""
    textes_demo = {
        "fr": "Bonjour et bienvenue dans cette démonstration de transcription audio. Ceci est un texte de démonstration.",
        "en": "Hello and welcome to this audio transcription demonstration. This is a demo text.",
        "es": "Hola y bienvenido a esta demostración de transcripción de audio.",
        "de": "Hallo und willkommen bei dieser Audio-Demonstration.",
        "ar": "مرحبا وأهلا بكم في هذا العرض التوضيحي.",
        "it": "Ciao e benvenuto a questa dimostrazione di trascrizione audio.",
        "pt": "Olá e bem-vindo a esta demonstração de transcrição de áudio.",
        "zh": "欢迎来到这个音频转录演示。这是一个演示文本。",
        "ja": "この音声文字起こしデモンストレーションへようこそ。これはデモテキストです。"
    }
    
    langue_texte = langue if langue and langue in textes_demo else "fr"
    texte_demo = textes_demo.get(langue_texte, textes_demo["fr"])
    duree_audio = get_audio_duration(chemin_audio)
    mots = texte_demo.split()
    
    segments = []
    mots_par_segment = max(5, len(mots) // 4)
    for i in range(0, len(mots), mots_par_segment):
        segment_mots = mots[i:i + mots_par_segment]
        segments.append({
            'start': (i / len(mots)) * duree_audio,
            'end': ((i + mots_par_segment) / len(mots)) * duree_audio,
            'text': " ".join(segment_mots)
        })
    
    return {'text': texte_demo, 'language': langue_texte, 'segments': segments}

def normaliser_code_langue(code_langue):
    """Normalise les codes de langue pour la traduction"""
    mapping_codes = {
        'zh': 'zh-CN',
        'ja': 'ja',
        'en': 'en',
        'fr': 'fr',
        'es': 'es',
        'de': 'de',
        'it': 'it',
        'pt': 'pt',
        'ar': 'ar'
    }
    return mapping_codes.get(code_langue, code_langue)

def traduire_avec_googletrans(texte, langue_source="auto", langue_cible="en"):
    """Traduit avec Google Translate"""
    try:
        from deep_translator import GoogleTranslator
        
        langue_source_norm = normaliser_code_langue(langue_source)
        langue_cible_norm = normaliser_code_langue(langue_cible)
        
        print(f"      Traduction: {langue_source_norm} → {langue_cible_norm}")
        translator = GoogleTranslator(source=langue_source_norm, target=langue_cible_norm)
        texte_traduit = translator.translate(texte.encode('utf-8', 'ignore').decode('utf-8'))
        
        if texte_traduit and texte_traduit != texte:
            return texte_traduit
        else:
            print(f"      ⚠️ Traduction vide ou identique, retour du texte original")
            return texte
            
    except Exception as e:
        print(f"❌ Erreur traduction {langue_source}→{langue_cible}: {e}")
        return texte

def generer_audio_edge_tts(texte, langue="en-US", voix=None, fichier_sortie="output.mp3"):
    """Génère l'audio avec Edge-TTS"""
    try:
        import edge_tts
        import asyncio
        
        voix_par_defaut = {
            "en-US": "en-US-AriaNeural", 
            "fr-FR": "fr-FR-DeniseNeural",
            "es-ES": "es-ES-ElviraNeural", 
            "de-DE": "de-DE-KatjaNeural",
            "ar-SA": "ar-SA-ZariyahNeural", 
            "it-IT": "it-IT-ElsaNeural",
            "pt-BR": "pt-BR-FranciscaNeural",
            "zh-CN": "zh-CN-XiaoxiaoNeural",
            "ja-JP": "ja-JP-NanamiNeural"
        }
        voix = voix or voix_par_defaut.get(langue, "en-US-AriaNeural")
        
        async def generer():
            communicate = edge_tts.Communicate(texte, voix)
            await communicate.save(str(fichier_sortie))
        
        asyncio.run(generer())
        print(f"✅ Audio généré: {Path(fichier_sortie).name}")
        return fichier_sortie
    except Exception as e:
        print(f"❌ Erreur Edge-TTS: {e}")
        return None

def get_audio_duration_ffprobe(audio_path):
    """Obtenir la durée précise de l'audio avec FFprobe"""
    try:
        cmd = [
            'ffprobe', '-v', 'error', 
            '-show_entries', 'format=duration', 
            '-of', 'default=noprint_wrappers=1:nokey=1',
            str(audio_path)
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        if result.returncode == 0:
            return float(result.stdout.strip())
    except Exception as e:
        print(f"❌ Erreur durée audio FFprobe: {e}")
    return None

def synchroniser_sous_titres_avec_nouvel_audio(segments_originaux, duree_audio_original, duree_audio_traduit):
    """Synchronise les sous-titres avec le nouvel audio généré"""
    try:
        if not segments_originaux or duree_audio_original <= 0 or duree_audio_traduit <= 0:
            return segments_originaux
        
        print(f"   🔄 Synchronisation: {duree_audio_original:.2f}s → {duree_audio_traduit:.2f}s")
        
        ratio = duree_audio_traduit / duree_audio_original
        
        segments_synchronises = []
        for seg in segments_originaux:
            if 'start' in seg and 'end' in seg:
                nouveau_start = seg['start'] * ratio
                nouveau_end = seg['end'] * ratio
                
                segments_synchronises.append({
                    'start': nouveau_start,
                    'end': nouveau_end,
                    'text': seg.get('text', '')
                })
        
        print(f"   ✅ {len(segments_synchronises)} segments synchronisés (ratio: {ratio:.3f})")
        return segments_synchronises
        
    except Exception as e:
        print(f"❌ Erreur synchronisation: {e}")
        return segments_originaux

def format_srt_time(seconds):
    """Format SRT HH:MM:SS,mmm"""
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    ms = int((seconds % 1) * 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

def format_webvtt_time(seconds):
    """Format WebVTT HH:MM:SS.mmm"""
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    ms = int((seconds % 1) * 1000)
    return f"{h:02d}:{m:02d}:{s:02d}.{ms:03d}"

def generer_srt(segments, fichier_sortie):
    """Génère un fichier SRT"""
    try:
        srt_lines = []
        for i, seg in enumerate(segments, 1):
            if 'start' in seg and 'end' in seg and 'text' in seg:
                srt_lines.extend([
                    str(i),
                    f"{format_srt_time(seg['start'])} --> {format_srt_time(seg['end'])}",
                    seg['text'].strip(),
                    ""
                ])
        
        with open(str(fichier_sortie), 'w', encoding='utf-8-sig', newline='\r\n') as f:
            f.write("\n".join(srt_lines))
        
        print(f"✅ SRT généré: {fichier_sortie.name} ({len(segments)} segments)")
        return fichier_sortie
    except Exception as e:
        print(f"❌ Erreur génération SRT: {e}")
        return None

def generer_webvtt(segments, fichier_sortie):
    """Génère un fichier WebVTT"""
    try:
        vtt_lines = ["WEBVTT", ""]
        
        for i, seg in enumerate(segments, 1):
            if 'start' in seg and 'end' in seg and 'text' in seg:
                vtt_lines.extend([
                    str(i),
                    f"{format_webvtt_time(seg['start'])} --> {format_webvtt_time(seg['end'])}",
                    seg['text'].strip(),
                    ""
                ])
        
        with open(str(fichier_sortie), 'w', encoding='utf-8') as f:
            f.write("\n".join(vtt_lines))
        
        print(f"✅ WebVTT généré: {fichier_sortie.name} ({len(segments)} segments)")
        return fichier_sortie
    except Exception as e:
        print(f"❌ Erreur génération WebVTT: {e}")
        return None

def remplacer_audio_ffmpeg(video_originale, nouveau_audio, video_sortie):
    """Remplace l'audio avec FFmpeg"""
    try:
        cmd = [
            'ffmpeg', '-i', str(video_originale), '-i', str(nouveau_audio),
            '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
            '-map', '0:v:0', '-map', '1:a:0', '-shortest', '-y', str(video_sortie)
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', timeout=120)
        if result.returncode == 0:
            print(f"✅ Assemblage vidéo réussi")
            return video_sortie
        return None
    except Exception as e:
        print(f"❌ Erreur assemblage: {e}")
        return None

def integrer_sous_titres_cc_ffmpeg(video_source, sous_titres_dict, video_sortie):
    """Intègre les sous-titres comme pistes CC"""
    try:
        if not video_source.exists() or not sous_titres_dict:
            return None

        print(f"\n🎬 Intégration {len(sous_titres_dict)} pistes de sous-titres CC...")
        
        noms_langues = {
            'en': 'English', 'fr': 'Français', 'es': 'Español', 'de': 'Deutsch',
            'ar': 'العربية', 'it': 'Italiano', 'pt': 'Português',
            'zh': '中文', 'ja': '日本語'
        }
        
        sous_titres_vtt_dict = {}
        for lang_code, srt_path in sous_titres_dict.items():
            vtt_path = Path(srt_path).with_suffix('.vtt')
            
            cmd_convert = [
                'ffmpeg', '-i', str(srt_path), 
                '-f', 'webvtt',
                '-y', str(vtt_path)
            ]
            result_convert = subprocess.run(cmd_convert, capture_output=True, text=True, timeout=30)
            if result_convert.returncode == 0 and vtt_path.exists():
                sous_titres_vtt_dict[lang_code] = str(vtt_path)
                print(f"   🔄 Converti SRT → WebVTT: {lang_code}")
            else:
                sous_titres_vtt_dict[lang_code] = str(srt_path)
                print(f"   ⚠️ Utilisation SRT original: {lang_code}")
        
        cmd = ['ffmpeg', '-i', str(video_source)]
        
        subtitle_inputs = []
        for lang_code, subtitle_path in sous_titres_vtt_dict.items():
            cmd.extend(['-i', str(subtitle_path)])
            subtitle_inputs.append(lang_code)
            print(f"   ➕ Sous-titres {noms_langues.get(lang_code, lang_code)}")
        
        cmd.extend(['-map', '0:v:0', '-map', '0:a:0'])
        
        for i, lang_code in enumerate(subtitle_inputs):
            cmd.extend([
                '-map', f'{i+1}:0',
                f'-c:s:{i}', 'mov_text',
                f'-metadata:s:s:{i}', f'language={lang_code}',
                f'-metadata:s:s:{i}', f'title={noms_langues.get(lang_code, lang_code)}'
            ])
        
        cmd.extend([
            '-c:v', 'copy',
            '-c:a', 'copy', 
            '-y', str(video_sortie)
        ])
        
        print(f"   Commande FFmpeg: ffmpeg -i video -i subs...")
        
        result = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', timeout=300)
        
        if result.returncode == 0 and video_sortie.exists():
            print(f"✅ Sous-titres CC intégrés: {video_sortie.name}")
            
            try:
                check_cmd = [
                    'ffprobe', '-v', 'quiet', 
                    '-select_streams', 's',
                    '-show_entries', 'stream=index,codec_name,codec_type:stream_tags=language,title',
                    '-of', 'json', 
                    str(video_sortie)
                ]
                check_result = subprocess.run(check_cmd, capture_output=True, text=True, timeout=30)
                if check_result.returncode == 0:
                    import json
                    streams_info = json.loads(check_result.stdout)
                    subtitle_streams = streams_info.get('streams', [])
                    print(f"   📊 {len(subtitle_streams)} piste(s) sous-titres détectée(s):")
                    for stream in subtitle_streams:
                        lang = stream.get('tags', {}).get('language', 'inconnu')
                        title = stream.get('tags', {}).get('title', 'Sans titre')
                        print(f"      🎯 Piste {stream['index']}: {lang} - {title}")
            except Exception as e:
                print(f"   ⚠️ Impossible de vérifier les pistes: {e}")
            
            return video_sortie
        else:
            print(f"❌ Erreur intégration CC")
            if result.stderr:
                error_lines = result.stderr.split('\n')
                for line in error_lines[-10:]:
                    if line.strip():
                        print(f"   🔴 {line}")
            return None
            
    except Exception as e:
        print(f"❌ Erreur CC: {e}")
        import traceback
        traceback.print_exc()
        return None

# ==================== ROUTES API ====================

@app.route('/')
def home():
    return jsonify({
        'message': 'Backend Traducteur Vidéo avec IA - Authentification SQLite',
        'version': '6.0.0',
        'status': 'online',
        'features': ['authentification', 'historique', 'statistiques']
    })

@app.route('/api/status', methods=['GET'])
def get_status():
    whisper_ok = False
    edge_tts_ok = False
    
    try:
        import whisper
        whisper_ok = True
    except:
        pass
    
    try:
        import edge_tts
        edge_tts_ok = True
    except:
        pass
    
    return jsonify({
        'status': 'online',
        'ffmpeg': verifier_ffmpeg(),
        'whisper': whisper_ok,
        'edge_tts': edge_tts_ok,
        'database': 'sqlite'
    })

@app.route('/api/languages', methods=['GET'])
def get_supported_languages():
    return jsonify({'languages': [
        {'code': 'en', 'name': 'English', 'native': 'English'},
        {'code': 'de', 'name': 'German', 'native': 'Deutsch'},
        {'code': 'fr', 'name': 'French', 'native': 'Français'},
        {'code': 'es', 'name': 'Spanish', 'native': 'Español'},
        {'code': 'it', 'name': 'Italian', 'native': 'Italiano'},
        {'code': 'pt', 'name': 'Portuguese', 'native': 'Português'},
        {'code': 'ar', 'name': 'Arabic', 'native': 'العربية'},
        {'code': 'zh', 'name': 'Chinese', 'native': '中文'},
        {'code': 'ja', 'name': 'Japanese', 'native': '日本語'}
    ]})

@app.route('/api/upload', methods=['POST'])
def upload_video():
    try:
        if 'video' not in request.files:
            return jsonify({'error': 'Aucun fichier'}), 400
        
        video_file = request.files['video']
        if not video_file.filename:
            return jsonify({'error': 'Nom vide'}), 400
        
        # Paramètres
        modele_whisper = request.form.get('modele_whisper', 'base')
        langue_source = request.form.get('langue_source', 'auto')
        langue_cible = request.form.get('langue_cible', 'en')
        utiliser_demo = request.form.get('utiliser_demo', 'false') == 'true'
        langues_sous_titres_str = request.form.get('langues_sous_titres', '')
        langues_sous_titres = [l.strip() for l in langues_sous_titres_str.split(',') if l.strip()]
        
        # ⭐ RÉCUPÉRER L'ID UTILISATEUR
        user_id = get_user_id_from_token()
        
        file_id = str(uuid.uuid4())
        temp_dir = UPLOAD_FOLDER / file_id
        temp_dir.mkdir(exist_ok=True)
        
        video_path = temp_dir / 'original_video.mp4'
        video_file.save(str(video_path))
        
        print(f"\n{'='*60}")
        print(f"🎬 TRAITEMENT VIDÉO {file_id[:8]}")
        print(f"   Source: {langue_source} → Cible: {langue_cible}")
        print(f"   Sous-titres: {[langue_cible] + langues_sous_titres}")
        if user_id:
            print(f"   Utilisateur ID: {user_id}")
        print(f"{'='*60}")
        
        # Extraction audio
        print("🔤 1. Extraction audio...")
        audio_path = temp_dir / 'audio.mp3'
        if not extraire_audio_ffmpeg(video_path, audio_path):
            return jsonify({'error': 'Échec extraction audio'}), 500
        
        duree_audio_original = get_audio_duration_ffprobe(audio_path)
        if duree_audio_original:
            print(f"   ⏱️ Durée audio original: {duree_audio_original:.2f}s")
        
        # Transcription
        print("🎤 2. Transcription...")
        if utiliser_demo:
            langue_demo = langue_source if langue_source != 'auto' else None
            transcription = transcrire_audio_demo(audio_path, langue_demo)
        else:
            try:
                import whisper
                model = whisper.load_model(modele_whisper)
                
                if langue_source and langue_source != 'auto':
                    print(f"   🔍 Transcription avec langue forcée: {langue_source}")
                    transcription = model.transcribe(str(audio_path), language=langue_source, verbose=False)
                else:
                    print(f"   🔍 Détection automatique de la langue...")
                    transcription = model.transcribe(str(audio_path), language=None, verbose=False)
                    
            except Exception as e:
                print(f"   ⚠️ Whisper indisponible, mode démo: {e}")
                langue_demo = langue_source if langue_source != 'auto' else None
                transcription = transcrire_audio_demo(audio_path, langue_demo)

        langue_detectee = transcription.get('language', langue_source if langue_source != 'auto' else 'fr')
        print(f"   ✅ Langue détectée: {langue_detectee}")
        
        # Traduction
        print(f"🌐 3. Traduction {langue_detectee} → {langue_cible}...")
        texte_traduit = traduire_avec_googletrans(transcription['text'], langue_detectee, langue_cible)
        
        # Génération audio
        print("🎙️ 4. Génération audio...")
        audio_traduit_path = temp_dir / 'audio_traduit.mp3'
        mapping_langues = {
            "en": "en-US", "fr": "fr-FR", "es": "es-ES", "de": "de-DE", 
            "ar": "ar-SA", "it": "it-IT", "pt": "pt-BR", "zh": "zh-CN", "ja": "ja-JP"
        }
        langue_edge = mapping_langues.get(langue_cible, "en-US")
        audio_genere = generer_audio_edge_tts(texte_traduit, langue_edge, None, audio_traduit_path)
        
        if not audio_genere:
            return jsonify({'error': 'Échec génération audio'}), 500
        
        duree_audio_traduit = get_audio_duration_ffprobe(audio_traduit_path)
        if duree_audio_traduit:
            print(f"   ⏱️ Durée audio traduit: {duree_audio_traduit:.2f}s")
        
        # Sous-titres
        print("📝 5. Génération sous-titres synchronisés...")
        sous_titres_paths = {}
        if 'segments' in transcription:
            toutes_langues = list(set([langue_cible] + langues_sous_titres))
            
            for lang in toutes_langues:
                print(f"   ➡️ Génération sous-titres {lang}...")
                segments_traduits = []
                
                for seg in transcription['segments']:
                    if 'text' in seg:
                        langue_source_traduction = langue_detectee
                        seg_trad = traduire_avec_googletrans(
                            seg['text'], 
                            langue_source_traduction, 
                            lang
                        )
                        segments_traduits.append({
                            'start': seg['start'],
                            'end': seg['end'],
                            'text': seg_trad if seg_trad else seg['text']
                        })
                
                if duree_audio_original and duree_audio_traduit:
                    segments_synchronises = synchroniser_sous_titres_avec_nouvel_audio(
                        segments_traduits, duree_audio_original, duree_audio_traduit
                    )
                else:
                    segments_synchronises = segments_traduits
                    print("   ⚠️ Synchronisation impossible (durées manquantes)")
                
                srt_path = temp_dir / f'subtitles_{lang}.srt'
                vtt_path = temp_dir / f'subtitles_{lang}.vtt'
                
                if generer_srt(segments_synchronises, srt_path):
                    sous_titres_paths[lang] = str(srt_path)
                    print(f"   ✅ Sous-titres {lang} générés")
                
                generer_webvtt(segments_synchronises, vtt_path)
        
        # Assemblage
        print("🎬 6. Assemblage vidéo...")
        video_avec_audio_path = temp_dir / 'video_avec_audio.mp4'
        video_resultat = remplacer_audio_ffmpeg(video_path, audio_genere, video_avec_audio_path)
        
        if not video_resultat:
            return jsonify({'error': 'Échec assemblage'}), 500

        # Intégration CC
        video_finale_path = video_resultat
        if sous_titres_paths:
            print("🎯 7. Intégration sous-titres CC...")
            video_cc_path = temp_dir / 'video_finale_cc.mp4'
            video_avec_cc = integrer_sous_titres_cc_ffmpeg(video_resultat, sous_titres_paths, video_cc_path)
            if video_avec_cc:
                video_finale_path = video_avec_cc
                print("   ✅ Vidéo avec sous-titres CC créée")
            else:
                print("   ⚠️ Échec intégration CC, utilisation vidéo sans sous-titres intégrés")
        
        # ⭐ SAUVEGARDER DANS L'HISTORIQUE SI UTILISATEUR
# ⭐ SAUVEGARDER DANS L'HISTORIQUE SI UTILISATEUR CONNECTÉ
        if user_id:
            try:
                save_translation_to_history(
                    user_id=user_id,
                    video_name=video_file.filename,
                    source_lang=langue_detectee,
                    target_lang=langue_cible,
                    subtitles_langs=list(set([langue_cible] + langues_sous_titres)),
                    file_id=file_id
                )
                print(f"   💾 Traduction sauvegardée dans l'historique")
            except Exception as e:
                print(f"   ⚠️ Erreur sauvegarde historique: {e}")
        
        print(f"{'='*60}")
        print(f"✅ TERMINÉ - SYNCHRONISÉ")
        print(f"   Vidéo: {video_finale_path.name}")
        print(f"   Sous-titres disponibles: {list(sous_titres_paths.keys())}")
        if duree_audio_original and duree_audio_traduit:
            ratio = duree_audio_traduit/duree_audio_original
            print(f"   Ratio synchronisation: {ratio:.3f}")
        print(f"{'='*60}\n")
        
        return jsonify({
            'success': True,
            'file_id': file_id,
            'languages': {'source': langue_detectee, 'target': langue_cible},
            'transcription': {
                'original': transcription['text'],
                'translated': texte_traduit,
                'language': langue_detectee
            },
            'subtitles': list(sous_titres_paths.keys()),
            'cc_enabled': video_finale_path.name == 'video_finale_cc.mp4',
            'synchronized': bool(duree_audio_original and duree_audio_traduit),
            'duration_ratio': round(duree_audio_traduit/duree_audio_original, 3) if duree_audio_original and duree_audio_traduit else 1.0,
            'download_url': f'/api/download/{file_id}',
            'preview_url': f'/api/preview/{file_id}'
        })
        
    except Exception as e:
        print(f"❌ ERREUR: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/download/<file_id>', methods=['GET'])
def download_video(file_id):
    try:
        video_cc = UPLOAD_FOLDER / file_id / 'video_finale_cc.mp4'
        video_audio = UPLOAD_FOLDER / file_id / 'video_avec_audio.mp4'
        video_path = video_cc if video_cc.exists() else video_audio
        
        if not video_path.exists():
            return jsonify({'error': 'Vidéo non trouvée'}), 404
            
        return send_file(str(video_path), as_attachment=True, download_name=f'traduite_{file_id[:8]}.mp4')
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/preview/<file_id>', methods=['GET'])
def preview_video(file_id):
    try:
        video_cc = UPLOAD_FOLDER / file_id / 'video_finale_cc.mp4'
        video_audio = UPLOAD_FOLDER / file_id / 'video_avec_audio.mp4'
        video_path = video_cc if video_cc.exists() else video_audio
        
        if not video_path.exists():
            return jsonify({'error': 'Vidéo non trouvée'}), 404
            
        return send_file(str(video_path), mimetype='video/mp4')
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/subtitles/<file_id>/<langue>', methods=['GET'])
def download_subtitles(file_id, langue):
    try:
        vtt_path = UPLOAD_FOLDER / file_id / f'subtitles_{langue}.vtt'
        srt_path = UPLOAD_FOLDER / file_id / f'subtitles_{langue}.srt'
        
        subtitle_path = None
        mimetype = ''
        
        if vtt_path.exists():
            subtitle_path = vtt_path
            mimetype = 'text/vtt'
        elif srt_path.exists():
            subtitle_path = srt_path
            mimetype = 'text/plain'
        else:
            return jsonify({'error': 'Sous-titres non trouvés'}), 404
        
        download = request.args.get('download', 'false').lower() == 'true'
        
        if download:
            return send_file(str(subtitle_path), as_attachment=True, download_name=f'sous_titres_{langue}.{subtitle_path.suffix}')
        else:
            with open(str(subtitle_path), 'r', encoding='utf-8') as f:
                content = f.read()
            response = Response(content, mimetype=f'{mimetype}; charset=utf-8')
            response.headers['Access-Control-Allow-Origin'] = '*'
            return response
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/audio/<file_id>', methods=['GET'])
def download_audio(file_id):
    try:
        audio_path = UPLOAD_FOLDER / file_id / 'audio_traduit.mp3'
        if not audio_path.exists():
            return jsonify({'error': 'Audio non trouvé'}), 404
        return send_file(str(audio_path), as_attachment=True, download_name=f'audio_{file_id[:8]}.mp3')
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/check_subtitles/<file_id>', methods=['GET'])
def check_subtitles_integration(file_id):
    """Vérifie l'intégration des sous-titres dans la vidéo"""
    try:
        video_path = UPLOAD_FOLDER / file_id / 'video_finale_cc.mp4'
        if not video_path.exists():
            return jsonify({'error': 'Vidéo avec sous-titres non trouvée'}), 404
        
        cmd = ['ffprobe', '-v', 'quiet', 
               '-select_streams', 's',
               '-show_entries', 'stream=index,codec_name,codec_type:stream_tags=language,title',
               '-of', 'json', 
               str(video_path)]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            import json
            streams_info = json.loads(result.stdout)
            subtitle_streams = streams_info.get('streams', [])
            
            return jsonify({
                'subtitles_tracks': subtitle_streams,
                'total_tracks': len(subtitle_streams),
                'has_cc': len(subtitle_streams) > 0
            })
        else:
            return jsonify({'error': 'Impossible de vérifier les sous-titres'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ⭐ NOUVELLE ROUTE: RÉCUPÉRER L'HISTORIQUE DES TRADUCTIONS DE L'UTILISATEUR
@app.route('/api/user/history', methods=['GET'])
def get_user_history():
    """Récupère l'historique des traductions de l'utilisateur connecté"""
    try:
        user_id = get_user_id_from_token()
        if not user_id:
            return jsonify({'error': 'Non authentifié'}), 401
        
        from backend_auth import get_user_translations
        translations = get_user_translations(user_id)
        
        return jsonify({
            'success': True,
            'translations': translations,
            'total': len(translations)
        }), 200
        
    except Exception as e:
        print(f"❌ Erreur récupération historique: {e}")
        return jsonify({'error': str(e)}), 500

# ⭐ NOUVELLE ROUTE: RÉCUPÉRER LES STATISTIQUES DE L'UTILISATEUR
@app.route('/api/user/stats', methods=['GET'])
def get_user_statistics():
    """Récupère les statistiques de l'utilisateur connecté"""
    try:
        user_id = get_user_id_from_token()
        if not user_id:
            return jsonify({'error': 'Non authentifié'}), 401
        
        from backend_auth import get_db_connection
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Statistiques globales
        cursor.execute(
            'SELECT COUNT(*) as total FROM translation_history WHERE user_id = ?',
            (user_id,)
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
            (user_id,)
        )
        top_languages = [dict(row) for row in cursor.fetchall()]
        
        # Traductions récentes (7 derniers jours)
        cursor.execute(
            '''SELECT COUNT(*) as count 
               FROM translation_history 
               WHERE user_id = ? 
               AND created_at >= datetime('now', '-7 days')''',
            (user_id,)
        )
        recent_count = cursor.fetchone()['count']
        
        conn.close()
        
        return jsonify({
            'success': True,
            'stats': {
                'total_translations': total_translations,
                'recent_translations': recent_count,
                'top_languages': top_languages
            }
        }), 200
        
    except Exception as e:
        print(f"❌ Erreur statistiques: {e}")
        return jsonify({'error': str(e)}), 500

# ⭐ NOUVELLE ROUTE: SUPPRIMER UNE TRADUCTION DE L'HISTORIQUE
@app.route('/api/user/history/<int:translation_id>', methods=['DELETE'])
def delete_translation_history(translation_id):
    """Supprime une traduction de l'historique"""
    try:
        user_id = get_user_id_from_token()
        if not user_id:
            return jsonify({'error': 'Non authentifié'}), 401
        
        from backend_auth import get_db_connection
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Vérifier que la traduction appartient à l'utilisateur
        cursor.execute(
            'SELECT * FROM translation_history WHERE id = ? AND user_id = ?',
            (translation_id, user_id)
        )
        translation = cursor.fetchone()
        
        if not translation:
            conn.close()
            return jsonify({'error': 'Traduction non trouvée'}), 404
        
        # Supprimer la traduction
        cursor.execute(
            'DELETE FROM translation_history WHERE id = ? AND user_id = ?',
            (translation_id, user_id)
        )
        conn.commit()
        conn.close()
        
        print(f"🗑️ Traduction {translation_id} supprimée pour l'utilisateur {user_id}")
        
        return jsonify({
            'success': True,
            'message': 'Traduction supprimée de l\'historique'
        }), 200
        
    except Exception as e:
        print(f"❌ Erreur suppression: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("\n" + "="*70)
    print("🎬 BACKEND TRADUCTEUR VIDÉO - AUTHENTIFICATION SQLITE + HISTORIQUE")
    print("="*70)
    print(f"FFmpeg: {'✅ Disponible' if verifier_ffmpeg() else '❌ Non installé'}")
    
    try:
        import whisper
        print("Whisper AI: ✅ Disponible")
    except:
        print("Whisper AI: ⚠️ Non installé (mode démo disponible)")
    
    try:
        import edge_tts
        print("Edge-TTS: ✅ Disponible")
    except:
        print("Edge-TTS: ❌ Non installé (pip install edge-tts)")
    
    # Vérifier la base de données
    if os.path.exists('users.db'):
        print("Database: ✅ users.db (SQLite)")
    else:
        print("Database: 🆕 Sera créée au premier lancement")
    
    print("="*70)
    print("🌐 Serveur: http://localhost:5000")
    print("📊 Status: http://localhost:5000/api/status")
    print("🔐 Auth: http://localhost:5000/api/auth/register")
    print("📋 Historique: http://localhost:5000/api/user/history")
    print("📈 Stats: http://localhost:5000/api/user/stats")
    print("="*70 + "\n")
    
    app.run(debug=False, host='0.0.0.0', port=5000, use_reloader=False, threaded=True)