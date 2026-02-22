import { useLocationLogs } from '../services/locationService';

export default function LocationTab({ userId }: { userId: string }) {
    const { logs, loading, permissionDenied } = useLocationLogs(userId);

    const currentPlace = logs.length > 0 ? logs[logs.length - 1] : null;

    // Helper to format time
    const formatTime = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    };

    // Helper for icon based on type
    const getIconInfo = (type: string | null) => {
        switch (type) {
            case 'home': return { icon: '🛏', bg: 'var(--surface2)', color: 'var(--text3)' };
            case 'transit': return { icon: '🚌', bg: 'var(--sky)', color: 'var(--sky-text)' };
            case 'shop': return { icon: '🛍', bg: 'var(--rose)', color: 'var(--rose-text)' };
            case 'amenity': return { icon: '🌯', bg: 'var(--mint)', color: 'var(--mint-text)' };
            default: return { icon: '📍', bg: 'var(--lavender)', color: 'var(--lavender-text)' };
        }
    };

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

                {/* Simulated Pins */}
                <div className="my-location" style={{ position: 'absolute', top: '42%', left: '50%', transform: 'translate(-50%,-50%)' }}>
                    <div className="loc-ring" /><div className="loc-pulse" />
                </div>

                {/* Controls */}
                <div className="map-controls">
                    <button className="map-btn">＋</button>
                    <button className="map-btn">－</button>
                    <button className="map-btn">🎯</button>
                </div>

                {/* Status */}
                <div className="map-status">
                    <div className="map-status-icon">{getIconInfo(currentPlace?.place_type ?? null).icon}</div>
                    <div className="map-status-text">
                        <div className="map-status-title">{currentPlace?.place_name || 'Detecting location...'}</div>
                        <div className="map-status-sub">{permissionDenied ? 'Waiting for permission' : 'Live tracking active'}</div>
                    </div>
                    <div className="map-status-time">Now</div>
                </div>
            </div>

            {/* Permission Denied Warning */}
            {permissionDenied && (
                <div style={{ padding: '0 24px', marginTop: 16 }}>
                    <div style={{ background: 'rgba(255, 107, 107, 0.1)', border: '1px solid var(--peach)', padding: 16, borderRadius: 16 }}>
                        <div style={{ fontWeight: 600, color: 'var(--peach-text)', marginBottom: 4 }}>📍 Enable Location</div>
                        <div style={{ fontSize: 13, color: 'var(--text2)' }}>Your browser is blocking location access. Please click the icon in your address bar and "Allow" to see your journey.</div>
                    </div>
                </div>
            )}

            {/* Journey Log */}
            <div className="log-section">
                <div className="log-title">Today's Journey</div>

                {loading && !logs.length && (
                    <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text3)', fontSize: 14 }}>
                        Loading journey...
                    </div>
                )}

                {!loading && !logs.length && !permissionDenied && (
                    <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text3)', fontSize: 14 }}>
                        No logs yet today. Move around to start logging!
                    </div>
                )}

                {logs.map((log, index) => {
                    const info = getIconInfo(log.place_type);
                    const isLast = index === logs.length - 1;
                    return (
                        <JourneyItem
                            key={log.id}
                            icon={info.icon}
                            iconBg={info.bg}
                            place={log.place_name || `Point ${index + 1}`}
                            addr={`${log.latitude.toFixed(4)}, ${log.longitude.toFixed(4)}`}
                            time={formatTime(log.logged_at)}
                            dur={isLast ? 'Now' : 'Logged'}
                            durBg={info.bg}
                            durColor={info.color}
                            isCurrent={isLast}
                        />
                    );
                })}

                {/* Placeholder predicted event at the end */}
                {!loading && logs.length > 0 && (
                    <JourneyItem icon="🎉" iconBg="var(--rose)" predicted place="🎉 Jake's Party" addr="Predicted based on calendar"
                        time="~7:00 PM" dur="Tonight" durBg="var(--rose)" durColor="var(--rose-text)"
                        placeColor="var(--rose-dark)" borderColor="var(--rose-dark)" isLast />
                )}
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
