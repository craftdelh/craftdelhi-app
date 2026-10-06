import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import * as Animatable from 'react-native-animatable';
import { useVideoPlayer, VideoView } from 'expo-video';
import Circle from '../../assets/images/circle.svg';
import Skeleton from '../Skeleton';

const { width: screenWidth } = Dimensions.get('window');

// Image parsing utilities
const SIZE_ORDER = {
  icon: ["icon", "thumbnail", "full"],
  thumbnail: ["thumbnail", "full", "icon"],
  full: ["full", "thumbnail", "icon"],
};

const parseImage = (image) => {
  if (typeof image !== "string") return image;
  const value = image.trim();
  if (!value || value === "[object Object]") return null;
  if ((value.startsWith("{") && value.endsWith("}")) ||
      (value.startsWith("[") && value.endsWith("]"))) {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
};

const getImageUrl = (image, preferredSize = "thumbnail", fallback = "") => {
  const parsed = parseImage(image);
  if (typeof parsed === "string") return parsed;
  if (Array.isArray(parsed)) {
    return getImageUrl(parsed[0], preferredSize, fallback);
  }
  if (!parsed || typeof parsed !== "object") return fallback;

  const keys = [
    ...(SIZE_ORDER[preferredSize] || SIZE_ORDER.thumbnail),
    "original",
    "original_url",
    "image_url",
    "url",
    "src",
    "path",
  ];
  for (const key of keys) {
    if (parsed[key]) {
      const resolved = getImageUrl(parsed[key], preferredSize);
      if (resolved) return resolved;
    }
  }
  return fallback;
};

// Video component to handle hooks
const DynamicVideo = ({ url }) => {
  const player = useVideoPlayer(url, player => {
    player.loop = true;
    player.play();
  });
  return <VideoView style={styles.mediaElement} player={player} allowsFullscreen allowsPictureInPicture />;
};

const Feature = ({ onExploreMore }) => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await axios.get(`${process.env.EXPO_PUBLIC_BASE_URL}admin/getbanner`);
      if (res.data?.success) {
        setBanners(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching banners:", err);
    }
  };

  useEffect(() => {
    if (!banners.length) return;
    const currentBanner = banners[currentIndex];
    
    // Switch every 4 seconds for images
    if (currentBanner?.type === 'video') return;

    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4000);

    return () => clearTimeout(timer);
  }, [banners, currentIndex]);

  if (banners.length === 0) {
    return (
      <View style={styles.container}>
        <View style={[styles.bannerCard, { height: 350, backgroundColor: '#F5F6FA', justifyContent: 'center' }]}>
           <Skeleton width="60%" height={28} style={{ marginBottom: 12, marginTop: 20 }} />
           <Skeleton width="80%" height={16} style={{ marginBottom: 8 }} />
           <Skeleton width="70%" height={16} style={{ marginBottom: 20 }} />
           <Skeleton width={120} height={40} borderRadius={8} style={{ marginBottom: 20 }} />
           <Skeleton width="100%" height={180} borderRadius={12} />
        </View>
      </View>
    );
  }

  const currentBanner = banners[currentIndex];
  let mediaUrl = getImageUrl(currentBanner?.banner, "full");
  if (mediaUrl && typeof mediaUrl === 'string' && !mediaUrl.startsWith("http")) {
     mediaUrl = `https://backend.craftdelhi.com/${mediaUrl.startsWith("/") ? mediaUrl.slice(1) : mediaUrl}`;
  }

  return (
    <View style={styles.container}>
      <View style={styles.bannerCard}>
        {/* Background graphic */}
        <View style={styles.circleContainer}>
           <Circle width={120} height={120} />
        </View>

        {/* Content */}
        <Animatable.View animation="fadeInUp" duration={600} key={`text-${currentBanner.id || currentIndex}`} style={styles.content}>
          <Text style={styles.heading}>{currentBanner?.title || "Featured Handmade Gifts"}</Text>
          <Text style={styles.subtitle}>
            Discover beautiful handcrafted gifts curated specially for you.
          </Text>

          <TouchableOpacity style={styles.button} onPress={onExploreMore}>
            <Text style={styles.buttonText}>Explore More</Text>
          </TouchableOpacity>
        </Animatable.View>

        {/* Media (Image or Video) */}
        <Animatable.View animation="fadeIn" duration={800} key={`media-${currentBanner.banner || currentIndex}`} style={styles.mediaContainer}>
          {currentBanner?.type === 'video' && mediaUrl ? (
            <DynamicVideo url={mediaUrl} />
          ) : (
            <Image source={{ uri: mediaUrl || "https://placehold.co/400" }} style={styles.mediaElement} />
          )}
        </Animatable.View>
      </View>
    </View>
  );
};

export default Feature;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  bannerCard: {
    width: '100%',
    backgroundColor: '#EE6F69',
    borderRadius: 20,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
  },
  circleContainer: {
    position: 'absolute',
    bottom: -20,
    right: -20,
    opacity: 0.2,
    zIndex: 0,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    zIndex: 1,
    marginBottom: 20,
  },
  heading: {
    fontSize: 22,
    fontFamily: 'mbold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'mmedium',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#FFC700',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#000',
    fontFamily: 'mbold',
    fontSize: 14,
  },
  mediaContainer: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    zIndex: 1,
    borderColor: '#FFC700',
    borderWidth: 4,
  },
  mediaElement: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
