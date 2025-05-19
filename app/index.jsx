import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import Login from '../components/Login'


export default function Index() {
  const [user, setUser] = useState(false);
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   const unsubscribe = auth.onAuthStateChanged((user) => {
  //     setUser(user);
  //     setLoading(false);
  //   });
  //   return unsubscribe;
  // }, []);

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
