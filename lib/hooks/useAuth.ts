import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import { Profile } from '../types/domain';

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;

  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        set({ session, user: session.user });
        await get().fetchProfile(session.user.id);
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (_event, session) => {
        set({ session, user: session?.user ?? null });

        if (session?.user) {
          await get().fetchProfile(session.user.id);
        } else {
          set({ profile: null });
        }
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      set({ loading: false, initialized: true });
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (e) {
      return { error: 'Erreur de connexion inattendue' };
    }
  },

  signUp: async (email: string, password: string, fullName: string) => {
    try {
      // 1. Create auth user
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (error) {
        return { error: error.message };
      }

      if (!data.user) {
        return { error: 'Erreur lors de la création du compte' };
      }

      // 2. Create org + profile atomically via SECURITY DEFINER function
      const { error: signupError } = await supabase.rpc('handle_signup', {
        user_id: data.user.id,
        user_email: email.trim().toLowerCase(),
        full_name: fullName,
        user_role: 'terrain',
      });

      if (signupError) {
        console.error('Signup RPC error:', signupError);
        return { error: 'Erreur lors de la création du profil' };
      }

      return { error: null };
    } catch (e) {
      return { error: 'Erreur d\'inscription inattendue' };
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, profile: null });
  },

  fetchProfile: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        set({ profile: data as Profile });
      }
    } catch (e) {
      console.error('Profile fetch error:', e);
    }
  },
}));
