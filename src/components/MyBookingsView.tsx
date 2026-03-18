import React, { useState } from 'react';
import { Calendar, MapPin, Trash2, Loader2, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Booking {
  id: string;
  court: string;
  date: string;
  start_time: string;
  end_time: string;
  user_name: string;
  house_street: string;
  house_number: string;
}
interface UserProfile {
  userName: string;
  houseStreet: string;
  houseNumber: string;
}

interface MyBookingsViewProps {
  userProfile: UserProfile;
}

const MyBookingsView: React.FC<MyBookingsViewProps> = ({ userProfile }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  React.useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    setIsLoading(true);
    setDeleteError(null);
    try {
      const { data, error } = await supabase
        .from('rentals')
        .select('*')
        .eq('house_street', userProfile.houseStreet)
        .eq('house_number', userProfile.houseNumber)
        .order('date', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = (id: string) => {
    setBookingToDelete(id);
  };

  const confirmCancellation = async () => {
    if (!bookingToDelete) return;
    
    setIsDeleting(true);
    setDeleteError(null);
    
    try {
      const { error } = await supabase.from('rentals').delete().eq('id', bookingToDelete);
      if (error) throw error;
      
      setBookings(bookings.filter(b => b.id !== bookingToDelete));
      setBookingToDelete(null);
      
      // Mostrar feedback de sucesso no lugar do alert()
      const feedback = document.createElement('div');
      feedback.className = 'glass-panel';
      feedback.style.position = 'fixed';
      feedback.style.bottom = '20px';
      feedback.style.right = '20px';
      feedback.style.padding = '1rem 2rem';
      feedback.style.background = '#10b981';
      feedback.style.color = '#fff';
      feedback.style.zIndex = '9999';
      feedback.innerText = 'Reserva cancelada com sucesso!';
      document.body.appendChild(feedback);
      setTimeout(() => feedback.remove(), 3000);
      
    } catch (err: any) {
      console.error('Error canceling booking:', err);
      setDeleteError(err.message || 'Erro ao cancelar reserva.');
      setBookingToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="my-bookings-container animate-fade-in">
      <div className="results-section">
        <div className="mb-8 p-6 glass-panel">
          <h2 className="mb-2">Minhas Reservas</h2>
          <p className="text-muted">
            Reservas para <strong>{userProfile.userName}</strong> ({userProfile.houseStreet}, {userProfile.houseNumber})
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : (
          <>
            <h3 className="mb-6">{bookings.length} {bookings.length === 1 ? 'Reserva encontrada' : 'Reservas encontradas'}</h3>
          
          {deleteError && (
            <div style={{
              marginBottom: '1rem',
              padding: '1rem 1.25rem',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '10px',
              color: '#fca5a5',
              fontSize: '0.9rem',
              lineHeight: '1.5'
            }}>
              ⚠️ Erro ao cancelar: {deleteError}
            </div>
          )}

          {bookings.length === 0 ? (
            <div className="glass-panel p-12 text-center">
              <Info className="text-muted mx-auto mb-4" size={48} />
              <p className="text-muted">Nenhuma reserva encontrada para os dados informados.</p>
            </div>
          ) : (
            <div className="bookings-list">
              {bookings.map((booking) => (
                <div key={booking.id} className="booking-item glass-panel p-6 mb-4 animate-scale-in">
                  <div className="booking-info-grid">
                    <div className="info-group">
                      <span className="info-label">Quadra</span>
                      <span className="info-value">
                        {booking.court === 'tennis-blue' ? 'Tênis 1 (Azul)' : 
                         booking.court === 'tennis-red' ? 'Tênis 2 (Vermelha)' : 
                         'Futebol (Society)'}
                      </span>
                    </div>
                    
                    <div className="info-group">
                      <span className="info-label">Data e Hora</span>
                      <div className="info-value-with-icon">
                        <Calendar size={14} />
                        <span>
                          {new Date(booking.date).toLocaleDateString('pt-BR')} | {booking.start_time.substring(0, 5)} - {booking.end_time.substring(0, 5)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="info-group">
                      <span className="info-label">Local</span>
                      <div className="info-value-with-icon">
                        <MapPin size={14} />
                        <span>{booking.house_street}, {booking.house_number}</span>
                      </div>
                    </div>

                    <div className="actions">
                      <button 
                        onClick={() => handleCancel(booking.id)}
                        className="btn btn-danger btn-icon"
                        title="Cancelar Reserva"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      {bookingToDelete && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel p-8 animate-scale-in">
            <h3 className="mb-4" style={{ color: '#ef4444' }}>Cancelar Reserva</h3>
            <p className="text-muted mb-6">Tem certeza que deseja cancelar esta reserva? Esta ação não pode ser desfeita.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-outline" 
                onClick={() => setBookingToDelete(null)}
                disabled={isDeleting}
              >
                Voltar
              </button>
              <button 
                className="btn btn-danger" 
                onClick={confirmCancellation}
                disabled={isDeleting}
              >
                {isDeleting ? 'Cancelando...' : 'Sim, Cancelar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }
        
        .modal-content {
          max-width: 450px;
          width: 90%;
        }

        .booking-info-grid {
          display: grid;
          grid-template-columns: 1fr 2fr 1.5fr auto;
          gap: 2rem;
          align-items: center;
        }
        
        @media (max-width: 768px) {
          .booking-info-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          .actions {
            margin-top: 1rem;
          }
        }
        
        .info-label {
          display: block;
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.25rem;
        }
        
        .info-value {
          font-weight: 500;
          color: var(--text-main);
        }
        
        .info-value-with-icon {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
        }
        
        .btn-danger {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }
        
        .btn-danger:hover {
          background: #ef4444;
          color: white;
        }
        
        .btn-icon {
          padding: 0.75rem;
          border-radius: 12px;
        }
      `}} />
    </div>
  );
};

export default MyBookingsView;
