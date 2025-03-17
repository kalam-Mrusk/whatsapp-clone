import React, { useEffect, useRef, useState } from "react";
import DoneRoundedIcon from "@mui/icons-material/DoneRounded";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import MoreVertOutlinedIcon from "@mui/icons-material/MoreVertOutlined";
import DownloadIcon from "@mui/icons-material/Download";
import pdficon from "../../assets/pdficon.svg";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import CreateIcon from "@mui/icons-material/Create";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import ClipLoader from "react-spinners/ClipLoader";
import { socket } from "../../socket.js";
import baseUrl from "../../utils/baseUrl.js";

const Message = ({ data, chatWindowdata, setConversationList }) => {
  const loggedInUserid = useSelector((state) => state.user.value?.user._id);
  const [msgLkEdDlt, setMsgLkEdDlt] = useState(false);
  const [loading, setloading] = useState(false);
  const lastMsgRef = useRef();
  let a;
  const [typemsg, setTypemsg] = useState("text");
  const [likedUser, setlikedUser] = useState(data.likeBy || []);
  if (data.fileUrl) {
    a = data.fileUrl.split(".").reverse()[0];
  }

  const deleteMsg = async () => {
    if (!data._id) {
      toast.error("Message ID is required");
      return;
    }

    setloading(true);

    try {
      const res = await axios.delete(`${baseUrl}/message/delete-msg`, {
        data: {
          messageId: data._id,
          fileSecureUrl: data.fileUrl,
        },
      });

      setloading(false);

      if (res.status === 201) {
        toast.success("Message deleted successfully.");
        // Emit real-time delete event
        socket.emit("deleteMessage", {
          messageId: data._id,
          sender: loggedInUserid,
          receiver: data.receiver || null,
          groupId: data.groupId || null,
        });
      } else {
        toast.error("Failed to delete message.");
      }
    } catch (error) {
      console.error("Delete Message Error:", error?.response?.data || error);
      toast.error(error?.response?.data?.message || "Error deleting message.");
      setloading(false);
    }
  };

  const toggleLike = async (messageId, userId) => {
    if (!messageId || !userId) return;
    if (data.sender === userId) return;
    setloading(true);
    try {
      const res = await axios.put(`${baseUrl}/message/like`, {
        messageId,
        userId,
      });

      // Send like via socket
      socket.emit("sendLike", {
        messageId,
        userId,
        sender: data.sender,
        receiver: data.receiver,
        groupMembers: chatWindowdata.members,
      });

      setloading(false);
    } catch (error) {
      console.error("Error toggling like:", error);
      setloading(false);
    }
  };

  //  Handle Received Like (Real-Time)
  useEffect(() => {
    const handleReceiveLike = ({ messageId, userId }) => {
      if (messageId === data._id) {
        setlikedUser((prev) => {
          const isLiked = prev.includes(userId);

          if (isLiked) {
            return prev.filter((id) => id !== userId); // Unlike (remove user)
          } else {
            return [...prev, userId]; // Like (add user)
          }
        });
      }
    };

    socket.on("receiveLikePrivate", handleReceiveLike);
    socket.on("receiveLikeGroup", handleReceiveLike);

    return () => {
      socket.off("receiveLikePrivate", handleReceiveLike);
      socket.off("receiveLikeGroup", handleReceiveLike);
    };
  }, [data._id]);

  useEffect(() => {
    const handleReceiveDelete = ({ messageId }) => {
      setConversationList(
        (prev) =>
          prev
            .map((group) => ({
              ...group,
              messages: group.messages.filter((msg) => msg._id !== messageId),
            }))
            .filter((group) => group.messages.length > 0) // Remove empty groups
      );
    };

    socket.on("receiveMessageDelete", handleReceiveDelete);

    return () => {
      socket.off("receiveMessageDelete", handleReceiveDelete);
    };
  }, []);

  useEffect(() => {
    if (lastMsgRef.current) {
      lastMsgRef.current.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [data]);
  return (
    <div
      ref={lastMsgRef}
      className="msgPad"
      style={
        data.sender === loggedInUserid
          ? { justifyContent: "end" }
          : { justifyContent: "start" }
      }
    >
      <div
        className="userMsgContainer"
        style={
          data.sender === loggedInUserid
            ? {
                borderRadius: "1.2rem 0rem 1.2rem 1.2rem",
                position: "relative",
              }
            : {
                borderRadius: "0rem 1.2rem 1.2rem 1.2rem",
                position: "relative",
              }
        }
      >
        {typemsg === "text" && data.message
          ? data.message.split("**").map((msg, i) => (
              <p
                style={{
                  marginTop: "0.5rem",
                  fontWeight:
                    data.message.split("**").length > 1 && i % 2 === 0
                      ? "bold"
                      : "",
                }}
                key={i}
              >
                {msg}
              </p>
            ))
          : ""}

        {!data.message && (a === "png" || a === "jpg" || a === "jpeg") && (
          <img src={data.fileUrl} style={{ width: "100%", height: "16rem" }} />
        )}
        {!data.message && a === "mp4" && (
          <video width="100%" controls>
            <source src={data.fileUrl} type="video/mp4" />
          </video>
        )}
        {!data.message && (a === "pdf" || a === "doc" || a === "docx") && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              position: "relative",
            }}
          >
            <img src={pdficon} style={{ width: "4rem", height: "5rem" }} />
            <a
              href={data.fileUrl}
              style={{
                position: "absolute",
                left: "-0.8rem",
                top: "4rem",
              }}
            >
              <DownloadIcon style={{ fontSize: "1.3rem", color: "#686868" }} />
            </a>
          </div>
        )}

        <p className="msgTime" style={{ fontSize: "0.65rem" }}>
          {new Date(data.createdAt).toLocaleTimeString()}
          {data.sender === loggedInUserid ? (
            data.receiver ? (
              data.seenBy.includes(data.receiver) ? (
                <DoneAllRoundedIcon
                  style={{ fontSize: "1.3rem", color: "green" }}
                />
              ) : (
                <DoneRoundedIcon style={{ fontSize: "1.3rem", color: "" }} />
              )
            ) : data.seenBy.length === chatWindowdata.members?.length - 1 ? (
              <DoneAllRoundedIcon
                style={{ fontSize: "1.3rem", color: "green" }}
              />
            ) : (
              <DoneRoundedIcon style={{ fontSize: "1.3rem", color: "" }} />
            )
          ) : (
            ""
          )}
        </p>
        {data.sender === loggedInUserid && msgLkEdDlt && (
          <div
            style={{
              position: "absolute",
              left: "-1.7rem",
              bottom: "0.4rem",
            }}
          >
            <p style={{ cursor: "pointer" }}>
              <CreateIcon />
            </p>
            <p style={{ cursor: "pointer" }}>
              {loading ? (
                <ClipLoader size={10} />
              ) : (
                <DeleteForeverOutlinedIcon onClick={() => deleteMsg()} />
              )}
            </p>
          </div>
        )}

        {data.sender === loggedInUserid ? (
          <MoreVertOutlinedIcon
            className="msgMoreIcon"
            onClick={() => setMsgLkEdDlt(!msgLkEdDlt)}
          />
        ) : (
          !loading &&
          !likedUser.includes(loggedInUserid) &&
          !likedUser.length > 0 && (
            <FavoriteBorderIcon
              className="msgHeartIcon"
              onClick={() => toggleLike(data._id, loggedInUserid)}
            />
          )
        )}

        <p
          style={{
            position: "absolute",
            left: "0.2rem",
            bottom: "-0.9rem",
          }}
        >
          {likedUser.length > 0 && (
            <span
              style={{ cursor: "pointer" }}
              onClick={() => toggleLike(data._id, loggedInUserid)}
            >
              ❤️
            </span>
          )}

          <span style={{ fontSize: "0.8rem" }}>
            {likedUser.length > 1 && likedUser.length}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Message;
