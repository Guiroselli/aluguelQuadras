import React, { useState } from 'react';
import { User, MapPin, Home, Mail, Lock, AlertCircle } from 'lucide-react';

export interface UserProfile {
  email: string;
  password?: string; // Optional because we don't need to pass it everywhere
  userName: string;
  houseStreet: string;
  houseNumber: string;
}

interface LoginViewProps {
  onLogin: (profile: UserProfile) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState<UserProfile>({
    email: '',
    password: '',
    userName: '',
    houseStreet: '',
    houseNumber: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    const savedUsers: UserProfile[] = JSON.parse(localStorage.getItem('condo_users') || '[]');
    const emailToFind = formData.email.trim().toLowerCase();
    
    if (isLoginMode) {
      if (!emailToFind || !formData.password) {
        setErrorMsg('Por favor, preencha o e-mail e a senha.');
        return;
      }

      const existingUser = savedUsers.find(u => u.email === emailToFind);
      if (existingUser) {
        if (existingUser.password !== formData.password) {
          setErrorMsg('Senha incorreta.');
          return;
        }
        onLogin(existingUser);
      } else {
        setErrorMsg('E-mail não encontrado. Por favor, crie uma conta.');
      }
    } else {
      // Sign Up Mode
      const cleanData = {
        email: emailToFind,
        password: formData.password,
        userName: formData.userName.trim(),
        houseStreet: formData.houseStreet.trim(),
        houseNumber: formData.houseNumber.trim()
      };
      
      if (cleanData.email && cleanData.password && cleanData.userName && cleanData.houseStreet && cleanData.houseNumber) {
        if (savedUsers.some((u: any) => u.email === cleanData.email)) {
           setErrorMsg('Esse e-mail já está cadastrado. Faça o login.');
           return;
        }
        
        savedUsers.push(cleanData);
        localStorage.setItem('condo_users', JSON.stringify(savedUsers));
        onLogin(cleanData);
      } else {
        setErrorMsg('Por favor, preencha todos os campos obrigatórios.');
      }
    }
  };

  return (
    <div className="login-wrapper animate-fade-in" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: 'url("/clube-fundo.jpg")',
      backgroundPosition: 'center',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      position: 'relative'
    }}>
      {/* Overlay to ensure text readability */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'linear-gradient(to bottom right, rgba(13, 14, 14, 0.75), rgba(0, 0, 0, 0.95))',
        zIndex: 0
      }} />

      <div className="login-glass-panel p-12 animate-scale-in" style={{ maxWidth: '500px', width: '90%', position: 'relative', zIndex: 1 }}>
        <div className="text-center mb-8">
          <div style={{
            marginBottom: '1.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <h1 style={{ 
              fontFamily: "'Playfair Display', serif", 
              fontSize: '3rem', 
              fontWeight: 700, 
              color: 'var(--text-main)', 
              lineHeight: 0.9, 
              letterSpacing: '-0.02em',
              margin: 0,
              display: 'flex',
              alignItems: 'center'
            }}>
              VINTA
              <span style={{ 
                fontFamily: "'Pinyon Script', cursive", 
                fontSize: '4.8rem', 
                color: 'var(--primary)', 
                margin: '0 -5px',
                height: '45px',
                display: 'inline-flex',
                alignItems: 'center',
                transform: 'translateY(5px)'
              }}>
                G
              </span>
              E
            </h1>
            <span style={{ 
              fontFamily: "'Great Vibes', cursive", 
              fontSize: '1.6rem', 
              color: 'var(--text-main)',
              marginTop: '-5px',
              marginLeft: '20px' 
            }}>
              Arte de Morar
            </span>
          </div>
          <h2 style={{ fontSize: '2.1rem', marginBottom: '0.25rem', color: 'var(--text-main)' }}>{isLoginMode ? 'Acessar Conta' : 'Criar Conta'}</h2>
          <p className="text-muted" style={{ fontSize: '0.95rem' }}>
            {isLoginMode ? 'Insira seu e-mail e senha para continuar.' : 'Identifique-se para acessar o sistema de reservas.'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-md" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <AlertCircle size={18} />
            <span style={{ fontSize: '0.9rem' }}>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="form-group">
            <label className="text-sm text-muted">E-mail</label>
            <div className="input-with-icon" style={{ position: 'relative', marginTop: '4px' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                required
                style={{ width: '100%', paddingLeft: '3rem' }}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="seu@email.com"
                className="input-field"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="text-sm text-muted">Senha</label>
            <div className="input-with-icon" style={{ position: 'relative', marginTop: '4px' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                required
                style={{ width: '100%', paddingLeft: '3rem' }}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="input-field"
              />
            </div>
          </div>

          {!isLoginMode && (
            <>
              <div className="form-group">
                <label className="text-sm text-muted">Nome Completo</label>
                <div className="input-with-icon" style={{ position: 'relative', marginTop: '4px' }}>
                  <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    required
                    style={{ width: '100%', paddingLeft: '3rem' }}
                    value={formData.userName}
                    onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                    placeholder="Sérgio Almeida"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 2 }}>
                  <label className="text-sm text-muted">Rua/Bloco</label>
                  <div className="input-with-icon" style={{ position: 'relative', marginTop: '4px' }}>
                    <MapPin size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      required
                      style={{ width: '100%', paddingLeft: '3rem' }}
                      value={formData.houseStreet}
                      onChange={(e) => setFormData({ ...formData, houseStreet: e.target.value })}
                      placeholder="Ex: Rua A"
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label className="text-sm text-muted">Número</label>
                  <div className="input-with-icon" style={{ position: 'relative', marginTop: '4px' }}>
                    <Home size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      required
                      style={{ width: '100%', paddingLeft: '3rem' }}
                      value={formData.houseNumber}
                      onChange={(e) => setFormData({ ...formData, houseNumber: e.target.value })}
                      placeholder="Ex: 42"
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '1rem' }}>
            {isLoginMode ? 'Entrar' : 'Cadastrar'}
          </button>
          
          <div className="text-center" style={{ marginTop: '0.5rem' }}>
            <button 
              type="button" 
              className="text-muted"
              style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9rem' }}
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setErrorMsg('');
              }}
            >
              {isLoginMode ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginView;
