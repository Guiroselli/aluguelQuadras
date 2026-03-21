import React from 'react';
import { Clock, Loader2 } from 'lucide-react';
import { ALL_TIME_SLOTS } from '../lib/booking';
import { isTimeSlotInPast } from '../lib/date';

interface TimeSlotPickerProps {
  selectedSlot: string | null;
  selectedDate: string;
  onSelect: (slot: string) => void;
  bookedSlots: string[];
  isLoading?: boolean;
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  selectedSlot,
  selectedDate,
  onSelect,
  bookedSlots,
  isLoading = false,
}) => {
  const hasAnyAvailableSlot = ALL_TIME_SLOTS.some((slot) => {
    const isBooked = bookedSlots.includes(slot);
    const isPast = isTimeSlotInPast(selectedDate, slot);

    return !isBooked && !isPast;
  });

  return (
    <div className="time-slot-picker">
      <div className="picker-header">
        <Clock size={18} />
        <span>Escolha um horario</span>
      </div>

      {isLoading ? (
        <div className="slots-empty-state glass-panel">
          <Loader2 className="animate-spin text-primary" size={24} />
          <span>Carregando horarios ocupados...</span>
        </div>
      ) : hasAnyAvailableSlot ? (
        <div className="slots-grid">
          {ALL_TIME_SLOTS.map((slot) => {
            const isBooked = bookedSlots.includes(slot);
            const isSelected = selectedSlot === slot;
            const isPast = isTimeSlotInPast(selectedDate, slot);

            return (
              <button
                type="button"
                key={slot}
                className={`slot-btn ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''} ${
                  isPast ? 'past' : ''
                }`}
                onClick={() => !isBooked && !isPast && onSelect(slot)}
                disabled={isBooked || isPast}
                title={isBooked ? 'Horario reservado' : isPast ? 'Horario indisponivel' : 'Selecionar horario'}
              >
                {slot}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="slots-empty-state glass-panel">
          <span>Nao ha horarios disponiveis para a data escolhida.</span>
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .time-slot-picker {
              display: flex;
              flex-direction: column;
              gap: 1rem;
              margin-bottom: 2rem;
            }

            .picker-header {
              display: flex;
              align-items: center;
              gap: 0.5rem;
              color: var(--text-muted);
              font-weight: 500;
            }

            .slots-grid {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
              gap: 0.75rem;
            }

            .slot-btn {
              padding: 0.75rem;
              background: var(--surface);
              border: 1px solid var(--glass-border);
              border-radius: var(--radius-sm);
              color: var(--text-main);
              font-family: 'Outfit', sans-serif;
              font-weight: 600;
              cursor: pointer;
              transition: var(--transition);
            }

            .slot-btn:hover:not(:disabled) {
              border-color: var(--primary);
              background: rgba(169, 29, 34, 0.05);
            }

            .slot-btn.selected {
              background: var(--primary);
              color: #fff;
              border-color: var(--primary);
            }

            .slot-btn.booked {
              opacity: 0.35;
              cursor: not-allowed;
              background: #e5e7eb;
              text-decoration: line-through;
            }

            .slot-btn.past {
              opacity: 0.45;
              cursor: not-allowed;
              background: #f3f4f6;
            }

            .slots-empty-state {
              min-height: 120px;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 0.75rem;
              padding: 1.5rem;
              text-align: center;
              color: var(--text-muted);
            }
          `,
        }}
      />
    </div>
  );
};

export default TimeSlotPicker;
