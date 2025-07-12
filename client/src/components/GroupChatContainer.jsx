import React, { useContext, useEffect, useRef, useState } from "react";
import assets from "../assets/assets";
import { formateMessageTime } from "../lib/utils.js";
import { AuthContext } from "../../context/AuthContext.jsx";
import { GroupChatContext } from "../../context/GroupChatContext.jsx";
import toast from "react-hot-toast";
import GroupMobileMedia from "./GroupMobileMedia";

const GroupChatContainer = () => {
  const {
    selectedGroup,
    groupMessages,
    sendGroupMessage,
    leaveGroup,
    getGroupMessages,
    setSelectedGroup,
    isAdmin
  } = useContext(GroupChatContext);

  const { authUser,navigate } = useContext(AuthContext);
  
  

  const [input, setInput] = useState("");
  const [showGroupMobileMedia, setShowGroupMobileMedia] = useState(false);
  const scrollEnd = useRef();
  const [initialScrollDone, setInitialScrollDone] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return;
    await sendGroupMessage({ text: input.trim() });
    setInput("");
  };

  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Select an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendGroupMessage({ image: reader.result });
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  useEffect(() => {
    if (selectedGroup?._id) {
      getGroupMessages(selectedGroup._id);
      setInitialScrollDone(false);
    }
  }, [selectedGroup]);

  useEffect(() => {
    if (!initialScrollDone && scrollEnd.current && groupMessages.length > 0) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
      setInitialScrollDone(true);
    }
  }, [groupMessages, initialScrollDone]);

  useEffect(() => {
    if (scrollEnd.current && groupMessages.length > 0) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [groupMessages]);

  if (!selectedGroup) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden">
        <img src={assets.logo_icon} className="max-w-16" alt="logo" />
        <p className="text-lg font-medium text-white">Join a group to chat</p>
      </div>
    );
  }

  if (showGroupMobileMedia) {
    return (
      <GroupMobileMedia
        group={selectedGroup}
        onClose={() => setShowGroupMobileMedia(false)}
      />
    );
  }

  return (
    <div className="h-full overflow-scroll relative backdrop-blur-lg">
      {/* Header */}
      <div className="relative flex items-center gap-3 py-3 mx-4 border-b border-stone-500">
        <p className="flex-1 text-lg text-white flex items-center gap-2">
          {selectedGroup?.name}
        </p>
        <img
          src={assets.menu_icon}
          alt="help"
          className=" max-w-5 cursor-pointer"
          onClick={() => setIsMenuOpen((prev) => !prev)}
        />
        {isMenuOpen && (
          <div
            ref={menuRef}
            className="absolute top-full right-0 z-20 w-32 p-5 mt-2 rounded-md bg-[#282142] border border-gray-600 text-gray-100"
          >
            <p
              onClick={() => {
                navigate("/members");
                setIsMenuOpen(false);
              }}
              className="cursor-pointer text-sm"
            >
              Members
            </p>
            <hr className="my-2 border-t border-gray-500" />
            {isAdmin && (
              <>
                <p
                  onClick={() => {
                    
                    navigate("/admin");
                    setSelectedGroup(selectedGroup);
                    setIsMenuOpen(false);
                  }}
                  className="cursor-pointer text-sm"
                >
                  Edit Group
                </p>
                <hr className="my-2 border-t border-gray-500" />
              </>
            )}

            <p
              className="cursor-pointer text-sm"
              onClick={() => {
                leaveGroup();
                setSelectedGroup(null)
                setIsMenuOpen(false);
              }}
            >
              Leave Group
            </p>
          </div>
        )}
        <img
          onClick={() => setShowGroupMobileMedia(true)}
          src={assets.gallery_icon}
          className="md:hidden max-w-7 cursor-pointer"
          alt="media"
        />
        <img
          onClick={() => setSelectedGroup(null)}
          src={assets.arrow_icon}
          alt="back"
          className="md:hidden max-w-7 cursor-pointer"
        />
        <img
          src={assets.help_icon}
          alt="help"
          className="max-md:hidden max-w-5 cursor-pointer"
        />
      </div>

      {/* Messages Area */}
      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6">
        {groupMessages.map((msg, index) => {
          const isSenderSelf = msg?.senderId?._id === authUser._id;
          return (
            <div
              key={msg._id || index}
              className={`flex items-end gap-2 justify-end ${
                !isSenderSelf && "flex-row-reverse"
              }`}
            >
              {msg?.image ? (
                <img
                  src={msg.image}
                  className="max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8"
                  alt="group-msg"
                />
              ) : (
                <p
                  className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-all bg-violet-500/30 text-white ${
                    isSenderSelf ? "rounded-br-none" : "rounded-bl-none"
                  }`}
                >
                  {msg?.text}
                </p>
              )}

              <div className="text-center text-xs">
                <img
                  src={msg?.senderId?.profilePic || assets.avatar_icon}
                  alt="sender"
                  className="w-7 rounded-full"
                />
                <p className="text-gray-500">
                  {msg?.senderId?.fullName?.split(" ")[0] || "User"}
                </p>
                <p className="text-gray-500">
                  {formateMessageTime(msg?.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={scrollEnd}></div>
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3 bg-black/20">
        <div className="flex-1 flex items-center bg-gray-100/12 px-3 rounded-full">
          <input
            autoComplete="off"
            onChange={(e) => setInput(e.target.value)}
            value={input}
            onKeyDown={(e) => (e.key === "Enter" ? handleSendMessage(e) : null)}
            type="text"
            placeholder="Send a message"
            className="flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400 bg-transparent"
          />
          <input
            type="file"
            onChange={handleSendImage}
            id="groupImage"
            accept="image/png, image/jpeg"
            hidden
          />
          <label htmlFor="groupImage">
            <img
              src={assets.gallery_icon}
              alt="upload"
              className="w-[30px] sm:w-5 mr-2 cursor-pointer"
            />
          </label>
        </div>
        <img
          onClick={handleSendMessage}
          src={assets.send_button}
          alt="send"
          className="w-7 cursor-pointer"
        />
      </div>
    </div>
  );
};

export default GroupChatContainer;
