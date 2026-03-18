import React from 'react';
import { User, MapPin, Hash, Send } from 'lucide-react';

interface BookingFormProps {
  formData: {
    userName: string;
    houseStreet: string;
    houseNumber: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

const BookingForm: React.FC<BookingFormProps> = ({ formData, onChange, onSubmit, isSubmitting }) => {
  return (
    <form className="booking-form animate-fade-in delay-200" onSubmit={onSubmit}>
      <div className="form-grid">
        <div className="input-group">
          <label className="input-label">
            <User size={14} style={{ marginRight: '4px' }} />
            Nome Completo
          </label>
          <input
            type="text"
            name="userName"
            value={formData.userName}
            onChange={onChange}
            className="input-field"
            placeholder="Ex: João Silva"
            required
          />
        </div>
        
        <div className="input-group">
          <label className="input-label">
            <MapPin size={14} style={{ marginRight: '4px' }} />
            Rua / Alameda
          </label>
          <input
            type="text"
            name="houseStreet"
            value={formData.houseStreet}
            onChange={onChange}
            className="input-field"
            placeholder="Ex: Alameda das Flores"
            required
          />
        </div>
        
        <div className="input-group">
          <label className="input-label">
            <Hash size={14} style={{ marginRight: '4px' }} />
            Número da Casa
          </label>
          <input
            type="text"
            name="houseNumber"
            value={formData.houseNumber}
            onChange={onChange}
            className="input-field"
            placeholder="Ex: 123"
            required
          />
        </div>
      </div>
      
      <button 
        type="submit" 
        className="btn btn-primary w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Confirmando...' : (
          <>
            Finalizar Reserva
            <Send size={18} />
          </>
        )}
      </button>

      <style dangerouslySetInnerHTML={{ __html: `
        .booking-form {
          background: var(--surface-light);
          padding: 2rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--glass-border);
        }
        
        .form-grid {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 2rem;
        }
      `}} />
    </form>
  );
};

export default BookingForm;
