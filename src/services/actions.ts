import { supabase } from '../supabaseClient';

export interface AIAction {
    type: 'add_task' | 'add_event' | 'add_goal' | 'log_stats' | 'complete_task';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: Record<string, any>;
}

async function getUserId(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id || null;
}

// Parse AI response for action blocks: ```action ... ```
export function parseActions(text: string): { cleanText: string; actions: AIAction[] } {
    const actions: AIAction[] = [];
    const cleanText = text.replace(/```action\s*([\s\S]*?)```/g, (_, block) => {
        try {
            const parsed = JSON.parse(block.trim());
            if (Array.isArray(parsed)) {
                actions.push(...parsed);
            } else {
                actions.push(parsed);
            }
        } catch {
            console.log('Failed to parse action:', block);
        }
        return '';
    }).trim();

    return { cleanText, actions };
}

// Execute actions against Supabase
export async function executeActions(actions: AIAction[]): Promise<string[]> {
    const uid = await getUserId();
    if (!uid) return ['Not logged in'];

    const results: string[] = [];

    for (const action of actions) {
        try {
            switch (action.type) {
                case 'add_task': {
                    const { error } = await supabase.from('tasks').insert({
                        user_id: uid,
                        name: action.data.name,
                        due_label: action.data.due_label || null,
                        source: action.data.source || 'AI',
                        priority: action.data.priority || 'today',
                    });
                    if (!error) results.push(`✅ Added task: "${action.data.name}"`);
                    else results.push(`❌ Failed to add task: ${error.message}`);
                    break;
                }

                case 'add_event': {
                    const { error } = await supabase.from('events').insert({
                        user_id: uid,
                        name: action.data.name,
                        emoji: action.data.emoji || '📌',
                        event_date: action.data.event_date || new Date().toISOString().split('T')[0],
                        start_time: action.data.start_time || null,
                        end_time: action.data.end_time || null,
                        location: action.data.location || null,
                        notes: action.data.notes || null,
                        is_unexpected: action.data.is_unexpected || false,
                    });
                    if (!error) results.push(`📅 Added event: "${action.data.name}"`);
                    else results.push(`❌ Failed to add event: ${error.message}`);
                    break;
                }

                case 'add_goal': {
                    const { error } = await supabase.from('goals').insert({
                        user_id: uid,
                        name: action.data.name,
                        category: action.data.category || null,
                        target: action.data.target || null,
                    });
                    if (!error) results.push(`🎯 Added goal: "${action.data.name}"`);
                    else results.push(`❌ Failed to add goal: ${error.message}`);
                    break;
                }

                case 'log_stats': {
                    const today = new Date().toISOString().split('T')[0];
                    const { error } = await supabase.from('daily_logs').upsert({
                        user_id: uid,
                        log_date: today,
                        sleep_hours: action.data.sleep_hours ?? null,
                        steps: action.data.steps ?? null,
                        screen_time_min: action.data.screen_time_min ?? null,
                        water_glasses: action.data.water_glasses ?? null,
                        mood: action.data.mood ?? null,
                        energy: action.data.energy ?? null,
                        notes: action.data.notes ?? null,
                    }, { onConflict: 'user_id,log_date' });
                    if (!error) results.push(`📊 Logged daily stats`);
                    else results.push(`❌ Failed to log stats: ${error.message}`);
                    break;
                }

                case 'complete_task': {
                    const { error } = await supabase.from('tasks')
                        .update({ done: true, updated_at: new Date().toISOString() })
                        .eq('user_id', uid)
                        .ilike('name', `%${action.data.name}%`);
                    if (!error) results.push(`✓ Marked "${action.data.name}" as done`);
                    else results.push(`❌ Failed: ${error.message}`);
                    break;
                }
            }
        } catch (err) {
            console.log(err);
            results.push(`❌ Error`);
        }
    }

    return results;
}
