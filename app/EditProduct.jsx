import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Video } from 'expo-av';
import sample from '../assets/images/sample.png';
import { Picker } from '@react-native-picker/picker'; 
import { AntDesign, Entypo } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as mime from 'mime';

export default function EditProduct({}) {
  
  const { item: itemParam } = useLocalSearchParams();
const item = JSON.parse(itemParam || '{}');
console.log('Parsed item:', item);

  const [description, setDescription] = useState('');
 const [productName, setProductName] = useState('');
const [price, setPrice] = useState('');
const [quantity, setQuantity] = useState('');
const [category, setCategory] = useState('');
const [dimensions, setDimensions] = useState('');
const [reelName, setReelName] = useState('');
const [packageWeight, setPackageWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState('kg'); 
  const [warrantyType, setWarrantyType] = useState('No Warranty')
  const [mainMedia, setMainMedia] = useState(null);
  const [videoUri, setVideoUri] = useState(null);
const [reelUri, setReelUri] = useState(null);
  const [videoName, setVideoName] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
    const [additionalImages, setAdditionalImages] = useState([null, null, null, null]);


 useEffect(() => {
  if (item && !initialized) {
    setDescription(item.description || '');
    setProductName(item.name || '');
    setPrice(item.price?.toString() || '');
    setCategory(item.category_id?.toString() || '');
    setDimensions(item.dimension || '');
    setReelName(''); // no reel_name in response
    setPackageWeight(item.package_weight?.toString() || '');
    setWeightUnit(item.weight_type || 'kg');
    setWarrantyType(item.warranty_type || 'No Warranty');
    setMainMedia(item.main_image_url || null);
    setVideoUri(item.video_url || null);
    setReelUri(item.reel_url || null)

    // Additional images might not be coming, fallback to empty
    if (Array.isArray(item.gallery_images)) {
      const imgs = [...item.gallery_images];
      while (imgs.length < 4) imgs.push(null);
      setAdditionalImages(imgs.slice(0, 4));
    } else {
      setAdditionalImages([null, null, null, null]);
    }

    setInitialized(true);
  }
}, [item, initialized]);


  const pickImage = async (index = null) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      const uri = result.assets[0].uri;
      if (index !== null) {
        const updatedImages = [...additionalImages];
        updatedImages[index] = uri;
        setAdditionalImages(updatedImages);
      } else {
        setMainMedia(uri);
      }
    }
  };

  const pickVideo = async () => {
   const result = await ImagePicker.launchImageLibraryAsync({
     mediaTypes: ImagePicker.MediaTypeOptions.Videos,
     quality: 1,
   });
   if (!result.canceled && result.assets?.[0]?.uri) {
     setVideoUri(result.assets[0].uri);
   }
 };
 
 const pickReel = async () => {
   const result = await ImagePicker.launchImageLibraryAsync({
     mediaTypes: ImagePicker.MediaTypeOptions.Videos,
     quality: 1,
   });
   if (!result.canceled && result.assets?.[0]?.uri) {
     setReelUri(result.assets[0].uri);
   }
 };
useEffect(() => {
  (async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need media library permissions to make this work!');
    }
  })();
}, []);

