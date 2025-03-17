import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: null,
  onlineUsers: [],
};
const userSlice = createSlice({
  name: "value",
  initialState,
  reducers: {
    updateUserActive: (state, action) => {
      state.onlineUsers = action.payload;
    },
    loginSuccess: (state, action) => {
      state.value = action.payload;
    },
    loginFailure: (state) => {
      state.value = null;
    },
  },
});

export const { loginSuccess, loginFailure, updateUserActive } =
  userSlice.actions;

export default userSlice.reducer;
