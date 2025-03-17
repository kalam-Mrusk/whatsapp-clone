import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: [],
};
const allUserSlice = createSlice({
  name: "value",
  initialState,
  reducers: {
    allUsers: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { allUsers } = allUserSlice.actions;

export default allUserSlice.reducer;
