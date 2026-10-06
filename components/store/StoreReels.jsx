import { StyleSheet, Text, View, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import React from 'react';
import { router } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';

const { width } = Dimensions.get('window');

const VideoItem = ({ url }) => {
  const player = useVideoPlayer(url, player => {
    player.loop = true;
  });

  return (
    <View style={styles.videoContainer}>
      <VideoView
        style={styles.video}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
      />
    </View>
  );
};

const StoreReels = ({ media }) => {
  const allVideos = [...(media?.reels || []), ...(media?.videos || [])];

  if (!allVideos || allVideos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No reels available for this store yet.</Text>
      </View>
    );
  }

  const renderItem = ({ item, index }) => {
    const url = typeof item === 'string' && !item.startsWith('http') 
      ? `https://backend.craftdelhi.com/backend/${item.startsWith('/') ? item.slice(1) : item}` 
      : item;

    // Resolve all URLs to pass to the player
    const allResolvedUrls = allVideos.map(v => 
      typeof v === 'string' && !v.startsWith('http') 
        ? `https://backend.craftdelhi.com/backend/${v.startsWith('/') ? v.slice(1) : v}` 
        : v
    );

    return (
      <TouchableOpacity 
        activeOpacity={0.8}
        onPress={() => {
          router.push({
            pathname: '/ReelsPlayer',
            params: {
              videos: JSON.stringify(allResolvedUrls),
              initialIndex: index
            }
          });
        }}
      >
        <VideoItem url={url} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ padding: 10, paddingBottom: 50 }}>
      <FlatList
        data={allVideos}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        numColumns={3}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default StoreReels;

const styles = StyleSheet.create({
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'mmedium',
    color: '#999',
  },
  videoContainer: {
    width: width / 3 - 10,
    height: 180,
    margin: 3,
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
  }
});
