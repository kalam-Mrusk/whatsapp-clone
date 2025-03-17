import React, { useState } from "react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useSelector } from "react-redux";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
const AllUserItem = ({
  user,
  setChatWindowdata,
  setsideBarActive,
  selectedGroupUserBox,
  addItem,
  removeItem,
}) => {
  const loggedInUserid = useSelector((state) => state.user.value?.user._id);
  const [selected, setSelected] = useState(false);

  return (
    <>
      <div
        className="statusBoxUser"
        style={
          selected
            ? { cursor: "pointer", backgroundColor: "#c9c9c9" }
            : { cursor: "pointer" }
        }
        onClick={() => {
          if (selectedGroupUserBox && user._id !== loggedInUserid) {
            if (selected) {
              removeItem(user._id);
              setSelected(!selected);
            } else {
              addItem(user._id, user.username);
              setSelected(!selected);
            }
          } else {
            if (!selectedGroupUserBox) {
              setChatWindowdata(user);
              setsideBarActive("");
            }
          }
        }}
      >
        <div className="statusBox-userProfile">
          {user.avatar ? (
            <img src={user.avatar} style={{ marginLeft: "0.3rem" }} />
          ) : user.username ? (
            <AccountCircleIcon
              style={{
                fontSize: "3.2rem",
                margin: "auto",
                color: "#9e9d9d",
              }}
            />
          ) : user.groupPic ? (
            <img src={user.groupPic} style={{ marginLeft: "0.3rem" }} />
          ) : (
            <div
              style={{
                margin: "auto",

                backgroundColor: "#9e9d9d",
                border: "1px solid #ccc",
                borderRadius: "50%",
                height: "2.6rem",
                width: "2.65rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <GroupsOutlinedIcon
                style={{
                  fontSize: "2rem",
                  color: "#fff",
                }}
              />
            </div>
          )}
        </div>
        <div className="statusBox-UserInfo">
          <div className="statusBox-usernameAndDate">
            <h3>
              {user.fullname
                ? user._id !== loggedInUserid
                  ? user.fullname.length > 18
                    ? user.fullname.substring(0, 18) + "..."
                    : user.fullname
                  : "You"
                : user.name.length > 18
                ? user.name.substring(0, 18) + "..."
                : user.name}
            </h3>
            <p>{user.username && user.username}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AllUserItem;
