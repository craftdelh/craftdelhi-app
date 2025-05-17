import { createSlice } from "@reduxjs/toolkit";

export const WishlistSlice = createSlice({
    name: 'wishlist',
    initialState: {
        wishlist: []
    },
    reducers: {
        addToWishlist: (state, action) => {
            const itemPresent = state.wishlist.find(item => item.id === action.payload.id);
            if (!itemPresent) {
                state.wishlist.push(action.payload);
            }
        },

        removeFromWishlist: (state, action) => {
            state.wishlist = state.wishlist.filter(item => item.id !== action.payload.id);
        },

        cleanWishlist: (state) => {
            state.wishlist = [];
        }
    }
});

export const { addToWishlist, removeFromWishlist, cleanWishlist } = WishlistSlice.actions;

export default WishlistSlice.reducer;