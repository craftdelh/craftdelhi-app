import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import Toast from 'react-native-toast-message';

const UserContext = createContext();

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || "https://backend.craftdelhi.com";
const SOCKET_PATH = process.env.EXPO_PUBLIC_SOCKET_PATH || "/chat/socket.io";
const API_BASE = process.env.EXPO_PUBLIC_CHAT_API_BASE || "https://backend.craftdelhi.com/chat";

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [rooms, setRooms] = useState([]);
  const socketRef = useRef(null);
  const roomsRef = useRef([]);
  const [activeRoomId, setActiveRoomId] = useState(null);
  const activeRoomIdRef = useRef(null);

  useEffect(() => {
    activeRoomIdRef.current = activeRoomId;
  }, [activeRoomId]);

  useEffect(() => {
    roomsRef.current = rooms;
  }, [rooms]);

  useEffect(() => {
    if (user?.token) {
      initGlobalChat(user.token);
    }
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [user]);

  const initGlobalChat = async (token) => {
    try {
      const sId = user?.id || user?._id || user?.seller_id || user?.data?.id || user?.user?.id;
      let finalSellerId = sId;

      socketRef.current = io(SOCKET_URL, {
        path: SOCKET_PATH,
        auth: { token: token },
        transports: ['websocket', 'polling'],
      });

      socketRef.current.on("message_received", (msg) => {
        // Check if this room is currently active in the chat screen
        const isCurrentRoom = String(activeRoomIdRef.current) === String(msg.roomId);

        // Show Toast if sender is not me and we are NOT looking at this room
        if (!isCurrentRoom && String(msg.senderId) !== String(finalSellerId)) {
          const room = roomsRef.current.find(r => String(r.roomId || r._id || r.id) === String(msg.roomId));
          let senderName = "Admin/Customer";
          if (room) {
            const otherUser = room.participants?.find(p => String(p.userId) !== String(finalSellerId));
            if (otherUser && otherUser.name) {
              senderName = otherUser.name;
            }
          }
          Toast.show({ type: 'info', text1: `New Message from ${senderName}`, text2: msg.message, visibilityTime: 3000 });
        }
        
        setRooms(prevRooms => {
          const updated = prevRooms.map(r => {
            const rId = r.roomId || r._id || r.id;
            if (String(rId) === String(msg.roomId)) {
              return { 
                ...r, 
                lastMessage: msg.message, 
                lastMessageAt: msg.createdAt,
                unreadCount: isCurrentRoom ? 0 : (r.unreadCount || 0) + 1
              };
            }
            return r;
          });
          updated.sort((a,b) => new Date(b.lastMessageAt || b.createdAt) - new Date(a.lastMessageAt || a.createdAt));
          return updated;
        });
      });

      // Fetch initial rooms
      const res = await axios.get(`${API_BASE}/rooms`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data?.data || [];
      data.sort((a,b) => new Date(b.lastMessageAt || b.createdAt) - new Date(a.lastMessageAt || a.createdAt));
      setRooms(data);

    } catch (e) {
      console.error("Global chat init error:", e);
    }
  };

  const totalUnread = rooms.reduce((acc, r) => acc + (r.unreadCount || 0), 0);

  return (
    <UserContext.Provider value={{ user, setUser, socket: socketRef.current, rooms, setRooms, totalUnread, activeRoomId, setActiveRoomId }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
