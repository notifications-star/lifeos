import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import AuthScreen from './AuthScreen';
import OnboardingForm from './OnboardingForm';
import MainApp from './MainApp';
import type { User } from '@supabase/supabase-js';

type AppState = 'loading' | 'auth' | 'onboarding' | 'app';

export default function App() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState('Alex');

  useEffect(() => {
    // Set initial theme
    document.documentElement.setAttribute('data-theme', 'light');

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        checkOnboardingStatus(session.user);
      } else {
        setAppState('auth');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        checkOnboardingStatus(session.user);
      } else {
        setUser(null);
        setAppState('auth');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkOnboardingStatus(u: User) {
    const { data } = await supabase
      .from('user_profiles')
      .select('onboarding_complete, name')
      .eq('user_id', u.id)
      .single();

    if (data?.onboarding_complete) {
      setUserName(data.name || u.email?.split('@')[0] || 'Alex');
      setAppState('app');
    } else {
      setAppState('onboarding');
    }
  }

  const handleOnboardingComplete = () => {
    // Re-check to get the name
    if (user) {
      checkOnboardingStatus(user);
    } else {
      setAppState('app');
    }
  };

  return (
    <>
      {appState === 'loading' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, margin: '0 auto 16px', borderRadius: 20,
              background: 'linear-gradient(135deg, var(--lavender-dark), var(--sky-dark))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
            }}>⚡</div>
            <p style={{ color: 'var(--text3)' }}>Loading…</p>
          </div>
        </div>
      )}

      {appState === 'auth' && <AuthScreen />}

      {appState === 'onboarding' && user && (
        <OnboardingForm user={user} onComplete={handleOnboardingComplete} />
      )}

      {appState === 'app' && user && <MainApp userId={user.id} userName={userName} onLogout={() => supabase.auth.signOut()} />}
    </>
  );
}
