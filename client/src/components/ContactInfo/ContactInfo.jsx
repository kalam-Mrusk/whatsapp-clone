import React, { useEffect, useState, useMemo } from "react";
import CloseIcon from "@mui/icons-material/Close";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import BlockIcon from "@mui/icons-material/Block";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import ClipLoader from "react-spinners/ClipLoader";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { refresh } from "../../redux/loading.slice.js";
import baseUrl from "../../utils/baseUrl.js";
const ContactInfo = ({ setOpenContactInfoBox, chatWindowdata }) => {
  const dispatch = useDispatch();
  const loggedInUserid = useSelector((state) => state.user.value?.user._id);
  const allUser = useSelector((state) => state.alluser.value);
  const [membersId, setMembersId] = useState(chatWindowdata?.members || []);
  const [membersData, setMembersData] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);

  const contactInfoData = [
    { icon: <FavoriteBorderIcon />, iconName: "Add to favorites" },
    { icon: <BlockIcon />, iconName: "Block" },
    { icon: <ThumbDownIcon />, iconName: "Report" },
    { icon: <DeleteForeverOutlinedIcon />, iconName: "Delete chat" },
  ];

  // Filtered user list using memoization to avoid recalculations on every render
  const filteredUsers = useMemo(() => {
    if (!query) return [];
    return allUser?.filter((user) =>
      [user.fullname, user.username, user.email]
        .filter(Boolean) // Remove undefined/null values
        .some((val) => val.toLowerCase().includes(query.toLowerCase()))
    );
  }, [query, allUser]);

  // Remove member from group
  const removeMemberFromGroup = async (userId) => {
    if (loading) return; // Prevent multiple requests
    try {
      await axios.post(`${baseUrl}/group/remove`, {
        userId,
        groupId: chatWindowdata._id,
      });
      toast.success("Member removed.");
      setMembersData((prev) => prev.filter((user) => user._id !== userId));
    } catch (error) {
      toast.error("Failed to remove member.");
      console.error(error);
    } finally {
    }
  };

  // Add member to group
  const addMemberInGroup = async (userId) => {
    try {
      await axios.post(`${baseUrl}/group/add`, {
        userId,
        groupId: chatWindowdata._id,
      });
      const newUser = allUser.find((user) => user._id === userId);
      if (newUser) {
        setMembersData((prev) => [...prev, newUser]);
      }
      toast.success("Member added.");
      setMembersId((prev) => [...prev, userId]);
      setQuery("");
    } catch (error) {
      toast.error("Failed to add member.");
      console.error(error);
    } finally {
    }
  };
  // update group pic

  const updateGroupPic = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("groupId", chatWindowdata._id);
    if (file) {
      formData.append("file", file);
    }
    setLoading(true);

    try {
      const res = await axios.post(`${baseUrl}/group/update/pic`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      setLoading(false);
      setFile(null);
      toast("group pic updated.");
      dispatch(refresh());
    } catch (error) {
      console.error("Error sending message", error);
      setLoading(false);
    }
  };
  // Fetch members' data
  useEffect(() => {
    if (chatWindowdata?.members) {
      setMembersData(
        allUser.filter((user) => chatWindowdata.members.includes(user._id))
      );
    }
  }, [allUser, chatWindowdata]);

  return (
    <div className="contactInfo-box-container">
      {/* Header */}
      <div className="contactInfoBox-header-section">
        <div className="contactInfoBox-header">
          <CloseIcon
            style={{
              marginRight: "0.5rem",
              fontSize: "1.5rem",
              cursor: "pointer",
            }}
            onClick={() => setOpenContactInfoBox(false)}
          />
          <h3>{chatWindowdata.username ? "Contact Info" : "Group Info"}</h3>
        </div>

        {/* Profile Section */}
        <div className="contactInfoBoxProfile">
          <div className="contactInfoBoxProImg">
            <div
              className="conInfo_innerProImgCont"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {chatWindowdata.username ? (
                chatWindowdata.avatar ? (
                  <img src={chatWindowdata.avatar} alt="Profile" />
                ) : (
                  <AccountCircleIcon
                    style={{
                      width: "8rem",
                      height: "8rem",
                      color: "#686868",
                    }}
                  />
                )
              ) : chatWindowdata.groupPic ? (
                <img src={chatWindowdata.groupPic} alt="Profile" />
              ) : (
                <div
                  style={{
                    width: "7rem",
                    height: "7rem",
                    backgroundColor: "#686868",
                    borderRadius: "50%",
                    marginRight: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <GroupsOutlinedIcon
                    style={{ color: "#fff", fontSize: "4rem" }}
                  />
                </div>
              )}

              <p style={{ marginTop: "0.5rem" }}>
                {chatWindowdata.fullname || chatWindowdata.name}
              </p>
              {chatWindowdata.username && (
                <p style={{ fontSize: "0.8rem" }}>{chatWindowdata.username}</p>
              )}
            </div>
          </div>
        </div>
        {chatWindowdata.admin === loggedInUserid && (
          <div style={{ margin: "0.5rem 0.5rem 0rem 0.5rem" }}>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} />
            {!loading ? (
              <button
                onClick={() => {
                  updateGroupPic();
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

      {/* About Section */}
      <div className="contactInfoItemContainer">
        <div className="contactInfoBoxAbout">
          <h3>About</h3>
          <p>{chatWindowdata.about || "No About Information"}</p>
        </div>

        {/* Members Section */}
        {chatWindowdata.members && (
          <>
            <h4 style={{ margin: "0.4rem 0rem" }}>Members:</h4>
            <div
              className="selecteduser"
              style={{
                display: "flex",
                flexWrap: "wrap",
                height: "3.5rem",
                overflow: "auto",
                marginBottom: "0.5rem",
              }}
            >
              {membersData.map((item) => (
                <p
                  key={item._id}
                  style={{
                    border: "1px solid #ccc",
                    padding: "0.2rem 0.3rem",
                    borderRadius: "1rem",
                    fontSize: "0.8rem",
                    backgroundColor:
                      item._id === chatWindowdata.admin ? "blue" : "#a7fbcd",
                    color:
                      item._id === chatWindowdata.admin ? "#fff" : "inherit",
                  }}
                >
                  {item.fullname}
                  {chatWindowdata.admin === loggedInUserid &&
                    item._id !== chatWindowdata.admin &&
                    !loading && (
                      <CloseIcon
                        style={{
                          marginLeft: "0.3rem",
                          fontSize: "1rem",
                          cursor: "pointer",
                          color: "#f44336",
                        }}
                        onClick={() => removeMemberFromGroup(item._id)}
                      />
                    )}
                </p>
              ))}
            </div>
          </>
        )}

        {/* Search and Add Member */}
        {chatWindowdata.admin === loggedInUserid && (
          <>
            <div className="chatBox-input-section">
              <SearchOutlinedIcon style={{ cursor: "pointer" }} />
              <input
                type="text"
                placeholder="Search"
                onChange={(e) => setQuery(e.target.value)}
                value={query}
              />
            </div>
            {query && (
              <div
                style={{
                  width: "100%",
                  height: "3.5rem",
                  backgroundColor: "#fff",
                  overflow: "auto",
                  padding: "0.3rem",
                  listStyle: "none",
                }}
              >
                {filteredUsers.map((item) => (
                  <li
                    key={item._id}
                    style={{
                      borderBottom: "1px solid #ccc",
                      cursor: "pointer",
                      padding: "0.2rem 0rem",
                    }}
                  >
                    {item.fullname}
                    {!membersId.includes(item._id) && !loading && (
                      <span
                        style={{
                          backgroundColor: "green",
                          cursor: "pointer",
                          marginLeft: "0.5rem",
                          borderRadius: "0.3rem",
                          fontSize: "0.8rem",
                          padding: "0.2rem 0.4rem",
                          color: "#fff",
                        }}
                        onClick={() => addMemberInGroup(item._id)}
                      >
                        Add
                      </span>
                    )}
                  </li>
                ))}
              </div>
            )}
          </>
        )}

        {/* Contact Actions */}
        {contactInfoData.map((item) => (
          <div className="contactInfoItems" key={item.iconName}>
            <div className="contactInfoIcon">{item.icon}</div>
            <div className="contactInfoIconName">{item.iconName}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactInfo;
