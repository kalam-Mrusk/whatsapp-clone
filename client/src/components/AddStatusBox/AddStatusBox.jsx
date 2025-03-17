import React, { useEffect, useRef, useState } from "react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ClipLoader from "react-spinners/ClipLoader";
import { socket } from "../../socket.js";
import baseUrl from "../../utils/baseUrl.js";
const AddStatusBox = ({ sideBarActive, setSideBarActive }) => {
  const fileInputRef = useRef(null);
  const allUser = useSelector((state) => state.alluser?.value || []);
  const loggedInUser = useSelector((state) => state.user.value?.user);
  const [selectedUser, setSelectedUser] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState([loggedInUser?._id]);
  const [inputText, setInputText] = useState("");
  const [file, setFile] = useState(null);
  const [query, setQuery] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const handleSearch = (e) => {
    setQuery(e.target.value);
  };

  // Filter users based on search query
  const filteredUsers = data.filter((user) =>
    (user.fullname || "").toLowerCase().includes(query.toLowerCase())
  );

  const selectingUser = (username, id) => {
    setSelectedUser((prev) =>
      prev.includes(username)
        ? username !== loggedInUser.username
          ? prev.filter((user) => user !== username)
          : prev
        : [...prev, username]
    );

    setSelectedUserId((prev) =>
      prev.includes(id)
        ? id !== loggedInUser._id
          ? prev.filter((userId) => userId !== id)
          : prev
        : [...prev, id]
    );
  };

  const addingStatus = async () => {
    if (!file && inputText.trim() === "") return;
    const formData = new FormData();
    formData.append("userId", loggedInUser._id);
    formData.append("viewers", JSON.stringify(selectedUserId || []));
    if (inputText.trim() !== "") formData.append("text", inputText);
    if (file) formData.append("file", file);

    try {
      setLoading(true);
      const res = await axios.post(
        `${baseUrl}/status/upload-status`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      if (res.data) {
        socket.emit("addStatus", {
          newStatus: res.data.data,
          userDetail: loggedInUser,
        });
      }
      if (res.status === 201) {
        toast.success("Status added successfully");
        setFile(null);
        setInputText("");
        setSelectedUser([loggedInUser.username]);
        setSelectedUserId([loggedInUser._id]);

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
      setLoading(false);
    } catch (error) {
      console.error("Error uploading status:", error);
      toast.error("Failed to add status. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    setData(allUser);
  }, [allUser]);

  return (
    <>
      {sideBarActive === "addstatus" && (
        <div className="status-box-container">
          <div className="statusBox-header-section">
            <div className="statusBox-header">
              <h2>Add status</h2>
              <div className="statusBox-head-icons">
                <p
                  onClick={() => setSideBarActive("status")}
                  style={{ cursor: "pointer" }}
                >
                  {"< back"}
                </p>
              </div>
            </div>
          </div>
          <div className="AddStatusInputSection">
            <input
              type="text"
              placeholder="text status..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              style={{
                width: "100%",
                padding: "0.3rem 0.2rem",
                boxSizing: "border-box",
                outline: "none",
                fontSize: "1rem",
                border: "1px solid #ccc",
                borderRadius: "0.5rem",
              }}
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => setFile(e.target.files[0])}
              style={{
                width: "100%",
                padding: "0.3rem 0.2rem",
                boxSizing: "border-box",
                outline: "none",
                fontSize: "0.9rem",
              }}
            />
          </div>
          <div
            className="viewSelectedUser"
            style={{
              border: "1px solid #ccc",
              borderRadius: "0.8rem",
              height: "4.5rem",
              width: "100%",
              padding: "0.2rem",
              boxSizing: "border-box",
              overflow: "auto",
              display: "flex",
              flexWrap: "wrap",
              gap: "0.3rem",
            }}
          >
            {selectedUser.length < 1 ? (
              <p style={{ color: "#ccc" }}>...no slected user...</p>
            ) : (
              selectedUser.map((user) => (
                <p
                  style={{
                    border: "1px solid",
                    borderRadius: "0.89rem",
                    padding: "0.2rem 0.3rem",
                    width: "fit-content",
                    height: "fit-content",
                    backgroundColor: "pink",
                  }}
                  key={user}
                >
                  {user}
                </p>
              ))
            )}
          </div>
          <div
            style={{
              marginTop: "0.3rem",
              paddingTop: "0.5rem",
            }}
          >
            <div className="chatBox-input-section">
              <div className="sb-icon">
                <SearchOutlinedIcon style={{ cursor: "pointer" }} />
              </div>
              <input
                type="text"
                placeholder="Search user..."
                onChange={handleSearch}
                value={query}
              />
            </div>
            <h3
              style={{
                margin: "0.5rem",
              }}
            >
              Select user here:
            </h3>
            <div
              className="addStatusBoxItem"
              style={{
                border: "1px solid #ccc",
                height: "52vh",
                overflow: "auto",
                marginTop: "0.3rem",
              }}
            >
              {filteredUsers.map((item) => (
                <div
                  className="statusBoxUser"
                  key={item._id}
                  onClick={() => selectingUser(item.username, item._id)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="statusBox-userProfile">
                    {item.avatar ? (
                      <img src={item.avatar} />
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
                  <div className="statusBox-UserInfo">
                    <div className="statusBox-usernameAndDate">
                      <h3>
                        {item.fullname.length > 18
                          ? item.fullname.substring(0, 18) + "..."
                          : item.fullname}
                      </h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div
            style={{
              border: "1px solid #ccc",
              width: "4.5rem",
              height: "2rem",
              borderRadius: "0.5rem",
              margin: "0.5rem auto",
            }}
          >
            {loading ? (
              <span
                style={{
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <ClipLoader size={15} />
              </span>
            ) : (
              <button
                onClick={() => addingStatus()}
                style={{
                  border: "none",
                  width: "100%",
                  height: "100%",
                  borderRadius: "0.5rem",
                  backgroundColor: "green",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                upload
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AddStatusBox;
