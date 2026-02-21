import { useState } from 'react';
import { supabase } from './supabaseClient';

type AuthMode = 'login' | 'signup';

export default function AuthScreen() {
    const [mode, setMode] = useState<AuthMode>('signup');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!email.trim() || !password.trim()) {
            setError('Please fill in all fields.');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);

        try {
            if (mode === 'signup') {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) {
                    setError(error.message);
                } else {
                    setSuccess('Check your email to confirm your account, or continue if auto-confirmed.');
                }
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) {
                    setError(error.message);
                }
            }
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative z-10 flex items-center justify-center min-h-dvh px-4">
            <div className="w-full max-w-md">
                {/* Logo / Brand */}
                <div className="text-center mb-8 animate-fade-in-up">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-2xl shadow-lg shadow-[rgba(108,92,231,0.3)]">
                        ⚡
                    </div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                        LifeOS
                    </h1>
                    <p className="text-[var(--color-text-muted)] text-sm mt-1">
                        Your personal execution assistant
                    </p>
                </div>

                {/* Auth Card */}
                <div className="card-glass p-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    {/* Mode Toggle */}
                    <div className="flex rounded-xl bg-[var(--color-surface)] p-1 mb-6">
                        <button
                            type="button"
                            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${mode === 'signup'
                                    ? 'bg-[var(--color-primary)] text-white shadow-md'
                                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                                }`}
                            onClick={() => { setMode('signup'); setError(null); setSuccess(null); }}
                        >
                            Sign up
                        </button>
                        <button
                            type="button"
                            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${mode === 'login'
                                    ? 'bg-[var(--color-primary)] text-white shadow-md'
                                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                                }`}
                            onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
                        >
                            Log in
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">
                                Email
                            </label>
                            <input
                                type="email"
                                className="input-field"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">
                                Password
                            </label>
                            <input
                                type="password"
                                className="input-field"
                                placeholder="At least 6 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                            />
                        </div>

                        {error && (
                            <div className="p-3 rounded-xl bg-[rgba(255,107,107,0.1)] border border-[rgba(255,107,107,0.3)] text-sm text-[var(--color-danger)]">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="p-3 rounded-xl bg-[rgba(85,239,196,0.1)] border border-[rgba(85,239,196,0.3)] text-sm text-[var(--color-accent)]">
                                {success}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading
                                ? 'Please wait…'
                                : mode === 'signup'
                                    ? 'Create account'
                                    : 'Log in'
                            }
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs text-[var(--color-text-muted)] mt-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    {mode === 'signup'
                        ? 'Already have an account? '
                        : 'Don\'t have an account? '
                    }
                    <button
                        type="button"
                        className="text-[var(--color-primary-light)] hover:underline"
                        onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError(null); setSuccess(null); }}
                    >
                        {mode === 'signup' ? 'Log in' : 'Sign up'}
                    </button>
                </p>
            </div>
        </div>
    );
}
