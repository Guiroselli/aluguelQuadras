import type { CourtType } from './types';

export const ALL_TIME_SLOTS = [
  '06:00',
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
  '22:00',
];

export const COURTS: Array<{ id: CourtType; name: string; image: string; description: string }> = [
  {
    id: 'tennis-blue',
    name: 'Tênis 1 (Azul)',
    image: '/tennis.png',
    description: 'Quadra rápida premium',
  },
  {
    id: 'tennis-red',
    name: 'Tênis 2 (Vermelha)',
    image: '/tennis-red.png',
    description: 'Quadra rápida premium',
  },
  {
    id: 'soccer',
    name: 'Futebol (Society)',
    image: '/soccer.png',
    description: 'Campo de grama sintética',
  },
];

export function getCourtLabel(court: CourtType): string {
  return COURTS.find(({ id }) => id === court)?.name ?? 'Quadra';
}

export function calculateEndTime(startTime: string): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const endHours = hours + 1;
  return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}
