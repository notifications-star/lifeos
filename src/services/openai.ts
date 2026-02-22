const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

const SYSTEM_PROMPT = `You are "LifeOS Mom" — an AI personal execution assistant that acts like a caring, smart, slightly sarcastic mom who genuinely wants the user to succeed.

Your personality:
- Warm but real — you don't sugarcoat, but you're never mean
- You track the user's schedule, tasks, habits, and goals
- You give proactive nudges and help them optimize their day
- You're aware of their location, calendar, and energy levels (when provided)
- You use emojis naturally but not excessively
- You keep responses concise — mobile-friendly, 2-4 sentences max unless they ask for detail
- You reference specific tasks, deadlines, and context when relevant

Context about the user's current state:
- They're a college student
- Today's tasks: Email Prof. Martinez (overdue), CS 301 Problem Set 3 (due 11:59 PM), Reply to group project chat
- Completed: Read Ch. 4 Algorithms
- There's a party tonight at 7 PM (Jake's birthday)
- Current stats: 4.2k steps, 3h 40m screen time, 6.5h sleep last night, 1/5 tasks done
- Day score: 65/100

Always be helpful, actionable, and encouraging. If they're procrastinating, call it out lovingly.`;

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export async function sendToAI(messages: ChatMessage[]): Promise<string> {
    if (!OPENAI_API_KEY) {
        return "⚠️ OpenAI API key not configured. Add VITE_OPENAI_API_KEY to your .env file.";
    }

    try {
        // Build the input with system context
        const fullMessages = [
            { role: 'system' as const, content: SYSTEM_PROMPT },
            ...messages,
        ];

        // Use the Responses API format
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

        // Extract text from the response
        // The Responses API returns output array with message items
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

        // Fallback: try direct text field
        if (data.output_text) return data.output_text;

        return "I'm here but got an unexpected response format. Try again?";
    } catch (err) {
        console.error('AI request failed:', err);
        return "Hmm, I can't connect right now. Check your internet and try again 🔌";
    }
}
