import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import type { User } from '@supabase/supabase-js';

// ---------- Types ----------
interface OnboardingData {
    name: string;
    timezone: string;
    wakeTime: string;
    sleepTime: string;
    goals: [string, string, string];
    distraction: string;
    workStyle: { micro: boolean; deep: boolean };
    quietHours: { enabled: boolean; start: string; end: string };
    intensity: 'gentle' | 'normal' | 'strict';
    permissions: { location: boolean; motion: boolean };
}

// ---------- Helpers ----------
function detectTimezone(): string {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
        return 'UTC';
    }
}

const COMMON_TIMEZONES = [
    'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'America/Anchorage', 'Pacific/Honolulu', 'America/Phoenix',
    'America/Toronto', 'America/Vancouver', 'America/Mexico_City',
    'America/Sao_Paulo', 'America/Buenos_Aires', 'America/Bogota',
    'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Madrid',
    'Europe/Rome', 'Europe/Amsterdam', 'Europe/Moscow',
    'Asia/Dubai', 'Asia/Kolkata', 'Asia/Bangkok', 'Asia/Jakarta', 'Asia/Singapore',
    'Asia/Shanghai', 'Asia/Tokyo', 'Asia/Seoul', 'Asia/Hong_Kong',
    'Australia/Sydney', 'Australia/Melbourne', 'Pacific/Auckland',
    'Africa/Lagos', 'Africa/Cairo', 'Africa/Johannesburg',
    'UTC',
];

const STEP_TITLES = ['Profile', 'Goals', 'Preferences'];

// ---------- Toggle ----------
function Toggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
    return (
        <button
            type="button"
            className={`toggle-track ${active ? 'active' : ''}`}
            onClick={onToggle}
            aria-pressed={active}
        >
            <span className="toggle-thumb" />
        </button>
    );
}

