/* eslint-disable */
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

interface Task {
    id: string;
    name: string;
    done: boolean;
    due_label: string | null;
    source: string | null;
    priority: string;
    tags: string[];
}

export default function TasksTab() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [newTask, setNewTask] = useState('');
    const [adding, setAdding] = useState(false);

    async function loadTasks() {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) { setLoading(false); return; }

            const { data } = await supabase
                .from('tasks')
                .select('*')
                .eq('user_id', session.user.id)
                .order('done', { ascending: true })
                .order('sort_order', { ascending: true });

            if (data) setTasks(data);
        } catch (err) {
            console.log('Failed to load tasks:', err);
        }
        setLoading(false);
    }

    useEffect(() => { loadTasks(); }, []);

    async function toggleTask(id: string, currentDone: boolean) {
        setTasks((prev) => prev.map((t) => t.id === id ? { ...t, done: !currentDone } : t));
        await supabase.from('tasks').update({ done: !currentDone, updated_at: new Date().toISOString() }).eq('id', id);
    }

    async function addTask() {
        const name = newTask.trim();
        if (!name) return;
        setAdding(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;

            const { data, error } = await supabase.from('tasks').insert({
                user_id: session.user.id,
                name,
                priority: 'today',
                tags: [],
                source: 'Manual',
            }).select().single();

            if (data && !error) {
                setTasks((prev) => [...prev, data]);
                setNewTask('');
            }
        } catch (err) {
            console.log('Failed to add task:', err);
        }
        setAdding(false);
    }

    async function deleteTask(id: string) {
        setTasks((prev) => prev.filter((t) => t.id !== id));
        await supabase.from('tasks').delete().eq('id', id);
    }

    const activeTasks = tasks.filter((t) => !t.done);
    const doneTasks = tasks.filter((t) => t.done);

    return (
        <div>
            <div style={{ padding: '20px 24px 16px' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)', letterSpacing: -0.3 }}>Your Tasks</div>
                <div style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 600, marginTop: 4 }}>
                    {activeTasks.length} active · {doneTasks.length} done
                </div>
            </div>

            {/* Add task */}
            <div style={{ padding: '0 24px 16px', display: 'flex', gap: 8 }}>
                <input
                    className="chat-input"
                    style={{ borderRadius: 14 }}
                    placeholder="+ Add a task..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTask()}
                    disabled={adding}
                />
                <button className="chat-send" onClick={addTask} disabled={adding || !newTask.trim()}>+</button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>Loading tasks...</div>
            ) : tasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>No tasks yet</div>
                    <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>Add your first task above!</div>
                </div>
            ) : (
                <>
                    {/* Active tasks */}
                    {activeTasks.length > 0 && (
                        <>
                            <div style={{ padding: '8px 24px 8px', fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase' as const, color: 'var(--butter-text)' }}>
                                🟠 Active
                            </div>
                            {activeTasks.map((task) => (
                                <div key={task.id} className="task" style={{ position: 'relative' }}>
                                    <div className="task-check" onClick={() => toggleTask(task.id, task.done)} />
                                    <div className="task-info" onClick={() => toggleTask(task.id, task.done)}>
                                        <div className="task-name">{task.name}</div>
                                        <div className="task-tags">
                                            {task.source && <span className="tag tag-canvas">{task.source}</span>}
                                            {task.tags?.map((tag) => <span key={tag} className="tag tag-notion">{tag}</span>)}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        {task.due_label && <div className="task-due" style={{ color: 'var(--peach-text)' }}>{task.due_label}</div>}
                                        <div onClick={() => deleteTask(task.id)}
                                            style={{ fontSize: 14, color: 'var(--text3)', cursor: 'pointer', padding: '4px 4px' }}>✕</div>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}

                    {/* Done tasks */}
                    {doneTasks.length > 0 && (
                        <>
                            <div style={{ padding: '8px 24px 8px', fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase' as const, color: 'var(--mint-text)' }}>
                                ✅ Done
                            </div>
                            {doneTasks.map((task) => (
                                <div key={task.id} className="task">
                                    <div className="task-check done" onClick={() => toggleTask(task.id, task.done)} />
                                    <div className="task-info" onClick={() => toggleTask(task.id, task.done)}>
                                        <div className="task-name done">{task.name}</div>
                                        <div className="task-tags">
                                            <span className="tag tag-done">Done ✓</span>
                                        </div>
                                    </div>
                                    <div onClick={() => deleteTask(task.id)}
                                        style={{ fontSize: 14, color: 'var(--text3)', cursor: 'pointer', padding: '4px 4px' }}>✕</div>
                                </div>
                            ))}
                        </>
                    )}
                </>
            )}

            <div className="bottom-space" />
        </div>
    );
}
