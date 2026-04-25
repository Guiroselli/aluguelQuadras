import React from 'react';
import type { CourtType } from '../lib/types';

interface CourtCardProps {
  id: CourtType;
  name: string;
  image: string;
  description: string;
  onSelect: (id: CourtType) => void;
  selected?: boolean;
}

const CourtCard: React.FC<CourtCardProps> = ({ id, name, image, description, onSelect, selected }) => {
  return (
    <button
      type="button"
      className={`court-card ${selected ? 'selected' : ''}`}
      onClick={() => onSelect(id)}
    >
      <div className="court-image" style={{ backgroundImage: `url(${image})` }}>
        <div className="court-overlay" />
      </div>
      <div className="court-content">
        <div className="court-icon-wrapper">
          <span style={{ fontSize: '22px' }}>{id === 'soccer' ? '⚽' : '🎾'}</span>
        </div>
        <h3>{name}</h3>
        <p>{description}</p>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .court-card {
              position: relative;
              height: 400px;
              border-radius: var(--radius-lg);
              overflow: hidden;
              cursor: pointer;
              transition: var(--transition);
              border: 2px solid transparent;
              background: var(--surface);
              appearance: none;
              text-align: left;
              width: 100%;
              padding: 0;
            }

            .court-card:hover {
              transform: translateY(-10px);
              box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.2);
            }

            .court-card.selected {
              border-color: var(--primary);
            }

            .court-image {
              position: absolute;
              inset: 0;
              background-size: cover;
              background-position: center;
              transition: var(--transition);
            }

            .court-card:hover .court-image {
              transform: scale(1.05);
            }

            .court-overlay {
              position: absolute;
              inset: 0;
              background: linear-gradient(
                to top,
                rgba(15, 17, 21, 0.9) 0%,
                rgba(15, 17, 21, 0.2) 60%,
                transparent 100%
              );
            }

            .court-content {
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              padding: 2rem;
              display: flex;
              flex-direction: column;
              gap: 0.5rem;
              z-index: 2;
            }

            .court-content h3,
            .court-content p {
              color: #fff;
            }

            .court-icon-wrapper {
              width: 48px;
              height: 48px;
              border-radius: 12px;
              background: var(--primary);
              color: #fff;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 0.5rem;
            }

            .court-card.selected .court-icon-wrapper {
              box-shadow: 0 0 20px var(--primary);
            }
          `,
        }}
      />
    </button>
  );
};

export default CourtCard;
