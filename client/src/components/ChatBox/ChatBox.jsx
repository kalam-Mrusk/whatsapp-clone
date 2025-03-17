import React, { useEffect, useState } from "react";
import AddCommentOutlinedIcon from "@mui/icons-material/AddCommentOutlined";
import MoreVertOutlinedIcon from "@mui/icons-material/MoreVertOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ChatRoom from "../ChatRoom/ChatRoom.jsx";
import { useSelector } from "react-redux";
const ChatBox = ({ sideBarActive, setChatWindowdata, setsideBarActive }) => {
  const [chatActiveCatogries, setChatActiveCatogries] = useState("all");
  const conversationData = useSelector((state) => state.conversationsList.list);
  const [query, setQuery] = useState("");
  const [conversationListItem, setConversationListItem] = useState();
  const allChats = () => {
    setConversationListItem(conversationData);
    setChatActiveCatogries("all");
  };
  const unreadChats = () => {
    const data = conversationData.filter((itm) => itm.unReadMsg > 0);
    setChatActiveCatogries("unread");
  };
  const groupChats = () => {
    const data = conversationData.filter((itm) => itm.type === "group");
    setConversationListItem(data);
    setChatActiveCatogries("groups");
  };

  // Update query state when input changes
  const handleSearch = (e) => {
    setQuery(e.target.value);
  };

  // Filter users based on name, username, or email
  const filteredUsers = conversationListItem?.filter((user) => {
    if (user.type === "private") {
      return (
        user.partnerDetails.fullname
          .toLowerCase()
          .includes(query.toLowerCase()) ||
        user.partnerDetails.username
          .toLowerCase()
          .includes(query.toLowerCase()) ||
        user.lastMessage.message.toLowerCase().includes(query.toLowerCase()) ||
        user.partnerDetails.email.toLowerCase().includes(query.toLowerCase())
      );
    } else {
      return (
        user.lastMessage.message.toLowerCase().includes(query.toLowerCase()) ||
        user.groupDetails.name.toLowerCase().includes(query.toLowerCase())
      );
    }
  });
  useEffect(() => {
    setConversationListItem(conversationData);
  }, [conversationData]);
  return (
    <>
      {sideBarActive === "chat" && (
        <div className="chat-box-container">
          <div className="chatBox-header-section">
            <div className="chatBox-header">
              <h2>Chats</h2>
              <div className="cb-head-icons">
                <AddCommentOutlinedIcon
                  className="icon"
                  onClick={() => {
                    setsideBarActive("userbox");
                  }}
                />
                <MoreVertOutlinedIcon className="icon" />
              </div>
            </div>
            <div className="chatBox-input-section">
              <div className="sb-icon">
                <SearchOutlinedIcon style={{ cursor: "pointer" }} />
              </div>
              <input
                type="text"
                placeholder="Search"
                onChange={handleSearch}
                value={query}
              />
            </div>
            <div className="chatBox-chatFiler-sec">
              <p
                onClick={allChats}
                style={
                  chatActiveCatogries === "all"
                    ? { backgroundColor: "#009a00", color: "#fff" }
                    : {}
                }
              >
                All
              </p>
              <p
                onClick={unreadChats}
                style={
                  chatActiveCatogries === "unread"
                    ? { backgroundColor: "#009a00", color: "#fff" }
                    : {}
                }
              >
                Unread
              </p>
              <p>Favorites</p>
              <p
                onClick={groupChats}
                style={
                  chatActiveCatogries === "groups"
                    ? { backgroundColor: "#009a00", color: "#fff" }
                    : {}
                }
              >
                Groups
              </p>
            </div>
          </div>
          <ChatRoom
            setChatWindowdata={setChatWindowdata}
            conversationData={filteredUsers}
          />
        </div>
      )}
    </>
  );
};

export default ChatBox;
