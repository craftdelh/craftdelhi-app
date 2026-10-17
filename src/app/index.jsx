import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

import Login from '../../components/Login';
import { useUser } from "../../context/UserContext";
import { isTokenExpired, clearAuthSession } from "../utils/auth";

export default function Index() {
  const { setUser } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);

          // 7-day or JWT expiration check
          if (isTokenExpired(parsedUser)) {
            await clearAuthSession();
            setUser(null);
            Toast.show({
              type: 'info',
              text1: 'Session Expired',
              text2: 'Your 7-day session has expired. Please login again.',
            });
            router.replace('/auth/Signin');
            return;
          }

          setUser(parsedUser);
          if (parsedUser?.isSeller) {
            router.replace("/(sellerTab)/(sellerTabs)/Home");
          } else {
            router.replace("/(tabs)/Home");
          }
          return;
        }
      } catch (err) {
        console.error("Failed to load user from AsyncStorage", err);
      } finally {
        setLoading(false);
      }
    };

    checkLogin();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#024A63" />
      </View>
    );
  }

  return <Login />;
}
