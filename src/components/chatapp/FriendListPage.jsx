


import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Search, User, MessageCircle } from 'lucide-react';

const FriendListPage = ({ navigateTo, onOpenChat }) => {
  const [friends, setFriends] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await api.get('/users/friends');
        if (res.data.success) {
          setFriends(res.data.friends);
        }
      } catch (error) {
        console.error("Failed to fetch friends:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFriends();
  }, []);

  const filteredFriends = friends.filter((f) =>
    f.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-b from-[#7FE2E3] via-[#9DCBF7] to-[#C69CF7] pb-24">

      {/* Top bar */}
      <div className="flex items-center justify-center px-5 pt-8 pb-4">
        <h1 className="text-xl font-bold text-[#475270]">Messages</h1>
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
            placeholder="Search friends"
            className="w-full pl-11 pr-4 py-3.5 bg-white/90 backdrop-blur-sm border border-white/40 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-white/60 transition-all text-slate-800 placeholder:text-slate-500 text-[15px]"
          />
        </div>
      </div>

      {/* Friend list card */}
      <div className="px-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] divide-y divide-slate-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading friends...</div>
          ) : friends.length === 0 ? (
            <div className="p-8 text-center text-slate-500">You don't have any friends yet. Check out the Discover tab!</div>
          ) : filteredFriends.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No friends found.</div>
          ) : (
            filteredFriends.map((f) => (
              <button
                key={f.id}
                onClick={() => onOpenChat(f)}
                className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-slate-50 active:bg-slate-100 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#9DCBF7] to-[#C69CF7] flex items-center justify-center flex-shrink-0 border-2 border-white shadow-sm overflow-hidden">
                  {f.photoUrl ? (
                    <img src={f.photoUrl} alt={f.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div> 

                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-slate-800 truncate">{f.name}</p>
                  {f.lastMessage && (
                    <p className={`text-[13px] truncate mt-0.5 ${f.unread > 0 ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
                      {f.lastMessage}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  {f.time && <span className="text-[11px] font-medium text-slate-400">{f.time}</span>}
                  {f.unread > 0 ? (
                    <span className="min-w-[20px] h-[20px] px-1.5 rounded-full bg-gradient-to-r from-[#7FE2E3] via-[#9DCBF7] to-[#C69CF7] text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                      {f.unread}
                    </span>
                  ) : (
                    <button className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-[#7FE2E3] via-[#9DCBF7] to-[#C69CF7] text-white active:scale-95 transition-transform">
                      <MessageCircle className="w-3.5 h-3.5" /> Message
                    </button>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendListPage;
