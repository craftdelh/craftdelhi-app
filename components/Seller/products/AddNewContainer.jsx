  import React, { useEffect, useState } from 'react';
  import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
  import * as ImagePicker from 'expo-image-picker';
  import { Video } from 'expo-av';
  import sample from '../../../assets/images/sample.png';
  import { Picker } from '@react-native-picker/picker'; 
  import AsyncStorage from '@react-native-async-storage/async-storage';
  import axios from 'axios';

  export default function AddNewContainer() {
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


    const [additionalImages, setAdditionalImages] = useState([null, null, null, null]);

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

  const handleAddProduct = async () => {
    if (!productName.trim()) return alert('Product name is required!');
    if (!description.trim()) return alert('Description is required!');
    if (!price || isNaN(price)) return alert('Valid price is required!');
    if (!quantity || isNaN(quantity)) return alert('Valid quantity is required!');
    if (!packageWeight || isNaN(packageWeight)) return alert('Valid package weight is required!');

    setLoading(true);

    try {
      const userString = await AsyncStorage.getItem('user');
      if (!userString) {
        alert("User not logged in");
        return;
      }

      const userData = JSON.parse(userString);
      const sellerId = userData.id;
      const token = userData.token;

      const formData = new FormData();
      formData.append("name", productName);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("dimension", dimensions);
      formData.append("package_weight", packageWeight);
      formData.append("weight_type", weightUnit);
      formData.append("warranty_type", warrantyType);
      formData.append("category_id", "2");
      formData.append("quantity", quantity);
      formData.append("seller_id", sellerId);

      if (mainMedia) {
        formData.append("main_image", {
          uri: mainMedia,
          name: `main_${Date.now()}.jpg`,
          type: 'image/jpeg'
        });
      }

      additionalImages.forEach((imgUri, index) => {
        if (imgUri) {
          formData.append("gallery_images", {
            uri: imgUri,
            name: `gallery_${index}_${Date.now()}.jpg`,
            type: 'image/jpeg'
          });
        }
      });

    if (videoUri) {
    formData.append("product_video", {
      uri: videoUri,
      name: `video_${Date.now()}.mp4`,
      type: 'video/mp4'
    });
  }

  if (reelUri) {
    formData.append("product_reel", {
      uri: reelUri,
      name: `reel_${Date.now()}.mp4`,
      type: 'video/mp4'
    });
  }

  formData.append("video_name", videoName);
  formData.append("reel_name", reelName);


      const response = await axios.post(
        "https://backend.craftdelhi.com/backend/api/products/add",
        formData,
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      alert(`✅ Product added successfully. SKU: ${response.data.product_sku}`);
    } catch (error) {
      console.error("API Error:", error);
      alert("Something went wrong.");
    }finally {
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
        {renderInputBlock('QUANTITY IN STOCK', quantity, setQuantity, 'numeric', false, 'E.g. 10')}


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
        <Text style={{fontWeight:'bold'}}>No file chosen </Text>
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
          <TouchableOpacity style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
    style={[styles.addButton, loading && { backgroundColor: '#888' }]} 
    onPress={handleAddProduct}
    disabled={loading}
  >
    <Text style={styles.addText}>{loading ? 'Adding...' : 'Add'}</Text>
  </TouchableOpacity>

        </View>
      </ScrollView>

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
      alignItems: 'center',
      flexDirection:'row',
      justifyContent:'space-between'
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
