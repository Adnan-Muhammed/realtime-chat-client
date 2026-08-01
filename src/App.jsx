import { useState, useEffect } from 'react';
import AuthPage from './components/chatapp/AuthPage';
import ProfilePage from './components/chatapp/ProfilePage';
import FriendListPage from './components/chatapp/FriendListPage';
import UserListPage from './components/chatapp/UserListPage';
import ChatAppBottomBar from './components/chatapp/ChatAppBottomBar';
import NotificationsPage from './components/chatapp/NotificationPage';
import MessageInterface from './components/chatapp/MessageInterfacePage';

import { NotificationProvider } from './context/NotificationContext';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('auth');
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);

  // Check if user is already logged in on mount
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

  const handleLoginSuccess = async (response) => {
    try {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const res = await fetch(`${BACKEND_URL}/api/auth/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: response.access_token }),
      });
      const data = await res.json();
      console.log("Backend Response:", data);
      
      if (data.success) {
        // Save to local storage
        localStorage.setItem('swilaAccessToken', data.accessToken);
        localStorage.setItem('swilaRefreshToken', data.refreshToken);
        localStorage.setItem('swilaUser', JSON.stringify(data.user));
        setCurrentUser(data.user);
        
        // Navigate based on whether the profile is complete and if they have friends
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

  const handleLogout = () => {
    localStorage.removeItem('swilaAccessToken');
    localStorage.removeItem('swilaRefreshToken');
    localStorage.removeItem('swilaUser');
    setCurrentUser(null);
    setCurrentScreen('auth');
  };

  const openChat = (friend) => {
    setSelectedFriend(friend);
    setCurrentScreen('chat');
  };

  return (
    <NotificationProvider currentUser={currentUser}>
      <div className="w-full min-h-[100dvh] bg-slate-50">
        {currentScreen === 'auth' && (
          <AuthPage onLoginSuccess={handleLoginSuccess} />
        )}
        
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

        {currentScreen === 'friends' && (
          <>
            <FriendListPage navigateTo={setCurrentScreen} onOpenChat={openChat} />
            <ChatAppBottomBar activeTab="friends" onNavigate={setCurrentScreen} />
          </>
        )}

        {currentScreen === 'people' && (
          <UserListPage navigateTo={setCurrentScreen} onOpenChat={openChat} />
        )}

        {currentScreen === 'notifications' && (
          <NotificationsPage navigateTo={setCurrentScreen} currentUserId={currentUser?._id} onOpenChat={openChat} />
        )}

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
  )
};

export default App;


//  we are using an "Access Token" flow (Frontend-heavy)
// "Authorization Code" flow