import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  SafeAreaView,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import ImageViewing from 'react-native-image-viewing';
import Toast from 'react-native-toast-message';

import { useUser } from '../../context/UserContext';

const API_BASE = process.env.EXPO_PUBLIC_CHAT_API_BASE || 'https://backend.craftdelhi.com/chat';

const getInitial = (name = 'S') => (name ? name.charAt(0).toUpperCase() : 'S');
const getColorFromName = (name = '') => {
  const colors = ['#024A63', '#EE6F69', '#6B5CFF', '#22C55E', '#F59E0B'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const Chatscreen = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { user, socket, setRooms, setActiveRoomId } = useUser();

  const buyerId = user?.id || user?._id || user?.user?.id || user?.data?.id;
  const initialRoomId = params.roomId || null;
  const sellerId = params.sellerId || null;
  const productId = params.productId || null;
  const productName = params.productName || null;
  const productPrice = params.productPrice || null;
  const productImg = params.productImg || null;
  const storeNameParam = params.storeName || params.name || 'Seller';
  const orderId = params.orderId || null;

  const [currentRoomId, setCurrentRoomId] = useState(initialRoomId);
  const [storeName, setStoreName] = useState(storeNameParam);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [viewingImage, setViewingImage] = useState(null);

  const flatListRef = useRef(null);
  const activeRoomRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const autoSentRef = useRef(false);

  useEffect(() => {
    activeRoomRef.current = currentRoomId;
    setActiveRoomId(currentRoomId);
  }, [currentRoomId, setActiveRoomId]);

  // Load existing messages for a room
  const loadMessages = useCallback(
    async (roomId) => {
      if (!roomId || !user?.token) return;
      try {
        const res = await axios.get(
          `${API_BASE}/messages?roomId=${roomId}&page=1&limit=50`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        const list = res.data?.data || [];
        list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        setMessages(list);
      } catch (e) {
        console.error('Failed to load messages for room:', e);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  // Initialize or create room
  useEffect(() => {
    if (!user?.token) {
      Toast.show({
        type: 'info',
        text1: 'Login Required',
        text2: 'Please login to start chatting.',
      });
      router.replace('/auth/Signin');
      return;
    }

    const initRoom = async () => {
      // 1. If roomId already given
      if (initialRoomId) {
        setCurrentRoomId(initialRoomId);
        if (socket?.connected) {
          socket.emit('join_room', { roomId: initialRoomId });
          socket.emit('mark_room_read', { roomId: initialRoomId });
        }
        await loadMessages(initialRoomId);
        return;
      }

      // 2. If opening from Product or Order, create or find room
      if (sellerId || orderId) {
        setLoading(true);
        try {
          let payload;
          if (orderId) {
            payload = { contextType: 'ORDER', contextId: `ORDER_ID_${orderId}` };
          } else {
            payload = {
              contextType: 'GENERAL',
              generalType: 'BUYER_SELLER',
              targetUserId: sellerId,
            };
          }

          const res = await axios.post(`${API_BASE}/createroom`, payload, {
            headers: {
              Authorization: `Bearer ${user.token}`,
              'Content-Type': 'application/json',
            },
          });

          const room = res.data?.data || res.data;
          const rId = room?.roomId || room?._id || room?.id;

          if (rId) {
            setCurrentRoomId(rId);

            // Find other participant's name
            const other = room.participants?.find(
              (p) => String(p.userId) !== String(buyerId)
            );
            if (other?.name) {
              setStoreName(other.name);
            }

            if (socket?.connected) {
              socket.emit('join_room', { roomId: rId });
              socket.emit('mark_room_read', { roomId: rId });
            }

            await loadMessages(rId);

            // Auto-send product inquiry once if product details passed
            if (productName && !autoSentRef.current) {
              autoSentRef.current = true;
              const inquiryText =
                `📢 *Product Inquiry*\n\n` +
                `🛍️ *Product:* ${productName}\n` +
                `💰 *Price:* ₹${productPrice || 'N/A'}`;

              setTimeout(() => {
                sendDirectMessage(rId, inquiryText);
              }, 600);
            }
          }
        } catch (err) {
          console.error('Error creating room from product:', err);
          Toast.show({
            type: 'error',
            text1: 'Chat Error',
            text2: 'Unable to start chat with this seller.',
          });
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    initRoom();
  }, [initialRoomId, sellerId, orderId, user, socket, loadMessages, buyerId, productName, productPrice]);

  // Listen to socket messages & typing indicators
  useEffect(() => {
    if (!socket) return;

    const onMessageReceived = (msg) => {
      if (String(activeRoomRef.current) === String(msg.roomId)) {
        setMessages((prev) => {
          const index = prev.findIndex(
            (m) =>
              (msg._id && m._id === msg._id) ||
              (msg.tempId && m.tempId === msg.tempId)
          );
          if (index !== -1) {
            const updated = [...prev];
            updated[index] = { ...updated[index], ...msg, status: 'sent' };
            return updated;
          }
          return [...prev, msg];
        });

        socket.emit('mark_room_read', { roomId: msg.roomId });

        // Scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    };

    const onUserTyping = ({ userId, roomId, isTyping: typingStatus }) => {
      if (String(userId) === String(buyerId)) return;
      if (String(roomId) === String(activeRoomRef.current)) {
        setIsTyping(typingStatus);
      }
    };

    socket.on('message_received', onMessageReceived);
    socket.on('user_typing', onUserTyping);

    return () => {
      socket.off('message_received', onMessageReceived);
      socket.off('user_typing', onUserTyping);
    };
  }, [socket, buyerId]);

  // Handle typing indicator emission
  const handleInputChange = (text) => {
    setInputText(text);
    if (!socket || !currentRoomId) return;

    socket.emit('typing', { roomId: currentRoomId, isTyping: true });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', { roomId: currentRoomId, isTyping: false });
    }, 2000);
  };

  const sendDirectMessage = async (roomId, text) => {
    if (!text.trim() || !roomId) return;
    const tempId = Date.now().toString() + Math.random().toString(36).substring(7);
    const now = new Date().toISOString();

    const msgPayload = {
      roomId,
      senderId: buyerId,
      message: text.trim(),
      tempId,
      createdAt: now,
      status: 'sending',
    };

    // Optimistic UI update
    setMessages((prev) => [...prev, msgPayload]);

    if (socket?.connected) {
      socket.emit('send_message', {
        roomId,
        senderId: buyerId,
        message: text.trim(),
        tempId,
      });
      socket.emit('typing', { roomId, isTyping: false });
    } else {
      try {
        await axios.post(
          `${API_BASE}/message`,
          { roomId, message: text.trim(), tempId },
          { headers: { Authorization: `Bearer ${user?.token}` } }
        );
      } catch (e) {
        console.error('REST fallback send message error:', e);
      }
    }

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSendMessage = () => {
    if (!inputText.trim() || !currentRoomId) return;
    const text = inputText;
    setInputText('');
    sendDirectMessage(currentRoomId, text);
  };

  // Image upload
  const pickAndSendImage = async () => {
    if (!currentRoomId) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const tempId = 'img-' + Date.now();
      const now = new Date().toISOString();

      setIsSending(true);

      // Optimistic preview
      setMessages((prev) => [
        ...prev,
        {
          roomId: currentRoomId,
          senderId: buyerId,
          message: '',
          filePreview: asset.uri,
          tempId,
          createdAt: now,
          status: 'sending',
        },
      ]);

      try {
        const formData = new FormData();
        formData.append('roomId', currentRoomId);
        formData.append('tempId', tempId);
        formData.append('file', {
          uri: asset.uri,
          name: asset.fileName || `chat_${Date.now()}.jpg`,
          type: asset.mimeType || 'image/jpeg',
        });

        const res = await axios.post(`${API_BASE}/message`, formData, {
          headers: {
            Authorization: `Bearer ${user?.token}`,
            'Content-Type': 'multipart/form-data',
          },
        });

        const serverMsg = res.data?.data || res.data || {};
        const persistentUrl = serverMsg.message || serverMsg.fileUrl || asset.uri;

        if (socket?.connected) {
          socket.emit('send_message', {
            roomId: currentRoomId,
            senderId: buyerId,
            message: persistentUrl,
            fileUrl: persistentUrl,
            tempId,
          });
        }
      } catch (err) {
        console.error('Image upload failed:', err);
        Toast.show({ type: 'error', text1: 'Upload failed' });
      } finally {
        setIsSending(false);
      }
    }
  };

  const renderMessageItem = ({ item }) => {
    const isMe = String(item.senderId) === String(buyerId);
    const mediaUri = item.filePreview || item.fileUrl || (item.message && item.message.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? item.message : null);

    return (
      <View
        style={[
          styles.messageRow,
          isMe ? styles.messageRowMe : styles.messageRowOther,
        ]}
      >
        {!isMe && (
          <View
            style={[
              styles.avatarSmall,
              { backgroundColor: getColorFromName(storeName) },
            ]}
          >
            <Text style={styles.avatarSmallText}>{getInitial(storeName)}</Text>
          </View>
        )}

        <View
          style={[
            styles.bubble,
            isMe ? styles.bubbleMe : styles.bubbleOther,
          ]}
        >
          {mediaUri ? (
            <TouchableOpacity
              onPress={() => setViewingImage(mediaUri)}
              activeOpacity={0.9}
            >
              <Image source={{ uri: mediaUri }} style={styles.chatImage} resizeMode="cover" />
            </TouchableOpacity>
          ) : null}

          {item.message && !mediaUri ? (
            <Text style={[styles.messageText, isMe ? styles.messageTextMe : styles.messageTextOther]}>
              {item.message}
            </Text>
          ) : null}

          <View style={styles.bubbleFooter}>
            <Text style={[styles.timeText, isMe ? styles.timeTextMe : styles.timeTextOther]}>
              {formatTime(item.createdAt)}
            </Text>
            {isMe && (
              <Ionicons
                name={item.status === 'sending' ? 'time-outline' : 'checkmark-done'}
                size={14}
                color={item.status === 'sending' ? 'rgba(255,255,255,0.6)' : '#69D297'}
                style={{ marginLeft: 4 }}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>

        <View
          style={[
            styles.headerAvatar,
            { backgroundColor: getColorFromName(storeName) },
          ]}
        >
          <Text style={styles.headerAvatarText}>{getInitial(storeName)}</Text>
        </View>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerStoreName} numberOfLines={1}>
            {storeName}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isTyping ? 'Typing...' : 'Active now'}
          </Text>
        </View>
      </View>

      {/* Product banner preview if chatting about a specific product */}
      {productName && (
        <View style={styles.productBanner}>
          {productImg ? (
            <Image source={{ uri: productImg }} style={styles.productBannerImg} />
          ) : (
            <View style={[styles.productBannerImg, { backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' }]}>
              <Feather name="box" size={20} color="#718096" />
            </View>
          )}
          <View style={styles.productBannerInfo}>
            <Text style={styles.productBannerTitle} numberOfLines={1}>
              {productName}
            </Text>
            <Text style={styles.productBannerPrice}>
              ₹{Number(productPrice || 0).toLocaleString('en-IN')}
            </Text>
          </View>
        </View>
      )}

      {/* Chat Messages */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#024A63" />
          <Text style={styles.loadingText}>Loading conversation...</Text>
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item, index) => item._id || item.tempId || String(index)}
            renderItem={renderMessageItem}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={48} color="#CBD5E1" />
                <Text style={styles.emptyText}>No messages yet.</Text>
                <Text style={styles.emptySubText}>
                  Send a message to start chatting with {storeName}!
                </Text>
              </View>
            }
          />

          {/* Typing Indicator */}
          {isTyping && (
            <View style={styles.typingWrap}>
              <Text style={styles.typingText}>{storeName} is typing...</Text>
            </View>
          )}

          {/* Input Bar */}
          <View style={styles.inputBar}>
            <TouchableOpacity
              onPress={pickAndSendImage}
              style={styles.attachmentButton}
              disabled={isSending}
            >
              <Feather name="image" size={22} color="#024A63" />
            </TouchableOpacity>

            <TextInput
              style={styles.textInput}
              placeholder="Type your message..."
              placeholderTextColor="#94A3B8"
              value={inputText}
              onChangeText={handleInputChange}
              multiline
            />

            <TouchableOpacity
              onPress={handleSendMessage}
              style={[
                styles.sendButton,
                (!inputText.trim() || isSending) && styles.sendButtonDisabled,
              ]}
              disabled={!inputText.trim() || isSending}
            >
              <Ionicons name="send" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* Image Lightbox */}
      <ImageViewing
        images={viewingImage ? [{ uri: viewingImage }] : []}
        imageIndex={0}
        visible={Boolean(viewingImage)}
        onRequestClose={() => setViewingImage(null)}
      />
    </SafeAreaView>
  );
};

export default Chatscreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
  },
  backButton: {
    marginRight: 10,
    padding: 4,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerStoreName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  productBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 12,
  },
  productBannerImg: {
    width: 44,
    height: 44,
    borderRadius: 6,
  },
  productBannerInfo: {
    flex: 1,
  },
  productBannerTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  productBannerPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#024A63',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    color: '#64748B',
    fontSize: 14,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  emptySubText: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 4,
    alignItems: 'flex-end',
  },
  messageRowMe: {
    justifyContent: 'flex-end',
  },
  messageRowOther: {
    justifyContent: 'flex-start',
  },
  avatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    marginBottom: 4,
  },
  avatarSmallText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  bubbleMe: {
    backgroundColor: '#024A63',
    borderBottomRightRadius: 2,
  },
  bubbleOther: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageTextMe: {
    color: '#FFFFFF',
  },
  messageTextOther: {
    color: '#0F172A',
  },
  chatImage: {
    width: 200,
    height: 150,
    borderRadius: 10,
    marginBottom: 6,
  },
  bubbleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timeText: {
    fontSize: 10,
  },
  timeTextMe: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  timeTextOther: {
    color: '#94A3B8',
  },
  typingWrap: {
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  typingText: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 8,
  },
  attachmentButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    color: '#0F172A',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#024A63',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },
});
