export default function HomeTab({ onSwitchTab, onToggleTheme, isDark, userName, onLogout }: {
    onSwitchTab: (tab: string) => void;
    onToggleTheme: () => void;
    isDark: boolean;
    userName: string;
    onLogout: () => void;
}) {
    const now = new Date();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
    const monthDay = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

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

            {/* Battery warning */}
            <div className="battery-banner">
                <div style={{ fontSize: 24 }}>🪫</div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--peach-text)' }}>Charge before you leave!</div>
                    <div style={{ fontSize: 11, color: 'var(--peach-text)', fontWeight: 600, opacity: 0.8, marginTop: 2 }}>18% battery — you're heading out at 7 PM. You'll run out by 9 PM.</div>
                </div>
                <div style={{ fontSize: 22 }}>🔌</div>
            </div>

            {/* Context pill */}
            <div className="context-pill">
                <div className="ctx-dot" />
                <div>
                    <div className="ctx-text">📍 Chipotle, Mission St</div>
                    <div className="ctx-sub">Eating lunch · HR 72 bpm · ~28 min left</div>
                </div>
            </div>

            {/* NOW card */}
            <div className="now-card">
                <div className="now-eyebrow">● AI says right now</div>
                <div className="now-title">You're eating.<br />Use this time wisely.</div>
                <div className="now-sub">Prof. Martinez email is overdue · CS 301 due at 11:59 PM · Party at 7 PM — schedule adjusted.</div>
                <button className="now-cta" onClick={() => onSwitchTab('chat')}>✏️ Draft Email Now</button>
            </div>

            {/* Stats */}
            <div className="stats-row">
                <div className="stat-chip"><div className="stat-icon">❤️</div><div className="stat-val" style={{ color: '#e85080' }}>72</div><div className="stat-label">BPM</div></div>
                <div className="stat-chip"><div className="stat-icon">👟</div><div className="stat-val" style={{ color: '#4da6e8' }}>4.2k</div><div className="stat-label">Steps</div></div>
                <div className="stat-chip"><div className="stat-icon">📱</div><div className="stat-val" style={{ color: '#8b6fd4' }}>3h 40m</div><div className="stat-label">Screen</div></div>
                <div className="stat-chip"><div className="stat-icon">✅</div><div className="stat-val" style={{ color: '#3dbf85' }}>1/5</div><div className="stat-label">Tasks</div></div>
                <div className="stat-chip"><div className="stat-icon">😴</div><div className="stat-val" style={{ color: '#e8a020' }}>6.5h</div><div className="stat-label">Sleep</div></div>
            </div>

            {/* Unexpected Events */}
            <div style={{ padding: '20px 24px 0' }}>
                <div className="event-header-row">
                    <div className="event-title">🎉 Unexpected Events</div>
                    <button className="event-add-btn">＋ Add Event</button>
                </div>
            </div>

            <div className="event-section">
                <div className="event-card">
                    <div className="event-top">
                        <div className="event-emoji">🎉</div>
                        <div className="event-info">
                            <div className="event-name">Jake's Birthday Party</div>
                            <div className="event-time">Today · 7:00 PM – Late · Mission District</div>
                        </div>
                        <div className="event-badge">Tonight</div>
                    </div>
                    <div className="event-ai-label">✦ AI rescheduled your day around this</div>
                    <div className="event-adjustments">
                        <div className="event-adj moved">
                            <div className="event-adj-icon">📚</div>
                            <div className="event-adj-text">CS 301 moved to 4–6 PM (before party) · 2h window</div>
                            <div className="event-adj-action">View →</div>
                        </div>
                        <div className="event-adj moved">
                            <div className="event-adj-icon">🏋️</div>
                            <div className="event-adj-text">Gym moved to tomorrow 8 AM instead of tonight 6 PM</div>
                            <div className="event-adj-action">Edit</div>
                        </div>
                        <div className="event-adj warning">
                            <div className="event-adj-icon">🪫</div>
                            <div className="event-adj-text">Charge phone now — you'll need it tonight. 18% won't last.</div>
                            <div className="event-adj-action">Got it</div>
                        </div>
                        <div className="event-adj info">
                            <div className="event-adj-icon">📧</div>
                            <div className="event-adj-text">Prof. Martinez email: do it on the bus at 3 PM (35 min ride)</div>
                            <div className="event-adj-action">Remind me</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Smart Nudges */}
            <div className="section-head">
                <div className="section-title">Smart Nudges</div>
                <div className="section-more">See all</div>
            </div>

            <div className="nudge" onClick={() => onSwitchTab('chat')}>
                <div className="nudge-icon-wrap" style={{ background: 'var(--sky)' }}>📚</div>
                <div className="nudge-body">
                    <div className="nudge-label" style={{ color: 'var(--sky-text)' }}>Canvas · Due Tonight</div>
                    <div className="nudge-text">CS 301 starts in 1h 30m — you set aside 4–6 PM. Head to the library after lunch.</div>
                    <div className="nudge-time">📌 Tap to chat about this</div>
                </div>
            </div>

            <div className="nudge">
                <div className="nudge-icon-wrap" style={{ background: 'var(--peach)' }}>🪫</div>
                <div className="nudge-body">
                    <div className="nudge-label" style={{ color: 'var(--peach-text)' }}>⚠️ Battery Critical</div>
                    <div className="nudge-text">18% — plug in before 7 PM or your phone dies mid-party. Maps, Uber, everything stops.</div>
                    <div className="nudge-time">⏰ Right now</div>
                </div>
            </div>

            <div className="nudge">
                <div className="nudge-icon-wrap" style={{ background: 'var(--lavender)' }}>📺</div>
                <div className="nudge-body">
                    <div className="nudge-label" style={{ color: 'var(--lavender-text)' }}>Heads Up</div>
                    <div className="nudge-text">8 AM class tomorrow. Get home before midnight — you'll need 7h sleep.</div>
                    <div className="nudge-time">🌙 Set reminder?</div>
                </div>
            </div>

            {/* Tasks preview */}
            <div className="section-head">
                <div className="section-title">Today's Tasks</div>
                <div className="section-more" onClick={() => onSwitchTab('tasks')}>See all</div>
            </div>

            <TaskPreview />

            {/* Day Score */}
            <div className="section-head">
                <div className="section-title">Day Score</div>
                <div className="section-more" onClick={() => onSwitchTab('recap')}>Full recap</div>
            </div>

            <DayScore />

            <div className="bottom-space" />
        </div>
    );
}

