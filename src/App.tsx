import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import AuthScreen from './AuthScreen';
import OnboardingForm from './OnboardingForm';
import HomeScreen from './HomeScreen';
import type { User } from '@supabase/supabase-js';

type AppState = 'loading' | 'auth' | 'onboarding' | 'home';

export default function App() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        checkOnboardingStatus(session.user.id);
      } else {
        setAppState('auth');
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        checkOnboardingStatus(session.user.id);
      } else {
        setUser(null);
        setAppState('auth');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkOnboardingStatus(userId: string) {
    const { data } = await supabase
      .from('user_profiles')
      .select('onboarding_complete')
      .eq('user_id', userId)
      .single();

    if (data?.onboarding_complete) {
      setAppState('home');
    } else {
      setAppState('onboarding');
    }
  }

  const handleOnboardingComplete = () => {
    setAppState('home');
  };

  return (
    <>
      {/* Background orbs */}
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />

      {appState === 'loading' && (
        <div className="flex items-center justify-center min-h-dvh relative z-10">
          <div className="text-center animate-fade-in-up">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-2xl shadow-lg shadow-[rgba(108,92,231,0.3)]">
              ⚡
            </div>
            <p className="text-[var(--color-text-muted)] animate-pulse">Loading…</p>
          </div>
        </div>
      )}

      {appState === 'auth' && <AuthScreen />}

      {appState === 'onboarding' && user && (
        <OnboardingForm user={user} onComplete={handleOnboardingComplete} />
      )}

      {appState === 'home' && user && <HomeScreen user={user} />}
    </>
  );
}
