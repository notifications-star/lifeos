import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import type { User } from '@supabase/supabase-js';

interface ProfileData {
    name: string | null;
    goals: string[];
    intensity: string;
    timezone: string;
    work_style_micro: boolean;
    work_style_deep: boolean;
}

export default function HomeScreen({ user }: { user: User }) {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProfile() {
            const { data } = await supabase
                .from('user_profiles')
                .select('name, goals, intensity, timezone, work_style_micro, work_style_deep')
                .eq('user_id', user.id)
                .single();

            if (data) setProfile(data);
            setLoading(false);
        }
        fetchProfile();
    }, [user.id]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    const displayName = profile?.name || user.email?.split('@')[0] || 'there';

    const greeting = (() => {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 17) return 'Good afternoon';
        return 'Good evening';
    })();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-dvh relative z-10">
                <div className="text-[var(--color-text-muted)] animate-pulse">Loading…</div>
            </div>
        );
    }

    return (
        <div className="relative z-10 w-full max-w-lg mx-auto px-4 pt-10 pb-8 min-h-dvh">
            {/* Header */}
            <div className="flex items-start justify-between mb-8 animate-fade-in-up">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                        {greeting}, {displayName} 👋
                    </h1>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1">
                        Here's your focus for today
                    </p>
                </div>
                <button
                    onClick={handleLogout}
                    className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors mt-1 px-3 py-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.05)]"
                >
                    Log out
                </button>
            </div>

            {/* Goals Card */}
            {profile?.goals && profile.goals.length > 0 && (
                <div className="card-glass p-6 mb-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-lg">🎯</span>
                        <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Your Goals</h2>
                    </div>
                    <div className="space-y-3">
                        {profile.goals.map((goal, i) => (
                            <div
                                key={i}
                                className="flex items-start gap-3 p-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)]"
                            >
                                <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-xs font-semibold text-white flex-shrink-0 mt-0.5">
                                    {i + 1}
                                </div>
                                <span className="text-sm text-[var(--color-text-secondary)]">{goal}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="card-glass p-4 text-center">
                    <span className="text-2xl mb-1 block">
                        {profile?.intensity === 'gentle' ? '🌙' : profile?.intensity === 'strict' ? '🔥' : '🔔'}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)] capitalize">{profile?.intensity || 'Normal'} mode</span>
                </div>
                <div className="card-glass p-4 text-center">
                    <span className="text-2xl mb-1 block">
                        {profile?.work_style_deep && profile?.work_style_micro ? '⚡🧠' : profile?.work_style_deep ? '🧠' : profile?.work_style_micro ? '⚡' : '—'}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)]">
                        {profile?.work_style_deep && profile?.work_style_micro
                            ? 'Mixed style'
                            : profile?.work_style_deep
                                ? 'Deep work'
                                : profile?.work_style_micro
                                    ? 'Micro tasks'
                                    : 'No preference'}
                    </span>
                </div>
            </div>

            {/* What to do now placeholder */}
            <div className="card-glass p-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">💡</span>
                    <h2 className="text-base font-semibold text-[var(--color-text-primary)]">What should I do now?</h2>
                </div>
                <p className="text-sm text-[var(--color-text-muted)]">
                    Suggestions based on your goals and schedule will appear here soon.
                </p>
                <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-[rgba(108,92,231,0.1)] to-[rgba(0,206,201,0.1)] border border-[rgba(108,92,231,0.15)]">
                    <p className="text-sm text-[var(--color-primary-light)]">
                        🚀 Coming soon — AI-powered task suggestions
                    </p>
                </div>
            </div>
        </div>
    );
}
