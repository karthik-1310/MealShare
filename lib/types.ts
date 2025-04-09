export interface Profile {
  id: number;
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
}

export type ProfileUpdate = {
  username?: string;
  avatar_url?: string;
} 