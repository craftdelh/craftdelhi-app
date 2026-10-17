import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { isTokenExpired, clearAuthSession } from '../src/utils/auth';

const UserContext = createContext();

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || "https://backend.craftdelhi.com";
const SOCKET_PATH = process.env.EXPO_PUBLIC_SOCKET_PATH || "/chat/socket.io";
const API_BASE = process.env.EXPO_PUBLIC_CHAT_API_BASE || "https://backend.craftdelhi.com/chat";

let isLoggingOut = false;

// Global Axios Interceptor to catch 401 Unauthorized / Token Expiration across all API calls
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const msg = (error.response?.data?.message || '').toLowerCase();
    const isTokenErr =
      status === 401 ||
      msg.includes('token expired') ||
      msg.includes('jwt expired') ||
      msg.includes('invalid token');

    if (isTokenErr && !isLoggingOut) {
      isLoggingOut = true;
      try {
        await clearAuthSession();
        Toast.show({
          type: 'error',
          text1: 'Session Expired',
          text2: 'Your session has expired. Please login again.',
        });
        router.replace('/auth/Signin');
      } catch (e) {
        console.error('Logout on 401 error:', e);
      } finally {
        setTimeout(() => {
          isLoggingOut = false;
        }, 2500);
      }
    }
    return Promise.reject(error);
  }
);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [rooms, setRooms] = useState([]);
  const socketRef = useRef(null);
  const roomsRef = useRef([]);
  const userRef = useRef(null);
  const [activeRoomId, setActiveRoomId] = useState(null);
  const activeRoomIdRef = useRef(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    activeRoomIdRef.current = activeRoomId;
  }, [activeRoomId]);

  useEffect(() => {
    roomsRef.current = rooms;
  }, [rooms]);

  // Restore user from storage on mount if not loaded
  useEffect(() => {
    const loadStoredUser = async () => {
      try {
        const userStr = await AsyncStorage.getItem('user');
        if (userStr) {
          const parsed = JSON.parse(userStr);
          if (!isTokenExpired(parsed)) {
            setUser(parsed);
          }
        }
      } catch (e) {
        console.error('Error loading stored user:', e);
      }
    };
    loadStoredUser();
  }, []);

  const logout = async (showAlert = false) => {
    try {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      await clearAuthSession();
      setUser(null);
      setRooms([]);
      if (showAlert) {
        Toast.show({
          type: 'info',
          text1: 'Logged Out',
          text2: 'You have been logged out successfully.',
        });
      }
      router.replace('/auth/Signin');
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const fetchRoomsList = async (authToken) => {
    const t = authToken || userRef.current?.token;
    if (!t) return;
    try {
      const res = await axios.get(`${API_BASE}/rooms`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      const data = (res.data?.data || []).map((r) => ({
        ...r,
        unreadCount: r.unreadCount || 0,
      }));
      data.sort(
        (a, b) =>
          new Date(b.lastMessageAt || b.createdAt || 0) -
          new Date(a.lastMessageAt || a.createdAt || 0)
      );
      setRooms(data);
    } catch (err) {
      console.log('Error fetching rooms list:', err.message);
    }
  };

  // Check 7-day token expiration on mount and whenever user changes
  useEffect(() => {
    if (user && isTokenExpired(user)) {
      logout(false);
      Toast.show({
        type: 'info',
        text1: 'Session Expired',
        text2: 'Your 7-day session has expired. Please login again.',
      });
      return;
    }

    if (user?.token) {
      initGlobalChat(user.token);
    }
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [user]);

  const initGlobalChat = async (token) => {
    try {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      socketRef.current = io(SOCKET_URL, {
        path: SOCKET_PATH,
        auth: { token: token },
        transports: ['websocket', 'polling'],
      });

      socketRef.current.on('connect', () => {
        socketRef.current.emit('get_unseen_count');
        fetchRoomsList(token);
      });

      // Handle unread counts pushed by backend
      socketRef.current.on('unseen_count_updated', (data) => {
        if (!data?.countsByRoom) return;
        const counts = data.countsByRoom;
        setRooms((prevRooms) => {
          const existingIds = prevRooms.map((r) =>
            String(r.roomId || r._id || r.id)
          );
          const incomingIds = Object.keys(counts);
          const hasNewRoom = incomingIds.some((id) => !existingIds.includes(id));
          if (hasNewRoom) {
            fetchRoomsList(token);
            return prevRooms;
          }
          return prevRooms.map((room) => {
            const rId = String(room.roomId || room._id || room.id);
            return {
              ...room,
              unreadCount:
                counts[rId] !== undefined ? counts[rId] : room.unreadCount || 0,
            };
          });
        });
      });

      // Handle incoming message
      socketRef.current.on('message_received', (msg) => {
        if (!msg?.roomId) return;
        const isCurrentRoom =
          String(activeRoomIdRef.current) === String(msg.roomId);
        const myId =
          userRef.current?.id ||
          userRef.current?._id ||
          userRef.current?.user_id;
        const isFromMe = String(msg.senderId) === String(myId);
        const msgText =
          msg.message || (msg.mediaUrl ? '📷 Photo' : 'New message');

        // Show Toast if sender is not me and we are NOT looking at this room
        if (!isCurrentRoom && !isFromMe) {
          const room = roomsRef.current.find(
            (r) => String(r.roomId || r._id || r.id) === String(msg.roomId)
          );
          let senderName = 'New Message';
          if (room) {
            const otherUser = room.participants?.find(
              (p) => String(p.userId) !== String(myId)
            );
            if (otherUser && otherUser.name) {
              senderName = otherUser.name;
            }
          }
          Toast.show({
            type: 'info',
            text1: senderName,
            text2: msgText,
            visibilityTime: 3000,
          });
        }

        setRooms((prevRooms) => {
          let found = false;
          const updated = prevRooms.map((r) => {
            const rId = r.roomId || r._id || r.id;
            if (String(rId) === String(msg.roomId)) {
              found = true;
              return {
                ...r,
                lastMessage: msgText,
                lastMessageAt: msg.createdAt || new Date().toISOString(),
                unreadCount: isCurrentRoom
                  ? 0
                  : (r.unreadCount || 0) + (isFromMe ? 0 : 1),
              };
            }
            return r;
          });

          if (!found) {
            fetchRoomsList(token);
            return prevRooms;
          }

          updated.sort(
            (a, b) =>
              new Date(b.lastMessageAt || b.createdAt || 0) -
              new Date(a.lastMessageAt || a.createdAt || 0)
          );
          return updated;
        });
      });

      // Initial rooms load
      await fetchRoomsList(token);
    } catch (e) {
      console.error('Global chat init error:', e);
    }
  };

  const totalUnread = rooms.reduce((acc, r) => acc + (r.unreadCount || 0), 0);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        socket: socketRef.current,
        rooms,
        setRooms,
        totalUnread,
        activeRoomId,
        setActiveRoomId,
        logout,
        isTokenExpired,
        fetchRoomsList,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
