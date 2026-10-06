import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, Image, Modal, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { io } from 'socket.io-client';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import ImageViewing from "react-native-image-viewing";
import { getImageUrl } from '../../../utils/imageUrl';

import { useUser } from '../../../../context/UserContext';
import * as ImagePicker from 'expo-image-picker';
const API_BASE = process.env.EXPO_PUBLIC_CHAT_API_BASE || "https://backend.craftdelhi.com/chat";
const APP_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;
const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || "https://backend.craftdelhi.com";
const SOCKET_PATH = process.env.EXPO_PUBLIC_SOCKET_PATH || "/chat/socket.io";

export default function MessagesScreen() {
  const { user, socket, rooms, setRooms, setActiveRoomId } = useUser();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [sellerId, setSellerId] = useState(null);
  const [typingRooms, setTypingRooms] = useState({});
  const [viewingImage, setViewingImage] = useState(null);
  const activeRoomRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [chatType, setChatType] = useState("");
  const [contextIdInput, setContextIdInput] = useState("");
  const [productsList, setProductsList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [loadingContext, setLoadingContext] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    const fetchSellerId = async () => {
      const sId = user?.id || user?._id || user?.seller_id || user?.data?.id || user?.user?.id;
      let finalSellerId = sId;
      if (!finalSellerId) {
        finalSellerId = await AsyncStorage.getItem('craftdelhiseller_id');
      }
      setSellerId(finalSellerId);
    };
    fetchSellerId();
  }, [user]);

  useEffect(() => {
    if (!socket || !sellerId) return;

    const handleMsg = (msg) => {
      if (String(activeRoomRef.current) === String(msg.roomId)) {
        setMessages(prev => {
          const index = prev.findIndex(m => (m._id && m._id === msg._id) || (m.tempId && m.tempId === msg.tempId));
          if (index !== -1) {
            const newMsgs = [...prev];
            newMsgs[index] = { ...newMsgs[index], ...msg, status: "sent" };
            return newMsgs;
          }
          return [...prev, msg];
        });
        socket.emit("mark_room_read", { roomId: msg.roomId });
        setRooms(prevRooms => prevRooms.map(r => {
          if (String(r.roomId || r._id || r.id) === String(msg.roomId)) return { ...r, unreadCount: 0 };
          return r;
        }));
      }
    };

    const handleTyping = (payload) => {
      const { userId, roomId: typingRoomId, isTyping } = payload;
      if (String(userId) === String(sellerId)) return;
      setTypingRooms(prev => ({ ...prev, [typingRoomId]: isTyping }));
    };

    socket.on("message_received", handleMsg);
    socket.on("user_typing", handleTyping);

    return () => {
      socket.off("message_received", handleMsg);
      socket.off("user_typing", handleTyping);
    };
  }, [socket, sellerId, setRooms]);

  useEffect(() => {
    if (showCreateModal) {
      if (chatType === "PRODUCT" && productsList.length === 0) {
        fetchProductsContext();
      } else if (chatType === "ORDER" && ordersList.length === 0) {
        fetchOrdersContext();
      }
    }
  }, [showCreateModal, chatType]);

  const fetchProductsContext = async () => {
    setLoadingContext(true);
    try {
      const tokenStr = user?.token || "";
      const res = await axios.get(`${APP_BASE_URL}seller-store/products-view`, {
        headers: { Authorization: tokenStr }
      });
      setProductsList(res.data?.data || []);
    } catch (e) { console.error(e); }
    setLoadingContext(false);
  };

  const fetchOrdersContext = async () => {
    setLoadingContext(true);
    try {
      const tokenStr = user?.token || "";
      const res = await axios.get(`${APP_BASE_URL}order/recentorders`, {
        headers: { Authorization: `Bearer ${tokenStr}` }
      });
      setOrdersList(res.data?.data || []);
    } catch (e) { console.error(e); }
    setLoadingContext(false);
  };

  const [selectedRoom, setSelectedRoom] = useState(null);
  const selectedRoomId = selectedRoom?.roomId || selectedRoom?._id || selectedRoom?.id;

  const getRoomName = (room) => {
    if (!room) return "Chat";
    const otherUser = room.participants?.find(p => String(p.userId) !== String(sellerId));
    return otherUser?.name || "Admin";
  };

  const selectRoom = async (room) => {
    const id = room.roomId || room._id || room.id;
    console.log("Selecting room ID:", id);
    setSelectedRoom(room);
    activeRoomRef.current = id;
    setActiveRoomId(id);
    
    // clear badge locally
    setRooms(prevRooms => prevRooms.map(r => {
      const rId = r.roomId || r._id || r.id;
      if (String(rId) === String(id)) return { ...r, unreadCount: 0 };
      return r;
    }));
    
    try {
      const res = await axios.get(`${API_BASE}/messages?roomId=${id}&page=1&limit=50`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      let fetchedMessages = res.data?.data || [];
      fetchedMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      setMessages(fetchedMessages);
    } catch(e) {
      console.error("Failed to fetch messages:", e);
      setMessages([]);
    }
    
    socket?.emit("join_room", { roomId: id });
    socket?.emit("mark_room_read", { roomId: id });
  };

  const sendMessage = () => {
    console.log("sendMessage triggered. inputText:", inputText, "roomId:", selectedRoomId, "sellerId:", sellerId);
    if (!inputText.trim() || !selectedRoomId) {
       console.log("Cannot send message: Empty text or no room ID");
       return;
    }
    
    const tempId = Date.now().toString() + Math.random().toString(36).substring(7);
    const msgData = {
      roomId: selectedRoomId,
      senderId: sellerId,
      message: inputText,
      tempId,
    };
    
    console.log("Emitting send_message with payload:", msgData);
    socket?.emit("send_message", msgData);
    
    const now = new Date().toISOString();
    setMessages(prev => [...prev, { ...msgData, createdAt: now, status: "sending" }]);
    
    setRooms(prevRooms => {
      const updated = prevRooms.map(r => {
        const rId = r.roomId || r._id || r.id;
        if (String(rId) === String(selectedRoomId)) {
          return { ...r, lastMessage: inputText, lastMessageAt: now };
        }
        return r;
      });
      updated.sort((a,b) => new Date(b.lastMessageAt || b.createdAt) - new Date(a.lastMessageAt || a.createdAt));
      return updated;
    });

    setInputText("");
  };

  const pickImageAndSend = async () => {
    if (!selectedRoomId) return;

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const tempId = "file-" + Date.now() + Math.random().toString(36).substring(7);
      const now = new Date().toISOString();
      
      const fileToUpload = {
        uri: asset.uri,
        name: asset.fileName || `chat_media_${Date.now()}.jpg`,
        type: asset.mimeType || 'image/jpeg',
      };

      // Optimistic UI Update
      setMessages(prev => [...prev, {
        roomId: selectedRoomId,
        senderId: sellerId,
        message: "",
        filePreview: asset.uri,
        createdAt: now,
        tempId: tempId,
        status: "sending"
      }]);

      try {
        const formData = new FormData();
        formData.append("roomId", selectedRoomId);
        formData.append("tempId", tempId);
        formData.append("file", fileToUpload);

        const res = await axios.post(`${API_BASE}/message`, formData, {
          headers: {
            Authorization: `Bearer ${user?.token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        
        const serverMsg = res.data?.data || res.data || {};
        const persistentUrl = serverMsg.message || serverMsg.fileUrl || serverMsg.filePath || asset.uri;

        if (socket) {
          socket.emit("send_message", {
            roomId: selectedRoomId,
            senderId: sellerId,
            message: persistentUrl,
            fileUrl: persistentUrl,
            tempId: tempId,
          });
        }

        setMessages(prev => prev.map(m => 
          m.tempId === tempId ? { ...m, ...serverMsg, filePreview: persistentUrl, status: "sent" } : m
        ));
      } catch (err) {
        console.error("Upload error:", err);
        Toast.show({ type: 'error', text1: 'Upload failed', text2: 'Could not send attachment.' });
        setMessages(prev => prev.map(m => 
          m.tempId === tempId ? { ...m, status: "failed" } : m
        ));
      }
    }
  };

  const createRoom = async () => {
    if (chatType !== "GENERAL" && (!chatType || !contextIdInput)) {
      Toast.show({ type: 'error', text1: 'Please select a product/order' });
      return;
    }
    try {
      let payload = {};
      if (chatType === "GENERAL") {
        payload = {
          contextType: "GENERAL",
          generalType: "SELLER_ADMIN",
        };
      } else if (chatType === "PRODUCT") {
        payload = {
          contextType: "PRODUCT",
          contextId: `PRODUCT_ID_${contextIdInput}`,
        };
      } else if (chatType === "ORDER") {
        payload = {
          contextType: "ORDER",
          contextId: `ORDER_ID_${contextIdInput}`,
        };
      }

      const res = await axios.post(`${API_BASE}/createroom`, payload, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      
      const newRoom = res.data;
      if (newRoom && (newRoom.roomId || newRoom._id)) {
        setShowCreateModal(false);
        setChatType("");
        setContextIdInput("");
        setRooms(prev => {
          const exists = prev.find(r => (r.roomId || r._id || r.id) === (newRoom.roomId || newRoom._id || newRoom.id));
          if (exists) return prev;
          return [newRoom, ...prev];
        });
        selectRoom(newRoom);
        Toast.show({ type: 'success', text1: 'Chat created successfully!' });
      }
    } catch (err) {
      console.error(err);
      Toast.show({ type: 'error', text1: 'Failed to create chat' });
    }
  };

  const emitTyping = () => {
    if (!selectedRoomId) return;
    socket?.emit("typing", { roomId: selectedRoomId, isTyping: true });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit("typing", { roomId: selectedRoomId, isTyping: false });
    }, 1500);
  };

  const handleTextChange = (text) => {
    setInputText(text);
    emitTyping();
  };

  if (selectedRoomId) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <ImageViewing
          images={viewingImage ? [{ uri: viewingImage.startsWith('http') ? viewingImage : getImageUrl(viewingImage) }] : []}
          imageIndex={0}
          visible={!!viewingImage}
          onRequestClose={() => setViewingImage(null)}
        />
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { setSelectedRoom(null); activeRoomRef.current = null; setActiveRoomId(null); }} style={{ padding: 10 }}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{getRoomName(selectedRoom)}</Text>
        </View>

        <FlatList
          data={messages}
          keyExtractor={(item, idx) => item._id || item.tempId || String(idx)}
          onContentSizeChange={(w, h) => { flatListRef.current?.scrollToEnd({ animated: true }); }}
          onLayout={() => { flatListRef.current?.scrollToEnd({ animated: true }); }}
          ref={flatListRef}
          renderItem={({ item }) => {
            const isMe = item.senderType === 'SELLER' || String(item.senderId) === String(sellerId);
            const time = new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            const otherName = getRoomName(selectedRoom);
            const otherLetter = otherName.charAt(0).toUpperCase();
            
            const myName = user?.name || user?.user?.name || user?.data?.name || "Me";
            const myLetter = myName.charAt(0).toUpperCase();

            return (
              <View style={{flexDirection: 'row', alignItems: 'flex-end', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: 12}}>
                {!isMe && (
                  <View style={{width: 32, height: 32, borderRadius: 16, backgroundColor: '#36234E', justifyContent: 'center', alignItems: 'center', marginRight: 8}}>
                     <Text style={{color: '#fff', fontSize: 14, fontFamily: 'msemibold'}}>{otherLetter}</Text>
                  </View>
                )}
                <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.otherMessage, {marginBottom: 0}]}>
                  {(item.filePreview || item.fileUrl || item.filePath) && (
                    <TouchableOpacity onPress={() => setViewingImage(item.filePreview || item.fileUrl || item.filePath)}>
                      <Image 
                        source={{ uri: item.filePreview || item.fileUrl || item.filePath }} 
                        style={{ width: 200, height: 200, borderRadius: 8, marginBottom: item.message ? 8 : 0 }} 
                        resizeMode="cover" 
                      />
                    </TouchableOpacity>
                  )}
                  {!!item.message && !item.message.startsWith('http') && <Text style={[styles.messageText, isMe && { color: '#fff' }]}>{item.message}</Text>}
                  {!!item.message && item.message.startsWith('http') && !item.filePreview && !item.fileUrl && !item.filePath && (
                    <TouchableOpacity onPress={() => setViewingImage(item.message)}>
                      <Image 
                        source={{ uri: item.message }} 
                        style={{ width: 200, height: 200, borderRadius: 8, marginBottom: 0 }} 
                        resizeMode="cover" 
                      />
                    </TouchableOpacity>
                  )}
                  <Text style={{fontSize: 10, color: isMe ? '#e0e0e0' : '#888', alignSelf: 'flex-end', marginTop: 4}}>{time}</Text>
                  {item.status === 'sending' && <Text style={{fontSize: 10, color: isMe ? '#e0e0e0' : '#888', alignSelf: 'flex-end'}}>Sending...</Text>}
                  {item.status === 'failed' && <Text style={{fontSize: 10, color: 'red', alignSelf: 'flex-end'}}>Failed</Text>}
                </View>
                {isMe && (
                  <View style={{width: 32, height: 32, borderRadius: 16, backgroundColor: '#024A63', justifyContent: 'center', alignItems: 'center', marginLeft: 8}}>
                     <Text style={{color: '#fff', fontSize: 14, fontFamily: 'msemibold'}}>{myLetter}</Text>
                  </View>
                )}
              </View>
            );
          }}
          contentContainerStyle={{ padding: 16 }}
        />

        {typingRooms[selectedRoomId] && (
          <View style={{paddingHorizontal: 20, paddingBottom: 10, flexDirection: 'row', alignItems: 'center'}}>
             <View style={{width: 24, height: 24, borderRadius: 12, backgroundColor: '#36234E', justifyContent: 'center', alignItems: 'center', marginRight: 8}}>
                <Text style={{color: '#fff', fontSize: 10, fontFamily: 'msemibold'}}>{getRoomName(selectedRoom).charAt(0).toUpperCase()}</Text>
             </View>
             <Text style={{color: '#888', fontStyle: 'italic', fontSize: 12}}>typing...</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachBtn} onPress={pickImageAndSend}>
            <Ionicons name="add-circle-outline" size={28} color="#024A63" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={inputText}
            onChangeText={handleTextChange}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Ionicons name="send" size={20} color="#ffffffff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.pageTitle}>Messages</Text>
        <TouchableOpacity style={styles.newChatBtn} onPress={() => setShowCreateModal(true)}>
          <Text style={styles.newChatBtnText}>+ New Chat</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={rooms}
        keyExtractor={item => item.roomId || item._id || item.id}
        renderItem={({ item }) => {
          const otherUser = item.participants?.find(p => String(p.userId) !== String(sellerId));
          const roomName = otherUser?.name || "Admin";
          const subtitleStr = typeof item.lastMessage === 'string' ? item.lastMessage : (item.lastMessage?.message || item.title || "No messages yet");
          return (
          <TouchableOpacity style={styles.roomItem} onPress={() => selectRoom(item)}>
            <View style={styles.roomIcon}>
              <Text style={{ color: '#fff', fontFamily: 'msemibold', fontSize: 18 }}>{roomName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.roomName}>{roomName}</Text>
              <Text style={styles.roomLastMsg} numberOfLines={1}>
                {subtitleStr}
              </Text>
            </View>
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={{ color: '#fff', fontSize: 10 }}>{item.unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 50, color: '#999' }}>No chats found.</Text>}
      />

      <Modal visible={showCreateModal} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Start New Chat</Text>
            
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 15 }}>
              <TouchableOpacity 
                style={[styles.typeBtn, chatType === 'GENERAL' && styles.typeBtnActive]} 
                onPress={() => { setChatType('GENERAL'); setContextIdInput(''); }}
              >
                <Text style={[styles.typeBtnText, chatType === 'GENERAL' && {color: '#fff'}, {fontSize: 12}]}>General</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.typeBtn, chatType === 'PRODUCT' && styles.typeBtnActive]} 
                onPress={() => { setChatType('PRODUCT'); setContextIdInput(''); }}
              >
                <Text style={[styles.typeBtnText, chatType === 'PRODUCT' && {color: '#fff'}, {fontSize: 12}]}>Product</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.typeBtn, chatType === 'ORDER' && styles.typeBtnActive]} 
                onPress={() => { setChatType('ORDER'); setContextIdInput(''); }}
              >
                <Text style={[styles.typeBtnText, chatType === 'ORDER' && {color: '#fff'}, {fontSize: 12}]}>Order</Text>
              </TouchableOpacity>
            </View>

            {(chatType === "PRODUCT" || chatType === "ORDER") && (
              <View style={{ width: '100%', height: 250, marginBottom: 15 }}>
                {loadingContext ? (
                  <ActivityIndicator size="small" color="#024A63" style={{ marginTop: 20 }}/>
                ) : (
                  <FlatList
                    data={chatType === 'PRODUCT' ? productsList : ordersList}
                    keyExtractor={item => String(chatType === 'PRODUCT' ? item.id : item.order_uid)}
                    renderItem={({ item }) => {
                      const id = chatType === 'PRODUCT' ? item.id : item.order_uid;
                      const name = chatType === 'PRODUCT' ? item.name : item.buyer_name || 'Customer';
                      const isSelected = contextIdInput === id;
                      const imgStr = item.main_image_url || item.image;
                      const imageSource = imgStr ? { uri: chatType === 'PRODUCT' ? getImageUrl(imgStr, 'icon') : getImageUrl(imgStr, 'icon') } : null; // fallback or placeholder logic handled in getImageUrl usually
                      return (
                        <TouchableOpacity 
                          style={[styles.contextItem, isSelected && { backgroundColor: '#E8F5E9', borderColor: '#4CAF50' }]} 
                          onPress={() => setContextIdInput(id)}
                        >
                          {imageSource ? (
                            <Image source={imageSource} style={{ width: 40, height: 40, borderRadius: 6, marginRight: 10, backgroundColor: '#eee' }} />
                          ) : (
                            <View style={{ width: 40, height: 40, borderRadius: 6, marginRight: 10, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' }}>
                                <Ionicons name="image-outline" size={20} color="#999" />
                            </View>
                          )}
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontFamily: 'msemibold', color: '#333' }} numberOfLines={1}>{name}</Text>
                            <Text style={{ fontSize: 12, color: '#666' }}>ID: {id}</Text>
                          </View>
                        </TouchableOpacity>
                      )
                    }}
                    ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#999', marginTop: 20 }}>No items found</Text>}
                  />
                )}
              </View>
            )}

            <View style={{ flexDirection: 'row', gap: 10, width: '100%', marginTop: chatType === 'GENERAL' ? 20 : 0 }}>
              <TouchableOpacity style={[styles.closeBtn, { backgroundColor: '#ccc', flex: 1 }]} onPress={() => { setShowCreateModal(false); setChatType(''); setContextIdInput(''); }}>
                <Text style={{ color: '#000', fontFamily: 'msemibold', textAlign: 'center' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.closeBtn, { flex: 1, opacity: (!chatType || (chatType !== 'GENERAL' && !contextIdInput)) ? 0.5 : 1 }]} onPress={createRoom} disabled={!chatType || (chatType !== 'GENERAL' && !contextIdInput)}>
                <Text style={{ color: '#fff', fontFamily: 'msemibold', textAlign: 'center' }}>Start Chat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  pageTitle: {
    fontSize: 22,
    fontFamily: 'mbold',
    color: '#36234E'
  },
  newChatBtn: {
    backgroundColor: '#024A63',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6
  },
  newChatBtnText: {
    color: '#fff',
    fontFamily: 'msemibold',
    fontSize: 14
  },
  roomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 12,
    marginTop: 10,
    borderRadius: 8,
  },
  roomIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#36234E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  roomName: {
    fontSize: 16,
    fontFamily: 'mbold',
    color: '#333'
  },
  roomLastMsg: {
    fontSize: 14,
    color: '#777',
    marginTop: 2
  },
  unreadBadge: {
    backgroundColor: 'red',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'mbold',
    marginLeft: 10
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
    alignItems: 'center'
  },
  input: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10
  },
  attachBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5
  },
  sendBtn: {
    backgroundColor: '#024A63',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#024A63',
    borderBottomRightRadius: 0
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0E0E0',
    borderBottomLeftRadius: 0
  },
  messageText: {
    fontSize: 15,
    color: '#000'
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '90%',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    maxHeight: '80%'
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'mbold',
    marginBottom: 15
  },
  closeBtn: {
    backgroundColor: '#36234E',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#024A63',
    borderRadius: 6,
    alignItems: 'center'
  },
  typeBtnActive: {
    backgroundColor: '#024A63',
  },
  typeBtnText: {
    color: '#024A63',
    fontFamily: 'msemibold'
  },
  contextItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center'
  }
});
