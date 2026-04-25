import { useCallback, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import {
  AlertCircle,
  Calendar as CalendarIcon,
  CheckCircle2,
  Loader2,
  LogOut,
} from 'lucide-react';
import BrandLogo from './components/BrandLogo';
import CourtCard from './components/CourtCard';
import LoginView from './components/LoginView';
import MyBookingsView from './components/MyBookingsView';
import RegulationsView from './components/RegulationsView';
import TimeSlotPicker from './components/TimeSlotPicker';
import { calculateEndTime, COURTS, getCourtLabel } from './lib/booking';
import {
  formatDateForDisplay,
  getMaxAdvanceBookingDateValue,
  getTodayDateValue,
} from './lib/date';
import { getErrorMessage } from './lib/errors';
import { supabase } from './lib/supabase';
import type { CourtType, UserProfile } from './lib/types';
import { mapAuthUserToProfile } from './lib/user';

function translateBookingError(message: string): string {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes('relation "rentals" does not exist')) {
    return 'A tabela de reservas ainda nao foi criada no Supabase. Execute o novo supabase.sql.';
  }

  if (
    normalizedMessage.includes('unique_court_booking') ||
    normalizedMessage.includes('duplicate key value violates unique constraint')
  ) {
    return 'Este horario acabou de ser reservado por outra pessoa. Escolha outro horario.';
  }

  if (normalizedMessage.includes('row-level security')) {
    return 'Sua sessao nao tem permissao para concluir essa operacao. Entre novamente e tente outra vez.';
  }

  return message;
}

