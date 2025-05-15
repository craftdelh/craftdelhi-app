import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore'
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_PUBLIC_KEY,
  authDomain: "petadopt-d4bc6.firebaseapp.com",
  projectId: "petadopt-d4bc6",
  storageBucket: "petadopt-d4bc6.appspot.com",
  messagingSenderId: "232278784977",
  appId: "1:232278784977:web:d935bcbab776db83ab3ef0"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth =initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });;
  export const db= getFirestore(app);
  export const storage = getStorage(app);