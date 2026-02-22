import { useState, useRef } from 'react';
import HomeTab from './components/HomeTab';
import ChatTab from './components/ChatTab';
import LocationTab from './components/LocationTab';
import TasksTab from './components/TasksTab';
import RecapTab from './components/RecapTab';
import BottomNav from './components/BottomNav';
import PushNotification from './components/PushNotification';

export default function MainApp({ userName, onLogout }: { userName: string; onLogout: () => void }) {
    const [activeTab, setActiveTab] = useState('home');
    const [isDark, setIsDark] = useState(false);
    const screenRef = useRef<HTMLDivElement>(null);

    const toggleTheme = () => {
        const next = !isDark;
        setIsDark(next);
        document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    };

    const switchTab = (tab: string) => {
        setActiveTab(tab);
        if (screenRef.current) screenRef.current.scrollTop = 0;
    };

    return (
        <div className="app-shell">
            <div className="screen" ref={screenRef}>
                {activeTab === 'home' && (
                    <HomeTab
                        onSwitchTab={switchTab}
                        onToggleTheme={toggleTheme}
                        isDark={isDark}
                        userName={userName}
                        onLogout={onLogout}
                    />
                )}
                {activeTab === 'chat' && (
                    <ChatTab onToggleTheme={toggleTheme} isDark={isDark} />
                )}
                {activeTab === 'location' && <LocationTab />}
                {activeTab === 'tasks' && <TasksTab />}
                {activeTab === 'recap' && <RecapTab />}
            </div>

            <PushNotification onTap={() => switchTab('chat')} />
            <BottomNav activeTab={activeTab} onSwitch={switchTab} />
        </div>
    );
}
