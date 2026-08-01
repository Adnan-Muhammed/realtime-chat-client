import React, { useState, useEffect } from 'react';

// ─── Component Imports ───────────────────────────────────────
import AuthPage from '../../components/chatapp/AuthPage.jsx';
import ProfilePage from '@/components/chatapp/ProfilePage';
import FriendListPage from '@/components/chatapp/FriendListPage';
import UserListPage from '@/components/chatapp/UserListPage';
import NotificationsPage from '@/components/chatapp/NotificationPage';
import MessageInterface from '@/components/chatapp/MessageInterfacePage';
import ChatAppBottomBar from '@/components/chatapp/ChatAppBottomBar';

// ─── Context Import ──────────────────────────────────────────
import { NotificationProvider } from '../../context/NotificationContext';

export default function ChatAppLayout() {
  // ─── State ───────────────────────────────────────────────────
  const [currentScreen, setCurrentScreen] = useState('auth');
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);

  // ─── Check for existing session on load ──────────────────────
  useEffect(() => {
    const token = localStorage.getItem('swilaAccessToken');
    const savedUser = localStorage.getItem('swilaUser');

    if (token && savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setCurrentUser(parsedUser);

      if (!parsedUser.isProfileComplete) {
        setCurrentScreen('profile');
      } else if (parsedUser.friends && parsedUser.friends.length > 0) {
        setCurrentScreen('friends');
      } else {
        setCurrentScreen('people');
      }
    }
  }, []);

  // ─── Login Handler ───────────────────────────────────────────
  const handleLoginSuccess = async (response) => {
    try {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
      const res = await fetch(`${BACKEND_URL}/api/auth/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: response.access_token }),
      });
      const data = await res.json();

      if (data.success) {
        // Save tokens and user to localStorage
        localStorage.setItem('swilaAccessToken', data.accessToken);
        localStorage.setItem('swilaRefreshToken', data.refreshToken);
        localStorage.setItem('swilaUser', JSON.stringify(data.user));
        setCurrentUser(data.user);

        // Navigate based on profile completion and friend count
        if (data.isNewUser || !data.user.isProfileComplete) {
          setCurrentScreen('profile');
        } else if (data.user.friends && data.user.friends.length > 0) {
          setCurrentScreen('friends');
        } else {
          setCurrentScreen('people');
        }
      } else {
        alert("Login failed: " + data.message);
      }
    } catch (error) {
      console.error("Error connecting to backend:", error);
    }
  };

  // ─── Logout Handler ──────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem('swilaAccessToken');
    localStorage.removeItem('swilaRefreshToken');
    localStorage.removeItem('swilaUser');
    setCurrentUser(null);
    setCurrentScreen('auth');
  };

  // ─── Open Chat Handler ───────────────────────────────────────
  const openChat = (friend) => {
    setSelectedFriend(friend);
    setCurrentScreen('chat');
  };

  // ─── Render ──────────────────────────────────────────────────
  return (
    <NotificationProvider currentUser={currentUser}>
      <div className="w-full min-h-[100dvh] bg-slate-50">

        {/* 🔐 Auth Screen */}
        {currentScreen === 'auth' && (
          <AuthPage onLoginSuccess={handleLoginSuccess} />
        )}

        {/* 👤 Profile Screen */}
        {currentScreen === 'profile' && (
          <>
            <ProfilePage
              isProfileMode={currentUser?.isProfileComplete}
              userData={currentUser}
              onSave={(data) => {
                setCurrentUser(data);
                if (data.friends && data.friends.length > 0) {
                  setCurrentScreen('friends');
                } else {
                  setCurrentScreen('people');
                }
              }}
              onLogout={handleLogout}
            />
            {currentUser?.isProfileComplete && (
              <ChatAppBottomBar activeTab="profile" onNavigate={setCurrentScreen} />
            )}
          </>
        )}

        {/* 👥 Friends List Screen */}
        {currentScreen === 'friends' && (
          <>
            <FriendListPage navigateTo={setCurrentScreen} onOpenChat={openChat} />
            <ChatAppBottomBar activeTab="friends" onNavigate={setCurrentScreen} />
          </>
        )}

        {/* 🌍 Discover People Screen */}
        {currentScreen === 'people' && (
          <UserListPage navigateTo={setCurrentScreen} onOpenChat={openChat} />
        )}

        {/* 🔔 Notifications Screen */}
        {currentScreen === 'notifications' && (
          <NotificationsPage
            navigateTo={setCurrentScreen}
            currentUserId={currentUser?._id}
            onOpenChat={openChat}
          />
        )}

        {/* 💬 Chat Screen */}
        {currentScreen === 'chat' && selectedFriend && (
          <MessageInterface
            friendName={selectedFriend.name}
            friendId={selectedFriend.id}
            currentUserId={currentUser?._id}
            onBack={() => setCurrentScreen('friends')}
          />
        )}

      </div>
    </NotificationProvider>
  );
}