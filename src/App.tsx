import { useState } from 'react';
import OnboardingForm from './OnboardingForm';

function SuccessScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-6 relative z-10">
      <div className="success-checkmark mb-6">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0F0F23" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold mb-2 text-[var(--color-text-primary)] animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        You're all set
      </h1>
      <p className="text-[var(--color-text-muted)] text-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        We'll start suggesting what to do based on your goals and schedule.
      </p>
      <button
        className="btn-primary mt-8 max-w-xs animate-fade-in-up"
        style={{ animationDelay: '0.4s' }}
        onClick={() => {
          // In a real app: router.push('/home')
          window.location.hash = '#home';
        }}
      >
        Let's go →
      </button>
    </div>
  );
}

export default function App() {
  const [complete, setComplete] = useState(false);

  return (
    <>
      {/* Background orbs */}
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />

      {complete ? (
        <SuccessScreen />
      ) : (
        <OnboardingForm onComplete={() => setComplete(true)} />
      )}
    </>
  );
}
