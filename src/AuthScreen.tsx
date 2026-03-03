/* eslint-disable */
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export default function AuthScreen() {
    const [mode, setMode] = useState<'login' | 'signup'>('signup');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

    const handleSubmit = async () => {
        setError(''); setSuccess('');
        if (!email || !password) { setError('Fill in both fields'); return; }
        if (password.length < 6) { setError('Password needs 6+ characters'); return; }
        setLoading(true);
        try {
            if (mode === 'signup') {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                setSuccess('Check your email to confirm ✓');
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            }
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        }
        setLoading(false);
    };

    return (
        <div className="auth-page">
            {/* Animated mesh gradient */}
            <div className="auth-bg">
                <div className="auth-orb auth-orb-1" />
                <div className="auth-orb auth-orb-2" />
                <div className="auth-orb auth-orb-3" />
                <div className="auth-grain" />
            </div>

            <div className={`auth-content ${mounted ? 'auth-visible' : ''}`}>
                {/* Logo */}
                <div className="auth-logo-section">
                    <div className="auth-logo">
                        <span className="auth-logo-icon">⚡</span>
                    </div>
                    <h1 className="auth-title">Momentum</h1>
                    <p className="auth-subtitle">Your AI-powered life engine</p>
                </div>

                {/* Card */}
                <div className="auth-card">
                    {/* Tab toggle */}
                    <div className="auth-tabs">
                        <button className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
                            onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}>
                            Sign up
                        </button>
                        <button className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
                            onClick={() => { setMode('login'); setError(''); setSuccess(''); }}>
                            Log in
                        </button>
                        <div className="auth-tab-indicator" style={{ transform: mode === 'login' ? 'translateX(100%)' : 'translateX(0)' }} />
                    </div>

                    {/* Fields */}
                    <div className="auth-fields">
                        <div className="auth-field">
                            <label>Email</label>
                            <input type="email" placeholder="alex@university.edu" value={email}
                                onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                        </div>
                        <div className="auth-field">
                            <label>Password</label>
                            <input type="password" placeholder={mode === 'signup' ? 'Create a password' : 'Enter password'}
                                value={password} onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />
                        </div>
                    </div>

                    {/* Messages */}
                    {error && <div className="auth-msg auth-error">⚠️ {error}</div>}
                    {success && <div className="auth-msg auth-success">✓ {success}</div>}

                    {/* Submit */}
                    <button className="auth-submit" onClick={handleSubmit} disabled={loading}>
                        {loading ? (
                            <span className="auth-spinner" />
                        ) : (
                            mode === 'signup' ? 'Create account' : 'Log in'
                        )}
                    </button>

                    {/* Divider */}
                    <div className="auth-divider">
                        <span>or continue with</span>
                    </div>

                    {/* Social (visual only) */}
                    <div className="auth-social">
                        <button className="auth-social-btn" title="Google">
                            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                        </button>
                        <button className="auth-social-btn" title="Apple">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" /></svg>
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <p className="auth-footer">
                    {mode === 'signup' ? 'Already have an account? ' : 'Need an account? '}
                    <span onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError(''); setSuccess(''); }}>
                        {mode === 'signup' ? 'Log in' : 'Sign up'}
                    </span>
                </p>
            </div>
        </div>
    );
}
