import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const DUMMY_DATA = [
  { id: '1', name: 'Craft Delhi Store', status: 'Online', type: 'chat' },
  { id: '2', name: 'ABC Store', status: 'Active 32 minutes ago', type: 'chat' },
  { id: '3', name: 'Apple Store', status: 'Online', type: 'order' },
  { id: '4', name: 'Baniya Store', status: 'Active 32 minutes ago', type: 'order' },
  { id: '5', name: 'Mega Mart', status: 'Online', type: 'chat' },
  { id: '6', name: 'Quick Grocery', status: 'Offline', type: 'order' },
  { id: '7', name: 'Fashion Corner', status: 'Online', type: 'chat' },
  { id: '8', name: 'Techies Hub', status: 'Active 1 hour ago', type: 'chat' },
  { id: '9', name: 'Budget Bazaar', status: 'Online', type: 'order' },
  { id: '10', name: 'Nuts & More', status: 'Online', type: 'chat' },
];

const Chat = () => {
  const [selectedTab, setSelectedTab] = useState('chat');
  const [searchText, setSearchText] = useState('');

  const filteredData = DUMMY_DATA.filter(
    (item) =>
      item.type === selectedTab &&
      item.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderItem = ({ item }) => (
  <View>
    <TouchableOpacity style={styles.chatItem} onPress={() => router.push({ pathname: '/Chatscreen', params: { id: item.id, name: item.name } })}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name.substring(0, 3).toUpperCase()}</Text>
      </View>
      <View style={styles.chatDetails}>
        <Text style={styles.storeName}>{item.name}</Text>
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
    </TouchableOpacity>
    <View style={styles.divider} />
  </View>
);


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>My Chats</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'chat' && styles.activeTab]}
          onPress={() => setSelectedTab('chat')}
        >
          <Text style={selectedTab === 'chat' ? styles.activeTabText : styles.tabText}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'order' && styles.activeTab]}
          onPress={() => setSelectedTab('order')}
        >
          <Text style={selectedTab === 'order' ? styles.activeTabText : styles.tabText}>Order Chat</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar with Icon */}
      <View style={styles.searchWrapper}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchBar}
          placeholder="Search"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Chat List */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.chatList}
      />
    </SafeAreaView>
  );
};

export default Chat;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    borderBottomWidth: 0.2,
    borderColor: 'gray',
    paddingBottom: 10,
    paddingTop: 10,
  },
  headerText: {
    fontFamily: 'mbold',
    textAlign: 'center',
    fontSize: 16,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#ECF0FF',
  },
  activeTab: {
    backgroundColor: '#EE6F69',
  },
  tabText: {
    fontSize: 15,
    color: '#444',
    fontFamily: 'mbold',
  },
  activeTabText: {
    fontSize: 15,
    color: 'white',
    fontFamily: 'mbold',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 10,
    backgroundColor: 'white',
  },
  searchIcon: {
    marginRight: 5,
  },
  searchBar: {
    flex: 1,
    height: 40,
  },
  chatList: {
    marginTop: 10,
    paddingHorizontal: 20,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding:10,
    marginTop:10
  },
  avatar: {
    backgroundColor: '#ff8c8c',
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
  },
  chatDetails: {
    flex: 1,
  },
  storeName: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  statusText: {
    color: 'gray',
    fontSize: 12,
    fontFamily:'msemibold',marginTop:5
  },
  divider:{
    height: 1,
    backgroundColor: '#ddd',
  }
});
