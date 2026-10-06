import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import ProfileHeader from './ProfileHeader';
import { AntDesign, Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import ActionSheet from "react-native-actions-sheet";
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import TrackOrder from './TrackOrder';
import Book from '../../../assets/images/book.svg'
import ReturnOrderRequest from './ReturnOrderRequest';
import WriteReview from './WriteReview';
import CancelOrderRequest from './CancelOrderRequest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Toast from 'react-native-toast-message';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const STATUS_MAP = {
  0: "Processing",
  1: "Accepted",
  2: "Out for Delivery",
  3: "Delivered",
  4: "Cancelled",
};

const PAYMENT_STATUS_MAP = {
  0: "Pending",
  1: "Paid",
  2: "Refund",
};

const PAYMENT_TYPE_MAP = {
  0: "Cash on Delivery",
  1: "Online Payment",
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Processing':
      return '#f59e0b'; // amber
    case 'Accepted':
      return '#3b82f6'; // blue
    case 'Delivered':
      return '#10b981'; // green
    case 'Out for Delivery':
      return '#8b5cf6'; // purple
    case 'Cancelled':
      return '#ef4444'; // red
    default:
      return '#6b7280'; // gray
  }
};

const getStatusBgColor = (status) => {
  switch (status) {
    case 'Processing': return '#fef3c7';
    case 'Accepted': return '#dbeafe';
    case 'Delivered': return '#d1fae5';
    case 'Out for Delivery': return '#ede9fe';
    case 'Cancelled': return '#fee2e2';
    default: return '#f3f4f6';
  }
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const trackSheetRef = useRef(null);
  const returnSheetRef = useRef(null);
  const reviewSheetRef = useRef(null);
  const cancelSheetRef = useRef(null);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [selectedCancelOrder, setSelectedCancelOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const token = user.token;
        
        const res = await axios.get(
          `${process.env.EXPO_PUBLIC_BASE_URL}order/userorders`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const parseImage = (image) => {
          if (typeof image !== "string") return image;
          const value = image.trim();
          if (!value || value === "[object Object]") return null;
          if ((value.startsWith("{") && value.endsWith("}")) ||
              (value.startsWith("[") && value.endsWith("]"))) {
            try { return JSON.parse(value); } catch { return value; }
          }
          return value;
        };

        const extractImageUrl = (image) => {
          const parsed = parseImage(image);
          if (typeof parsed === "string") return parsed;
          if (Array.isArray(parsed)) return extractImageUrl(parsed[0]);
          if (!parsed || typeof parsed !== "object") return null;
          return extractImageUrl(parsed.thumbnail || parsed.full || parsed.icon || parsed.url || parsed.src || parsed.original_url || parsed.image_url);
        };

        const sanitizeUrl = (url) => {
          if (!url) return null;
          if (url.startsWith('http')) return url;
          if (url.startsWith('/')) return `https://craftdelhi.com${url}`;
          return `https://craftdelhi.com/${url}`;
        };

        if (res.data.status && res.data.data) {
          const apiOrders = res.data.data.map((o) => {
            const orderItems = Array.isArray(o.items) ? o.items : [];
            const firstItem = orderItems[0];
            const isCustomOrder = orderItems.length === 0;
            
            const extractedImage = sanitizeUrl(extractImageUrl(firstItem?.main_image_url || firstItem?.image));

            return {
              id: o.order_uid,
              internalId: o.order_id,
              items: orderItems.map(item => ({
                ...item,
                image: sanitizeUrl(extractImageUrl(item.main_image_url || item.image))
              })),
              productTitle: isCustomOrder ? "Custom Order" : (orderItems.length === 1 ? firstItem.product_name : `${orderItems.length} items`),
              image: extractedImage,
              qty: isCustomOrder ? 1 : orderItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
              price: `₹${Number(o.total_amount).toFixed(2)}`,
              date: new Date(o.created_at).toLocaleDateString("en-GB", {
                day: "2-digit", month: "short", year: "numeric",
              }),
              status: STATUS_MAP[o.order_status] || "Unknown",
              statusId: Number(o.order_status) || 0,
              paymentStatus: PAYMENT_STATUS_MAP[o.payment_status],
              paymentMode: PAYMENT_TYPE_MAP[o.payment_type] || "Online",
              address: o.shipping_info,
              buyerName: o.buyer_name,
              trackingId: o.tracking_info,
              courier: o.courierComapny,
            };
          });
          setOrders(apiOrders.reverse());
        } else {
          setOrders([]);
        }
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error("Fetch Orders Error:", error);
      }
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders])
  );

  const toggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const openTrackOrderSheet = (order) => {
    setSelectedOrder(order);
    setTimeout(() => {
      trackSheetRef.current?.show();
    }, 100);
  };

  const retrunRequest = (order) => {
    setSelectedReturn(order);
    setTimeout(() => {
      returnSheetRef.current?.show();
    }, 100);
  }
  
  const reviewRequest = (order) => {
    setSelectedReview(order);
    setTimeout(() => {
      reviewSheetRef.current?.show();
    }, 100);
  }

  const handleComingSoon = (feature) => {
    Toast.show({
      type: 'info',
      text1: 'Coming Soon',
      text2: `${feature} feature will be available shortly.`,
    });
  };

  const openCancelOrderSheet = (order) => {
    setSelectedCancelOrder(order);
    setTimeout(() => {
      cancelSheetRef.current?.show();
    }, 100);
  };

  const downloadInvoice = async (order) => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user || !user.token) {
        Toast.show({ type: 'error', text1: 'Auth Error', text2: 'Please login again' });
        return;
      }

      Toast.show({ type: 'info', text1: 'Downloading Invoice', text2: 'Please wait...' });

      const url = `${process.env.EXPO_PUBLIC_BASE_URL}order/orderinvoice/${order.internalId || order.id}`;
      const fileName = `Invoice-${order.id}.pdf`;
      const fileUri = FileSystem.documentDirectory + fileName;

      const downloadResumed = FileSystem.createDownloadResumable(
        url,
        fileUri,
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );

      const { uri } = await downloadResumed.downloadAsync();
      
      if (uri) {
        Toast.show({ type: 'success', text1: 'Downloaded', text2: 'Opening invoice...' });
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Your Invoice' });
        }
      }
    } catch (err) {
      console.error("Invoice Download Error:", err);
      Toast.show({ type: 'error', text1: 'Download Failed', text2: 'Could not download the invoice' });
    }
  };

  const renderStepper = (statusId) => {
    const steps = [
      { id: 0, label: 'Ordered' },
      { id: 1, label: 'Accepted' },
      { id: 2, label: 'Shipping' },
      { id: 3, label: 'Delivered' }
    ];
    
    return (
      <View style={styles.stepperContainer}>
        <Text style={styles.sectionHeading}><Feather name="truck" size={14} color="#333" /> TRACKING STATUS</Text>
        
        {statusId === 4 ? (
          <View style={styles.cancelledStatus}>
            <View style={[styles.stepCircle, { backgroundColor: '#fee2e2', borderColor: '#ef4444' }]}>
              <Ionicons name="close" size={16} color="#ef4444" />
            </View>
            <Text style={[styles.stepLabel, { color: '#ef4444', fontWeight: 'bold' }]}>Order Cancelled</Text>
          </View>
        ) : (
          <View style={styles.stepsRow}>
            {steps.map((step, index) => {
              const isCompleted = statusId >= step.id;
              const isLast = index === steps.length - 1;
              return (
                <View key={step.id} style={{ flex: isLast ? 0 : 1, flexDirection: 'row', alignItems: 'center' }}>
                  <View style={styles.stepItem}>
                    <View style={[
                      styles.stepCircle, 
                      isCompleted ? styles.stepCircleCompleted : styles.stepCirclePending
                    ]}>
                      {isCompleted ? (
                        <Ionicons name="checkmark" size={16} color="#10b981" />
                      ) : (
                        <Text style={styles.stepNumber}>{step.id + 1}</Text>
                      )}
                    </View>
                    <Text style={[styles.stepLabel, isCompleted && styles.stepLabelActive]}>{step.label}</Text>
                  </View>
                  {!isLast && (
                    <View style={[styles.stepLine, isCompleted && statusId > step.id ? styles.stepLineActive : null]} />
                  )}
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  const renderOrder = ({ item }) => {
    const isExpanded = expandedOrderId === item.id;
    const additionalItemsCount = Math.max(0, item.items.length - 1);
    
    return (
      <Animatable.View animation="fadeInUp" duration={500} style={styles.orderCard}>
        {/* Header - Always Visible */}
        <TouchableOpacity style={styles.cardHeader} onPress={() => toggleExpand(item.id)} activeOpacity={0.8}>
          <View style={styles.headerLeft}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.mainImage} />
            ) : (
              <View style={[styles.mainImage, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}>
                <AntDesign name="picture" size={24} color="#999" />
              </View>
            )}
            
            <View style={styles.headerInfo}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                <Text style={styles.itemsCountText}>
                  {item.items.length} {item.items.length === 1 ? 'item' : 'items'}
                </Text>
                {additionalItemsCount > 0 && (
                  <View style={styles.moreBadge}>
                    <Text style={styles.moreBadgeText}>+{additionalItemsCount} MORE</Text>
                  </View>
                )}
              </View>
              <Text style={styles.orderIdText}>Order ID: #{item.id}</Text>
              <Text style={styles.productsInfoText}>{item.items.length} products in this order</Text>
              
              <View style={styles.priceRow}>
                <Text style={styles.priceText}>{item.price}</Text>
                <Text style={styles.qtyText}>QTY: {item.qty}</Text>
              </View>
            </View>
          </View>

          <View style={styles.headerRight}>
            <View style={{ alignItems: 'flex-end', gap: 12 }}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusBgColor(item.status) }]}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                <Text style={[styles.statusBadgeText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
              </View>
              <Ionicons 
                name={isExpanded ? "chevron-up" : "chevron-down"} 
                size={22} 
                color="#666" 
                style={{ alignSelf: 'flex-end', marginRight: 4 }}
              />
            </View>
            <View style={styles.dateContainer}>
              <Text style={styles.dateLabelText}>PLACED ON</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Feather name="calendar" size={12} color="#111" />
                <Text style={styles.dateText}>{item.date}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Expanded Content */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.divider} />
            
            {/* Tracking Stepper */}
            {renderStepper(item.statusId)}
            
            {/* Info Cards Row */}
            <View style={styles.infoCardsWrapper}>
              <View style={styles.infoCard}>
                <MaterialCommunityIcons name="credit-card-outline" size={18} color="#024a63" style={styles.infoIcon} />
                <View>
                  <Text style={styles.infoCardTitle}>PAYMENT INFO</Text>
                  <Text style={styles.infoCardValue}>{item.paymentMode}</Text>
                  <Text style={styles.infoCardSubValue}>{item.paymentStatus}</Text>
                </View>
              </View>

              <View style={styles.infoCard}>
                <Feather name="truck" size={18} color="#024a63" style={styles.infoIcon} />
                <View>
                  <Text style={styles.infoCardTitle}>SHIPPING INFO</Text>
                  <Text style={styles.infoCardValue}>{item.courier || 'Not Assigned'}</Text>
                  {item.trackingId && <Text style={styles.infoCardSubValue}>{item.trackingId}</Text>}
                </View>
              </View>

              <View style={styles.infoCard}>
                <Feather name="map-pin" size={18} color="#024a63" style={styles.infoIcon} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoCardTitle}>SHIPPING TO</Text>
                  <Text style={styles.infoCardValue}>{item.buyerName || 'Buyer'}</Text>
                  <Text style={styles.infoCardSubValue} numberOfLines={2}>{item.address || 'Address not provided'}</Text>
                </View>
              </View>
            </View>

            {/* Item Details */}
            <View style={styles.itemDetailsSection}>
              <Text style={styles.sectionHeading}><Feather name="package" size={14} color="#333" /> ITEM DETAILS</Text>
              
              {item.items.map((prod, idx) => (
                <View key={idx} style={styles.nestedItemRow}>
                  {prod.image ? (
                    <Image source={{ uri: prod.image }} style={styles.nestedItemImage} />
                  ) : (
                    <View style={[styles.nestedItemImage, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}>
                      <AntDesign name="picture" size={16} color="#999" />
                    </View>
                  )}
                  <View style={styles.nestedItemInfo}>
                    <Text style={styles.nestedItemName} numberOfLines={1}>{prod.product_name || 'Product'}</Text>
                    <Text style={styles.nestedItemQty}>QTY: {prod.quantity || 1}</Text>
                  </View>
                  <Text style={styles.nestedItemPrice}>₹{Number(prod.price || 0).toFixed(2)}</Text>
                </View>
              ))}
            </View>

            <View style={styles.divider} />

            {/* Bottom Actions */}
            <View style={styles.bottomActions}>
              {item.statusId < 4 && item.statusId < 2 ? (
                <TouchableOpacity onPress={() => openCancelOrderSheet(item)} style={styles.actionBtnTextOnly}>
                  <Text style={styles.cancelBtnText}>Cancel Order</Text>
                </TouchableOpacity>
              ) : (
                <View style={{ flex: 1 }} />
              )}
              
              <View style={styles.rightActionGroup}>
                {(item.status === 'Processing' || item.status === 'Accepted' || item.status === 'Out for Delivery') && (
                  <TouchableOpacity onPress={() => openTrackOrderSheet(item)} style={styles.actionBtnOutline}>
                    <Feather name="map" size={14} color="#024a63" />
                    <Text style={styles.actionBtnOutlineText}>Track</Text>
                  </TouchableOpacity>
                )}
                {item.status === 'Delivered' && (
                   <>
                    <TouchableOpacity onPress={() => retrunRequest(item)} style={styles.actionBtnOutline}>
                      <Feather name="refresh-cw" size={14} color="#024a63" />
                      <Text style={styles.actionBtnOutlineText}>Return</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => reviewRequest(item)} style={styles.actionBtnOutline}>
                      <Feather name="star" size={14} color="#E67E22" />
                      <Text style={[styles.actionBtnOutlineText, { color: '#E67E22' }]}>Review</Text>
                    </TouchableOpacity>
                   </>
                )}
                <TouchableOpacity onPress={() => downloadInvoice(item)} style={styles.actionBtnOutline}>
                  <Feather name="download" size={14} color="#024a63" />
                  <Text style={styles.actionBtnOutlineText}>Invoice</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleComingSoon("Chat Seller")} style={styles.actionBtnOutline}>
                  <Ionicons name="chatbubble-ellipses-outline" size={14} color="#024a63" />
                  <Text style={styles.actionBtnOutlineText}>Chat</Text>
                </TouchableOpacity>
              </View>
            </View>
            
          </View>
        )}
      </Animatable.View>
    );
  };

  return (
    <View style={styles.container}>
      <ProfileHeader />
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#024a63" />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderOrder}
          ListHeaderComponent={() => (
            <View style={styles.pageHeaderBanner}>
              <View>
                <Text style={styles.pageHeaderTitle}>My Orders</Text>
                <Text style={styles.pageHeaderSubtitle}>Track & manage your purchases</Text>
              </View>
              <View style={styles.ordersCountBadge}>
                <Text style={styles.ordersCountText}>{orders.length} {orders.length === 1 ? 'order' : 'orders'}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
               <Book width={50} height={50} />
              <Text style={styles.emptyText}>Your history is empty</Text>
            </View>
          )}
          contentContainerStyle={orders.length === 0 ? styles.emptyContent : styles.content}
        />
      )}

      <ActionSheet ref={trackSheetRef}>
        <TrackOrder order={selectedOrder} onClose={() => trackSheetRef.current?.hide()} />
      </ActionSheet>

      <ActionSheet ref={returnSheetRef}>
        <ReturnOrderRequest order={selectedReturn} onClose={() => returnSheetRef.current?.hide()} />
      </ActionSheet>

      <ActionSheet ref={reviewSheetRef}>
        <WriteReview order={selectedReview} onClose={() => reviewSheetRef.current?.hide()} />
      </ActionSheet>

      <ActionSheet ref={cancelSheetRef}>
        <CancelOrderRequest order={selectedCancelOrder} onClose={() => cancelSheetRef.current?.hide()} onSuccess={fetchOrders} />
      </ActionSheet>

    </View>
  );
};

