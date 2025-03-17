import React, { useEffect, useState } from "react";
import "./Gallery.css";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import axios from "axios";
import { toast } from "react-toastify";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import ClipLoader from "react-spinners/ClipLoader";
import { useSelector } from "react-redux";
import { socket } from "../../socket.js";
import baseUrl from "../../utils/baseUrl.js";

const Gallery = ({
  setToggleStatusView,
  loggedUser,
  setLoggedUser,
  setIsVisible,
  setMediaLocalUrl,
  setSelectedImage,
  setSelectedText,
  setStatusId,
  statusId,
  selectedImage,
  selectedText,
  isVisible,
  mediaLocalUrl,
}) => {
  const loggedInUser = useSelector((state) => state.user.value?.user);
  const allUser = useSelector((state) => state.alluser?.value || []);
  const { statuses, galleryData } = useSelector((state) => state.status);
  const [viewedUser, setViewedUser] = useState([]);
  const [viewerListBox, setViewerListBox] = useState(false);
  const [loading, setLoading] = useState(false);
  const [textMsg, setTextMsg] = useState("");
  const deleteStatus = async () => {
    if (!statusId) return;
    try {
      setLoading(true);
      const res = await axios.delete(`${baseUrl}/status/delete-status`, {
        data: { statusId, mediaUrl: mediaLocalUrl },
      });

      if (res.status === 200) {
        toast.success("Status deleted successfully.");

        // Reset state after deletion
        setStatusId(null);
        setSelectedImage(null);
        setSelectedText(null);
        setMediaLocalUrl("");
      }

      if (res.data) {
        socket.emit("deleteStatus", { userId: loggedInUser._id, statusId });
      }
    } catch (error) {
      console.error("Error deleting status:", error);
      toast.error("Failed to delete status.");
    } finally {
      setLoading(false);
    }
  };

  const markAsSeen = async (statusId, seenBy) => {
    if (galleryData.user._id === loggedInUser._id) return;
    if (seenBy.includes(loggedInUser._id)) return;

    try {
      setLoading(true);

      await axios.put(
        `${baseUrl}/status/seen`,
        { statusId },
        { withCredentials: true }
      );

      socket.emit("statusSeen", { statusId, userId: loggedInUser._id });
    } catch (error) {
      console.error("Error marking status as seen:", error);
    } finally {
      setLoading(false);
    }
  };

  const seenuser = () => {
    const fils = galleryData.statuses.find((item) => item._id === statusId);
    const filterUser = allUser.filter(
      (user) => fils.seenBy.includes(user._id) && user
    );
    setViewedUser(filterUser);
  };

  return (
    <div
      style={{
        border: "1px solid",
        position: "absolute",
        boxSizing: "border-box",
        backgroundColor: "#fff",
        top: "50%",
        left: "59%",
        transform: "translate(-50%, -50%)",
      }}
    >
      <div className="gallery-container" style={{ position: "relative" }}>
        {statusId && loggedUser && (
          <button
            onClick={() => setIsVisible(!isVisible)}
            style={{ padding: "0.2rem 0.3rem", borderRadius: "0.5rem" }}
          >
            status info
          </button>
        )}
        <p
          style={{
            border: "1px solid",
            padding: "4px 8px",
            borderRadius: "50%",
            backgroundColor: "red",
            color: "#fff",
            position: "absolute",
            left: "-10px",
            top: "-10px",
            cursor: "pointer",
          }}
          onClick={() => {
            setToggleStatusView(false);
            setLoggedUser(false);
          }}
        >
          X
        </p>
        <div className="parent">
          {/* Large Image Display */}
          <div className="large-image">
            {selectedImage ? (
              selectedImage.split("/").includes("image") ? (
                <img src={selectedImage} alt="Selected" />
              ) : (
                <video width="100%" controls>
                  <source src={selectedImage} type="video/mp4" />
                </video>
              )
            ) : (
              <p
                style={{
                  height: "90%",
                  width: "90%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  overflow: "auto",
                }}
              >
                {selectedText}
              </p>
            )}
          </div>

          {/* Thumbnails */}
          <div className="thumbnails">
            {galleryData?.statuses.map((item) => (
              <div key={item._id}>
                {item.mediaUrl?.match(/\.(jpeg|jpg|png|gif|webp)$/i) && (
                  <img
                    src={item.mediaUrl}
                    alt="Thumbnail"
                    className={selectedImage === item.mediaUrl ? "active" : ""}
                    onClick={() => {
                      setSelectedImage(item.mediaUrl);
                      setTextMsg(item.text);
                      setStatusId(item._id);
                      setMediaLocalUrl(item.mediaUrl);
                      if (!loading) markAsSeen(item._id, item.seenBy);
                      setViewedUser(item.seenBy);
                      setViewerListBox(false);
                      setIsVisible(false);
                    }}
                  />
                )}

                {item.mediaUrl?.match(/\.(mp4|mov|avi|webm|mkv)$/i) && (
                  <p
                    className={selectedImage === item.mediaUrl ? "active" : ""}
                    onClick={() => {
                      setSelectedImage(item.mediaUrl);
                      setTextMsg(item.text);
                      setStatusId(item._id);
                      setMediaLocalUrl(item.mediaUrl);
                      if (!loading) markAsSeen(item._id, item.seenBy);
                      setViewedUser(item.seenBy);
                      setViewerListBox(false);
                      setIsVisible(false);
                    }}
                    style={{
                      height: "3.1rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0rem 0.3rem",
                      border: "1px solid #686868",
                      borderRadius: "0.4rem",
                    }}
                  >
                    video
                  </p>
                )}

                {item.text && !item.mediaUrl && (
                  <div
                    className={
                      !selectedImage && selectedText === item.text
                        ? "text active"
                        : "text"
                    }
                    onClick={() => {
                      setSelectedImage(null);
                      setSelectedText(item.text);
                      setTextMsg("");
                      setStatusId(item._id);
                      setMediaLocalUrl("");
                      if (!loading) markAsSeen(item._id, item.seenBy);
                      setViewedUser(item.seenBy);
                      setViewerListBox(false);
                      setIsVisible(false);
                    }}
                  >
                    <p>text</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {loggedUser && (
            <div className={`child ${isVisible ? "visible" : ""}`}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "80%",
                  margin: " 1rem auto",
                }}
              >
                {loading ? (
                  <ClipLoader size={20} />
                ) : (
                  <DeleteIcon
                    style={{ color: "red", cursor: "pointer" }}
                    onClick={deleteStatus}
                  />
                )}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {viewerListBox ? (
                    <VisibilityOffIcon
                      style={{ cursor: "pointer" }}
                      onClick={() => setViewerListBox(false)}
                    />
                  ) : (
                    <VisibilityIcon
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setViewerListBox(true);
                        seenuser();
                      }}
                    />
                  )}

                  <span>{viewedUser.length}</span>
                </div>
              </div>
              {viewerListBox && (
                <div
                  style={{
                    overflow: "auto",
                    height: "300px",
                    listStyle: "none",
                    marginLeft: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                  <h3>Viewer List :</h3>
                  {viewedUser.map((item) => (
                    <li
                      key={item._id}
                      style={{
                        padding: "0.3rem 0rem",
                        borderBottom: "1px solid #ccc",
                      }}
                    >
                      {item.fullname}
                    </li>
                  ))}
                </div>
              )}
            </div>
          )}
          {textMsg !== "" && (
            <p
              style={{
                width: "100%",
                position: "absolute",
                top: "81%",
                color: "#fff",
                backgroundColor: "#00000080",
                padding: "0.5rem 0rem",
                textAlign: "center",
              }}
            >
              {textMsg}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Gallery;
