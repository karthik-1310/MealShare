import { createClient } from '@/lib/supabase/client';
import { Profile, ProfileUpdate } from '@/lib/types';

/**
 * Fetches the profile for the current user
 */
export async function fetchProfile(): Promise<Profile | null> {
  const supabase = createClient();
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  // Get the profile for the current user
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  
  return data;
}

/**
 * Fetches a profile by user ID
 */
export async function fetchProfileById(userId: string): Promise<Profile | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching profile by ID:', error);
    return null;
  }
  
  return data;
}

/**
 * Updates the profile for the current user
 */
export async function updateProfile(updates: ProfileUpdate): Promise<{ success: boolean; error: any }> {
  const supabase = createClient();
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }
  
  // Update the profile
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', user.id);
  
  if (error) {
    console.error('Error updating profile:', error);
    return { success: false, error };
  }
  
  return { success: true, error: null };
}

/**
 * Uploads an avatar image and updates the profile
 */
export async function uploadAvatar(file: File): Promise<{ success: boolean; error: any; url?: string }> {
  const supabase = createClient();
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }
  
  // Generate a unique file name
  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `avatars/${fileName}`;
  
  // Upload the file
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file);
  
  if (uploadError) {
    console.error('Error uploading avatar:', uploadError);
    return { success: false, error: uploadError };
  }
  
  // Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);
  
  // Update the profile with the new avatar URL
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('user_id', user.id);
  
  if (updateError) {
    console.error('Error updating profile with avatar:', updateError);
    return { success: false, error: updateError };
  }
  
  return { success: true, error: null, url: publicUrl };
} 