
import React from 'react';
import { Search, MessageCircle, Bell, User } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const BottomBar = ({ activeTab, onNavigate }) => {
  const { unreadCount } = useNotification();
  const tabs = [
    { id: 'people', icon: Search, label: 'Search' },
    { id: 'friends', icon: MessageCircle, label: 'Friends' },
    { id: 'notifications', icon: Bell, label: 'Alerts', count: unreadCount },
    { id: 'profile', icon: User, label: 'Profile' }
  ];

  return (
    // Floating dock layout: positioned above the bottom edge with rounded-full styling
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[340px] bg-white/95 backdrop-blur-xl border border-white/80 shadow-[0_15px_40px_rgba(0,0,0,0.12)] rounded-full z-50">

      <div className="flex justify-between items-center px-4 py-2.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className="relative flex flex-col items-center justify-center w-12 h-12 rounded-full active:scale-95 transition-all duration-300"
              aria-label={tab.label}
            >
              {/* Active state background pill */}
              <div
                className={`absolute inset-0 rounded-full transition-all duration-300 ${isActive ? 'bg-gradient-to-br from-[#7FE2E3]/25 to-[#9DCBF7]/25 scale-100' : 'scale-0 opacity-0'
                  }`}
              />

              {/* Icon styling: Darker and slightly larger when active */}
              <div className="relative">
                <Icon
                  className={`relative z-10 transition-all duration-300 ${isActive
                      ? 'w-[22px] h-[22px] text-[#475270] fill-[#475270]/20'
                      : 'w-5 h-5 text-slate-400 hover:text-slate-500'
                    }`}
                />
                {/* Notification Badge */}
                {tab.count > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white z-20">
                    {tab.count > 99 ? '99+' : tab.count}
                  </span>
                )}
              </div>

              {/* Small dot indicator for active tab */}
              <div
                className={`absolute bottom-1.5 w-1 h-1 rounded-full bg-[#475270] transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                  }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomBar;
