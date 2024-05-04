import { Router } from "express";
import { verifyJWT } from "../middlewares/AccessToken.js";
import { addfriend, chat_Init } from "../controller/chat-Controller.js";
import { upload } from "../middlewares/multer.js";
import { uploadfile_2_cloudinary } from "../config/cloudinary.js";
const router=Router()

router.route("/chat-index").post(verifyJWT,chat_Init)
router.route("/addfriend").post(addfriend)
router.route("/upload").post(upload.single("file"),uploadfile_2_cloudinary)






export default router
