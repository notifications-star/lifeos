import { useState, useEffect } from 'react';

export default function PushNotification({ onTap }: { onTap: () => void }) {
    const [show, setShow] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const showTimer = setTimeout(() => setShow(true), 2500);
        const hideTimer = setTimeout(() => { setShow(false); setDismissed(true); }, 7500);
        return () => { clearTimeout(showTimer); clearTimeout(hideTimer); };
    }, []);

    if (dismissed) return null;

    return (
        <div className="push-notif-overlay">
            <div className={`push-notif ${show ? 'show' : ''}`} onClick={() => { setShow(false); setDismissed(true); onTap(); }}>
                <div className="push-icon" style={{ background: 'var(--peach)' }}>🤔</div>
                <div className="push-content">
                    <div className="push-app">Momentum · Smart Nudge</div>
                    <div className="push-title">Hey — CS 301 is due at 11:59 PM</div>
                    <div className="push-body">You're at a party right now. Do you still plan on finishing it tonight?</div>
                    <div className="push-tap">Tap to explain →</div>
                </div>
                <div className="push-time">Now</div>
            </div>
        </div>
    );
}
