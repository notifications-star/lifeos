import { useState, useEffect } from 'react';
import { loadEvents, addEvent, deleteEvent, loadTodayLog, saveDailyLog, loadGoals, addGoal, deleteGoal, loadTasks, type AppEvent, type DailyLog, type Goal, type Task } from '../services/data';

export default function HomeTab({ onSwitchTab, onToggleTheme, isDark, userName, onLogout }: {
    onSwitchTab: (tab: string) => void;
    onToggleTheme: () => void;
    isDark: boolean;
    userName: string;
    onLogout: () => void;
}) {
    const [events, setEvents] = useState<AppEvent[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [log, setLog] = useState<DailyLog | null>(null);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [showEventForm, setShowEventForm] = useState(false);
    const [showLogForm, setShowLogForm] = useState(false);
    const [showGoalForm, setShowGoalForm] = useState(false);

    const now = new Date();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
    const monthDay = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    useEffect(() => {
        loadEvents().then(setEvents);
        loadTasks().then(setTasks);
        loadTodayLog().then(setLog);
        loadGoals().then(setGoals);
    }, []);

    const activeTasks = tasks.filter(t => !t.done);
    const doneTasks = tasks.filter(t => t.done);

    return (
        <div>
            {/* Header */}
            <div className="home-header">
                <div className="greeting-row">
                    <div>
                        <div className="greeting">{dayName}, {monthDay} ☀️</div>
                        <div className="name">Hey, {userName}!</div>
                    </div>
                    <div className="top-right-actions">
                        <div className="theme-toggle" onClick={onToggleTheme}>{isDark ? '☀️' : '🌙'}</div>
                        <div className="avatar" onClick={onLogout} title="Log out" style={{ cursor: 'pointer' }}>👤</div>
                    </div>
                </div>
            </div>

            {/* Quick Stats — real data */}
            <div className="stats-row">
                <StatChip icon="😴" val={log?.sleep_hours ? `${log.sleep_hours}h` : '—'} label="Sleep" color="#8b6fd4" onClick={() => setShowLogForm(true)} />
                <StatChip icon="👟" val={log?.steps ? `${(log.steps / 1000).toFixed(1)}k` : '—'} label="Steps" color="#4da6e8" onClick={() => setShowLogForm(true)} />
                <StatChip icon="📱" val={log?.screen_time_min ? `${Math.floor(log.screen_time_min / 60)}h ${log.screen_time_min % 60}m` : '—'} label="Screen" color="#e85080" onClick={() => setShowLogForm(true)} />
                <StatChip icon="✅" val={`${doneTasks.length}/${tasks.length}`} label="Tasks" color="#3dbf85" onClick={() => onSwitchTab('tasks')} />
                <StatChip icon="💧" val={log?.water_glasses ? `${log.water_glasses}` : '—'} label="Water" color="#4da6e8" onClick={() => setShowLogForm(true)} />
            </div>

            {/* NOW card — dynamic based on data */}
            <div className="now-card">
                <div className="now-eyebrow">● Right now</div>
                {activeTasks.length > 0 ? (
                    <>
                        <div className="now-title">You have {activeTasks.length} tasks today.</div>
                        <div className="now-sub">
                            {activeTasks.slice(0, 2).map(t => t.name).join(' · ')}
                            {activeTasks.length > 2 ? ` · +${activeTasks.length - 2} more` : ''}
                        </div>
                    </>
                ) : (
                    <>
                        <div className="now-title">All clear! 🎉</div>
                        <div className="now-sub">No tasks yet. Add some tasks or chat with me about your plans.</div>
                    </>
                )}
                <button className="now-cta" onClick={() => onSwitchTab('chat')}>💬 Chat with LifeOS Mom</button>
            </div>

            {/* Daily Log */}
            <div className="section-head">
                <div className="section-title">📊 Today's Stats</div>
                <div className="section-more" onClick={() => setShowLogForm(true)}>
                    {log ? 'Edit' : '+ Log'}
                </div>
            </div>

            {log ? (
                <div style={{ padding: '0 24px 8px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {log.mood && <MiniTag emoji={moodEmoji(log.mood)} text={log.mood} />}
                    {log.energy && <MiniTag emoji="⚡" text={`${log.energy} energy`} />}
                    {log.notes && <div style={{ width: '100%', fontSize: 12, color: 'var(--text3)', fontWeight: 600, fontStyle: 'italic' }}>"{log.notes}"</div>}
                </div>
            ) : (
                <div className="nudge" onClick={() => setShowLogForm(true)}>
                    <div className="nudge-icon-wrap" style={{ background: 'var(--lavender)' }}>📝</div>
                    <div className="nudge-body">
                        <div className="nudge-label" style={{ color: 'var(--lavender-text)' }}>Quick Log</div>
                        <div className="nudge-text">Tap to log your sleep, steps, mood, and more. The AI uses this for better advice!</div>
                    </div>
                </div>
            )}

            {/* Events */}
            <div className="section-head">
                <div className="section-title">📅 Today's Events</div>
                <div className="section-more" onClick={() => setShowEventForm(true)}>+ Add</div>
            </div>

            {events.length === 0 ? (
                <div className="nudge" onClick={() => setShowEventForm(true)}>
                    <div className="nudge-icon-wrap" style={{ background: 'var(--sky)' }}>📅</div>
                    <div className="nudge-body">
                        <div className="nudge-text">No events today. Tap to add one!</div>
                    </div>
                </div>
            ) : (
                events.map((ev) => (
                    <div key={ev.id} className="task" style={{ margin: '0 24px 8px' }}>
                        <div style={{ fontSize: 24 }}>{ev.emoji}</div>
                        <div className="task-info">
                            <div className="task-name">{ev.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                                {ev.start_time && `${ev.start_time}`}{ev.end_time && ` – ${ev.end_time}`}
                                {ev.location && ` · ${ev.location}`}
                            </div>
                        </div>
                        <div onClick={() => { deleteEvent(ev.id); setEvents(prev => prev.filter(e => e.id !== ev.id)); }}
                            style={{ fontSize: 14, color: 'var(--text3)', cursor: 'pointer', padding: 4 }}>✕</div>
                    </div>
                ))
            )}

            {/* Goals */}
            <div className="section-head">
                <div className="section-title">🎯 Goals</div>
                <div className="section-more" onClick={() => setShowGoalForm(true)}>+ Add</div>
            </div>

            {goals.length === 0 ? (
                <div className="nudge" onClick={() => setShowGoalForm(true)}>
                    <div className="nudge-icon-wrap" style={{ background: 'var(--mint)' }}>🎯</div>
                    <div className="nudge-body">
                        <div className="nudge-text">Set your goals so the AI can help you achieve them!</div>
                    </div>
                </div>
            ) : (
                <div style={{ padding: '0 24px 8px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {goals.map((g) => (
                        <div key={g.id} className="chip selected" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            🎯 {g.name}{g.target && <span style={{ opacity: 0.7 }}> · {g.target}</span>}
                            <span onClick={() => { deleteGoal(g.id); setGoals(prev => prev.filter(x => x.id !== g.id)); }}
                                style={{ cursor: 'pointer', marginLeft: 4, opacity: 0.5 }}>✕</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Tasks preview */}
            <div className="section-head">
                <div className="section-title">Today's Tasks</div>
                <div className="section-more" onClick={() => onSwitchTab('tasks')}>See all</div>
            </div>

            {tasks.length === 0 ? (
                <div className="nudge" onClick={() => onSwitchTab('tasks')}>
                    <div className="nudge-icon-wrap" style={{ background: 'var(--butter)' }}>📋</div>
                    <div className="nudge-body">
                        <div className="nudge-text">No tasks yet. Head to the Tasks tab to add some!</div>
                    </div>
                </div>
            ) : (
                tasks.slice(0, 3).map((t) => (
                    <div key={t.id} className="task">
                        <div className={`task-check ${t.done ? 'done' : ''}`} />
                        <div className="task-info">
                            <div className={`task-name ${t.done ? 'done' : ''}`}>{t.name}</div>
                            {t.source && <div className="task-tags"><span className="tag tag-canvas">{t.source}</span></div>}
                        </div>
                        {t.due_label && <div className="task-due">{t.due_label}</div>}
                    </div>
                ))
            )}

            {/* Day Score — based on real data */}
            <div className="section-head">
                <div className="section-title">Day Score</div>
                <div className="section-more" onClick={() => onSwitchTab('recap')}>Full recap</div>
            </div>
            <DayScoreReal tasks={tasks} log={log} goals={goals} events={events} />

            <div className="bottom-space" />

            {/* ═══ MODALS ═══ */}
            {showEventForm && <EventFormModal onClose={() => setShowEventForm(false)} onAdd={(ev) => { setEvents(prev => [...prev, ev]); setShowEventForm(false); }} />}
            {showLogForm && <DailyLogModal currentLog={log} onClose={() => setShowLogForm(false)} onSave={(l) => { setLog(l); setShowLogForm(false); }} />}
            {showGoalForm && <GoalFormModal onClose={() => setShowGoalForm(false)} onAdd={(g) => { setGoals(prev => [...prev, g]); setShowGoalForm(false); }} />}
        </div>
    );
}

// ═══ SMALL COMPONENTS ═══
function StatChip({ icon, val, label, color, onClick }: { icon: string; val: string; label: string; color: string; onClick?: () => void }) {
    return (
        <div className="stat-chip" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
            <div className="stat-icon">{icon}</div>
            <div className="stat-val" style={{ color }}>{val}</div>
            <div className="stat-label">{label}</div>
        </div>
    );
}

function MiniTag({ emoji, text }: { emoji: string; text: string }) {
    return <div style={{ background: 'var(--surface2)', borderRadius: 100, padding: '4px 10px', fontSize: 12, fontWeight: 700, color: 'var(--text2)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>{emoji} {text}</div>;
}

function moodEmoji(mood: string): string {
    const m: Record<string, string> = { great: '😄', good: '😊', okay: '😐', bad: '😔', terrible: '😢' };
    return m[mood] || '😊';
}

// ═══ DAY SCORE (REAL DATA) ═══
function DayScoreReal({ tasks, log, goals, events }: { tasks: Task[]; log: DailyLog | null; goals: Goal[]; events: AppEvent[] }) {
    const doneTasks = tasks.filter(t => t.done);
    const taskScore = tasks.length > 0 ? (doneTasks.length / tasks.length) * 100 : 0;
    const sleepScore = log?.sleep_hours ? Math.min((log.sleep_hours / 8) * 100, 100) : 0;
    const stepsScore = log?.steps ? Math.min((log.steps / 10000) * 100, 100) : 0;
    const screenScore = log?.screen_time_min ? Math.max(100 - (log.screen_time_min / 300) * 100, 0) : 50;
    const waterScore = log?.water_glasses ? Math.min((log.water_glasses / 8) * 100, 100) : 0;

    const overall = Math.round((taskScore + sleepScore + stepsScore + screenScore + waterScore) / 5);
    const offset = 264 - (264 * overall / 100);
    const grade = overall >= 80 ? '🔥 Amazing' : overall >= 60 ? '😊 Good' : overall >= 40 ? '😐 Okay' : '💪 Keep going';

    return (
        <div className="score-section">
            <div className="score-card">
                <div className="score-top">
                    <div className="score-ring-wrap">
                        <svg viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--surface2)" strokeWidth="9" />
                            <circle cx="50" cy="50" r="42" fill="none" stroke="url(#scoreGrad)" strokeWidth="9"
                                strokeDasharray="264" strokeDashoffset={offset} strokeLinecap="round" />
                            <defs><linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#3dbf85" /><stop offset="100%" stopColor="#4da6e8" /></linearGradient></defs>
                        </svg>
                        <div className="score-num-wrap">
                            <div className="score-big">{overall}</div>
                            <div className="score-slash">/100</div>
                        </div>
                    </div>
                    <div className="score-right">
                        <div className="score-grade">{grade}</div>
                        <div className="score-label">{doneTasks.length}/{tasks.length} tasks · {goals.length} goals · {events.length} events</div>
                    </div>
                </div>
                <div className="score-bars">
                    <ScoreBar icon="✅" label="Tasks" width={`${taskScore}%`} color="#3dbf85" val={`${doneTasks.length}/${tasks.length}`} />
                    <ScoreBar icon="😴" label="Sleep" width={`${sleepScore}%`} color="#8b6fd4" val={log?.sleep_hours ? `${log.sleep_hours}h` : '—'} />
                    <ScoreBar icon="👟" label="Steps" width={`${stepsScore}%`} color="#e8a020" val={log?.steps ? `${(log.steps / 1000).toFixed(1)}k` : '—'} />
                    <ScoreBar icon="📱" label="Screen" width={`${screenScore}%`} color="#e85080" val={log?.screen_time_min ? `${Math.floor(log.screen_time_min / 60)}h${log.screen_time_min % 60}m` : '—'} />
                    <ScoreBar icon="💧" label="Water" width={`${waterScore}%`} color="#4da6e8" val={log?.water_glasses ? `${log.water_glasses}/8` : '—'} />
                </div>
            </div>
        </div>
    );
}

function ScoreBar({ icon, label, width, color, val }: { icon: string; label: string; width: string; color: string; val: string }) {
    return (
        <div className="score-bar-row">
            <div className="score-bar-icon">{icon}</div>
            <div className="score-bar-label">{label}</div>
            <div className="score-bar-outer"><div className="score-bar-fill" style={{ width, background: color }} /></div>
            <div className="score-bar-val">{val}</div>
        </div>
    );
}

// ═══ MODALS ═══
const modalOverlay: React.CSSProperties = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100, padding: 0,
};
const modalCard: React.CSSProperties = {
    background: 'var(--card)', borderRadius: '24px 24px 0 0', padding: '24px 24px 36px',
    width: '100%', maxWidth: 500, maxHeight: '85vh', overflowY: 'auto',
    border: '1px solid var(--border)', borderBottom: 'none',
};
const modalTitle: React.CSSProperties = { fontSize: 18, fontWeight: 900, color: 'var(--text)', marginBottom: 20 };
const fieldLabel: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: 'var(--text3)', marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' as const };
const fieldInput: React.CSSProperties = {
    width: '100%', padding: '12px 14px', background: 'var(--surface2)', border: '1.5px solid var(--border)',
    borderRadius: 14, fontSize: 14, fontWeight: 600, fontFamily: 'Nunito, sans-serif', color: 'var(--text)', outline: 'none',
};

function EventFormModal({ onClose, onAdd }: { onClose: () => void; onAdd: (e: AppEvent) => void }) {
    const [name, setName] = useState('');
    const [emoji, setEmoji] = useState('📌');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [location, setLocation] = useState('');
    const [saving, setSaving] = useState(false);

    const emojis = ['📌', '🎉', '🎓', '🏋️', '🍽', '👥', '🎵', '✈️', '🏥', '💼'];

    const handleSave = async () => {
        if (!name.trim()) return;
        setSaving(true);
        const ev = await addEvent({ name, emoji, start_time: startTime || null, end_time: endTime || null, location: location || null });
        if (ev) onAdd(ev);
        setSaving(false);
    };

    return (
        <div style={modalOverlay} onClick={onClose}>
            <div style={modalCard} onClick={(e) => e.stopPropagation()}>
                <div style={modalTitle}>Add Event</div>

                <div style={{ marginBottom: 14 }}>
                    <div style={fieldLabel}>Emoji</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {emojis.map((e) => (
                            <div key={e} onClick={() => setEmoji(e)} className={`chip ${emoji === e ? 'selected' : ''}`} style={{ fontSize: 18, padding: '6px 10px' }}>{e}</div>
                        ))}
                    </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                    <div style={fieldLabel}>Event Name</div>
                    <input style={fieldInput} placeholder="e.g. Team meeting" value={name} onChange={(e) => setName(e.target.value)} />
                </div>

                <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                    <div style={{ flex: 1 }}>
                        <div style={fieldLabel}>Start Time</div>
                        <input style={fieldInput} placeholder="e.g. 3:00 PM" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={fieldLabel}>End Time</div>
                        <input style={fieldInput} placeholder="e.g. 5:00 PM" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                    </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                    <div style={fieldLabel}>Location</div>
                    <input style={fieldInput} placeholder="e.g. Room 301" value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
                    <button className="btn-primary" style={{ flex: 2 }} onClick={handleSave} disabled={saving || !name.trim()}>
                        {saving ? '...' : 'Add Event'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function DailyLogModal({ currentLog, onClose, onSave }: { currentLog: DailyLog | null; onClose: () => void; onSave: (l: DailyLog) => void }) {
    const [sleep, setSleep] = useState(currentLog?.sleep_hours?.toString() || '');
    const [steps, setSteps] = useState(currentLog?.steps?.toString() || '');
    const [screen, setScreen] = useState(currentLog?.screen_time_min?.toString() || '');
    const [water, setWater] = useState(currentLog?.water_glasses?.toString() || '');
    const [mood, setMood] = useState(currentLog?.mood || '');
    const [energy, setEnergy] = useState(currentLog?.energy || '');
    const [notes, setNotes] = useState(currentLog?.notes || '');
    const [saving, setSaving] = useState(false);

    const moods = ['great', 'good', 'okay', 'bad', 'terrible'];
    const energies = ['high', 'medium', 'low'];

    const handleSave = async () => {
        setSaving(true);
        const l = await saveDailyLog({
            sleep_hours: sleep ? parseFloat(sleep) : null,
            steps: steps ? parseInt(steps) : null,
            screen_time_min: screen ? parseInt(screen) : null,
            water_glasses: water ? parseInt(water) : null,
            mood: mood || null,
            energy: energy || null,
            notes: notes || null,
        });
        if (l) onSave(l);
        setSaving(false);
    };

    return (
        <div style={modalOverlay} onClick={onClose}>
            <div style={modalCard} onClick={(e) => e.stopPropagation()}>
                <div style={modalTitle}>📊 Log Today</div>

                <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                    <div style={{ flex: 1 }}>
                        <div style={fieldLabel}>😴 Sleep (hours)</div>
                        <input style={fieldInput} type="number" step="0.5" placeholder="7" value={sleep} onChange={(e) => setSleep(e.target.value)} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={fieldLabel}>👟 Steps</div>
                        <input style={fieldInput} type="number" placeholder="5000" value={steps} onChange={(e) => setSteps(e.target.value)} />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                    <div style={{ flex: 1 }}>
                        <div style={fieldLabel}>📱 Screen (min)</div>
                        <input style={fieldInput} type="number" placeholder="120" value={screen} onChange={(e) => setScreen(e.target.value)} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={fieldLabel}>💧 Water (glasses)</div>
                        <input style={fieldInput} type="number" placeholder="8" value={water} onChange={(e) => setWater(e.target.value)} />
                    </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                    <div style={fieldLabel}>Mood</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                        {moods.map((m) => (
                            <div key={m} onClick={() => setMood(m)} className={`chip ${mood === m ? 'selected' : ''}`}>
                                {moodEmoji(m)} {m}
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                    <div style={fieldLabel}>Energy</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                        {energies.map((e) => (
                            <div key={e} onClick={() => setEnergy(e)} className={`chip ${energy === e ? 'selected' : ''}`}>
                                ⚡ {e}
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                    <div style={fieldLabel}>Notes</div>
                    <input style={fieldInput} placeholder="How was your day so far?" value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
                    <button className="btn-primary" style={{ flex: 2 }} onClick={handleSave} disabled={saving}>
                        {saving ? '...' : 'Save Log'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function GoalFormModal({ onClose, onAdd }: { onClose: () => void; onAdd: (g: Goal) => void }) {
    const [name, setName] = useState('');
    const [target, setTarget] = useState('');
    const [category, setCategory] = useState('');
    const [saving, setSaving] = useState(false);

    const categories = ['health', 'academic', 'social', 'career', 'personal'];

    const handleSave = async () => {
        if (!name.trim()) return;
        setSaving(true);
        const g = await addGoal(name, category || undefined, target || undefined);
        if (g) onAdd(g);
        setSaving(false);
    };

    return (
        <div style={modalOverlay} onClick={onClose}>
            <div style={modalCard} onClick={(e) => e.stopPropagation()}>
                <div style={modalTitle}>🎯 Add Goal</div>

                <div style={{ marginBottom: 14 }}>
                    <div style={fieldLabel}>Goal</div>
                    <input style={fieldInput} placeholder="e.g. Exercise 4x per week" value={name} onChange={(e) => setName(e.target.value)} />
                </div>

                <div style={{ marginBottom: 14 }}>
                    <div style={fieldLabel}>Target (optional)</div>
                    <input style={fieldInput} placeholder="e.g. 4 sessions/week" value={target} onChange={(e) => setTarget(e.target.value)} />
                </div>

                <div style={{ marginBottom: 20 }}>
                    <div style={fieldLabel}>Category</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {categories.map((c) => (
                            <div key={c} onClick={() => setCategory(c)} className={`chip ${category === c ? 'selected' : ''}`}>{c}</div>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
                    <button className="btn-primary" style={{ flex: 2 }} onClick={handleSave} disabled={saving || !name.trim()}>
                        {saving ? '...' : 'Add Goal'}
                    </button>
                </div>
            </div>
        </div>
    );
}
