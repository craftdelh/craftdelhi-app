import { configureStore } from "@reduxjs/toolkit";

import CartReducer from './redux/CartReducer'
import wishlistReducer from './redux/WishListReducer'

const store =  configureStore({
    reducer: {
        cart: CartReducer,
        wishlist:wishlistReducer
    }
})
export default store;