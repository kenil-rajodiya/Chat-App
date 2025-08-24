import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const backendUrl = "https://chat-app-backend-c7my.onrender.com";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true); // ← new
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();
  const [onlineUsers, setOnlineUsers] = useState([]);

  const axiosInstance = axios.create({
    baseURL: backendUrl,
    headers: token ? { token } : {},
  });

  const connectSocket = (user) => {
    if (!user || socket?.connected) return;
    const sock = io(backendUrl, { query: { userId: user._id } });
    sock.on("getOnlineUsers", setOnlineUsers);
    setSocket(sock);
  };

  const checkAuth = async () => {
    try {
      const { data } = await axiosInstance.get("/api/auth/check");
      if (data.success) {
        setAuthUser(data.data.user);
        connectSocket(data.data.user);
      }
    } catch (err) {
      setAuthUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(false);
    checkAuth();
  }, []);

  const login = async (state, credentials) => {
    try {
      const { data } = await axiosInstance.post(
        `/api/auth/${state}`,
        credentials
      );

      if (data.success) {
        setAuthUser(data.data.userData);
        connectSocket(data.data.userData);
        localStorage.setItem("token", data.data.token);
        axiosInstance.defaults.headers.common["token"] = data.data.token;
        toast.success(data.data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const logout = async () => {
    localStorage.removeItem("token");
    setAuthUser(null);
    setOnlineUsers([]);
    axiosInstance.defaults.headers.common["token"] = null;
    socket?.disconnect();
    toast.success("Logged out successfully");
  };

  const updateProfile = async (body) => {
    try {
      const { data } = await axiosInstance.put(
        "/api/auth/update-profile",
        body
      );
      if (data.data.success) {
        setAuthUser(data.data.user);
        toast.success("Profile updated successfully.");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        authUser,
        loading, 
        axiosInstance,
        onlineUsers,
        socket,
        navigate,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
