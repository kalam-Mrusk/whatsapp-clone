import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import axios from "axios";
import {
  loginFailure,
  loginSuccess,
  updateUserActive,
} from "../src/redux/user.slice.js";
import { loadingEnd } from "../src/redux/loading.slice.js";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { allUsers } from "./redux/allUser.slice.js";
import { getConversations } from "./redux/conversations.slice.js";
import { allGroups } from "./redux/allGroup.slice.js";
import baseUrl from "./utils/baseUrl.js";
import { ClipLoader } from "react-spinners";
import { socket } from "./socket.js";
import Loader from "./components/loader/Loader.jsx";
function App() {
  const dispatch = useDispatch();
  const refresh = useSelector((state) => state.loading.refresh);
  const loading = useSelector((state) => state.loading.status);
  const loggedInUser = useSelector((state) => state.user.value?.user);
  const getCurrentUser = async () => {
    try {
      const res = await axios.get(
        `${baseUrl}/user/get-current-user`,

        {
          withCredentials: true,
        }
      );
      dispatch(loginSuccess(res.data?.data));
      window.localStorage.setItem("userId", res.data.data.user._id);
      dispatch(loadingEnd());
    } catch (error) {
      console.log(error);
      dispatch(loginFailure());
      dispatch(loadingEnd());
      window.localStorage.removeItem("userId");
    }
  };
  const getAllUser = async () => {
    try {
      const res = await axios.get(
        `${baseUrl}/user/all-user`,

        {
          withCredentials: true,
        }
      );
      dispatch(allUsers(res.data.data.allUser));
    } catch (error) {
      console.log(error);
    }
  };
  const getAllgroup = async () => {
    try {
      const res = await axios.get(
        `${baseUrl}/group/all-group`,

        {
          withCredentials: true,
        }
      );
      dispatch(allGroups(res.data.data));
    } catch (error) {
      console.log(error);
    }
  };
  const conversationList = async () => {
    try {
      const res = await axios.get(
        `${baseUrl}/message/conversations`,

        {
          withCredentials: true,
        }
      );
      dispatch(getConversations(res.data.conversations));
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (loggedInUser?._id) {
      socket.emit("userOnline", loggedInUser._id);
    }

    socket.on("updateAllUserStatus", (onlineUsers) => {
      dispatch(updateUserActive(onlineUsers)); // Store in Redux
    });

    return () => {
      socket.off("updateAllUserStatus");
    };
  }, [loggedInUser, dispatch]);
  useEffect(() => {
    getCurrentUser();
    getAllUser();
    conversationList();
    getAllgroup();
  }, [refresh]);

  return (
    <>
      {loading && <Loader />}
      <Outlet />
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition:Bounce
      />
    </>
  );
}

export default App;
