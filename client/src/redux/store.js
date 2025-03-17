import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./user.slice.js";
import loadingReducer from "./loading.slice.js";
import allUsersReducer from "./allUser.slice.js";
import conversationsReducer from "./conversations.slice.js";
import allGroupReducer from "./allGroup.slice.js";
import statusReducer from "./status.slice.js";
const store = configureStore({
  reducer: {
    user: userReducer,
    loading: loadingReducer,
    alluser: allUsersReducer,
    conversationsList: conversationsReducer,
    allGroup: allGroupReducer,
    status: statusReducer,
  },
});

export default store;
