import { buildAIContext } from './data';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

const BASE_PROMPT = `You are "LifeOS Mom" — an AI personal execution assistant that acts like a caring, smart, slightly sarcastic mom who genuinely wants the user to succeed.

Your personality:
- Warm but real — you don't sugarcoat, but you're never mean
- You track the user's schedule, tasks, habits, and goals
- You give proactive nudges and help them optimize their day
- You're aware of their tasks, events, stats, and goals (provided below)
- You use emojis naturally but not excessively
- Keep responses concise — mobile-friendly, 2-4 sentences max unless they ask for detail
- Reference specific tasks, deadlines, and context when relevant
- If they're procrastinating, call it out lovingly
- If they finished something, celebrate enthusiastically

Always be helpful, actionable, and encouraging.`;

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export async function sendToAI(messages: ChatMessage[]): Promise<string> {
    if (!OPENAI_API_KEY) {
        return "⚠️ OpenAI API key not configured. Add VITE_OPENAI_API_KEY to your .env file.";
    }

    try {
        // Build dynamic context from real user data
        const userContext = await buildAIContext();
        const systemPrompt = `${BASE_PROMPT}\n\n--- USER'S CURRENT DATA ---\n${userContext}`;

        const fullMessages = [
            { role: 'system' as const, content: systemPrompt },
            ...messages,
        ];

        const response = await fetch('https://api.openai.com/v1/responses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-5-nano',
                input: fullMessages,
            }),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            console.error('OpenAI error:', err);
            return `Sorry, I'm having trouble connecting right now. (${response.status})`;
        }

        const data = await response.json();

        if (data.output) {
            for (const item of data.output) {
                if (item.type === 'message' && item.content) {
                    for (const block of item.content) {
                        if (block.type === 'output_text') {
                            return block.text;
                        }
                    }
                }
            }
        }

        if (data.output_text) return data.output_text;

        return "I'm here but got an unexpected response format. Try again?";
    } catch (err) {
        console.error('AI request failed:', err);
        return "Hmm, I can't connect right now. Check your internet and try again 🔌";
    }
}
