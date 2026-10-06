import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const noimage = 'https://via.placeholder.com/150'; // Use a valid placeholder

const ProductRecommended = ({ productSku, excludeProductId, excludeProductSku }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

  const resolveUrl = (url) => {
    if (!url) return noimage;
    if (typeof url === 'string' && !url.startsWith("http")) {
       return `https://backend.craftdelhi.com/${url.startsWith("/") ? url.slice(1) : url}`;
    }
    return url;
  }

  const getProductImage = (product) => {
    let url = noimage;
    if (product?.image) {
      url = product.image;
    } else if (product?.main_image_url) {
      const getFromObj = (obj) => obj?.thumbnail || obj?.full || obj?.icon || obj?.url || obj?.file_name;
      
      if (typeof product.main_image_url === 'string') {
        try {
          const parsed = JSON.parse(product.main_image_url);
          url = getFromObj(parsed) || product.main_image_url;
        } catch {
          url = product.main_image_url;
        }
      } else {
        url = getFromObj(product.main_image_url) || noimage;
      }
    }
    return resolveUrl(url);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        if (!productSku) {
          setProducts([]);
          return;
        }

        try {
          const response = await axios.get(
            `${BASE_URL}products/recommendations/${encodeURIComponent(productSku)}?limit=8`,
            { timeout: 12000 }
          );
          
          let fetchedProducts = response.data.data || [];
          // Exclude current product
          fetchedProducts = fetchedProducts.filter((item) => {
            const isCurrentId = excludeProductId != null && String(item.id) === String(excludeProductId);
            const isCurrentSku = excludeProductSku && String(item.product_sku) === String(excludeProductSku);
            return !isCurrentId && !isCurrentSku;
          });
          
          setProducts(fetchedProducts.slice(0, 8));
        } catch (recommendationError) {
          // Fallback
          const fallbackResponse = await axios.get(`${BASE_URL}products/get`, { timeout: 12000 });
          let fallbackProducts = fallbackResponse.data.data || [];
          fallbackProducts = fallbackProducts.filter((item) => {
            const isCurrentId = excludeProductId != null && String(item.id) === String(excludeProductId);
            const isCurrentSku = excludeProductSku && String(item.product_sku) === String(excludeProductSku);
            return !isCurrentId && !isCurrentSku;
          });
          
          fallbackProducts.sort((a, b) => {
            const popularityA = Number(a.total_order || 0) + Number(a.average_rating || 0) * 4;
            const popularityB = Number(b.total_order || 0) + Number(b.average_rating || 0) * 4;
            return popularityB - popularityA;
          });
          
          setProducts(fallbackProducts.slice(0, 8));
        }
      } catch (err) {
        console.error("Error fetching recommendations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [BASE_URL, productSku]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#024a63" />
      </View>
    );
  }

  if (products.length === 0) {
    return null; // Hide section if no recommendations
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Recommended For You</Text>
      
      <View style={styles.grid}>
        {products.map((product) => (
          <TouchableOpacity
            key={product.id}
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => {
              router.push({ pathname: '/ProductDetails', params: product });
            }}
          >
            <View style={styles.imageContainer}>
              <Image source={{ uri: getProductImage(product) }} style={styles.image} />
              <View style={styles.priceBadge}>
                <Text style={styles.priceBadgeText}>₹ {product.price}</Text>
              </View>
            </View>
            
            <View style={styles.infoContainer}>
              <Text style={styles.title} numberOfLines={2}>{product.name}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.ordersText}>{product.total_order || 0} Orders</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={10} color="#22c55e" />
                  <Text style={styles.ratingText}>{product.average_rating || '0.0'}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default ProductRecommended;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    marginBottom: 40,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '48%',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  priceBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priceBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#024a63',
  },
  infoContainer: {
    padding: 12,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: '#024a63',
    minHeight: 32,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  ordersText: {
    fontSize: 10,
    color: '#6b7280',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#22c55e',
    marginLeft: 2,
  },
});
