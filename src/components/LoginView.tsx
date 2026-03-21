import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Home,
  Loader2,
  Lock,
  Mail,
  MapPin,
  User,
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import { getErrorMessage } from '../lib/errors';
import { supabase } from '../lib/supabase';

interface AuthFormState {
  email: string;
  password: string;
  userName: string;
  houseStreet: string;
  houseNumber: string;
}

const initialFormState: AuthFormState = {
  email: '',
  password: '',
  userName: '',
  houseStreet: '',
  houseNumber: '',
};

function translateAuthError(message: string): string {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes('invalid login credentials')) {
    return 'E-mail ou senha invalidos.';
  }

  if (normalizedMessage.includes('email not confirmed')) {
    return 'Confirme o e-mail enviado pelo Supabase antes de entrar.';
  }

  if (normalizedMessage.includes('user already registered')) {
    return 'Esse e-mail ja esta cadastrado. Faça o login para continuar.';
  }

  if (normalizedMessage.includes('password should be at least 6 characters')) {
    return 'A senha precisa ter pelo menos 6 caracteres.';
  }

  if (normalizedMessage.includes('signup is disabled')) {
    return 'O cadastro por e-mail esta desativado no Supabase deste projeto.';
  }

  return message;
}

const LoginView: React.FC = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [formData, setFormData] = useState<AuthFormState>(initialFormState);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;
    const userName = formData.userName.trim();
    const houseStreet = formData.houseStreet.trim();
    const houseNumber = formData.houseNumber.trim();

    if (!email || !password) {
      setErrorMsg('Preencha o e-mail e a senha para continuar.');
      return;
    }

    if (!isLoginMode && (!userName || !houseStreet || !houseNumber)) {
      setErrorMsg('Preencha todos os dados da unidade antes de criar a conta.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isLoginMode) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              user_name: userName,
              house_street: houseStreet,
              house_number: houseNumber,
            },
          },
        });

        if (error) {
          throw error;
        }

        if (!data.session) {
          setInfoMsg(
            'Conta criada com sucesso. Se a confirmacao por e-mail estiver ativa no Supabase, confirme o link recebido antes de entrar.',
          );
          setIsLoginMode(true);
          setFormData({
            ...initialFormState,
            email,
            password: '',
          });
        }
      }
    } catch (error) {
      setErrorMsg(
        translateAuthError(
          getErrorMessage(error, 'Nao foi possivel concluir a autenticacao.'),
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="login-wrapper animate-fade-in"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url("/clube-fundo.jpg")',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        padding: '2rem 1rem',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to bottom right, rgba(13, 14, 14, 0.75), rgba(0, 0, 0, 0.95))',
          zIndex: 0,
        }}
      />

      <div
        className="login-glass-panel p-12 animate-scale-in"
        style={{ maxWidth: '520px', width: '100%', position: 'relative', zIndex: 1 }}
      >
        <div className="text-center mb-8">
          <div className="login-brand-stage">
            <div className="login-brand-mark">
              <BrandLogo size="login" />
            </div>
          </div>

          <h2 style={{ fontSize: '2.1rem', marginBottom: '0.25rem', color: 'var(--text-main)' }}>
            {isLoginMode ? 'Acessar Conta' : 'Criar Conta'}
          </h2>
          <p className="text-muted" style={{ fontSize: '0.95rem' }}>
            {isLoginMode
              ? 'Entre com a conta autenticada da sua unidade.'
              : 'Cadastre nome, rua/bloco e numero para vincular a reserva ao morador.'}
          </p>
        </div>

        {errorMsg && (
          <div
            className="mb-6 p-4 rounded-md"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
            }}
          >
            <AlertCircle size={18} />
            <span style={{ fontSize: '0.9rem' }}>{errorMsg}</span>
          </div>
        )}

        {infoMsg && (
          <div
            className="mb-6 p-4 rounded-md"
            style={{
              background: 'rgba(34, 197, 94, 0.08)',
              border: '1px solid rgba(34, 197, 94, 0.25)',
              color: '#15803d',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
            }}
          >
            <CheckCircle2 size={18} />
            <span style={{ fontSize: '0.9rem' }}>{infoMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="form-group">
            <label className="text-sm text-muted">E-mail</label>
            <div className="input-with-icon" style={{ position: 'relative', marginTop: '4px' }}>
              <Mail
                size={18}
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                type="email"
                required
                autoComplete="email"
                style={{ width: '100%', paddingLeft: '3rem' }}
                value={formData.email}
                onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                placeholder="seu@email.com"
                className="input-field"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="text-sm text-muted">Senha</label>
            <div className="input-with-icon" style={{ position: 'relative', marginTop: '4px' }}>
              <Lock
                size={18}
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                type="password"
                required
                minLength={6}
                autoComplete={isLoginMode ? 'current-password' : 'new-password'}
                style={{ width: '100%', paddingLeft: '3rem' }}
                value={formData.password}
                onChange={(event) => setFormData({ ...formData, password: event.target.value })}
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
                  <User
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                  />
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    style={{ width: '100%', paddingLeft: '3rem' }}
                    value={formData.userName}
                    onChange={(event) => setFormData({ ...formData, userName: event.target.value })}
                    placeholder="Sergio Almeida"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="form-row login-form-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <label className="text-sm text-muted">Rua/Bloco</label>
                  <div className="input-with-icon" style={{ position: 'relative', marginTop: '4px' }}>
                    <MapPin
                      size={18}
                      style={{
                        position: 'absolute',
                        left: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                      }}
                    />
                    <input
                      type="text"
                      required
                      style={{ width: '100%', paddingLeft: '3rem' }}
                      value={formData.houseStreet}
                      onChange={(event) =>
                        setFormData({ ...formData, houseStreet: event.target.value })
                      }
                      placeholder="Ex: Rua A"
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label className="text-sm text-muted">Numero</label>
                  <div className="input-with-icon" style={{ position: 'relative', marginTop: '4px' }}>
                    <Home
                      size={18}
                      style={{
                        position: 'absolute',
                        left: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                      }}
                    />
                    <input
                      type="text"
                      required
                      style={{ width: '100%', paddingLeft: '3rem' }}
                      value={formData.houseNumber}
                      onChange={(event) =>
                        setFormData({ ...formData, houseNumber: event.target.value })
                      }
                      placeholder="Ex: 42"
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', padding: '1rem' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Processando...
              </>
            ) : isLoginMode ? (
              'Entrar'
            ) : (
              'Cadastrar'
            )}
          </button>

          <div className="text-center" style={{ marginTop: '0.5rem' }}>
            <button
              type="button"
              className="text-muted"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '0.9rem',
              }}
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setErrorMsg('');
                setInfoMsg('');
              }}
            >
              {isLoginMode ? 'Nao tem conta? Cadastre-se' : 'Ja tem conta? Entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginView;
