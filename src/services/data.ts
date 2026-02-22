import { supabase } from '../supabaseClient';

// ═══ HELPERS ═══
async function getUserId(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id || null;
}

// ═══ EVENTS ═══
export interface AppEvent {
    id: string;
    name: string;
    emoji: string;
    event_date: string;
    start_time: string | null;
    end_time: string | null;
    location: string | null;
    notes: string | null;
    is_unexpected: boolean;
    done: boolean;
}

export async function loadEvents(): Promise<AppEvent[]> {
    const uid = await getUserId();
    if (!uid) return [];
    const { data } = await supabase.from('events').select('*').eq('user_id', uid)
        .eq('event_date', new Date().toISOString().split('T')[0])
        .order('created_at', { ascending: true });
    return data || [];
}

export async function addEvent(event: Partial<AppEvent>): Promise<AppEvent | null> {
    const uid = await getUserId();
    if (!uid) return null;
    const { data } = await supabase.from('events').insert({
        user_id: uid,
        name: event.name || 'New Event',
        emoji: event.emoji || '📌',
        event_date: event.event_date || new Date().toISOString().split('T')[0],
        start_time: event.start_time || null,
        end_time: event.end_time || null,
        location: event.location || null,
        notes: event.notes || null,
        is_unexpected: event.is_unexpected || false,
    }).select().single();
    return data;
}

export async function deleteEvent(id: string) {
    await supabase.from('events').delete().eq('id', id);
}

// ═══ DAILY LOGS ═══
export interface DailyLog {
    id?: string;
    log_date: string;
    sleep_hours: number | null;
    steps: number | null;
    screen_time_min: number | null;
    water_glasses: number | null;
    mood: string | null;
    energy: string | null;
    notes: string | null;
}

export async function loadTodayLog(): Promise<DailyLog | null> {
    const uid = await getUserId();
    if (!uid) return null;
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase.from('daily_logs').select('*')
        .eq('user_id', uid).eq('log_date', today).single();
    return data;
}

export async function saveDailyLog(log: Partial<DailyLog>): Promise<DailyLog | null> {
    const uid = await getUserId();
    if (!uid) return null;
    const today = new Date().toISOString().split('T')[0];

    // Upsert: insert or update for today
    const { data } = await supabase.from('daily_logs').upsert({
        user_id: uid,
        log_date: today,
        sleep_hours: log.sleep_hours,
        steps: log.steps,
        screen_time_min: log.screen_time_min,
        water_glasses: log.water_glasses,
        mood: log.mood,
        energy: log.energy,
        notes: log.notes,
    }, { onConflict: 'user_id,log_date' }).select().single();
    return data;
}

// ═══ GOALS ═══
export interface Goal {
    id: string;
    name: string;
    category: string | null;
    target: string | null;
    active: boolean;
}

export async function loadGoals(): Promise<Goal[]> {
    const uid = await getUserId();
    if (!uid) return [];
    const { data } = await supabase.from('goals').select('*')
        .eq('user_id', uid).eq('active', true).order('created_at');
    return data || [];
}

export async function addGoal(name: string, category?: string, target?: string): Promise<Goal | null> {
    const uid = await getUserId();
    if (!uid) return null;
    const { data } = await supabase.from('goals').insert({
        user_id: uid, name, category: category || null, target: target || null,
    }).select().single();
    return data;
}

export async function deleteGoal(id: string) {
    await supabase.from('goals').delete().eq('id', id);
}

// ═══ TASKS (for context) ═══
export interface Task {
    id: string;
    name: string;
    done: boolean;
    due_label: string | null;
    source: string | null;
    priority: string;
}

export async function loadTasks(): Promise<Task[]> {
    const uid = await getUserId();
    if (!uid) return [];
    const { data } = await supabase.from('tasks').select('*')
        .eq('user_id', uid).order('done').order('sort_order');
    return data || [];
}

// ═══ BUILD AI CONTEXT ═══
export async function buildAIContext(): Promise<string> {
    const [tasks, events, log, goals] = await Promise.all([
        loadTasks(), loadEvents(), loadTodayLog(), loadGoals(),
    ]);

    const parts: string[] = [];
    const now = new Date();
    parts.push(`Current time: ${now.toLocaleString('en-US', { weekday: 'long', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`);

    // Tasks
    const activeTasks = tasks.filter(t => !t.done);
    const doneTasks = tasks.filter(t => t.done);
    if (tasks.length > 0) {
        parts.push(`\nTasks (${doneTasks.length}/${tasks.length} done):`);
        activeTasks.forEach(t => parts.push(`  ☐ ${t.name}${t.due_label ? ` (due: ${t.due_label})` : ''}`));
        doneTasks.forEach(t => parts.push(`  ✓ ${t.name}`));
    } else {
        parts.push('\nNo tasks set for today.');
    }

    // Events
    if (events.length > 0) {
        parts.push(`\nToday's events:`);
        events.forEach(e => parts.push(`  ${e.emoji} ${e.name}${e.start_time ? ` at ${e.start_time}` : ''}${e.location ? ` — ${e.location}` : ''}${e.is_unexpected ? ' (unexpected!)' : ''}`));
    }

    // Daily stats
    if (log) {
        parts.push(`\nToday's stats:`);
        if (log.sleep_hours) parts.push(`  😴 Sleep: ${log.sleep_hours}h`);
        if (log.steps) parts.push(`  👟 Steps: ${log.steps.toLocaleString()}`);
        if (log.screen_time_min) parts.push(`  📱 Screen: ${Math.floor(log.screen_time_min / 60)}h ${log.screen_time_min % 60}m`);
        if (log.water_glasses) parts.push(`  💧 Water: ${log.water_glasses} glasses`);
        if (log.mood) parts.push(`  Mood: ${log.mood}`);
        if (log.energy) parts.push(`  Energy: ${log.energy}`);
        if (log.notes) parts.push(`  Notes: ${log.notes}`);
    } else {
        parts.push('\nNo daily stats logged yet today.');
    }

    // Goals
    if (goals.length > 0) {
        parts.push(`\nActive goals:`);
        goals.forEach(g => parts.push(`  🎯 ${g.name}${g.target ? ` — target: ${g.target}` : ''}`));
    }

    return parts.join('\n');
}