function App() {
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [selectedCourt, setSelectedCourt] = useState<CourtType | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateValue());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [view, setView] = useState<'booking' | 'my-bookings' | 'regulations'>('booking');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const syncAuthenticatedUser = useCallback((user: User | null) => {
    if (!user) {
      setUserProfile(null);
      setAuthError(null);
      return;
    }

    const profile = mapAuthUserToProfile(user);

    if (!profile) {
      setUserProfile(null);
      setAuthError(
        'Sua conta foi autenticada, mas esta sem nome ou unidade configurados. Cadastre-se novamente para completar os dados do morador.',
      );
      return;
    }

    setUserProfile(profile);
    setAuthError(null);
  }, []);

  const fetchBookedSlots = useCallback(async (courtId: CourtType, dateValue: string) => {
    setIsLoadingSlots(true);
    setAvailabilityError(null);

    try {
      const { data, error } = await supabase
        .from('rentals')
        .select('start_time')
        .eq('court', courtId)
        .eq('date', dateValue)
        .order('start_time', { ascending: true });

      if (error) {
        throw error;
      }

      setBookedSlots((data ?? []).map((rental) => rental.start_time.substring(0, 5)));
    } catch (error) {
      console.error('Error fetching booked slots:', error);
      setAvailabilityError(
        translateBookingError(
          getErrorMessage(error, 'Nao foi possivel carregar os horarios ocupados.'),
        ),
      );
      setBookedSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  }, []);

  const reset = useCallback(() => {
    setStep(1);
    setSelectedCourt(null);
    setSelectedDate(getTodayDateValue());
    setSelectedSlot(null);
    setBookedSlots([]);
    setBookingError(null);
    setAvailabilityError(null);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (isMounted) {
          syncAuthenticatedUser(session?.user ?? null);
        }
      } catch (error) {
        if (isMounted) {
          setAuthError(getErrorMessage(error, 'Nao foi possivel validar sua sessao.'));
        }
      } finally {
        if (isMounted) {
          setAuthLoading(false);
        }
      }
    }

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      syncAuthenticatedUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [syncAuthenticatedUser]);

  useEffect(() => {
    setSelectedSlot(null);
    setBookingError(null);

    if (!selectedCourt) {
      setBookedSlots([]);
      setAvailabilityError(null);
      return;
    }

    void fetchBookedSlots(selectedCourt, selectedDate);
  }, [fetchBookedSlots, selectedCourt, selectedDate]);

  const handleCourtSelect = (courtId: CourtType) => {
    setSelectedCourt(courtId);
    setSelectedSlot(null);
    setBookingError(null);
    setStep(2);
  };

  const handleDateChange = (dateValue: string) => {
    setSelectedDate(dateValue);
    setSelectedSlot(null);
    setBookingError(null);
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!selectedCourt || !selectedDate || !selectedSlot || !userProfile) {
      return;
    }

    setIsSubmitting(true);
    setBookingError(null);

    try {
      const endTime = calculateEndTime(selectedSlot);

      const { error } = await supabase.from('rentals').insert([
        {
          court: selectedCourt,
          date: selectedDate,
          start_time: selectedSlot,
          end_time: endTime,
        },
      ]);

      if (error) {
        throw error;
      }

      void fetchBookedSlots(selectedCourt, selectedDate);
      setStep(4);
    } catch (error) {
      console.error('Error submitting booking:', error);
      setBookingError(
        translateBookingError(getErrorMessage(error, 'Erro ao realizar reserva.')),
      );
      void fetchBookedSlots(selectedCourt, selectedDate);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      setAuthError(getErrorMessage(error, 'Nao foi possivel sair da conta.'));
      return;
    }

    reset();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-panel p-12 text-center">
          <Loader2 className="animate-spin text-primary mx-auto mb-4" size={36} />
          <h2 className="mb-2">Carregando sua sessao</h2>
          <p>Conferindo autenticacao e dados do morador.</p>
        </div>
      </div>
    );
  }

  if (authError && !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-panel p-12" style={{ maxWidth: '560px', width: '92%' }}>
          <div
            className="mb-6 p-4 rounded-md"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start',
            }}
          >
            <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Cadastro incompleto</strong>
              <span>{authError}</span>
            </div>
          </div>

          <p className="mb-6">
            Entre novamente com uma conta que tenha nome, rua/bloco e numero definidos no cadastro.
          </p>

          <button onClick={() => void handleLogout()} className="btn btn-primary">
            Sair da conta
          </button>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="container site-header-shell site-header">
        <button
          type="button"
          className="brand-button site-header-brand"
          onClick={() => {
            setView('booking');
            reset();
          }}
          title="Voltar ao menu principal"
        >
          <BrandLogo size="header" />
        </button>

        <nav className="site-header-nav">
          <button
            type="button"
            onClick={() => {
              setView('booking');
              reset();
            }}
            className={`nav-link ${view === 'booking' ? 'active' : ''}`}
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => setView('my-bookings')}
            className={`nav-link ${view === 'my-bookings' ? 'active' : ''}`}
          >
            Minhas Reservas
          </button>
          <button
            type="button"
            onClick={() => setView('regulations')}
            className={`nav-link ${view === 'regulations' ? 'active' : ''}`}
          >
            Regulamento
          </button>
        </nav>

        <div className="site-header-actions">
          <span className="text-muted" style={{ fontSize: '0.9rem' }}>
            Ola, <strong>{userProfile.userName.split(' ')[0]}</strong>
          </span>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="btn btn-outline"
            style={{
              padding: '0.4rem 0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
            }}
            title="Sair da conta"
          >
            <LogOut size={14} /> Sair
          </button>
        </div>
      </header>

      <main className="container py-12" style={{ flex: 1 }}>
        {view === 'booking' ? (
          step === 4 && selectedCourt && selectedSlot ? (
            <div className="success-view animate-fade-in text-center">
              <div className="success-icon-wrapper">
                <CheckCircle2 size={80} className="text-primary" />
              </div>
              <h1 className="mb-4">Reserva Confirmada</h1>
              <p className="mb-8" style={{ fontSize: '1.25rem' }}>
                Parabens, {userProfile.userName.split(' ')[0]}.
                <br />
                Sua reserva para <strong>{getCourtLabel(selectedCourt)}</strong> esta garantida.
              </p>

              <div
                className="booking-details glass-panel p-6 mb-8 text-left"
                style={{ maxWidth: '500px', margin: '0 auto 2rem' }}
              >
                <p>
                  <strong>Data:</strong> {formatDateForDisplay(selectedDate)}
                </p>
                <p>
                  <strong>Horario:</strong> {selectedSlot} - {calculateEndTime(selectedSlot)}
                </p>
                <p>
                  <strong>Unidade:</strong> {userProfile.houseStreet}, {userProfile.houseNumber}
                </p>
              </div>

              <button
                type="button"
                onClick={reset}
                className="btn btn-primary"
              >
                Fazer Nova Reserva
              </button>
            </div>
          ) : (
            <>
              <section className="hero mb-16 text-center animate-fade-in">
                <h1>Reserve seu espaco de lazer</h1>
                <p className="max-w-xl mx-auto mt-4">
                  Escolha a quadra, veja os horarios em tempo real e conclua a reserva com a conta
                  autenticada da sua unidade.
                </p>
              </section>

              {step === 1 && (
                <div className="grid-3 animate-fade-in">
                  {COURTS.map((court) => (
                    <CourtCard
                      key={court.id}
                      id={court.id}
                      name={court.name}
                      image={court.image}
                      description={court.description}
                      onSelect={handleCourtSelect}
                    />
                  ))}
                </div>
              )}

              {step === 2 && selectedCourt && (
                <div className="booking-container glass-panel p-8 animate-fade-in">
                  <div className="booking-toolbar">
                    <div className="booking-toolbar-group">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="btn btn-outline"
                        style={{ padding: '0.5rem 1rem' }}
                      >
                        Voltar
                      </button>
                      <h2 style={{ margin: 0 }}>Selecione o dia e horario</h2>
                    </div>

                    <div className="date-input-wrapper">
                      <CalendarIcon size={18} />
                      <input
                        type="date"
                        value={selectedDate}
                        min={getTodayDateValue()}
                        max={getMaxAdvanceBookingDateValue()}
                        onChange={(event) => handleDateChange(event.target.value)}
                      />
                    </div>
                  </div>

                  {availabilityError && (
                    <div className="error-banner mb-6 p-4 rounded-md">
                      <div className="flex items-center gap-2 mb-2 font-bold">
                        <AlertCircle size={18} />
                        Erro ao carregar disponibilidade
                      </div>
                      <p>{availabilityError}</p>
                    </div>
                  )}

                  <TimeSlotPicker
                    selectedSlot={selectedSlot}
                    selectedDate={selectedDate}
                    onSelect={(slot) => {
                      setSelectedSlot(slot);
                      setBookingError(null);
                      setStep(3);
                    }}
                    bookedSlots={bookedSlots}
                    isLoading={isLoadingSlots}
                  />
                </div>
              )}

              {step === 3 && selectedCourt && selectedSlot && (
                <div className="booking-container glass-panel p-8 animate-fade-in text-center">
                  <h2 className="mb-6">Confirmar Reserva</h2>

                  {bookingError && (
                    <div className="error-banner mb-6 p-4 rounded-md">
                      <div className="flex items-center gap-2 mb-2 font-bold">
                        <AlertCircle size={18} />
                        Reserva nao permitida
                      </div>
                      <p>{bookingError}</p>
                    </div>
                  )}

                  <div className="booking-summary text-left mb-8 p-6">
                    <div className="booking-summary-grid">
                      <div>
                        <p className="text-muted text-sm uppercase tracking-wider mb-1">Quadra</p>
                        <p className="font-bold text-lg">{getCourtLabel(selectedCourt)}</p>
                      </div>
                      <div>
                        <p className="text-muted text-sm uppercase tracking-wider mb-1">Data e Hora</p>
                        <p className="font-bold text-lg">
                          {formatDateForDisplay(selectedDate)} as {selectedSlot}
                        </p>
                      </div>
                      <div className="booking-summary-unit">
                        <p className="text-muted text-sm uppercase tracking-wider mb-1">Reservado para</p>
                        <p className="font-bold text-lg">{userProfile.userName}</p>
                        <p className="text-muted">
                          {userProfile.houseStreet}, {userProfile.houseNumber}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 confirm-actions">
                    <button
                      type="button"
                      onClick={() => {
                        setStep(2);
                        setBookingError(null);
                      }}
                      className="btn btn-outline"
                      style={{ flex: 1 }}
                      disabled={isSubmitting}
                    >
                      Voltar
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleSubmit()}
                      className="btn btn-primary"
                      style={{ flex: 2 }}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Processando...' : 'Confirmar Reserva'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )
        ) : view === 'my-bookings' ? (
          <MyBookingsView userProfile={userProfile} />
        ) : (
          <RegulationsView />
        )}
      </main>

      <footer
        className="container py-8 text-center border-t mt-auto"
        style={{ borderTop: '1px solid var(--glass-border)' }}
      >
        <p>&copy; 2026 Clube Ecoville II - Reservas protegidas por Supabase Auth</p>
      </footer>
    </div>
  );
}

export default App;
