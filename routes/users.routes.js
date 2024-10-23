const express = require("express");
const router = express.Router();
const authController = require("../controllers/users.controllers");

router.post("/signup", authController.signupUser);
router.post("/login", authController.loginUser);
router.post("/forgot-password" , authController.forgotpassword);
router.get("/resetpassword/:id/:token" , authController.verifyuser);
router.post("/:id/:token" , authController.resetpassword);
router.post("/changepassword" , authController.changePassword);
router.post("/userdetails" , authController.getuserdetails);
router.post("/updateuser" , authController.updateProfile);
module.exports = router;