function TaskPreview() {
    return (
        <>
            <div className="task">
                <div className="task-check done" />
                <div className="task-info">
                    <div className="task-name done">Read Ch. 4 Algorithms</div>
                    <div className="task-tags"><span className="tag tag-canvas">Canvas</span><span className="tag tag-done">Done ✓</span></div>
                </div>
                <div className="task-due">9 AM ✓</div>
            </div>
            <div className="task">
                <div className="task-check" />
                <div className="task-info">
                    <div className="task-name">Email Prof. Martinez</div>
                    <div className="task-tags"><span className="tag tag-notion">Notion</span><span className="tag tag-urgent">Overdue</span></div>
                </div>
                <div className="task-due" style={{ color: 'var(--peach-text)' }}>Bus @ 3PM</div>
            </div>
            <div className="task">
                <div className="task-check" />
                <div className="task-info">
                    <div className="task-name">CS 301 — Problem Set 3</div>
                    <div className="task-tags"><span className="tag tag-canvas">Canvas</span><span className="tag tag-urgent">4–6 PM slot</span></div>
                </div>
                <div className="task-due" style={{ color: 'var(--peach-text)' }}>11:59 PM</div>
            </div>
        </>
    );
}

function DayScore() {
    return (
        <div className="score-section">
            <div className="score-card">
                <div className="score-top">
                    <div className="score-ring-wrap">
                        <svg viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--surface2)" strokeWidth="9" />
                            <circle cx="50" cy="50" r="42" fill="none" stroke="url(#scoreGrad)" strokeWidth="9"
                                strokeDasharray="264" strokeDashoffset="92" strokeLinecap="round" />
                            <defs>
                                <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#3dbf85" />
                                    <stop offset="100%" stopColor="#4da6e8" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="score-num-wrap">
                            <div className="score-big">65</div>
                            <div className="score-slash">/100</div>
                        </div>
                    </div>
                    <div className="score-right">
                        <div className="score-grade">😊 Good</div>
                        <div className="score-label">You've done 1 of 5 tasks. Gym and homework still ahead.</div>
                        <div className="score-streak">🔥 3-day streak</div>
                    </div>
                </div>

                <div className="score-bars">
                    {[
                        { icon: '✅', label: 'Tasks', width: '20%', color: '#3dbf85', val: '1/5' },
                        { icon: '🧠', label: 'Focus', width: '55%', color: '#4da6e8', val: '55%' },
                        { icon: '👟', label: 'Activity', width: '42%', color: '#e8a020', val: '4.2k' },
                        { icon: '😴', label: 'Sleep', width: '65%', color: '#8b6fd4', val: '6.5h' },
                        { icon: '📱', label: 'Screen', width: '74%', color: '#e85080', val: '3h 42m' },
                    ].map((b) => (
                        <div className="score-bar-row" key={b.label}>
                            <div className="score-bar-icon">{b.icon}</div>
                            <div className="score-bar-label">{b.label}</div>
                            <div className="score-bar-outer"><div className="score-bar-fill" style={{ width: b.width, background: b.color }} /></div>
                            <div className="score-bar-val">{b.val}</div>
                        </div>
                    ))}
                </div>

                <div className="achievements">
                    <div className="achievement earned"><div className="ach-icon">🎓</div><div className="ach-label">On Time<br />to Class</div></div>
                    <div className="achievement earned"><div className="ach-icon">🔥</div><div className="ach-label">3-Day<br />Streak</div></div>
                    <div className="achievement"><div className="ach-icon">🏋️</div><div className="ach-label">Gym<br />Today</div></div>
                    <div className="achievement"><div className="ach-icon">📝</div><div className="ach-label">All Tasks<br />Done</div></div>
                    <div className="achievement"><div className="ach-icon">🌙</div><div className="ach-label">7h+<br />Sleep</div></div>
                </div>

                <div className="win-banner">
                    <div style={{ fontSize: 22 }}>🎉</div>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>You made every 9 AM class this month!</div>
                        <div style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 600 }}>That's 8 in a row. Keep it going tomorrow. 💪</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
