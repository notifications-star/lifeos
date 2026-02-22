import { useLocationLogs } from '../services/locationService';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';

// Create a custom icon to replace the default Leaflet marker (which often has broken image paths in Vite)
const customIcon = new L.DivIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="width: 24px; height: 24px; background: var(--lavender); border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

export default function LocationTab({ userId }: { userId: string }) {
    const { logs, loading, permissionDenied } = useLocationLogs(userId);

    const currentPlace = logs.length > 0 ? logs[logs.length - 1] : null;

    // Default center to a fun location (e.g. San Francisco) if no logs yet
    const centerLat = currentPlace?.latitude ?? 37.7749;
    const centerLon = currentPlace?.longitude ?? -122.4194;

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
            <div className="map-view" style={{ position: 'relative', height: '40vh', zIndex: 0 }}>
                {/* Switch this out for MapKitMapComponent or GoogleMapComponent in the future */}
                <LeafletMapComponent
                    centerLat={centerLat}
                    centerLon={centerLon}
                    currentPlace={currentPlace}
                    logs={logs}
                />

                {/* Controls (kept generic outside the map provider) */}
                <div className="map-controls" style={{ zIndex: 1000, position: 'absolute', right: 16, bottom: 80 }}>
                    <button className="map-btn" onClick={() => {
                        const mapElem = document.querySelector('.leaflet-container');
                        if (mapElem && (mapElem as any)._leaflet_map) {
                            (mapElem as any)._leaflet_map.zoomIn();
                        }
                    }}>＋</button>
                    <button className="map-btn" onClick={() => {
                        const mapElem = document.querySelector('.leaflet-container');
                        if (mapElem && (mapElem as any)._leaflet_map) {
                            (mapElem as any)._leaflet_map.zoomOut();
                        }
                    }}>－</button>
                    <button className="map-btn">🎯</button>
                </div>

                {/* Status */}
                <div className="map-status" style={{ zIndex: 1000, position: 'absolute', bottom: 16, left: 16, right: 16 }}>
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
            {/* ... rest of UI ... */}
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

// ─── Map Implementations ───────────────────────────────────────────────────────

/**
 * Encapsulated Leaflet Map Component
 */
function LeafletMapComponent({ centerLat, centerLon, currentPlace, logs }: any) {
    return (
        <MapContainer
            key={`${centerLat}-${centerLon}`}
            center={[centerLat, centerLon]}
            zoom={15}
            zoomControl={false}
            style={{ height: '100%', width: '100%', borderRadius: '0 0 32px 32px' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                className="map-tiles"
            />

            {logs.length > 1 && (
                <Polyline
                    positions={logs.map((l: any) => [l.latitude, l.longitude])}
                    color="var(--sky)"
                    weight={4}
                    opacity={0.6}
                    dashArray="8 8"
                />
            )}

            {currentPlace && (
                <Marker position={[currentPlace.latitude, currentPlace.longitude]} icon={customIcon}>
                    <Popup>
                        <strong>{currentPlace.place_name || 'Current Location'}</strong>
                    </Popup>
                </Marker>
            )}
        </MapContainer>
    );
}

/**
 * 🚀 FUTURE PROOFING: SWAPPING MAP UI PROVIDERS
 * 
 * To switch to a paid map like Apple MapKit JS or Google Maps SDK:
 * 
 * 1. Create a `<MapKitMapComponent>` matching the props above (`centerLat`, `centerLon`, `logs`, etc).
 * 2. Inside that component, use `MapKit.Map` or `google.maps.Map` to render the view.
 * 3. Go to `LocationTab` above and replace `<LeafletMapComponent />` 
 *    with your `<MapKitMapComponent />`.
 */
// function MapKitMapComponent({ centerLat, centerLon, currentPlace, logs }: any) { ... }
// function GoogleMapComponent({ centerLat, centerLon, currentPlace, logs }: any) { ... }

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