const handleSave = async () => {
  try {
    setLoading(true);
    const userString = await AsyncStorage.getItem('user');
const userData = JSON.parse(userString);
const sellerId = userData.id;
const token = userData.token;
    const formData = new FormData();

    formData.append('name', productName);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('category_id', category);
    formData.append('quantity', quantity || '1'); // default fallback
    formData.append('dimension', dimensions);
    formData.append('package_weight', packageWeight);
    formData.append('weight_type', weightUnit);
    formData.append('warranty_type', warrantyType);

    // media handling
    if (mainMedia && !mainMedia.startsWith('http')) {
      formData.append('main_image', {
        uri: mainMedia,
        type: 'image/jpeg',
        name: 'main.jpg',
      });
    } else {
      formData.append('main_image_url', mainMedia);
    }

    // Gallery images
    const galleryUrls = [];
    for (let img of additionalImages) {
      if (img && !img.startsWith('http')) {
        formData.append('gallery_images', {
          uri: img,
          type: 'image/jpeg',
          name: `gallery_${Math.random()}.jpg`,
        });
      } else if (img) {
        galleryUrls.push(img);
      }
    }
    if (galleryUrls.length) {
      formData.append('gallery_images', JSON.stringify(galleryUrls));
    }

    if (videoUri && !videoUri.startsWith('http')) {
      formData.append('product_video', {
        uri: videoUri,
        type: 'video/mp4',
        name: 'video.mp4',
      });
    } else if (videoUri) {
      formData.append('video_url', videoUri);
    }

    if (reelUri && !reelUri.startsWith('http')) {
      formData.append('product_reel', {
        uri: reelUri,
        type: 'video/mp4',
        name: 'reel.mp4',
      });
    } else if (reelUri) {
      formData.append('reel_url', reelUri);
console.log("item.id",item.id)
    }

 const response = await axios.put(
      `https://backend.craftdelhi.com/backend/api/products/update/${item.id}`,
      formData,
      {
        headers: {
          'Authorization': `${token}`,
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      }
    );

   const result = response.data;

    if (result.status) {
      alert('Product updated successfully');
      router.back();
    } else {
      console.log('Update failed:', result);
      alert('Failed to update product: ' + result.message);
    }
  } catch (err) {
    console.error('Error:', err);
    alert('An unexpected error occurred');
  } finally {
    setLoading(false);
  }
};



  const renderInputBlock = (label, value, setValue, keyboardType = 'default', multiline = false, placeholder = '') => (
    <View style={styles.inputBlock}>
      <Text style={styles.label}>{label}</Text>
      <View style={multiline ? styles.textArea : styles.inputBox}>
        <TextInput
          style={[styles.inputText, multiline && { textAlignVertical: 'top' }]}
          value={value}
          onChangeText={setValue}
          keyboardType={keyboardType}
          multiline={multiline}
          placeholder={placeholder}
        />
        {multiline && <Text style={styles.charCount}>{value.length}/300</Text>}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : undefined}
  style={{ flex: 1 }}
  keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
>
 <View style={{padding:20,backgroundColor:'white',flex:1}}>

  <View style={{marginBottom:10, flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
    <TouchableOpacity onPress={()=>router.back()}><AntDesign name="arrowleft" size={24} color="black" /></TouchableOpacity>
    <Text style={{fontFamily:'mbold',fontSize:17}}>Edit Product</Text>

  </View>

    <ScrollView 
   contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        
>

     {renderInputBlock('PRODUCT NAME', productName, setProductName, 'default', false, 'The Ultimate Celebration Box')}
      
      <View style={styles.uploadRow}>
        <Image source={mainMedia ? { uri: mainMedia } : sample} style={styles.thumbnailTall} />
        <View style={styles.uploadDetails}>
          <Text style={styles.uploadText}>Min size: 480x480 px. Max video length: 60 seconds. Max file size: 100MB. Supported Format: mp4</Text>
          <View style={styles.chooseFileBox}>
            <TouchableOpacity style={styles.chooseFileButton} onPress={() => pickImage()}>
              <Text style={styles.chooseFileText}>Choose File</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Additional Images :</Text>
      {additionalImages.map((img, i) => (
        <View key={i} style={styles.imageCard}>
          <View style={styles.uploadRow}>
            <Image source={img ? { uri: img } : sample} style={styles.thumbnail} />
            <View style={styles.uploadDetails}>
              <View style={styles.chooseFileBox}>
                <TouchableOpacity style={styles.chooseFileButton} onPress={() => pickImage(i)}>
                  <Text style={styles.chooseFileText}>Choose File</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Product Details :</Text>
      {renderInputBlock('DESCRIPTION', description, setDescription, 'default', true, 'Enter description')}
      {renderInputBlock('PRICE', price, setPrice, 'numeric', false, 'Rs 2000')}
      {renderInputBlock('CATEGORIES (for Filtering)', category, setCategory, 'default', false, 'Hand Made Craft')}
      {renderInputBlock('PRODUCT DIMENSION (Length, Width, Height) Optional', dimensions, setDimensions, 'default', false, '20 x 15 x 10 cm')}

     <Text style={styles.sectionTitle}>Video Upload :</Text>
     {renderInputBlock('VIDEO NAME', videoName, setVideoName, 'default', false, 'Enter video name...')}
     
     <View style={styles.uploadRow}>
       {videoUri ? (
         <Video source={{ uri: videoUri }} style={styles.thumbnailTall} useNativeControls resizeMode="cover" isLooping />
       ) : (
         <Image source={{ uri: 'https://placehold.co/100x158' }} style={styles.thumbnailTall} />
       )}
       <View style={styles.uploadDetails}>
         <Text style={styles.uploadText}>Video upload info text here</Text>
         <View style={styles.chooseFileBox}>
           <TouchableOpacity style={styles.chooseFileButton} onPress={pickVideo}>
             <Text style={styles.chooseFileText}>Choose File</Text>
           </TouchableOpacity>
         </View>
       </View>
     </View>


     <Text style={styles.sectionTitle}>Reels Upload :</Text>
     {renderInputBlock('REEL NAME', reelName, setReelName, 'default', false, 'Enter reel name...')}
     
     <View style={styles.uploadRow}>
       {reelUri ? (
         <Video source={{ uri: reelUri }} style={styles.thumbnailTall} useNativeControls resizeMode="cover" isLooping />
       ) : (
         <Image source={{ uri: 'https://placehold.co/100x158' }} style={styles.thumbnailTall} />
       )}
       <View style={styles.uploadDetails}>
         <Text style={styles.uploadText}>Reel upload info text here</Text>
         <View style={styles.chooseFileBox}>
           <TouchableOpacity style={styles.chooseFileButton} onPress={pickReel}>
             <Text style={styles.chooseFileText}>Choose File</Text>
           </TouchableOpacity>
         </View>
       </View>
     </View>

      <View style={{ marginTop: 10 }}>
      <Text style={{ fontFamily: 'mbold', fontSize: 17 }}>Shipping & Warranty :</Text>
      <Text style={{ fontFamily: 'mbold', fontSize: 22, marginTop: 10 }}>Shipping & Warranty</Text>

      <View style={styles.divider} />

      {/* Package Weight Input */}
      <View style={styles.fieldContainer}>
        <Text style={styles.slabel}>Package Weight</Text>
        <View style={styles.sinputBox}>
          <TextInput
            value={packageWeight}
            onChangeText={setPackageWeight}
            keyboardType="numeric"
            style={styles.sinputText}
          />
        </View>
      </View>

      {/* Select Gram/Kg Dropdown */}
      <View style={styles.fieldContainer}>
        <Text style={styles.slabel}>Select Gram/Kg</Text>
        <View style={styles.sinputBox}>
          <Picker
            selectedValue={weightUnit}
            onValueChange={(itemValue) => setWeightUnit(itemValue)}
            style={Platform.OS === 'ios' ? { height:200 } : { height: 40 }}
            dropdownIconColor="black"
          >
            <Picker.Item label="KG" value="kg" />
            <Picker.Item label="Gram" value="gram" />
          </Picker>
        </View>
      </View>

      {/* Warranty Type Dropdown */}
      <View style={styles.fieldContainer}>
        <Text style={styles.slabel}>Warranty Type</Text>
        <View style={styles.sinputBox}>
          <Picker
            selectedValue={warrantyType}
            onValueChange={(itemValue) => setWarrantyType(itemValue)}
            style={Platform.OS === 'ios' ? { height: 250 } : { height: 40 }}
            dropdownIconColor="black"
          >
            <Picker.Item label="No Warranty" value="No Warranty" />
            <Picker.Item label="6 months" value="6 months" />
            <Picker.Item label="1 year" value="1 year" />
            <Picker.Item label="2 years" value="2 years" />
          </Picker>
        </View>
      </View>
    </View> 

    <View style={styles.buttonsContainer}>
        <TouchableOpacity onPress={()=>router.back()} style={styles.cancelButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton} onPress={handleSave} disabled={loading}>
 {loading ? (
 <Text style={styles.addText}>Saving...</Text>
 ) : ( <Text style={styles.addText}>Save</Text>
 )}
</TouchableOpacity>
      </View>
    </ScrollView>
 </View>
 </KeyboardAvoidingView>

  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    backgroundColor: '#f9f9f9',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Montserrat',
    color: 'black',
    marginVertical:10
  },
  inputBlock: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Montserrat',
    color: 'black',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop:5
  },
  inputBox: {
    backgroundColor: 'white',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E0E4F4',
    paddingHorizontal: 12,
    height: 56,
    justifyContent: 'center',
  },
  inputText: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Montserrat',
    color: 'black',
    flex: 1,
  },
  uploadRow: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
    marginVertical:10
  },
  thumbnail: {
    width: 100,
    height: 118,
    borderWidth: 1,
    borderColor: '#ECF0FF',
  },
  thumbnailTall: {
    width: 100,
    height: 158,
    borderWidth: 1,
    borderColor: '#ECF0FF',
  },
  uploadDetails: {
    flex: 1,
    gap: 10,
  },
  uploadText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Montserrat',
    color: 'black',
    lineHeight: 20,
  },
  chooseFileBox: {
    backgroundColor: '#ECF0FF',
    borderRadius: 5,
    padding: 10,
    alignItems: 'flex-end',
  },
  chooseFileButton: {
    backgroundColor: '#024A63',
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  chooseFileText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Montserrat',
  },
  imageCard: {
    backgroundColor: 'white',
    borderRadius: 5,
    borderColor: '#E0E4F4',
    borderWidth: 1,
    padding: 20,
    marginBottom: 10,
  },
  textArea: {
    backgroundColor: 'white',
    borderRadius: 4,
    borderColor: '#D9D9D9',
    borderWidth: 1,
    padding: 16,
    gap: 16,
    height: 120,
  },
  charCount: {
    textAlign: 'right',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Montserrat',
    color: 'black',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#D9D9D9',
    marginVertical: 8,
  },
  fieldContainer: {
    marginBottom: 16,
  },
    slabel: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Montserrat',
    color: 'black',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  sinputBox: {
    backgroundColor: 'white',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E0E4F4',
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  sinputText: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Montserrat',
    color: 'black',
    height: 40,
  },
   buttonsContainer: {
    flexDirection: 'row',
    gap: 8,       
    justifyContent:'flex-end'             
  },
  cancelButton: {
    padding: 16,
    backgroundColor: '#BBBBBB',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  addButton: {
    width: 80,
    padding: 16,
    backgroundColor: '#024A63',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: 'Montserrat',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 16,
    color: '#151618',
    textAlign: 'center',
  },
  addText: {
    fontFamily: 'Montserrat',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 16,
    color: 'white',
    textAlign: 'center',
  },
});
