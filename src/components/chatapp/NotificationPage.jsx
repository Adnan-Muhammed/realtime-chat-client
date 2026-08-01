import React, { useState, useEffect } from 'react';
import { UserPlus, Check, MessageCircle, Heart, User } from 'lucide-react';
import BottomBar from './ChatAppBottomBar';
import api from '../../api';
import { useNotification } from '../../context/NotificationContext';

const NotificationsPage = ({ navigateTo, onOpenChat }) => {
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotification();

  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-b from-[#7FE2E3] via-[#9DCBF7] to-[#C69CF7] pb-24">

      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-8 pb-6">
        <h1 className="text-xl font-bold text-[#475270]">Notifications</h1>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="text-xs font-semibold text-[#475270]/80 active:scale-95 transition-transform bg-white/40 px-3 py-1.5 rounded-full">
            Mark all read
          </button>
        )}
      </div>

      {/* Notification list */}
      <div className="px-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden divide-y divide-slate-100">
          {notifications.map((n) => {
            const isRequest = n.type === 'request';
            const isAccepted = n.type === 'accepted';
            const isMessage = n.type === 'message';
            const isClickable = isRequest || isAccepted || isMessage;
            
            return (
            <div 
              key={n._id || n.id} 
              onClick={() => { 
                if (!n.isRead) markAsRead(n._id || n.id);
                if (isRequest) navigateTo('people'); 
                else if (isAccepted && n.senderId) onOpenChat({ id: n.senderId, name: n.name });
                else if (isMessage && n.sender) onOpenChat({ id: n.sender, name: n.name });
              }}
              className={`w-full flex items-start gap-4 px-4 py-4 relative transition-colors ${
                !n.isRead ? 'bg-blue-50' : 'bg-transparent'
              } ${isClickable ? 'cursor-pointer hover:bg-slate-50' : ''}`}
            >

              {!n.isRead && (
                <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#7FE2E3]" />
              )}

              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#9DCBF7] to-[#C69CF7] flex items-center justify-center border-2 border-white shadow-sm">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white shadow-sm flex items-center justify-center">
                  {n.type === 'request' && <UserPlus className="w-3 h-3 text-[#7B8AB0]" />}
                  {n.type === 'accepted' && <Check className="w-3 h-3 text-emerald-500" />}
                  {n.type === 'like' && <Heart className="w-3 h-3 text-rose-400" />}
                  {n.type === 'message' && <MessageCircle className="w-3 h-3 text-[#9DCBF7]" />}
                </div>
              </div>

              <div className="flex-1 min-w-0 pt-0.5">
                <p className={`text-[14px] leading-snug ${n.isRead ? 'text-slate-600' : 'text-slate-800'}`}>
                  <span className="font-bold">{n.name}</span> {n.detail}
                </p>
                <span className="text-[11px] font-medium text-slate-400 mt-1 block">{n.time}</span>
              </div>
            </div>
            );
          })}
        </div>
      </div>

      <BottomBar activeTab="notifications" onNavigate={navigateTo} />
    </div>
  );
};

export default NotificationsPage;