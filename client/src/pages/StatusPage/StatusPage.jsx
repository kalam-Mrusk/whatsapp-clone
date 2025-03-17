import { useState } from "react";
import StatusHeader from "../../components/Status/StatusHeader/StatusHeader.jsx";
import MyStatusHeader from "../../components/Status/MyStatusHeader/MyStatusHeader.jsx";

const StatusPage = () => {
  return (
    <div>
      <StatusHeader />
      <MyStatusHeader />
    </div>
  );
};

export default StatusPage;
