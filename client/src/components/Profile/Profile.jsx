import React, { useEffect, useState } from "react";
import CreateIcon from "@mui/icons-material/Create";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import ClipLoader from "react-spinners/ClipLoader";
import { refresh } from "../../redux/loading.slice.js";
import { toast } from "react-toastify";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import baseUrl from "../../utils/baseUrl.js";
function Profile({ sideBarActive }) {
  const userExist = useSelector((state) => state.user.value);
  const [file, setFile] = useState(null);
  const [loading, setloading] = useState(false);
  const [userAbout, setUserAbout] = useState(userExist?.user.about);
  const [uploadBox, setuploadBox] = useState(false);
  const [editAbout, setEditAbout] = useState(false);
  const dispatch = useDispatch();
  const updateAvatar = async () => {
    const formData = new FormData();
    formData.append("userId", userExist.user._id);
    if (file) {
      formData.append("file", file);
    } else {
      return;
    }
    setloading(true);

    try {
      const res = await axios.post(`${baseUrl}/user/update/avatar`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      setloading(false);
      setFile(null);
      setuploadBox(false);
      toast("avatar updated.");
      dispatch(refresh());
    } catch (error) {
      console.error("Error sending message", error);
      setloading(false);
    }
  };

  const handleUpdateAbout = async () => {
    if (!userAbout.trim()) return;
    if (userAbout.length > 35) {
      toast("about length not more than 35.");
      return;
    }
    if (userAbout.trim() === userExist?.user.about) {
      setEditAbout(false);
      return;
    }

    setloading(true);
    try {
      const res = await axios.put(
        `${baseUrl}/user/update-about`,
        { about: userAbout },
        { withCredentials: true }
      );
      if (res) {
        toast("About updated successfully!");
        dispatch(refresh());
        setEditAbout(false);
      }
    } catch (error) {
      console.log(error);
      toast("Error updating about!");
    } finally {
      setloading(false);
    }
  };
  return (
    <>
      {sideBarActive === "profile" && (
        <div className="profile-box-container">
          <div className="profileBox-header-section">
            <div className="profileBox-header">
              <h2>Profile</h2>
            </div>

            <div className="ProfileBoxProfile">
              <div
                className="ProfileBoxProImg"
                style={{ border: "1px solid #ccc", borderRadius: "50%" }}
              >
                <img src={userExist.user.avatar} />

                <span
                  className="edit"
                  onClick={() => setuploadBox(!uploadBox)}
                  style={{ color: "red" }}
                >
                  edit
                </span>
              </div>
            </div>
            {uploadBox && (
              <div>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                />
                {!loading ? (
                  <button
                    onClick={() => {
                      updateAvatar();
                    }}
                  >
                    upload
                  </button>
                ) : (
                  <ClipLoader size={15} loading={true} />
                )}
              </div>
            )}
          </div>
          <div className="profileItemContainer">
            <div className="profileBoxName">
              <h3>Your name</h3>
              <div className="nameOrIcon">
                <p>{userExist.user.fullname}</p>
              </div>
              <p>
                This is not your username or PIN. This name will be visible to
                every user in chatBuddy.
              </p>
            </div>
            <div className="profileBoxAbout">
              <h3>About</h3>
              <div className="AboutOrIcon" style={{ position: "relative" }}>
                {editAbout ? (
                  <>
                    <span
                      style={{
                        position: "absolute",
                        right: "0",
                        top: "-2rem",
                        fontSize: "0.8rem",
                      }}
                    >
                      {userAbout.length}/35
                    </span>
                    <input
                      type="text"
                      value={userAbout}
                      onChange={(e) => setUserAbout(e.target.value)}
                      style={{
                        width: "80%",
                        border: "none",
                        outline: "none",
                        fontSize: "0.9rem",
                        color: "#686868",
                      }}
                    />
                    {loading ? (
                      <ClipLoader size={15} />
                    ) : (
                      <BookmarkIcon
                        className="proboxIcon"
                        onClick={handleUpdateAbout}
                      />
                    )}
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      value={userAbout}
                      style={{
                        width: "80%",
                        border: "none",
                        outline: "none",
                        fontSize: "0.9rem",
                        color: "#686868",
                      }}
                      readOnly
                    />
                    <CreateIcon
                      className="proboxIcon"
                      onClick={() => setEditAbout(true)}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Profile;
