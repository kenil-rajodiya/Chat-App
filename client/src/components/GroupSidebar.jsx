import React, { useContext, useEffect, useRef, useState } from "react";
import assets from "../assets/assets.js";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext.jsx";
import { GroupChatContext } from "../../context/GroupChatContext.jsx";

// Tailwind background color pool
const bgColors = [
  "bg-red-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-orange-500",
  "bg-teal-500",
];

// Stable color generator based on group._id
const getColorClass = (str) => {
  const hash = [...str].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = hash % bgColors.length;
  return bgColors[index];
};

const GroupSidebar = () => {
  const navigate = useNavigate();
  const { logout, authUser } = useContext(AuthContext);
  const [input, SetInput] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef();

  const {
    groups,
    selectedGroup,
    setSelectedGroup,
    isAdmin,
    setIsAdmin,
    getGroups,
    unseenGroupMessages,
    setUnseenGroupMessages,
    setMembers,
  } = useContext(GroupChatContext);

  const filteredGroups = input
    ? groups.filter((group) =>
        group.name.toLowerCase().includes(input.toLowerCase())
      )
    : groups;

  useEffect(() => {
    getGroups();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-scroll text-white ${
        selectedGroup ? "max-md:hidden" : ""
      }`}
    >
      {/* Header */}
      <div className="pb-5">
        <div className="flex justify-between items-center">
          <img src={assets.logo} alt="logo" className="max-w-40" />

          <div className="relative py-2 flex flex-row gap-2" ref={menuRef}>
            <img
              src={assets.add}
              alt="Add"
              className="h-5 cursor-pointer"
              title="Create Group"
              onClick={() => navigate("/createGroup")}
            />
            <img
              src={assets.menu_icon}
              alt="Menu"
              className="h-5 cursor-pointer"
              onClick={() => setIsMenuOpen((prev) => !prev)}
            />
            {isMenuOpen && (
              <div className="absolute top-full right-0 z-20 w-32 p-5 mt-2 rounded-md bg-[#282142] border border-gray-600 text-gray-100">
                <p
                  onClick={() => {
                    navigate("/");
                    setIsMenuOpen(false);
                  }}
                  className="cursor-pointer text-sm"
                >
                  Direct Chat
                </p>
                <hr className="my-2 border-t border-gray-500" />
                <p
                  onClick={() => {
                    navigate("/profile");
                    setIsMenuOpen(false);
                  }}
                  className="cursor-pointer text-sm"
                >
                  Edit Profile
                </p>
                <hr className="my-2 border-t border-gray-500" />
                <p
                  className="cursor-pointer text-sm"
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                >
                  Logout
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-[#282142] rounded-full flex items-center gap-2 py-3 px-4 mt-5">
          <img src={assets.search_icon} alt="Search" className="w-3" />
          <input
            autoComplete="off"
            onChange={(e) => SetInput(e.target.value)}
            type="text"
            className="bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1"
            placeholder="Search group..."
          />
        </div>
      </div>

      {/* Group List */}
      <div className="flex flex-col">
        {filteredGroups.map((group, index) => (
          <div
            key={index}
            onClick={() => {
              setSelectedGroup(group);
              setIsAdmin(authUser?._id === group?.admin._id);
              setMembers(group.members);
              setUnseenGroupMessages((prev) => ({
                ...prev,
                [group._id]: 0,
              }));
            }}
            className={`relative flex items-center gap-3 p-2 pl-4 rounded cursor-pointer max-sm:text-sm ${
              selectedGroup?._id === group._id && "bg-[#282142]/50"
            }`}
          >
            {/* Group Avatar with Stable Random Color */}
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-full text-white text-base font-semibold ${getColorClass(
                group._id
              )}`}
            >
              {group.name[0]?.toUpperCase()}
            </div>

            {/* Group Info */}
            <div className="flex flex-col leading-5">
              <p className="font-medium">{group.name}</p>
              <span className="text-neutral-400 text-xs">Group</span>
            </div>

            {/* Unread Badge */}
            {unseenGroupMessages?.[group._id] > 0 && (
              <p className="absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50">
                {unseenGroupMessages[group._id]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupSidebar;
