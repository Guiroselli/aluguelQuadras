export type CourtType = 'tennis-blue' | 'tennis-red' | 'soccer';

export interface UserProfile {
  id: string;
  email: string;
  userName: string;
  houseStreet: string;
  houseNumber: string;
}

export interface Booking {
  id: string;
  user_id: string;
  court: CourtType;
  date: string;
  start_time: string;
  end_time: string;
  user_name: string;
  house_street: string;
  house_number: string;
  created_at: string;
}
