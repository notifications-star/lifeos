import { useState, useRef, useEffect } from 'react';

interface Message {
    id: string;
    type: 'ai' | 'user' | 'notif';
    text: string;
    time: string;
    quickReplies?: { label: string; replyId: string }[];
}

function generateReply(text: string): string {
    const t = text.toLowerCase();
    if (t.includes('gym') || t.includes('workout'))
        return "I moved your gym session to tomorrow 8 AM since you've got the party tonight. Still want to keep that? I can find another time slot 🏋️";
    if (t.includes('done') || t.includes('finished') || t.includes('submitted'))
        return "Amazing!! 🎉 If you submitted, I'll check Canvas in 5 min. Your day score is going up for sure — you're crushing it!";
    if (t.includes('tired') || t.includes('sleep'))
        return "I get it. Sleep is important too — I'll note that and factor it in. Tomorrow's 8 AM class still needs you though. Try to be home by midnight 🌙";
    if (t.includes('help') || t.includes('stuck'))
        return "Tell me what you're stuck on — I can pull up your Canvas notes, find your prof's office hours, or remind you of the question details from last session 📚";
    if (t.includes('battery') || t.includes('charge'))
        return "Yes!! Charge NOW before you leave 🔌 At 18%, you'll be dead by 9 PM without it. Maps, Uber, photos — all gone. Plug in! 🪫";
    return "Got it, I'm logging that and adjusting your schedule if needed. Is there anything else I should know about today? 📝";
}

const INITIAL_REPLIES: Record<string, { user: string; ai: string }> = {
    reply1: {
        user: "I'm leaving soon, plan to finish it when I get home around 10 PM. I still have time.",
        ai: "Got it! That tracks — 10 PM to midnight is 2 hours, which is about how long Problem Set 3 usually takes you. 📊\n\nA few things to set you up:\n• I'll remind you at 10:05 PM to open your laptop\n• Canvas is already open on your last session\n• Leave the party by 9:45 PM to have buffer time\n\nGo enjoy it — I'll handle the rest 🎉",
    },
    reply2: {
        user: "I actually finished it this afternoon before the party! Submitted at like 5:30 PM.",
        ai: "WAIT — you did?! 🎉🎉🎉 I don't see it in Canvas yet but it might be syncing.\n\nThat's huge — you knocked it out before the party like a pro. I'm updating your day score right now.\n\nDay Score: 65 → 88 🚀\n\nEnjoy the party! You earned it. 🥳",
    },
    reply3: {
        user: "Look, I know I was supposed to do it at 4-6 but my friend needed help moving and it took longer than expected. I'm going to leave by 10 and finish it tonight, I promise.",
        ai: "That makes total sense — helping a friend is important too! I'm logging that so I learn your patterns better. 📝\n\nHere's your plan:\n🚶 Leave at 10 PM sharp\n🚇 BART home = ~25 min\n💻 Start homework by 10:30 PM\n⏰ Deadline: 11:59 PM = 1h 29m to finish\n\nThat's tight but doable. Want me to set a \"leave now\" alarm at 9:58 PM? 🔔",
    },
};

export default function ChatTab({ onToggleTheme, isDark }: { onToggleTheme: () => void; isDark: boolean }) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'notif-1',
            type: 'notif',
            text: '',
            time: '9:18 PM',
        },
        {
            id: 'ai-1',
            type: 'ai',
            text: "Hey Alex 👀 I noticed you're at Jake's party right now — totally fun, you deserve it! But CS 301 is due at <strong>11:59 PM</strong> and it's already 9:18 PM.\n\nDid something come up, or are you planning to finish it later tonight?",
            time: '9:18 PM',
            quickReplies: [
                { label: "I'm leaving soon 👋", replyId: 'reply1' },
                { label: 'I already finished it!', replyId: 'reply2' },
                { label: 'Explain myself...', replyId: 'reply3' },
            ],
        },
    ]);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);
    const [usedReplies, setUsedReplies] = useState<Set<string>>(new Set());
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    };

    useEffect(scrollToBottom, [messages, typing]);

    const handleQuickReply = (replyId: string) => {
        if (usedReplies.has(replyId)) return;
        setUsedReplies((prev) => new Set(prev).add(replyId));

        const reply = INITIAL_REPLIES[replyId];
        if (!reply) return;

        setMessages((prev) => [...prev, { id: `user-${replyId}`, type: 'user', text: reply.user, time: '9:19 PM' }]);

        setTyping(true);
        setTimeout(() => {
            setTyping(false);
            setMessages((prev) => [...prev, { id: `ai-${replyId}`, type: 'ai', text: reply.ai, time: '9:20 PM' }]);
        }, 900);
    };

    const handleSend = () => {
        const text = input.trim();
        if (!text) return;
        setInput('');

        setMessages((prev) => [...prev, { id: `user-${Date.now()}`, type: 'user', text, time: 'just now' }]);

        setTyping(true);
        setTimeout(() => {
            setTyping(false);
            const reply = generateReply(text);
            setMessages((prev) => [...prev, { id: `ai-${Date.now()}`, type: 'ai', text: reply, time: 'just now' }]);
        }, 1200);
    };

    return (
        <div style={{ paddingBottom: 140 }}>
            {/* Header */}
            <div className="chat-header">
                <div className="chat-avatar">🤖</div>
                <div className="chat-info">
                    <div className="chat-name">LifeOS Mom</div>
                    <div className="chat-status">● Always watching · Always caring</div>
                </div>
                <div className="theme-toggle" onClick={onToggleTheme}>{isDark ? '☀️' : '🌙'}</div>
            </div>

            {/* Messages */}
            <div className="chat-messages">
                {messages.map((msg) => {
                    if (msg.type === 'notif') {
                        return (
                            <div key={msg.id} className="chat-notif-push">
                                <div className="cnp-label">📍 Location Alert · 9:18 PM</div>
                                <div className="cnp-title">You're at a party — CS 301 is due in 2h 41m.</div>
                                <div className="cnp-body">I can see you're at 2847 Valencia St (Jake's place). Your assignment is due at 11:59 PM. You planned to finish it at 4–6 PM but that window passed. What happened?</div>
                            </div>
                        );
                    }

                    return (
                        <div key={msg.id} className={`msg ${msg.type}`}>
                            <div className="msg-bubble" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>') }} />
                            <div className="msg-time">{msg.time}</div>
                            {msg.quickReplies && !usedReplies.has(msg.quickReplies[0]?.replyId) && (
                                <div className="msg-quick-replies">
                                    {msg.quickReplies.map((qr) => (
                                        <div key={qr.replyId} className="quick-reply" onClick={() => handleQuickReply(qr.replyId)}>
                                            {qr.label}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}

                {typing && (
                    <div className="msg ai">
                        <div className="msg-bubble" style={{ color: 'var(--text3)' }}>LifeOS is thinking...</div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="chat-input-bar">
                <input
                    className="chat-input"
                    placeholder="Talk to LifeOS Mom..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button className="chat-send" onClick={handleSend}>↑</button>
            </div>
        </div>
    );
}
