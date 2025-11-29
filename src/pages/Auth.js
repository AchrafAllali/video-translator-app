import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Video, Globe, Mic, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Ajout des hooks pour l'authentification et la navigation
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (!formData.password) {
      newErrors.password = 'Mot de passe requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Minimum 6 caractères';
    }

    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = 'Nom requis';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Confirmation requise';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      let result;
      
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await register(formData.name, formData.email, formData.password);
      }
      
      if (result.success) {
        // Redirection vers la page d'accueil après connexion réussie
        navigate('/');
      } else {
        alert('Erreur: ' + result.error);
      }
    } catch (error) {
      alert('Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const floatingIcons = [
    { Icon: Video, delay: 0, duration: 20 },
    { Icon: Globe, delay: 2, duration: 25 },
    { Icon: Mic, delay: 4, duration: 22 },
    { Icon: FileText, delay: 6, duration: 24 }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      {/* Animated Background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        zIndex: 0
      }}>
        <div style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
          top: '-250px',
          left: '-250px',
          animation: 'float 20s infinite ease-in-out'
        }} />
        <div style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 70%)',
          bottom: '-200px',
          right: '-200px',
          animation: 'float 25s infinite ease-in-out reverse'
        }} />

        {floatingIcons.map(({ Icon, delay, duration }, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: `${20 + (index * 20)}%`,
              left: `${10 + (index * 20)}%`,
              animation: `floatIcon ${duration}s infinite ease-in-out`,
              animationDelay: `${delay}s`,
              opacity: 0.15
            }}
          >
            <Icon size={48} color="white" />
          </div>
        ))}

        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          opacity: 0.5
        }} />
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(50px, -50px) scale(1.1); }
          50% { transform: translate(-30px, 30px) scale(0.9); }
          75% { transform: translate(40px, 20px) scale(1.05); }
        }

        @keyframes floatIcon {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(5deg); }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .input-field:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.15);
        }

        .btn-primary:active {
          transform: translateY(0);
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Left Panel - Branding */}
      <div style={{
        flex: '1',
        padding: '80px 60px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 1,
        animation: 'slideInLeft 0.8s ease-out'
      }}>
        <div style={{ maxWidth: '500px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '48px'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255,255,255,0.3)'
            }}>
              <Video size={32} color="white" />
            </div>
            <div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: '800',
                color: 'white',
                margin: 0,
                letterSpacing: '-0.5px'
              }}>
                VideoTranslator
              </h1>
              <p style={{
                fontSize: '0.9rem',
                color: 'rgba(255,255,255,0.9)',
                margin: 0
              }}>
                AI-Powered Translation
              </p>
            </div>
          </div>

          <h2 style={{
            fontSize: '3rem',
            fontWeight: '800',
            color: 'white',
            marginBottom: '24px',
            lineHeight: '1.2',
            letterSpacing: '-1px'
          }}>
            Traduisez vos vidéos
            <br />
            <span style={{ 
              background: 'linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.7) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              en quelques clics
            </span>
          </h2>

          <p style={{
            fontSize: '1.2rem',
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '48px',
            lineHeight: '1.6'
          }}>
            Intelligence artificielle avancée pour la transcription, traduction et synchronisation audio parfaite.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              { icon: '🎤', text: 'Transcription IA avec Whisper' },
              { icon: '🌍', text: 'Support de 9+ langues' },
              { icon: '🎵', text: 'Audio HD avec Edge-TTS' },
              { icon: '📝', text: 'Sous-titres CC intégrés' }
            ].map((feature, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px 24px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <span style={{ fontSize: '1.5rem' }}>{feature.icon}</span>
                <span style={{
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}>
                  {feature.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div style={{
        width: '550px',
        background: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px',
        position: 'relative',
        zIndex: 1,
        boxShadow: '-10px 0 40px rgba(0,0,0,0.1)',
        animation: 'slideInRight 0.8s ease-out'
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          {/* Toggle Buttons */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '40px',
            background: '#f3f4f6',
            padding: '4px',
            borderRadius: '12px'
          }}>
            <button
              onClick={() => setIsLogin(true)}
              style={{
                flex: 1,
                padding: '12px',
                border: 'none',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                background: isLogin ? 'white' : 'transparent',
                color: isLogin ? '#667eea' : '#6b7280',
                boxShadow: isLogin ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              Connexion
            </button>
            <button
              onClick={() => setIsLogin(false)}
              style={{
                flex: 1,
                padding: '12px',
                border: 'none',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                background: !isLogin ? 'white' : 'transparent',
                color: !isLogin ? '#667eea' : '#6b7280',
                boxShadow: !isLogin ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              Inscription
            </button>
          </div>

          <h3 style={{
            fontSize: '1.8rem',
            fontWeight: '700',
            marginBottom: '8px',
            color: '#1f2937'
          }}>
            {isLogin ? 'Bon retour!' : 'Créer un compte'}
          </h3>
          <p style={{
            fontSize: '0.95rem',
            color: '#6b7280',
            marginBottom: '32px'
          }}>
            {isLogin 
              ? 'Connectez-vous pour accéder à vos projets' 
              : 'Commencez à traduire vos vidéos gratuitement'}
          </p>

          {/* Form Fields */}
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#374151'
                }}>
                  Nom complet
                </label>
                <div style={{ position: 'relative' }}>
                  <User
                    size={20}
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#9ca3af'
                    }}
                  />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Jean Dupont"
                    className="input-field"
                    style={{
                      width: '100%',
                      padding: '14px 14px 14px 48px',
                      border: `2px solid ${errors.name ? '#ef4444' : '#e5e7eb'}`,
                      borderRadius: '10px',
                      fontSize: '0.95rem',
                      transition: 'all 0.3s',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                {errors.name && (
                  <p style={{
                    fontSize: '0.85rem',
                    color: '#ef4444',
                    marginTop: '6px'
                  }}>
                    {errors.name}
                  </p>
                )}
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#374151'
              }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={20}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af'
                  }}
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="exemple@email.com"
                  className="input-field"
                  style={{
                    width: '100%',
                    padding: '14px 14px 14px 48px',
                    border: `2px solid ${errors.email ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '10px',
                    fontSize: '0.95rem',
                    transition: 'all 0.3s',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              {errors.email && (
                <p style={{
                  fontSize: '0.85rem',
                  color: '#ef4444',
                  marginTop: '6px'
                }}>
                  {errors.email}
                </p>
              )}
            </div>

            <div style={{ marginBottom: isLogin ? '24px' : '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#374151'
              }}>
                Mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={20}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af'
                  }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="input-field"
                  style={{
                    width: '100%',
                    padding: '14px 48px 14px 48px',
                    border: `2px solid ${errors.password ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '10px',
                    fontSize: '0.95rem',
                    transition: 'all 0.3s',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#9ca3af'
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p style={{
                  fontSize: '0.85rem',
                  color: '#ef4444',
                  marginTop: '6px'
                }}>
                  {errors.password}
                </p>
              )}
            </div>

            {!isLogin && (
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#374151'
                }}>
                  Confirmer le mot de passe
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={20}
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#9ca3af'
                    }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="input-field"
                    style={{
                      width: '100%',
                      padding: '14px 14px 14px 48px',
                      border: `2px solid ${errors.confirmPassword ? '#ef4444' : '#e5e7eb'}`,
                      borderRadius: '10px',
                      fontSize: '0.95rem',
                      transition: 'all 0.3s',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                {errors.confirmPassword && (
                  <p style={{
                    fontSize: '0.85rem',
                    color: '#ef4444',
                    marginTop: '6px'
                  }}>
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {isLogin && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '32px'
              }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  color: '#6b7280'
                }}>
                  <input type="checkbox" style={{ cursor: 'pointer' }} />
                  Se souvenir de moi
                </label>
                <span
                  onClick={() => alert('Fonctionnalité à venir')}
                  style={{
                    fontSize: '0.9rem',
                    color: '#667eea',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Mot de passe oublié?
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '16px',
                background: loading 
                  ? '#9ca3af' 
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.3s',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '3px solid rgba(255,255,255,0.3)',
                    borderTop: '3px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Chargement...
                </>
              ) : (
                <>
                  {isLogin ? 'Se connecter' : "S'inscrire"}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* Social Login */}
          <div style={{ marginTop: '32px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
              <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                Ou continuer avec
              </span>
              <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
            </div>

            </div>

          <p style={{
            marginTop: '32px',
            textAlign: 'center',
            fontSize: '0.85rem',
            color: '#6b7280'
          }}>
            {isLogin ? "Pas encore de compte? " : "Déjà inscrit? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              style={{
                background: 'none',
                border: 'none',
                color: '#667eea',
                fontWeight: '600',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0
              }}
            >
              {isLogin ? "S'inscrire" : "Se connecter"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;