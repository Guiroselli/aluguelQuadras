import React, { useCallback, useEffect, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Info,
  Loader2,
  Lock,
  MapPin,
  Trash2,
} from 'lucide-react';
import { getCourtLabel } from '../lib/booking';
import { canCancelBooking, formatDateForDisplay } from '../lib/date';
import { getErrorMessage } from '../lib/errors';
import { supabase } from '../lib/supabase';
import type { Booking, UserProfile } from '../lib/types';

interface MyBookingsViewProps {
  userProfile: UserProfile;
}

const MyBookingsView: React.FC<MyBookingsViewProps> = ({ userProfile }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMyBookings = useCallback(async () => {
    setIsLoading(true);
    setDeleteError(null);

    try {
      const { data, error } = await supabase
        .from('rentals')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) {
        throw error;
      }

      setBookings((data as Booking[]) ?? []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setDeleteError(getErrorMessage(error, 'Nao foi possivel carregar suas reservas.'));
    } finally {
      setIsLoading(false);
    }
  }, [userProfile.id]);

  useEffect(() => {
    void fetchMyBookings();
  }, [fetchMyBookings]);

  const confirmCancellation = async () => {
    if (!bookingToDelete) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);
    setSuccessMessage(null);

    try {
      const { error } = await supabase.from('rentals').delete().eq('id', bookingToDelete);

      if (error) {
        throw error;
      }

      setBookings((currentBookings) =>
        currentBookings.filter((booking) => booking.id !== bookingToDelete),
      );
      setBookingToDelete(null);
      setSuccessMessage('Reserva cancelada com sucesso.');
    } catch (error) {
      console.error('Error canceling booking:', error);
      setDeleteError(getErrorMessage(error, 'Erro ao cancelar a reserva.'));
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
            Reservas de <strong>{userProfile.userName}</strong> ({userProfile.houseStreet},{' '}
            {userProfile.houseNumber})
          </p>
        </div>

        {successMessage && (
          <div
            className="mb-6 p-4 rounded-md"
            style={{
              background: 'rgba(34, 197, 94, 0.08)',
              border: '1px solid rgba(34, 197, 94, 0.25)',
              color: '#15803d',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'center',
            }}
          >
            <CheckCircle2 size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        {deleteError && (
          <div
            className="mb-6 p-4 rounded-md"
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#b91c1c',
            }}
          >
            {deleteError}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : bookings.length === 0 ? (
          <div className="glass-panel p-12 text-center">
            <Info className="text-muted mx-auto mb-4" size={48} />
            <p className="text-muted">Nenhuma reserva encontrada para esta conta.</p>
          </div>
        ) : (
          <>
            <h3 className="mb-6">
              {bookings.length} {bookings.length === 1 ? 'reserva encontrada' : 'reservas encontradas'}
            </h3>

            <div className="bookings-list">
              {bookings.map((booking) => {
                const canCancel = canCancelBooking(booking.date, booking.start_time);

                return (
                  <div key={booking.id} className="booking-item glass-panel p-6 mb-4 animate-scale-in">
                    <div className="booking-info-grid">
                      <div className="info-group">
                        <span className="info-label">Quadra</span>
                        <span className="info-value">{getCourtLabel(booking.court)}</span>
                      </div>

                      <div className="info-group">
                        <span className="info-label">Data e Hora</span>
                        <div className="info-value-with-icon">
                          <Calendar size={14} />
                          <span>
                            {formatDateForDisplay(booking.date)} | {booking.start_time.substring(0, 5)} -{' '}
                            {booking.end_time.substring(0, 5)}
                          </span>
                        </div>
                      </div>

                      <div className="info-group">
                        <span className="info-label">Unidade</span>
                        <div className="info-value-with-icon">
                          <MapPin size={14} />
                          <span>
                            {booking.house_street}, {booking.house_number}
                          </span>
                        </div>
                      </div>

                      <div className="actions">
                        <button
                          type="button"
                          onClick={() => setBookingToDelete(booking.id)}
                          className="btn btn-danger btn-icon"
                          title={
                            canCancel
                              ? 'Cancelar reserva'
                              : 'O cancelamento so pode ser feito com pelo menos 2 horas de antecedencia'
                          }
                          disabled={!canCancel}
                        >
                          {canCancel ? <Trash2 size={18} /> : <Lock size={18} />}
                        </button>
                      </div>
                    </div>

                    {!canCancel && (
                      <p className="text-muted booking-lock-note">
                        Cancelamento indisponivel: a reserva esta dentro da janela minima de 2 horas.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {bookingToDelete && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel p-8 animate-scale-in">
            <h3 className="mb-4" style={{ color: '#ef4444' }}>
              Cancelar Reserva
            </h3>
            <p className="text-muted mb-6">
              Tem certeza que deseja cancelar esta reserva? Essa acao nao pode ser desfeita.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setBookingToDelete(null)}
                disabled={isDeleting}
              >
                Voltar
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => void confirmCancellation()}
                disabled={isDeleting}
              >
                {isDeleting ? 'Cancelando...' : 'Sim, Cancelar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .modal-overlay {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0, 0, 0, 0.6);
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

            .booking-lock-note {
              margin-top: 1rem;
              font-size: 0.9rem;
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

            .btn-danger:hover:not(:disabled) {
              background: #ef4444;
              color: white;
            }

            .btn-danger:disabled {
              opacity: 0.55;
              cursor: not-allowed;
            }

            .btn-icon {
              padding: 0.75rem;
              border-radius: 12px;
            }
          `,
        }}
      />
    </div>
  );
};

export default MyBookingsView;
