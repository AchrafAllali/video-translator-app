import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';
const Home = () => {
  const stats = [
    { value: "99%", label: "Précision", icon: "📈" },
    { value: "50+", label: "Langues", icon: "🌍" },
    { value: "10K+", label: "Vidéos traitées", icon: "🎬" },
    { value: "< 5min", label: "Temps moyen", icon: "⏱️" }
  ];

  const features = [
    {
      icon: "🎤",
      title: "Transcription IA",
      description: "Transcription précise avec Whisper AI de OpenAI pour une reconnaissance vocale de qualité professionnelle"
    },
    {
      icon: "🌐",
      title: "Multi-langues",
      description: "Support de 50+ langues pour l'audio et les sous-titres avec détection automatique de la langue source"
    },
    {
      icon: "🎵",
      title: "Audio HD",
      description: "Synthèse vocale haute qualité avec Edge-TTS pour un rendu naturel et professionnel"
    },
    {
      icon: "📄",
      title: "Sous-titres",
      description: "Génération automatique de sous-titres synchronisés avec précision au millième de seconde"
    },
    {
      icon: "⚡",
      title: "FFmpeg",
      description: "Traitement rapide et synchronisation audio optimisée pour des résultats en quelques minutes"
    },
    {
      icon: "🎬",
      title: "Vidéo finale",
      description: "Exportation vidéo complète avec audio traduit, sous-titres CC et qualité broadcast"
    }
  ];

  const steps = [
    { 
      number: "01", 
      title: "Téléchargez", 
      desc: "Importez votre vidéo en quelques clics",
      detail: "Formats supportés: MP4, AVI, MOV, MKV"
    },
    { 
      number: "02", 
      title: "Configurez", 
      desc: "Sélectionnez langues source et cible",
      detail: "Choisissez parmi 50+ langues disponibles"
    },
    { 
      number: "03", 
      title: "Traduisez", 
      desc: "L'IA traite votre vidéo automatiquement",
      detail: "Transcription, traduction et synthèse vocale"
    },
    { 
      number: "04", 
      title: "Téléchargez", 
      desc: "Récupérez votre vidéo traduite avec CC",
      detail: "Export en haute qualité"
    }
  ];

  const processSteps = [
    { icon: "🎤", label: "Transcription", progress: 100 },
    { icon: "🌐", label: "Traduction", progress: 87 },
    { icon: "🎵", label: "Synthèse vocale", progress: 45 },
    { icon: "📄", label: "Sous-titres CC", progress: 0 }
  ];

  return (
    <div className="page-container">
      {/* Animated Background */}
      <div className="animated-background">
        <div className="continuous-gradient"></div>
      </div>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-icon">⚡</span>
            <span>Propulsé par l'IA</span>
          </div>
          
          <h1 className="hero-title">
            Traduisez vos vidéos
            <br />
            <span className="hero-gradient-text">automatiquement</span>
          </h1>
          
          <p className="hero-subtitle">
            Solution professionnelle de traduction vidéo alimentée par l'intelligence artificielle. 
            Audio doublé, sous-titres synchronisés et qualité broadcast.
          </p>

          <div className="hero-buttons">
            <Link to="/translate">
              <button className="btn-primary">
                Essayer gratuitement
                <span className="btn-arrow">→</span>
              </button>
            </Link>
            <button className="btn-secondary">
              <span className="play-icon">▶</span>
              Voir la démo
            </button>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            {stats.map((stat, i) => (
              <div key={i} className="stat-card">
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Interface */}
      <section className="content-container">
        <div className="demo-interface">
          {/* Video Preview Area */}
          <div className="video-preview">
            <div className="video-content">
              <div className="mic-icon">🎤</div>
              <div className="sound-waves">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="wave-bar"></div>
                ))}
              </div>
            </div>

            {/* Translation Bubbles */}
            <div className="translation-bubbles">
              <div className="bubble fr">🇫🇷 Français</div>
              <div className="arrow">→</div>
              <div className="bubble en">🇬🇧 English</div>
            </div>

            {/* Progress Info */}
            <div className="progress-info">
              <div className="progress-header">
                <div className="progress-details">
                  <div className="progress-icon">🌐</div>
                  <div className="progress-text">
                    <div className="progress-title">Traduction en cours...</div>
                    <div className="progress-subtitle">Français → English</div>
                  </div>
                </div>
                <div className="progress-percentage">87%</div>
              </div>
              
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '87%' }}></div>
              </div>
            </div>
          </div>

          {/* Process Steps */}
          <div className="icons-row">
            {processSteps.map((step, i) => (
              <div key={i} className="icon-item">
                <div className={`icon-circle icon${i + 1} ${
                  step.progress === 100 ? 'completed' : 
                  step.progress > 0 ? 'active' : 
                  'pending'
                }`}>
                  {step.icon}
                </div>
                <div className="icon-label">{step.label}</div>
                <div className="icon-status">
                  {step.progress === 100 ? '✓ Terminé' : 
                   step.progress > 0 ? `${step.progress}%` : 
                   'En attente'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="content-container">
        <div className="section-header">
          <h2 className="section-title">Fonctionnalités professionnelles</h2>
          <p className="section-subtitle">
            Tous les outils dont vous avez besoin pour une traduction vidéo de qualité professionnelle
          </p>
        </div>

        <div className="feature-grid">
          {features.map((feature, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc">{feature.description}</p>
              <div className="feature-link">
                En savoir plus <span className="link-arrow">→</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Process Steps */}
      <section className="process-section">
        <h2 className="section-title">Comment ça marche ?</h2>
        <p className="section-subtitle-center">
          Un processus simple en 4 étapes pour des résultats professionnels
        </p>

        <div className="process-steps">
          {steps.map((step, i) => (
            <div key={i} className="process-step">
              <div className="step-number">{step.number}</div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.desc}</p>
              <p className="step-detail">{step.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section className="cta-section">
        <h2 className="cta-title">Prêt à traduire vos vidéos ?</h2>
        <p className="cta-subtitle">
          Rejoignez des milliers de créateurs qui font confiance à notre plateforme
        </p>
        
        <Link to="/translate">
          <button className="btn-primary btn-large">
            Commencer gratuitement
            <span className="btn-arrow">→</span>
          </button>
        </Link>

        <div className="cta-benefits">
          <div className="benefit-item">
            <span className="benefit-icon">✓</span>
            <span>Sans carte bancaire</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">✓</span>
            <span>Essai gratuit illimité</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">✓</span>
            <span>Support 24/7</span>
          </div>
        </div>
      </section>
    </div>
    
  );
};

export default Home;