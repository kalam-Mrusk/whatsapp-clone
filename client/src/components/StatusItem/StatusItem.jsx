import React from "react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { setGalleryData } from "../../redux/status.slice.js";
import { useDispatch } from "react-redux";
const StatusItem = ({
  setToggleStatusView,
  setLoggedUser,
  item,
  seenAllUser,
}) => {
  const dispatch = useDispatch();
  return (
    <>
      <div className="statusBoxUser">
        <div
          className="statusBox-userProfile"
          onClick={() => {
            dispatch(setGalleryData(item));

            setToggleStatusView(true);
            setLoggedUser(false);
          }}
        >
          {item.user.avatar ? (
            <div
              style={{
                border: seenAllUser.includes(item.user._id)
                  ? "3px solid #c9c9c9"
                  : "3px solid #00c853",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                padding: "0.2rem 0rem",
              }}
            >
              <img src={item.user.avatar} />
            </div>
          ) : (
            <div
              style={{
                border: seenAllUser.includes(item.user._id)
                  ? "3px solid #c9c9c9"
                  : "3px solid #00c853",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                padding: "0.2rem 0rem",
              }}
            >
              {" "}
              <AccountCircleIcon
                style={{
                  fontSize: "3.2rem",
                  margin: "-0.2rem -0.2rem",
                  color: "#9e9d9d",
                }}
              />
            </div>
          )}
        </div>
        <div className="statusBox-UserInfo">
          <div className="statusBox-usernameAndDate">
            <h3>
              {item.user.fullname.length > 18
                ? item.user.fullname.substring(0, 18) + "..."
                : item.user.fullname}
            </h3>
          </div>
        </div>
      </div>
    </>
  );
};

export default StatusItem;
