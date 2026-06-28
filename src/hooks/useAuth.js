import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useAuth = () => {
  const [session, setSession] = useState(undefined); // undefined = todavía determinando

  useEffect(() => {
    // onAuthStateChange emite INITIAL_SESSION inmediatamente con el estado real
    // (incluyendo tokens de URL tras confirmación de email).
    // No usar getSession() en paralelo: puede sobreescribir la sesión procesada.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = () => supabase.auth.signOut();

  return { session, signOut, loading: session === undefined };
};
