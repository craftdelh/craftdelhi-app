import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import Login from '../components/Login'
import { useUser } from "../context/UserContext";
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function Index() {
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   const unsubscribe = auth.onAuthStateChanged((user) => {
  //     setUser(user);
  //     setLoading(false);
  //   });
  //   return unsubscribe;
  // }, []);
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData)); 
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

  return (
    <View style={{ flex: 1 }}>
    {user ? <Redirect href={'/(tabs)/Home'} /> : <Login />}
     {/* {user ? <Redirect href={'/home'} /> : <Redirect href={'/auth/Final'} />} */}
  </View>
  );
}
