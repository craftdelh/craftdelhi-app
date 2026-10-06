import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useRef, useState, useMemo } from 'react';
import * as Animatable from 'react-native-animatable';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const Products = ({ store, activeId, setActiveId, categoryProducts, loadingProducts, searchQuery }) => {
  const [visibleItems, setVisibleItems] = useState([]);
  const viewabilityConfig = { itemVisiblePercentThreshold: 50 };

  const displayProducts = useMemo(() => {
    if (!searchQuery) return categoryProducts;
    return categoryProducts.filter(item => {
      const title = (item.name || item.title || '').toLowerCase();
      return title.includes(searchQuery.toLowerCase());
    });
  }, [categoryProducts, searchQuery]);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    setVisibleItems(viewableItems.map((vi) => vi.item?.id || vi.item?.product_id));
  });

  const categoryList = useMemo(() => {
    return (store?.categories || [])
      .map((cat) => {
        if (typeof cat === "string") return { id: cat, name: cat.trim(), image: null };
        if (typeof cat === "object" && cat !== null) {
          return { id: cat.id || cat.name, name: (cat.name || "").trim(), image: cat.image || null };
        }
        return { id: null, name: String(cat || "").trim(), image: null };
      })
      .filter((cat) => cat.name.length > 0);
  }, [store?.categories]);

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => setActiveId(activeId === item.id ? null : item.id)}
    >
      <View style={[styles.categoryImageContainer, activeId === item.id && { borderColor: '#EE6F69', borderWidth: 2 }]}>
        {item.image ? (
          <Image
            source={{ uri: item.image.startsWith('http') ? item.image : `https://backend.craftdelhi.com/backend/${item.image.startsWith("/") ? item.image.slice(1) : item.image}` }}
            style={styles.categoryImage}
          />
        ) : (
          <View style={[styles.categoryImage, { backgroundColor: '#ECF0FF', justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={{ color: '#EE6F69', fontSize: 24, fontWeight: 'bold' }}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      <Text style={[styles.categoryText, { textAlign: 'center', color: activeId === item.id ? '#EE6F69' : '#000' }]} numberOfLines={2}>{item.name}</Text>
    </TouchableOpacity>
  );

  const resolveProductImage = (imageStr) => {
    if (!imageStr) return null;
    let urlData = imageStr;

    if (typeof urlData === 'string') {
      try {
        if (urlData.startsWith('{') || urlData.startsWith('[')) {
          urlData = JSON.parse(urlData);
        }
      } catch (e) { }
    }

    if (Array.isArray(urlData) && urlData.length > 0) urlData = urlData[0];

    let url = null;
    if (typeof urlData === 'object' && urlData !== null) {
      url = urlData.thumbnail || urlData.icon || urlData.url || urlData.file_name || urlData.full;
    } else if (typeof urlData === 'string') {
      url = urlData;
    }

    if (url && typeof url === 'string' && !url.startsWith("http")) {
      return `https://backend.craftdelhi.com/backend/${url.startsWith("/") ? url.slice(1) : url}`;
    }
    return url;
  };

  const formatPrice = (price) => {
    if (!price) return "0.00";
    return parseFloat(price).toFixed(2);
  };

  const StarRating = ({ rating }) => {
    const value = Number(rating || 0);
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {[1, 2, 3, 4, 5].map((star) => {
          if (value >= star) {
            return <Ionicons key={star} name="star" size={10} color="#69D297" />;
          } else if (value >= star - 0.5) {
            return <Ionicons key={star} name="star-half" size={10} color="#69D297" />;
          } else {
            return <Ionicons key={star} name="star-outline" size={10} color="#ccc" />;
          }
        })}
      </View>
    );
  };

  const renderItem = ({ item, index }) => {
    const isVisible = visibleItems.includes(item.product_id || item.id);
    const imageUrl = resolveProductImage(item.main_image_url || item.gallery_images || item.product_image || item.image);

    const CardContent = (
      <TouchableOpacity onPress={() => router.push({ pathname: '/ProductDetails', params: item })} activeOpacity={0.8}>
        <View style={styles.imageContainer}>
          {imageUrl && <Image source={{ uri: imageUrl }} style={styles.image} />}
          <View style={styles.priceTag}>
            <Text style={styles.priceText}>₹ {formatPrice(item.price)}</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.title} numberOfLines={2}>{item.name || item.title}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.ordersText}>{(item.order_count || item.total_order || item.orders || 0)} Orders</Text>
            <View style={styles.ratingContainer}>
              <StarRating rating={item.average_rating || item.ratings || item.rating} />
              <Text style={styles.ratingNumber}>{Number(item.average_rating || item.ratings || item.rating || 0).toFixed(1)}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );

    return isVisible ? (
      <Animatable.View animation="fadeInUp" duration={600} delay={index * 100} style={styles.card} useNativeDriver>
        {CardContent}
      </Animatable.View>
    ) : (
      <View style={styles.card}>{CardContent}</View>
    );
  };

  return (
    <View style={{ padding: 20, marginBottom: 50 }}>
      {categoryList.length > 0 && (
        <>
          <Text style={styles.headertitle}>Categories</Text>
          <FlatList
            data={categoryList}
            renderItem={renderCategory}
            keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 10, gap: 15 }}
          />
        </>
      )}

      <Text style={{ marginTop: 20, fontFamily: 'mbold', fontSize: 16 }}>More From Store</Text>

      {loadingProducts ? (
        <ActivityIndicator size="large" color="#EE6F69" style={{ marginTop: 30 }} />
      ) : displayProducts.length === 0 ? (
        <View style={{ marginTop: 30, alignItems: 'center' }}>
          <Text style={{ fontFamily: 'mmedium', color: '#888' }}>No products found.</Text>
        </View>
      ) : (
        <FlatList
          data={displayProducts}
          renderItem={renderItem}
          keyExtractor={(item, index) => (item.id || item.product_id || index).toString()}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          contentContainerStyle={{ marginTop: 20, gap: 12 }}
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged.current}
          viewabilityConfig={viewabilityConfig}
          removeClippedSubviews={false}
          scrollEnabled={false}
        />
      )}
    </View>
  );
};

export default Products;

const styles = StyleSheet.create({
  headertitle: {
    fontFamily: 'mbold',
    fontSize: 16,
    marginBottom: 5,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 20,
    width: 80,
  },
  categoryImageContainer: {
    width: 74,
    height: 74,
    borderRadius: 37,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  categoryImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  categoryText: {
    fontSize: 12,
    color: '#000',
    fontFamily: 'msemibold',
    marginTop: 5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderColor: '#ECF0FF',
    borderWidth: 1,
    width: '48%',
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  imageContainer: {
    height: 140,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  priceTag: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priceText: {
    color: '#024a63',
    fontSize: 11,
    fontFamily: 'mbold',
    fontWeight: '700',
  },
  cardContent: {
    padding: 10,
    paddingBottom: 12,
  },
  title: {
    fontSize: 12,
    color: '#024A63',
    fontFamily: 'msemibold',
    height: 36,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  ordersText: {
    fontSize: 10,
    color: '#959595',
    fontFamily: 'mmedium',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingNumber: {
    fontSize: 10,
    color: '#69D297',
    fontFamily: 'mbold'
  },
});
