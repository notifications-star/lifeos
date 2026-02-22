import { useState } from 'react';
import { supabase } from './supabaseClient';

export default function AuthScreen() {
    const [mode, setMode] = useState<'login' | 'signup'>('signup');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

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
        <div style={{
            minHeight: '100dvh',
            background: 'linear-gradient(160deg, #0a0a1a 0%, #0f0e1e 40%, #1a1030 100%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '40px 24px', position: 'relative', overflow: 'hidden',
        }}>
            {/* Ambient orbs */}
            <div style={{
                position: 'absolute', top: '-20%', right: '-15%', width: 400, height: 400,
                background: 'radial-gradient(circle, rgba(139,111,212,0.15) 0%, transparent 70%)',
                borderRadius: '50%', filter: 'blur(60px)',
            }} />
            <div style={{
                position: 'absolute', bottom: '-10%', left: '-20%', width: 350, height: 350,
                background: 'radial-gradient(circle, rgba(61,191,133,0.12) 0%, transparent 70%)',
                borderRadius: '50%', filter: 'blur(60px)',
            }} />
            <div style={{
                position: 'absolute', top: '30%', left: '60%', width: 200, height: 200,
                background: 'radial-gradient(circle, rgba(77,166,232,0.08) 0%, transparent 70%)',
                borderRadius: '50%', filter: 'blur(40px)',
            }} />

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 380 }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 48 }}>
                    <div style={{
                        width: 72, height: 72, margin: '0 auto 20px',
                        background: 'linear-gradient(145deg, rgba(139,111,212,0.2), rgba(61,191,133,0.2))',
                        borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 32, backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        boxShadow: '0 8px 32px rgba(139,111,212,0.2)',
                    }}>⚡</div>
                    <h1 style={{
                        fontSize: 32, fontWeight: 900, letterSpacing: -1,
                        background: 'linear-gradient(135deg, #ffffff 0%, #c0b8d8 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        marginBottom: 6, lineHeight: 1.1,
                    }}>LifeOS</h1>
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', fontWeight: 600, letterSpacing: 0.5 }}>
                        Your AI execution engine
                    </p>
                </div>

                {/* Card */}
                <div style={{
                    background: 'rgba(255,255,255,0.04)',
                    backdropFilter: 'blur(40px)',
                    borderRadius: 28, padding: '32px 24px',
                    border: '1px solid rgba(255,255,255,0.06)',
                    boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
                }}>
                    {/* Toggle */}
                    <div style={{
                        display: 'flex', background: 'rgba(255,255,255,0.04)',
                        borderRadius: 14, padding: 4, marginBottom: 28,
                        border: '1px solid rgba(255,255,255,0.04)',
                    }}>
                        {(['signup', 'login'] as const).map((m) => (
                            <button key={m} onClick={() => { setMode(m); setError(''); setSuccess(''); }}
                                style={{
                                    flex: 1, padding: '10px 0', border: 'none', borderRadius: 11,
                                    fontSize: 14, fontWeight: 800, fontFamily: 'Nunito, sans-serif',
                                    cursor: 'pointer', transition: 'all 0.25s ease',
                                    background: mode === m
                                        ? 'linear-gradient(135deg, rgba(139,111,212,0.3), rgba(77,166,232,0.2))'
                                        : 'transparent',
                                    color: mode === m ? '#fff' : 'rgba(255,255,255,0.3)',
                                    boxShadow: mode === m ? '0 4px 16px rgba(139,111,212,0.15)' : 'none',
                                }}>
                                {m === 'signup' ? 'Sign up' : 'Log in'}
                            </button>
                        ))}
                    </div>

                    {/* Fields */}
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 8, letterSpacing: 0.5 }}>EMAIL</label>
                        <input
                            type="email" placeholder="you@example.com" value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                width: '100%', padding: '14px 16px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1.5px solid rgba(255,255,255,0.08)',
                                borderRadius: 14, fontSize: 15, fontWeight: 600,
                                fontFamily: 'Nunito, sans-serif', color: '#fff', outline: 'none',
                                transition: 'border-color 0.2s',
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'rgba(139,111,212,0.4)'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                        />
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 8, letterSpacing: 0.5 }}>PASSWORD</label>
                        <input
                            type="password" placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'} value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            style={{
                                width: '100%', padding: '14px 16px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1.5px solid rgba(255,255,255,0.08)',
                                borderRadius: 14, fontSize: 15, fontWeight: 600,
                                fontFamily: 'Nunito, sans-serif', color: '#fff', outline: 'none',
                                transition: 'border-color 0.2s',
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'rgba(139,111,212,0.4)'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                        />
                    </div>

                    {/* Error / Success */}
                    {error && (
                        <div style={{
                            padding: '10px 14px', borderRadius: 12, marginBottom: 16,
                            background: 'rgba(240,120,80,0.1)', border: '1px solid rgba(240,120,80,0.2)',
                            color: '#f8b090', fontSize: 13, fontWeight: 700,
                        }}>⚠️ {error}</div>
                    )}
                    {success && (
                        <div style={{
                            padding: '10px 14px', borderRadius: 12, marginBottom: 16,
                            background: 'rgba(61,191,133,0.1)', border: '1px solid rgba(61,191,133,0.2)',
                            color: '#7ee8b8', fontSize: 13, fontWeight: 700,
                        }}>✓ {success}</div>
                    )}

                    {/* Submit */}
                    <button onClick={handleSubmit} disabled={loading}
                        style={{
                            width: '100%', padding: '15px',
                            background: 'linear-gradient(135deg, #8b6fd4 0%, #6c5ce7 50%, #4da6e8 100%)',
                            border: 'none', borderRadius: 16,
                            fontSize: 16, fontWeight: 800, fontFamily: 'Nunito, sans-serif',
                            color: '#fff', cursor: loading ? 'wait' : 'pointer',
                            boxShadow: '0 8px 32px rgba(139,111,212,0.3), 0 2px 8px rgba(0,0,0,0.2)',
                            transition: 'transform 0.15s, opacity 0.2s',
                            opacity: loading ? 0.6 : 1,
                            letterSpacing: 0.3,
                        }}
                        onMouseDown={(e) => (e.target as HTMLElement).style.transform = 'scale(0.97)'}
                        onMouseUp={(e) => (e.target as HTMLElement).style.transform = 'scale(1)'}
                    >
                        {loading ? '...' : mode === 'signup' ? 'Create account →' : 'Log in →'}
                    </button>
                </div>

                {/* Bottom link */}
                <div style={{ textAlign: 'center', marginTop: 24 }}>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', fontWeight: 600 }}>
                        {mode === 'signup' ? 'Already have an account? ' : 'No account yet? '}
                    </span>
                    <span
                        onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError(''); setSuccess(''); }}
                        style={{ fontSize: 13, color: '#8b6fd4', fontWeight: 800, cursor: 'pointer' }}
                    >
                        {mode === 'signup' ? 'Log in' : 'Sign up'}
                    </span>
                </div>

                {/* Features */}
                <div style={{
                    display: 'flex', justifyContent: 'center', gap: 24, marginTop: 48,
                    opacity: 0.3,
                }}>
                    {['📍 Location', '💬 AI Chat', '📊 Insights'].map((f) => (
                        <span key={f} style={{ fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: 0.3 }}>{f}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}
