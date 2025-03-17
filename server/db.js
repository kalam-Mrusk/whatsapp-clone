import mongoose from "mongoose";

const dbConnect = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${process.env.DB_NAME}`
    );
    console.log(
      "MONGO connected !!, DB:",
      connectionInstance.connections[0].name
    );
  } catch (error) {
    console.log("MONGO Connecting Error !!!");
    throw error;
  }
};

export default dbConnect;
