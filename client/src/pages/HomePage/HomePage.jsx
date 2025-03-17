import React, { useEffect, useState } from "react";
import "./HomePage.css";
import chatAni from "../../assets/conversation.mp4";
import SideBar from "../../components/Sidebar/SideBar.jsx";
import ChatBox from "../../components/ChatBox/ChatBox.jsx";
import ChatWindow from "../../components/ChatWindow/ChatWindow.jsx";
import StatusBox from "../../components/StatusBox/StatusBox.jsx";
import Setting from "../../components/Setting/Setting.jsx";
import ContactInfo from "../../components/ContactInfo/ContactInfo.jsx";
import Profile from "../../components/Profile/Profile.jsx";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AllUserBox from "../../components/AllUserBox/AllUserBox.jsx";
import Gallery from "../../components/gallery/Gallery.jsx";
import AddStatusBox from "../../components/AddStatusBox/AddStatusBox.jsx";
import AIChat from "../../components/AIChat/AIChat.jsx";
import { removeStatus, updateStatusSeen } from "../../redux/status.slice.js";
import { socket } from "../../socket.js";
const HomePage = () => {
  const { galleryData } = useSelector((state) => state.status);
  const userExist = useSelector((state) => state.user.value);
  const refresh = useSelector((state) => state.loading.refresh);
  const navigate = useNavigate();
  const [chatWindowdata, setChatWindowdata] = useState(null);
  const [toggleStatusView, setToggleStatusView] = useState(false);
  const [sideBarActive, setsideBarActive] = useState("chat");
  const [openContactInfoBox, setOpenContactInfoBox] = useState(false);
  const [loggedUser, setLoggedUser] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedText, setSelectedText] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [statusId, setStatusId] = useState(null);
  const [mediaLocalUrl, setMediaLocalUrl] = useState("");
  const dispatch = useDispatch();
  useEffect(() => {
    const handleStatusDeleted = ({ userId, statusId }) => {
      dispatch(removeStatus({ userId, statusId }));
      setStatusId(null);
      setSelectedImage(null);
      setSelectedText(null);
      setMediaLocalUrl("");
      setIsVisible(false);
    };
    socket.on("statusUpdated", ({ statusId, userId }) => {
      dispatch(updateStatusSeen({ statusId, userId }));
    });
    socket.on("statusDeleted", handleStatusDeleted);
    return () => {
      socket.off("statusUpdated");
      socket.off("statusDeleted", handleStatusDeleted);
    };
  }, [dispatch]);

  useEffect(() => {
    !userExist && navigate("/");
  }, [refresh]);
  useEffect(() => {
    if (galleryData?.statuses.length < 1) setToggleStatusView(false);
  }, [galleryData]);
  return (
    <>
      <div style={{ display: "flex", position: "relative" }}>
        {/* side menu  */}
        <SideBar
          sideBarActive={sideBarActive}
          setsideBarActive={setsideBarActive}
        />

        {/* status components */}
        <StatusBox
          sideBarActive={sideBarActive}
          setSideBarActive={setsideBarActive}
          setToggleStatusView={setToggleStatusView}
          setLoggedUser={setLoggedUser}
        />
        {sideBarActive === "addstatus" && (
          <AddStatusBox
            sideBarActive={sideBarActive}
            setSideBarActive={setsideBarActive}
          />
        )}
        {/* chat components */}
        <ChatBox
          sideBarActive={sideBarActive}
          setChatWindowdata={setChatWindowdata}
          setsideBarActive={setsideBarActive}
        />
        {/* chat with ai */}

        <AIChat sideBarActive={sideBarActive} />
        {/*setting components*/}
        <Setting sideBarActive={sideBarActive} />

        {/* profile components */}
        <Profile sideBarActive={sideBarActive} />

        {/* alluser box components */}
        <AllUserBox
          sideBarActive={sideBarActive}
          setsideBarActive={setsideBarActive}
          setChatWindowdata={setChatWindowdata}
        />

        {/* message box components */}
        {sideBarActive !== "AiChat" && (
          <div className="messageBoxMainContainer">
            {chatWindowdata ? (
              <ChatWindow
                chatWindowdata={chatWindowdata}
                setOpenContactInfoBox={setOpenContactInfoBox}
              />
            ) : (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "column",
                }}
              >
                <video
                  src={chatAni}
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls={false}
                  style={{
                    width: "10rem",
                    objectFit: "cover",
                    pointerEvents: "none",
                  }}
                />
                <h2>Select your chat room</h2>
                <h3>
                  chat<span style={{ color: "#1976d2" }}>Buddy</span>
                </h3>
              </div>
            )}
          </div>
        )}

        {/* contact info box */}
        {openContactInfoBox && (
          <ContactInfo
            chatWindowdata={chatWindowdata}
            setOpenContactInfoBox={setOpenContactInfoBox}
          />
        )}
        {toggleStatusView && (
          <Gallery
            setToggleStatusView={setToggleStatusView}
            loggedUser={loggedUser}
            setLoggedUser={setLoggedUser}
            setIsVisible={setIsVisible}
            setMediaLocalUrl={setMediaLocalUrl}
            setSelectedImage={setSelectedImage}
            setSelectedText={setSelectedText}
            setStatusId={setStatusId}
            statusId={statusId}
            selectedImage={selectedImage}
            selectedText={selectedText}
            isVisible={isVisible}
            mediaLocalUrl={mediaLocalUrl}
          />
        )}
      </div>
    </>
  );
};

export default HomePage;
