const User = require("../models/User.model");
const jwt = require("jsonwebtoken");
const secret = process.env.SECRET;
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { serialize } = require("v8");

// email config
console.log(process.env.gmail + " " + process.env.pass);

const transpoter = nodemailer.createTransport({
  service: "gmail",


  // auth: {
  //   user: "adityasharma44159@gmail.com",
  //   pass: "ummgiyjykfwoafwu",
  // },
  auth: {
    user: process.env.gmail,
    pass:process.env.pass,
  },
});

function createToken(id) {
  return jwt.sign({ _id: id }, process.env.SECRET);
}

async function signupUser(req, res) {
  const { email, password, firstname, lastname, phone, username } = req.body;

  try {
    const user = await User.signup(
      email,
      password,
      lastname,
      firstname,
      username,
      phone
    );
    const token = createToken(user._id);

    res.status(201).json({ email, access_token: token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function loginUser(req, res) {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.status(200).json({ email, access_token: token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function forgotpassword(req, res) {
  const { email } = req.body;
  if (!email) {
    throw Error("Email is required ..");
  }

  try {
    const userfind = await User.findOne({ email: email });
    if (!userfind) {
      throw Error("User not found...");
    }

    // const token = createToken(userfind._id);
    const token = jwt.sign({ _id: userfind._id }, process.env.SECRET, {
      expiresIn: "120s",
    });
    const setusertoken = await User.findByIdAndUpdate(
      { _id: userfind._id },
      { verifytoken: token },
      { new: true }
    );
    if (setusertoken) {
      const mailoptions = {
        from: process.env.gmail,
        to: email,
        subject: "sending email  from reset the password ",
        text: `This Link is valid for 2 min http://localhost:5173/password-reset/${userfind._id}/${setusertoken.verifytoken} `,
      };
      transpoter.sendMail(mailoptions, (error, info) => {
        console.log(error);
        if (error) {
          res.status(401).json({ status: 401, message: "email not send" });
        } else {
          res
            .status(201)
            .json({ status: 201, message: "Email  send sucessfully " });
        }
      });
    }
  } catch (error) {
    res.status(401).json({ status: 401, message: "invalid user" });
  }
}

async function verifyuser(req, res) {
  const { id, token } = req.params;

  try {
    const validuser = await User.findOne({ _id: id, verifytoken: token });
    const verifyToken = jwt.verify(token, process.env.SECRET);

    if (validuser && verifyToken._id) {
      res.status(201).json({ status: 201, validuser });
    } else {
      res.status(401).json({ status: 401, message: "user not exit" });
    }
  } catch (error) {
    res.status(401).json({ status: 401, error });
  }
}

//change password here

async function resetpassword(req, res) {
  const { id, token } = req.params;
  const { password } = req.body;
  try {
    const validuser = await User.findOne({ _id: id, verifytoken: token });
    const verifyToken = jwt.verify(token, process.env.SECRET);
    if (validuser && verifyToken._id) {
      const newpassword = await bcrypt.hash(password, 12);
      const setnewuserpass = await User.findByIdAndUpdate(
        { _id: id },
        { password: newpassword }
      );
      setnewuserpass.save();
      res.status(201).json({ status: 201, setnewuserpass });
    } else {
      res.status(401).json({ status: 401, message: "user not exit" });
    }
  } catch (error) {
    res.status(401).json({ status: 401, error });
  }
}

async function changePassword(req, res) {
  const { oldpassword, newpassword, email } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      res.status(401).json({ message: "User not found" });
    } else if (user) {
      const ismatch = await bcrypt.compare(oldpassword, user.password);
      if (!ismatch) {
        return res
          .status(401)
          .json({ message: "Current Password is incorrect .." });
      }
      const hashedpassword = await bcrypt.hash(newpassword, 10);
      user.password = hashedpassword;
      await user.save();
      return res.status(200).json({ message: "Password updated successfully" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
}

async function getuserdetails(req, res) {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({ message: "User not Found", status: 401 });
    } else if (user) {
      return res.status(200).json(user);
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "server Error", error: error.message });
  }
}

async function updateProfile(req, res) {
  const { firstname, lastname, phone, id } = req.body;

  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: id },
      { firstname, lastname, phone }
    );
    await updatedUser.save();
    return res.status(200).json({ updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
}

module.exports = {
  signupUser,
  loginUser,
  forgotpassword,
  verifyuser,
  resetpassword,
  changePassword,
  getuserdetails,
  updateProfile,
};
