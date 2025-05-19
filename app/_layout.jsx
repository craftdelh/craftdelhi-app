import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from 'react-redux';
import { store, persistor } from '../store'; 
import { PersistGate } from 'redux-persist/integration/react';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';


SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    'msemibold': require('../assets/fonts/Montserrat-SemiBold.ttf'),
    'mregular': require('../assets/fonts/Montserrat-Regular.ttf'),
    'mmedium': require('../assets/fonts/Montserrat-Medium.ttf'),
    'mextrabold': require('../assets/fonts/Montserrat-ExtraBold.ttf'),
    'mbold': require('../assets/fonts/Montserrat-Bold.ttf'),
  });

  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      setAppReady(true);
    }
  }, [loaded]);

  if (!appReady) {
    return null; 
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <SafeAreaView style={{flex:1}}>
            <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
          </Stack>
          </SafeAreaView>
            <Toast />
            </PersistGate>
       </Provider>
    </GestureHandlerRootView>
  );
}