// ---------- Step Indicator ----------
function StepIndicator({ step }: { step: number }) {
    return (
        <div className="flex items-center justify-center gap-2 mb-8">
            {STEP_TITLES.map((label, i) => {
                const isComplete = i < step;
                const isCurrent = i === step;
                return (
                    <div key={label} className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                            <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-500 ${isComplete
                                    ? 'bg-[var(--color-accent)] text-[#0F0F23] scale-90'
                                    : isCurrent
                                        ? 'bg-[var(--color-primary)] text-white ring-4 ring-[rgba(108,92,231,0.25)]'
                                        : 'bg-[var(--color-surface-input)] text-[var(--color-text-muted)]'
                                    }`}
                            >
                                {isComplete ? '✓' : i + 1}
                            </div>
                            <span
                                className={`text-sm font-medium hidden sm:inline transition-colors duration-300 ${isComplete
                                    ? 'text-[var(--color-accent)]'
                                    : isCurrent
                                        ? 'text-[var(--color-text-primary)]'
                                        : 'text-[var(--color-text-muted)]'
                                    }`}
                            >
                                {label}
                            </span>
                        </div>
                        {i < STEP_TITLES.length - 1 && (
                            <div
                                className={`w-8 sm:w-14 h-0.5 rounded transition-all duration-500 ${isComplete ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-surface-input)]'
                                    }`}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ---------- Progress Bar ----------
function ProgressBar({ step }: { step: number }) {
    const progress = ((step + 1) / 3) * 100;
    return (
        <div className="w-full h-1 bg-[var(--color-surface-input)] rounded-full mb-6 overflow-hidden">
            <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}

// ---------- Main Component ----------
export default function OnboardingForm({ user, onComplete }: { user: User; onComplete: () => void }) {
    const [step, setStep] = useState(0);
    const [data, setData] = useState<OnboardingData>({
        name: '',
        timezone: detectTimezone(),
        wakeTime: '07:00',
        sleepTime: '23:00',
        goals: ['', '', ''],
        distraction: '',
        workStyle: { micro: false, deep: false },
        quietHours: { enabled: true, start: '23:00', end: '07:00' },
        intensity: 'normal',
        permissions: { location: false, motion: false },
    });

    const [errors, setErrors] = useState<Record<string, boolean>>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [direction, setDirection] = useState<'forward' | 'back'>('forward');

    // Animate on step change
    const [animating, setAnimating] = useState(false);
    useEffect(() => {
        setAnimating(true);
        const t = setTimeout(() => setAnimating(false), 50);
        return () => clearTimeout(t);
    }, [step]);

    const updateGoal = (index: number, value: string) => {
        const newGoals = [...data.goals] as [string, string, string];
        newGoals[index] = value;
        setData({ ...data, goals: newGoals });
        setErrors((prev) => ({ ...prev, [`goal${index}`]: false }));
    };

    const validateStep = (s: number): boolean => {
        const newErrors: Record<string, boolean> = {};
        if (s === 0) {
            if (!data.wakeTime) newErrors.wakeTime = true;
            if (!data.sleepTime) newErrors.sleepTime = true;
        } else if (s === 1) {
            data.goals.forEach((g, i) => {
                if (!g.trim()) newErrors[`goal${i}`] = true;
            });
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const goNext = () => {
        if (!validateStep(step)) return;
        setDirection('forward');
        setStep((s) => Math.min(s + 1, 2));
    };

    const goBack = () => {
        setDirection('back');
        setStep((s) => Math.max(s - 1, 0));
    };

    const handleSubmit = async () => {
        if (!validateStep(step)) return;
        setSubmitError(null);
        setSubmitting(true);

        localStorage.setItem('onboarding', JSON.stringify(data));

        try {
            const { error } = await supabase.from('user_profiles').insert({
                user_id: user.id,
                email: user.email,
                name: data.name || null,
                timezone: data.timezone,
                wake_time: data.wakeTime,
                sleep_time: data.sleepTime,
                goals: data.goals,
                distraction: data.distraction || null,
                work_style_micro: data.workStyle.micro,
                work_style_deep: data.workStyle.deep,
                quiet_hours_enabled: data.quietHours.enabled,
                quiet_hours_start: data.quietHours.start,
                quiet_hours_end: data.quietHours.end,
                intensity: data.intensity,
                permission_location: data.permissions.location,
                permission_motion: data.permissions.motion,
                onboarding_complete: true,
            });

            if (error) {
                console.error('Supabase error:', error);
                setSubmitError('Could not save to cloud. Data saved locally.');
            }

            onComplete();
        } catch (err) {
            console.error('Network error:', err);
            onComplete();
        } finally {
            setSubmitting(false);
        }
    };

    const handleLocationPermission = async () => {
        try {
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                    () => setData({ ...data, permissions: { ...data.permissions, location: true } }),
                    () => setData({ ...data, permissions: { ...data.permissions, location: false } })
                );
            }
        } catch {
            // Permission denied or unavailable
        }
    };

    const stepAnimClass = animating
        ? 'opacity-0 translate-y-4'
        : 'opacity-100 translate-y-0';

    return (
        <div className="relative z-10 w-full max-w-lg mx-auto px-4 pt-8 pb-32 min-h-dvh">
            {/* Header */}
            <div className="text-center mb-4 animate-fade-in-up">
                <h1 className="text-2xl font-bold mb-1 bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-accent)] bg-clip-text text-transparent">
                    Let's set you up
                </h1>
                <p className="text-[var(--color-text-muted)] text-sm">
                    Step {step + 1} of 3 — {STEP_TITLES[step]}
                </p>
            </div>

            <StepIndicator step={step} />
            <ProgressBar step={step} />

            {/* Step Content */}
            <div
                className={`transition-all duration-400 ease-out ${stepAnimClass}`}
                style={{
                    transitionProperty: 'opacity, transform',
                }}
                key={step}
            >
                {/* ===== STEP 1: PROFILE ===== */}
                {step === 0 && (
                    <div className="card-glass p-6">
                        <div className="flex items-center gap-2 mb-5">
                            <span className="text-lg">👤</span>
                            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Profile</h2>
                        </div>

                        <div className="space-y-4">
                            {/* Email (from auth, read-only) */}
                            <div>
                                <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    className="input-field opacity-60"
                                    value={user.email || ''}
                                    disabled
                                />
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">
                                    Name <span className="text-[var(--color-text-muted)]">(optional)</span>
                                </label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="How should we call you?"
                                    value={data.name}
                                    onChange={(e) => setData({ ...data, name: e.target.value })}
                                />
                            </div>

                            {/* Timezone */}
                            <div>
                                <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">
                                    Timezone
                                </label>
                                <select
                                    className="input-field appearance-none"
                                    value={data.timezone}
                                    onChange={(e) => setData({ ...data, timezone: e.target.value })}
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%237878A0' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'right 16px center',
                                    }}
                                >
                                    {COMMON_TIMEZONES.map((tz) => (
                                        <option key={tz} value={tz}>
                                            {tz.replace(/_/g, ' ')}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Wake / Sleep */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">
                                        Wake time <span className="text-[var(--color-danger)]">*</span>
                                    </label>
                                    <input
                                        id="field-wakeTime"
                                        type="time"
                                        className={`input-field ${errors.wakeTime ? 'error' : ''}`}
                                        value={data.wakeTime}
                                        onChange={(e) => {
                                            setData({ ...data, wakeTime: e.target.value });
                                            setErrors((prev) => ({ ...prev, wakeTime: false }));
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">
                                        Sleep time <span className="text-[var(--color-danger)]">*</span>
                                    </label>
                                    <input
                                        id="field-sleepTime"
                                        type="time"
                                        className={`input-field ${errors.sleepTime ? 'error' : ''}`}
                                        value={data.sleepTime}
                                        onChange={(e) => {
                                            setData({ ...data, sleepTime: e.target.value });
                                            setErrors((prev) => ({ ...prev, sleepTime: false }));
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== STEP 2: GOALS ===== */}
                {step === 1 && (
                    <div className="card-glass p-6">
                        <div className="flex items-center gap-2 mb-5">
                            <span className="text-lg">🎯</span>
                            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Goals</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">
                                    Top 3 goals right now <span className="text-[var(--color-danger)]">*</span>
                                </label>
                                {[0, 1, 2].map((i) => (
                                    <input
                                        key={i}
                                        id={`field-goal${i}`}
                                        type="text"
                                        className={`input-field mb-2.5 ${errors[`goal${i}`] ? 'error' : ''}`}
                                        placeholder={
                                            i === 0
                                                ? 'e.g. Ship my side project'
                                                : i === 1
                                                    ? 'e.g. Exercise 3x a week'
                                                    : 'e.g. Read 2 books this month'
                                        }
                                        value={data.goals[i]}
                                        onChange={(e) => updateGoal(i, e.target.value)}
                                    />
                                ))}
                            </div>

                            <div>
                                <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">
                                    One thing you want to stop wasting time on
                                </label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="e.g. Instagram, YouTube, scrolling"
                                    value={data.distraction}
                                    onChange={(e) => setData({ ...data, distraction: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== STEP 3: PREFERENCES + CONNECT LATER ===== */}
                {step === 2 && (
                    <div className="space-y-4">
                        <div className="card-glass p-6">
                            <div className="flex items-center gap-2 mb-5">
                                <span className="text-lg">⚙️</span>
                                <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Preferences</h2>
                            </div>

                            <div className="space-y-6">
                                {/* Work style */}
                                <div>
                                    <label className="block text-sm text-[var(--color-text-secondary)] mb-2">
                                        Work style
                                    </label>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            className={`chip flex-1 text-center ${data.workStyle.micro ? 'selected' : ''}`}
                                            onClick={() =>
                                                setData({ ...data, workStyle: { ...data.workStyle, micro: !data.workStyle.micro } })
                                            }
                                        >
                                            ⚡ Micro tasks
                                            <span className="block text-xs mt-0.5 opacity-60">5–15 min</span>
                                        </button>
                                        <button
                                            type="button"
                                            className={`chip flex-1 text-center ${data.workStyle.deep ? 'selected' : ''}`}
                                            onClick={() =>
                                                setData({ ...data, workStyle: { ...data.workStyle, deep: !data.workStyle.deep } })
                                            }
                                        >
                                            🧠 Deep work
                                            <span className="block text-xs mt-0.5 opacity-60">45–90 min</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Quiet hours */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm text-[var(--color-text-secondary)]">Quiet hours</label>
                                        <Toggle
                                            active={data.quietHours.enabled}
                                            onToggle={() =>
                                                setData({ ...data, quietHours: { ...data.quietHours, enabled: !data.quietHours.enabled } })
                                            }
                                        />
                                    </div>
                                    {data.quietHours.enabled && (
                                        <div className="grid grid-cols-2 gap-3 mt-2">
                                            <div>
                                                <label className="block text-xs text-[var(--color-text-muted)] mb-1">From</label>
                                                <input
                                                    type="time"
                                                    className="input-field text-sm"
                                                    value={data.quietHours.start}
                                                    onChange={(e) =>
                                                        setData({ ...data, quietHours: { ...data.quietHours, start: e.target.value } })
                                                    }
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-[var(--color-text-muted)] mb-1">To</label>
                                                <input
                                                    type="time"
                                                    className="input-field text-sm"
                                                    value={data.quietHours.end}
                                                    onChange={(e) =>
                                                        setData({ ...data, quietHours: { ...data.quietHours, end: e.target.value } })
                                                    }
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Notification intensity */}
                                <div>
                                    <label className="block text-sm text-[var(--color-text-secondary)] mb-2">
                                        Notification intensity
                                    </label>
                                    <div className="flex gap-2">
                                        {(['gentle', 'normal', 'strict'] as const).map((opt) => (
                                            <button
                                                key={opt}
                                                type="button"
                                                className={`intensity-option ${data.intensity === opt ? 'selected' : ''}`}
                                                onClick={() => setData({ ...data, intensity: opt })}
                                            >
                                                <span className="block text-base mb-0.5">
                                                    {opt === 'gentle' ? '🌙' : opt === 'normal' ? '🔔' : '🔥'}
                                                </span>
                                                <span className="capitalize">{opt}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="flex items-center justify-between">
                                    <div className="pr-3">
                                        <label className="text-sm text-[var(--color-text-secondary)]">Location access</label>
                                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                                            Detect commute / home / office context
                                        </p>
                                    </div>
                                    {data.permissions.location ? (
                                        <span className="text-xs text-[var(--color-accent)] font-medium px-3 py-1.5 rounded-lg bg-[rgba(85,239,196,0.1)]">
                                            ✓ Enabled
                                        </span>
                                    ) : (
                                        <button
                                            type="button"
                                            className="btn-secondary text-sm py-2 px-4"
                                            onClick={handleLocationPermission}
                                        >
                                            Allow
                                        </button>
                                    )}
                                </div>

                                {/* Motion toggle */}
                                <div className="flex items-center justify-between">
                                    <div className="pr-3">
                                        <label className="text-sm text-[var(--color-text-secondary)]">
                                            Motion / commute detection
                                        </label>
                                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Optional</p>
                                    </div>
                                    <Toggle
                                        active={data.permissions.motion}
                                        onToggle={() =>
                                            setData({ ...data, permissions: { ...data.permissions, motion: !data.permissions.motion } })
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Connect later */}
                        <div className="card-glass p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-lg">🔗</span>
                                <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Connect later</h2>
                            </div>

                            <div className="flex gap-2 mb-3">
                                <button type="button" className="btn-secondary flex-1 justify-center text-sm">
                                    <span>📓</span> Notion
                                </button>
                                <button type="button" className="btn-secondary flex-1 justify-center text-sm">
                                    <span>📅</span> Calendar
                                </button>
                            </div>
                            <p className="text-xs text-[var(--color-text-muted)] text-center">
                                You can connect apps anytime. Setup takes 30 seconds later.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Error toast */}
            {submitError && (
                <div className="fixed top-4 left-4 right-4 z-50 max-w-lg mx-auto p-3 rounded-xl bg-[rgba(255,107,107,0.15)] border border-[var(--color-danger)] text-sm text-[var(--color-danger)] text-center animate-fade-in-up">
                    {submitError}
                </div>
            )}

            {/* Sticky Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-[#0F0F23] via-[#0F0F23] to-transparent">
                <div className="max-w-lg mx-auto flex gap-3">
                    {step > 0 && (
                        <button
                            type="button"
                            className="btn-secondary flex-shrink-0 px-6"
                            onClick={goBack}
                        >
                            ← Back
                        </button>
                    )}
                    {step < 2 ? (
                        <button type="button" className="btn-primary flex-1" onClick={goNext}>
                            Next →
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="btn-primary flex-1"
                            onClick={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? 'Saving…' : 'Finish setup ✓'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
