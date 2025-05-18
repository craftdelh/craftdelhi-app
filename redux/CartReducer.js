import { createSlice } from "@reduxjs/toolkit";

export const CartSlice = createSlice({
    name: 'cart',
    initialState: {
        cart: []
    },
    reducers: {
        addToCart: (state, action) => {
  const item = action.payload;
  const existingItem = state.cart.find(cartItem => cartItem.id === item.id);
  const quantityToAdd = item.quantity || 1; 

  if (existingItem) {
    existingItem.quantity += quantityToAdd;
  } else {
    state.cart.push({ ...item, quantity: quantityToAdd });
  }
},

        removeFromCart: (state, action) => {
            state.cart = state.cart.filter(item => item.id !== action.payload.id);
        },

        incrementQuantity: (state, action) => {
            const item = state.cart.find(item => item.id === action.payload.id);
            if (item) {
                item.quantity++;
            }
        },

        decrementQuantity: (state, action) => {
            const itemPresent = state.cart.find(item => item.id === action.payload.id);
            if (itemPresent) {
                if (itemPresent.quantity === 1) {
                    state.cart = state.cart.filter(item => item.id !== action.payload.id);
                } else {
                    itemPresent.quantity--;
                }
            }
        },
        cleanCart: (state) => {
            state.cart = [];
        }
    }
});


export const { addToCart, removeFromCart, incrementQuantity, decrementQuantity, cleanCart } = CartSlice.actions;


export default CartSlice.reducer;