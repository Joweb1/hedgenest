const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGODB_URI || process.env.MONGO_URI)
  .then(() => {
    console.log("Database is connected");
  })
  .catch((error) => {
    console.log("Unable to connect to database:", error.message);
  });


