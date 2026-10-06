import { StyleSheet, View, FlatList, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const ReelItem = ({ url, isActive }) => {
  const player = useVideoPlayer(url, player => {
    player.loop = true;
  });

  useEffect(() => {
    if (isActive) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, player]);

  return (
    <View style={styles.reelContainer}>
      <ActivityIndicator size="large" color="#EE6F69" style={{ position: 'absolute' }} />
      <VideoView
        style={styles.video}
        player={player}
        allowsFullscreen={false}
        allowsPictureInPicture={false}
        nativeControls={false}
      />
    </View>
  );
};

const ReelsPlayer = () => {
  const { videos, initialIndex } = useLocalSearchParams();
  const [videoList, setVideoList] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (videos) {
      try {
        const parsed = JSON.parse(videos);
        setVideoList(parsed);
        if (initialIndex) {
           setActiveIndex(Number(initialIndex));
        }
      } catch (e) {
        console.error("Failed to parse videos:", e);
      }
    }
  }, [videos, initialIndex]);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
  });

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  });

  const getItemLayout = (data, index) => ({
    length: height,
    offset: height * index,
    index,
  });

  if (videoList.length === 0) return null;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <FlatList
        data={videoList}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <ReelItem url={item} isActive={index === activeIndex} />
        )}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={viewabilityConfig.current}
        initialScrollIndex={Number(initialIndex) || 0}
        getItemLayout={getItemLayout}
        removeClippedSubviews={true}
        windowSize={5}
        maxToRenderPerBatch={2}
        initialNumToRender={2}
      />
      
      <SafeAreaView style={styles.backButtonSafeArea} edges={['top']}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

export default ReelsPlayer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  reelContainer: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  backButtonSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    padding: 20,
  },
});
