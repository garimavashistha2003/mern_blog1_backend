const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  verifytoken: {
    type: String,
  },
  firstname: {
    type: String,
    require: true,
  },
  lastname: {
    type: String,
  },
  username: {
    type: String,
    require: true,
    unique: true,
  },
  phone: {
    type: Number,
    require: true,
    unique: true,
  },
});

UserSchema.statics.signup = async function (email, password , lastname , firstname , username , phone) {
  if (!email || !password || !phone || !firstname || !username) {
    throw Error("All fields are required.");
  }
  if (!validator.isEmail(email)) {
    throw Error("Invalid Email");
  }
  if (!validator.isMobilePhone(phone)) {
    throw Eror("Invalid Number");
  }
  if (password.length < 8) {
    throw Error("Password should be atleast 8 char long");
  }

  const found = await this.findOne({ email });
  if (found) {
    throw Error("Email already in use");
  }

  const findusername = await this.findOne({ username });
  if (findusername) {
    throw Error("Username already exit ");
  }

  const findphone = await this.findOne({ phone });
  if (findphone) {
    throw Error("Phone Number is Already Exit ");
  }

  //
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = await this.create({
    email,
    password: hashedPassword,
    firstname,
    lastname,
    phone,
    username,
  });
  return user;
};

UserSchema.statics.login = async function (email, password) {
  if (!email || !password) {
    throw Error("All fields are required.");
  }

  const user = await this.findOne({ email });
  if (!user) {
    throw Error("Account not found");
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw Error("Incorrect Password");
  }

  return user;
};

const userModel = mongoose.model("User", UserSchema);

module.exports = userModel;
