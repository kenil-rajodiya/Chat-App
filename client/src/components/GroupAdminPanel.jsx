import React, { useContext, useEffect, useState } from "react";
import { GroupChatContext } from "../../context/GroupChatContext";
import assets from "../assets/assets";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import toast from "react-hot-toast";

const GroupAdminPanel = () => {
  const {
    selectedGroup,
    removeMember,
    addMember,
    editNameOfGroup,
    changeAdmin,
  } = useContext(GroupChatContext);
  const { authUser, navigate } = useContext(AuthContext);
  const { axiosInstance } = useContext(AuthContext);
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const response = await axiosInstance.get("/api/messages/users");
    setUsers(response.data.data.filteredUsers);
  };

  const handleAdd = (memberId) => {
    addMember(memberId);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const [groupName, setGroupName] = useState(selectedGroup?.name || "");
  const [searchAdd, setSearchAdd] = useState("");
  const [searchRemove, setSearchRemove] = useState("");
  const [selectedNewAdminId, setSelectedNewAdminId] = useState("");

  const nonGroupUsers = users.filter(
    (user) =>
      !selectedGroup?.members.some((m) => m._id === user._id) &&
      user._id !== selectedGroup?.admin._id
  );

  const filteredAddUsers = nonGroupUsers.filter((user) =>
    user.fullName.toLowerCase().includes(searchAdd.toLowerCase())
  );

  const filteredRemoveUsers = selectedGroup?.members
    .filter((m) => m._id !== selectedGroup?.admin._id)
    .filter((user) =>
      user?.fullName?.toLowerCase().includes(searchRemove?.toLowerCase())
    );

  const groupMembersForAdminChange =
    selectedGroup?.members.filter((m) => m._id !== selectedGroup.admin._id) ||
    [];

  return (
    <div className="flex min-h-screen items-center justify-center px-3 py-8 sm:px-5 bg-cover bg-no-repeat">
      <div className="w-full max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex flex-col sm:flex-row items-center justify-between rounded-lg overflow-hidden max-sm:gap-4">
        <div className="flex flex-col gap-6 p-6 sm:p-8 w-full">
          <img
            onClick={() => navigate('/group')}
            src={assets.arrow_icon}
            alt="back"
            className="md:hidden max-w-7 cursor-pointer"
          />
          <h2 className="text-lg  sm:text-xl font-semibold text-center text-white">
            Admin Controls - {selectedGroup?.name}
          </h2>

          <div>
            <h3 className="text-lg font-semibold mb-2">Edit Group Name</h3>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter new group name"
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded mb-2"
            />
            <button
              onClick={() => editNameOfGroup(groupName)}
              className="bg-violet-600 px-4 py-1 rounded text-sm w-fit"
            >
              Update Name
            </button>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Change Admin</h3>
            <select
              value={selectedNewAdminId}
              onChange={(e) => setSelectedNewAdminId(e.target.value)}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded mb-2"
            >
              <option value="">Select a member</option>
              {groupMembersForAdminChange?.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.fullName}
                </option>
              ))}
            </select>
            <button
              className="bg-yellow-500 px-4 py-1 rounded text-sm w-fit"
              onClick={() => {
                if (!selectedNewAdminId) {
                  toast.error("Select a member first.");
                  return;
                }
                changeAdmin(selectedNewAdminId);
              }}
            >
              Change Admin
            </button>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Add Member</h3>
            <input
              type="text"
              value={searchAdd}
              onChange={(e) => setSearchAdd(e.target.value)}
              placeholder="Search users..."
              className="w-full p-2 mb-3 bg-gray-800 border border-gray-600 rounded"
            />
            <div className="max-h-40 overflow-y-auto space-y-2">
              {filteredAddUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-2 bg-gray-700 rounded"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={user.profilePic || assets.avatar_icon}
                      alt=""
                      className="w-8 h-8 rounded-full"
                    />
                    <p>{user?.fullName}</p>
                  </div>
                  <button
                    className="bg-violet-500 px-3 py-1 rounded text-sm"
                    onClick={() => handleAdd(user._id)}
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Remove Member</h3>
            <input
              type="text"
              value={searchRemove}
              onChange={(e) => setSearchRemove(e.target.value)}
              placeholder="Search members..."
              className="w-full p-2 mb-3 bg-gray-800 border border-gray-600 rounded"
            />
            <div className="max-h-40 overflow-y-auto space-y-2">
              {filteredRemoveUsers?.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-2 bg-gray-700 rounded"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={user.profilePic || assets.avatar_icon}
                      alt=""
                      className="w-8 h-8 rounded-full"
                    />
                    <p>{user.fullName}</p>
                  </div>
                  <button
                    className="bg-red-500 px-3 py-1 rounded text-sm"
                    onClick={() => {
                      removeMember(user._id);
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <button className="bg-red-700 px-6 py-2 rounded-full text-white text-sm hover:bg-red-800">
              Delete Group
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupAdminPanel;
