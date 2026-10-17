import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  RefreshControl,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

import HomeCards from '../../../components/Seller/cards/HomeCards';
import PaymnetTable from '../../../components/Seller/payment/PaymnetTable';
import Revenue from '../../../assets/images/revenue.svg';
import Cash from '../../../assets/images/cash.svg';
import Amount from '../../../assets/images/amount.svg';
import Balance from '../../../assets/images/balance.svg';
import { useUser } from '../../../context/UserContext';

const Payments = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const { user } = useUser();

  const [summary, setSummary] = useState({
    total_revenue: 0,
    pending_amount: 0,
    refunded_amount: 0,
  });
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [bankDetails, setBankDetails] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const getEffectiveToken = useCallback(async () => {
    if (user?.token) return user.token;
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const parsed = JSON.parse(userStr);
        return parsed?.token || null;
      }
    } catch (e) {
      console.error('Error reading user token from AsyncStorage:', e);
    }
    return null;
  }, [user]);

  const fetchPaymentsData = useCallback(async () => {
    const token = await getEffectiveToken();
    if (!token) {
      setLoadingSummary(false);
      setLoadingHistory(false);
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };
    const baseUrl = process.env.EXPO_PUBLIC_BASE_URL;

    // 1. Fetch Payment Summary
    try {
      const summaryRes = await axios.get(`${baseUrl}payments/summary`, { headers });
      if (summaryRes.data?.paymentSummary) {
        setSummary(summaryRes.data.paymentSummary);
      }
    } catch (err) {
      console.log('Payment summary fetch error:', err.response?.data || err.message);
    } finally {
      setLoadingSummary(false);
    }

    // 2. Fetch Payment History
    try {
      const historyRes = await axios.get(`${baseUrl}payments/history`, { headers });
      const list = historyRes.data?.data || [];
      setPaymentHistory(list);
    } catch (err) {
      console.log('Payment history fetch error:', err.response?.data || err.message);
    } finally {
      setLoadingHistory(false);
    }

    // 3. Fetch Bank Details (for Withdraw Amount modal)
    try {
      const bankRes = await axios.get(`${baseUrl}profile/getbankdetails`, { headers });
      if (bankRes.data?.status && bankRes.data?.bankDetails) {
        setBankDetails(bankRes.data.bankDetails);
      }
    } catch (err) {
      console.log('Bank details fetch error:', err.response?.data || err.message);
    }
  }, [getEffectiveToken]);

  useEffect(() => {
    fetchPaymentsData();
  }, [fetchPaymentsData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPaymentsData();
    setRefreshing(false);
  }, [fetchPaymentsData]);

  const handleEditBankDetails = () => {
    setShowWithdrawModal(false);
    router.push('/SellerScreens/MyAccount');
  };

  const handleConfirmWithdraw = () => {
    if (!bankDetails || !bankDetails.account_number) {
      Toast.show({
        type: 'info',
        text1: 'Bank Details Missing',
        text2: 'Please add your bank account in My Account before withdrawing.',
      });
      setShowWithdrawModal(false);
      router.push('/SellerScreens/MyAccount');
      return;
    }

    const availableBalance =
      (summary?.total_revenue || 0) -
      (summary?.refunded_amount || 0) -
      (summary?.pending_amount || 0);

    if (availableBalance <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Insufficient Balance',
        text2: 'You have no balance available for withdrawal right now.',
      });
      return;
    }

    Toast.show({
      type: 'success',
      text1: 'Withdrawal Requested',
      text2: `Withdrawal request for ₹${availableBalance.toLocaleString('en-IN')} submitted successfully!`,
    });
    setShowWithdrawModal(false);
  };

  const totalRevenue = summary?.total_revenue || 0;
  const pendingPayment = summary?.pending_amount || 0;
  const refundedAmount = summary?.refunded_amount || 0;
  const totalBalance = totalRevenue - refundedAmount - pendingPayment;

  const cardsData = [
    {
      title: 'Total Revenue',
      count: `₹ ${Number(totalRevenue).toLocaleString('en-IN')}`,
      change: 'No Order Today',
      colors: ['#FFE2E6', 'white'],
      icon: <Revenue />,
    },
    {
      title: 'Pending Payment',
      count: `₹ ${Number(pendingPayment).toLocaleString('en-IN')}`,
      change: '+8 from yesterday',
      colors: ['#FFF4DE', 'white'],
      icon: <Cash />,
    },
    {
      title: 'Refund Amount',
      count: `₹ ${Number(refundedAmount).toLocaleString('en-IN')}`,
      change: '+8 from yesterday',
      colors: ['#DCFCE7', 'white'],
      icon: <Amount />,
    },
    {
      title: 'Total Amount Of Balance',
      count: `₹ ${Number(totalBalance).toLocaleString('en-IN')}`,
      change: '+8 from yesterday',
      colors: ['#F4E8FF', 'white'],
      icon: <Balance />,
      button: true,
      onPressButton: () => setShowWithdrawModal(true),
    },
  ];

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.sideIcon}>
          <Feather name="menu" size={24} color="black" />
        </TouchableOpacity>

        <Text style={styles.title}>Payments</Text>

        <TouchableOpacity onPress={onRefresh} style={styles.sideIcon}>
          <Ionicons name="refresh" size={22} color="#024A63" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#024A63']} />
        }
      >
        <View style={styles.wrapper}>
          <Text style={styles.header}>Payment Summary</Text>

          {loadingSummary ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#024A63" />
              <Text style={styles.loadingText}>Loading summary...</Text>
            </View>
          ) : (
            <HomeCards cardsData={cardsData} />
          )}

          <View style={{ marginTop: 24 }}>
            <PaymnetTable
              data={paymentHistory}
              loading={loadingHistory}
              onOpenWithdraw={() => setShowWithdrawModal(true)}
            />
          </View>
        </View>
      </ScrollView>

      {/* Confirm Payment Details / Withdraw Modal */}
      <Modal
        visible={showWithdrawModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWithdrawModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirm Payment Details</Text>
              <TouchableOpacity
                onPress={() => setShowWithdrawModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="x" size={22} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSubHeader}>
              <Text style={styles.balanceInfoText}>
                Available Balance:{' '}
                <Text style={{ fontWeight: '700', color: '#024A63' }}>
                  ₹{Number(totalBalance).toLocaleString('en-IN')}
                </Text>
              </Text>
              <TouchableOpacity onPress={handleEditBankDetails} style={styles.editBtn}>
                <Text style={styles.editBtnText}>Edit ✎</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalDivider} />

            <View style={styles.bankFieldsContainer}>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>BANK NAME</Text>
                <View style={styles.fieldBox}>
                  <Text style={styles.fieldValue}>{bankDetails?.bank_name || 'Not provided'}</Text>
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>BRANCH LOCATION</Text>
                <View style={styles.fieldBox}>
                  <Text style={styles.fieldValue}>{bankDetails?.branch_location || 'Not provided'}</Text>
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>ACCOUNT HOLDER NAME</Text>
                <View style={styles.fieldBox}>
                  <Text style={styles.fieldValue}>
                    {bankDetails?.account_holder_name || 'Not provided'}
                  </Text>
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>ACCOUNT NUMBER</Text>
                <View style={styles.fieldBox}>
                  <Text style={styles.fieldValue}>{bankDetails?.account_number || 'Not provided'}</Text>
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>IFSC CODE</Text>
                <View style={styles.fieldBox}>
                  <Text style={styles.fieldValue}>{bankDetails?.ifsc_code || 'Not provided'}</Text>
                </View>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setShowWithdrawModal(false)}
                style={styles.cancelBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmWithdraw}
                style={styles.withdrawActionBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.withdrawActionBtnText}>Withdraw</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Payments;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  title: {
    fontFamily: 'mbold',
    fontSize: 18,
    textAlign: 'center',
    color: '#111',
  },
  sideIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrapper: {
    marginTop: 10,
    paddingBottom: 40,
  },
  header: {
    fontFamily: 'mbold',
    fontSize: 20,
    marginBottom: 10,
    color: '#000',
  },
  loadingBox: {
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#666',
    fontSize: 13,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 480,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'mbold',
    color: '#111',
  },
  modalSubHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  balanceInfoText: {
    fontSize: 13,
    color: '#444',
  },
  editBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  editBtnText: {
    color: '#024A63',
    fontWeight: '700',
    fontSize: 13,
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 14,
  },
  bankFieldsContainer: {
    gap: 12,
  },
  fieldGroup: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: 10,
    fontFamily: 'mbold',
    color: '#222',
    letterSpacing: 0.8,
  },
  fieldBox: {
    backgroundColor: '#F7F8F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  fieldValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D0D5DD',
  },
  cancelBtnText: {
    color: '#344054',
    fontSize: 13,
    fontWeight: '600',
  },
  withdrawActionBtn: {
    backgroundColor: '#024A63',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  withdrawActionBtnText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
  },
});