import { useState, useEffect } from 'react';
import { loadTasks, loadTodayLog, loadGoals, loadEvents, type Task, type DailyLog, type Goal, type AppEvent } from '../services/data';

export default function RecapTab() {
    const [period, setPeriod] = useState('Today');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [log, setLog] = useState<DailyLog | null>(null);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [events, setEvents] = useState<AppEvent[]>([]);

    useEffect(() => {
        loadTasks().then(setTasks);
        loadTodayLog().then(setLog);
        loadGoals().then(setGoals);
        loadEvents().then(setEvents);
    }, []);

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
        <div>
            <div style={{ padding: '20px 24px 4px' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)', letterSpacing: -0.3 }}>Your Recap</div>
            </div>

            <div style={{ display: 'flex', gap: 8, padding: '10px 24px 16px' }}>
                {['Today', 'Week', 'Month'].map((p) => (
                    <div key={p} className={`period-btn ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>{p}</div>
                ))}
            </div>

            {/* Score Card */}
            <div style={{ margin: '0 24px 14px', background: 'var(--card)', borderRadius: 24, padding: 22, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' as const, color: 'var(--text3)', marginBottom: 14 }}>Day Score</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 18 }}>
                    <div style={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
                        <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--surface2)" strokeWidth="9" />
                            <circle cx="50" cy="50" r="42" fill="none" stroke="url(#recapGrad)" strokeWidth="9"
                                strokeDasharray="264" strokeDashoffset={offset} strokeLinecap="round" />
                            <defs><linearGradient id="recapGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#3dbf85" /><stop offset="100%" stopColor="#4da6e8" /></linearGradient></defs>
                        </svg>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                            <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)', letterSpacing: -1, lineHeight: 1 }}>{overall}</div>
                            <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700 }}>/100</div>
                        </div>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.5, marginBottom: 4 }}>{grade}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 10, lineHeight: 1.4 }}>
                            {doneTasks.length}/{tasks.length} tasks done · {events.length} events · {goals.length} goals
                        </div>
                    </div>
                </div>

                {/* Progress bars */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                        { icon: '✅', label: 'Tasks', width: `${taskScore}%`, color: '#3dbf85', val: `${doneTasks.length}/${tasks.length}` },
                        { icon: '😴', label: 'Sleep', width: `${sleepScore}%`, color: '#8b6fd4', val: log?.sleep_hours ? `${log.sleep_hours}h` : '—' },
                        { icon: '👟', label: 'Steps', width: `${stepsScore}%`, color: '#e8a020', val: log?.steps ? `${(log.steps / 1000).toFixed(1)}k` : '—' },
                        { icon: '📱', label: 'Screen', width: `${screenScore}%`, color: '#e85080', val: log?.screen_time_min ? `${Math.floor(log.screen_time_min / 60)}h${log.screen_time_min % 60}m` : '—' },
                        { icon: '💧', label: 'Water', width: `${waterScore}%`, color: '#4da6e8', val: log?.water_glasses ? `${log.water_glasses}/8` : '—' },
                    ].map((b) => (
                        <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 14, width: 20, textAlign: 'center' }}>{b.icon}</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', width: 60 }}>{b.label}</span>
                            <div style={{ flex: 1, height: 8, background: 'var(--surface2)', borderRadius: 4, overflow: 'hidden' }}>
                                <div style={{ width: b.width, height: '100%', background: b.color, borderRadius: 4, transition: 'width 1s ease' }} />
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text)', width: 38, textAlign: 'right' }}>{b.val}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Goals Progress */}
            {goals.length > 0 && (
                <div style={{ margin: '0 24px 14px', background: 'var(--card)', borderRadius: 24, padding: 20, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' as const, color: 'var(--text3)', marginBottom: 14 }}>Active Goals</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {goals.map((g) => (
                            <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface2)', borderRadius: 14, padding: '10px 14px' }}>
                                <div style={{ fontSize: 18 }}>🎯</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>{g.name}</div>
                                    {g.target && <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600 }}>Target: {g.target}</div>}
                                </div>
                                {g.category && <span className="tag tag-canvas">{g.category}</span>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Events Summary */}
            {events.length > 0 && (
                <div style={{ margin: '0 24px 14px', background: 'var(--card)', borderRadius: 24, padding: 20, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' as const, color: 'var(--text3)', marginBottom: 14 }}>Today's Events</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {events.map((ev) => (
                            <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface2)', borderRadius: 12, padding: '10px 12px' }}>
                                <div style={{ fontSize: 20 }}>{ev.emoji}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>{ev.name}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                                        {ev.start_time}{ev.end_time && ` – ${ev.end_time}`}{ev.location && ` · ${ev.location}`}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Daily notes */}
            {log?.notes && (
                <div style={{ margin: '0 24px 14px', background: 'linear-gradient(135deg,#2d2820,#1e1a28)', borderRadius: 20, padding: 20 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase' as const, color: 'var(--mint-dark)', marginBottom: 8 }}>Today's Note</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', lineHeight: 1.5 }}>"{log.notes}"</div>
                    {log.mood && <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Mood: {log.mood} · Energy: {log.energy || '—'}</div>}
                </div>
            )}

            <div className="bottom-space" />
        </div>
    );
}
