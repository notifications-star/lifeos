import { useState } from 'react';

interface Task {
    id: string;
    name: string;
    tags: { label: string; className: string }[];
    due: string;
    dueColor?: string;
    done: boolean;
}

const INITIAL_TASKS: { section: string; sectionColor: string; sectionPrefix: string; tasks: Task[] }[] = [
    {
        section: 'Overdue',
        sectionColor: 'var(--peach-text)',
        sectionPrefix: '🔴',
        tasks: [
            { id: 't1', name: 'Email Prof. Martinez re: office hours', tags: [{ label: 'Notion', className: 'tag-notion' }, { label: '2 days overdue', className: 'tag-urgent' }], due: 'Bus 3PM', dueColor: 'var(--peach-text)', done: false },
        ],
    },
    {
        section: 'Due Today',
        sectionColor: 'var(--butter-text)',
        sectionPrefix: '🟠',
        tasks: [
            { id: 't2', name: 'CS 301 — Problem Set 3', tags: [{ label: 'Canvas', className: 'tag-canvas' }, { label: '4–6 PM', className: 'tag-urgent' }], due: '11:59 PM', dueColor: 'var(--peach-text)', done: false },
            { id: 't3', name: 'Reply to group project chat', tags: [{ label: 'Notion', className: 'tag-notion' }], due: 'Today', done: false },
        ],
    },
    {
        section: 'Upcoming',
        sectionColor: 'var(--sky-text)',
        sectionPrefix: '📅',
        tasks: [
            { id: 't4', name: 'ECON 201 — Keynesian paper', tags: [{ label: 'Canvas', className: 'tag-canvas' }], due: 'Thu', done: false },
            { id: 't5', name: '🏋️ Gym (moved from today)', tags: [{ label: 'Rescheduled', className: 'tag-event' }], due: 'Tomorrow 8AM', done: false },
        ],
    },
    {
        section: 'Done',
        sectionColor: 'var(--mint-text)',
        sectionPrefix: '✅',
        tasks: [
            { id: 't6', name: 'Read Ch. 4 Algorithms', tags: [{ label: 'Canvas', className: 'tag-canvas' }, { label: 'Done ✓', className: 'tag-done' }], due: '9 AM ✓', done: true },
        ],
    },
];

export default function TasksTab() {
    const [sections, setSections] = useState(INITIAL_TASKS);

    const toggleTask = (taskId: string) => {
        setSections((prev) =>
            prev.map((sec) => ({
                ...sec,
                tasks: sec.tasks.map((t) => {
                    if (t.id !== taskId) return t;
                    const done = !t.done;
                    return {
                        ...t,
                        done,
                        tags: done
                            ? t.tags.map((tag) => tag.className === 'tag-urgent' ? { label: 'Done ✓', className: 'tag-done' } : tag)
                            : t.tags,
                    };
                }),
            }))
        );
    };

    return (
        <div>
            <div style={{ padding: '20px 24px 16px' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)', letterSpacing: -0.3 }}>Your Tasks</div>
                <div style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 600, marginTop: 4 }}>2 urgent · Schedule adjusted for party 🎉</div>
            </div>

            {sections.map((sec) => (
                <div key={sec.section}>
                    <div style={{ padding: '8px 24px 8px', fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase' as const, color: sec.sectionColor }}>
                        {sec.sectionPrefix} {sec.section}
                    </div>
                    {sec.tasks.map((task) => (
                        <div key={task.id} className="task" onClick={() => toggleTask(task.id)}>
                            <div className={`task-check ${task.done ? 'done' : ''}`} />
                            <div className="task-info">
                                <div className={`task-name ${task.done ? 'done' : ''}`}>{task.name}</div>
                                <div className="task-tags">
                                    {task.tags.map((tag) => (
                                        <span key={tag.label} className={`tag ${tag.className}`}>{tag.label}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="task-due" style={task.dueColor ? { color: task.dueColor } : undefined}>{task.due}</div>
                        </div>
                    ))}
                </div>
            ))}

            <div className="bottom-space" />
        </div>
    );
}
