import { Router } from "express";
import { Update_Info, Update_link, addFriend, block_friend, changePin, profile, registration, sendOTP, updateProfilePicture, verifyOTP } from "../controller/User-Controller.js";
import { verifyJWT } from "../middlewares/AccessToken.js";
import { upload } from "../middlewares/multer.js";
const router=Router()

router.route("/sendOTP").post(sendOTP)
router.route("/verify-otp").post(verifyOTP)
router.route("/signUP").post(registration)
router.route("/addFriend").post(verifyJWT,addFriend)
router.route("/profile-page").get(verifyJWT,profile)
router.route("/profilePicture").post(verifyJWT,upload.single("Image"),updateProfilePicture)
router.route("/Change-Pin").put(verifyJWT,changePin)
router.route("/User-info-update").put(verifyJWT,Update_Info)
router.route("/User-link-update").put(verifyJWT,Update_link)
router.route("/block-friend").put(verifyJWT,block_friend)






export default router 