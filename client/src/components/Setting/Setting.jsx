import React, { useEffect, useCallback } from "react";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import ChatIcon from "@mui/icons-material/Chat";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import BrightnessAutoRoundedIcon from "@mui/icons-material/BrightnessAutoRounded";
import HelpRoundedIcon from "@mui/icons-material/HelpRounded";
import LogoutIcon from "@mui/icons-material/Logout";
import { refresh } from "../../redux/loading.slice.js";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import baseUrl from "../../utils/baseUrl.js";
const Setting = ({ sideBarActive }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.value?.user);

  const userLogOut = async () => {
    try {
      await axios.get(`${baseUrl}/user/auth/logout`, {
        withCredentials: true,
      });
      dispatch(refresh());
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!user) navigate("/");
  }, [user, navigate]);

  const settingDataItems = [
    { icon: <AccountCircleIcon />, iconName: "Account", fn: () => {} },
    { icon: <LockRoundedIcon />, iconName: "Privacy", fn: () => {} },
    { icon: <ChatIcon />, iconName: "Chats", fn: () => {} },
    {
      icon: <NotificationsRoundedIcon />,
      iconName: "Notifications",
      fn: () => {},
    },
    {
      icon: <BrightnessAutoRoundedIcon />,
      iconName: "Keyboard shortcuts",
      fn: () => {},
    },
    { icon: <HelpRoundedIcon />, iconName: "Help", fn: () => {} },
    { icon: <LogoutIcon />, iconName: "Logout", fn: userLogOut },
  ];

  return (
    <>
      {sideBarActive === "setting" && (
        <div className="setting-box-container">
          <div className="settingBox-header-section">
            <div className="settingBox-header">
              <h2>Settings</h2>
            </div>
            <div className="settingBox-input-section">
              <div className="settingBox-icon">
                <SearchOutlinedIcon style={{ cursor: "pointer" }} />
              </div>
              <input type="text" placeholder="Search settings" />
            </div>

            <div className="settingProfile">
              <div className="settingProImg">
                <img src={user?.avatar} alt="Profile" />
              </div>
              <div className="settingProNameAbout">
                <h3>{user?.fullname}</h3>
                <p>{user?.about || "No bio available"}</p>
              </div>
            </div>
          </div>
          <div className="settingItemContainer">
            {settingDataItems.map((item) => (
              <div
                className="settingItems"
                key={item.iconName}
                onClick={item.fn}
              >
                <div
                  className="sttIcon"
                  style={item.iconName === "Logout" ? { color: "red" } : {}}
                >
                  {item.icon}
                </div>
                <div
                  className="sttIconName"
                  style={item.iconName === "Logout" ? { color: "red" } : {}}
                >
                  {item.iconName}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Setting;
