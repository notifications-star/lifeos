import { useState, useRef, useEffect } from 'react';
import { sendToAI, type ChatMessage } from '../services/openai';
import { parseActions, executeActions } from '../services/actions';
import { supabase } from '../supabaseClient';

interface DisplayMessage {
    id: string;
    type: 'ai' | 'user';
    text: string;
    time: string;
}

export default function ChatTab({ onToggleTheme, isDark }: { onToggleTheme: () => void; isDark: boolean }) {
    const [messages, setMessages] = useState<DisplayMessage[]>([
        {
            id: 'ai-welcome',
            type: 'ai',
            text: "Hey! 👀 I'm your Momentum Mom — I track your schedule, tasks, and habits so you don't have to. Ask me anything about your day, or let me help you stay on track. What's up?",
            time: formatTime(),
        },
    ]);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);
    const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);
    const [listening, setListening] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    };

    useEffect(scrollToBottom, [messages, typing]);

    // Load chat history from Supabase on mount
    useEffect(() => {
        loadChatHistory();
    }, []);

    async function loadChatHistory() {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;

            const { data } = await supabase
                .from('chat_messages')
                .select('role, content, created_at')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: true })
                .limit(50);

            if (data && data.length > 0) {
                const history: ChatMessage[] = [];
                const display: DisplayMessage[] = [];

                for (const msg of data) {
                    history.push({ role: msg.role, content: msg.content });
                    display.push({
                        id: `db-${msg.created_at}`,
                        type: msg.role === 'user' ? 'user' : 'ai',
                        text: msg.content,
                        time: new Date(msg.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
                    });
                }

                setConversationHistory(history);
                setMessages(display);
            }
        } catch (err) {
            console.log('No chat history loaded:', err);
        }
    }

    async function saveToDB(role: 'user' | 'assistant', content: string) {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;

            await supabase.from('chat_messages').insert({
                user_id: session.user.id,
                role,
                content,
            });
        } catch (err) {
            console.log('Failed to save message:', err);
        }
    }

    const handleSend = async () => {
        const text = input.trim();
        if (!text || typing) return;
        setInput('');

        const userMsg: DisplayMessage = { id: `user-${Date.now()}`, type: 'user', text, time: formatTime() };
        setMessages((prev) => [...prev, userMsg]);

        const updatedHistory: ChatMessage[] = [...conversationHistory, { role: 'user', content: text }];
        setConversationHistory(updatedHistory);

        // Save user message to DB
        saveToDB('user', text);

        // Call AI
        setTyping(true);
        const aiResponse = await sendToAI(updatedHistory);
        setTyping(false);

        // Parse and execute actions
        const { cleanText, actions } = parseActions(aiResponse);
        let finalText = cleanText;

        if (actions.length > 0) {
            const results = await executeActions(actions);
            // Append action summaries to the AI's response text so the user sees what happened
            if (results.length > 0) {
                finalText += '\n\n' + results.join('\n');
            }
        }

        const aiMsg: DisplayMessage = { id: `ai-${Date.now()}`, type: 'ai', text: finalText, time: formatTime() };
        setMessages((prev) => [...prev, aiMsg]);

        setConversationHistory((prev) => [...prev, { role: 'assistant', content: aiResponse }]); // keep raw resp in history

        // Save AI response to DB
        saveToDB('assistant', finalText);
    };

    const startListening = () => {
        if (listening) return;
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Speech recognition is not supported in this browser.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setListening(true);

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput(prev => prev ? prev + ' ' + transcript : transcript);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setListening(false);
        };

        recognition.onend = () => setListening(false);

        recognition.start();
    };

    return (
        <div style={{ paddingBottom: 140 }}>
            {/* Header */}
            <div className="chat-header">
                <div className="chat-avatar">🤖</div>
                <div className="chat-info">
                    <div className="chat-name">Momentum Mom</div>
                    <div className="chat-status">● Powered by GPT-5 Nano</div>
                </div>
                <div className="theme-toggle" onClick={onToggleTheme}>{isDark ? '☀️' : '🌙'}</div>
            </div>

            {/* Messages */}
            <div className="chat-messages">
                {messages.map((msg) => (
                    <div key={msg.id} className={`msg ${msg.type}`}>
                        <div className="msg-bubble" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                        <div className="msg-time">{msg.time}</div>
                    </div>
                ))}

                {typing && (
                    <div className="msg ai">
                        <div className="msg-bubble" style={{ color: 'var(--text3)' }}>Momentum is thinking...</div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="chat-input-bar">
                <button
                    onClick={startListening}
                    disabled={typing}
                    style={{
                        background: listening ? 'var(--rose-dark)' : 'var(--surface2)',
                        color: listening ? '#fff' : 'var(--text)',
                        border: '1px solid var(--border)',
                        borderRadius: 14,
                        width: 42,
                        height: 42,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 18,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: listening ? '0 0 15px var(--rose-dark)' : 'none',
                    }}
                >
                    {listening ? '🔴' : '🎤'}
                </button>
                <input
                    className="chat-input"
                    placeholder="Talk to Momentum Mom..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    disabled={typing || listening}
                />
                <button className="chat-send" onClick={handleSend} disabled={typing || listening || !input.trim()}>↑</button>
            </div>
        </div>
    );
}

function formatTime(): string {
    return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}
