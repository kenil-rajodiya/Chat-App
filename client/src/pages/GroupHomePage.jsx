import React, { useContext } from 'react'
import GroupSideBar from "../components/GroupSidebar.jsx"
import { GroupChatContext } from '../../context/GroupChatContext.jsx'
import GroupRightSidebar from '../components/GroupRightSidebar.jsx'
import GroupChatContainer from '../components/GroupChatContainer.jsx'

const GroupHomePage = () => {
    const {selectedGroup} = useContext(GroupChatContext)
  return (
    <div>
      <div className="border w-full h-screen sm:px-[15%] sm:py-[5%]">
        <div
          className={`backdrop-blur-xl border-2 border-gray-600 rounded-2xl overflow-hidden h-full grid grid-cols-1 relative ${
            selectedGroup
              ? "md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]"
              : "md:grid-cols-2"
          }`}
              >
                  <GroupSideBar />
                  <GroupChatContainer />
                  {selectedGroup && <GroupRightSidebar/>}
                  
        </div>
      </div>
    </div>
  );
}

export default GroupHomePage
