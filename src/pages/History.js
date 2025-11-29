import React from 'react';
const History = () => {
  const recentProjects = [
    { 
      id: 1, 
      name: 'Présentation produit', 
      date: '2024-01-15', 
      status: 'Terminé', 
      language: 'FR → EN',
      subtitles: ['EN', 'FR'],
      synchronized: true
    },
    { 
      id: 2, 
      name: 'Tutoriel technique', 
      date: '2024-01-14', 
      status: 'En cours', 
      language: 'EN → ES',
      subtitles: ['ES', 'EN'],
      synchronized: true
    },
    { 
      id: 3, 
      name: 'Interview client', 
      date: '2024-01-13', 
      status: 'Terminé', 
      language: 'FR → DE',
      subtitles: ['DE', 'FR', 'EN'],
      synchronized: true
    }
  ];

  const upcomingFeatures = [
    { icon: "📚", title: "Historique des projets", description: "Consultez toutes vos traductions avec métriques détaillées" },
    { icon: "📊", title: "Statistiques détaillées", description: "Analysez vos usages et performances de traduction" },
    { icon: "🔄", title: "Réutilisation intelligente", description: "Retravaillez vos anciens projets avec les nouveaux réglages" }
  ];

  const stats = [
    { value: "12", label: "Vidéos traduites" },
    { value: "5", label: "Langues utilisées" },
    { value: "98%", label: "Précision moyenne" },
    { value: "100%", label: "Synchronisation" }
  ];

  const styles = `
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
    @keyframes gradient-shift { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-10%, -10%); } }
    @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
    
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
    
    .projects-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 25px; margin-bottom: 50px; }
    
    .project-card { background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%); border-radius: 20px; padding: 30px; border: 2px solid #e2e8f0; transition: all 0.3s ease; position: relative; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); }
    .project-card::before { content: ''; position: absolute; top: 0; left: 0; width: 6px; height: 100%; background: linear-gradient(135deg, #667eea, #764ba2); transform: scaleY(0); transform-origin: top; transition: transform 0.3s ease; }
    .project-card:hover { transform: translateY(-5px) scale(1.02); box-shadow: 0 12px 40px rgba(102, 126, 234, 0.2); border-color: #667eea; }
    .project-card:hover::before { transform: scaleY(1); }
    
    .project-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; gap: 15px; }
    .project-name { font-size: 1.4rem; font-weight: 700; color: #1e293b; margin: 0; flex: 1; }
    
    .project-status { padding: 8px 16px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; flex-shrink: 0; }
    .status-completed { background: linear-gradient(135deg, #10b981, #059669); color: white; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); }
    .status-processing { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3); animation: pulse 2s ease-in-out infinite; }
    
    .project-details { display: flex; flex-direction: column; gap: 12px; margin-bottom: 25px; padding: 20px; background: rgba(102, 126, 234, 0.05); border-radius: 12px; border-left: 4px solid #667eea; }
    
    .project-detail-item { display: flex; align-items: center; gap: 10px; font-size: 0.95rem; }
    .detail-label { font-weight: 600; color: #64748b; min-width: 130px; }
    .detail-value { color: #1e293b; font-weight: 500; }
    .sync-success { color: #10b981; font-weight: 700; display: flex; align-items: center; gap: 5px; }
    
    .project-actions { display: flex; gap: 12px; }
    .btn-secondary { flex: 1; background: white; color: #667eea; border: 2px solid #667eea; border-radius: 12px; padding: 12px 20px; font-weight: 600; font-size: 0.95rem; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .btn-secondary:hover { background: linear-gradient(135deg, #667eea, #764ba2); color: white; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3); }
    
    .stats-section { margin-top: 50px; padding-top: 40px; border-top: 3px solid #f8fafc; }
    .stats-title { font-size: 1.8rem; font-weight: 700; color: #1e293b; margin-bottom: 30px; text-align: center; display: flex; align-items: center; justify-content: center; gap: 12px; }
    
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; }
    .stat-card { background: linear-gradient(135deg, #667eea, #764ba2); color: white; border-radius: 20px; padding: 35px; text-align: center; box-shadow: 0 8px 30px rgba(102, 126, 234, 0.4); transition: all 0.3s ease; position: relative; overflow: hidden; }
    .stat-card::before { content: ''; position: absolute; top: -50%; right: -50%; width: 200px; height: 200px; background: rgba(255, 255, 255, 0.1); border-radius: 50%; }
    .stat-card:hover { transform: translateY(-8px) scale(1.05); box-shadow: 0 15px 45px rgba(102, 126, 234, 0.5); }
    
    .stat-value { font-size: 3rem; font-weight: 800; margin-bottom: 10px; position: relative; z-index: 1; }
    .stat-label { font-size: 1rem; opacity: 0.95; font-weight: 500; position: relative; z-index: 1; }
    
    .upcoming-features { display: flex; flex-direction: column; gap: 20px; }
    .feature-item { display: flex; align-items: center; gap: 20px; padding: 30px; background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%); border-radius: 16px; border: 2px solid #e2e8f0; border-left: 6px solid #667eea; transition: all 0.3s ease; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); }
    .feature-item:hover { background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05)); transform: translateX(10px); box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15); border-color: #667eea; }
    
    .feature-icon { font-size: 3rem; flex-shrink: 0; filter: drop-shadow(0 4px 8px rgba(102, 126, 234, 0.3)); }
    .feature-text { display: flex; flex-direction: column; gap: 8px; }
    .feature-text strong { font-size: 1.3rem; color: #1e293b; font-weight: 700; }
    .feature-text span { color: #64748b; font-size: 1rem; line-height: 1.6; }
    
    @media (max-width: 768px) {
      .projects-grid { grid-template-columns: 1fr; }
      .project-header { flex-direction: column; align-items: flex-start; }
      .project-actions { flex-direction: column; }
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .hero-section { padding: 80px 25px 100px; }
      .content-container { margin-top: -40px; padding: 0 25px 60px; }
      .pro-card { padding: 30px; }
    }
    
    @media (max-width: 480px) {
      .stats-grid { grid-template-columns: 1fr; }
      .feature-item { flex-direction: column; text-align: center; padding: 25px; }
      .detail-label { min-width: auto; }
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
            <div className="hero-icon">📊</div>
            <h1 className="hero-title">Historique</h1>
            <p className="hero-subtitle">Consultez vos traductions précédentes</p>
          </div>
        </section>
        
        <div className="content-container">
          <div className="pro-card">
            <div className="card-header">
              <div className="card-icon">📊</div>
              <h3 className="card-title">Projets récents</h3>
            </div>

            <div className="projects-grid">
              {recentProjects.map(project => (
                <div key={project.id} className="project-card">
                  <div className="project-header">
                    <h4 className="project-name">{project.name}</h4>
                    <span className={`project-status ${project.status === 'Terminé' ? 'status-completed' : 'status-processing'}`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="project-details">
                    <div className="project-detail-item">
                      <span className="detail-label">📅 Date:</span>
                      <span className="detail-value">{project.date}</span>
                    </div>
                    <div className="project-detail-item">
                      <span className="detail-label">🌍 Langue:</span>
                      <span className="detail-value">{project.language}</span>
                    </div>
                    <div className="project-detail-item">
                      <span className="detail-label">📝 Sous-titres:</span>
                      <span className="detail-value">{project.subtitles.join(', ')}</span>
                    </div>
                    {project.synchronized && (
                      <div className="project-detail-item">
                        <span className="detail-label">⚡ Synchronisation:</span>
                        <span className="sync-success">✓ Parfaite</span>
                      </div>
                    )}
                  </div>
                  <div className="project-actions">
                    <button className="btn-secondary">📥 Télécharger</button>
                    <button className="btn-secondary">📄 Sous-titres</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="stats-section">
              <h4 className="stats-title">📈 Statistiques</h4>
              <div className="stats-grid">
                {stats.map((stat, i) => (
                  <div key={i} className="stat-card">
                    <div className="stat-value">{stat.value}</div>
                    <div className="stat-label">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pro-card">
            <div className="card-header">
              <div className="card-icon">🔮</div>
              <h3 className="card-title">Fonctionnalités à venir</h3>
            </div>
            
            <div className="upcoming-features">
              {upcomingFeatures.map((feature, i) => (
                <div key={i} className="feature-item">
                  <span className="feature-icon">{feature.icon}</span>
                  <div className="feature-text">
                    <strong>{feature.title}</strong>
                    <span>{feature.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default History;