import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import baseUrl from "../utils/baseUrl.js";
const statusSlice = createSlice({
  name: "status",
  initialState: {
    statuses: [],
    galleryData: null,
    loading: false,
    error: null,
  },
  reducers: {
    setStatuses: (state, action) => {
      state.statuses = action.payload;
      state.loading = false;
      state.error = null;
    },
    setGalleryData: (state, action) => {
      state.galleryData = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    removeStatus: (state, action) => {
      const { userId, statusId } = action.payload;
      state.statuses = state.statuses
        .map((userStatus) =>
          userStatus.user._id === userId
            ? {
                ...userStatus,
                statuses: userStatus.statuses.filter((s) => s._id !== statusId),
              }
            : userStatus
        )
        .filter((userStatus) => userStatus.statuses.length > 0);
      if (state.galleryData?.user?._id === userId) {
        state.galleryData = {
          ...state.galleryData,
          statuses: state.galleryData.statuses.filter(
            (s) => s._id !== statusId
          ),
        };
      }
    },

    addStatus: (state, action) => {
      const { newStatus, userDetail } = action.payload;

      const userIndex = state.statuses.findIndex(
        (userStatus) => userStatus.user._id === userDetail._id
      );

      if (userIndex !== -1) {
        state.statuses[userIndex].statuses.unshift(newStatus);
      } else {
        state.statuses.push({
          user: userDetail,
          statuses: [newStatus],
        });
      }

      if (state.galleryData && state.galleryData.user?._id === userDetail._id) {
        state.galleryData = {
          ...state.galleryData,
          statuses: [...(state.galleryData.statuses || []), newStatus],
        };
      }
    },

    updateStatusSeen: (state, action) => {
      const { statusId, userId } = action.payload;
      state.statuses = state.statuses.map((status) => {
        return {
          ...status,
          statuses: status.statuses.map((s) =>
            s._id === statusId
              ? { ...s, seenBy: [...new Set([...s.seenBy, userId])] }
              : s
          ),
        };
      });

      state.galleryData = {
        ...state.galleryData,
        statuses: state.galleryData.statuses.map((s) =>
          s._id === statusId
            ? { ...s, seenBy: [...new Set([...s.seenBy, userId])] }
            : s
        ),
      };
    },
  },
});

export const {
  setStatuses,
  setLoading,
  addStatus,
  removeStatus,
  setGalleryData,
  updateStatusSeen,
} = statusSlice.actions;

export const fetchStatuses = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.get(`${baseUrl}/status/get-status`, {
      withCredentials: true,
    });
    dispatch(setStatuses(response.data?.statuses));
  } catch (error) {
    dispatch(setError(error.response?.data || "Error fetching statuses"));
  }
};

export default statusSlice.reducer;
