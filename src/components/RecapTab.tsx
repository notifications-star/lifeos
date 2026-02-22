import { useState } from 'react';

export default function RecapTab() {
    const [period, setPeriod] = useState('Today');

    return (
        <div>
            <div style={{ padding: '20px 24px 4px' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)', letterSpacing: -0.3 }}>Your Recap</div>
            </div>

            {/* Period */}
            <div style={{ display: 'flex', gap: 8, padding: '10px 24px 16px' }}>
                {['Today', 'Week', 'Month'].map((p) => (
                    <div key={p} className={`period-btn ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>{p}</div>
                ))}
            </div>

            {/* Score Card */}
            <div style={{ margin: '0 24px 14px', background: 'var(--card)', borderRadius: 24, padding: 22, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' as const, color: 'var(--text3)', marginBottom: 14 }}>Day Score</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 18 }}>
                    {/* Ring */}
                    <div style={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
                        <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--surface2)" strokeWidth="9" />
                            <circle cx="50" cy="50" r="42" fill="none" stroke="url(#recapGrad)" strokeWidth="9"
                                strokeDasharray="264" strokeDashoffset="92" strokeLinecap="round" />
                            <defs>
                                <linearGradient id="recapGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#3dbf85" />
                                    <stop offset="100%" stopColor="#4da6e8" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                            <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)', letterSpacing: -1, lineHeight: 1 }}>65</div>
                            <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700 }}>/100</div>
                        </div>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.5, marginBottom: 4 }}>😊 Good</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 10, lineHeight: 1.4 }}>1 of 5 tasks done. Gym and homework still ahead tonight.</div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--butter)', color: 'var(--butter-text)', borderRadius: 100, padding: '5px 12px', fontSize: 11, fontWeight: 800 }}>🔥 3-day streak</div>
                    </div>
                </div>

                {/* Bars */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                        { icon: '✅', label: 'Tasks', width: '20%', color: '#3dbf85', val: '1/5' },
                        { icon: '🧠', label: 'Focus', width: '55%', color: '#4da6e8', val: '55%' },
                        { icon: '👟', label: 'Activity', width: '42%', color: '#e8a020', val: '4.2k' },
                        { icon: '😴', label: 'Sleep', width: '65%', color: '#8b6fd4', val: '6.5h' },
                        { icon: '📱', label: 'Screen', width: '74%', color: '#e85080', val: '3h42' },
                    ].map((b) => (
                        <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 14, width: 20, textAlign: 'center' }}>{b.icon}</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', width: 60 }}>{b.label}</span>
                            <div style={{ flex: 1, height: 8, background: 'var(--surface2)', borderRadius: 4, overflow: 'hidden' }}>
                                <div style={{ width: b.width, height: '100%', background: b.color, borderRadius: 4 }} />
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text)', width: 32, textAlign: 'right' }}>{b.val}</span>
                        </div>
                    ))}
                </div>

                {/* Achievements */}
                <div style={{ display: 'flex', gap: 8, marginTop: 16, overflowX: 'auto', paddingBottom: 2 }}>
                    {[
                        { icon: '🎓', label: 'On Time\nto Class', earned: true },
                        { icon: '🔥', label: '3-Day\nStreak', earned: true },
                        { icon: '🏋️', label: 'Gym\nToday', earned: false },
                        { icon: '📝', label: 'All Tasks\nDone', earned: false },
                        { icon: '🌙', label: '7h+\nSleep', earned: false },
                    ].map((a) => (
                        <div key={a.icon} style={{
                            flexShrink: 0, borderRadius: 14, padding: '10px 12px', textAlign: 'center', minWidth: 70,
                            background: a.earned ? 'var(--mint)' : 'var(--surface2)',
                            border: `1px solid ${a.earned ? 'var(--mint-dark)' : 'var(--border)'}`,
                            opacity: a.earned ? 1 : 0.5,
                        }}>
                            <div style={{ fontSize: 22, marginBottom: 4 }}>{a.icon}</div>
                            <div style={{ fontSize: 10, fontWeight: 800, color: a.earned ? 'var(--mint-text)' : 'var(--text3)', lineHeight: 1.3, whiteSpace: 'pre-line' }}>{a.label}</div>
                        </div>
                    ))}
                </div>

                {/* Win banner */}
                <div style={{ marginTop: 14, padding: '12px 14px', background: 'linear-gradient(135deg,var(--mint),var(--sky))', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ fontSize: 22 }}>🎉</div>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>You made every 9 AM class this month!</div>
                        <div style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 600 }}>That's 8 in a row. Keep it going tomorrow. 💪</div>
                    </div>
                </div>
            </div>

            {/* Screen Time */}
            <div style={{ margin: '0 24px 14px', background: 'var(--card)', borderRadius: 24, padding: 20, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' as const, color: 'var(--text3)', marginBottom: 14 }}>Screen Time · 3h 42m today</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                        { icon: '📸', name: 'Instagram', width: '72%', color: '#e85080', time: '1h 22m', bg: 'var(--peach)' },
                        { icon: '🌐', name: 'Chrome', width: '50%', color: '#4da6e8', time: '58m', bg: 'var(--sky)' },
                        { icon: '📝', name: 'Notion', width: '28%', color: '#e8a020', time: '32m', bg: 'var(--butter)' },
                        { icon: '📺', name: 'Netflix', width: '24%', color: '#e85080', time: '28m', bg: 'var(--rose)' },
                        { icon: '🎓', name: 'Canvas', width: '18%', color: '#3dbf85', time: '22m', bg: 'var(--mint)' },
                    ].map((app) => (
                        <div key={app.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 9, background: app.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{app.icon}</div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', flex: 1 }}>{app.name}</div>
                            <div style={{ flex: 2, height: 6, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{ width: app.width, height: '100%', background: app.color, borderRadius: 3 }} />
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text2)', width: 42, textAlign: 'right' }}>{app.time}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Monthly summary */}
            <div style={{ margin: '0 24px 14px', background: 'linear-gradient(135deg,#2d2820,#1e1a28)', borderRadius: 20, padding: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase' as const, color: 'var(--mint-dark)', marginBottom: 8 }}>February Summary</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginBottom: 12 }}>Your best month yet 🚀</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {[
                        { val: '21', label: 'Classes attended' },
                        { val: '34', label: 'Tasks completed' },
                        { val: '8', label: 'Gym sessions' },
                        { val: '6.8h', label: 'Avg. sleep', color: '#3dbf85' },
                    ].map((s) => (
                        <div key={s.label} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 12 }}>
                            <div style={{ fontSize: 22, fontWeight: 900, color: s.color || '#fff' }}>{s.val}</div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bottom-space" />
        </div>
    );
}
