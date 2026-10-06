import { Redirect, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import Login from '../../components/Login'
import { useUser } from "../../context/UserContext";
import AsyncStorage from '@react-native-async-storage/async-storage';



export default function Index() {
  const { user, setUser } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);  

  

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          console.log(parsedUser)
          if (parsedUser?.isSeller) {
  router.replace("/(sellerTab)/(sellerTabs)/Home");
} else {
  router.replace("/(tabs)/Home");
}
 
        }
      } catch (err) {
        console.error("Failed to load user from AsyncStorage", err);
      }
      setLoading(false);
    };
    checkLogin();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Login />;
}
