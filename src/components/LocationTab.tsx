export default function LocationTab() {
    return (
        <div>
            {/* Map */}
            <div className="map-view">
                <div className="road" style={{ width: 2, height: '100%', top: 0, left: '35%' }} />
                <div className="road" style={{ width: 2, height: '100%', top: 0, left: '65%', opacity: 0.5 }} />
                <div className="road" style={{ width: '100%', height: 2, top: '35%', left: 0 }} />
                <div className="road" style={{ width: '100%', height: 3, top: '55%', left: 0, opacity: 0.9 }} />
                <div className="road" style={{ width: 3, height: '100%', top: 0, left: '50%', opacity: 0.9 }} />

                <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} viewBox="0 0 390 300" preserveAspectRatio="none">
                    <path d="M 80 260 Q 120 220 140 170 Q 155 145 185 135" stroke="#3dbf85" strokeWidth="3" fill="none" strokeDasharray="6,4" opacity="0.6" />
                    <path d="M 185 135 Q 220 110 255 85" stroke="#8b6fd4" strokeWidth="2.5" fill="none" strokeDasharray="4,6" opacity="0.5" />
                </svg>

                {/* Pins */}
                <div className="map-pin" style={{ left: '21%', top: '72%' }}>
                    <div className="pin-bubble past"><div className="pin-dot" style={{ background: '#a09888' }} />🛏 Home</div>
                    <div className="pin-tail" style={{ background: '#a09888' }} /><div className="pin-base" style={{ background: '#a09888' }} />
                </div>
                <div className="map-pin" style={{ left: '47%', top: '38%' }}>
                    <div className="pin-bubble past"><div className="pin-dot" style={{ background: '#4da6e8' }} />🎓 SFSU</div>
                    <div className="pin-tail" style={{ background: '#4da6e8' }} /><div className="pin-base" style={{ background: '#4da6e8' }} />
                </div>
                <div className="my-location" style={{ position: 'absolute', top: '42%', left: '50%', transform: 'translate(-50%,-50%)' }}>
                    <div className="loc-ring" /><div className="loc-pulse" />
                </div>
                <div className="map-pin" style={{ left: '48%', top: '15%' }}>
                    <div className="pin-bubble active"><div className="pin-dot" style={{ background: '#3dbf85' }} />🌯 Chipotle</div>
                    <div className="pin-tail" style={{ background: '#3dbf85' }} /><div className="pin-base" style={{ background: '#3dbf85' }} />
                </div>
                <div className="map-pin" style={{ left: '74%', top: '5%' }}>
                    <div className="pin-bubble" style={{ borderColor: 'var(--lavender-dark)', opacity: 0.7 }}><div className="pin-dot" style={{ background: '#8b6fd4' }} />🎉 Party</div>
                    <div className="pin-tail" style={{ background: '#8b6fd4', opacity: 0.5 }} /><div className="pin-base" style={{ background: '#8b6fd4', opacity: 0.5 }} />
                </div>

                {/* Controls */}
                <div className="map-controls">
                    <button className="map-btn">＋</button>
                    <button className="map-btn">－</button>
                    <button className="map-btn">🎯</button>
                </div>

                {/* Status */}
                <div className="map-status">
                    <div className="map-status-icon">🌯</div>
                    <div className="map-status-text">
                        <div className="map-status-title">Chipotle — Mission St</div>
                        <div className="map-status-sub">Eating lunch · HR 72 bpm · ~28 min left</div>
                    </div>
                    <div className="map-status-time">Now</div>
                </div>
            </div>

            {/* Journey Log */}
            <div className="log-section">
                <div className="log-title">Today's Journey</div>

                <JourneyItem icon="🛏" iconBg="var(--surface2)" place="Home" addr="2847 Sunset Blvd, SF"
                    time="7:00 – 8:45 AM" dur="1h 45m" durBg="var(--surface2)" durColor="var(--text3)"
                    activities={[{ label: '😴 Woke up', bg: 'var(--mint)', color: 'var(--mint-text)' }, { label: '☕ Morning', bg: 'var(--butter)', color: 'var(--butter-text)' }]} />

                <JourneyItem icon="🚌" iconBg="var(--sky)" place="Transit · MUNI Bus" addr="Sunset → SFSU"
                    time="8:45 – 9:00 AM" dur="15m" durBg="var(--sky)" durColor="var(--sky-text)"
                    activities={[{ label: '🎵 Listening', bg: 'var(--lavender)', color: 'var(--lavender-text)' }]} />

                <JourneyItem icon="🎓" iconBg="var(--sky)" place="SFSU — Lecture Hall C" addr="1600 Holloway Ave, SF"
                    time="9:00 – 11:30 AM" dur="2h 30m" durBg="var(--sky)" durColor="var(--sky-text)"
                    activities={[{ label: '📖 Class', bg: 'var(--sky)', color: 'var(--sky-text)' }, { label: '✏️ Studying', bg: 'var(--mint)', color: 'var(--mint-text)' }]} />

                <JourneyItem icon="🚇" iconBg="var(--surface2)" place="Transit · BART" addr="Glen Park → 24th St Mission"
                    time="11:45 AM – 12:20 PM" dur="35m" durBg="var(--surface2)" durColor="var(--text3)"
                    activities={[{ label: '🎵 Music', bg: 'var(--lavender)', color: 'var(--lavender-text)' }, { label: '📵 IG 18m', bg: 'var(--peach)', color: 'var(--peach-text)' }]} />

                <JourneyItem icon="🌯" iconBg="var(--mint)" isCurrent place="Chipotle — Mission St ● Now" addr="2945 Mission St, SF"
                    time="12:30 PM – ongoing" dur="~25m" durBg="var(--mint)" durColor="var(--mint-text)"
                    activities={[{ label: '🍽 Eating', bg: 'var(--mint)', color: 'var(--mint-text)' }, { label: '🎵 AirPods', bg: 'var(--lavender)', color: 'var(--lavender-text)' }]}
                    placeColor="var(--mint-dark)" />

                <JourneyItem icon="📚" iconBg="var(--lavender)" predicted place="📍 Predicted: Library (Study)" addr="CS 301 homework block · 4–6 PM"
                    time="~4:00 PM" dur="2h" durBg="var(--lavender)" durColor="var(--lavender-text)"
                    placeColor="var(--lavender-dark)" />

                <JourneyItem icon="🎉" iconBg="var(--rose)" predicted place="🎉 Jake's Birthday Party" addr="2847 Valencia St · Unexpected event"
                    time="~7:00 PM" dur="Late night" durBg="var(--rose)" durColor="var(--rose-text)"
                    placeColor="var(--rose-dark)" borderColor="var(--rose-dark)" isLast />
            </div>

            <div className="bottom-space" />
        </div>
    );
}

