import { supabase } from '../supabaseClient';
import { useState, useEffect } from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface LocationLog {
    id: string;
    user_id: string;
    logged_at: string;
    latitude: number;
    longitude: number;
    accuracy: number | null;
    place_name: string | null;
    place_type: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Haversine distance in metres between two lat/lon points */
function distanceMetres(
    lat1: number, lon1: number,
    lat2: number, lon2: number
): number {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Geocoding Providers ───────────────────────────────────────────────────────

export interface PlaceDetails {
    name: string;
    type: string;
}

export interface GeocodingProvider {
    /** Reverse-geocode coordinates into a human-readable place name and type */
    reverseGeocode(lat: number, lon: number): Promise<PlaceDetails>;
}

/** 
 * OpenStreetMap Nominatim implementation (Free, no API key required)
 */
export class NominatimGeocodingProvider implements GeocodingProvider {
    async reverseGeocode(lat: number, lon: number): Promise<PlaceDetails> {
        try {
            const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
            const res = await fetch(url, {
                headers: { 'Accept-Language': 'en', 'User-Agent': 'LifeOS-App/1.0' },
            });
            if (!res.ok) throw new Error('Nominatim error');
            const data = await res.json();

            const addr = data.address || {};
            // Build a short human-readable label
            const name =
                addr.amenity ||
                addr.shop ||
                addr.building ||
                addr.office ||
                addr.tourism ||
                addr.leisure ||
                addr.road ||
                data.display_name?.split(',')[0] ||
                'Unknown place';

            // Classify into broad place types
            const type = addr.amenity
                ? 'amenity'
                : addr.shop
                    ? 'shop'
                    : addr.building === 'residential' || addr.house_number
                        ? 'home'
                        : addr.road
                            ? 'transit'
                            : 'unknown';

            return { name, type };
        } catch {
            return { name: 'Unknown place', type: 'unknown' };
        }
    }
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * 🚀 FUTURE PROOFING: SWAPPING MAP PROVIDERS
 * ─────────────────────────────────────────────────────────────────────────────
 * 
 * To switch to a paid API like Apple MapKit or Google Places:
 * 
 * 1. Create a class that implements `GeocodingProvider`.
 * 2. In `reverseGeocode`, call the specific SDK.
 * 3. Return `{ name, type }` matching the PlaceDetails interface.
 * 4. Scroll to the bottom and change `new NominatimGeocodingProvider()` 
 *    to your new class.
 * 
 * Example:
 * 
 * export class GooglePlacesGeocodingProvider implements GeocodingProvider {
 *     private apiKey = 'YOUR_GOOGLE_KEY';
 *     
 *     async reverseGeocode(lat: number, lon: number): Promise<PlaceDetails> {
 *         const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/...`);
 *         // Parse Google's response into PlaceDetails
 *         return { name: "Starbucks", type: "shop" };
 *     }
 * }
 */
// export class MapKitGeocodingProvider implements GeocodingProvider { ... }
// export class GooglePlacesGeocodingProvider implements GeocodingProvider { ... }

// ─── Core Service ─────────────────────────────────────────────────────────────

const MIN_DISTANCE_M = 50;   // log new point if moved ≥50m
const MIN_INTERVAL_MS = 5 * 60 * 1000; // or if ≥5min passed

class LocationService {
    private watchId: number | null = null;
    private lastLogged: { lat: number; lon: number; time: number } | null = null;
    private userId: string | null = null;
    private listeners: Array<(log: LocationLog) => void> = [];
    private geocoder: GeocodingProvider;

    constructor(geocoder: GeocodingProvider) {
        this.geocoder = geocoder;
    }

    /** Start watching. Call once after login. */
    start(userId: string) {
        this.userId = userId;
        if (!('geolocation' in navigator)) return;
        if (this.watchId !== null) return; // already running

        this.watchId = navigator.geolocation.watchPosition(
            (pos) => this.handlePosition(pos),
            (err) => console.warn('[LocationService] GPS error:', err.message),
            { enableHighAccuracy: true, maximumAge: 30_000, timeout: 15_000 }
        );
    }

    stop() {
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
        this.userId = null;
        this.lastLogged = null;
    }

    onNewLog(cb: (log: LocationLog) => void) {
        this.listeners.push(cb);
        return () => { this.listeners = this.listeners.filter((l) => l !== cb); };
    }

    private async handlePosition(pos: GeolocationPosition) {
        const { latitude, longitude, accuracy } = pos.coords;
        const now = Date.now();

        // Deduplicate: skip if too close AND too soon
        if (this.lastLogged) {
            const d = distanceMetres(this.lastLogged.lat, this.lastLogged.lon, latitude, longitude);
            const dt = now - this.lastLogged.time;
            if (d < MIN_DISTANCE_M && dt < MIN_INTERVAL_MS) return;
        }

        this.lastLogged = { lat: latitude, lon: longitude, time: now };

        // Optimistically insert with coords; geocode in the background
        const { data: inserted, error } = await supabase
            .from('location_logs')
            .insert({
                user_id: this.userId,
                latitude,
                longitude,
                accuracy: accuracy ?? null,
                place_name: null,
                place_type: null,
            })
            .select()
            .single();

        if (error) {
            console.error('[LocationService] Insert error:', error.message);
            return;
        }

        // Emit the raw log immediately so UI updates fast
        if (inserted) this.listeners.forEach((l) => l(inserted as LocationLog));

        // Then reverse-geocode and update the row
        const { name, type } = await this.geocoder.reverseGeocode(latitude, longitude);
        const { data: updated } = await supabase
            .from('location_logs')
            .update({ place_name: name, place_type: type })
            .eq('id', inserted.id)
            .select()
            .single();

        if (updated) this.listeners.forEach((l) => l(updated as LocationLog));
    }
}

/** 
 * Singleton instance. 
 * To switch providers in the future, just swap NominatimGeocodingProvider 
 * with MapKitGeocodingProvider or GooglePlacesGeocodingProvider here.
 */
export const locationService = new LocationService(new NominatimGeocodingProvider());

// ─── React Hooks ─────────────────────────────────────────────────────────────

/** Starts the location watcher for the given user and keeps it alive */
export function useLocationLogger(userId: string) {
    useEffect(() => {
        locationService.start(userId);
        return () => locationService.stop();
    }, [userId]);
}

/** Fetches today's location logs from Supabase and subscribes to new ones */
export function useLocationLogs(userId: string) {
    const [logs, setLogs] = useState<LocationLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [permissionDenied, setPermissionDenied] = useState(false);

    // Check permission state
    useEffect(() => {
        if (!('permissions' in navigator)) return;
        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
            setPermissionDenied(result.state === 'denied');
            result.onchange = () => setPermissionDenied(result.state === 'denied');
        });
    }, []);

    // Load today's logs from Supabase
    useEffect(() => {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        supabase
            .from('location_logs')
            .select('*')
            .eq('user_id', userId)
            .gte('logged_at', todayStart.toISOString())
            .order('logged_at', { ascending: true })
            .then(({ data, error }) => {
                if (!error && data) setLogs(data as LocationLog[]);
                setLoading(false);
            });
    }, [userId]);

    // Subscribe to live updates from the service
    useEffect(() => {
        const unsub = locationService.onNewLog((log) => {
            if (log.user_id !== userId) return;
            setLogs((prev) => {
                // Update existing row or append new one
                const idx = prev.findIndex((l) => l.id === log.id);
                if (idx >= 0) {
                    const next = [...prev];
                    next[idx] = log;
                    return next;
                }
                return [...prev, log];
            });
        });
        return unsub;
    }, [userId]);

    return { logs, loading, permissionDenied };
}
