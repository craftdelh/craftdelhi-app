import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Upload from '../assets/images/upload.svg';
import * as ImagePicker from 'expo-image-picker';

const Chatscreen = () => {
  const { id, name } = useLocalSearchParams();
  const [selectedTab, setSelectedTab] = useState('chat');
  const [messages, setMessages] = useState([
    { id: '1', text: 'Hi there!', sender: 'other' },
    { id: '2', text: 'Hello! How can I help you?', sender: 'me' },
  ]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const flatListRef = useRef(null);

  const handleUploadPress = () => {
    Alert.alert('Upload', 'Choose an option', [
      {
        text: 'Take Picture',
        onPress: async () => {
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
          });
          if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
          }
        },
      },
      {
        text: 'Choose from Gallery',
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
          });
          if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const sendMessage = () => {
    if (!input.trim() && !selectedImage) return;

    const newMessage = {
      id: Date.now().toString(),
      text: input,
      sender: 'me',
      image: selectedImage,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    setSelectedImage(null);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderItem = ({ item }) => {
    const isMe = item.sender === 'me';
    return (
      <View style={{ flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'center', marginVertical: 8 }}>
        <View style={styles.avatar}>
          <Text style={{ color: 'white' }}>{isMe ? 'M' : name[0]}</Text>
        </View>
        <View style={[styles.messageContainer, isMe ? styles.myMessage : styles.otherMessage]}>
          {item.image && (
            <Image
              source={{ uri: item.image }}
              style={{ width: 200, height: 150, borderRadius: 10, marginBottom: 5 }}
            />
          )}
          {item.text ? <Text style={styles.messageText}>{item.text}</Text> : null}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{name || 'Chat'}</Text>
        <View />
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

      <Text style={{ fontFamily: 'mbold', fontSize: 16, marginTop: 10, padding: 20 }}>Messages</Text>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.chatList}
        />

        {/* Preview Selected Image */}
        {selectedImage && (
          <View style={{ padding: 10, alignItems: 'flex-start' }}>
            <View style={{ position: 'relative' }}>
              <Image
                source={{ uri: selectedImage }}
                style={{ width: 100, height: 100, borderRadius: 10 }}
              />
              <TouchableOpacity
                onPress={() => setSelectedImage(null)}
                style={{
                  position: 'absolute',
                  top: -10,
                  right: -10,
                  backgroundColor: 'red',
                  borderRadius: 12,
                  width: 24,
                  height: 24,
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 1,
                }}
              >
                <Ionicons name="close" size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Input Section */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 10,
            borderTopWidth: 1,
            borderColor: '#ddd',
            backgroundColor: 'white',
          }}
        >
          <TouchableOpacity onPress={handleUploadPress} style={{ marginRight: 10 }}>
            <Upload width={24} height={24} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type a new message here"
            placeholderTextColor="#999"
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
            <Ionicons name="send" size={20} color="black" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Chatscreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    marginRight: 50,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  container: {
    flex: 1,
  },
  chatList: {
    padding: 16,
    paddingBottom: 20,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  messageContainer: {
    maxWidth: '75%',
    padding: 10,
    borderRadius: 8,
  },
  myMessage: {
    borderColor: '#D9D9D9',
    alignSelf: 'flex-end',
    borderWidth: 1,
    backgroundColor: '#f0f0f0',
  },
  otherMessage: {
    borderColor: '#D9D9D9',
    alignSelf: 'flex-start',
    borderWidth: 1,
    backgroundColor: '#e0e0e0',
  },
  messageText: {
    fontSize: 15,
    color: '#333',
  },
  input: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 14,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sendButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
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
});
