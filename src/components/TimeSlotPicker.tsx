import React from 'react';
import { Clock } from 'lucide-react';

interface TimeSlotPickerProps {
  selectedSlot: string | null;
  onSelect: (slot: string) => void;
  bookedSlots: string[]; // e.g., ["14:00", "15:00"]
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({ selectedSlot, onSelect, bookedSlots }) => {
  const slots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
    '20:00', '21:00'
  ];

  return (
    <div className="time-slot-picker">
      <div className="picker-header">
        <Clock size={18} />
        <span>Escolha um horário</span>
      </div>
      <div className="slots-grid">
        {slots.map((slot) => {
          const isBooked = bookedSlots.includes(slot);
          const isSelected = selectedSlot === slot;
          
          return (
            <button
              key={slot}
              className={`slot-btn ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => !isBooked && onSelect(slot)}
              disabled={isBooked}
            >
              {slot}
            </button>
          );
        })}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
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
          background: rgba(194, 253, 74, 0.05);
        }
        
        .slot-btn.selected {
          background: var(--primary);
          color: #000;
          border-color: var(--primary);
        }
        
        .slot-btn.booked {
          opacity: 0.3;
          cursor: not-allowed;
          background: #333;
          text-decoration: line-through;
        }
      `}} />
    </div>
  );
};

export default TimeSlotPicker;
