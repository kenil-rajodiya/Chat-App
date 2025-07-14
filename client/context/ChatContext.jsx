import {
  Children,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { AuthContext } from "./AuthContext.jsx";
import toast from "react-hot-toast";
import axios from "axios";

export const ChatContext = createContext();
export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});
  const { axiosInstance, socket } = useContext(AuthContext);
 
 
  // Function to get All users for sidebar

  const getUsers = async () => {
    try {
      const response = await axiosInstance.get("/api/messages/users");
      const data = response.data.data;
      console.log(data);

      if (response.data.success) {
        setUsers(data.filteredUsers);
        setUnseenMessages(data.unSeenMessages);
      }
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
    }
  };

  // Function to get messages for selected user

  const getMessages = async (userId) => {
    try {
      const res = await axiosInstance.get(`/api/messages/${userId}`);

      const data = res.data.data;
      // console.log(data);
      if (data) {
        setMessages(data);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
    }
  };

  // Function to send ,essage to selected User

  const sendMessage = async (messageData) => {
    try {
      const res = await axiosInstance.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData
      );
      const data = res.data.data;

      if (res.data.success) {
        setMessages((prevMessages) => [...prevMessages, data]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
    }
  };

  // Function to subscribe to messages for selected User

  const subscribeToMessages = async () => {
    if (!socket) return;
    socket.on("newMessage", async (newMessage) => {
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        newMessage.seen = true;
        setMessages((prev) => [...prev, newMessage]);
        const res = await axiosInstance.put(
          `/api/messages/mark/${newMessage._id}`
        );
        console.log(res);
      } else {
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.senderId]: prev[newMessage.senderId]
            ? prev[newMessage.senderId] + 1
            : 1,
        }));
      }
    });
  };

  // Function to unsubscribe from messages
  const unsubscribeFromMessages = () => {
    if (socket) {
      socket.off("newMessage");
    }
  };

 

  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [socket, selectedUser]);

  const value = {
    messages,
    users,
    selectedUser,
    unseenMessages,
    getUsers,
    getMessages,
    sendMessage,
    setSelectedUser,
    setUnseenMessages,
  };
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
