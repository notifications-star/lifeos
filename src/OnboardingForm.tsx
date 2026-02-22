import { useState } from 'react';
import { supabase } from './supabaseClient';
import type { User } from '@supabase/supabase-js';

const EMOJIS = ['🎓', '💼', '🏋️', '🎨', '🚀', '📚', '🎵', '🧘'];

export default function OnboardingForm({ user, onComplete }: { user: User; onComplete: () => void }) {
    const [step, setStep] = useState(0);
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [focus, setFocus] = useState('');
    const [saving, setSaving] = useState(false);

    const ages = ['13-17', '18-24', '25-34', '35-44', '45+'];

    const handleFinish = async () => {
        setSaving(true);
        try {
            await supabase.from('user_profiles').upsert({
                user_id: user.id,
                email: user.email,
                name: name || user.email?.split('@')[0] || 'User',
                age_bracket: age,
                answers: { focus },
                onboarding_complete: true,
            }, { onConflict: 'user_id' });
            onComplete();
        } catch (err) {
            console.error(err);
        }
        setSaving(false);
    };

    return (
        <div className="auth-page">
            <div className="auth-bg">
                <div className="auth-orb auth-orb-1" />
                <div className="auth-orb auth-orb-2" />
                <div className="auth-orb auth-orb-3" />
                <div className="auth-grain" />
            </div>

            <div className="auth-content auth-visible" style={{ maxWidth: 400 }}>
                {/* Progress dots */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
                    {[0, 1, 2].map((i) => (
                        <div key={i} style={{
                            width: step === i ? 24 : 8, height: 8, borderRadius: 4,
                            background: step >= i ? 'rgba(139,111,212,0.8)' : 'rgba(255,255,255,0.1)',
                            transition: 'all 0.3s ease',
                        }} />
                    ))}
                </div>

                <div className="auth-card">
                    {/* Step 0: Name */}
                    {step === 0 && (
                        <div>
                            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                                <div style={{ fontSize: 40, marginBottom: 12 }}>👋</div>
                                <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 6 }}>What's your name?</h2>
                                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>So Momentum Mom knows what to call you</p>
                            </div>
                            <div className="auth-field">
                                <input placeholder="Your first name" value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && name.trim() && setStep(1)}
                                    autoFocus />
                            </div>
                            <button className="auth-submit" style={{ marginTop: 20 }}
                                onClick={() => setStep(1)} disabled={!name.trim()}>
                                Continue →
                            </button>
                        </div>
                    )}

                    {/* Step 1: Age */}
                    {step === 1 && (
                        <div>
                            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                                <div style={{ fontSize: 40, marginBottom: 12 }}>🎂</div>
                                <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 6 }}>Hey {name}! How old are you?</h2>
                                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>This helps personalize your experience</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {ages.map((a) => (
                                    <button key={a} onClick={() => { setAge(a); setStep(2); }}
                                        style={{
                                            padding: '14px 18px', borderRadius: 16, border: '1.5px solid',
                                            borderColor: age === a ? 'rgba(139,111,212,0.5)' : 'rgba(255,255,255,0.06)',
                                            background: age === a ? 'rgba(139,111,212,0.12)' : 'rgba(255,255,255,0.03)',
                                            color: '#fff', fontSize: 15, fontWeight: 700,
                                            fontFamily: 'Nunito, sans-serif', cursor: 'pointer',
                                            textAlign: 'left', transition: 'all 0.2s',
                                            display: 'flex', alignItems: 'center', gap: 12,
                                        }}>
                                        <span style={{ fontSize: 20 }}>{EMOJIS[ages.indexOf(a)] || '🎯'}</span>
                                        {a} years old
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Focus + Finish */}
                    {step === 2 && (
                        <div>
                            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                                <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
                                <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 6 }}>What's your main focus?</h2>
                                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>You can always change this later</p>
                            </div>
                            <div className="auth-field" style={{ marginBottom: 20 }}>
                                <input placeholder="e.g. College, work, fitness, side project..."
                                    value={focus} onChange={(e) => setFocus(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleFinish()}
                                    autoFocus />
                            </div>
                            <button className="auth-submit" onClick={handleFinish} disabled={saving}>
                                {saving ? <span className="auth-spinner" /> : "Let's go! 🚀"}
                            </button>
                            <button onClick={handleFinish} disabled={saving}
                                style={{
                                    width: '100%', marginTop: 10, padding: 12, border: 'none',
                                    background: 'transparent', color: 'rgba(255,255,255,0.3)',
                                    fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                    fontFamily: 'Nunito, sans-serif',
                                }}>
                                Skip for now
                            </button>
                        </div>
                    )}
                </div>

                {/* Back button */}
                {step > 0 && (
                    <div style={{ textAlign: 'center', marginTop: 16 }}>
                        <span onClick={() => setStep(step - 1)}
                            style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontWeight: 700 }}>
                            ← Back
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
