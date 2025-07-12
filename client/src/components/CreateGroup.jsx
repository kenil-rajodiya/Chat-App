import React, { useContext, useState,useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import toast from "react-hot-toast";
import assets from "../assets/assets";

const CreateGroupPage = () => {
  const { axiosInstance, authUser, navigate } = useContext(AuthContext);
  const { users,getUsers } = useContext(ChatContext);

  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
    const [search, setSearch] = useState("");
        useEffect(() => {
          getUsers();
        }, []);


  const handleCheckboxChange = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!groupName.trim()) {
      return toast.error("Group name is required.");
    }

    if (selectedUsers.length === 0) {
      return toast.error("Select at least one member.");
    }

    try {
      const response = await axiosInstance.post("/api/group/create", {
        name: groupName,
        membersIds: selectedUsers,
      });

      if (response.data.success) {
        toast.success("Group created!");
        navigate("/group");
      }
    } catch (err) {
      toast.error("Failed to create group.");
      console.error(err);
    }
  };

  // Filter users based on search and exclude the current user
  const filteredUsers = users
    .filter((u) => u._id !== authUser._id)
    .filter((u) =>
      u.fullName.toLowerCase().includes(search.trim().toLowerCase())
    )
    .slice(0, search.trim() ? users.length : 5); // Show max 5 if no search

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br text-white">
      <div className="max-w-xl mx-auto bg-gray-800 p-6 rounded-lg shadow-lg">
          <img src={assets.arrow_icon} alt="" className="h-6 cursor-pointer" onClick={() => navigate('/group')} />
        <div className="flex justify-center">
          <h2 className="text-xl font-semibold mb-4">Create New Group</h2>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Group Name"
            className="p-2 bg-gray-700 border border-gray-600 rounded"
            required
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="p-2 bg-gray-700 border border-gray-600 rounded"
          />

          <div className="max-h-60 overflow-y-auto border border-gray-700 rounded p-2 space-y-2 bg-gray-900">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <label
                  key={user._id}
                  className="flex items-center gap-3 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user._id)}
                    onChange={() => handleCheckboxChange(user._id)}
                  />
                  <span>{user.fullName}</span>
                </label>
              ))
            ) : (
              <p className="text-sm text-gray-400">No users found.</p>
            )}
          </div>

          <button
            type="submit"
            className="bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded text-white"
          >
            Create Group
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupPage;
