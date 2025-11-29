import React, { useState } from 'react';

const Guide = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const quickSteps = [
    { number: 1, title: "Configuration", description: "Ajustez les paramètres dans la barre latérale", icon: "⚙️" },
    { number: 2, title: "Upload", description: "Téléchargez votre vidéo (MP4, AVI, MOV, MKV)", icon: "📤" },
    { number: 3, title: "Traitement", description: "Lancez la traduction avec synchronisation automatique", icon: "⚡" },
    { number: 4, title: "Téléchargement", description: "Récupérez votre vidéo traduite avec sous-titres CC", icon: "✅" }
  ];

  const features = [
    { icon: "🎤", title: "Transcription IA", description: "Utilise Whisper AI de OpenAI avec précision élevée pour 99+ langues" },
    { icon: "🌍", title: "Traduction multilingue", description: "Support de 9+ langues majeures avec Google Translate" },
    { icon: "🎵", title: "Synthèse vocale HD", description: "Edge-TTS pour une qualité premium avec voix naturelles" },
    { icon: "⚡", title: "Synchronisation automatique", description: "Audio et sous-titres parfaitement synchronisés avec FFmpeg" }
  ];

  const languages = [
    { flag: "🇬🇧", name: "English" }, { flag: "🇫🇷", name: "Français" }, { flag: "🇪🇸", name: "Español" },
    { flag: "🇩🇪", name: "Deutsch" }, { flag: "🇮🇹", name: "Italiano" }, { flag: "🇵🇹", name: "Português" },
    { flag: "🇸🇦", name: "العربية" }, { flag: "🇨🇳", name: "中文" }, { flag: "🇯🇵", name: "日本語" }
  ];

  const faqs = [
    { question: "Les sous-titres ne s'affichent pas dans le lecteur vidéo", answer: "Utilisez le bouton CC dans le lecteur vidéo pour activer les sous-titres. Les pistes CC sont intégrées nativement dans la vidéo." },
    { question: "Décalage entre l'audio et les sous-titres", answer: "La version 5.4.0 corrige automatiquement ce problème avec la synchronisation audio/sous-titres. Si le problème persiste, vérifiez que FFmpeg est correctement installé." },
    { question: "La traduction audio ne fonctionne pas", answer: "Vérifiez que Edge-TTS est installé : pip install edge-tts. Assurez-vous d'avoir une connexion internet pour la synthèse vocale." }
  ];

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const styles = `
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
    @keyframes gradient-shift { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-10%, -10%); } }
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    .page-container { min-height: 100vh; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); position: relative; overflow-x: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    
    .animated-background { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; overflow: hidden; }
    .continuous-gradient { position: absolute; width: 150%; height: 150%; background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 25%, rgba(240, 147, 251, 0.15) 50%, rgba(79, 172, 254, 0.15) 75%, rgba(102, 126, 234, 0.15) 100%); animation: gradient-shift 20s ease infinite; }
    
    .hero-section { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 100px 30px 120px; position: relative; overflow: hidden; z-index: 1; }
    .hero-section::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: repeating-linear-gradient(45deg, transparent, transparent 50px, rgba(255, 255, 255, 0.03) 50px, rgba(255, 255, 255, 0.03) 100px); }
    
    .hero-content { max-width: 900px; margin: 0 auto; text-align: center; position: relative; animation: fadeInUp 1s ease; }
    .hero-icon { width: 100px; height: 100px; background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(10px); border-radius: 20px; display: inline-flex; align-items: center; justify-content: center; font-size: 4rem; margin-bottom: 30px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2); }
    .hero-title { font-size: clamp(2.5rem, 6vw, 4.5rem); font-weight: 800; color: white; margin-bottom: 20px; text-shadow: 0 4px 20px rgba(0, 0, 0, 0.15); letter-spacing: -0.02em; line-height: 1.2; }
    .hero-subtitle { font-size: clamp(1.1rem, 2.5vw, 1.6rem); color: rgba(255, 255, 255, 0.95); font-weight: 300; line-height: 1.6; max-width: 700px; margin: 0 auto; }
    
    .content-container { max-width: 1400px; margin: -60px auto 0; padding: 0 30px 80px; position: relative; z-index: 2; }
    
    .pro-card { background: white; border-radius: 24px; padding: 45px; margin-bottom: 40px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); border: 2px solid #e2e8f0; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); animation: fadeInUp 0.8s ease; position: relative; overflow: hidden; }
    .pro-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 5px; background: linear-gradient(90deg, #667eea, #764ba2, #f093fb); transform: scaleX(0); transform-origin: left; transition: transform 0.5s ease; }
    .pro-card:hover { transform: translateY(-8px); box-shadow: 0 20px 50px rgba(102, 126, 234, 0.25); border-color: #667eea; }
    .pro-card:hover::before { transform: scaleX(1); }
    
    .card-header { display: flex; align-items: center; gap: 25px; margin-bottom: 40px; padding-bottom: 25px; border-bottom: 3px solid #f8fafc; }
    .card-icon { width: 75px; height: 75px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; box-shadow: 0 8px 25px rgba(102, 126, 234, 0.35); flex-shrink: 0; animation: float 3s ease-in-out infinite; }
    .card-title { font-size: 2.2rem; font-weight: 700; color: #1e293b; margin: 0; letter-spacing: -0.01em; }
    
    .quick-steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 25px; }
    .quick-step { background: #f8fafc; padding: 35px; border-radius: 20px; border-left: 6px solid #667eea; transition: all 0.3s ease; position: relative; animation: slideInLeft 0.6s ease; animation-fill-mode: both; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); }
    .quick-step:nth-child(1) { animation-delay: 0.1s; }
    .quick-step:nth-child(2) { animation-delay: 0.2s; }
    .quick-step:nth-child(3) { animation-delay: 0.3s; }
    .quick-step:nth-child(4) { animation-delay: 0.4s; }
    .quick-step:hover { transform: translateX(10px) scale(1.03); box-shadow: 0 10px 40px rgba(102, 126, 234, 0.2); background: white; }
    
    .step-icon { font-size: 3.5rem; margin-bottom: 20px; display: block; }
    .step-number { width: 55px; height: 55px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 1.4rem; font-weight: 800; color: white; margin-bottom: 20px; box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4); }
    .step-title { font-size: 1.5rem; font-weight: 700; color: #1e293b; margin-bottom: 12px; }
    .step-description { color: #64748b; line-height: 1.7; font-size: 1.05rem; }
    
    .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 30px; }
    .feature-item-detailed { background: white; padding: 40px; border-radius: 20px; border: 2px solid #e2e8f0; transition: all 0.3s ease; position: relative; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); }
    .feature-item-detailed::before { content: ''; position: absolute; top: -50%; right: -50%; width: 200%; height: 200%; background: linear-gradient(135deg, #667eea, #764ba2); opacity: 0; transition: opacity 0.5s ease; transform: rotate(45deg); }
    .feature-item-detailed:hover { transform: translateY(-10px) scale(1.03); border-color: transparent; box-shadow: 0 20px 50px rgba(102, 126, 234, 0.25); }
    .feature-item-detailed:hover::before { opacity: 0.06; }
    
    .feature-icon-detailed { width: 85px; height: 85px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 2.8rem; margin-bottom: 25px; box-shadow: 0 10px 30px rgba(102, 126, 234, 0.35); transition: transform 0.4s ease; position: relative; z-index: 1; }
    .feature-item-detailed:hover .feature-icon-detailed { transform: rotate(5deg) scale(1.1); }
    .feature-content { position: relative; z-index: 1; }
    .feature-title-detailed { font-size: 1.6rem; font-weight: 700; color: #1e293b; margin-bottom: 15px; }
    .feature-description-detailed { color: #64748b; line-height: 1.8; font-size: 1.05rem; }
    
    .languages-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
    .language-item { padding: 20px 25px; background: white; border: 2px solid #e2e8f0; border-radius: 16px; font-weight: 600; font-size: 1.1rem; color: #1e293b; transition: all 0.3s ease; cursor: pointer; position: relative; overflow: hidden; display: flex; align-items: center; gap: 15px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); }
    .language-item::before { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1)); transition: left 0.4s ease; }
    .language-item:hover { border-color: #667eea; transform: translateX(8px); box-shadow: 0 4px 20px rgba(102, 126, 234, 0.15); color: #667eea; }
    .language-item:hover::before { left: 0; }
    .language-flag { font-size: 2rem; position: relative; z-index: 1; }
    .language-name { position: relative; z-index: 1; }
    
    .installation-content { margin: 35px 0; }
    .code-block { background: #0f172a; padding: 40px; border-radius: 20px; margin-bottom: 35px; position: relative; overflow: hidden; box-shadow: 0 10px 40px rgba(15, 23, 42, 0.4); }
    .code-block::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 5px; background: linear-gradient(90deg, #667eea, #764ba2, #f093fb); }
    .code-block h4 { color: #f1f5f9; font-size: 1.4rem; font-weight: 700; margin-bottom: 20px; display: flex; align-items: center; gap: 12px; }
    .code-block pre { background: #1e293b; padding: 25px 30px; border-radius: 12px; overflow-x: auto; font-family: 'Monaco', 'Menlo', monospace; font-size: 1rem; line-height: 1.7; color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.4); margin: 0; }
    
    .requirements { margin-top: 40px; }
    .requirements h4 { font-size: 1.5rem; color: #1e293b; margin-bottom: 25px; font-weight: 700; display: flex; align-items: center; gap: 12px; }
    .requirement-item { background: #f8fafc; padding: 25px 30px; border-radius: 16px; margin-bottom: 20px; border-left: 6px solid #667eea; transition: all 0.3s ease; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); }
    .requirement-item:hover { background: white; box-shadow: 0 4px 20px rgba(102, 126, 234, 0.1); transform: translateX(8px); }
    .requirement-item strong { display: block; margin-bottom: 15px; color: #1e293b; font-weight: 700; font-size: 1.15rem; }
    .requirement-item code { background: #0f172a; color: #10b981; padding: 12px 20px; border-radius: 12px; font-family: 'Monaco', 'Menlo', monospace; font-size: 0.95rem; display: inline-block; box-shadow: 0 4px 15px rgba(15, 23, 42, 0.25); }
    
    .sync-info { margin-top: 40px; background: linear-gradient(135deg, #667eea, #764ba2); padding: 40px; border-radius: 20px; color: white; box-shadow: 0 10px 40px rgba(102, 126, 234, 0.2); }
    .sync-info h4 { font-size: 1.5rem; margin-bottom: 25px; font-weight: 700; display: flex; align-items: center; gap: 12px; color: white; }
    .sync-item { background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(10px); padding: 20px 25px; border-radius: 12px; margin-bottom: 15px; border: 1px solid rgba(255, 255, 255, 0.2); }
    .sync-item:last-child { margin-bottom: 0; }
    .sync-item strong { display: block; margin-bottom: 10px; font-weight: 700; font-size: 1.15rem; color: white; }
    .sync-item span { color: rgba(255, 255, 255, 0.95); line-height: 1.7; display: block; }
    
    .faq-section { margin-top: 35px; }
    .faq-item { background: white; margin-bottom: 20px; border: 2px solid #e2e8f0; border-radius: 16px; overflow: hidden; transition: all 0.3s ease; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); }
    .faq-item:hover { border-color: #667eea; box-shadow: 0 4px 20px rgba(102, 126, 234, 0.1); }
    .faq-question { padding: 25px 30px; background: #f8fafc; font-weight: 700; font-size: 1.15rem; color: #1e293b; cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 20px; transition: all 0.3s ease; user-select: none; }
    .faq-question:hover { background: linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.08)); color: #667eea; }
    .faq-arrow { font-size: 1.2rem; color: #667eea; transition: transform 0.3s ease; flex-shrink: 0; }
    .faq-item.active .faq-arrow { transform: rotate(180deg); }
    .faq-answer { padding: 25px 30px; background: white; color: #64748b; line-height: 1.8; font-size: 1.05rem; border-top: 2px solid #f8fafc; animation: fadeInUp 0.4s ease; }
    .faq-answer p { margin: 0; }
    
    .footer { background: #0f172a; color: rgba(255, 255, 255, 0.7); padding: 50px 30px; text-align: center; font-size: 1.1rem; line-height: 1.7; }
    .footer p { margin: 0; max-width: 800px; margin: 0 auto; }
    
    @media (max-width: 768px) {
      .quick-steps, .features-grid, .languages-grid { grid-template-columns: 1fr; }
      .hero-section { padding: 80px 25px 100px; }
      .content-container { margin-top: -40px; padding: 0 25px 60px; }
      .pro-card { padding: 30px; }
      .card-header { flex-direction: column; text-align: center; gap: 15px; }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="page-container">
        <div className="animated-background">
          <div className="continuous-gradient"></div>
        </div>

        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-icon">📚</div>
            <h1 className="hero-title">Guide d'utilisation</h1>
            <p className="hero-subtitle">Tout ce que vous devez savoir pour maîtriser l'application</p>
          </div>
        </section>
        
        <div className="content-container">
          <div className="pro-card">
            <div className="card-header">
              <div className="card-icon">🚀</div>
              <h3 className="card-title">Démarrage rapide</h3>
            </div>
            <div className="quick-steps">
              {quickSteps.map((step, i) => (
                <div key={i} className="quick-step">
                  <div className="step-icon">{step.icon}</div>
                  <div className="step-number">{step.number}</div>
                  <div className="step-content">
                    <h4 className="step-title">{step.title}</h4>
                    <p className="step-description">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pro-card">
            <div className="card-header">
              <div className="card-icon">✨</div>
              <h3 className="card-title">Fonctionnalités principales</h3>
            </div>
            <div className="features-grid">
              {features.map((f, i) => (
                <div key={i} className="feature-item-detailed">
                  <div className="feature-icon-detailed">{f.icon}</div>
                  <div className="feature-content">
                    <h4 className="feature-title-detailed">{f.title}</h4>
                    <p className="feature-description-detailed">{f.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pro-card">
            <div className="card-header">
              <div className="card-icon">🌍</div>
              <h3 className="card-title">Langues supportées</h3>
            </div>
            <div className="languages-grid">
              {languages.map((l, i) => (
                <div key={i} className="language-item">
                  <span className="language-flag">{l.flag}</span>
                  <span className="language-name">{l.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pro-card">
            <div className="card-header">
              <div className="card-icon">💻</div>
              <h3 className="card-title">Installation & Dépendances</h3>
            </div>
            <div className="installation-content">
              <div className="code-block">
                <h4>📦 Dépendances requises:</h4>
                <pre>pip install flask flask-cors whisper deep-translator edge-tts</pre>
              </div>
              <div className="requirements">
                <h4>⚙️ FFmpeg (obligatoire):</h4>
                <div className="requirement-item">
                  <strong>Windows:</strong>
                  <code>choco install ffmpeg</code>
                </div>
                <div className="requirement-item">
                  <strong>Mac:</strong>
                  <code>brew install ffmpeg</code>
                </div>
                <div className="requirement-item">
                  <strong>Linux:</strong>
                  <code>sudo apt install ffmpeg</code>
                </div>
              </div>
              <div className="sync-info">
                <h4>🎯 Synchronisation audio/sous-titres:</h4>
                <div className="sync-item">
                  <strong>Fonctionnalité:</strong>
                  <span>La nouvelle version corrige automatiquement le décalage entre l'audio et les sous-titres</span>
                </div>
                <div className="sync-item">
                  <strong>Technique:</strong>
                  <span>Utilise FFprobe pour mesurer les durées et appliquer un ratio de synchronisation</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pro-card">
            <div className="card-header">
              <div className="card-icon">❓</div>
              <h3 className="card-title">FAQ - Problèmes courants</h3>
            </div>
            <div className="faq-section">
              {faqs.map((faq, i) => (
                <div key={i} className={`faq-item ${openFaqIndex === i ? 'active' : ''}`}>
                  <div className="faq-question" onClick={() => toggleFaq(i)}>
                    <span>{faq.question}</span>
                    <span className="faq-arrow">▼</span>
                  </div>
                  {openFaqIndex === i && (
                    <div className="faq-answer">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <footer className="footer">
          <p>Besoin d'aide supplémentaire ? Consultez la documentation complète ou contactez le support.</p>
        </footer>
      </div>
    </>
  );
};

export default Guide;