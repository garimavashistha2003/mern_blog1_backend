const express = require("express");
const cors = require("cors");

require("dotenv").config();
const blogsRouter = require("./routes/blogs.routes");
const usersRouter = require("./routes/users.routes");
const { connectDB } = require("./db/connect");
const { default: mongoose } = require("mongoose");

const port = process.env.PORT || 8081;
const app = express();
app.use(cors());

app.use(express.json());

app.use("/api/v1/blogs", blogsRouter);
app.use("/api/v1/user", usersRouter);

const connectmongodb = async () => {
  await mongoose
    .connect(process.env.MONGO_URI)
    .then((res) => {
      console.log("conncted ...");
    })
    .catch((error) => {
      console.log(error);
    });
};

connectmongodb();
app.listen(process.env.PORT, () => {
  console.log("server is stated ...", process.env.PORT);
});
