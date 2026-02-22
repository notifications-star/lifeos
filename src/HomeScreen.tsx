import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import type { User } from '@supabase/supabase-js';

interface ProfileData {
    name: string | null;
    age_bracket: string | null;
    selected_goals: string[];
    answers: Record<string, string>;
}

export default function HomeScreen({ user }: { user: User }) {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProfile() {
            const { data } = await supabase
                .from('user_profiles')
                .select('name, age_bracket, selected_goals, answers')
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
                        {profile?.age_bracket ? `Age ${profile.age_bracket}` : 'Here\'s your focus'}
                    </p>
                </div>
                <button
                    onClick={handleLogout}
                    className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors mt-1 px-3 py-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.05)]"
                >
                    Log out
                </button>
            </div>

            {/* Goals */}
            {profile?.selected_goals && profile.selected_goals.length > 0 && (
                <div className="card-glass p-6 mb-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-lg">🎯</span>
                        <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Your Goals</h2>
                    </div>
                    <div className="space-y-2.5">
                        {profile.selected_goals.map((goal, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)]"
                            >
                                <div className="w-5 h-5 rounded-full border-2 border-[var(--color-primary-light)] flex-shrink-0" />
                                <span className="text-sm text-[var(--color-text-secondary)]">{goal}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Occupation */}
            {profile?.answers?.occupation && (
                <div className="card-glass p-5 mb-4 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
                    <p className="text-xs text-[var(--color-text-muted)] mb-1">Current focus</p>
                    <p className="text-sm text-[var(--color-text-secondary)]">{profile.answers.occupation}</p>
                </div>
            )}

            {/* Coming soon */}
            <div className="card-glass p-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">💡</span>
                    <h2 className="text-base font-semibold text-[var(--color-text-primary)]">What should I do now?</h2>
                </div>
                <p className="text-sm text-[var(--color-text-muted)] mb-4">
                    AI-powered suggestions based on your age, goals, and daily patterns.
                </p>
                <div className="p-3 rounded-xl bg-gradient-to-r from-[rgba(108,92,231,0.1)] to-[rgba(0,206,201,0.1)] border border-[rgba(108,92,231,0.15)]">
                    <p className="text-sm text-[var(--color-primary-light)]">
                        🚀 Coming soon
                    </p>
                </div>
            </div>
        </div>
    );
}
