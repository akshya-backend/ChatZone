import { Router } from "express";
import { verifyJWT } from "../middlewares/AccessToken.js";
import { Verify_Pin, changePinVerification, logout, mainpage, pinChangeRequest, setNew_Pin } from "../controller/Auth-Controller.js";
import { noCacheMiddleware } from "../middlewares/noCache.js";
const router=Router()

router.route("/PinCheck").post( Verify_Pin,mainpage)
router.route("/logout").post(noCacheMiddleware, logout)
router.route("/Pin-Change-Request").post(verifyJWT,pinChangeRequest)
router.route("/change-pinVerification").get(verifyJWT,changePinVerification)
router.route("/setNewPin").post(setNew_Pin)










export default router