export default MyOrders;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingBottom: 100,
  },
  emptyContent: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#eaeaea',
    marginVertical: 12,
  },
  pageHeaderBanner: {
    backgroundColor: '#024a63',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#024a63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  pageHeaderTitle: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'mbold',
  },
  pageHeaderSubtitle: {
    color: '#d1e6ec',
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'Montserrat',
  },
  ordersCountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ordersCountText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'mbold',
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  mainImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    resizeMode: 'cover',
  },
  headerInfo: {
    marginLeft: 12,
    justifyContent: 'center',
    flex: 1,
  },
  itemsCountText: {
    fontFamily: 'mbold',
    fontSize: 14,
    color: '#111',
  },
  moreBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  moreBadgeText: {
    fontSize: 9,
    fontFamily: 'mbold',
    color: '#555',
  },
  orderIdText: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    fontFamily: 'Montserrat',
  },
  productsInfoText: {
    fontSize: 11,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 12,
  },
  priceText: {
    fontFamily: 'mbold',
    fontSize: 15,
    color: '#000',
  },
  qtyText: {
    fontSize: 11,
    fontFamily: 'mbold',
    color: '#333',
  },
  headerRight: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: 90,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusBadgeText: {
    fontSize: 10,
    fontFamily: 'mbold',
  },
  dateContainer: {
    alignItems: 'flex-end',
  },
  dateLabelText: {
    fontSize: 9,
    fontFamily: 'mbold',
    color: '#888',
    marginBottom: 2,
  },
  dateText: {
    fontSize: 11,
    fontFamily: 'mbold',
    color: '#111',
  },
  expandedContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  sectionHeading: {
    fontSize: 11,
    fontFamily: 'mbold',
    color: '#333',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  stepperContainer: {
    marginVertical: 10,
    backgroundColor: '#fafafa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 10,
  },
  stepItem: {
    alignItems: 'center',
    width: 50,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    zIndex: 2,
  },
  stepCircleCompleted: {
    borderColor: '#10b981',
  },
  stepCirclePending: {
    borderColor: '#ddd',
  },
  stepNumber: {
    fontSize: 12,
    fontFamily: 'mbold',
    color: '#aaa',
  },
  stepLabel: {
    fontSize: 9,
    fontFamily: 'Montserrat',
    color: '#888',
    marginTop: 6,
    textAlign: 'center',
  },
  stepLabelActive: {
    color: '#111',
    fontFamily: 'mbold',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#eee',
    marginHorizontal: -15,
    zIndex: 1,
    marginTop: -18,
  },
  stepLineActive: {
    backgroundColor: '#10b981',
  },
  cancelledStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  infoCardsWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
    gap: 8,
  },
  infoCard: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    alignItems: 'flex-start',
  },
  infoIcon: {
    marginRight: 6,
    marginTop: 2,
  },
  infoCardTitle: {
    fontSize: 9,
    fontFamily: 'mbold',
    color: '#777',
    marginBottom: 4,
  },
  infoCardValue: {
    fontSize: 11,
    fontFamily: 'mbold',
    color: '#111',
  },
  infoCardSubValue: {
    fontSize: 10,
    fontFamily: 'Montserrat',
    color: '#666',
    marginTop: 2,
  },
  itemDetailsSection: {
    marginVertical: 12,
  },
  nestedItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  nestedItemImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#eee',
  },
  nestedItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nestedItemName: {
    fontSize: 13,
    fontFamily: 'mbold',
    color: '#222',
  },
  nestedItemQty: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  nestedItemPrice: {
    fontSize: 13,
    fontFamily: 'mbold',
    color: '#000',
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  rightActionGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 8,
    flex: 2,
  },
  actionBtnTextOnly: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  cancelBtnText: {
    fontSize: 12,
    fontFamily: 'mbold',
    color: '#ef4444',
  },
  actionBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    gap: 6,
  },
  actionBtnOutlineText: {
    fontSize: 11,
    fontFamily: 'mbold',
    color: '#024a63',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'mbold',
    color: '#888',
    marginTop: 10,
  },
});
