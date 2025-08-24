import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const GroupChatContext = createContext();

export const GroupChatProvider = ({ children }) => {
  const [groups, setGroups] = useState([]);
  const [groupMessages, setGroupMessages] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [unseenGroupMessages, setUnseenGroupMessages] = useState({});
  const { axiosInstance, socket, authUser, navigate } = useContext(AuthContext);
  const [members, setMembers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const getGroups = async () => {
    try {
      const res = await axiosInstance.get("/api/group/get");
      if (res.data.success) {
        setGroups(res.data.data);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const getGroupMessages = async (groupId) => {
    try {
      if (!groupId) return;
      const res = await axiosInstance.get(`/api/group-messages/${groupId}`);
      if (res.data.success) {
        setGroupMessages(res.data.data);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };


  const sendGroupMessage = async (messageData) => {
    try {
      if (!selectedGroup || !messageData) return;

      const res = await axiosInstance.post(
        `/api/group-messages/send/${selectedGroup._id}`,
        messageData
      );

      if (res.data.success) {
        const newMsg = res.data.data;
        const enrichedMsg = {
          ...newMsg,
          senderId: {
            _id: authUser._id,
            fullName: authUser.fullName,
            profilePic: authUser.profilePic,
          },
        };

        setGroupMessages((prev) => [...prev, enrichedMsg]);
        socket?.emit("sendGroupMessage", enrichedMsg);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };


  const leaveGroup = async () => {
    if (isAdmin) {
      toast.error("Transfer admin rights before leaving.");
      return;
    }

    const res = await axiosInstance.put(
      `/api/group/removeSelf/${selectedGroup._id}`
    );
    if (res) {
      toast.success("You have been removed from the group.");
      navigate("/");
    } else {
      toast.error("Error");
    }
  };


  const removeMember = async (id) => {
    if (!isAdmin) {
      toast.error("Only Admin can remove members.");
      return;
    }

    const res = await axiosInstance.put(
      `/api/group/removeMember/${selectedGroup?._id}`,
      { memberId: id }
    );

    if (!res) {
      toast.error("Internal server error.");
      return;
    }

    toast.success("Member removed successfully.");
    setSelectedGroup((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m._id !== id),
    }));
  };


  const editNameOfGroup = async (name) => {
    try {
      const res = await axiosInstance.put(
        `/api/group/editName/${selectedGroup?._id}`,
        { name }
      );
      if (res) {
        toast.success("Group name changed successfully");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };


  const addMember = async (memberId) => {
    if (!selectedGroup?._id) {
      toast.error("Select a group first.");
      return;
    }

    try {
      const res = await axiosInstance.put(
        `/api/group/addMember/${selectedGroup._id}`,
        { memberId }
      );

      if (res.data.success && res.data.data) {
        toast.success("Member added successfully.");
        setSelectedGroup(res.data.data);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to add member.");
    }
  };


  const changeAdmin = async (newAdminId) => {
    const res = await axiosInstance.put(
      `/api/group/changeAdmin/${selectedGroup?._id}`,
      {
        newAdminId,
      }
    );
    console.log(res);
    if (res.data.success) {
      toast.success("Admin Changed successfully and redirecting to home page.");
      setIsAdmin(newAdminId);
      navigate('/group')
    } else {
      toast.error("Error while changing admin.")
    }
  };


  useEffect(() => {
    if (!socket || !selectedGroup?._id) return;

    socket.emit("joinGroup", selectedGroup._id);
    return () => {
      socket.emit("leaveGroup", selectedGroup._id);
    };
  }, [socket, selectedGroup]);


  useEffect(() => {
    if (!socket) return;

    const handler = (newMessage) => {
      setGroupMessages((prev) => {
        const exists = prev.some((msg) => msg._id === newMessage._id);
        return exists ? prev : [...prev, newMessage];
      });

      if (!selectedGroup || selectedGroup._id !== newMessage.groupId) {
        setUnseenGroupMessages((prev) => ({
          ...prev,
          [newMessage.groupId]: (prev[newMessage.groupId] || 0) + 1,
        }));
      }
    };

    socket.on("receiveGroupMessage", handler);
    return () => socket.off("receiveGroupMessage", handler);
  }, [socket, selectedGroup]);

  const value = {
    groups,
    selectedGroup,
    setSelectedGroup,
    isAdmin,
    setIsAdmin,
    changeAdmin,
    groupMessages,
    getGroupMessages,
    sendGroupMessage,
    unseenGroupMessages,
    setUnseenGroupMessages,
    getGroups,
    removeMember,
    addMember,
    leaveGroup,
    editNameOfGroup,
    members,
    setMembers,
  };

  return (
    <GroupChatContext.Provider value={value}>
      {children}
    </GroupChatContext.Provider>
  );
};
