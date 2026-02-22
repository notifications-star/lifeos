const TABS = [
    { id: 'home', icon: '⚡', label: 'Now' },
    { id: 'chat', icon: '💬', label: 'Mom', badge: 1 },
    { id: 'location', icon: '📍', label: 'Location' },
    { id: 'tasks', icon: '📋', label: 'Tasks', badge: 4 },
    { id: 'recap', icon: '📊', label: 'Recap' },
];

export default function BottomNav({ activeTab, onSwitch }: {
    activeTab: string;
    onSwitch: (tab: string) => void;
}) {
    return (
        <div className="bottom-nav">
            {TABS.map((tab) => (
                <div
                    key={tab.id}
                    className={`nav-item-m ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => onSwitch(tab.id)}
                >
                    <div className="nav-icon-wrap">
                        <div className="nav-icon-m">{tab.icon}</div>
                        {tab.badge && <div className="nav-badge-m">{tab.badge}</div>}
                    </div>
                    <div className="nav-label-m">{tab.label}</div>
                </div>
            ))}
        </div>
    );
}
