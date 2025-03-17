import React, { useState, useEffect } from "react";
import AddIcon from "@mui/icons-material/Add";
import MoreVertOutlinedIcon from "@mui/icons-material/MoreVertOutlined";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import StatusItem from "../StatusItem/StatusItem.jsx";
import { useDispatch, useSelector } from "react-redux";
import {
  addStatus,
  fetchStatuses,
  setGalleryData,
} from "../../redux/status.slice.js";
import { socket } from "../../socket.js";
const StatusBox = ({
  sideBarActive,
  setToggleStatusView,
  setSideBarActive,
  setLoggedUser,
}) => {
  const dispatch = useDispatch();
  const { statuses, loading } = useSelector((state) => state.status);
  const loggedInUser = useSelector((state) => state.user.value?.user);
  const [seenAllUser, setSeenAllUser] = useState([]);

  const [yourStatus, setYourStatus] = useState(null);
  useEffect(() => {
    dispatch(fetchStatuses());
  }, [dispatch]);

  const checkYourStatus = () => {
    if (loading) return;

    dispatch(setGalleryData(yourStatus));
    setToggleStatusView(true);
    setLoggedUser(true);
  };

  useEffect(() => {
    const handleStatusAdded = ({ newStatus, userDetail }) => {
      if (newStatus.viewers.includes(loggedInUser._id)) {
        dispatch(addStatus({ newStatus, userDetail }));
      }
    };

    socket.on("statusAdded", handleStatusAdded);
    return () => {
      socket.off("statusAdded", handleStatusAdded);
    };
  }, [dispatch]);

  useEffect(() => {
    if (!loading) {
      const userStatus = statuses.find(
        (item) => item.user._id === loggedInUser._id
      );
      setYourStatus(userStatus || null);
    }

    const seenAllUserIds = statuses
      .filter(({ statuses }) =>
        statuses.every((status) => status.seenBy.includes(loggedInUser._id))
      )
      .map(({ user }) => user._id);
    setSeenAllUser(seenAllUserIds);
  }, [statuses, loggedInUser, loading]);
  return (
    <>
      {sideBarActive === "status" && (
        <div className="status-box-container">
          <div className="statusBox-header-section">
            <div className="statusBox-header">
              <h2>Status</h2>
              <div className="statusBox-head-icons">
                <AddIcon
                  className="statusBox-icon"
                  onClick={() => setSideBarActive("addstatus")}
                />
                <MoreVertOutlinedIcon className="statusBox-icon" />
              </div>
            </div>
          </div>
          <div
            className="statusBoxUser"
            style={{
              paddingBottom: "1rem",
              borderBottom: "5px solid #ccc",
            }}
          >
            <div
              className="statusBox-userProfile"
              style={{ position: "relative" }}
            >
              {!yourStatus && (
                <span>
                  <AddIcon
                    style={{
                      position: "absolute",
                      top: "1.5rem",
                      left: "2rem",
                      fontSize: "1rem",
                      color: "#fff",
                      backgroundColor: "green",
                      borderRadius: "50%",
                    }}
                  />
                </span>
              )}

              {yourStatus ? (
                loggedInUser.avatar ? (
                  <div
                    style={{
                      border: "3px solid #00c853",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                      padding: "0.2rem 0rem",
                    }}
                  >
                    <img src={loggedInUser.avatar} />
                  </div>
                ) : (
                  <div
                    style={{
                      border: "3px solid #00c853",
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
                )
              ) : loggedInUser.avatar ? (
                <img src={loggedInUser.avatar} />
              ) : (
                <AccountCircleIcon
                  style={{
                    fontSize: "3.2rem",
                    margin: "-0.2rem -0.2rem",
                    color: "#9e9d9d",
                  }}
                />
              )}
            </div>
            <div
              className="statusBox-UserInfo"
              onClick={() =>
                yourStatus ? checkYourStatus() : setSideBarActive("addstatus")
              }
              style={{ cursor: "pointer" }}
            >
              <div className="statusBox-usernameAndDate">
                <h3>My status</h3>
                <p>Click to add status update</p>
              </div>
            </div>
          </div>
          <div className="statusBoxUserListContainer">
            <h3
              style={{
                margin: "1rem",
              }}
            >
              RECENT
            </h3>
            {!loading &&
              statuses?.map(
                (item, index) =>
                  item.user._id !== loggedInUser._id && (
                    <StatusItem
                      setToggleStatusView={setToggleStatusView}
                      setLoggedUser={setLoggedUser}
                      item={item}
                      key={index}
                      seenAllUser={seenAllUser}
                    />
                  )
              )}
          </div>
        </div>
      )}
    </>
  );
};

export default StatusBox;
