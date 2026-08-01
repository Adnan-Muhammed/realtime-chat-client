import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Search, User, MessageCircle, UserPlus, Clock, Check } from 'lucide-react';
import BottomBar from './ChatAppBottomBar';
import { useNotification } from '../../context/NotificationContext';

const UserListPage = ({ navigateTo, onOpenChat }) => {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users/discover');
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const { socket } = useNotification();

  useEffect(() => {
    if (!socket) return;

    const handleConnectionUpdate = () => {
      fetchUsers();
    };

    socket.on("connection_update", handleConnectionUpdate);

    return () => {
      socket.off("connection_update", handleConnectionUpdate);
    };
  }, [socket]);

  const handleAction = async (targetUserId, action) => {
    try {
      const res = await api.post('/users/connection', { targetUserId, action });

      if (res.data.success) {
        // Optimistically update the UI by refetching users
        fetchUsers();
      }
    } catch (error) {
      console.error(`Action ${action} failed:`, error);
    }
  };

  const filteredUsers = users
    .filter((u) => u.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      // Sort users who have sent a request ('pending_received') to the top
      if (a.status === 'pending_received' && b.status !== 'pending_received') return -1;
      if (b.status === 'pending_received' && a.status !== 'pending_received') return 1;
      return 0; // keep original order for others
    });

  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-b from-[#7FE2E3] via-[#9DCBF7] to-[#C69CF7] pb-24">
      {/* Top bar */}
      <div className="flex items-center justify-center px-5 pt-8 pb-4">
        <h1 className="text-xl font-bold text-[#475270]">Discover People</h1>
      </div>

      {/* Search */}
      <div className="px-4 pb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people"
            className="w-full pl-11 pr-4 py-3.5 bg-white/90 backdrop-blur-sm border border-white/40 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-white/60 transition-all text-slate-800 placeholder:text-slate-500 text-[15px]"
          />
        </div>
      </div>

      {/* User list card */}
      <div className="px-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] divide-y divide-slate-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading people...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No one else is here yet!</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No people found.</div>
          ) : (
            filteredUsers.map((u) => (
              <UserRow
                key={u.id}
                user={u}
                onConnect={() => handleAction(u.id, "connect")}
                onWithdraw={() => handleAction(u.id, "withdraw")}
                onAccept={() => handleAction(u.id, "accept")}
                onReject={() => handleAction(u.id, "reject")}
                onOpenChat={onOpenChat}
              />
            ))
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomBar activeTab="people" onNavigate={navigateTo} />
    </div>
  );
};

const UserRow = ({ user, onConnect, onWithdraw, onAccept, onReject, onOpenChat }) => {
  return (
    <div className="flex items-center gap-3 px-4 py-4">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#9DCBF7] to-[#C69CF7] flex items-center justify-center flex-shrink-0 border-2 border-white shadow-sm overflow-hidden">
        {user.photoUrl ? (
          <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
        ) : (
          <User className="w-5 h-5 text-white" />
        )}
      </div>
      <p className="flex-1 text-[15px] font-medium text-slate-800 truncate">{user.name}</p>

      <div className="flex items-center gap-2 flex-shrink-0">
        {user.status === "connected" && (
          <button onClick={() => onOpenChat(user)} className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-[#7FE2E3] via-[#9DCBF7] to-[#C69CF7] text-white active:scale-95 transition-transform">
            <MessageCircle className="w-3.5 h-3.5" /> Message
          </button>
        )}
        {user.status === "none" && (
          <button onClick={onConnect} className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-95 transition-transform">
            <UserPlus className="w-3.5 h-3.5" /> Connect
          </button>
        )}
        {user.status === "pending_sent" && (
          <button onClick={onWithdraw} className="px-4 py-2 rounded-full text-xs font-semibold bg-white border border-rose-100 text-rose-500 hover:bg-rose-50 active:scale-95 transition-transform">
            Cancel
          </button>
        )}
        {user.status === "pending_received" && (
          <div className="flex items-center gap-2">
            <button onClick={onReject} className="px-4 py-2 rounded-full text-xs font-semibold bg-white border border-rose-100 text-rose-500 hover:bg-rose-50 active:scale-95 transition-transform">
              Decline
            </button>
            <button onClick={onAccept} className="px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-[#7FE2E3] via-[#9DCBF7] to-[#C69CF7] text-white active:scale-95 transition-transform">
              Accept
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserListPage;