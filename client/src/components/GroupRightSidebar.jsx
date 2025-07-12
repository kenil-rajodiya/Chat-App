// GroupRightSidebar.jsx
import { useContext, useEffect, useState } from "react";
import assets from "../assets/assets";
import { GroupChatContext } from "../../context/GroupChatContext";
import { AuthContext } from "../../context/AuthContext";

const GroupRightSidebar = () => {
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
      <div className="bg-[#8185B2]/10 text-white w-full relative overflow-y-scroll max-md:hidden">
        <div className="pt-4 flex flex-col items-center gap-2 text-xs font-light mx-auto">
          <div className="w-20 aspect-[1/1] rounded-full bg-violet-700 text-white flex items-center justify-center text-xl">
            {selectedGroup.name[0]}
          </div>
          <h1 className="px-10 text-xl font-medium mx-auto">
            {selectedGroup.name}
          </h1>
        </div>

        <hr className="border-[#ffffff50] my-2" />

        <div className="px-5 text-xs">
          <p>Media</p>
          <div className="mt-2 max-h-[180px] overflow-y-scroll grid grid-cols-2 gap-4 opacity-80">
            {messageImages.map((url, index) => (
              <div
                key={index}
                onClick={() => window.open(url)}
                className="cursor-pointer rounded"
              >
                <img src={url} alt="" className="h-full rounded-md" />
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => logout()}
          className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-400 to-violet-600 text-white border-none text-sm font-light py-2 px-20 rounded-full cursor-pointer"
        >
          Logout
        </button>
      </div>
    )
  );
};

export default GroupRightSidebar;
