import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";

import CartReducer from "./redux/CartReducer.js";
import wishlistReducer from "./redux/WishListReducer.js";

const cartPersistConfig = {
  key: "cart",
  storage: AsyncStorage,
};

const wishlistPersistConfig = {
  key: "wishlist",
  storage: AsyncStorage,
};

const rootReducer = combineReducers({
  cart: persistReducer(cartPersistConfig, CartReducer),
  wishlist: persistReducer(wishlistPersistConfig, wishlistReducer),
});

const persistedReducer = rootReducer;

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

const persistor = persistStore(store);

export { store, persistor };
