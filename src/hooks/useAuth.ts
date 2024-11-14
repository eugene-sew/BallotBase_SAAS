import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          planType: (session.user.user_metadata.planType as 'basic' | 'premium') || 'basic',
        });
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          planType: (session.user.user_metadata.planType as 'basic' | 'premium') || 'basic',
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, planType: 'basic' | 'premium') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          planType,
        },
      },
    });

    if (error) {
      console.log(error);
      throw error
    };
    if (data.user) {
      const timestamp = new Date().toISOString();
      // Create a new user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email,
          plan_type: planType,
          created_at: timestamp,
          updated_at: timestamp
        })
        .select()
        .single();

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw profileError;
      }


      const { data: profile } = await supabase
        .from('users')
        .select()
        .eq('id', data.user.id)
        .single();


    }
  };



  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
};