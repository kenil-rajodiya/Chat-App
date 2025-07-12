import { useContext, useEffect, useState } from "react";
import assets from "../assets/assets";
import { GroupChatContext } from "../../context/GroupChatContext.jsx";
import { AuthContext } from "../../context/AuthContext.jsx";

const GroupMobileMedia = ({ onClose }) => {
  const { selectedGroup, groupMessages } = useContext(GroupChatContext);
  const { logout } = useContext(AuthContext);
  const [messageImages, setMessageImages] = useState([]);

  useEffect(() => {
    setMessageImages(
      groupMessages.filter((msg) => msg.image).map((msg) => msg.image)
    );
  }, [groupMessages]);

  return (
    selectedGroup && (
      <div className="bg-[#8185B2]/10 text-white w-full relative overflow-y-scroll h-full">
        {/* Back Button */}
        <img
          src={assets.arrow_icon}
          onClick={onClose}
          alt="back"
          className="absolute w-7 h-7 top-4 left-4 z-10 bg-black/30 rounded-full p-1 cursor-pointer"
        />

        {/* Group Info */}
        <div className="pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto">
          <img
            src={assets.group_icon || assets.avatar_icon}
            alt="group"
            className="w-20 aspect-[1/1] rounded-full"
          />
          <h1 className="px-10 text-xl font-medium mx-auto">
            {selectedGroup?.name}
          </h1>
          <p className="px-10 mx-auto text-center text-gray-300">
            Group media shared by members
          </p>
        </div>

        <hr className="border-[#ffffff50] my-2" />

        {/* Media Section */}
        <div className="px-5 text-xs">
          <p className="font-medium text-white/80">Media</p>
          <div className="mt-2 max-h-[350px] overflow-y-scroll grid grid-cols-2 gap-4 opacity-90">
            {messageImages.length > 0 ? (
              messageImages.map((url, index) => (
                <div
                  key={index}
                  onClick={() => window.open(url, "_blank")}
                  className="cursor-pointer rounded"
                >
                  <img src={url} alt="" className="h-full rounded-md" />
                </div>
              ))
            ) : (
              <p className="text-white/60 mt-4">No media shared yet.</p>
            )}
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-400 to-violet-600 text-white border-none text-sm font-light py-2 px-20 rounded-full cursor-pointer"
        >
          Logout
        </button>
      </div>
    )
  );
};

export default GroupMobileMedia;
