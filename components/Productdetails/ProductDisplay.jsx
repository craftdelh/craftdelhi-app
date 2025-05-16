import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Video } from 'expo-av';
import { EvilIcons, FontAwesome } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const ProductDisplay = ({ title, price, image, thumbnails, orders, rating,oldPrice,description }) => {
  const [selected, setSelected] = useState({ type: 'image', uri: image });
  const handleSelect = (item) => {
    setSelected(item);
  };

  const renderMainMedia = () => {
    if (selected.type === 'video') {
      return (
        <Video
          source={{ uri: selected.uri }}
          style={styles.mainMedia}
          resizeMode="contain"
          useNativeControls
          shouldPlay
        />
      );
    }
    return (
      <Image
        source={{ uri: selected.uri }}
        style={styles.mainMedia}
        resizeMode="contain"
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Main image/video */}
      {renderMainMedia()}

      {/* Horizontal thumbnails */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailScroll}>
        {[{ type: 'image', uri: image }, ...thumbnails].map((item, index) => (
          <TouchableOpacity key={index} onPress={() => handleSelect(item)}>
            {item.type === 'video' ? (
              <View style={styles.videoThumb}>
                <Video
                  source={{ uri: item.uri }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                  isMuted
                />
                <View style={styles.playOverlay}>
                  <Text style={styles.playText}>▶</Text>
                </View>
              </View>
            ) : (
              <Image source={{ uri: item.uri }} style={styles.thumbnail} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Product Info */}
      <Text style={styles.price}>
  Price {price}{' '}
  <Text style={styles.oldPrice}>{oldPrice}</Text>
</Text>

      <Text style={styles.title}>{title}</Text>
     <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
         <Text style={styles.subText}>
        ({orders}) Orders Sold | <Text style={styles.rating}>{rating} Ratings</Text>
      </Text>
      <View style={{flexDirection:'row',alignItems:'center',gap:10}}>
           <TouchableOpacity>
             <FontAwesome name="heart-o" size={24} color="#EE6F69" />
           </TouchableOpacity>
            <TouchableOpacity>
                <EvilIcons name="share-google" size={30} color="black" />
            </TouchableOpacity>
      </View>
     </View>
     <Text style={styles.description}>{description}</Text>
    </View>
  );
};

export default ProductDisplay;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  oldPrice: {
  textDecorationLine: 'line-through',
  color: 'gray',
  fontSize: 15,
  marginLeft: 6,
},

  mainMedia: {
    width: '100%',
    height: width * 0.8,
    borderRadius: 10,
    backgroundColor: 'white',
    borderWidth:1,
    borderColor:'#eee'
  },
  thumbnailScroll: {
    marginVertical: 10,
  },
  thumbnail: {
    width: 100,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  videoThumb: {
    position: 'relative',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 100,
    height: 80,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  playText: {
    color: '#fff',
    fontSize: 20,
  },
  price: {
    fontFamily: 'mbold',
    fontSize: 14,
    marginTop: 10,
  },
  title: {
    fontSize: 18,
    color: '#333',
    marginVertical: 5,
    fontFamily:'mbold'
  },
  description:{
    fontSize: 14,
    color: '#666',
    marginTop:10,
    fontFamily:'msemibold'
  },
  subText: {
    fontSize: 12,
    color: '#666',
  },
  rating: {
    color: '#28B463',
    fontWeight: '600',
  },
});
