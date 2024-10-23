const mongoose = require("mongoose");
 const url = process.env.MONGO_URI;

function connectDB() {
  return mongoose.connect(url);
}
module.exports = { connectDB };
