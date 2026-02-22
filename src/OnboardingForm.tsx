import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import type { User } from '@supabase/supabase-js';

// =============================================
// AGE-BASED CONTENT DATA
// =============================================

interface AgeInsights {
    label: string;
    avgDay: string[];
    doThis: string[];
    avoidThis: string[];
    suggestedGoals: string[];
    questions: { key: string; label: string; placeholder: string }[];
}

const AGE_BRACKETS: Record<string, AgeInsights> = {
    '13-17': {
        label: '13–17 · Student',
        avgDay: [
            '6–8 hrs school + homework',
            '2–4 hrs screens & social media',
            '1–2 hrs socializing',
            '~30 min physical activity (avg)',
        ],
        doThis: [
            'Build a reading habit early — even 20 min/day compounds',
            'Try one extracurricular deeply, not five shallowly',
            'Sleep 8–9 hours — your brain is still developing',
            'Learn one real skill: coding, design, writing, or music',
        ],
        avoidThis: [
            'Doom-scrolling TikTok/Instagram before bed',
            'Comparing yourself to highlights online',
            'Skipping meals or sleep for screen time',
            'Procrastinating homework until midnight',
        ],
        suggestedGoals: [
            'Read 1 book per month',
            'Build a portfolio project',
            'Exercise 3x per week',
            'Limit social media to 1 hr/day',
            'Learn a new skill',
        ],
        questions: [
            { key: 'occupation', label: 'What are you focused on?', placeholder: 'e.g. High school, SAT prep, sports' },
            { key: 'biggestChallenge', label: 'Biggest daily challenge?', placeholder: 'e.g. Focus, procrastination, sleep' },
        ],
    },
    '18-24': {
        label: '18–24 · Early Career / College',
        avgDay: [
            '4–8 hrs work or classes',
            '3–5 hrs screens (non-work)',
            '~1 hr commute or transit',
            '6.5 hrs sleep (below optimal)',
        ],
        doThis: [
            'Ship projects — finished > perfect',
            'Network by helping, not asking',
            'Invest in skills that compound: writing, speaking, coding',
            'Start saving/investing even $50/month — habit matters more than amount',
        ],
        avoidThis: [
            'Tutorial hell — build things instead',
            'Spending to impress people you don\'t like',
            'Saying yes to everything — protect your time',
            'Neglecting physical health for hustle culture',
        ],
        suggestedGoals: [
            'Ship 1 project this month',
            'Read 2 books per month',
            'Save or invest consistently',
            'Build a morning routine',
            'Exercise 4x per week',
            'Reduce screen time to 2 hrs/day',
        ],
        questions: [
            { key: 'occupation', label: 'What do you do?', placeholder: 'e.g. College student, junior dev, freelancer' },
            { key: 'biggestChallenge', label: 'What holds you back most?', placeholder: 'e.g. Discipline, direction, anxiety' },
            { key: 'income', label: 'Do you have income to manage?', placeholder: 'e.g. Part-time, full-time, none yet' },
        ],
    },
    '25-34': {
        label: '25–34 · Career Building',
        avgDay: [
            '8–10 hrs work + commute',
            '2–3 hrs screens (non-work)',
            '1–2 hrs chores & errands',
            '6.8 hrs sleep (avg)',
        ],
        doThis: [
            'Go deep in one domain — become the expert',
            'Automate finances: bills, savings, investing',
            'Protect 2 hrs of deep work daily — no meetings, no Slack',
            'Build relationships that outlast any job',
        ],
        avoidThis: [
            'Lifestyle creep — keep expenses flat as income grows',
            'Working 70-hr weeks thinking it\'ll pay off later',
            'Ignoring health — it gets harder every year after 30',
            'Social media comparison to curated highlight reels',
        ],
        suggestedGoals: [
            'Reach next career milestone',
            'Build an emergency fund',
            'Exercise 4–5x per week',
            'Deep work 2 hrs every day',
            'One weekend hobby that isn\'t screens',
            'Read / learn 30 min daily',
        ],
        questions: [
            { key: 'occupation', label: 'What\'s your role?', placeholder: 'e.g. Product manager, engineer, entrepreneur' },
            { key: 'biggestChallenge', label: 'What feels most overwhelming?', placeholder: 'e.g. Work-life balance, burnout, finances' },
            { key: 'hasFamily', label: 'Family situation?', placeholder: 'e.g. Single, partner, kids' },
        ],
    },
    '35-44': {
        label: '35–44 · Peak Career / Family',
        avgDay: [
            '8–9 hrs work',
            '2–3 hrs family / kids',
            '1–2 hrs chores & logistics',
            '6.5 hrs sleep (often less)',
        ],
        doThis: [
            'Delegate — your time is worth more than your ego',
            'Invest in health NOW — the ROI is massive after 35',
            'Schedule family time like you schedule meetings',
            'Say no to 90% of things that aren\'t core priorities',
        ],
        avoidThis: [
            'Being "busy" but not productive',
            'Neglecting relationships for career',
            'Skipping annual health checkups',
            'Taking on debt for lifestyle upgrades',
        ],
        suggestedGoals: [
            'Protect daily exercise (even 30 min)',
            'Plan family time weekly',
            'Build passive income streams',
            'Sleep 7+ hours consistently',
            'Annual health checkup',
            'Learn to say no',
        ],
        questions: [
            { key: 'occupation', label: 'What\'s your work?', placeholder: 'e.g. Manager, founder, consultant' },
            { key: 'biggestChallenge', label: 'What\'s your biggest constraint?', placeholder: 'e.g. Time with family, energy, stress' },
        ],
    },
    '45+': {
        label: '45+ · Wisdom Phase',
        avgDay: [
            '7–9 hrs work (often flexible)',
            '2–3 hrs family / community',
            '1–2 hrs health & wellness',
            '6–7 hrs sleep',
        ],
        doThis: [
            'Mentor someone younger — it compounds for both of you',
            'Prioritize flexibility and mobility training',
            'Invest in experiences over things',
            'Build systems that run without you',
        ],
        avoidThis: [
            'Ignoring signs of burnout — recovery takes longer now',
            'Being resistant to new technology and methods',
            'Isolation — stay socially connected',
            'Putting off health investments',
        ],
        suggestedGoals: [
            'Daily movement / flexibility routine',
            'Mentor 1 person',
            'Plan a meaningful experience monthly',
            'Strengthen key relationships',
            'Regular health optimization',
            'Learn something new each quarter',
        ],
        questions: [
            { key: 'occupation', label: 'How do you spend your days?', placeholder: 'e.g. Executive, consultant, semi-retired' },
            { key: 'biggestChallenge', label: 'What would you like to improve?', placeholder: 'e.g. Health, relationships, purpose' },
        ],
    },
};

