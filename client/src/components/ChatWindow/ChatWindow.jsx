import React, { useEffect, useState } from "react";
import CallIcon from "@mui/icons-material/Call";
import EmojiPicker from "emoji-picker-react";
import AddReactionIcon from "@mui/icons-material/AddReaction";
import MicIcon from "@mui/icons-material/Mic";
import SendIcon from "@mui/icons-material/Send";
import VideocamIcon from "@mui/icons-material/Videocam";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import MoreVertOutlinedIcon from "@mui/icons-material/MoreVertOutlined";
import AddIcon from "@mui/icons-material/Add";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Message from "../Message/Message.jsx";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { socket } from "../../socket.js";
import ClipLoader from "react-spinners/ClipLoader";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import { useNavigate } from "react-router-dom";
import { loadingEnd, loadingStart } from "../../redux/loading.slice.js";
import baseUrl from "../../utils/baseUrl.js";
import { updateLastMessage } from "../../redux/conversations.slice.js";
const ChatWindow = ({ chatWindowdata, setOpenContactInfoBox }) => {
  const geminiKey = import.meta.env.VITE_GEMINI_KEY;
  const loggedInUserid = useSelector((state) => state.user?.value?.user);
  const allUser = useSelector((state) => state.alluser?.value || []);
  const [conversationList, setConversationList] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [file, setFile] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFilebBox, setshowFilebBox] = useState(false);
  const [loading, setloading] = useState(false);
  const [rendering, setRendering] = useState(false);
  const refreshed = useSelector((state) => state.loading.refresh);
  const loader = useSelector((state) => state.loading.status);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const onlineUsers = useSelector((state) => state.user.onlineUsers);
  const isOnline = onlineUsers?.includes(chatWindowdata._id);
  const handleToggleEmojiPicker = () => {
    setShowEmojiPicker((prev) => !prev);
  };
  const handleEmojiClick = (emojiData, event) => {
    setInputMessage((prevMessage) => prevMessage + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const groupMessagesByDate = (messages) => {
    const groupedMessages = messages.reduce((acc, message) => {
      const date = new Date(message.createdAt).toDateString(); // Extract date (YYYY-MM-DD)

      if (!acc[date]) {
        acc[date] = [];
      }

      acc[date].push(message);
      return acc;
    }, {});

    // Convert object to sorted array
    return Object.entries(groupedMessages)
      .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB)) // Sort by date
      .map(([date, messages]) => ({
        date,
        messages: messages.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        ), // Sort by time
      }));
  };

  //  Fetch private messages
  const getAllPrivateMessages = async () => {
    if (!chatWindowdata._id) return;
    dispatch(loadingStart());
    try {
      const res = await axios.get(
        `${baseUrl}/message/private/${loggedInUserid._id}/${chatWindowdata._id}`
      );
      setConversationList(groupMessagesByDate(res.data?.data) || []);
      dispatch(loadingEnd());
    } catch (error) {
      console.error("Error fetching private messages:", error);
      dispatch(loadingEnd());
    }
  };

  //  Fetch group messages
  const getAllGroupMessages = async () => {
    if (!chatWindowdata._id) return;
    dispatch(loadingStart());
    try {
      const res = await axios.get(
        `${baseUrl}/message/group/${loggedInUserid._id}/${chatWindowdata._id}`
      );
      setConversationList(groupMessagesByDate(res.data?.data) || []);
      dispatch(loadingEnd());
    } catch (error) {
      console.error("Error fetching group messages:", error);
      dispatch(loadingEnd());
    }
  };

  // Send message function
  const sendMessage = async () => {
    if (!inputMessage && !file) return;
    let aiResponse;
    if (inputMessage.startsWith("Ai@ ")) {
      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
          contents: [
            {
              parts: [{ text: `${inputMessage.replace("@ ", "")}` }],
            },
          ],
        }
      );
      aiResponse = res.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    }
    setloading(true);
    const formData = new FormData();
    formData.append("sender", loggedInUserid._id);
    formData.append("senderName", loggedInUserid.fullname);
    formData.append(
      "message",
      aiResponse ? `${inputMessage} ** ${aiResponse}` : inputMessage
    );

    if (chatWindowdata.fullname) {
      formData.append("receiver", chatWindowdata._id);
    }
    if (chatWindowdata.name) {
      formData.append("groupId", chatWindowdata._id);
    }
    if (file) formData.append("file", file);

    try {
      const res = await axios.post(`${baseUrl}/message/send`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      const newMessage = res.data.data;

      // Emit to socket
      if (newMessage.receiver) {
        // newMessage.partnerDetails = chatWindowdata;
        // newMessage.type = "private";
        socket.emit("sendPrivateMessage", newMessage);
      }
      if (newMessage.groupId) {
        // newMessage.groupDetails = chatWindowdata;
        // newMessage.type = "group";
        socket.emit("sendGroupMessage", newMessage);
      }

      setInputMessage("");
      setFile(null);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setloading(false);
    }
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typing", {
        senderId: loggedInUserid._id,
        receiverId: chatWindowdata.fullname ? chatWindowdata._id : null,
        groupId: chatWindowdata.name ? chatWindowdata._id : null,
        isTyping: true,
      });

      // Stop typing after 2 seconds
      setTimeout(() => {
        setIsTyping(false);
        socket.emit("typing", {
          senderId: loggedInUserid._id,
          receiverId: chatWindowdata.fullname ? chatWindowdata._id : null,
          groupId: chatWindowdata.name ? chatWindowdata._id : null,
          isTyping: false,
        });
      }, 2000);
    }
  };

  useEffect(() => {
    // Mark messages as seen when conversationList updates
    conversationList.forEach((conversation) => {
      conversation.messages.forEach((msg) => {
        if (!msg.seenBy.includes(loggedInUserid._id)) {
          socket.emit("markMessageSeen", {
            messageId: msg._id,
            userId: loggedInUserid._id,
          });

          // Optimistic UI update
          setConversationList((prevList) =>
            prevList.map((conv) => ({
              ...conv,
              messages: conv.messages.map((m) =>
                m._id === msg._id
                  ? { ...m, seenBy: [...m.seenBy, loggedInUserid._id] }
                  : m
              ),
            }))
          );
        }
      });
    });
  }, [conversationList, loggedInUserid]);

  useEffect(() => {
    socket.on("userTyping", ({ senderId, isTyping, groupId }) => {
      if (isTyping) {
        setTypingUser({ senderId, isTyping, groupId });
      } else {
        setTypingUser(null);
      }
    });

    return () => {
      socket.off("userTyping");
    };
  }, [chatWindowdata]);

  //  Handle incoming messages from Socket.io
  useEffect(() => {
    const handleReceiveMessage = (data) => {
      // console.log("new msg--->", data);
      // dispatch(updateLastMessage(data));
      if (
        (chatWindowdata?._id && data.groupId === chatWindowdata._id) ||
        (chatWindowdata?._id &&
          [data.sender, data.receiver].includes(chatWindowdata._id))
      ) {
        setConversationList((prev) => {
          const lastIndex = prev.length - 1;

          if (
            lastIndex >= 0 &&
            new Date(data.createdAt).toDateString() === prev[lastIndex].date
          ) {
            return prev.map((group, index) =>
              index === lastIndex
                ? {
                    ...group,
                    messages: [...group.messages, data],
                  }
                : group
            );
          } else {
            return [
              ...prev,
              {
                date: new Date(data.createdAt).toDateString(),
                messages: [data],
              },
            ];
          }
        });
      }
    };

    if (chatWindowdata?.fullname) {
      socket.on("receivePrivateMessage", handleReceiveMessage);
    }
    if (chatWindowdata?.name) {
      socket.on("receiveGroupMessage", handleReceiveMessage);
    }

    return () => {
      socket.off("receivePrivateMessage", handleReceiveMessage);
      socket.off("receiveGroupMessage", handleReceiveMessage);
    };
  }, [chatWindowdata]);

  //  Join chat room & fetch messages
  useEffect(() => {
    if (!loggedInUserid || !chatWindowdata) navigate("/");

    if (!chatWindowdata._id) return;

    if (chatWindowdata.fullname) {
      socket.emit("joinPrivate", chatWindowdata._id);
      getAllPrivateMessages();
    } else if (chatWindowdata.name) {
      socket.emit("joinGroup", chatWindowdata._id);
      getAllGroupMessages();
    }
  }, [chatWindowdata, refreshed]);
  // console.log(typingUser);
  // console.log(conversationList);

  return (
    <div className="messageBoxMainContainer">
      <div className="messageBoxHeaderContaineter">
        <div
          className="msgBoxHeadContLeft"
          onClick={() => {
            setOpenContactInfoBox(true);
          }}
        >
          <div className="msgBoxHeadImg">
            {chatWindowdata.username ? (
              chatWindowdata.avatar ? (
                <img src={chatWindowdata.avatar} />
              ) : (
                <AccountCircleIcon
                  style={{
                    width: "3rem",
                    height: "3rem",
                    color: "#686868",
                  }}
                />
              )
            ) : chatWindowdata.groupPic ? (
              <img src={chatWindowdata.groupPic} />
            ) : (
              <div
                style={{
                  width: "3rem",
                  height: "3rem",
                  backgroundColor: "#686868",
                  borderRadius: "50%",
                  marginRight: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <GroupsOutlinedIcon
                  style={{ color: "#fff", fontSize: "2rem" }}
                />
              </div>
            )}
          </div>
          <div className="msgBoxHeadName">
            <p>
              {chatWindowdata.username
                ? chatWindowdata.username === loggedInUserid.username
                  ? `${chatWindowdata.fullname} (You)`
                  : chatWindowdata.fullname
                : chatWindowdata.name}
            </p>
            <p
              className="online"
              style={{
                color: isOnline ? "green" : "#686868",
              }}
            >
              {chatWindowdata.username &&
                chatWindowdata.username !== loggedInUserid.username && (
                  <>
                    {isOnline ? "online" : "offline"}
                    {typingUser &&
                      typingUser.senderId === chatWindowdata._id &&
                      typingUser.senderId !== loggedInUserid._id && (
                        <span style={{ color: "#1976d2" }}> . Typing...</span>
                      )}
                  </>
                )}
              {chatWindowdata.name &&
                typingUser &&
                typingUser.senderId !== loggedInUserid._id &&
                chatWindowdata.members.includes(typingUser.senderId) &&
                typingUser.groupId === chatWindowdata._id && (
                  <span style={{ color: "#1976d2" }}>{`${
                    allUser
                      .find((item) => item._id === typingUser.senderId)
                      .fullname.split(" ")[0]
                  } . Typing...`}</span>
                )}
            </p>
          </div>
        </div>
        <div className="msgBoxHeadContRight">
          <ul>
            <li>
              <CallIcon className="msgBoxIcon" />
            </li>
            <li>
              <VideocamIcon className="msgBoxIcon" />
            </li>
            <li>
              <SearchOutlinedIcon className="msgBoxIcon" />
            </li>
            <li>
              <MoreVertOutlinedIcon className="msgBoxIcon" />
            </li>
          </ul>
        </div>
      </div>

      <div className="messagePadContainer">
        {loader ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                margin: "0.5rem ",
              }}
            >
              <ClipLoader size={30} />
            </span>
          </div>
        ) : conversationList.length > 0 ? (
          conversationList.map((data, i) => (
            <div key={i}>
              <div
                style={{
                  width: "100%",
                  margin: "0.5rem 0rem",
                }}
              >
                <p
                  style={{
                    margin: "auto",
                    padding: "0.2rem 0.5rem",
                    width: "fit-content",
                    border: "1px solid #ccc",
                    fontSize: "0.9rem",
                    borderRadius: "1rem",
                    color: "#686868",
                  }}
                >
                  {data.date === new Date().toDateString()
                    ? "Today"
                    : data.date}
                </p>
              </div>
              {data.messages.map((data) => (
                <Message
                  data={data}
                  key={data._id}
                  chatWindowdata={chatWindowdata}
                  setConversationList={setConversationList}
                  rendering={rendering}
                  setRendering={setRendering}
                />
              ))}
            </div>
          ))
        ) : (
          <p
            style={{
              width: "fit-content",
              margin: "1rem auto",
              color: "#686868",
            }}
          >
            Start conversations
          </p>
        )}
      </div>

      <div
        className="messageBoxFooterContainer"
        style={{ position: "relative" }}
      >
        {showEmojiPicker && (
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            style={{
              width: "20rem",
              height: "21.5rem",
              position: "absolute",
              top: "-48vh",
            }}
          />
        )}
        {showFilebBox && (
          <div
            className="fileBox"
            style={{
              border: "1px solid black",
              borderRadius: "1rem",
              backgroundColor: "#ccc",
              width: "18rem",
              height: "5rem",
              position: "absolute",
              top: "-12vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-around",
              flexDirection: "column",
            }}
          >
            <p>
              <span style={{ color: "#c62828" }}>Note:</span>only photo and
              video
            </p>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          </div>
        )}
        <div className="msgBoxFootPlusIcon">
          <AddIcon
            onClick={() => {
              setshowFilebBox(!showFilebBox);
            }}
          />
        </div>

        <div className="msgBoxFootInputOrEmojiCont">
          <div className="emojiIcon">
            <AddReactionIcon onClick={handleToggleEmojiPicker} />
          </div>
          <input
            type="text"
            placeholder="Type a message"
            value={inputMessage}
            onChange={(e) => {
              setInputMessage(e.target.value);
              handleTyping();
            }}
          />
        </div>
        <div className="msgBoxFootMicOrsend">
          {!loading ? (
            inputMessage || file ? (
              <SendIcon
                onClick={() => {
                  sendMessage(inputMessage);
                  setshowFilebBox(false);
                  setloading(true);
                }}
              />
            ) : (
              <MicIcon />
            )
          ) : (
            <ClipLoader size={15} loading={true} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
