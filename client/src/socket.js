import { io } from "socket.io-client";
const backendSeverUrl = import.meta.env.VITE_BACKEND_SERVER_URL;
const socket = io(`${backendSeverUrl}`, {
  query: {
    userId: window.localStorage.getItem("userId"),
  },
});

export { socket };
