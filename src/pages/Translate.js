import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../styles/Translate.css';
const Translate = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [results, setResults] = useState(null);
  const [supportedLanguages, setSupportedLanguages] = useState([]);
  const [systemStatus, setSystemStatus] = useState(null);
  const [videoError, setVideoError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [stats, setStats] = useState({ videosProcessed: 12547, satisfactionRate: 98 });
  
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const [config, setConfig] = useState({
    modele_whisper: 'base',
    langue_source: 'auto',
    langue_cible: 'en',
    langues_sous_titres: [],
    methode_tts: 'Edge-TTS',
    generer_sous_titres: true,
    synchronisation_ffmpeg: true,
    utiliser_demo: false
  });

  const API_BASE = 'http://localhost:5000/api';

  // Charger les données initiales
  useEffect(() => {
    fetchSupportedLanguages();
    fetchSystemStatus();
    loadConfigFromStorage();
  }, []);

  // Sauvegarder la config dans le localStorage
  useEffect(() => {
    localStorage.setItem('translateConfig', JSON.stringify(config));
  }, [config]);

  const loadConfigFromStorage = () => {
    try {
      const savedConfig = localStorage.getItem('translateConfig');
      if (savedConfig) {
        setConfig(prev => ({ ...prev, ...JSON.parse(savedConfig) }));
      }
    } catch (error) {
      console.warn('Erreur chargement config:', error);
    }
  };

  const fetchSupportedLanguages = async () => {
    try {
      const response = await fetch(`${API_BASE}/languages`);
      const data = await response.json();
      setSupportedLanguages(data.languages || getDefaultLanguages());
    } catch (error) {
      console.error('Erreur chargement langues:', error);
      setSupportedLanguages(getDefaultLanguages());
    }
  };

  const getDefaultLanguages = () => [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'fr', name: 'French', native: 'Français' },
    { code: 'es', name: 'Spanish', native: 'Español' },
    { code: 'de', name: 'German', native: 'Deutsch' },
    { code: 'ar', name: 'Arabic', native: 'العربية' },
    { code: 'it', name: 'Italian', native: 'Italiano' },
    { code: 'pt', name: 'Portuguese', native: 'Português' },
    { code: 'zh', name: 'Chinese', native: '中文' },
    { code: 'ja', name: 'Japanese', native: '日本語' }
  ];

  const fetchSystemStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/status`);
      const data = await response.json();
      setSystemStatus(data);
    } catch (error) {
      console.error('Erreur statut système:', error);
      setSystemStatus({ ffmpeg: false, whisper: false, edge_tts: false });
    }
  };

  const handleConfigChange = useCallback((key, value) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Gestion du Drag & Drop
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    if (!dropZoneRef.current?.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndSetFile(files[0]);
    }
  }, []);

  const validateAndSetFile = (file) => {
    if (!file) return;

    // Validation de la taille
    if (file.size > 200 * 1024 * 1024) {
      alert('❌ Le fichier est trop volumineux (maximum 200MB)');
      return;
    }
    
    // Validation du format
    const validFormats = ['mp4', 'avi', 'mov', 'mkv', 'webm'];
    const fileExt = file.name.split('.').pop().toLowerCase();
    if (!validFormats.includes(fileExt)) {
      alert('❌ Format non supporté. Utilisez: MP4, AVI, MOV, MKV, WEBM');
      return;
    }
    
    setUploadedFile(file);
    setResults(null);
    setVideoError('');
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    validateAndSetFile(file);
  };

  const simulateProgress = (steps) => {
    let stepIndex = 0;
    
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        setProgress(steps[stepIndex].progress);
        setCurrentStep(steps[stepIndex].message);
        stepIndex++;
      } else {
        clearInterval(interval);
      }
    }, 1800);
    
    return interval;
  };

  const handleProcess = async () => {
    if (!uploadedFile) {
      alert('🎬 Veuillez sélectionner une vidéo d\'abord');
      fileInputRef.current?.click();
      return;
    }

    // Vérification des dépendances système
    if (!config.utiliser_demo && systemStatus && !systemStatus.whisper) {
      const useDemo = window.confirm(
        '🤖 Whisper AI n\'est pas installé sur votre système.\n\n' +
        'Voulez-vous utiliser le mode démonstration pour tester l\'interface ?\n\n' +
        'Pour une expérience complète, installez Whisper :\n' +
        'pip install openai-whisper'
      );
      if (useDemo) {
        setConfig(prev => ({ ...prev, utiliser_demo: true }));
      } else {
        return;
      }
    }

    setProcessing(true);
    setProgress(0);
    setCurrentStep('🚀 Initialisation du traitement...');
    setResults(null);
    setVideoError('');

    const progressSteps = [
      { progress: 15, message: '📤 Upload et analyse de la vidéo...' },
      { progress: 25, message: '🎵 Extraction audio en cours...' },
      { progress: 45, message: '🧠 Transcription IA avec Whisper...' },
      { progress: 65, message: '🌍 Traduction intelligente...' },
      { progress: 80, message: '🎙️ Synthèse vocale HD...' },
      { progress: 90, message: '📝 Génération des sous-titres...' },
      { progress: 95, message: '🎬 Assemblage et optimisation finale...' }
    ];

    const progressInterval = simulateProgress(progressSteps);

    try {
      const formData = new FormData();
      formData.append('video', uploadedFile);
      formData.append('modele_whisper', config.modele_whisper);
      formData.append('langue_source', config.langue_source);
      formData.append('langue_cible', config.langue_cible);
      formData.append('methode_tts', config.methode_tts);
      formData.append('generer_sous_titres', config.generer_sous_titres);
      formData.append('synchronisation_ffmpeg', config.synchronisation_ffmpeg);
      formData.append('utiliser_demo', config.utiliser_demo);
      formData.append('langues_sous_titres', config.langues_sous_titres.join(','));

      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      clearInterval(progressInterval);
      setProgress(100);
      setCurrentStep('✅ Traitement terminé avec succès!');

      if (result.success) {
        setResults(result);
        console.log('🎉 Traitement réussi:', result);
        
        // Mise à jour des stats (simulation)
        setStats(prev => ({
          ...prev,
          videosProcessed: prev.videosProcessed + 1
        }));
      } else {
        throw new Error(result.error || 'Erreur inconnue du serveur');
      }

    } catch (error) {
      clearInterval(progressInterval);
      console.error('❌ Erreur traitement:', error);
      
      let errorMessage = '❌ Erreur de connexion au serveur. ';
      errorMessage += 'Vérifiez que le backend est lancé sur le port 5000.';
      
      alert(errorMessage);
      setCurrentStep('❌ Échec du traitement');
    } finally {
      setTimeout(() => setProcessing(false), 1500);
    }
  };

  const downloadVideo = async () => {
    if (!results) return;
    
    try {
      const response = await fetch(`${API_BASE}/download/${results.file_id}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `video_traduite_${config.langue_cible}_${uploadedFile.name}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const errorData = await response.json();
        setVideoError('❌ Erreur téléchargement: ' + (errorData.error || 'Vidéo non disponible'));
      }
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      setVideoError('❌ Erreur de téléchargement');
    }
  };

  const downloadAudio = async () => {
    if (!results) return;
    
    try {
      const response = await fetch(`${API_BASE}/audio/${results.file_id}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audio_traduit_${config.langue_cible}.mp3`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Erreur téléchargement audio:', error);
      alert('❌ Erreur lors du téléchargement de l\'audio');
    }
  };

  const downloadSubtitles = async (langue) => {
    try {
      const response = await fetch(`${API_BASE}/subtitles/${results.file_id}/${langue}?download=true`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sous_titres_${langue}.srt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Sous-titres non disponibles pour', langue);
        alert(`❌ Sous-titres non disponibles pour ${getLanguageName(langue)}`);
      }
    } catch (error) {
      console.error('Erreur téléchargement sous-titres:', error);
      alert('❌ Erreur lors du téléchargement des sous-titres');
    }
  };

  const getLanguageName = (code) => {
    const lang = supportedLanguages.find(l => l.code === code);
    return lang ? lang.native : code.toUpperCase();
  };

  const handleVideoError = () => {
    setVideoError('❌ Impossible de charger la vidéo en prévisualisation. Vous pouvez toujours la télécharger.');
  };

  const handleVideoLoad = () => {
    setVideoError('');
  };

  const resetProcess = () => {
    setUploadedFile(null);
    setResults(null);
    setProgress(0);
    setCurrentStep('');
    setVideoError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  // Composants réutilisables
  const StatusIndicator = ({ status, message }) => (
    <div className={`status-item ${status}`}>
      <span>{message}</span>
      <span className={`status-${status}`}>
        {status === 'ok' ? '✅' : status === 'warning' ? '⚠️' : '❌'}
      </span>
    </div>
  );

  const ConfigSection = ({ title, icon, children }) => (
    <div className="config-option">
      <label>
        <span>{icon}</span>
        {title}
      </label>
      {children}
    </div>
  );

  return (
    <div className="page-container">
      {/* Background Animé */}
      <div className="animated-background">
        <div className="continuous-gradient"></div>
      </div>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <span>🚀</span>
            Powered by Whisper AI & Edge-TTS
          </div>
          
          <h1 className="hero-title">
            Traduire une Vidéo avec IA
          </h1>
          
          <p className="hero-subtitle">
            Transcription intelligente • Traduction multilingue • Audio HD naturel • Sous-titres automatiques
          </p>

          <div className="hero-features">
            <div className="hero-feature">
              <span>🎯</span> Précision 99%
            </div>
            <div className="hero-feature">
              <span>⚡</span> Traitement rapide
            </div>
            <div className="hero-feature">
              <span>🌍</span> 50+ langues
            </div>
            <div className="hero-feature">
              <span>🛡️</span> Sécurisé
            </div>
          </div>
        </div>
      </section>

      {/* Content Principal */}
      <div className="content-container">
        <div className="translate-layout">
          
          {/* Sidebar Configuration */}
          <aside className="config-sidebar">
            <div className="pro-card">
              <div className="card-header">
                <div className="card-icon">⚙️</div>
                <h2 className="card-title">Configuration</h2>
              </div>

              {/* Statut du Système */}
              {systemStatus && (
                <div className="system-status">
                  <h4>📊 Statut du Système</h4>
                  <div className="status-grid">
                    <StatusIndicator 
                      status={systemStatus.ffmpeg ? "ok" : "error"} 
                      message="FFmpeg" 
                    />
                    <StatusIndicator 
                      status={systemStatus.whisper ? "ok" : "warning"} 
                      message="Whisper AI" 
                    />
                    <StatusIndicator 
                      status={systemStatus.edge_tts ? "ok" : "warning"} 
                      message="Edge-TTS" 
                    />
                  </div>
                </div>
              )}

              {/* Options de Configuration */}
              <ConfigSection title="🎙️ Modèle Whisper" icon="🤖">
                <select 
                  className="config-select"
                  value={config.modele_whisper}
                  onChange={(e) => handleConfigChange('modele_whisper', e.target.value)}
                  disabled={config.utiliser_demo}
                >
                  <option value="tiny">Tiny (rapide, moins précis)</option>
                  <option value="base">Base (équilibré) ⭐</option>
                  <option value="small">Small (précis)</option>
                  <option value="medium">Medium (très précis)</option>
                  <option value="large">Large (optimal)</option>
                </select>
                <span className="config-hint">
                  {config.utiliser_demo ? 'Mode démo activé' : 'Plus le modèle est grand, plus la précision est élevée'}
                </span>
              </ConfigSection>

              <ConfigSection title="📥 Langue Source" icon="🌍">
                <select 
                  className="config-select"
                  value={config.langue_source}
                  onChange={(e) => handleConfigChange('langue_source', e.target.value)}
                >
                  <option value="auto">🔍 Auto-détection (recommandé)</option>
                  {supportedLanguages.map(langue => (
                    <option key={langue.code} value={langue.code}>
                      {langue.native} ({langue.name})
                    </option>
                  ))}
                </select>
              </ConfigSection>

              <ConfigSection title="📤 Langue Cible" icon="🎯">
                <select 
                  className="config-select"
                  value={config.langue_cible}
                  onChange={(e) => handleConfigChange('langue_cible', e.target.value)}
                >
                  {supportedLanguages.map(langue => (
                    <option key={langue.code} value={langue.code}>
                      {langue.native} ({langue.name})
                    </option>
                  ))}
                </select>
              </ConfigSection>

              <ConfigSection title="📝 Sous-titres Multilingues" icon="🈲">
                <div className="multiselect-container">
                  {supportedLanguages
                    .filter(langue => langue.code !== config.langue_cible)
                    .map(langue => (
                      <label key={langue.code} className="checkbox-option">
                        <input 
                          type="checkbox"
                          checked={config.langues_sous_titres.includes(langue.code)}
                          onChange={(e) => {
                            const newLangues = e.target.checked
                              ? [...config.langues_sous_titres, langue.code]
                              : config.langues_sous_titres.filter(l => l !== langue.code);
                            handleConfigChange('langues_sous_titres', newLangues);
                          }}
                        />
                        <span>{langue.native}</span>
                      </label>
                    ))
                  }
                </div>
                {config.langues_sous_titres.length > 0 && (
                  <div className="selected-languages">
                    ✅ {config.langues_sous_titres.length} langue(s) sélectionnée(s)
                  </div>
                )}
              </ConfigSection>

              <ConfigSection title="🎤 Synthèse Vocale" icon="🔊">
                <div className="radio-group">
                  <label className={`radio-option ${config.methode_tts === 'Edge-TTS' ? 'selected' : ''}`}>
                    <input 
                      type="radio" 
                      name="tts" 
                      checked={config.methode_tts === 'Edge-TTS'}
                      onChange={() => handleConfigChange('methode_tts', 'Edge-TTS')}
                    />
                    <div className="radio-content">
                      <div className="radio-title">Edge-TTS (Microsoft) ⭐</div>
                      <div className="radio-description">Voix naturelles HD, qualité professionnelle</div>
                    </div>
                  </label>
                  <label className={`radio-option ${config.methode_tts === 'gTTS' ? 'selected' : ''}`}>
                    <input 
                      type="radio" 
                      name="tts" 
                      checked={config.methode_tts === 'gTTS'}
                      onChange={() => handleConfigChange('methode_tts', 'gTTS')}
                    />
                    <div className="radio-content">
                      <div className="radio-title">gTTS (Google)</div>
                      <div className="radio-description">Rapide et fiable, qualité standard</div>
                    </div>
                  </label>
                </div>
              </ConfigSection>

              <ConfigSection title="Options Avancées" icon="🔧">
                <label className="checkbox-option" style={{ border: 'none', padding: '8px 0' }}>
                  <input 
                    type="checkbox" 
                    checked={config.generer_sous_titres}
                    onChange={(e) => handleConfigChange('generer_sous_titres', e.target.checked)}
                  />
                  <span>📝 Générer des sous-titres CC</span>
                </label>
                
                <label className="checkbox-option" style={{ border: 'none', padding: '8px 0' }}>
                  <input 
                    type="checkbox" 
                    checked={config.synchronisation_ffmpeg}
                    onChange={(e) => handleConfigChange('synchronisation_ffmpeg', e.target.checked)}
                    disabled={!systemStatus?.ffmpeg}
                  />
                  <span>⏱️ Synchronisation audio (FFmpeg)</span>
                </label>
                <span className="config-hint">
                  Corrige automatiquement le décalage audio/vidéo
                </span>
              </ConfigSection>

              {/* Bouton Reset */}
              <button 
                onClick={resetProcess}
                className="process-button"
                style={{ 
                  background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                  marginTop: '20px'
                }}
              >
                🔄 Recommencer
              </button>
            </div>
          </aside>

          {/* Contenu Principal */}
          <main className="main-content">
            
            {/* Section Upload avec Drag & Drop */}
            <section className="upload-section">
              <div 
                className={`pro-card upload-card ${isDragOver ? 'drag-over' : ''}`}
                ref={dropZoneRef}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="upload-icon">📹</div>
                <h3 className="upload-title">
                  {uploadedFile ? 'Fichier Prêt !' : 'Déposez votre vidéo'}
                </h3>
                <p className="upload-subtitle">
                  {uploadedFile 
                    ? 'Votre vidéo est prête pour la traduction IA'
                    : 'Glissez-déposez votre fichier ou cliquez pour parcourir'
                  }
                </p>
                
                <input 
                  ref={fileInputRef}
                  type="file" 
                  id="video-upload"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="upload-input"
                />
                
                <button 
                  onClick={openFileSelector}
                  className="upload-button"
                >
                  {uploadedFile ? '✓ Fichier Sélectionné' : '📁 Choisir un Fichier'}
                </button>

                {!uploadedFile && (
                  <div style={{ marginTop: '20px', color: '#64748b', fontSize: '0.9rem' }}>
                    Formats supportés: MP4, AVI, MOV, MKV, WEBM • Max 200MB
                  </div>
                )}

                {uploadedFile && (
                  <div className="file-info">
                    <div className="file-details">
                      <div className="file-icon">🎬</div>
                      <div className="file-text">
                        <div className="file-name">{uploadedFile.name}</div>
                        <div className="file-size">
                          {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB • 
                          Prêt pour la traduction
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Bouton de Traitement Principal */}
            {uploadedFile && !processing && !results && (
              <div className="pro-card" style={{ textAlign: 'center' }}>
                <button 
                  onClick={handleProcess}
                  disabled={processing}
                  className="process-button"
                  style={{ fontSize: '1.4rem', padding: '25px' }}
                >
                  🚀 Lancer la Traduction IA
                </button>
                
                {!config.utiliser_demo && systemStatus && !systemStatus.whisper && (
                  <div className="warning-message">
                    ⚠️ Whisper AI n'est pas détecté. Le mode démo sera utilisé automatiquement.
                  </div>
                )}
              </div>
            )}

            {/* Section Progression */}
            {processing && (
              <section className="progress-section">
                <div className="pro-card progress-card">
                  <h3 className="progress-title">{currentStep}</h3>
                  
                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar" 
                      style={{ width: `${progress}%` }}
                    >
                      <span className="progress-text">{progress}%</span>
                    </div>
                  </div>

                  <div className="progress-steps">
                    {[
                      { icon: '📤', label: 'Upload', progress: 20 },
                      { icon: '🎵', label: 'Audio', progress: 40 },
                      { icon: '🧠', label: 'IA', progress: 60 },
                      { icon: '🌍', label: 'Traduction', progress: 80 },
                      { icon: '🎬', label: 'Final', progress: 95 }
                    ].map((step, index) => (
                      <div 
                        key={step.label}
                        className={`progress-step ${progress >= step.progress ? 'completed' : ''} ${currentStep.includes(step.label) ? 'active' : ''}`}
                      >
                        <span className="step-icon">{step.icon}</span>
                        <span>{step.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Section Résultats */}
            {results && !processing && (
              <section className="results-section">
                <div className="pro-card results-card">
                  <div className="results-header">
                    <h3 className="results-title">Traduction Réussie !</h3>
                    <p className="results-subtitle">
                      {getLanguageName(results.languages?.source || config.langue_source)} → {getLanguageName(results.languages?.target || config.langue_cible)}
                    </p>
                  </div>

                  {/* Aperçu Vidéo */}
                  <div className="video-preview-section">
                    <h4>🎥 Aperçu de la Vidéo Traduite</h4>
                    
                    {results.subtitles && results.subtitles.length > 0 && (
                      <div style={{ 
                        background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', 
                        padding: '16px 20px', 
                        borderRadius: '12px',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontSize: '1rem',
                        border: '2px solid #93c5fd'
                      }}>
                        <span>🎯</span>
                        <span>
                          <strong>{results.subtitles.length} langues de sous-titres disponibles</strong>
                          {' • '}Utilisez le bouton <strong>CC</strong> du lecteur pour les activer
                        </span>
                      </div>
                    )}

                    <div className="video-container">
                      <video 
                        ref={videoRef}
                        controls 
                        controlsList="nodownload"
                        className="video-player"
                        crossOrigin="anonymous"
                        onError={handleVideoError}
                        onLoadedData={handleVideoLoad}
                        poster="/api/thumbnail/{results.file_id}" // Optionnel: miniature
                      >
                        <source 
                          src={`${API_BASE}/preview/${results.file_id}`} 
                          type="video/mp4" 
                        />
                        
                        {results.subtitles && results.subtitles.map((langue, index) => (
                          <track
                            key={langue}
                            kind="subtitles"
                            src={`${API_BASE}/subtitles/${results.file_id}/${langue}`}
                            srcLang={langue}
                            label={getLanguageName(langue)}
                            default={index === 0}
                          />
                        ))}
                        
                        Votre navigateur ne supporte pas la lecture de vidéos.
                      </video>

                      {videoError && (
                        <div className="video-error-message">
                          {videoError}
                        </div>
                      )}
                    </div>

                    <div style={{ 
                      marginTop: '16px', 
                      padding: '16px', 
                      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                      borderRadius: '12px',
                      fontSize: '0.95rem',
                      color: '#166534',
                      border: '2px solid #86efac'
                    }}>
                      💡 <strong>Conseil professionnel :</strong> Les sous-titres sont intégrés comme pistes CC natives. 
                      Utilisez les contrôles standards du lecteur vidéo pour une expérience optimale.
                    </div>
                  </div>

                  {/* Transcription */}
                  <div style={{ marginBottom: '40px' }}>
                    <div className="transcription-section">
                      <div className="transcription-box">
                        <h4>📄 Transcription Originale</h4>
                        <div className="language-badge">
                          {getLanguageName(results.transcription?.language || config.langue_source)}
                        </div>
                        <div className="transcription-text">
                          {results.transcription?.original || 'Transcription non disponible'}
                        </div>
                      </div>
                      
                      <div className="transcription-box">
                        <h4>🌍 Texte Traduit</h4>
                        <div className="language-badge" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                          {getLanguageName(config.langue_cible)}
                        </div>
                        <div className="transcription-text">
                          {results.transcription?.translated || 'Traduction non disponible'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Téléchargements */}
                  <div className="download-section">
                    <h4>📥 Téléchargements</h4>
                    
                    <div className="download-grid">
                      <button 
                        onClick={downloadVideo}
                        className="download-button primary"
                      >
                        <span className="button-icon">🎬</span>
                        <div className="button-text">
                          <strong>Vidéo Traduite</strong>
                          <small>MP4 avec audio traduit et sous-titres</small>
                        </div>
                      </button>

                      <button 
                        onClick={downloadAudio}
                        className="download-button secondary"
                      >
                        <span className="button-icon">🎵</span>
                        <div className="button-text">
                          <strong>Audio Seul</strong>
                          <small>MP3 haute qualité</small>
                        </div>
                      </button>
                    </div>

                    {/* Sous-titres */}
                    {results.subtitles && results.subtitles.length > 0 && (
                      <div className="subtitles-section">
                        <h4>📝 Sous-titres Disponibles ({results.subtitles.length})</h4>
                        <p style={{ fontSize: '1rem', color: '#64748b', marginBottom: '20px' }}>
                          Les sous-titres sont intégrés dans la vidéo. Téléchargez-les séparément au format SRT :
                        </p>
                        <div className="subtitles-grid">
                          {results.subtitles.map(langue => (
                            <button
                              key={langue}
                              onClick={() => downloadSubtitles(langue)}
                              className="subtitle-button"
                            >
                              <span className="subtitle-icon">📄</span>
                              <span className="subtitle-lang">{getLanguageName(langue)}</span>
                              <span className="subtitle-format">.srt</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Stats et Partager */}
                  <div style={{ 
                    marginTop: '40px', 
                    padding: '30px', 
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    borderRadius: '16px',
                    textAlign: 'center',
                    border: '2px solid #e2e8f0'
                  }}>
                    <h4 style={{ marginBottom: '16px', color: '#1e293b' }}>🎉 Félicitations !</h4>
                    <p style={{ color: '#64748b', marginBottom: '20px' }}>
                      Votre vidéo a été traduite avec succès. Partager avec votre équipe ?
                    </p>
                    <button 
                      onClick={() => alert('Fonctionnalité de partage à implémenter')}
                      style={{
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      📤 Partager le Résultat
                    </button>
                  </div>
                </div>
              </section>
            )}
          </main>
        </div>
      </div>

      {/* Footer Professionnel */}
      <footer className="pro-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>🚀 TranslatePro AI</h4>
            <p>
              Solution professionnelle de traduction vidéo par IA. 
              Propulsé par les technologies Whisper AI et Edge-TTS.
            </p>
          </div>
          
          <div className="footer-section">
            <h4>📊 Statistiques</h4>
            <p>Vidéos traitées: <strong>{stats.videosProcessed.toLocaleString()}+</strong></p>
            <p>Taux de satisfaction: <strong>{stats.satisfactionRate}%</strong></p>
          </div>
          
          <div className="footer-section">
            <h4>🛠️ Technologies</h4>
            <p>• Whisper AI - OpenAI</p>
            <p>• Edge-TTS - Microsoft</p>
            <p>• FFmpeg</p>
            <p>• React & Node.js</p>
          </div>
          
          <div className="footer-section">
            <h4>📞 Support</h4>
            <p><a href="mailto:achrafallali2003@gmail.com">achrafallali2003@gmail.com</a></p>
            <p><a href="/docs">Documentation</a></p>
            <p><a href="/privacy">Politique de confidentialité</a></p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2025 TranslatePro AI-Achraf Allali. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
};

export default Translate;