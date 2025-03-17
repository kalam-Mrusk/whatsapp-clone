import mongoose from "mongoose";
const GroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    groupPic: { type: String, default: null },
  },
  { timestamps: true }
);

const Group = mongoose.model("Group", GroupSchema);

export default Group;