function JourneyItem({ icon, iconBg, place, addr, time, dur, durBg, durColor, activities, isCurrent, predicted, placeColor, borderColor, isLast }: {
    icon: string; iconBg: string; place: string; addr: string;
    time: string; dur: string; durBg: string; durColor: string;
    activities?: { label: string; bg: string; color: string }[];
    isCurrent?: boolean; predicted?: boolean; placeColor?: string; borderColor?: string; isLast?: boolean;
}) {
    return (
        <div className="log-item" style={isLast ? { marginBottom: 0 } : undefined}>
            <div className="log-icon-col">
                <div className={`log-icon ${isCurrent ? 'current' : ''}`} style={{ background: iconBg, opacity: predicted ? 0.6 : 1 }}>{icon}</div>
            </div>
            <div className={`log-content ${isCurrent ? 'current' : ''} ${predicted ? 'predicted' : ''}`}
                style={borderColor ? { borderColor } : undefined}>
                <div className="log-place" style={placeColor ? { color: placeColor } : undefined}>{place}</div>
                <div className="log-addr">{addr}</div>
                <div className="log-time-row">
                    <div className="log-time">{time}</div>
                    <div className="log-duration" style={{ background: durBg, color: durColor }}>{dur}</div>
                </div>
                {activities && (
                    <div className="log-activity-row">
                        {activities.map((a) => (
                            <div key={a.label} className="log-act" style={{ background: a.bg, color: a.color }}>{a.label}</div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
