import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, CheckCircle2, AlertCircle, LogOut } from 'lucide-react';
import { supabase } from './lib/supabase';
import CourtCard from './components/CourtCard';
import TimeSlotPicker from './components/TimeSlotPicker';
import MyBookingsView from './components/MyBookingsView';
import RegulationsView from './components/RegulationsView';
import LoginView from './components/LoginView';

export type CourtType = 'tennis-blue' | 'tennis-red' | 'soccer';

interface UserProfile {
  userName: string;
  houseStreet: string;
  houseNumber: string;
}

function App() {
  const [step, setStep] = useState(1);
  const [selectedCourt, setSelectedCourt] = useState<CourtType | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [view, setView] = useState<'booking' | 'my-bookings' | 'regulations'>('booking');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const [userProfile, setUserProfile] = useState<UserProfile | null>(
    localStorage.getItem('userProfile') 
      ? JSON.parse(localStorage.getItem('userProfile') as string) 
      : null
  );

  const handleLogin = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('userProfile', JSON.stringify(profile));
  };

  const handleLogout = () => {
    setUserProfile(null);
    localStorage.removeItem('userProfile');
    reset();
  };

  const fetchBookedSlots = async (courtId: string, date: string) => {
    try {
      const { data, error } = await supabase
        .from('rentals')
        .select('start_time')
        .eq('court', courtId)
        .eq('date', date);

      if (error) throw error;
      setBookedSlots(data.map(rental => rental.start_time.substring(0, 5)));
    } catch (error) {
      console.error('Error fetching booked slots:', error);
    }
  };

  // Fetch booked slots when court or date changes
  useEffect(() => {
    if (selectedCourt && selectedDate) {
      fetchBookedSlots(selectedCourt, selectedDate);
    }
  }, [selectedCourt, selectedDate]);

  const handleCourtSelect = (id: string) => {
    setSelectedCourt(id as CourtType);
    setStep(2);
    setBookingError(null);
  };

  const calculateEndTime = (start: string) => {
    const [hours, minutes] = start.split(':').map(Number);
    const endHours = hours + 1;
    return endHours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0');
  };

  const calculateTimeDifferenceInHours = (time1: string, time2: string) => {
    const [h1, m1] = time1.split(':').map(Number);
    const [h2, m2] = time2.split(':').map(Number);
    return (h1 + m1 / 60) - (h2 + m2 / 60);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourt || !selectedDate || !selectedSlot || !userProfile) return;

    setIsSubmitting(true);
    setBookingError(null);
    
    try {
      // Validation 1: Check existing bookings for this resident on the same day
      const { data: existingBookings, error: checkError } = await supabase
        .from('rentals')
        .select('start_time')
        .eq('house_street', userProfile.houseStreet)
        .eq('house_number', userProfile.houseNumber)
        .eq('date', selectedDate);

      if (checkError) throw checkError;

      if (existingBookings && existingBookings.length > 0) {
        // Complex Rule: If a booking exists, the new one must be EXACTLY 1 hour before the new slot starts
        // Example: If I want 20:00, the current time (now) must be >= 19:00 today.
        
        // Let's get "current time" (we will simulate it with the local machine time for now, 
        // ideally in a real app this should be enforced at the database level to prevent client-side bypass)
        const now = new Date();
        const selectedDateObj = new Date(selectedDate);
        
        // Check if the booking is for today
        if (selectedDateObj.toDateString() === now.toDateString()) {
           const currentHours = now.getHours();
           const currentMinutes = now.getMinutes();
           const currentTimeStr = currentHours.toString().padStart(2, '0') + ':' + currentMinutes.toString().padStart(2, '0');
           
           const diffHours = calculateTimeDifferenceInHours(selectedSlot, currentTimeStr);
           
            if (diffHours > 1 || diffHours < 0) {
              setBookingError(
                'Você já possui uma reserva para o dia ' + selectedDate.split('-').reverse().join('/') + '. Uma nova reserva neste mesmo dia só pode ser feita com no máximo 1 hora de antecedência do novo horário desejado.'
              );
              setIsSubmitting(false);
              return;
            }
        } else {
            // Trying to double book on a future date
            setBookingError('Você já possui uma reserva para o dia ' + new Date(selectedDate).toLocaleDateString('pt-BR') + '. Só é permitida uma reserva antecipada por dia.');
            setIsSubmitting(false);
            return;
        }
      }

      // Proceed with insertion
      const endTime = calculateEndTime(selectedSlot);
      const { error } = await supabase.from('rentals').insert([
        {
          court: selectedCourt,
          date: selectedDate,
          start_time: selectedSlot,
          end_time: endTime,
          user_name: userProfile.userName,
          house_street: userProfile.houseStreet,
          house_number: userProfile.houseNumber
        }
      ]);

      if (error) throw error;
      setStep(4);
    } catch (error: any) {
      console.error('Error submitting booking:', error);
      const msg = error.message || 'Desconhecido';
      
      if (msg.includes('relation "rentals" does not exist')) {
        setBookingError('Erro: A tabela de reservas não foi criada. Por favor, avise o administrador.');
      } else if (msg.includes('unique_court_booking')) {
        setBookingError('Este horário já foi reservado por outra pessoa enquanto você preenchia o formulário. Por favor, escolha outro horário.');
        fetchBookedSlots(selectedCourt, selectedDate);
        setStep(2);
      } else {
        setBookingError('Erro ao realizar reserva: ' + msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setStep(1);
    setSelectedCourt(null);
    setSelectedSlot(null);
    setBookingError(null);
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen" style={{ backgroundImage: 'var(--gradient-bg)' }}>
        <header className="container py-8 flex justify-center items-center">
          <img 
            src="/vintage-logo.png" 
            alt="Vintage - Arte de Morar" 
            style={{ height: '60px', objectFit: 'contain' }} 
          />
        </header>
        <LoginView onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="container py-8 flex justify-between items-center">
        <div 
          className="flex items-center" 
          onClick={() => { setView('booking'); reset(); }}
          style={{ cursor: 'pointer' }}
          title="Voltar ao Menu Principal"
        >
          <img 
            src="/vintage-logo.png" 
            alt="Vintage - Arte de Morar" 
            style={{ height: '52px', objectFit: 'contain' }} 
          />
        </div>
        
        <nav className="flex gap-6 items-center">
          <button 
            onClick={() => { setView('booking'); reset(); }} 
            className={'nav-link ' + (view === 'booking' ? 'active' : '')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}
          >
            Home
          </button>
          <button 
            onClick={() => setView('my-bookings')} 
            className={'nav-link ' + (view === 'my-bookings' ? 'active' : '')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}
          >
            Minhas Reservas
          </button>
          <button 
            onClick={() => setView('regulations')} 
            className={'nav-link ' + (view === 'regulations' ? 'active' : '')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}
          >
            Regulamento
          </button>
          
          {/* User Profile / Logout */}
          <div className="flex items-center gap-4 ml-4 pl-4" style={{ borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
            <span className="text-muted" style={{ fontSize: '0.9rem' }}>
              Olá, <strong>{userProfile.userName.split(' ')[0]}</strong>
            </span>
            <button 
              onClick={handleLogout}
              className="btn btn-outline"
              style={{ padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
              title="Sair da Conta"
            >
              <LogOut size={14} /> Sair
            </button>
          </div>
        </nav>
      </header>

      <main className="container py-12">
        {view === 'booking' ? (
          step === 4 ? (
            <div className="success-view animate-fade-in text-center">
              <div className="success-icon-wrapper">
                <CheckCircle2 size={80} className="text-primary" />
              </div>
              <h1 className="mb-4">Reserva Confirmada!</h1>
              <p className="mb-8" style={{ fontSize: '1.25rem' }}>
                Parabéns, {userProfile.userName.split(' ')[0]}! <br />
                Sua reserva para a <strong>{selectedCourt === 'soccer' ? 'Quadra de Futebol' : selectedCourt === 'tennis-red' ? 'Quadra de Tênis 2 (Vermelha)' : 'Quadra de Tênis 1 (Azul)'}</strong> está garantida.
              </p>
              <div className="booking-details glass-panel p-6 mb-8 text-left" style={{ maxWidth: '500px', margin: '0 auto 2rem' }}>
                <p><strong>Data:</strong> {new Date(selectedDate).toLocaleDateString('pt-BR')}</p>
                <p><strong>Horário:</strong> {selectedSlot} - {selectedSlot ? calculateEndTime(selectedSlot) : ''}</p>
                <p><strong>Local:</strong> {userProfile.houseStreet}, {userProfile.houseNumber}</p>
              </div>
              <button onClick={reset} className="btn btn-primary">Fazer Nova Reserva</button>
            </div>
          ) : (
            <React.Fragment>
              <section className="hero mb-16 text-center animate-fade-in">
                <h1>Reserve seu espaço de lazer</h1>
                <p className="max-w-xl mx-auto mt-4">
                  Pratique esportes no conforto do seu condomínio. Escolha a quadra, o horário e aproveite com seus amigos e família.
                </p>
              </section>


              {/* Step 1: Court Selection */}
              {step === 1 && (
                <div className="grid-3 animate-fade-in">
                  <CourtCard 
                    id="tennis-blue" 
                    name="Tênis 1 (Azul)" 
                    image="/tennis-blue.png" 
                    onSelect={handleCourtSelect}
                  />
                  <CourtCard 
                    id="tennis-red" 
                    name="Tênis 2 (Vermelha)" 
                    image="/tennis-red.png" 
                    onSelect={handleCourtSelect}
                  />
                  <CourtCard 
                    id="soccer" 
                    name="Futebol (Society)" 
                    image="/soccer.png" 
                    onSelect={handleCourtSelect}
                  />
                </div>
              )}

              {/* Step 2: Time Selection */}
              {step === 2 && (
                <div className="booking-container glass-panel p-8 animate-fade-in">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <button onClick={() => setStep(1)} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>Voltar</button>
                      <h2 style={{ margin: 0 }}>Selecione o dia e hora</h2>
                    </div>
                    <div className="date-input-wrapper">
                      <CalendarIcon size={18} />
                      <input 
                        type="date" 
                        value={selectedDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setSelectedDate(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <TimeSlotPicker 
                    selectedSlot={selectedSlot}
                    onSelect={(slot) => {
                      setSelectedSlot(slot);
                      setStep(3);
                    }}
                    bookedSlots={bookedSlots}
                  />
                </div>
              )}

              {/* Step 3: Confirmation Form (Auto-filled) */}
              {step === 3 && (
                <div className="booking-container glass-panel p-8 animate-fade-in text-center">
                  <h2 className="mb-6">Confirmar Reserva</h2>
                  
                  {bookingError && (
                    <div className="error-banner mb-6 p-4 rounded-md" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', textAlign: 'left' }}>
                      <div className="flex items-center gap-2 mb-2 font-bold">
                        <AlertCircle size={18} />
                        Atenção: Reserva não permitida
                      </div>
                      <p>{bookingError}</p>
                    </div>
                  )}

                  <div className="booking-summary text-left mb-8 p-6" style={{ background: 'var(--surface)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <div>
                        <p className="text-muted text-sm uppercase tracking-wider mb-1">Quadra</p>
                        <p className="font-bold text-lg">
                          {selectedCourt === 'soccer' ? 'Futebol (Society)' : selectedCourt === 'tennis-red' ? 'Tênis 2 (Vermelha)' : 'Tênis 1 (Azul)'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted text-sm uppercase tracking-wider mb-1">Data e Hora</p>
                        <p className="font-bold text-lg">
                          {new Date(selectedDate).toLocaleDateString('pt-BR')} às {selectedSlot?.substring(0, 5)}
                        </p>
                      </div>
                      <div style={{ gridColumn: '1 / -1', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
                        <p className="text-muted text-sm uppercase tracking-wider mb-1">Reservado para</p>
                        <p className="font-bold text-lg">{userProfile.userName}</p>
                        <p className="text-muted">{userProfile.houseStreet}, {userProfile.houseNumber}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4" style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
                    <button 
                      type="button" 
                      onClick={() => { setStep(2); setBookingError(null); }} 
                      className="btn btn-outline"
                      style={{ flex: 1 }}
                      disabled={isSubmitting}
                    >
                      Voltar
                    </button>
                    <button 
                      onClick={handleSubmit} 
                      className="btn btn-primary"
                      style={{ flex: 2 }}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Processando...' : 'Confirmar Reserva'}
                    </button>
                  </div>
                </div>
              )}
            </React.Fragment>
          )
        ) : view === 'my-bookings' ? (
          <MyBookingsView userProfile={userProfile} />
        ) : (
          <RegulationsView />
        )}
      </main>

      <footer className="container py-8 text-center border-t mt-auto" style={{ borderTop: '1px solid var(--glass-border)' }}>
        <p>&copy; 2026 Clube Ecoville II - Reservas via Supabase</p>
      </footer>

    </div>
  );
}

export default App;
