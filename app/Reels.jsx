import React, { useRef, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import { Video } from 'expo-av';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { height } = Dimensions.get('window');

const dummyReels = [
  { id: '1', video: require('../assets/images/v0.mp4'), likes: 123 },
  { id: '4', video: require('../assets/images/v4.mp4'), likes: 456 },
  { id: '2', video: require('../assets/images/v1.mp4'), likes: 789 },
  { id: '3', video: require('../assets/images/v2.mp4'), likes: 321 },
];


const Reels = () => {
  const navigation = useNavigation();
  const videoRefs = useRef({});
  const [likedReels, setLikedReels] = useState({});
  const [loadingStates, setLoadingStates] = useState({});
  const currentPlayingId = useRef(null);

  const stopAllVideos = async () => {
    for (const key in videoRefs.current) {
      const video = videoRefs.current[key];
      if (video) {
        try {
          await video.stopAsync();
        } catch (err) {
          console.log('Error stopping video:', err);
        }
      }
    }
  };

  const playVideoById = async (id) => {
    const video = videoRefs.current[id];
    if (video) {
      try {
        await video.playAsync();
        currentPlayingId.current = id;
      } catch (err) {
        console.log('Error playing video:', err);
      }
    }
  };

  const onViewRef = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const newId = viewableItems[0].item.id;

      if (currentPlayingId.current !== newId) {
        stopAllVideos().then(() => playVideoById(newId));
      }
    }
  });

  const viewConfigRef = useRef({
    viewAreaCoveragePercentThreshold: 80,
  });

  const toggleLike = (id) => {
    setLikedReels((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const renderItem = ({ item }) => (
    <View style={styles.reelContainer}>
      <Video
        ref={(ref) => {
          if (ref) videoRefs.current[item.id] = ref;
        }}
        source={item.video}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        isLooping
        isMuted={false}
        shouldPlay={false}
        onLoadStart={() =>
          setLoadingStates((prev) => ({ ...prev, [item.id]: true }))
        }
        onReadyForDisplay={() =>
          setLoadingStates((prev) => ({ ...prev, [item.id]: false }))
        }
      />

      {loadingStates[item.id] && (
        <ActivityIndicator
          size="large"
          color="white"
          style={styles.loadingSpinner}
        />
      )}

     <View style={styles.overlay}>
  <TouchableOpacity
    style={styles.iconButton}
    onPress={() => toggleLike(item.id)}
  >
    <AntDesign
      name={likedReels[item.id] ? 'heart' : 'hearto'}
      size={28}
      color={likedReels[item.id] ? 'red' : 'white'}
    />
  </TouchableOpacity>
  <Text style={styles.likesText}>
    {likedReels[item.id] ? item.likes + 1 : item.likes}
  </Text>

  <TouchableOpacity style={styles.iconButton}>
    <AntDesign name="sharealt" size={28} color="white" />
  </TouchableOpacity>
</View>

    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntDesign name="arrowleft" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reels</Text>
      </View>

      <FlatList
        data={dummyReels}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={viewConfigRef.current}
        windowSize={3}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        removeClippedSubviews
      />
    </View>
  );
};

export default Reels;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  reelContainer: {
    height,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    alignItems: 'center',
  },
  iconButton: {
    marginVertical: 10,
    marginTop:20
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    marginLeft: 15,
    fontWeight: 'bold',
  },
  loadingSpinner: {
    position: 'absolute',
    alignSelf: 'center',
    top: '45%',
  },
  likesText: {
  color: 'white',
  fontSize: 16,
  marginTop: 5,
  textAlign: 'center',
},

});