const AGE_OPTIONS = Object.keys(AGE_BRACKETS);

// =============================================
// COMPONENT
// =============================================

export default function OnboardingForm({ user, onComplete }: { user: User; onComplete: () => void }) {
    const [step, setStep] = useState(0); // 0=age, 1=questions, 2=insights
    const [age, setAge] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
    const [customGoal, setCustomGoal] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [animating, setAnimating] = useState(false);

    useEffect(() => {
        setAnimating(true);
        const t = setTimeout(() => setAnimating(false), 50);
        return () => clearTimeout(t);
    }, [step]);

    const insights = age ? AGE_BRACKETS[age] : null;

    const goNext = () => {
        setStep((s) => Math.min(s + 1, 2));
    };

    const goBack = () => {
        setStep((s) => Math.max(s - 1, 0));
    };

    const toggleGoal = (goal: string) => {
        setSelectedGoals((prev) =>
            prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
        );
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        const payload = {
            user_id: user.id,
            email: user.email,
            name: name || null,
            age_bracket: age,
            answers,
            selected_goals: customGoal.trim()
                ? [...selectedGoals, customGoal.trim()]
                : selectedGoals,
            onboarding_complete: true,
        };

        localStorage.setItem('onboarding', JSON.stringify(payload));

        try {
            await supabase.from('user_profiles').insert(payload);
        } catch (err) {
            console.error('Save error:', err);
        }

        setSubmitting(false);
        onComplete();
    };

    const stepAnim = animating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0';

    const progress = ((step + 1) / 3) * 100;

    return (
        <div className="relative z-10 w-full max-w-lg mx-auto px-4 pt-8 pb-32 min-h-dvh">
            {/* Header */}
            <div className="text-center mb-6 animate-fade-in-up">
                <h1 className="text-2xl font-bold mb-1 bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-accent)] bg-clip-text text-transparent">
                    {step === 0 ? 'Tell us about you' : step === 1 ? 'A few quick questions' : 'Your personalized insights'}
                </h1>
                <p className="text-[var(--color-text-muted)] text-sm">
                    {step === 0 ? 'Just the basics — takes 30 seconds' : step === 1 ? 'Helps us tailor suggestions' : 'Based on your age & lifestyle'}
                </p>
            </div>

            {/* Progress */}
            <div className="w-full h-1 bg-[var(--color-surface-input)] rounded-full mb-8 overflow-hidden">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] transition-all duration-700 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Step Content */}
            <div className={`transition-all duration-400 ease-out ${stepAnim}`} key={step}>

                {/* ===== STEP 0: AGE ===== */}
                {step === 0 && (
                    <div className="space-y-4">
                        <div className="card-glass p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">
                                        Name <span className="text-[var(--color-text-muted)]">(optional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="How should we call you?"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-[var(--color-text-secondary)] mb-3">
                                        How old are you?
                                    </label>
                                    <div className="space-y-2">
                                        {AGE_OPTIONS.map((bracket) => (
                                            <button
                                                key={bracket}
                                                type="button"
                                                className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 ${age === bracket
                                                        ? 'bg-[rgba(108,92,231,0.15)] border-[var(--color-primary-light)] text-[var(--color-primary-light)]'
                                                        : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.06)] text-[var(--color-text-secondary)] hover:border-[rgba(108,92,231,0.2)]'
                                                    }`}
                                                onClick={() => setAge(bracket)}
                                            >
                                                <span className="font-medium">{AGE_BRACKETS[bracket].label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== STEP 1: QUESTIONS ===== */}
                {step === 1 && insights && (
                    <div className="card-glass p-6">
                        <div className="flex items-center gap-2 mb-5">
                            <span className="text-lg">💬</span>
                            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Quick questions</h2>
                        </div>

                        <div className="space-y-4">
                            {insights.questions.map((q) => (
                                <div key={q.key}>
                                    <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">
                                        {q.label}
                                    </label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder={q.placeholder}
                                        value={answers[q.key] || ''}
                                        onChange={(e) => setAnswers({ ...answers, [q.key]: e.target.value })}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ===== STEP 2: INSIGHTS ===== */}
                {step === 2 && insights && (
                    <div className="space-y-4">
                        {/* Average Day */}
                        <div className="card-glass p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-lg">📊</span>
                                <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
                                    Average day for your age
                                </h2>
                            </div>
                            <div className="space-y-2">
                                {insights.avgDay.map((item, i) => (
                                    <div key={i} className="flex items-start gap-2.5 py-1.5">
                                        <span className="text-[var(--color-text-muted)] text-sm mt-0.5">•</span>
                                        <span className="text-sm text-[var(--color-text-secondary)]">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Do This / Avoid This */}
                        <div className="grid grid-cols-1 gap-4">
                            <div className="card-glass p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-base">✅</span>
                                    <h3 className="text-sm font-semibold text-[var(--color-accent)]">Do this</h3>
                                </div>
                                <div className="space-y-2">
                                    {insights.doThis.map((item, i) => (
                                        <p key={i} className="text-sm text-[var(--color-text-secondary)] leading-relaxed pl-5">
                                            {item}
                                        </p>
                                    ))}
                                </div>
                            </div>

                            <div className="card-glass p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-base">🚫</span>
                                    <h3 className="text-sm font-semibold text-[var(--color-danger)]">Avoid this</h3>
                                </div>
                                <div className="space-y-2">
                                    {insights.avoidThis.map((item, i) => (
                                        <p key={i} className="text-sm text-[var(--color-text-secondary)] leading-relaxed pl-5">
                                            {item}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Goal Picker */}
                        <div className="card-glass p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-lg">🎯</span>
                                <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
                                    Pick your goals
                                </h2>
                            </div>
                            <p className="text-xs text-[var(--color-text-muted)] mb-3">Tap to select. You can add your own.</p>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {insights.suggestedGoals.map((goal) => (
                                    <button
                                        key={goal}
                                        type="button"
                                        className={`chip ${selectedGoals.includes(goal) ? 'selected' : ''}`}
                                        onClick={() => toggleGoal(goal)}
                                    >
                                        {selectedGoals.includes(goal) ? '✓ ' : ''}{goal}
                                    </button>
                                ))}
                            </div>
                            <input
                                type="text"
                                className="input-field text-sm"
                                placeholder="+ Add a custom goal"
                                value={customGoal}
                                onChange={(e) => setCustomGoal(e.target.value)}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Sticky Nav */}
            <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-[#0F0F23] via-[#0F0F23] to-transparent">
                <div className="max-w-lg mx-auto flex gap-3">
                    {step > 0 && (
                        <button type="button" className="btn-secondary flex-shrink-0 px-6" onClick={goBack}>
                            ← Back
                        </button>
                    )}

                    {step === 0 && (
                        <button
                            type="button"
                            className="btn-primary flex-1"
                            disabled={!age}
                            onClick={goNext}
                        >
                            Next →
                        </button>
                    )}

                    {step === 1 && (
                        <button type="button" className="btn-primary flex-1" onClick={goNext}>
                            See my insights →
                        </button>
                    )}

                    {step === 2 && (
                        <button
                            type="button"
                            className="btn-primary flex-1"
                            disabled={submitting || selectedGoals.length === 0}
                            onClick={handleSubmit}
                        >
                            {submitting ? 'Saving…' : `Start with ${selectedGoals.length} goal${selectedGoals.length !== 1 ? 's' : ''} ✓`}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
