import React, { useEffect, useState } from "react";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { useSelector } from "react-redux";
import AllUserItem from "../AllUserItem/AllUserItem.jsx";
import axios from "axios";
import { toast } from "react-toastify";
import ClipLoader from "react-spinners/ClipLoader";
import baseUrl from "../../utils/baseUrl.js";
const AllUserBox = ({ sideBarActive, setChatWindowdata, setsideBarActive }) => {
  const allUser = useSelector((state) => state.alluser?.value || []);
  const allgroupdata = useSelector((state) => state.allGroup?.value || []);
  const userExist = useSelector((state) => state.user.value?.user);
  const [data, setData] = useState([]);
  const [selectedGroupUserBox, setSelectedGroupUserBox] = useState(false);
  const [groupUserSelected, setGroupUserSelected] = useState([]);
  const [groupUserSelectedId, setGroupUserSelectedId] = useState(
    userExist?._id ? [userExist._id] : []
  );
  const [query, setQuery] = useState("");
  const [groupName, setGroupName] = useState("");
  const [load, setLoad] = useState(false);

  // Handle search input
  const handleSearch = (e) => {
    setQuery(e.target.value);
  };

  // Filter users based on search query
  const filteredUsers = data.filter((user) =>
    (user.fullname || user.name || "")
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  // Add user to group
  const addItem = (userId, username) => {
    if (userId === userExist._id || groupUserSelectedId.includes(userId))
      return;

    setGroupUserSelected((prev) => [...prev, { userId, username }]);
    setGroupUserSelectedId((prev) => [...prev, userId]);
  };

  // Remove user from group
  const removeItem = (userId) => {
    if (userId === userExist._id) return;

    setGroupUserSelected((prev) =>
      prev.filter((item) => item.userId !== userId)
    );
    setGroupUserSelectedId((prev) => prev.filter((id) => id !== userId));
  };

  // Create a new group
  const handleCreateGroup = async () => {
    if (groupUserSelected.length < 2 || !groupName) {
      toast("Group must have at least 2 members and a name.");
      return;
    }

    try {
      setLoad(true);
      const groupData = {
        name: groupName,
        members: groupUserSelectedId,
        admin: userExist._id,
      };

      const response = await axios.post(`${baseUrl}/group/create`, groupData);

      if (response.status === 201) {
        toast("Group created successfully");
        setGroupUserSelected([]);
        setGroupUserSelectedId([userExist._id]);
        setGroupName("");
      }
    } catch (error) {
      console.error("Error creating group:", error);
      toast("Failed to create group.");
    } finally {
      setLoad(false);
    }
  };

  // Set group data based on user existence
  const setGroup = () => {
    const userGroups = allgroupdata.filter((group) =>
      group.members?.some((member) => member === userExist._id)
    );
    setData([...allUser, ...userGroups]);
  };

  useEffect(() => {
    if (selectedGroupUserBox) {
      setData(allUser);
    } else {
      setGroup();
    }
  }, [allUser, allgroupdata, selectedGroupUserBox]);
  return (
    <>
      {sideBarActive === "userbox" && (
        <div className="setting-box-container">
          <div className="settingBox-header-section">
            <div className="settingBox-header">
              <h2>All User</h2>
              {!selectedGroupUserBox ? (
                <p
                  onClick={() => {
                    setSelectedGroupUserBox(true);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  Create group
                </p>
              ) : (
                <p
                  onClick={() => {
                    setSelectedGroupUserBox(false);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  Private chat
                </p>
              )}
            </div>
            {selectedGroupUserBox && (
              <>
                <div style={{ width: "100%", boxSizing: "border-box" }}>
                  <input
                    type="text"
                    placeholder="Enter group name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "0.4rem 0.5rem",
                      outline: "none",
                      border: "1px solid #ccc",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div
                  className="selecteduser"
                  style={{
                    border: "1px solid #ccc",
                    padding: "0.5rem 0.3rem",
                    margin: "0.5rem 0rem",
                    display: "flex",
                    flexWrap: "wrap",
                  }}
                >
                  {groupUserSelected.length === 0 ? (
                    <p
                      style={{
                        fontSize: "0.8rem",
                        color: "#ccc",
                      }}
                    >
                      select group members
                    </p>
                  ) : (
                    groupUserSelected.map((item) => (
                      <p
                        style={{
                          border: "1px solid #ccc",
                          padding: "0.2rem 0.3rem",
                          width: "fit-content",
                          borderRadius: "1rem",
                          fontSize: "0.8rem",
                          backgroundColor: "#a7fbcd",
                        }}
                        key={item.userId}
                      >
                        {item.username}
                      </p>
                    ))
                  )}
                </div>
                <button
                  style={{
                    margin: "0.5rem auto",
                    width: "100%",
                    padding: "0.3rem 0rem",
                    border: "1px solid #ccc",
                    cursor: "pointer",
                  }}
                  onClick={() => handleCreateGroup()}
                >
                  {load ? <ClipLoader size={10} /> : "create"}
                </button>
              </>
            )}

            <div className="settingBox-input-section">
              <div className="settingBox-icon">
                <SearchOutlinedIcon style={{ cursor: "pointer" }} />
              </div>
              <input
                type="text"
                placeholder="Search user"
                onChange={handleSearch}
                value={query}
              />
            </div>
          </div>
          <h3 style={{ margin: "1rem" }}>List</h3>
          {filteredUsers.length < 0
            ? "No User Found"
            : filteredUsers.map((user) => (
                <AllUserItem
                  user={user}
                  setChatWindowdata={setChatWindowdata}
                  setsideBarActive={setsideBarActive}
                  key={user._id}
                  selectedGroupUserBox={selectedGroupUserBox}
                  addItem={addItem}
                  removeItem={removeItem}
                />
              ))}
        </div>
      )}
    </>
  );
};

export default AllUserBox;
