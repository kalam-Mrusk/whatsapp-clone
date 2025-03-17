import React, { useState } from "react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DoneRoundedIcon from "@mui/icons-material/DoneRounded";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import PhotoIcon from "@mui/icons-material/Photo";
import VideocamIcon from "@mui/icons-material/Videocam";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { useSelector } from "react-redux";
const ChatRoom = ({ setChatWindowdata, conversationData }) => {
  const loggedInUserid = useSelector((state) => state.user.value?.user._id);
  const [activeChatRoomId, setActiveChatRoomId] = useState("");
  // console.log(conversationData);
  return (
    <div className="chatBoxUserListContainer">
      {conversationData?.map((item) => (
        <div
          className="chatBoxUser"
          key={item.conversationId}
          onClick={() => {
            if (item.type === "private") {
              setChatWindowdata(item.partnerDetails);
            } else {
              setChatWindowdata(item.groupDetails);
            }
            setActiveChatRoomId(item.conversationId);
          }}
          style={
            activeChatRoomId == item.conversationId
              ? { backgroundColor: "#ccc" }
              : {}
          }
        >
          <div className="userProfile">
            {item.type === "private" ? (
              item.partnerDetails.avatar ? (
                <img src={item.partnerDetails.avatar} />
              ) : (
                <AccountCircleIcon
                  style={{
                    fontSize: "3.2rem",
                    margin: "-0.2rem -0.2rem",
                    color: "#9e9d9d",
                  }}
                />
              )
            ) : item.groupDetails.groupPic ? (
              <img src={item.groupDetails.groupPic} />
            ) : (
              <div
                style={{
                  width: "2.7rem",
                  height: "2.7ren",
                  backgroundColor: "#9e9d9d",
                  borderRadius: "50%",
                }}
              >
                {" "}
                <GroupsOutlinedIcon
                  style={{
                    fontSize: "2rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "0.35rem",
                    color: "#fff",
                  }}
                />
              </div>
            )}
          </div>
          <div className="cb-UserInfo">
            <div className="usernameAndDate">
              <h3>
                {item.type === "private"
                  ? item.partnerDetails._id === loggedInUserid
                    ? item.partnerDetails.fullname.substring(0, 15) + " (You)"
                    : item.partnerDetails.fullname.length > 18
                    ? item.partnerDetails.fullname.substring(0, 18) + "..."
                    : item.partnerDetails.fullname
                  : item.groupDetails.name.length > 18
                  ? item.groupDetails.name.substring(0, 18) + "..."
                  : item.groupDetails.name}
              </h3>
              {new Date().toLocaleDateString() ==
              new Date(item.lastMessage.createdAt).toLocaleDateString() ? (
                <p>
                  {new Date(item.lastMessage.createdAt).toLocaleTimeString()}
                </p>
              ) : (
                <p>
                  {new Date(item.lastMessage.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="userlastmessage">
              {
                <div className="camvid">
                  {item.lastMessage.senderId === loggedInUserid &&
                  item.type === "private" ? (
                    item.lastMessage.seenBy.includes(
                      item.partnerDetails._id
                    ) ? (
                      <DoneAllRoundedIcon
                        style={{
                          color: "#009a00",
                        }}
                        className="ulm-icons"
                      />
                    ) : (
                      <DoneRoundedIcon className="ulm-icons" />
                    )
                  ) : (
                    ""
                  )}
                  {item.lastMessage.senderId === loggedInUserid &&
                  item.type === "group" ? (
                    item.lastMessage.seenBy.length ===
                    item.groupDetails.members.length - 1 ? (
                      <DoneAllRoundedIcon
                        style={{
                          color: "#009a00",
                        }}
                        className="ulm-icons"
                      />
                    ) : (
                      <DoneRoundedIcon className="ulm-icons" />
                    )
                  ) : (
                    ""
                  )}
                  {item.type === "group" && (
                    <span style={{ fontSize: "small" }}>
                      {item.lastMessage.senderName.split(" ")[0] + ":"}
                    </span>
                  )}
                  {/* {item.lstMsg.lstMsgType === "file" && (
                    <InsertDriveFileIcon className="ulm-icons" />
                  )}
                  
                  {item.lstMsg.lstMsgType === "video" && (
                    <VideocamIcon className="ulm-icons" />
                  )} */}
                  {!item.lastMessage.message ? (
                    item.lastMessage.fileUrl.split(".").reverse()[0] ===
                      "png" ||
                    item.lastMessage.fileUrl.split(".").reverse()[0] ===
                      "jpg" ||
                    item.lastMessage.fileUrl.split(".").reverse()[0] ===
                      "pneg" ||
                    item.lastMessage.fileUrl.split(".").reverse()[0] ===
                      "jpeg" ? (
                      <PhotoIcon className="ulm-icons" />
                    ) : (
                      <VideocamIcon className="ulm-icons" />
                    )
                  ) : (
                    <></>
                  )}
                  <p>
                    {item.lastMessage.message
                      ? item.lastMessage.message.length > 35
                        ? item.lastMessage.message.substring(0, 35) + "..."
                        : item.lastMessage.message
                      : item.lastMessage.fileUrl.split(".").reverse()[0] ===
                          "png" ||
                        item.lastMessage.fileUrl.split(".").reverse()[0] ===
                          "jpg" ||
                        item.lastMessage.fileUrl.split(".").reverse()[0] ===
                          "pneg" ||
                        item.lastMessage.fileUrl.split(".").reverse()[0] ===
                          "jpeg"
                      ? "Photo"
                      : "Video"}
                    {/* {item.unReadMsg > 0 ? (
                      <span className="unseenMsg">{item.unReadMsg}</span>
                    ) : (
                      ""
                    )} */}
                  </p>
                </div>
              }
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatRoom;
