import { useFonts } from 'expo-font';
import { Slot, Stack, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from 'react-redux';
import { store, persistor } from '../../store'; 
import { PersistGate } from 'redux-persist/integration/react';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserProvider } from '../../context/UserContext';
import { View } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    'msemibold': require('../../assets/fonts/Montserrat-SemiBold.ttf'),
    'mregular': require('../../assets/fonts/Montserrat-Regular.ttf'),
    'mmedium': require('../../assets/fonts/Montserrat-Medium.ttf'),
    'mextrabold': require('../../assets/fonts/Montserrat-ExtraBold.ttf'),
    'mbold': require('../../assets/fonts/Montserrat-Bold.ttf'),
  });

  const [appReady, setAppReady] = useState(false);
   const pathname = usePathname();

   const noSafeAreaRoutes = ['/Reels'];

  const shouldUseSafeArea = !noSafeAreaRoutes.includes(pathname);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      setAppReady(true);
    }
  }, [loaded]);

  if (!appReady) {
    return null; 
  }
  const Wrapper = shouldUseSafeArea ? SafeAreaView : View;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
           <UserProvider>
          <Wrapper  style={{flex:1}}>
            <Stack screenOptions={{ headerShown: false }} />
          </Wrapper >
          </UserProvider>
            <Toast />
            </PersistGate>
       </Provider>
    </GestureHandlerRootView>
  );
}