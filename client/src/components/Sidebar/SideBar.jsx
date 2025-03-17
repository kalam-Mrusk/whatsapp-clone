import React from "react";
import ChatIcon from "@mui/icons-material/Chat";
import DonutSmallOutlinedIcon from "@mui/icons-material/DonutSmallOutlined";
import MapsUgcOutlinedIcon from "@mui/icons-material/MapsUgcOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useSelector } from "react-redux";
const SideBar = ({ sideBarActive, setsideBarActive }) => {
  const userExist = useSelector((state) => state.user.value?.user);
  let a = 23;
  const sideBar = (e) => {
    sideBarActive === "" || sideBarActive !== e
      ? setsideBarActive(e)
      : setsideBarActive("");
  };
  return (
    <div className="leftSideMenu">
      <ul className="top-menuItems">
        <li
          style={sideBarActive === "chat" ? { backgroundColor: "#e1e1e1" } : {}}
          onClick={() => {
            sideBar("chat");
          }}
        >
          <ChatIcon className="m-icon" />
          <span
            className="nos-msg"
            style={a >= 1 ? { display: "block" } : { display: "none" }}
          >
            {a}
          </span>
          <span className="icon-name">chats</span>
        </li>
        <li
          style={
            sideBarActive === "status" ? { backgroundColor: "#e1e1e1" } : {}
          }
          onClick={() => sideBar("status")}
        >
          <DonutSmallOutlinedIcon className="m-icon" />
          <span className="icon-name">status</span>
        </li>
        <li
        // style={
        //   sideBarActive === "community" && { backgroundColor: "#e1e1e1" }
        // }
        // onClick={() => setsideBarActive("community")}
        >
          <MapsUgcOutlinedIcon className="m-icon" />
          <span className="icon-name">community</span>
        </li>
        <li
        // style={sideBarActive === "group" && { backgroundColor: "#e1e1e1" }}
        // onClick={() => setsideBarActive("group")}
        >
          <GroupsOutlinedIcon className="m-icon" />
          <span className="icon-name">groups</span>
        </li>
        <li
          style={
            sideBarActive === "AiChat" ? { backgroundColor: "#e1e1e1" } : {}
          }
          onClick={() => sideBar("AiChat")}
        >
          <img
            src="https://cdn-icons-png.flaticon.com/128/18057/18057621.png"
            alt="Ai"
            style={{ width: "1.8rem" }}
          />
        </li>
      </ul>
      <ul className="bottom-menuItems">
        <li
          style={
            sideBarActive === "setting" ? { backgroundColor: "#e1e1e1" } : {}
          }
          onClick={() => sideBar("setting")}
        >
          <SettingsOutlinedIcon className="m-icon" />
          <span className="icon-name">setting</span>
        </li>
        <li
          style={
            sideBarActive === "setting" ? { backgroundColor: "#e1e1e1" } : {}
          }
          onClick={() => sideBar("profile")}
        >
          {userExist?.avatar ? (
            <img src={userExist?.avatar} />
          ) : (
            <AccountCircleIcon
              style={{ fontSize: "2.5rem", color: "#4b4b4b" }}
            />
          )}

          <span className="icon-name">profile</span>
        </li>
      </ul>
    </div>
  );
};

export default SideBar;
