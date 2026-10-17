import { router } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

import { useUser } from '../../../context/UserContext';

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
  const date = new Date(dateStr);
  const today = new Date();
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
  });
};

const Chat = () => {
  const { user, rooms, setRooms } = useUser();
  const buyerId = user?.id || user?._id || user?.user?.id || user?.data?.id;

  const [selectedTab, setSelectedTab] = useState('chat'); // 'chat' or 'order'
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRooms = useCallback(async () => {
    if (!user?.token) return;
    try {
      const res = await axios.get(`${API_BASE}/rooms`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = res.data?.data || [];
      data.sort((a, b) => new Date(b.lastMessageAt || b.createdAt || 0) - new Date(a.lastMessageAt || a.createdAt || 0));
      setRooms(data);
    } catch (err) {
      console.log('Error fetching buyer rooms:', err.response?.data || err.message);
    }
  }, [user, setRooms]);

  useEffect(() => {
    if (user?.token) {
      fetchRooms();
    }
  }, [user, fetchRooms]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRooms();
    setRefreshing(false);
  }, [fetchRooms]);

  // Filter rooms by tab and search
  const filteredRooms = (rooms || []).filter((room) => {
    const isOrderChat = room.contextType === 'ORDER';
    const matchesTab = selectedTab === 'order' ? isOrderChat : !isOrderChat;

    const otherUser = room.participants?.find((p) => String(p.userId) !== String(buyerId));
    const storeName = (otherUser?.name || room.title || 'Seller').toLowerCase();
    const lastMsg = (room.lastMessage || '').toLowerCase();
    const query = searchText.toLowerCase().trim();

    const matchesSearch = !query || storeName.includes(query) || lastMsg.includes(query);

    return matchesTab && matchesSearch;
  });

  const renderItem = ({ item }) => {
    const otherUser = item.participants?.find((p) => String(p.userId) !== String(buyerId));
    const storeName = otherUser?.name || item.title || 'Seller';
    const roomId = item.roomId || item._id || item.id;
    const timeStr = formatTime(item.lastMessageAt || item.updatedAt || item.createdAt);
    const unread = item.unreadCount || 0;

    return (
      <View>
        <TouchableOpacity
          style={styles.chatItem}
          onPress={() => {
            setRooms((prev) =>
              prev.map((r) => {
                const rId = r.roomId || r._id || r.id;
                if (String(rId) === String(roomId)) {
                  return { ...r, unreadCount: 0 };
                }
                return r;
              })
            );
            router.push({
              pathname: '/Chatscreen',
              params: {
                roomId: roomId,
                name: storeName,
                sellerId: otherUser?.userId || '',
                contextType: item.contextType || 'GENERAL',
              },
            });
          }}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.avatar,
              { backgroundColor: getColorFromName(storeName) },
            ]}
          >
            <Text style={styles.avatarText}>{getInitial(storeName)}</Text>
          </View>

          <View style={styles.chatDetails}>
            <View style={styles.chatRowTop}>
              <Text style={styles.storeName} numberOfLines={1}>
                {storeName}
              </Text>
              {timeStr ? <Text style={styles.timeText}>{timeStr}</Text> : null}
            </View>

            <View style={styles.chatRowBottom}>
              <Text
                style={[
                  styles.lastMessageText,
                  unread > 0 && styles.lastMessageUnread,
                ]}
                numberOfLines={1}
              >
                {item.lastMessage || 'No messages yet'}
              </Text>
              {unread > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unread > 99 ? '99+' : unread}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
        <View style={styles.divider} />
      </View>
    );
  };

  if (!user?.token) {
    return (
      <View style={[styles.container, styles.emptyCenter]}>
        <Ionicons name="chatbubbles-outline" size={64} color="#CBD5E1" />
        <Text style={styles.notLoggedInTitle}>Please Login to Chat</Text>
        <Text style={styles.notLoggedInSub}>
          Login with your buyer account to chat with verified sellers.
        </Text>
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => router.push('/auth/Signin')}
          activeOpacity={0.8}
        >
          <Text style={styles.loginBtnText}>Login Now</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>My Chats</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'chat' && styles.activeTab]}
          onPress={() => setSelectedTab('chat')}
        >
          <Text style={selectedTab === 'chat' ? styles.activeTabText : styles.tabText}>
            General Chat
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'order' && styles.activeTab]}
          onPress={() => setSelectedTab('order')}
        >
          <Text style={selectedTab === 'order' ? styles.activeTabText : styles.tabText}>
            Order Chat
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchBar}
          placeholder="Search by store or message..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
          autoCorrect={false}
          autoCapitalize="none"
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Ionicons name="close-circle" size={18} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Chat List */}
      <FlatList
        data={filteredRooms}
        keyExtractor={(item, index) => item._id || item.roomId || String(index)}
        renderItem={renderItem}
        contentContainerStyle={styles.chatList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#024A63']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbox-ellipses-outline" size={52} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptySubtitle}>
              {selectedTab === 'order'
                ? 'Your order-specific messages with sellers will appear here.'
                : 'Browse products and tap "Chat with seller" to start a conversation.'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default Chat;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
  },
  headerText: {
    fontFamily: 'mbold',
    textAlign: 'center',
    fontSize: 18,
    color: '#0F172A',
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 3,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#024A63',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: 'mbold',
  },
  activeTabText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontFamily: 'mbold',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchBar: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  chatList: {
    paddingVertical: 8,
    flexGrow: 1,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },
  chatDetails: {
    flex: 1,
  },
  chatRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  storeName: {
    fontWeight: '700',
    fontSize: 15,
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  chatRowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessageText: {
    color: '#64748B',
    fontSize: 13,
    flex: 1,
    marginRight: 8,
  },
  lastMessageUnread: {
    color: '#0F172A',
    fontWeight: '700',
  },
  badge: {
    backgroundColor: '#EE6F69',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 76,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 30,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#475569',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
  emptyCenter: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  notLoggedInTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  notLoggedInSub: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  loginBtn: {
    marginTop: 10,
    backgroundColor: '#024A63',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
