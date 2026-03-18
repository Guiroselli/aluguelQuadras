import React, { useState } from 'react';
import { User, MapPin, Home } from 'lucide-react';

interface UserProfile {
  userName: string;
  houseStreet: string;
  houseNumber: string;
}

interface LoginViewProps {
  onLogin: (profile: UserProfile) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [formData, setFormData] = useState<UserProfile>({
    userName: '',
    houseStreet: '',
    houseNumber: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanData = {
      userName: formData.userName.trim(),
      houseStreet: formData.houseStreet.trim(),
      houseNumber: formData.houseNumber.trim()
    };
    
    if (cleanData.userName && cleanData.houseStreet && cleanData.houseNumber) {
      onLogin(cleanData);
    }
  };

  return (
    <div className="login-container animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="glass-panel p-12" style={{ maxWidth: '500px', width: '100%' }}>
        <div className="text-center mb-8">
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Bem-vindo</h2>
          <p className="text-muted">Por favor, identifique-se para acessar o sistema de reservas do condomínio.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="form-group">
            <label>Nome Completo (ou E-mail)</label>
            <div className="input-with-icon" style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                required
                style={{ width: '100%', paddingLeft: '3rem' }}
                value={formData.userName}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                placeholder="Ex: João da Silva"
                className="input-field"
              />
            </div>
          </div>

          <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 2 }}>
              <label>Rua/Bloco</label>
              <div className="input-with-icon" style={{ position: 'relative' }}>
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
              <label>Número/Apto</label>
              <div className="input-with-icon" style={{ position: 'relative' }}>
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

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}>
            Entrar no Sistema
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginView;
