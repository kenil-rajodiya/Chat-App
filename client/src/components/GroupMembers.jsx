import React, { useContext } from "react";
import { GroupChatContext } from "../../context/GroupChatContext";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";

const GroupMembers = () => {
  const navigate = useNavigate();
  const { selectedGroup, setSelectedGroup } = useContext(GroupChatContext);

  if (!selectedGroup) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-500 bg-white/10 max-md:hidden">
        <img src={assets.logo_icon} className="w-16" alt="logo" />
        <p className="text-lg font-medium text-white">No Group Selected</p>
      </div>
    );
  }

  const members = selectedGroup.members.filter(
    (m) => m._id !== selectedGroup.admin._id
  );
  const allMembers = [selectedGroup.admin, ...members];

  return (
    <div className="w-full h-screen sm:px-[15%] sm:py-[5%]">
      <div className="h-full w-full backdrop-blur-xl border-2 border-gray-600 rounded-2xl overflow-hidden bg-[#8185B2]/10 p-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-600 pb-4 mb-6">
          <p className="text-xl font-semibold text-white">
            {selectedGroup.name} Members
          </p>
          <img
            onClick={() => navigate(-1)}
            src={assets.arrow_icon}
            alt="back"
            className="w-6 cursor-pointer hover:opacity-80"
          />
        </div>

        {/* Members List */}
        <div className="grid gap-4 sm:grid-cols-2">
          {allMembers.map((user) => (
            <div
              key={user._id}
              className="flex items-center gap-4 p-4 rounded-xl bg-[#282142]/60 border border-gray-600 hover:bg-[#282142]/80 transition-all"
            >
              <img
                src={user.profilePic || assets.avatar_icon}
                alt={user.fullName}
                className="w-12 h-12 rounded-full object-cover border border-gray-500"
              />
              <div>
                <p className="text-white font-medium">{user.fullName}</p>
                <p className="text-xs text-gray-400">
                  {user._id === selectedGroup.admin._id ? "Admin" : "Member"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GroupMembers;
