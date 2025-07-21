// import { createContext, useEffect, useState } from "react";
// import axios from "axios";
// import toast from "react-hot-toast";
// import { io } from "socket.io-client";
// import { Navigate, useNavigate } from "react-router-dom";

// const backendUrl = "http://localhost:5000"

// const axiosInstance = axios.create({
//   baseURL: backendUrl || "http://localhost:5000",
// });
// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const navigate = useNavigate();
//   const [token, setToken] = useState(localStorage.getItem("token"));
//   const [authUser, setAuthUser] = useState(null);
//   const [onlineUsers, setOnlineUsers] = useState([]);
//   const [socket, setSocket] = useState(null);

//   //Check if user is authenticated and if so , set user data and connect the socket
//   const checkAuth = async () => {
//     try {
//       const response = await axiosInstance.get("/api/auth/check");
//       const data = response.data;
//       // console.log(data);

//       if (data.success) {
//         setAuthUser(data.data.user);
//         connectSocket(data.data.user);
//         navigate('/')
//       }
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   //  Login function to handle user authentication and socket connection

//   const login = async (state, credentials) => {
//     try {
//       const response = await axiosInstance.post(`/api/auth/${state}`, credentials);
//       console.log(response);

//       if ((response.data.success)) {
//         setAuthUser(response.data.data.userData);
//         connectSocket(response.data.data.userData);
//         axiosInstance.defaults.headers.common["token"] = response.data.data.token;
//         setToken(response.data.data.token);
//         localStorage.setItem("token", response.data.data.token);
//         toast.success(response.data.data.message);
//       } else {
//         toast.error(response.data.message);
//       }
//     } catch (error) {
//       console.log(error);
//       toast.error(error.message);
//     }
//   };

//   // Logout function to handle user logout ans socket disconnection
//   const logout = async () => {
//     localStorage.setItem("token", "");
//     setToken(null);
//     setAuthUser(null);
//     setOnlineUsers([]);
//     axiosInstance.defaults.headers.common["token"] = null;
//     toast.success("Logged out successfully");
//     socket.disconnect();
//   };

//   // Update profile function to handle user profile updates
//   const updateProfile = async (body) => {
//     try {
//       const response = await axiosInstance.put(
//         "/api/auth/update-profile",
//         body
//       );
//       // console.log(response);

//       const data = response.data.data;
//       // console.log(data.user);

//       if (data.success) {
//         setAuthUser(data.user);
//         toast.success("Profile updated successfully.");
//       }
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   // Connect socket function to handle socket connection and online users update
//   const connectSocket = (userData) => {
//     if (!userData || socket?.connected) return;
//     const newSocket = io(backendUrl, {
//       query: {
//         userId: userData._id,
//       },
//     });
//     newSocket.connect();
//     setSocket(newSocket);

//     newSocket.on("getOnlineUsers", (userIds) => {
//       setOnlineUsers(userIds);
//     });
//   };

//   useEffect(() => {
//     if (token) {
//       axiosInstance.defaults.headers.common["token"] = token;
//     }
//     checkAuth();
//   }, []);

//   const value = {
//     axiosInstance,
//     authUser,
//     onlineUsers,
//     socket,
//     navigate,
//     login,
//     logout,
//     updateProfile,
//   };
//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

// src/context/AuthContext.jsx
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
    // eslint-disable-next-line
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
        loading, // ← expose loading
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
