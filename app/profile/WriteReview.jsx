import {
  StyleSheet, Text, View, Image, TextInput,
  TouchableOpacity, ScrollView
} from 'react-native';
import React, { useState } from 'react';
import { AntDesign, Entypo } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const WriteReview = ({ order, onClose }) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [images, setImages] = useState([]);
  const [showOptions, setShowOptions] = useState(false);

  const handleSubmit = () => {
    const review = {
      productId: order?.productId,
      rating,
      reviewText,
      images,
    };
    console.log('Review submitted:', review);
    onClose?.();
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      alert('Permission to access gallery is required!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) {
      setImages(prev => [...prev, result.assets[0].uri]);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== 'granted') {
      alert('Permission to access camera is required!');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
    });
    if (!result.canceled) {
      setImages(prev => [...prev, result.assets[0].uri]);
    }
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Write a Review</Text>
        <TouchableOpacity onPress={onClose}>
          <Entypo name="cross" size={28} color="black" />
        </TouchableOpacity>
      </View>

      {/* Product Info */}
      <View style={styles.productBox}>
        <Image source={{ uri: order?.image }} style={styles.image} />
        <View style={{ flex: 1 }}>
          <Text style={styles.productTitle} numberOfLines={2}>{order?.productTitle}</Text>
          <Text style={styles.price}>{order?.price}</Text>
        </View>
      </View>

      {/* Star Rating */}
      <View style={styles.starscontainer}>
        <Text style={{ fontWeight: '600' }}>Select Stars</Text>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((i) => (
            <TouchableOpacity key={i} onPress={() => setRating(i)}>
              <AntDesign
                name={i <= rating ? 'star' : 'staro'}
                size={28}
                color="#69D297"
                style={styles.starIcon}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Review Input */}
      <TextInput
        style={styles.textarea}
        multiline
        placeholder="Write your review here..."
        value={reviewText}
        onChangeText={setReviewText}
      />

      {/* Attachment Icon */}
      <TouchableOpacity onPress={() => setShowOptions(true)} style={styles.clipIcon}>
        <Entypo name="attachment" size={24} color="black" />
      </TouchableOpacity>

      {/* Upload Options */}
      {showOptions && (
        <View style={styles.optionBox}>
          <TouchableOpacity onPress={() => { pickImage(); setShowOptions(false); }}>
            <Text style={styles.optionText}>Choose from Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { takePhoto(); setShowOptions(false); }}>
            <Text style={styles.optionText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowOptions(false)}>
            <Text style={[styles.optionText, { color: 'red' }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Preview Selected Images with Cross */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {images.map((uri, index) => (
          <View key={index} style={styles.imageWrapper}>
            <Image source={{ uri }} style={styles.selectedImage} />
            <TouchableOpacity
              style={styles.removeIcon}
              onPress={() => removeImage(index)}
            >
              <Entypo name="cross" size={18} color="white" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Submit Button */}
      <TouchableOpacity
        style={[
          styles.button,
          !(rating && reviewText.trim()) && { backgroundColor: '#ccc' },
        ]}
        onPress={handleSubmit}
        disabled={!(rating && reviewText.trim())}
      >
        <Text style={styles.buttonText}>Submit Review</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default WriteReview;



const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius:50,
    borderTopRightRadius:50
  },
  title: {
    fontSize: 18,
    fontFamily: 'mbold',
    marginBottom: 20,
  },
  productBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    padding: 10,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  price: {
    color: '#888',
    marginTop: 4,
  },
  starscontainer:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between'
  },
  stars: {
    flexDirection: 'row',
    marginVertical: 15,
    justifyContent: 'flex-start',
  },
  starIcon: {
    marginHorizontal: 4,
  },
  textarea: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    height: 170,
    padding: 10,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#024A63',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
    header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  uploadButton: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 10,
  },
  uploadText: {
    fontSize: 14,
  },
  selectedImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
    marginTop: 10,
  },
  clipIcon: {
  alignSelf: 'flex-start',
  marginTop: 15,
  backgroundColor: '#f0f0f0',
  padding: 10,
  borderRadius: 10,
},
optionBox: {
  backgroundColor: '#fff',
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 10,
  marginTop: 10,
  padding: 10,
},
optionText: {
  fontSize: 16,
  paddingVertical: 8,
},
imageWrapper: {
  position: 'relative',
  marginRight: 10,
  marginTop: 10,
},
removeIcon: {
  position: 'absolute',
  top: -5,
  right: -5,
  backgroundColor: '#000',
  borderRadius: 12,
  padding: 2,
  zIndex: 1,
},
});
