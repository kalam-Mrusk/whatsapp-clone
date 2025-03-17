import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: [],
};
const allGroupSlice = createSlice({
  name: "value",
  initialState,
  reducers: {
    allGroups: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { allGroups } = allGroupSlice.actions;

export default allGroupSlice.reducer;
