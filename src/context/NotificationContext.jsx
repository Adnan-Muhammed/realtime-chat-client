import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import api from '../api';
import { requestNotificationPermission } from '../firebase';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children, currentUser }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [activeChatUserId, setActiveChatUserId] = useState(null);
  const [socket, setSocket] = useState(null);
  
  const activeChatRef = useRef(activeChatUserId);

  useEffect(() => {
    activeChatRef.current = activeChatUserId;
  }, [activeChatUserId]);

  // Fetch initial notifications
  useEffect(() => { 
    if (!currentUser?._id) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const fetchInitialNotifications = async () => { 
      try {
        const res = await api.get(`/notifications/${currentUser._id}`);
        const notifs = res.data || [];
        setNotifications(notifs);
        setUnreadCount(notifs.filter(n => !n.isRead).length);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchInitialNotifications();
  }, [currentUser]);

  // Socket connection
  useEffect(() => {
    if (!currentUser?._id) return;

    // Connect socket globally
    const newSocket = io(BACKEND_URL);
    setSocket(newSocket);

    // Tell the server this user is now online (used for offline push notifications)
    newSocket.emit('user_online', currentUser._id);

    // Also join a personal socket room so server can target this user directly
    newSocket.emit('join_room', currentUser._id);

    // Listen for new messages globally
    newSocket.on("receive_message", (message) => {
      if (activeChatRef.current === message.sender) {
        // User is currently chatting with the sender. Do not increment notification count.
        return;
      }

      setUnreadCount(prev => prev + 1);
      
      const newNotif = {
        _id: message._id || Date.now().toString(),
        type: 'message',
        name: message.senderName || 'Someone',
        detail: 'sent you a message',
        time: message.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: false,
        ...message
      };
      
      setNotifications(prev => [newNotif, ...prev]);
    });

    newSocket.on("new_notification", (notif) => {
      setUnreadCount(prev => prev + 1);
      setNotifications(prev => [notif, ...prev]);
    });

    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, [currentUser]);

  // ─── FCM Token Registration ──────────────────────────────────
  // After the user logs in, request notification permission and
  // save the FCM token to the backend. This runs once per session.
  useEffect(() => {
    if (!currentUser?._id) return;

    const registerFcmToken = async () => {
      try {
        const token = await requestNotificationPermission();
        if (token) {
          await api.post('/users/fcm-token', { fcmToken: token });
          console.log('FCM token saved to backend.');
        }
      } catch (error) {
        // Non-fatal — user may have denied notifications or browser may not support it
        console.warn('Could not register FCM token:', error.message);
      }
    };

    registerFcmToken();
  }, [currentUser?._id]);

  const markAllAsRead = async () => {
    if (!currentUser?._id) return;
    try {
      await api.put(`/notifications/${currentUser._id}/read`);
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  };

  const markAsRead = async (id) => {
    if (!id) return;
    try {
      setNotifications(prev => prev.map(n => {
        const nId = n._id || n.id;
        if (nId === id && !n.isRead) {
          setUnreadCount(count => Math.max(0, count - 1));
          return { ...n, isRead: true };
        }
        return n;
      }));
      await api.put(`/notifications/${id}/mark-read`);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        notifications,
        activeChatUserId,
        setActiveChatUserId,
        socket,
        markAllAsRead,
        markAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
 