import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, Image, Modal, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { io } from 'socket.io-client';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { getImageUrl } from '../../../utils/imageUrl';

const API_BASE = "https://backend.craftdelhi.com/chat";
const APP_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

export default function MessagesScreen() {
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const socketRef = useRef(null);
  const [sellerId, setSellerId] = useState(null);
  const [tokenStr, setTokenStr] = useState("");
  
  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [chatType, setChatType] = useState("");
  const [contextIdInput, setContextIdInput] = useState("");
  const [productsList, setProductsList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [loadingContext, setLoadingContext] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    initChat();
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

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
      const res = await axios.get(`${APP_BASE_URL}order/recentorders`, {
        headers: { Authorization: `Bearer ${tokenStr}` }
      });
      setOrdersList(res.data?.data || []);
    } catch (e) { console.error(e); }
    setLoadingContext(false);
  };

  const initChat = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const parsed = JSON.parse(userData);
      const token = parsed?.token;
      setTokenStr(token);
      
      const sId = await AsyncStorage.getItem('craftdelhiseller_id');
      setSellerId(sId || parsed?.user?.id);

      if (!token) return;

      socketRef.current = io(API_BASE, {
        auth: { token: `Bearer ${token}` },
        transports: ['websocket'],
      });

      socketRef.current.on("connect", () => console.log("Socket connected!"));
      
      socketRef.current.on("message", (msg) => {
        setMessages(prev => [...prev, msg]);
      });

      fetchRooms(token);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRooms = async (token) => {
    try {
      const res = await axios.get(`${API_BASE}/rooms`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data?.data || [];
      setRooms(data);
      if (data.length > 0) {
        socketRef.current?.emit("join_rooms", data.map(r => r.roomId || r._id || r.id));
      }
    } catch (err) {
      console.error("Rooms fetch error", err);
    } finally {
      setLoadingRooms(false);
    }
  };

  const selectRoom = (room) => {
    const id = room.roomId || room._id || room.id;
    setSelectedRoomId(id);
    setMessages(room.messages || []); 
    socketRef.current?.emit("mark_read", { roomId: id, type: 'SELLER' });
  };

  const sendMessage = () => {
    if (!inputText.trim() || !selectedRoomId) return;
    const msgData = {
      roomId: selectedRoomId,
      senderType: 'SELLER',
      senderId: sellerId,
      message: inputText,
      attachmentUrl: "",
    };
    socketRef.current?.emit("sendMessage", msgData);
    setMessages(prev => [...prev, { ...msgData, createdAt: new Date().toISOString(), isOptimistic: true }]);
    setInputText("");
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
        headers: { Authorization: `Bearer ${tokenStr}` }
      });
      
      const newRoom = res.data;
      if (newRoom && (newRoom.roomId || newRoom._id)) {
        setShowCreateModal(false);
        setChatType("");
        setContextIdInput("");
        fetchRooms(tokenStr); 
        selectRoom(newRoom);
        Toast.show({ type: 'success', text1: 'Chat created successfully!' });
      }
    } catch (err) {
      console.error(err);
      Toast.show({ type: 'error', text1: 'Failed to create chat' });
    }
  };

  if (loadingRooms) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#024A63" />
      </View>
    );
  }

  if (selectedRoomId) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedRoomId(null)} style={{ padding: 10 }}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chat with Admin</Text>
        </View>

        <FlatList
          data={messages}
          keyExtractor={(item, idx) => item._id || String(idx)}
          onContentSizeChange={(w, h) => { flatListRef.current?.scrollToEnd({ animated: true }); }}
          onLayout={() => { flatListRef.current?.scrollToEnd({ animated: true }); }}
          ref={flatListRef}
          renderItem={({ item }) => {
            const isMe = item.senderType === 'SELLER';
            return (
              <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.otherMessage]}>
                <Text style={[styles.messageText, isMe && { color: '#fff' }]}>{item.message}</Text>
              </View>
            );
          }}
          contentContainerStyle={{ padding: 16 }}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Ionicons name="send" size={20} color="#fff" />
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
