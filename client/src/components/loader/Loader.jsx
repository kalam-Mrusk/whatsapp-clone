import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { ClipLoader } from "react-spinners";

const Loader = () => {
  const loading = useSelector((state) => state.loading.status);
  const [message, setMessage] = useState("Loading...");

  const checkServer = async () => {
    setTimeout(() => {
      if (loading) {
        setMessage("Wait, Server is initialising...");
      }
    }, 3 * 1000);
  };

  useEffect(() => {
    checkServer();
  }, [loading]);

  return (
    <div
      style={{
        // border: "1px solid red",
        borderRadius: "1rem",
        boxShadow: "0px 0px 10px 0px #444444",
        width: "6rem",
        height: "4rem",
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: "10",
      }}
    >
      <p>{message}</p>
      <ClipLoader size={30} />
    </div>
  );
};

export default Loader;
