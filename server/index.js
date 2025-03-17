import server from "./app.js";
import dbConnect from "./db.js";
import "./utilities/deleteExpiredStatus.js";
const PORT = 8080 || process.env.PORT;

dbConnect()
  .then(() => {
    try {
      server.listen(PORT, () => {
        console.log("server Connected !! , PORT: ", PORT);
      });
    } catch (error) {
      console.log("Server Connecting Error !!!");
      throw error;
    }
  })
  .catch((error) => {
    console.log("MONGO Connection Error !!");
    throw error;
  });
