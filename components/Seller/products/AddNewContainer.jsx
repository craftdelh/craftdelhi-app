import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, TextInput, ActivityIndicator, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useVideoPlayer, VideoView } from 'expo-video';
import sample from '../../../assets/images/sample.png';
import { Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { Feather } from '@expo/vector-icons';
import { getImageUrl } from '../../../src/utils/imageUrl';
import { router } from 'expo-router';

const API_BASE = process.env.EXPO_PUBLIC_BASE_URL;

const CustomPicker = ({ label, value, setValue, items, placeholderLabel }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const selectedItem = items.find(i => i.value === value);

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.inputBox, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.inputText, !value && { color: '#999' }]} numberOfLines={1}>
          {selectedItem ? selectedItem.label : placeholderLabel}
        </Text>
        <Feather name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent={true} animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{placeholderLabel}</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 300 }}>
              <TouchableOpacity style={styles.modalItem} onPress={() => { setValue(""); setModalVisible(false); }}>
                <Text style={[styles.modalItemText, { color: '#999' }]}>None</Text>
              </TouchableOpacity>
              {items.map(i => (
                <TouchableOpacity key={i.value} style={styles.modalItem} onPress={() => { setValue(i.value); setModalVisible(false); }}>
                  <Text style={[styles.modalItemText, value === i.value && { color: '#024A63', fontFamily: 'mbold' }]}>{i.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default function AddNewContainer({ editData }) {
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const [sellerId, setSellerId] = useState('');

  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [packageWeight, setPackageWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState('kg');
  const [warrantyType, setWarrantyType] = useState('No Warranty');

  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');

  const [subcategories, setSubcategories] = useState([]);
  const [subcategory, setSubcategory] = useState('');

  const [giftCategories, setGiftCategories] = useState([]);
  const [occasionSlug, setOccasionSlug] = useState('');

  const [hashtags, setHashtags] = useState([]);
  const [hashtagInput, setHashtagInput] = useState('');

  const [mainMedia, setMainMedia] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([null, null, null, null]);
  const [videoUri, setVideoUri] = useState(null);
  const [videoName, setVideoName] = useState('');
  const [reelUri, setReelUri] = useState(null);
  const [reelName, setReelName] = useState('');

  const videoPlayer = useVideoPlayer(videoUri, player => { if (player) player.loop = true; });
  const reelPlayer = useVideoPlayer(reelUri, player => { if (player) player.loop = true; });

  useEffect(() => {
    (async () => {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const u = JSON.parse(userStr);
        setToken(u.token);
        setSellerId(u.id);
        fetchCategories(u.token);
        fetchGiftCategories();
      }
    })();
  }, []);

  const fetchCategories = async (tk) => {
    try {
      const res = await axios.get(`${API_BASE}categories/get`, { headers: { Authorization: tk } });
      if (res.data.status) setCategories(res.data.data);
    } catch (e) { console.log(e); }
  };

  const fetchGiftCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE}gift-categories/get`);
      if (res.data.success) setGiftCategories(res.data.data);
    } catch (e) { console.log(e); }
  };

  useEffect(() => {
    if (categoryId && token) {
      axios.get(`${API_BASE}categories/subcategories/${categoryId}`, { headers: { Authorization: token } })
        .then(res => {
          if (res.data.status) {
            let fetched = res.data.data;
            if (editData?.subcat_name && !subcategory) {
              const found = fetched.find(s => s.name?.trim() === editData.subcat_name?.trim());
              if (found) setSubcategory(found.id);
              else {
                const dummy = { id: editData.subcategory_id || editData.subcat_name, name: editData.subcat_name };
                fetched = [...fetched, dummy];
                setSubcategory(dummy.id);
              }
            }
            setSubcategories(fetched);
          }
        }).catch(e => setSubcategories([]));
    } else setSubcategories([]);
  }, [categoryId, token, editData]);

  useEffect(() => {
    if (editData && categories.length > 0) {
      setProductName(editData.name || '');
      setDescription(editData.description || '');
      setPrice(editData.price?.toString() || '');
      setQuantity(editData.stock?.toString() || '');
      setDimensions(editData.dimension || '');
      setPackageWeight(editData.package_weight || '');
      setWeightUnit(editData.weight_type || 'kg');
      setWarrantyType(editData.warranty_type || 'No Warranty');
      setCategoryId(editData.parent_category_id || editData.category_id || '');
      setSubcategory(editData.subcategory_id || editData.subcategory || '');
      setOccasionSlug(editData.occasion_slug || '');

      const parsedTags = [];
      const src = editData.hashtags || editData.tags || editData.slug;
      if (src) {
        if (Array.isArray(src)) {
          parsedTags.push(...src);
        } else if (typeof src === 'string') {
          try {
            const maybe = JSON.parse(src);
            if (Array.isArray(maybe)) parsedTags.push(...maybe);
            else parsedTags.push(...src.split(','));
          } catch (e) {
            parsedTags.push(...src.split('-'));
          }
        }
      }
      setHashtags([...new Set(parsedTags)].filter(t => t).slice(0, 5));

      if (editData.main_image_url) setMainMedia(getImageUrl(editData.main_image_url, 'full'));
      if (editData.video_name) setVideoName(editData.video_name);
      if (editData.reel_name) setReelName(editData.reel_name);
      if (editData.video_url) setVideoUri(editData.video_url);
      if (editData.reel_url) setReelUri(editData.reel_url);

      let gallery = [];
      if (editData.gallery_images) {
        try {
          gallery = typeof editData.gallery_images === 'string' ? JSON.parse(editData.gallery_images) : editData.gallery_images;
          if (Array.isArray(gallery)) {
            const arr = [null, null, null, null];
            gallery.slice(0, 4).forEach((g, i) => { arr[i] = getImageUrl(g, 'full'); });
            setAdditionalImages(arr);
          }
        } catch (e) { console.log(e) }
      }
    }
  }, [editData, categories]);

  const handleHashtagSubmit = (text) => {
    const tokens = text.split(/\s+/);
    let newTags = [...hashtags];
    let changed = false;

    tokens.forEach(t => {
      const raw = t.replace(/['"]+/g, "").replace(/#/g, "").toLowerCase();
      if (raw && !newTags.includes(raw) && newTags.length < 5) {
        newTags.push(raw);
        changed = true;
      }
    });

    if (changed) {
      setHashtags(newTags);
      setHashtagInput('');
    } else if (newTags.length >= 5 && tokens.length > 0) {
      Toast.show({ type: 'error', text1: 'You can add up to 5 tags only' });
    }
  };

  const removeHashtag = (tag) => {
    setHashtags(hashtags.filter(h => h !== tag));
  };

  const processImage = async (uri) => {
    if (uri && (uri.toLowerCase().endsWith('.heic') || uri.toLowerCase().endsWith('.heif'))) {
      try {
        const manipResult = await ImageManipulator.manipulateAsync(
          uri,
          [],
          { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
        );
        return manipResult.uri;
      } catch (e) {
        console.log("Error converting HEIC image:", e);
        return uri;
      }
    }
    return uri;
  };

  const pickImage = async (index = null) => {
    const result = await ImagePicker.launchImageLibraryAsync({ 
      mediaTypes: ImagePicker.MediaTypeOptions.Images, 
      quality: 1 
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      const processedUri = await processImage(result.assets[0].uri);
      if (index !== null) {
        const arr = [...additionalImages];
        arr[index] = processedUri;
        setAdditionalImages(arr);
      } else setMainMedia(processedUri);
    }
  };

  const pickVideo = async (isReel = false) => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Videos, quality: 1 });
    if (!result.canceled && result.assets?.[0]?.uri) {
      if (isReel) setReelUri(result.assets[0].uri);
      else setVideoUri(result.assets[0].uri);
    }
  };

  const resetForm = () => {
    setProductName('');
    setDescription('');
    setPrice('');
    setQuantity('');
    setCategoryId('');
    setSubcategory('');
    setOccasionSlug('');
    setDimensions('');
    setPackageWeight('');
    setWeightUnit('kg');
    setWarrantyType('No Warranty');
    setMainMedia(null);
    setAdditionalImages([null, null, null, null]);
    setVideoUri(null);
    setReelUri(null);
    setHashtags([]);
  };

  const handleSubmit = async () => {
    if (!productName.trim() || !description.trim() || !price || !quantity || !categoryId) {
      Toast.show({ type: 'error', text1: 'Please fill all mandatory fields' });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", productName);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("dimension", dimensions);
      formData.append("package_weight", packageWeight);
      formData.append("weight_type", weightUnit);
      formData.append("warranty_type", warrantyType);
      formData.append("category_id", categoryId);
      if (subcategory) formData.append("subcategory_id", subcategory);
      if (occasionSlug) formData.append("occasion_slug", occasionSlug);
      formData.append("stock", quantity);
      formData.append("seller_id", sellerId);
      formData.append("hashtags", JSON.stringify(hashtags));
      formData.append("video_name", videoName);
      formData.append("reel_name", reelName);

      if (editData) formData.append("id", editData.id);

      const isLocal = (uri) => uri && uri.startsWith('file://');
      const getFileExt = (uri) => uri.split('.').pop().toLowerCase();

      if (isLocal(mainMedia)) {
        const ext = getFileExt(mainMedia) === 'png' ? 'png' : 'jpg';
        const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
        formData.append("main_image", { uri: mainMedia, name: `main_${Date.now()}.${ext}`, type: mime });
      } else if (mainMedia && !isLocal(mainMedia)) {
        formData.append("existing_main_image", mainMedia);
      }

      const existingGallery = [];
      additionalImages.forEach((img, index) => {
        if (isLocal(img)) {
          const ext = getFileExt(img) === 'png' ? 'png' : 'jpg';
          const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
          formData.append("gallery_images", { uri: img, name: `gallery_${index}_${Date.now()}.${ext}`, type: mime });
        } else if (img) {
          existingGallery.push(img);
        }
      });
      if (existingGallery.length > 0) {
        formData.append("existing_gallery_images", JSON.stringify(existingGallery));
      }

      const getVideoMime = (ext) => ext === 'mov' ? 'video/quicktime' : 'video/mp4';

      if (isLocal(videoUri)) {
        const ext = getFileExt(videoUri) === 'mov' ? 'mov' : 'mp4';
        formData.append("product_video", { uri: videoUri, name: `video_${Date.now()}.${ext}`, type: getVideoMime(ext) });
      }
      if (isLocal(reelUri)) {
        const ext = getFileExt(reelUri) === 'mov' ? 'mov' : 'mp4';
        formData.append("product_reel", { uri: reelUri, name: `reel_${Date.now()}.${ext}`, type: getVideoMime(ext) });
      }

      const endpoint = editData ? `products/update/${editData.id}` : 'products/add';
      
      const config = { headers: { Authorization: token, "Content-Type": "multipart/form-data" } };
      const res = editData 
        ? await axios.put(`${API_BASE}${endpoint}`, formData, config)
        : await axios.post(`${API_BASE}${endpoint}`, formData, config);

      if (res.data.status !== false) {
        Toast.show({ type: 'success', text1: `Product ${editData ? 'Updated' : 'Added'} Successfully!` });
        resetForm();
        setTimeout(() => router.push('/(sellerTab)/products'), 500);
      } else {
        Toast.show({ type: 'error', text1: res.data.message || 'Something went wrong' });
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error submitting product' });
    } finally {
      setLoading(false);
    }
  };

  const renderInputBox = (label, value, setValue, placeholder, multiline = false, keyboardType = 'default') => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputBox, multiline && styles.inputBoxMulti]}>
        <TextInput
          style={[styles.inputText, multiline && { textAlignVertical: 'top', height: '100%' }]}
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          multiline={multiline}
          keyboardType={keyboardType}
          placeholderTextColor="#999"
        />
        {multiline && <Text style={styles.charCount}>{value.length}/1000</Text>}
      </View>
    </View>
  );

  const renderUploadBox = (label, imageUri, onPress, infoText, hasNameInput = false, nameVal = "", setNameVal = "", nameLabel = "") => (
    <View style={styles.uploadGroup}>
      {label && <Text style={styles.sectionHeader}>{label}</Text>}
      {hasNameInput && (
        <View style={[styles.inputGroup, { marginBottom: 10 }]}>
          <Text style={styles.label}>{nameLabel}</Text>
          <View style={styles.inputBox}>
            <TextInput style={styles.inputText} value={nameVal} onChangeText={setNameVal} placeholderTextColor="#999" />
          </View>
        </View>
      )}
      <View style={styles.uploadBoxInner}>
        <View style={styles.previewBox}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewImg} />
          ) : (
            <Feather name="image" size={32} color="#ccc" />
          )}
        </View>
        <Text style={styles.infoText}>{infoText}</Text>
        <View style={styles.chooseFileRow}>
          <TouchableOpacity style={styles.chooseBtn} onPress={onPress}>
            <Text style={styles.chooseBtnText}>Choose File</Text>
          </TouchableOpacity>
          <Text style={styles.noFileText}>{imageUri ? 'File chosen' : 'No file chosen'}</Text>
        </View>
      </View>
    </View>
  );

  const renderVideoBox = (label, videoUri, onPress, infoText, nameVal, setNameVal, nameLabel, player) => (
    <View style={styles.uploadGroup}>
      <Text style={styles.sectionHeader}>{label}</Text>
      <View style={[styles.inputGroup, { marginBottom: 10 }]}>
        <Text style={styles.label}>{nameLabel}</Text>
        <View style={styles.inputBox}>
          <TextInput style={styles.inputText} value={nameVal} onChangeText={setNameVal} placeholderTextColor="#999" />
        </View>
      </View>
      <View style={styles.uploadBoxInner}>
        <View style={styles.previewBox}>
          {videoUri ? (
            <VideoView player={player} style={styles.previewImg} nativeControls />
          ) : (
            <Feather name="image" size={32} color="#ccc" />
          )}
        </View>
        <Text style={styles.infoText}>{infoText}</Text>
        <View style={styles.chooseFileRow}>
          <TouchableOpacity style={styles.chooseBtn} onPress={onPress}>
            <Text style={styles.chooseBtnText}>Choose File</Text>
          </TouchableOpacity>
          <Text style={styles.noFileText}>{videoUri ? 'File chosen' : 'No file chosen'}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>

      {/* Product Name */}
      {renderInputBox('PRODUCT NAME', productName, setProductName, 'Enter Product Name')}

      {/* Hashtags */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>HASHTAGS / TAGS</Text>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.inputText}
            value={hashtagInput}
            onChangeText={(text) => {
              if (text.endsWith(' ')) { handleHashtagSubmit(text); }
              else { setHashtagInput(text); }
            }}
            onSubmitEditing={() => handleHashtagSubmit(hashtagInput)}
            placeholder="Type and press space or enter"
            placeholderTextColor="#999"
          />
        </View>
        <View style={styles.tagsContainer}>
          {hashtags.map((tag, i) => (
            <View key={i} style={styles.tagPill}>
              <Text style={styles.tagText}>{tag}</Text>
              <TouchableOpacity onPress={() => removeHashtag(tag)} style={{ marginLeft: 6 }}>
                <Feather name="x" size={14} color="#024A63" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      {/* Main Image */}
      {renderUploadBox(
        null, mainMedia, () => pickImage(null),
        "Min size: 480x480 px. Max file size: 10MB.\nSupported format: JPG, PNG"
      )}

      {/* Additional Images */}
      <Text style={[styles.sectionHeader, { marginTop: 20 }]}>Additional Images</Text>
      {additionalImages.map((img, i) => (
        <View key={i} style={styles.additionalImageRow}>
          <View style={styles.previewBoxSmall}>
            {img ? <Image source={{ uri: img }} style={styles.previewImgSmall} /> : <Feather name="image" size={24} color="#ccc" />}
          </View>
          <View style={styles.chooseFileBoxSmall}>
            <TouchableOpacity style={styles.chooseBtn} onPress={() => pickImage(i)}>
              <Text style={styles.chooseBtnText}>Choose File</Text>
            </TouchableOpacity>
            <Text style={styles.noFileTextSmall}>{img ? 'File chosen' : 'No file chosen'}</Text>
          </View>
        </View>
      ))}

      {/* Product Details */}
      <Text style={[styles.sectionHeader, { marginTop: 30 }]}>Product Details</Text>

      {renderInputBox('DESCRIPTION', description, setDescription, 'Enter description...', true)}
      {renderInputBox('PRICE (RS)', price, setPrice, '2000', false, 'numeric')}

      <CustomPicker label="CATEGORY" value={categoryId} setValue={setCategoryId} items={categories.map(c => ({ label: c.name, value: c.id }))} placeholderLabel="Select Category" />
      
      {subcategories.length > 0 && (
        <CustomPicker label="SUBCATEGORY" value={subcategory} setValue={setSubcategory} items={subcategories.map(s => ({ label: s.name, value: s.id }))} placeholderLabel="Select Subcategory" />
      )}

      <CustomPicker label="OCCASION (GIFT CATEGORY)" value={occasionSlug} setValue={setOccasionSlug} items={giftCategories.map(g => ({ label: g.title || g.name, value: g.slug }))} placeholderLabel="Select Occasion (Optional)" />

      {renderInputBox('QUANTITY IN STOCK', quantity, setQuantity, 'Enter quantity', false, 'numeric')}
      {renderInputBox('PRODUCT DIMENSION (LENGTH, WIDTH, HEIGHT) OPTIONAL', dimensions, setDimensions, '20 x 15 x 10 cm')}

      {/* Video Upload */}
      {renderVideoBox('Video Upload', videoUri, () => pickVideo(false), 'Min size: 480x480 px. Max video length: 60 seconds. Max file size: 100MB. Supported Format: MP4.', videoName, setVideoName, 'VIDEO NAME', videoPlayer)}

      {/* Reels Upload */}
      {renderVideoBox('Reels Upload (Optional)', reelUri, () => pickVideo(true), 'Min size: 480x480 px. Max video length: 30 seconds. Max file size: 100MB.', reelName, setReelName, 'REEL NAME', reelPlayer)}

      {/* Shipping & Warranty */}
      <Text style={[styles.sectionHeader, { marginTop: 30 }]}>Shipping & Warranty</Text>

      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 10 }}>
          {renderInputBox('PACKAGE WEIGHT', packageWeight, setPackageWeight, '2', false, 'numeric')}
        </View>
        <View style={{ flex: 1 }}>
          <CustomPicker label="SELECT GRAM / KG" value={weightUnit} setValue={setWeightUnit} items={[{ label: 'KG', value: 'kg' }, { label: 'Gram', value: 'gram' }]} placeholderLabel="KG" />
        </View>
      </View>

      <CustomPicker label="WARRANTY TYPE" value={warrantyType} setValue={setWarrantyType} items={[
        { label: 'No Warranty', value: 'No Warranty' },
        { label: '6 months', value: '6 months' },
        { label: '1 year', value: '1 year' },
        { label: '2 years', value: '2 years' }
      ]} placeholderLabel="Select Warranty" />

      {/* Footer Buttons */}
      <View style={styles.footerRow}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.push('/(sellerTab)/products')}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.submitBtn, loading && { opacity: 0.7 }]} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>{editData ? 'Update Product' : 'Add Product'}</Text>}
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
  },
  mainTitle: {
    fontSize: 20,
    fontFamily: 'mbold',
    color: '#000',
    marginTop: 10,
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontFamily: 'mbold',
    color: '#000',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    fontFamily: 'mbold',
    color: '#000',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputBox: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 15,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  inputBoxMulti: {
    height: 120,
    paddingVertical: 12,
  },
  inputText: {
    fontSize: 14,
    fontFamily: 'mregular',
    color: '#333',
  },
  charCount: {
    position: 'absolute',
    bottom: 10,
    right: 15,
    fontSize: 10,
    color: '#999',
    fontFamily: 'mregular',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  modalContent: {
    backgroundColor: 'white',
    width: '100%',
    borderRadius: 12,
    padding: 20,
    paddingBottom: 30
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: 'mbold',
    color: '#024A63',
    marginBottom: 15,
    textAlign: 'center'
  },
  modalItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  modalItemText: {
    fontSize: 15,
    fontFamily: 'mregular',
    color: '#333',
    textAlign: 'center'
  },
  pickerBox: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 8,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F0F4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    color: '#024A63',
    fontSize: 12,
    fontFamily: 'msemibold',
  },
  uploadGroup: {
    marginBottom: 20,
  },
  uploadBoxInner: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  previewBox: {
    width: 80,
    height: 80,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  previewImg: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    resizeMode: 'cover',
  },
  infoText: {
    fontSize: 11,
    color: '#000',
    fontFamily: 'mregular',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 16,
  },
  chooseFileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6EFFF', // Light blue background like screenshot
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    width: '100%',
  },
  chooseBtn: {
    backgroundColor: '#024A63',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  chooseBtnText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'mbold',
  },
  noFileText: {
    fontSize: 13,
    color: '#000',
    fontFamily: 'msemibold',
    marginLeft: 15,
  },
  additionalImageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  previewBoxSmall: {
    width: 60,
    height: 60,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  previewImgSmall: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
    resizeMode: 'cover',
  },
  chooseFileBoxSmall: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6EFFF',
    padding: 8,
    borderRadius: 6,
  },
  noFileTextSmall: {
    fontSize: 12,
    color: '#000',
    fontFamily: 'msemibold',
    marginLeft: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    marginBottom: 40,
    gap: 10,
  },
  cancelBtn: {
    backgroundColor: '#D1D5DB',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 6,
  },
  cancelBtnText: {
    color: '#374151',
    fontSize: 14,
    fontFamily: 'mbold',
  },
  submitBtn: {
    backgroundColor: '#024A63',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 6,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'mbold',
  }
});
