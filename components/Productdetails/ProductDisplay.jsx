import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Share,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { FontAwesome, Feather, Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { addToWishlist, removeFromWishlist } from '../../redux/WishListReducer';
import ImageViewing from "react-native-image-viewing";

const MainVideoPlayer = ({ uri, style }) => {
  const player = useVideoPlayer(uri, player => {
    player.loop = true;
    player.play();
  });
  return <VideoView style={style} player={player} allowsFullscreen allowsPictureInPicture />;
};

const ThumbVideoPlayer = ({ uri, style }) => {
  const player = useVideoPlayer(uri, player => {
    player.loop = true;
    player.muted = true;
  });
  return <VideoView style={style} player={player} />;
};

const { width } = Dimensions.get('window');

const ProductDisplay = ({ item, product, thumbnails }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const wishlist = useSelector((state) => state.wishlist.wishlist);
  const [selected, setSelected] = useState({ type: 'image', uri: item.image });
  
  const handleSelect = (mediaItem) => {
    setSelected(mediaItem);
  };
  
  const [toastMessage, setToastMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);

  const allMedia = [{ type: 'image', uri: item.image }, ...(thumbnails || [])];
  const imagesForViewer = allMedia.filter(t => t.type === 'image').map(t => ({ uri: t.uri }));
  const initialIndex = imagesForViewer.findIndex(t => t.uri === selected.uri);

  const dispatch = useDispatch();

  const handleBookmark = () => {
    setIsWishlisted(!isWishlisted);
    if (!isWishlisted) {
      dispatch(addToWishlist(item));
      setToastMessage('Item added to Wishlist successfully !');
    } else {
      dispatch(removeFromWishlist(item));
      setToastMessage('Item removed from Wishlist successfully !');
    }

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setToastMessage('');
    }, 2000);
  };

  const handleShare = async () => {
    try {
      const slug = product?.product_sku || product?.slug || product?.id;
      const url = `https://craftdelhi.com/products/getbyslug/${slug}`;
      await Share.share({
        message: `Check out ${item.title} on Craft Delhi!\n${url}`,
        url: url,
        title: item.title
      });
    } catch (error) {
      console.log('Error sharing product:', error.message);
    }
  };

  useEffect(() => {
    setIsWishlisted(wishlist.some(w => w.id === item.id));
  }, [wishlist]);

  const renderMainMedia = () => {
    if (selected.type === 'video') {
      return (
        <View style={styles.mainMediaWrapper}>
          <MainVideoPlayer uri={selected.uri} style={styles.mainMedia} />
        </View>
      );
    }
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={() => setIsImageViewerVisible(true)} style={styles.mainMediaWrapper}>
        <Image
          source={{ uri: selected.uri }}
          style={styles.mainMedia}
          resizeMode="contain"
        />
        <View style={styles.zoomHint}>
          <Feather name="maximize-2" size={12} color="white" style={{ marginRight: 4 }} />
          <Text style={styles.zoomText}>Click to enlarge</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const isInStock = product?.stock && product?.stock > 0;

  return (
    <View style={styles.cardContainer}>
      {/* Main image/video */}
      {renderMainMedia()}

      {/* Horizontal thumbnails */}
      <View style={styles.thumbnailContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailScroll}>
          {allMedia.map((mediaItem, index) => {
            const isActive = selected.uri === mediaItem.uri;
            return (
              <TouchableOpacity 
                key={index} 
                onPress={() => handleSelect(mediaItem)}
                style={[styles.thumbWrapper, isActive && styles.activeThumb]}
              >
                {mediaItem.type === 'video' ? (
                  <View style={styles.videoThumb}>
                    <ThumbVideoPlayer uri={mediaItem.uri} style={styles.thumbnail} />
                    <View style={styles.playOverlay}>
                      <Text style={styles.playText}>VIDEO</Text>
                    </View>
                  </View>
                ) : (
                  <Image source={{ uri: mediaItem.uri }} style={styles.thumbnail} />
                )}
                {isActive && (
                  <View style={styles.selectedBadge}>
                    <Text style={styles.selectedBadgeText}>Selected</Text>
                  </View>
                )}
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>

      {/* Product Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
        
        <View style={styles.metaRow}>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons 
                key={star} 
                name={item.rating >= star ? "star" : (item.rating >= star - 0.5 ? "star-half" : "star-outline")} 
                size={14} 
                color="#22c55e" 
              />
            ))}
          </View>
          <Text style={styles.reviewText}>{item.rating} ({product?.total_review || 0} Reviews)</Text>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>₹ {item.price}</Text>
          <Text style={styles.availabilityText}>
            Availability: <Text style={{ color: isInStock ? '#456eff' : '#fe0000' }}>{isInStock ? 'In Stock' : 'Out of Stock'}</Text>
          </Text>
        </View>

        {/* Action Row */}
        <View style={styles.actionRow}>
          <TouchableOpacity onPress={handleBookmark} style={styles.iconButton}>
            <FontAwesome name={isWishlisted ? 'heart' : 'heart-o'} size={24} color="#EE6F69" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButtonSmall} onPress={handleShare}>
            <Feather name="share-2" size={20} color="#024a63" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleBookmark} style={styles.wishlistButton}>
          <Text style={styles.wishlistButtonText}>{isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}</Text>
        </TouchableOpacity>
      </View>

      {showSuccess && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      <ImageViewing
        images={imagesForViewer}
        imageIndex={initialIndex >= 0 ? initialIndex : 0}
        visible={isImageViewerVisible}
        onRequestClose={() => setIsImageViewerVisible(false)}
      />

    </View>
  );
};

export default ProductDisplay;

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ecf0ff',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  mainMediaWrapper: {
    width: '100%',
    height: width * 0.85,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ecf0ff',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'white',
  },
  mainMedia: {
    width: '100%',
    height: '100%',
  },
  zoomHint: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  zoomText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  thumbnailContainer: {
    marginTop: 12,
  },
  thumbnailScroll: {
    paddingBottom: 4,
  },
  thumbWrapper: {
    width: 80,
    height: 60,
    borderRadius: 10,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
    position: 'relative',
  },
  activeThumb: {
    borderColor: '#024a63',
    transform: [{ scale: 1.03 }],
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  selectedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#024a63',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  selectedBadgeText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
  },
  videoThumb: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  playOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  playText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  infoContainer: {
    marginTop: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'mbold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#024a63',
    fontWeight: '500',
    marginBottom: 12,
    fontFamily: 'mmedium',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  reviewText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  priceContainer: {
    marginBottom: 16,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ee6f69',
    fontFamily: 'mbold',
  },
  availabilityText: {
    fontSize: 14,
    color: '#949494',
    fontWeight: 'bold',
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconButton: {
    marginRight: 16,
  },
  iconButtonSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8f9fd',
    borderWidth: 1,
    borderColor: '#ecf0ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wishlistButton: {
    backgroundColor: '#d1d5db',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  wishlistButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
  toast: {
    position: 'absolute',
    top: width * 0.4, 
    alignSelf: 'center',
    backgroundColor: '#F0F4FF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
    zIndex: 9999,
  },
  toastText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C2C2C',
    textAlign: 'center',
  },
});
