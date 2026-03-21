import type { User } from '@supabase/supabase-js';
import type { UserProfile } from './types';

function readMetadataField(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function mapAuthUserToProfile(user: User | null): UserProfile | null {
  if (!user?.email) {
    return null;
  }

  const userName = readMetadataField(user.user_metadata.user_name ?? user.user_metadata.userName);
  const houseStreet = readMetadataField(
    user.user_metadata.house_street ?? user.user_metadata.houseStreet,
  );
  const houseNumber = readMetadataField(
    user.user_metadata.house_number ?? user.user_metadata.houseNumber,
  );

  if (!userName || !houseStreet || !houseNumber) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    userName,
    houseStreet,
    houseNumber,
  };
}
